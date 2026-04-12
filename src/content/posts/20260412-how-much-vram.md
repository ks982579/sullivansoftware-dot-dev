---
layout: '@layouts/BlogLayout.astro'
title: 'How much VRAM Does a Model Actually Need?'
pubDate: 2026-04-12
description: "Deep dive into how much VRAM a model needs to run locally."
author: 'Kevin Sullivan'
image:
    # url: 'https://docs.astro.build/assets/full-logo-dark.png' 
    # alt: 'The full Astro logo.'
tags: ["linux", "nvidia", "vram", "ai", "artificial intelligence"]
---

# How Much VRAM Does a Model Actually Need?

*A deep dive into model size, memory math, quantization internals, and what fits on your GPU*

---

## Why VRAM Is the Bottleneck

When you load a model from Hugging Face, it doesn't execute in your system RAM — it executes on your GPU, which means every weight, every activation, and every cached attention state has to live inside your VRAM. Unlike system RAM, VRAM is a finite, non-expandable resource (at least per-card), and it has to hold everything at once: the model weights, the key-value cache for your context window, the CUDA runtime overhead, and any activation buffers needed during generation.

The short version of the problem: you can have a beautiful 13B-parameter model that benchmarks extremely well — but if it requires 28 GB at full precision and your GPU has 16 GB, it simply won't load.

This guide breaks down exactly how to calculate what a model costs in VRAM, what all those cryptic quantisation suffixes mean at a bit-level, and which models fit on two specific real-world GPUs: a desktop **RTX 5070 Ti (16 GB GDDR7)** and a laptop **RTX 3060 (6 GB GDDR6)**.

---

## Part 1: How Big Is a Model?

### Parameters Are the Unit of Size

A model's "size" — the 7B, 13B, 70B you see in names — is its **parameter count**: the number of individual floating-point numbers that make up the learned weights. Every one of those numbers has to be stored somewhere.

How much space each parameter takes depends on the **numerical precision** (data type) used to store it:

| Data type | Bytes per parameter | Notes |
|-----------|--------------------|----|
| FP32 | 4 bytes | Full precision; used in training, rarely at inference |
| FP16 / BF16 | 2 bytes | "Half precision"; standard inference baseline |
| INT8 | 1 byte | Post-training quantisation; ~50% size saving |
| INT4 / Q4 | 0.5 bytes (≈) | Aggressive quantisation; ~75% size saving vs FP16 |

So the baseline formula for just loading the weights is:

```
Weight VRAM (GB) = Parameters (billions) × bytes_per_parameter × (1024³ / 1024³)
                = Parameters (B) × bytes_per_parameter
```

For a 7B model at FP16:  
`7 × 2 = 14 GB` — just for the weights.

For the same model at INT4:  
`7 × 0.5 = 3.5 GB` — an enormous difference.

But weights alone don't tell the whole story. Before you start generating a single token, you need to account for three more things.

---

## Part 2: The Four Contributors to Total VRAM Usage

### 1. Model Weights

Already covered above. This is your baseline floor — the model can't exist in memory at less than this.

### 2. CUDA / Runtime Overhead

Loading the CUDA runtime, driver context, and inference framework (llama.cpp, PyTorch, vLLM, etc.) consumes VRAM before a single weight is touched. This overhead is typically **500 MB to 2 GB** depending on the framework. Ollama and llama.cpp sit at the lower end (~0.5–1 GB); vLLM can be higher due to its PagedAttention allocator.

Always reserve at least **1 GB** as a safety buffer when planning.

### 3. The KV Cache — The Hidden Monster

This is the component most people underestimate, and it's the one that will burn you when working with long context.

When an autoregressive transformer generates tokens, it needs to compute attention over all previously generated tokens. Rather than recomputing the key and value vectors for every past token on every new forward pass, transformers cache them. This is the **KV (Key-Value) cache**, and it grows *linearly* with every token generated.

The exact formula (per inference call, batch size = 1) is:

```
KV Cache (bytes) = 2 × n_layers × n_kv_heads × head_dim × seq_len × bytes_per_element
```

