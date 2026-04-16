---
layout: '@layouts/BlogLayout.astro'
title: 'Taming a Bloated Windows 11 Work Laptop: Battery, Startup, and RAM Optimization'
pubDate: 2026-04-16
description: "A PowerShell-first guide to reclaiming a work-managed Windows 11 laptop from Modern Standby battery drain, slow startup, and runaway idle RAM usage. Diagnostic commands, safe service disabling, and nuclear options included."
author: 'Kevin Sullivan'
image:
    # url: 'https://docs.astro.build/assets/full-logo-dark.png' 
    # alt: 'The full Astro logo.'
tags: ["windows", "powershell", "performance", "sysadmin", "troubleshooting"]
---

# Taming a bloated Windows 11 System

The situation: Your work-managed Windows 11 laptop drains its battery over a weekend in sleep, boots slowly, and idles at **~14.7 GB of 32 GB RAM**. The root causes are interconnected: Modern Standby keeps the system semi-awake, dozens of enterprise agents and telemetry services load at startup, and bloatware like Widgets, Copilot, Edge background processes, and Xbox services pile onto memory. This guide gives you the exact PowerShell and CMD commands to diagnose, understand, and fix all three problems — while keeping your IT department happy.

Every command is labeled with a safety rating: ✅ **Safe** (read-only or no IT conflict), ⚠️ **Low risk** (reversible, unlikely to conflict), or ⛔ **Do not touch** on managed devices. When in doubt, check with IT first and always create a restore point before making changes:

```powershell
Checkpoint-Computer -Description "Before optimization" -RestorePointType MODIFY_SETTINGS
```

---

## Quick wins for immediate impact

These changes are safe on most work-managed laptops, take under 10 minutes total, and address all three problems simultaneously. Run PowerShell as Administrator.

**1. Switch lid close from sleep to hibernate** (fixes weekend battery drain):
```powershell
powercfg /hibernate on
powercfg -setdcvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 2
powercfg -setacvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 2
powercfg -SetActive SCHEME_CURRENT
```

**2. Disable wake timers on battery** (prevents phantom wake-ups):
```powershell
powercfg /SETDCVALUEINDEX SCHEME_CURRENT SUB_SLEEP RTCWAKE 0
powercfg -SetActive SCHEME_CURRENT
```

**3. Kill the top memory hogs that provide zero productivity value:**
```powershell
# Disable SysMain/Superfetch (~500MB-2GB saved on SSD systems)
Stop-Service -Name "SysMain" -Force; Set-Service -Name "SysMain" -StartupType Disabled

# Remove Widgets (~100-200MB)
Get-AppxPackage *WebExperience* | Remove-AppxPackage

# Remove Cortana (~50-100MB)
Get-AppxPackage -AllUsers Microsoft.549981C3F5F10 | Remove-AppxPackage

# Disable Xbox services (~40-100MB)
@("XblAuthManager","XblGameSave","XboxGipSvc","XboxNetApiSvc") | ForEach-Object {
    Stop-Service -Name $_ -Force -ErrorAction SilentlyContinue
    Set-Service -Name $_ -StartupType Disabled -ErrorAction SilentlyContinue
}
```

**4. Disable Edge background processes** (saves ~100-400MB):
```powershell
New-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge" -Name "StartupBoostEnabled" -Value 0 -PropertyType DWord -Force
New-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge" -Name "AllowPrelaunch" -Value 0 -PropertyType DWord -Force
```

**5. Disable telemetry scheduled tasks** (reduces CPU spikes and background I/O):
```powershell
$tasks = @(
    @{Name="Microsoft Compatibility Appraiser"; Path="\Microsoft\Windows\Application Experience\"},
    @{Name="ProgramDataUpdater"; Path="\Microsoft\Windows\Application Experience\"},
    @{Name="Consolidator"; Path="\Microsoft\Windows\Customer Experience Improvement Program\"},
    @{Name="UsbCeip"; Path="\Microsoft\Windows\Customer Experience Improvement Program\"}
)
$tasks | ForEach-Object {
    Disable-ScheduledTask -TaskName $_.Name -TaskPath $_.Path -ErrorAction SilentlyContinue
}
```

**Realistic savings from Quick Wins alone:** ~1.5–3 GB RAM freed, battery drain during lid-close eliminated (hibernate uses zero power), and noticeable startup improvement from fewer auto-start services.

---

## Part 1: Battery drain during sleep

### Why your laptop dies over a weekend with the lid closed

