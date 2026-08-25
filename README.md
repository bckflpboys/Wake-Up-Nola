# 🌅 Wake Up Nola

**Wake Up Nola** is an offline-first personal AI assistant application built for mobile and desktop, powered by lightweight on-device Small Language Models (SLMs) such as Google Gemma 2 2B, SmolLM2 1.7B, Qwen 2.5 1.5B, and Llama 3.2 1B.

---

## 🚀 Key Features

- **Standby & Ambient Wake-Up:** "Wake Up Nola" voice trigger and interactive glowing pulse button.
- **Proactive Daily Briefing ("What Am I Missing Today?"):** Automatically scans your offline schedule, overdue tasks, and shared documents to give you a failure-proof morning summary.
- **Micro-Agent Task Decomposition:** Breaks complex instructions down into small, deterministic steps so smaller on-device models execute reliably without hallucinating.
- **Shared Folder & Offline Knowledge Base (Private RAG):** Point Nola to a folder (`assets/shared_vault/`) to index notes, documents, and contacts locally. 100% private and on-device.
- **Multi-Backend AI Engine:**
  - **On-Device SLMs:** Google Gemma 2 2B, SmolLM2 1.7B, Qwen 2.5 1.5B, Llama 3.2 1B
  - **Desktop LAN (Ollama / LM Studio):** Offload computation to your PC over local WiFi
  - **Cloud Fallback:** Optional online Gemini 2.5 Flash

---

## 📂 Model Directory & Download Instructions

Place your downloaded `.gguf` (4-bit quantized `Q4_K_M`) or MediaPipe `.task` models into:
```
assets/models/
```

### Direct Download Links:
1. **Google Gemma 2 (2B GGUF):** [bartowski/gemma-2-2b-it-GGUF on HuggingFace](https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf)
2. **SmolLM2 (1.7B GGUF):** [HuggingFaceTB/SmolLM2-1.7B-Instruct-GGUF](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct-GGUF/resolve/main/SmolLM2-1.7B-Instruct-Q4_K_M.gguf)
3. **Qwen 2.5 (1.5B GGUF):** [Qwen/Qwen2.5-1.5B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf)
4. **Llama 3.2 (1B GGUF):** [bartowski/Llama-3.2-1B-Instruct-GGUF](https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf)

---

## 📁 Shared Vault Directory

Place your offline documents, notes, and meeting agendas into:
```
assets/shared_vault/
```
Nola will index these files into SQLite full-text search and use them for offline answers.

---

## 🛠️ Running the App

```bash
npm install
npm start
# or for android
npm run android
# or for web
npm run web
```