The `2` accounts for the key tensor and the value tensor — one of each, per layer.  
`n_kv_heads` is specifically the number of *KV* heads, which in modern models using Grouped Query Attention (GQA) is smaller than the total attention head count. Llama 3 8B for example has 32 attention heads but only 8 KV heads — a 4× reduction in cache size compared to vanilla multi-head attention.

**Worked example — Llama 3.1 8B at 8K context, FP16 KV cache:**

- n_layers = 32  
- n_kv_heads = 8 (GQA)  
- head_dim = 128  
- seq_len = 8,192 tokens  
- bytes = 2 (FP16)

```
2 × 32 × 8 × 128 × 8192 × 2 = 536,870,912 bytes ≈ 0.5 GB
```

That's manageable. But at 32K context:

```
2 × 32 × 8 × 128 × 32768 × 2 = 2,147,483,648 bytes = 2.0 GB
```

And at 128K context (the model's native max):

```
2 × 32 × 8 × 128 × 131072 × 2 = 8,589,934,592 bytes = 8.0 GB
```

With a 5 GB model loaded at Q4 and 8 GB of KV cache, you've already hit 13 GB on a 16 GB card — before counting framework overhead. Context length isn't free.

> **Tip:** Tools like Ollama expose `OLLAMA_KV_CACHE_TYPE` to quantise the KV cache itself to Q8 or Q4, cutting cache usage in half or more. This is a legitimate trade-off for long-context inference on constrained hardware, though it introduces subtle quality degradation compared to quantising the weights.

### 4. Activation Memory

During inference, the model needs scratch space to compute the output of each layer before passing it to the next. This activation memory is small at batch size 1 (a few hundred MB) and grows with batch size. For single-user local inference you can treat it as included in the ~20% overhead factor.

### Putting It Together

A practical total estimate for single-user inference:

```
Total VRAM ≈ (Parameters × bytes_per_param) + KV_Cache + 1 GB overhead
```

Or equivalently, the rule of thumb with a ~20% overhead factor baked in:

```
Total VRAM ≈ Parameters (B) × bytes_per_param × 1.2
```

---

## Part 3: Quantisation Internals — What Q4_K_M Actually Means

You've seen filenames like `Llama-3.1-8B-Q4_K_M.gguf` or `qwen3-14b-q5_k_m.gguf`. These aren't arbitrary — the suffix encodes exactly how the model weights were compressed.

### The GGUF Format

GGUF (GPT-Generated Unified Format) is the standard container for quantised local models, created by Georgi Gerganov for the [llama.cpp](https://github.com/ggml-org/llama.cpp) project. A single `.gguf` file contains the architecture metadata, tokeniser, and compressed weights — everything needed to run inference, no separate config files required.

### Decoding the Suffix

A suffix like `Q4_K_M` has three parts:

- **Q4** → each weight is stored using approximately **4 bits**
- **K** → uses **K-quant** (grouped/hierarchical quantisation scheme — see below)
- **M** → **Medium** mixed-precision within that scheme (S = Small, L = Large)

#### Legacy Formats: `_0` and `_1`

The original llama.cpp quantisation types like `Q4_0`, `Q5_0`, `Q8_0` use **simple block quantisation**: a block of 32 weights shares one scale factor (and optionally one zero-point for `_1` variants). Dequantisation is a single affine transform per block — fast, but limited in quality.

`Q8_0` is the standout exception: at 8 bits with only a scale per block, it is essentially lossless (perplexity increase of ~0.01 points). It's still widely used and a safe fallback.

The 4-bit and 5-bit legacy types (`Q4_0`, `Q5_0`) have been largely superseded by K-quants for quality, though they decode slightly faster on some older hardware.

#### K-Quants: The Modern Standard

K-quants (introduced in llama.cpp) use a **two-level block hierarchy**:

1. **Inner blocks** of 32 weights, each with their own scale and zero-point
2. **Super-blocks** of 256 weights, with an additional scale that governs the inner blocks

This "double quantisation" gives K-quants a piece-wise affine approximation of the weight distribution, capturing both local variation (within a 32-weight block) and global variation (across the super-block). The result is dramatically better quality per bit than legacy formats.

Critically, K-quants are also **mixed-precision**: the `_M` (medium) variant, for example, quantises roughly half of the attention and feed-forward weights at 6-bit and the rest at 4-bit, resulting in an effective bit-width slightly above 4 despite the `Q4` prefix.

```
Q4_0   : 4.34 bits/weight  — legacy, significant quality loss at 7B
Q4_K_S : 4.37 bits/weight  — K-quant small, modest improvement
Q4_K_M : 4.58 bits/weight  — K-quant medium, recommended default
Q5_K_M : 5.69 bits/weight  — better quality, moderate VRAM increase
Q6_K   : 6.57 bits/weight  — near-lossless for most tasks
Q8_0   : 8.50 bits/weight  — effectively lossless
```

**Perplexity impact at 7B (lower Δppl = less quality loss):**

| Format | File size (7B) | Δ perplexity | Notes |
|--------|----------------|------|-------|
| Q2_K | ~2.7 GB | +0.87 | Extreme loss, avoid |
| Q3_K_M | ~3.1 GB | +0.24 | Very high loss |
| Q4_K_M | ~3.8 GB | +0.05 | **Recommended default** |
| Q5_K_M | ~4.3 GB | +0.04 | Excellent quality |
| Q6_K | ~5.0 GB | ~0.01 | Near-lossless |
| Q8_0 | ~7.1 GB | ~0.00 | Lossless |

Source: llama.cpp official quantisation documentation and community benchmarks.

#### I-Quants: Importance-Matrix Guided Compression

The newest family is I-quants (`IQ3_M`, `IQ4_XS`, etc.). These use an **importance matrix** — a calibration step that analyses which weights matter most for a representative sample of inputs — and allocates bits non-uniformly. The most critical weights get higher precision; less important weights are compressed harder.

The result is better quality at the same average bit-width versus K-quants, at the cost of slower dequantisation and dependence on calibration quality. `IQ4_XS` vs `Q4_K_M` is a common comparison: IQ4_XS is slightly smaller (4.46 bits/weight vs 4.89) and often a bit faster for token generation, though slightly slower on prompt processing.

#### Non-GGUF Formats: GPTQ and AWQ

For NVIDIA GPU inference (not CPU/hybrid), two other formats are common:

- **GPTQ** — Post-training quantisation optimised for GPU, compresses layer by layer using calibration data. Good at 3-bit and 4-bit. Requires compute capability 7.5+ (Turing/RTX 2000 series or newer).
- **AWQ** (Activation-aware Weight Quantisation) — Looks at activation patterns to protect the most influential weights before compressing. Generally produces better speed/quality than GPTQ, especially with vLLM's Marlin kernel.

If you're using Hugging Face `transformers` directly with `bitsandbytes`, you get:
- `load_in_8bit=True` → INT8, ~50% VRAM reduction
- `load_in_4bit=True` → NF4 (NormalFloat4), ~75% VRAM reduction; this is what QLoRA uses

---

## Part 4: Mixture of Experts — A Special Case

A word on MoE models, because they're increasingly common and they behave differently.

In a dense model, every token passes through every parameter. In a Mixture-of-Experts model, the network contains many "expert" sub-networks, but each token only activates a small subset. For example, Qwen3 30B-A3B has 30B total parameters but only ~3B are active per token.

**The VRAM implication**: all experts must still reside in memory for fast switching, even if only a few are active at once. MoE doesn't save VRAM — it saves *compute*. So when planning VRAM, treat a MoE model by its *total* parameter count, not its active count.

The benefit shows up in inference speed: a 30B MoE that activates 3B per token generates tokens at roughly the speed of a 3B dense model, despite having quality closer to a 14B+ dense model.

---

## Part 5: Your Hardware at a Glance

### RTX 5070 Ti (Desktop) — 16 GB GDDR7

- **VRAM**: 16 GB
- **Memory bandwidth**: 896 GB/s
- **Architecture**: Blackwell (GB203)
- **CUDA compute capability**: 10.0
- **Usable VRAM after overhead**: ~14.5–15 GB

The 5070 Ti is a meaningfully better AI inference card than its naming might suggest. GDDR7 memory bandwidth (~896 GB/s) is roughly 2.5× the bandwidth of the RTX 3060 (~360 GB/s), and memory bandwidth is what determines token generation speed for autoregressive LLMs — these are memory-bound workloads, not compute-bound.

### RTX 3060 (Laptop) — 6 GB GDDR6

- **VRAM**: 6 GB  
  *(Note: the desktop RTX 3060 has 12 GB; laptop variants are typically 6 GB)*
- **Memory bandwidth**: ~336–360 GB/s (laptop variant)
- **Architecture**: Ampere (GA106)
- **CUDA compute capability**: 8.6
- **Usable VRAM after overhead**: ~5–5.5 GB

6 GB is a tight constraint. At this tier, quantisation is not optional — it's survival. Q4_K_M is the default starting point, and you'll need to be careful with context length.

---

## Part 6: Model-by-Model Breakdown

### Section A: Text Generation / General LLMs

#### 6 GB (RTX 3060 Laptop) Tier

| Model | Quant | Approx VRAM | Notes |
|-------|-------|-------------|-------|
| Llama 3.2 3B | Q8_0 | ~3.5 GB | High-quality small model; fast |
| Qwen3 4B | Q4_K_M | ~2.8 GB | Thinking/non-thinking mode; surprisingly capable |
| Qwen3 8B | Q4_K_M | ~5.5 GB | Tight; limit context to ~4K–8K tokens |
| Phi-4 Mini 3.8B | Q8_0 | ~4.0 GB | Microsoft's efficient small reasoning model |
| Llama 3.1 8B | Q4_K_M | ~5.0 GB | Fits with ~4K context; less room for KV cache |

At 6 GB, 7–8B models at Q4_K_M are your ceiling. Context window must be kept short (4K–8K tokens) or KV cache will overflow into system RAM, causing a 5–30× performance penalty. The Qwen3 4B at Q4_K_M is arguably the best overall bet at this tier: it has both a "thinking" mode (extended chain-of-thought reasoning) and a fast "non-thinking" mode, and at ~2.8 GB it leaves ample headroom for context.

#### 16 GB (RTX 5070 Ti) Tier

This is where things get interesting. With 16 GB you have genuine flexibility.

| Model | Quant | Approx VRAM | Notes |
|-------|-------|-------------|-------|
| Llama 3.1 8B | Q8_0 | ~9 GB | Near-lossless quality |
| Qwen3 8B | Q8_0 | ~9 GB | Excellent all-rounder, thinking + non-thinking |
| Qwen3 14B | Q4_K_M | ~9 GB | Significantly better quality than 8B |
| Phi-4 14B | Q4_K_M | ~9 GB | Strong reasoning; efficient architecture |
| DeepSeek-R1 14B distill | Q4_K_M | ~9 GB | Best reasoning at this tier; chain-of-thought |
| Qwen3 14B | Q5_K_M | ~10.5 GB | Better quality, still fits comfortably |
| Gemma 3 12B | Q5_K_M | ~8.5 GB | Google's model; efficient KV cache due to GQA |
| Qwen3 30B-A3B (MoE) | Q4_K_M | ~17–18 GB | Tight; may need context management |
| Llama 3.3 70B | Q2_K | ~24 GB | ❌ Won't fit — requires 24 GB+ |

The sweet spot on the 5070 Ti is **14B models at Q4_K_M or Q5_K_M**. At ~9–10.5 GB they leave 5–7 GB of headroom for your KV cache, which at a practical 8K–16K context for most workflows is perfectly manageable. The DeepSeek-R1 14B distill deserves special mention — it's a distilled version of the full R1 reasoning model and delivers competition-level maths and logic performance for its size.

The Qwen3 30B-A3B MoE model is borderline: at Q4_K_M it needs approximately 17–18 GB, which technically exceeds your 16 GB. However, some GGUF tools can partially offload to system RAM with minimal penalty (since only 3B parameters are *active* per token, the hot path is narrow). In practice, many users report it running with short-to-medium contexts on 16 GB with llama.cpp's split offloading. If you try it, limit your context to 4K–8K.

---

### Section B: Code Generation

#### 6 GB (RTX 3060 Laptop) Tier

| Model | Quant | Approx VRAM | Notes |
|-------|-------|-------------|-------|
| Qwen2.5-Coder 7B | Q4_K_M | ~5.0 GB | Strong code; tight on 6 GB |
| Qwen3 4B (thinking) | Q4_K_M | ~2.8 GB | Thinking mode activates CoT for complex code |
| DeepSeek-Coder 6.7B | Q4_K_M | ~4.5 GB | Specialised coder; fits with short context |

Code generation benefits more from quantisation headroom than from raw precision — it's better to run a 7B code model at Q4 than a 3B at Q8. Syntax sensitivity means Q4_K_M is the floor recommended for code; Q5_K_M is preferable when VRAM allows.

#### 16 GB (RTX 5070 Ti) Tier

| Model | Quant | Approx VRAM | Notes |
|-------|-------|-------------|-------|
| Qwen2.5-Coder 14B | Q4_K_M | ~9 GB | Best dedicated coding model for 16 GB |
| Qwen2.5-Coder 14B | Q5_K_M | ~10.5 GB | Recommended for syntax-sensitive work |
| Qwen3 Coder 30B-A3B | Q4_K_M | ~17 GB | Borderline; quality near 30B dense |
| Qwen2.5-Coder 32B | Q4_K_M | ~19 GB | ❌ Won't fit on 16 GB |
| DeepSeek-R1 14B distill | Q4_K_M | ~9 GB | Excellent for complex debugging/reasoning |

`Qwen2.5-Coder 14B` at `Q5_K_M` is the recommended primary coding model for the 5070 Ti. It consistently outperforms DeepSeek-Coder V2 on real-world benchmarks and fits with 5+ GB headroom for context. The specialised Qwen3-Coder-Next (80B MoE, 3B active) scores remarkably on SWE-Bench, but at ~49 GB at Q4 it requires a system with 64 GB unified memory or dual enterprise GPUs — well beyond either of your cards.

---

### Section C: Text-to-Speech (TTS)

TTS models are an order of magnitude smaller than LLMs and behave quite differently. Instead of billions of transformer parameters, they're typically sequence-to-sequence or vocoder architectures measured in tens or hundreds of millions of parameters.

#### Kokoro-82M

You're already familiar with this one from your SullySoftware work. Some hard numbers:

- **Parameters**: 82 million
- **Architecture**: StyleTTS2 + ISTFTNet vocoder (decoder-only, no diffusion)
- **VRAM at FP16**: under 1 GB for weights alone
- **Total inference footprint**: **under 2 GB VRAM** (including CUDA buffers)
- **CPU capable**: yes — runs at near-real-time on CPU
- **RTF (Real-Time Factor)**: ~0.03 on a datacenter GPU; well below 1.0 on either of your GPUs

Kokoro runs comfortably on either card with trivial VRAM impact. On the 5070 Ti you could run Kokoro *and* a 14B LLM simultaneously if you structured it as a TTS pipeline.

#### Broader TTS VRAM Landscape

| Model | Params | VRAM | Notes |
|-------|--------|------|-------|
| Piper | ~30M | < 0.5 GB | CPU-optimised; instant; runs on a Raspberry Pi |
| Kokoro-82M | 82M | ~1–2 GB | Excellent quality/speed; Apache 2.0 |
| StyleTTS2 | ~200M | ~2 GB | Reference architecture Kokoro is based on |
| F5-TTS | ~300M | ~2–3 GB | Flow-matching; good zero-shot cloning; MIT |
| Chatterbox | ~1B est. | ~4–6 GB | Voice cloning; beats ElevenLabs in blind tests |
| XTTS v2 | ~500M | ~4–6 GB | Multilingual; voice cloning; slower |
| Fish Audio S1 | ~4.4B total | 12 GB min | Dual-AR design; top TTS-Arena score; multilingual |

For your specific setup: Kokoro, Piper, StyleTTS2, and F5-TTS all run trivially on either GPU. Fish Audio S1 requires 12 GB, making it comfortable on the 5070 Ti but not the laptop 3060. The largest TTS models (Fish S1, Bark) are the only ones that would challenge either card, and they're mostly relevant for voice cloning use cases.

---

## Part 7: The Practical Decision Framework

### Step 1: Find the parameter count

Every model on Hugging Face has its parameter count either in the name or on the model card. If it's not explicit, open the `config.json` file and multiply `num_hidden_layers × hidden_size × 4` (a rough approximation for transformer FFN layers) — or just check the model card's "Files and versions" section for the file sizes.

### Step 2: Calculate baseline weight VRAM

```
FP16:   params_B × 2   (e.g., 14B → 28 GB)
Q8:     params_B × 1   (e.g., 14B → 14 GB)
Q4_K_M: params_B × 0.5 + ~10% overhead (e.g., 14B → ~8.3 GB)
```

### Step 3: Estimate KV cache budget

```
KV Cache (GB) = 2 × layers × kv_heads × head_dim × context_tokens × 2 / 1024³
```

If you don't know the architecture specifics, use this rule of thumb from community measurements:
- ~0.5 GB per 8K context for a 7–8B model
- ~1.0 GB per 8K context for a 14B model
- ~2.0 GB per 8K context for a 30B+ model

### Step 4: Reserve overhead

Add 1 GB for CUDA/framework overhead as a floor.

### Step 5: Check feasibility

```
Total ≈ Weight VRAM + KV Cache + 1 GB ≤ Your VRAM
```

If the model fits with 1–2 GB to spare, you're fine. If it fits with less than 1 GB spare, you're gambling with the KV cache — reduce context length or go one quantisation level lower.

### Step 6: Use a calculator for precision

For exact numbers without manual arithmetic, the community has built excellent tools:

- **HuggingFace VRAM Calculator** (NyxKrage): https://huggingface.co/spaces/NyxKrage/LLM-Model-VRAM-Calculator
- **apxml VRAM Calculator**: https://apxml.com/tools/vram-calculator — accounts for architecture (GQA, MoE), context length, batch size
- **oobabooga's GGUF formula**: https://oobabooga.github.io/blog/posts/gguf-vram-formula/ — empirically derived from 19,517 measurements; very accurate for GGUF models
- **Will It Run AI**: https://willitrunai.com — model browser with VRAM tier filtering

---

## Part 8: Quick Reference Summary

### 6 GB (RTX 3060 Laptop)

**Can run:**
- Any 3–4B model at Q8 or above
- 7–8B models at Q4_K_M (with short context, 4K–8K tokens)
- All TTS models except Fish Audio S1

**Cannot run:**
- 13B+ models at any quantisation level
- 7B models at Q6 or above
- Long-context inference (16K+) on any 7B model

**Best all-rounder**: Qwen3 4B at Q4_K_M  
**Best 7B option**: Qwen3 8B at Q4_K_M, context ≤ 8K  
**Best TTS**: Kokoro-82M (trivial VRAM, near-real-time)

### 16 GB (RTX 5070 Ti Desktop)

**Can run:**
- Up to 14B models at Q5_K_M or Q6_K comfortably
- 14B models at Q8_0 (~14 GB, leaves ~2 GB — tight but feasible at short context)
- 30B MoE models (e.g. Qwen3 30B-A3B) at Q4_K_M with context management
- All TTS models including Fish Audio S1

**Cannot run:**
- 32B dense models at Q4_K_M (needs ~19 GB)
- 70B models at any typical quantisation level (needs 40+ GB at Q4)

**Best general LLM**: Qwen3 14B at Q5_K_M  
**Best coding model**: Qwen2.5-Coder 14B at Q5_K_M  
**Best reasoning**: DeepSeek-R1 14B distill at Q4_K_M  
**Best TTS**: Kokoro-82M for latency; Fish Audio S1 for quality/multilingual  

---

## References and Further Reading

1. Modal Blog — "How much VRAM do I need for LLM inference?" (September 2024)  
   https://modal.com/blog/how-much-vram-need-inference

2. Spheron Network Blog — "GPU Memory Requirements for LLMs: VRAM Calculator"  
   https://www.spheron.network/blog/gpu-memory-requirements-llm/

3. LocalLLM.in — "Ollama VRAM Requirements: Complete 2026 Guide"  
   https://localllm.in/blog/ollama-vram-requirements-for-local-llms

4. Paul Ilvez (Medium) — "Demystifying LLM Quantization Suffixes: What Q4_K_M, Q8_0, and Q6_K Really Mean"  
   https://medium.com/@paul.ilvez/demystifying-llm-quantization-suffixes-what-q4-k-m-q8-0-and-q6-k-really-mean-0ec2770f17d3

5. Will It Run AI — "GGUF Quantization Explained — Q4_K_M vs Q5_K_M vs Q8"  
   https://willitrunai.com/blog/quantization-guide-gguf-explained

6. kaitchup (Substack) — "Choosing a GGUF Model: K-Quants, I-Quants, and Legacy Formats"  
   https://kaitchup.substack.com/p/choosing-a-gguf-model-k-quants-i

7. Michael Hannecke (Medium) — "GGUF Optimization: A Technical Deep Dive for Practitioners"  
   https://medium.com/@michael.hannecke/gguf-optimization-a-technical-deep-dive-for-practitioners-ce84c8987944

8. oobabooga Blog — "A formula that predicts GGUF VRAM usage from GPU layers and context length"  
   https://oobabooga.github.io/blog/posts/gguf-vram-formula/

9. Michael Brenndoerfer — "KV Cache Memory: Calculating GPU Requirements for LLM Inference"  
   https://mbrenndoerfer.com/writing/kv-cache-memory-calculation-llm-inference-gpu

10. Pierre Lienhart (Medium) — "LLM Inference Series: 4. KV caching, a deeper look"  
    https://medium.com/@plienhar/llm-inference-series-4-kv-caching-a-deeper-look-4ba9a77746c8

11. Lyceum Technology — "KV Cache Memory Calculation for LLMs"  
    https://lyceum.technology/magazine/kv-cache-memory-calculation-llm/

12. Dev.to — "Q4 KV Cache: Fit 32K Context into 8GB VRAM"  
    https://dev.to/plasmon_imp/q4-kv-cache-fit-32k-context-into-8gb-vram-only-math-broke-209k

13. llama.cpp official quantisation documentation  
    https://mintlify.wiki/ggml-org/llama.cpp/concepts/quantization

14. Enclave AI Blog — "LLM Quantization Explained: Run Bigger Models on Less RAM"  
    https://enclaveai.app/blog/2026/03/15/llm-quantization-explained-gguf-guide/

15. Spheron Network Blog — "Deploy Open-Source TTS on GPU Cloud: Kokoro, Fish Speech, and Hume TADA Guide (2026)"  
    https://www.spheron.network/blog/deploy-open-source-tts-gpu-cloud-2026/

16. Hexgrad / Kokoro-82M — Hugging Face model card  
    https://huggingface.co/hexgrad/Kokoro-82M

17. Clore.ai — "Kokoro TTS Guide"  
    https://docs.clore.ai/guides/audio-and-voice/kokoro-tts

18. Awesome Agents — "Home GPU LLM Leaderboard: Best Open Source Models by VRAM Tier"  
    https://awesomeagents.ai/leaderboards/home-gpu-llm-leaderboard/

19. Will It Run AI — "Qwen 3 & 3.5 VRAM Requirements — Every Model Size"  
    https://willitrunai.com/blog/qwen-3-gpu-requirements

20. InsiderLLM — "DeepSeek Models Guide: R1, V3, and Coder"  
    https://insiderllm.com/guides/deepseek-models-guide/

---

*Last updated: April 2026. Model ecosystem moves fast — use the calculators linked above for the most current estimates on newly released models.*
