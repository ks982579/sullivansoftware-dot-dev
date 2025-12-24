---
layout: '@layouts/BlogLayout.astro'
title: 'Pop!_OS Update is Great but Cannot Resume from Suspend'
pubDate: 2025-12-24
description: "Debugging a black screen on resume from suspend in Pop!_OS after a kernel update. A quick guide to identifying NVIDIA driver compatibility issues and booting into an older kernel as a workaround."
author: 'Kevin Sullivan'
image:
    # url: 'https://docs.astro.build/assets/full-logo-dark.png' 
    # alt: 'The full Astro logo.'
tags: ["popos", "pop!_os", "linux", "nvidia", "driver"]
---

# Pop!\_OS Update is Great but Cannot Resume from Suspend

## TLDR

I noticed after upgrading to the latest version of Pop!\_OS that after trying to resume from a suspend that the screens would remain black. After a long debugging session with Claude, we found that booting back into the old kernel and testing suspend again, it worked as expected. 

Kernel 6.16.3 used NVIDIA open driver 580.82.09. The new kernel 6.17.4 still uses this NVIDIA driver at the moment, but there's an update for NVIDIA 580.95.05, just at a lower priority in `apt-cache`, so not prioritized by Pop!\_OS yet. 

I did not test updating to the new NVIDIA driver, if that would fix the issue. When you reboot the computer, if you hold `<Space>` while it boots up (the screen to let you check BIOS and such) then you will be given the option to boot back into the older kernel if you installed that first. That is, hold the Space key down right after the BIOS/System76 logo appear, but before the OS begins loading. 

I will wait for Pop!\_OS to give the green-light on the driver update. If you are just downloading for the first time and do not have the older kernel, you may try to update the NVIDIA driver:

```bash
# Option A:
# Pin to the specific driver version
sudo apt install nvidia-driver-580-open=580.95.05-0ubuntu0.22.04.2

# Option B:
# Tells "apt" to treat jammy-updates repo as highest priority
# and pulls the latest version from that repo
sudo apt install -t jammy-updates nvidia-driver-580-open

# Important
sudo reboot
```

## Why POP!\_OS?

Recently, right before RAM prices skyrocketed, I purchase a new desktop computer through [PCSpecialist](https://www.pcspecialist.ie). The idea was to get something that could power through some AI/ML projects as I get ready for my thesis in my Masters in Computer Science Programme (still a few months out). Just to nerd out for a moment, the specs are:
- ASUS Prime X870-P WIFI motherboard
- AMD Ryzen 7 7700 Eight core CPU
- MSI RTX 5070 Ti Shadow GPU with 16GB VRAM
- 64GB DDR5 5600MHz RAM
- 3TB total SSD storage

And it all came with Windows 11... So one of the main reasons I wanted 64GB RAM was because Windows eats about half of the 32GB of RAM in background processes on my Laptop. If I had WSL running, it was getting close to the top. So naturally the switch to a Linux based OS was salient, and I had found POP!\_OS to be my favourite when testing in the past. 

## Debugging Suspend

As mentioned in the TLDR, after the latest update when I would resume from suspend the screens would remain black. A little bit of research lead me to realize this isn't Pop!\_OS specific but an NVIDIA driver issue, as forums were open regarding the issue on NVIDIA's website as well. Realizing I was out of my depth I turned to Claude to help debug the issue.

Together we ran a slew of terminal commands:

```bash
# Check NVIDIA driver and kernel versions
nvidia-smi
uname -r
cat /proc/driver/nvidia/version

# Check the system logs for what happened during the last failed resume
journalctl -b -1 | grep -i -E "(nvidia|suspend|resume|sleep|wake)" | tail -50

# Check which suspend mode you are using
cat /sys/power/mem_sleep

# Verify you have these
systemctl status nvidia-suspend.service
systemctl status nvidia-hibernate.service
systemctl status nvidia-resume.service

# Check for recent regression
cat /var/log/apt/history.log | tail -100
```

The list of commands goes on. There is a lot to learn about the different services and very cool that it's a file based OS, so a lot of what you need to know is somewhere in a file. 

Claude saw from:

```bash
zcat /var/log/apt/history.log.*.gz 2>/dev/null | tail -100; cat /var/log/apt/history.log | tail -100
```

I upgraded from kernel 6.16.3 to 6.17.4 at the start of December (I also started the prompt with that information). Running `ls /boot/vmlinuz*` will let you know if you have older kernel versions on your system. Then we check:

```bash
# are newer NVIDIA drivers available?
apt-cache policy nvidia-driver-* | grep -E "(nvidia-driver-[0-9]+|Installed|Candidate)" | head -40

# check the sleep script just in case
cat /usr/bin/nvidia-sleep.sh

# Check if Pop!_OS pushed a newer driver
sudo apt update
apt list --upgradable 2>/dev/null | grep -i nvidia

# Check Pop!_OS repo specifically
apt-cache policy nvidia-driver-580-open
```

The `apt-cache policy` shows that the newer NVIDIA driver has a lower priority than what Pop!\_OS has prescribed. This means `apt` won't upgrade automatically because it thinks we are already at the best version. 

## Your Options

From the TLDR, if you have the previous kernel version 6.16.3 installed, then you can boot into the older version by holding `<space>` during reboot. Once rebooted, run command `uname -r` to check you are in the correct kernel version. This is the solution that has worked for me. Claude suggested running the following to set the default boot kernel version, I did not run the following command:

```bash
sudo kernelstub -v -k /boot/vmlinuz-6.16.3-76061603-generic -i /boot/initrd.img-6.16.3-76061603-generic
```

I will wait for Pop!\_OS to push an update (probably), and can check with the following command in the meantime:

```bash
apt-cache policy nvidia-driver-580-open | head -5

# when new candidate is available
sudo apt update && sudo apt upgrade
```

If you want to test the new driver fixes the issue, you can run:

```bash
sudo apt install -t jammy-updates nvidia-driver-580-open
```

I didn't test this and am skeptical since the older kernel version is working for now.

## Conclusion

It's been a fun morning of debugging with Claude. Always a good time to dig into Linux system commands and learn more about the things we use all day - everyday. A clear guide wasn't easy to find online which is why I wrote up this quick blog.

To summarize, Pop!\_OS is not the main issue, there seems to be a driver-OS compatibility issues with kernel 6.17.4 and NVIDIA 580.82.09 that prevents returning from suspended mode properly (monitors don't show any image). Booting back into the old kernel is a quick win. Downloading a newer driver, before Pop!\_OS has recommended, could work but might be dodgy. 

I hope this helps others who are escaping from Window's AI and ad filled OS. Thanks for reading. 