The culprit is almost certainly **Modern Standby** (also called S0 Low Power Idle). Unlike traditional S3 sleep — where the CPU halts and only RAM stays powered — Modern Standby keeps the entire SoC in a low-power-but-awake topology. The system can wake in sub-second for push notifications, email sync, OneDrive activity, Windows Update downloads, and VoIP calls. When everything works perfectly, drain is **5–10% per day**. When a single rogue driver or firmware bug prevents the system from reaching its deepest idle state (called DRIPS — Deepest Runtime Idle Platform State), drain rockets to **10–30% per day** — enough to kill a battery over a 60-hour weekend.

Most modern business laptops (especially Intel Evo-certified models) ship with **only** Modern Standby; S3 is removed from firmware entirely. Run this to check your system:

```cmd
powercfg /a
```

If you see `Standby (S0 Low Power Idle) Network Connected` and S3 is listed as "not available," your laptop only supports Modern Standby. The pragmatic fix is **hibernate on lid close**, which saves state to disk and draws zero power.

### The diagnostic toolkit: understanding what's happening during sleep

These commands are all read-only and completely safe. Run them to build a picture of your sleep behavior.

**Sleep Study report** — the single most important diagnostic:
```cmd
powercfg /sleepstudy /output %USERPROFILE%\Desktop\sleepstudy.html /duration 7
```
This generates an HTML report covering the last 7 days of standby sessions. Each session is color-coded: **green** means DRIPS ≥94% and drain <0.33%/hour, **yellow** is moderate activity, and **red** means the system never reached deep idle. The "Top Offenders" table in each red session identifies the specific driver or process responsible. Focus on long overnight/weekend sessions with sustained high drain.

**Energy efficiency report** — captures real-time power problems:
```cmd
powercfg /energy /output %USERPROFILE%\Desktop\energy-report.html /duration 120
```
Run this at idle with apps closed. The report flags errors (red), warnings (yellow), and informational items. Common findings include USB devices stuck out of selective suspend, high platform timer resolution requested by apps, and processor states not reaching C-states.

**Battery health report** — long-term battery degradation tracking:
```cmd
powercfg /batteryreport /output %USERPROFILE%\Desktop\battery-report.html
```
Compare **Full Charge Capacity** to **Design Capacity**. Below 80% means significant degradation — no amount of software tuning will fix a worn-out battery.

**What woke the machine last:**
```cmd
powercfg /lastwake
```

**Active wake timers right now:**
```cmd
powercfg /waketimers
```

**Devices armed to wake the system:**
```cmd
powercfg /devicequery wake_armed
```

**Active power requests preventing sleep:**
```cmd
powercfg /requests
```
If anything appears under SYSTEM or DISPLAY, that process is actively blocking sleep. Override a persistent offender:
```cmd
powercfg /requestsoverride PROCESS app.exe SYSTEM
```

### How to configure lid close action and power settings via PowerShell

The `powercfg` command uses a hierarchy: **Power Scheme → Subgroup → Setting**, each identified by GUIDs or friendly aliases. The `-setdcvalueindex` flag sets the battery (DC) value; `-setacvalueindex` sets the plugged-in (AC) value. The lid close action lives under the Buttons subgroup (`SUB_BUTTONS`) with setting alias `LIDACTION`.

**Lid action values:** 0 = Do nothing, 1 = Sleep, 2 = Hibernate, 3 = Shut down.

```powershell
# Set lid close to hibernate (both battery and AC)
powercfg -setdcvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 2
powercfg -setacvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 2
powercfg -SetActive SCHEME_CURRENT
```

⚠️ Group Policy or Intune may periodically reset this setting. If it reverts, check with IT.

**Disable wake timers** (prevents scheduled tasks from waking the machine):
```powershell
# 0 = Disable, 1 = Enable, 2 = Important Wake Timers Only
powercfg /SETDCVALUEINDEX SCHEME_CURRENT SUB_SLEEP RTCWAKE 0
powercfg /SETACVALUEINDEX SCHEME_CURRENT SUB_SLEEP RTCWAKE 2  # safer for AC
powercfg -SetActive SCHEME_CURRENT
```
Using value **2** (Important Wake Timers Only) on AC is a reasonable compromise — it allows security-critical updates while blocking unnecessary wakes.

**Find and disable scheduled tasks that can wake the computer:**
```powershell
Get-ScheduledTask | Where-Object {$_.Settings.WakeToRun -eq $true} |
    Select-Object TaskName, TaskPath, State | Format-Table -AutoSize
```

**Disable network connectivity in Modern Standby** (a safer alternative to disabling Modern Standby entirely):
```powershell
powercfg /setdcvalueindex SCHEME_CURRENT SUB_NONE CONNECTIVITYINSTANDBY 0
powercfg -SetActive SCHEME_CURRENT
```

**Disable wake-on-LAN for a specific network adapter:**
```cmd
powercfg /devicequery wake_armed
powercfg /devicedisablewake "Intel(R) Wi-Fi 6 AX201 160MHz"
```
⚠️ Disabling WoL may prevent IT from remotely waking your machine for maintenance.

