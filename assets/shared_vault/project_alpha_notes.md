# Project Alpha - Notes & Architecture

## System Overview
- **Goal:** Build an assistant called Nola that runs small models offline on mobile and desktop.
- **Key Strategy:** Decompose complex tasks into micro-steps so Gemma 2B or Qwen 1.5B never fail.
- **Data Privacy:** User files stay 100% on device in the shared vault.
- **Offline RAG:** Use SQLite full-text search with fast keyword indexing.

## Pending Items
- [ ] Test Gemma 2B GGUF with 4-bit quantization.
- [ ] Connect desktop Ollama instance via local WiFi LAN.
- [ ] Add background wake-word standby mode.
