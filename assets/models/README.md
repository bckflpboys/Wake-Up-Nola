# 🧠 Wake Up Nola - Cutting-Edge On-Device Mobile AI Models

Place your downloaded `.gguf` (4-bit `Q4_K_M` or `Q4_0`) model files in this folder (`assets/models/`).

---

## 🌟 Google Gemma 4 Family (Apache 2.0 - Multimodal + Native Audio)

Google's newest edge architecture features built-in multimodal reasoning and native real-time audio processing:

### 1. Google Gemma 4 (E2B Mobile)
- **Model Key:** `gemma-4-e2b`
- **Why it's great:** "Effective 2B" architecture built specifically for smartphone CPUs/NPUs. Includes native audio support with a sub-1.5GB RAM footprint.
- **Size (`Q4_K_M`):** ~1.4 GB | **RAM Needed:** ~1.7 GB
- **Hugging Face Link:**  
  👉 [unsloth/gemma-4-E2B-it-GGUF](https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF)

---

### 2. Google Gemma 4 (E4B Audio + Vision)
- **Model Key:** `gemma-4-e4b`
- **Why it's great:** Uses MatFormer architecture for near-zero quantization degradation. Features full speech/audio understanding, vision camera analysis, and a 32k context window.
- **Size (`Q4_K_M`):** ~2.6 GB | **RAM Needed:** ~3.4 GB
- **Hugging Face Link:**  
  👉 [unsloth/gemma-4-E4B-it-GGUF](https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF)

---

## 🐉 Alibaba Qwen 3.5 Family (Unified Multimodal + Tool Calling)

Alibaba's newest generation unifies text, vision, and precise micro-agent function calling:

### 3. Alibaba Qwen 3.5 (0.8B Edge)
- **Model Key:** `qwen-3.5-0.8b`
- **Why it's great:** Ultra-fast responses (~50 tokens/sec on mobile) with unified text & vision capabilities. Operates smoothly even on budget 3GB/4GB RAM phones.
- **Size (`Q4_K_M`):** ~580 MB | **RAM Needed:** ~800 MB
- **Hugging Face Link:**  
  👉 [Qwen/Qwen3.5-0.8B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen3.5-0.8B-Instruct-GGUF)

---

### 4. Alibaba Qwen 3.5 (2B Steps & Reasoning)
- **Model Key:** `qwen-3.5-2b`
- **Why it's great:** The best compact model for sequential task decomposition, JSON structuring, and multilingual queries.
- **Size (`Q4_K_M`):** ~1.45 GB | **RAM Needed:** ~1.8 GB
- **Hugging Face Link:**  
  👉 [Qwen/Qwen3.5-2B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen3.5-2B-Instruct-GGUF)

---

## 🧠 Chain-of-Thought & Reasoning Models

### 5. DeepSeek-R1-Distill-Qwen-1.5B
- **Why it's great:** Runs DeepSeek's `<think>` chain-of-thought steps directly on your phone for complex problem solving.
- **Size (`Q4_K_M`):** ~1.1 GB | **RAM Needed:** ~1.4 GB
- **Hugging Face Link:**  
  👉 [unsloth/DeepSeek-R1-Distill-Qwen-1.5B-GGUF](https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-1.5B-GGUF)

---

## 📱 Mobile Device Compatibility Matrix

| Phone RAM Tier | Recommended Models | Examples of Devices |
| :--- | :--- | :--- |
| **3GB – 4GB RAM** | **Qwen 3.5 (0.8B)**, **Llama 3.2 (1B)** | Budget Android, older iPhones |
| **6GB – 8GB RAM** | **Gemma 4 (E2B)**, **Qwen 3.5 (2B)**, **DeepSeek-R1 (1.5B)** | Mid-range Android (Galaxy A-series, Pixel 7a/8a), iPhone 13-15 |
| **12GB – 16GB+ RAM** | **Gemma 4 (E4B)**, **Phi-4-mini (3.8B)** | Flagships (Snapdragon 8 Gen 3/Elite, iPhone 16 Pro) |

---

## 💡 Quick Start
1. Download either `gemma-4-E2B-it-Q4_K_M.gguf` or `Qwen3.5-0.8B-Instruct-Q4_K_M.gguf`.
2. Save the file into:
   ```
   assets/models/
   ```
3. Open the **Models** tab in the app to activate your on-device engine.