### Power plan optimization cheat sheet

```powershell
# List all power plans (active marked with *)
powercfg /list

# Set display timeout (minutes)
powercfg -x -monitor-timeout-dc 5
powercfg -x -monitor-timeout-ac 10

# Set sleep timeout
powercfg -x -standby-timeout-dc 15
powercfg -x -standby-timeout-ac 30

# Set hibernate timeout (auto-hibernate after N minutes of sleep)
powercfg -x -hibernate-timeout-dc 30
powercfg -x -hibernate-timeout-ac 60

# Disable hybrid sleep (redundant on laptops with hibernate)
powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP HYBRIDSLEEP 0
powercfg /setdcvalueindex SCHEME_CURRENT SUB_SLEEP HYBRIDSLEEP 0
powercfg -SetActive SCHEME_CURRENT

# View all settings for the active plan
powercfg /query SCHEME_CURRENT

# View all available aliases (useful for scripting)
powercfg /aliases
```

---

## Part 2: Slow startup

### Understanding what happens during a Windows 11 boot

A Windows 11 boot has three phases: **pre-boot** (UEFI firmware → bootloader → kernel load), **main path** (kernel initialization → services start → logon screen), and **post-boot** (user logon → startup programs → desktop ready). The main path and post-boot are where most slowdowns occur. Every auto-start service, startup program, and scheduled task with a boot/logon trigger adds latency. On a managed laptop, you might have 80+ auto-start services and dozens of startup programs before you even install anything yourself.

### Measuring boot performance with Event Viewer via PowerShell

Windows logs boot timing data to the Diagnostics-Performance event log. **Event ID 100** is the boot summary; IDs 101–110 identify specific bottlenecks (101 = slow app, 102 = slow driver, 103 = slow service).

```powershell
# Get the last 5 boot performance summaries
Get-WinEvent -FilterHashtable @{
    LogName = "Microsoft-Windows-Diagnostics-Performance/Operational"
    Id = 100
} -MaxEvents 5 | ForEach-Object {
    $xml = [xml]$_.ToXml()
    $data = $xml.Event.EventData.Data
    [PSCustomObject]@{
        TimeCreated  = $_.TimeCreated
        BootTimeMs   = ($data | Where-Object {$_.Name -eq "BootTime"}).'#text'
        MainPathMs   = ($data | Where-Object {$_.Name -eq "MainPathBootTime"}).'#text'
        PostBootMs   = ($data | Where-Object {$_.Name -eq "BootPostBootTime"}).'#text'
        StartupApps  = ($data | Where-Object {$_.Name -eq "BootNumStartupApps"}).'#text'
        IsDegradation = ($data | Where-Object {$_.Name -eq "BootIsDegradation"}).'#text'
    }
}
```

All values are in **milliseconds**. A healthy SSD-based Windows 11 boot should have MainPathBootTime under **30,000 ms** (30 seconds). If PostBootTime is disproportionately high, startup programs are the bottleneck. If MainPathBootTime is high, services or drivers are the issue.

**Find specific bottleneck culprits** (Event IDs 101–110):
```powershell
Get-WinEvent -FilterHashtable @{
    LogName = "Microsoft-Windows-Diagnostics-Performance/Operational"
    Id = 101,102,103
} -MaxEvents 20 | Select-Object TimeCreated, Id,
    @{N='Detail';E={$_.Message.Substring(0, [Math]::Min(200, $_.Message.Length))}} |
    Format-Table -Wrap
```

**Check last boot time and uptime:**
```powershell
$boot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
$uptime = (Get-Date) - $boot
Write-Host "Last boot: $boot — Uptime: $($uptime.Days)d $($uptime.Hours)h $($uptime.Minutes)m"
```

⚠️ With Fast Startup enabled, this may show misleading uptime because shutdown uses hybrid hibernation. Use Restart (not Shutdown) for accurate measurement.

### Auditing every autostart location

Windows has **dozens** of autostart locations scattered across the registry, startup folders, services, and scheduled tasks. Here's how to audit them all from PowerShell.

**Startup programs (registry Run keys + startup folders):**
```powershell
# WMI-based comprehensive listing
Get-CimInstance Win32_StartupCommand |
    Select-Object Name, Command, Location, User | Format-Table -AutoSize

# Individual registry keys for granular inspection
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -EA SilentlyContinue
Get-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -EA SilentlyContinue
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce" -EA SilentlyContinue

# Startup folders
Get-ChildItem "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
Get-ChildItem "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup"
```

**All auto-start services (both Automatic and Delayed Start):**
```powershell
Get-Service | Where-Object {$_.StartType -match "Automatic"} |
    Select-Object Name, DisplayName, Status, StartType |
    Sort-Object StartType | Format-Table -AutoSize
```

**Scheduled tasks with boot or logon triggers:**
```powershell
Get-ScheduledTask | Where-Object {$_.State -ne "Disabled"} | ForEach-Object {
    $triggers = $_.Triggers | Where-Object {
        $_ -is [CimInstance] -and ($_.CimClass.CimClassName -match "Boot|Logon")
    }
    if ($triggers) {
        [PSCustomObject]@{
            TaskName = $_.TaskName
            TaskPath = $_.TaskPath
            State = $_.State
        }
    }
} | Format-Table -AutoSize
```

**Full autostart audit script** (save as `Audit-Autostart.ps1`):
```powershell
Write-Host "`n=== STARTUP PROGRAMS ===" -ForegroundColor Cyan
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location | Format-Table -AutoSize

Write-Host "=== HKLM RUN ===" -ForegroundColor Cyan
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -EA SilentlyContinue

Write-Host "=== HKCU RUN ===" -ForegroundColor Cyan
Get-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -EA SilentlyContinue

Write-Host "=== AUTO-START SERVICES ===" -ForegroundColor Cyan
Get-Service | Where-Object {$_.StartType -eq "Automatic"} |
    Select-Object Name, DisplayName, Status | Format-Table -AutoSize

Write-Host "=== STARTUP FOLDERS ===" -ForegroundColor Cyan
Get-ChildItem "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup" -EA SilentlyContinue
Get-ChildItem "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup" -EA SilentlyContinue
```

For Sysinternals Autoruns-level coverage without the GUI, install the community PowerShell module:
```powershell
Install-Module -Name AutoRuns -Repository PSGallery -Scope CurrentUser
Import-Module AutoRuns
Get-PSAutorun | Format-Table -AutoSize
```

### Disabling startup programs and services

**Remove a user-level startup entry** (⚠️ Low risk):
```powershell
Remove-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "ProgramName"
```

**Disable a service** (prefer Manual over Disabled — Manual means "start only when called"):
```powershell
Stop-Service -Name "ServiceName" -Force
Set-Service -Name "ServiceName" -StartupType Manual
```

**Services safe to set to Manual or Disabled on a work laptop:**

| Service | Display Name | Action | Risk |
|---|---|---|---|
| `SysMain` | Superfetch | Disabled | ✅ Safe on SSD |
| `WSearch` | Windows Search | Disabled | ✅ Lose instant search |
| `DiagTrack` | Telemetry | Disabled | ⚠️ Check with IT |
| `MapsBroker` | Downloaded Maps Manager | Disabled | ✅ Safe |
| `XblAuthManager` | Xbox Live Auth | Disabled | ✅ Safe |
| `XblGameSave` | Xbox Live Game Save | Disabled | ✅ Safe |
| `XboxGipSvc` | Xbox Accessory Mgmt | Disabled | ✅ Safe |
| `Fax` | Fax | Disabled | ✅ Safe |
| `RetailDemo` | Retail Demo Service | Disabled | ✅ Safe |
| `lfsvc` | Geolocation | Manual | ✅ Unless apps need it |
| `wisvc` | Windows Insider | Disabled | ✅ Safe |

### Fast Startup: what it is and when to disable it

Fast Startup is enabled by default. When you choose "Shut down," Windows actually hibernates the kernel session — saving it to `hiberfil.sys` — and reloads it on next power-on, skipping full driver initialization. This makes "shutdown" ~5 seconds faster on SSDs but causes real problems: **Windows Update installations may fail to finalize**, drivers don't fully reinitialize, uptime counters become misleading, GPO application can be unreliable, and dual-boot configurations break.

**Check if Fast Startup is enabled:**
```powershell
(Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" -Name HiberbootEnabled).HiberbootEnabled
# 1 = enabled, 0 = disabled
```

**Disable Fast Startup** (✅ actually recommended by many IT admins for managed environments):
```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" -Name HiberbootEnabled -Value 0
```

Boot time increases by roughly **4–6 seconds on NVMe drives** — a worthwhile tradeoff for reliable updates and clean boot states.

### BCDEdit boot configuration

```cmd
:: View current boot config
bcdedit /enum

:: Set boot menu timeout to 0 (instant boot, single-OS systems)
bcdedit /timeout 0

:: Enable boot logging for driver troubleshooting
bcdedit /set {current} bootlog Yes
:: Creates C:\Windows\ntbtlog.txt — disable after diagnosis:
bcdedit /set {current} bootlog No

:: Always backup BCD before changes
bcdedit /export C:\BCD_Backup
```

⚠️ On BitLocker-enabled systems, suspend BitLocker before modifying BCD to avoid recovery key prompts.

---

## Part 3: High baseline RAM usage

### Diagnosing where 14.7 GB actually goes

The first step is understanding the difference between **In Use** memory and **Standby** memory. Windows intentionally uses available RAM as a disk cache (Standby list); this memory is released instantly when applications need it. Open Resource Monitor (`resmon`) → Memory tab to see the breakdown. If most of your "used" RAM is actually Standby, the system is behaving normally. Focus on **In Use** memory.

**Top 20 processes by memory consumption:**
```powershell
Get-Process | Sort-Object WorkingSet64 -Descending |
    Select-Object -First 20 Name, Id,
    @{N='Memory(MB)';E={[math]::Round($_.WorkingSet64/1MB,2)}}
```

**Group by process name** (essential for multi-process apps like Edge and Teams):
```powershell
Get-Process | Group-Object ProcessName | ForEach-Object {
    [PSCustomObject]@{
        Count = $_.Count
        Name = $_.Name
        TotalMB = [math]::Round(($_.Group | Measure-Object WorkingSet -Sum).Sum/1MB, 2)
    }
} | Sort-Object TotalMB -Descending | Select-Object -First 20
```

**Show only processes using >500 MB:**
```powershell
Get-Process | Where-Object {$_.WorkingSet -gt 500MB} |
    Select-Object Name, @{N="MB";E={[math]::Round($_.WorkingSet/1MB,2)}} |
    Sort-Object MB -Descending
```

**Overall system memory snapshot:**
```powershell
$os = Get-CimInstance Win32_OperatingSystem
$usedGB = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory)/1MB, 2)
$totalGB = [math]::Round($os.TotalVisibleMemorySize/1MB, 2)
Write-Host "Used: ${usedGB}GB / ${totalGB}GB ($([math]::Round(($usedGB/$totalGB)*100,1))%)"
```

### Where 14.7 GB goes on a typical managed laptop

| Category | Typical Range | Notes |
|---|---|---|
| Windows kernel, drivers, DWM | 2.5–4 GB | Non-negotiable OS overhead |
| Memory Compression process | 0.5–2 GB | Compresses inactive pages in RAM |
| SysMain cached data | 1–3 GB | Preloaded apps; shows as "In Use" |
| Defender AV + Endpoint sensor | 300–800 MB | MsMpEng.exe + MsSense.exe |
| EDR agent (CrowdStrike etc.) | 50–200 MB | If present alongside Defender |
| SCCM/Intune agents | 150–400 MB | CcmExec.exe + IntuneManagementExtension |
| OneDrive sync | 200 MB–2 GB | Scales with library size |
| Teams (background) | 300–700 MB | Chromium-based, multi-process |
| Edge background processes | 100–400 MB | Startup Boost + WebView2 |
| Search Indexer | 100–500 MB | Spikes during index rebuilds |
| DiagTrack / telemetry | 50–200 MB | Known memory leak history |
| Widgets + Copilot + Xbox | 150–400 MB | Pure bloatware on work laptops |
| Other services (Spooler, BITS…) | 200–500 MB | Miscellaneous |
| **Total estimated** | **~5–15 GB** | |

The enterprise security/management stack alone accounts for **~1–1.5 GB** that you cannot and should not reduce.

### Service-by-service breakdown and commands

**SysMain (Superfetch)** — consumes several hundred MB to multiple GB. Designed for HDD-era PCs, it preloads frequently used apps into RAM. On NVMe drives, the benefit is negligible and the RAM cost is real. ✅ Safe to disable:
```powershell
Stop-Service -Name "SysMain" -Force
Set-Service -Name "SysMain" -StartupType Disabled
```

**Windows Search Indexer** — normally 100–300 MB but can spike to 1–2 GB during index rebuilds or corruption. Disabling removes instant full-text search from Explorer and Start menu. ✅ Safe to disable if you don't rely on file-content search:
```powershell
Stop-Service -Name "WSearch" -Force
Set-Service -Name "WSearch" -StartupType Disabled
```

**DiagTrack (telemetry)** — typically 50–150 MB but has a history of memory leak bugs that spike to 12–20 GB in extreme cases. ⚠️ Check with IT before disabling on managed devices (may affect Intune compliance reporting):
```powershell
Stop-Service -Name "DiagTrack" -Force
Set-Service -Name "DiagTrack" -StartupType Disabled
```

**Microsoft Teams** — 300–700 MB idle via multiple Chromium processes. You likely can't uninstall it, but you can optimize it: disable GPU hardware acceleration in Teams Settings → General, clear cache at `%appdata%\Microsoft\Teams\Cache`, and disable the Outlook add-in if you don't use Teams meeting integration from Outlook.

**OneDrive** — 150 MB–2.5 GB depending on library size. Reduce its footprint by using **Files On-Demand** (right-click synced folders → Free up space) and limiting bandwidth in OneDrive Settings → Network.

**Edge background processes** — 100–400 MB even when "closed," via Startup Boost and background extensions. Disable both:
```powershell
# Via Group Policy registry keys (persistent across updates)
$edgePath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
If (-not (Test-Path $edgePath)) { New-Item -Path $edgePath -Force }
New-ItemProperty -Path $edgePath -Name "StartupBoostEnabled" -Value 0 -PropertyType DWord -Force
New-ItemProperty -Path $edgePath -Name "AllowPrelaunch" -Value 0 -PropertyType DWord -Force
```
Also open Edge → Settings → System and Performance → disable "Continue running background apps when Microsoft Edge is closed."

**Widgets, Copilot, Cortana, Xbox** — collectively 200–600 MB of pure waste on a work laptop. Removal commands are in the Quick Wins section above.

### Enterprise agents you must never touch

- ⛔ **Microsoft Defender** (MsMpEng.exe, MsSense.exe) — Tamper Protection blocks changes anyway
- ⛔ **CrowdStrike / Carbon Black / SentinelOne** — tampering triggers security alerts and may require a maintenance token to reinstall
- ⛔ **SCCM/MECM Client** (CcmExec.exe) — breaks patching and compliance
- ⛔ **Intune Management Extension** — breaks device enrollment
- ⛔ **Company Portal** — required for compliance; uninstalling can trigger Conditional Access blocks on email and SharePoint
- ⛔ **Windows Defender Firewall** (mpssvc) — security-critical
- ⛔ **BitLocker services** — encryption-critical

If Defender is consuming excessive RAM (>1 GB), ensure definition updates are current and add exclusions for known-safe development/build directories via `Add-MpPreference -ExclusionPath "C:\code"`.

### Windows 11 Efficiency Mode for background processes

Available in Task Manager (Windows 11 22H2+), Efficiency Mode lowers a process's priority and applies **EcoQoS** — a power-efficient CPU scheduling hint that reduces clock speeds for that process. Right-click any process → "Efficiency mode." It does not persist across reboots but is excellent for throttling Teams or OneDrive during intensive work.

PowerShell equivalent for process priority:
```powershell
Get-Process -Name "Teams" | ForEach-Object { $_.PriorityClass = "BelowNormal" }
Get-Process -Name "OneDrive" | ForEach-Object { $_.PriorityClass = "Idle" }
```

### Disable background apps globally

Windows 11 removed the single "Background apps" toggle from Windows 10. You can restore it via registry:
```powershell
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications" -Name "GlobalUserDisabled" -Value 1
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search" -Name "BackgroundAppGlobalToggle" -Value 0
```

⚠️ This may affect Company Portal and Defender background operations. Monitor for compliance issues after applying.

---

## Cross-cutting: Telemetry, scheduled tasks, and Windows 11 bloat

### Reducing Windows telemetry to the minimum

Windows 11 Pro/Home enforces a minimum "Required" telemetry level — you cannot fully disable data collection without Enterprise or Education editions. But you can minimize it significantly.

**Set telemetry to minimum level:**
```powershell
# Policy-level registry (equivalent to Group Policy setting)
$policyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"
If (-not (Test-Path $policyPath)) { New-Item -Path $policyPath -Force }
New-ItemProperty -Path $policyPath -Name "AllowTelemetry" -Value 0 -PropertyType DWord -Force

# Suppress feedback notifications
New-ItemProperty -Path $policyPath -Name "DoNotShowFeedbackNotifications" -Value 1 -PropertyType DWord -Force
```

**Set feedback frequency to Never:**
```powershell
$path = "HKCU:\SOFTWARE\Microsoft\Siuf\Rules"
If (-not (Test-Path $path)) { New-Item -Path $path -Force }
New-ItemProperty -Path $path -Name "NumberOfSIUFInPeriod" -Value 0 -PropertyType DWord -Force
```

**Disable advertising ID, tailored experiences, and suggested content:**
```powershell
# Advertising ID
$adPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\AdvertisingInfo"
If (-not (Test-Path $adPath)) { New-Item -Path $adPath -Force }
New-ItemProperty -Path $adPath -Name "DisabledByGroupPolicy" -Value 1 -PropertyType DWord -Force

# Tailored experiences
$cloudPath = "HKCU:\SOFTWARE\Policies\Microsoft\Windows\CloudContent"
If (-not (Test-Path $cloudPath)) { New-Item -Path $cloudPath -Force }
New-ItemProperty -Path $cloudPath -Name "DisableTailoredExperiencesWithDiagnosticData" -Value 1 -PropertyType DWord -Force

# Suppress silent app installs and suggestions
$cdm = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager"
@("ContentDeliveryAllowed","SilentInstalledAppsEnabled","SystemPaneSuggestionsEnabled",
  "SubscribedContent-338387Enabled","SubscribedContent-338388Enabled",
  "SubscribedContent-338389Enabled","SubscribedContent-353698Enabled") | ForEach-Object {
    Set-ItemProperty -Path $cdm -Name $_ -Value 0 -ErrorAction SilentlyContinue
}
```

⚠️ **Do NOT disable `dmwappushservice`** on Intune-managed devices — it handles MDM push notifications and disabling it breaks policy sync.

### Auditing and cleaning up scheduled tasks

**Full telemetry task audit and disable script:**
```powershell
# Audit all telemetry-related task paths
$telemetryPaths = @(
    "\Microsoft\Windows\Application Experience\",
    "\Microsoft\Windows\Customer Experience Improvement Program\",
    "\Microsoft\Windows\Autochk\",
    "\Microsoft\Windows\DiskDiagnostic\",
    "\Microsoft\Windows\Windows Error Reporting\"
)
foreach ($path in $telemetryPaths) {
    Write-Host "`n=== $path ===" -ForegroundColor Cyan
    Get-ScheduledTask -TaskPath $path -ErrorAction SilentlyContinue |
        Select-Object TaskName, State | Format-Table -AutoSize
}
```

**Get last run time and next scheduled run for any task:**
```powershell
Get-ScheduledTask -TaskPath "\Microsoft\Windows\*" |
    Where-Object {$_.State -ne "Disabled"} | ForEach-Object {
    $info = Get-ScheduledTaskInfo -TaskName $_.TaskName -TaskPath $_.TaskPath -EA SilentlyContinue
    [PSCustomObject]@{
        Name        = $_.TaskName
        Path        = $_.TaskPath
        State       = $_.State
        LastRun     = $info.LastRunTime
        NextRun     = $info.NextRunTime
    }
} | Sort-Object LastRun -Descending | Format-Table -AutoSize
```

Windows Updates may re-enable disabled tasks. Periodically re-run the disable script or create a scheduled task that re-disables them monthly.

### Disabling Recall, Copilot, Widgets, and Dev Home

**Recall** (only on Copilot+ PCs with NPU) — captures periodic screen snapshots for AI search. Disabled by default; remove entirely:
```powershell
# Via registry (blocks enablement)
$aiPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsAI"
If (-not (Test-Path $aiPath)) { New-Item -Path $aiPath -Force }
New-ItemProperty -Path $aiPath -Name "AllowRecallEnablement" -Value 0 -PropertyType DWord -Force
```

**Copilot** — cloud AI assistant consuming 200–500 MB:
```powershell
Get-AppxPackage *Microsoft.Copilot* | Remove-AppxPackage
# Prevent re-enablement via policy registry:
$copilotPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsCopilot"
If (-not (Test-Path $copilotPath)) { New-Item -Path $copilotPath -Force }
New-ItemProperty -Path $copilotPath -Name "TurnOffWindowsCopilot" -Value 1 -PropertyType DWord -Force
```

**Widgets** — hide from taskbar AND prevent background processes:
```powershell
# Hide from taskbar
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarDa" -Value 0
# Disable via policy (more persistent)
$dshPath = "HKLM:\SOFTWARE\Policies\Microsoft\Dsh"
If (-not (Test-Path $dshPath)) { New-Item -Path $dshPath -Force }
New-ItemProperty -Path $dshPath -Name "AllowNewsAndInterests" -Value 0 -PropertyType DWord -Force
# Full removal
Get-AppxPackage *WebExperience* | Remove-AppxPackage
```

**Dev Home** — safe to remove if you don't use it:
```powershell
Get-AppxPackage *DevHome* | Remove-AppxPackage
Get-AppxProvisionedPackage -Online | Where-Object {$_.PackageName -like "*DevHome*"} |
    Remove-AppxProvisionedPackage -Online
```

### How to check if IT policies are overriding your changes

If settings keep reverting, Group Policy or Intune MDM is likely resetting them.

```powershell
# Check applied Group Policies
gpresult /r

# Generate detailed HTML GPO report
gpresult /h $env:USERPROFILE\Desktop\gpo-report.html

# Check Intune/MDM-applied policies
Get-ChildItem "HKLM:\SOFTWARE\Microsoft\PolicyManager\current\device" -EA SilentlyContinue

# Generate MDM diagnostic report
# Settings → Accounts → Access Work or School → [account] → Info → Export
# Saved to: C:\Users\Public\Documents\MDMDiagnostics\MDMDiagReport.html
```

---

## Nuclear options for aggressive optimization

If the Quick Wins aren't enough, these more aggressive changes push further. Each carries higher risk of conflicting with IT policies or causing side effects. Apply one at a time, reboot, and verify.

**1. Disable Modern Standby via registry** (⛔ High risk — get IT approval first):
```powershell
New-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Power" -Name "PlatformAoAcOverride" -Value 0 -PropertyType DWord -Force
# REBOOT REQUIRED. Verify with: powercfg /a
# Undo: Remove-ItemProperty "HKLM:\System\CurrentControlSet\Control\Power" -Name PlatformAoAcOverride
```
Not all systems gain S3 when Modern Standby is disabled. Some laptops only support S0, and disabling it leaves only Hibernate. Test carefully — some machines won't wake properly and require a 40-second power button hold to reset.

**2. Aggressive service disabling** (⚠️ test thoroughly):
```powershell
$nuclearServices = @(
    "SysMain",        # Superfetch
    "WSearch",        # Windows Search Indexer
    "DiagTrack",      # Telemetry
    "dmwappushservice", # WAP Push (SKIP if Intune-managed!)
    "MapsBroker",     # Downloaded Maps
    "XblAuthManager", # Xbox Live Auth
    "XblGameSave",    # Xbox Game Save
    "XboxGipSvc",     # Xbox Accessory
    "XboxNetApiSvc",  # Xbox Networking
    "WMPNetworkSvc",  # Media Player Sharing
    "Fax",            # Fax Service
    "RetailDemo",     # Retail Demo
    "wisvc",          # Windows Insider
    "lfsvc"           # Geolocation
)
foreach ($svc in $nuclearServices) {
    Stop-Service -Name $svc -Force -EA SilentlyContinue
    Set-Service -Name $svc -StartupType Disabled -EA SilentlyContinue
    Write-Host "Disabled: $svc" -ForegroundColor Yellow
}
```

**3. Complete bloatware purge:**
```powershell
$bloatApps = @(
    "*WebExperience*",     # Widgets
    "*Microsoft.Copilot*", # Copilot
    "Microsoft.549981C3F5F10", # Cortana
    "*DevHome*",           # Dev Home
    "*Xbox.TCUI*",         # Xbox TCUI
    "*XboxGameOverlay*",   # Xbox Game Overlay
    "*XboxGamingOverlay*", # Xbox Gaming Overlay
    "*XboxSpeechToText*",  # Xbox Speech
    "*GetHelp*",           # Get Help
    "*Getstarted*",        # Tips
    "*BingNews*",          # Bing News
    "*BingWeather*",       # Bing Weather
    "*MicrosoftSolitaireCollection*", # Solitaire
    "*WindowsFeedbackHub*" # Feedback Hub
)
foreach ($app in $bloatApps) {
    Get-AppxPackage -AllUsers $app -EA SilentlyContinue | Remove-AppxPackage -EA SilentlyContinue
    Get-AppxProvisionedPackage -Online | Where-Object {$_.PackageName -like $app} |
        Remove-AppxProvisionedPackage -Online -EA SilentlyContinue
}
```

**4. Disable Windows Error Reporting:**
```powershell
New-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\Windows Error Reporting" -Name "Disabled" -Value 1 -PropertyType DWord -Force
Disable-ScheduledTask -TaskName "QueueReporting" -TaskPath "\Microsoft\Windows\Windows Error Reporting\" -EA SilentlyContinue
```

**5. Force-disable all background apps and suppress all content delivery:**
```powershell
# Global background app kill
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications" -Name "GlobalUserDisabled" -Value 1

# Force deny background apps via policy
$privPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\AppPrivacy"
If (-not (Test-Path $privPath)) { New-Item -Path $privPath -Force }
New-ItemProperty -Path $privPath -Name "LetAppsRunInBackground" -Value 2 -PropertyType DWord -Force
```

---

## Conclusion

The three problems on a managed Windows 11 laptop are deeply interconnected. **Modern Standby** is the primary battery drain culprit — switching lid-close to hibernate is the single highest-impact change and costs nothing. **High idle RAM** on a 32 GB system largely stems from the cumulative weight of enterprise security agents (~1–1.5 GB you can't reduce), SysMain caching, search indexing, Edge background processes, and Windows 11 feature bloat — the Quick Wins above can reclaim **1.5–3 GB** with minimal risk. **Slow startup** improves most from disabling Fast Startup (which ensures clean boot states) and trimming auto-start services and telemetry tasks.

The critical insight for work-managed laptops: **not every optimization is available to you**. Intune and Group Policy can silently revert your changes, and enterprise agents like Defender, CrowdStrike, and SCCM are untouchable for good reason. Focus your effort on the bloatware layer (Widgets, Copilot, Cortana, Xbox) and the legacy caching services (SysMain, WSearch) — these are the changes that yield measurable improvement with zero risk to your IT compliance posture. Run the diagnostic commands periodically (especially `powercfg /sleepstudy` and the process memory grouping script) to catch regressions as Windows updates roll in and re-enable what you've disabled.
