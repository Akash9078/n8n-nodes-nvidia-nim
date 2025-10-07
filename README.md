# n8n-nodes-nvidia-nim

![n8n.io - Workflow Automation](https://img.shields.io/badge/n8n-workflow%20automation-FF6D5A.svg)
![npm version](https://img.shields.io/npm/v/n8n-nodes-nvidia-nim.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

n8n community node to integrate **NVIDIA NIM** (NVIDIA Inference Microservices) with n8n's AI Agent ecosystem.

> **Latest: v2.1.2** - Fixed package loading issue. See [CHANGELOG](./CHANGELOG.md) for details.

## 📦 What's Included

This package provides:

1. **NVIDIA NIM Chat Model** (Sub-node) - Connect to n8n's AI Agent
2. **NVIDIA NIM** (Legacy) - Simple chat completions

## ✨ Features

- Visual AI Agent architecture with drag-and-drop connections
- Compatible with n8n's built-in AI Agent, Memory, and Tool nodes
- LangChain integration via sub-node pattern
- Support for 20+ NVIDIA NIM models (Llama 3, Mistral, etc.)
- Streaming support and comprehensive error handling

## 📋 Prerequisites

- **n8n** version 1.0.0 or higher (with AI Agent support)
- **Node.js** v18.17.0 or higher
- **NVIDIA NGC API Key** - Get yours at [ngc.nvidia.com](https://ngc.nvidia.com)

## � Installation

**Via n8n Community Nodes** (Recommended):
1. Go to **Settings** → **Community Nodes**
2. Click **Install**
3. Enter: `n8n-nodes-nvidia-nim`

**Via npm**:
```bash
npm install n8n-nodes-nvidia-nim
```

Restart n8n after installation.

## ⚙️ Setup

1. **Get NVIDIA API Key**: [ngc.nvidia.com](https://ngc.nvidia.com)
2. **Add Credentials** in n8n:
   - Go to **Credentials** → **New**
   - Select **NVIDIA NIM API**
   - Enter API Key and Base URL: `https://integrate.api.nvidia.com/v1`

## 🎯 Basic Usage

```
Manual Trigger → AI Agent (n8n built-in)
                    ↑
         NVIDIA NIM Chat Model
```

**Steps**:
1. Add "NVIDIA NIM Chat Model" node → Configure model (e.g., `meta/llama3-8b-instruct`)
2. Add "AI Agent" (n8n built-in)
3. Connect: Chat Model → AI Agent (ai_languageModel)
4. Connect: Trigger → AI Agent (main)
5. Execute workflow

## � Common Patterns

**With Memory** (conversation history):
```
Add "Window Buffer Memory" → Connect to AI Agent (ai_memory)
```

**With Tools** (Calculator, Code, HTTP, etc.):
```
Add Tool nodes → Connect to AI Agent (ai_tool)
```

**Production Setup**:
- Use larger models: `meta/llama3-405b-instruct`
- Add persistent memory: Motorhead or Redis
- Configure timeout and error handling

## 🤖 Available Models

**Text Generation**:
- `meta/llama3-8b-instruct` ⭐ (recommended)
- `meta/llama3-70b-instruct`
- `meta/llama3-405b-instruct`
- `mistralai/mixtral-8x7b-instruct-v0.1`

**Vision**:
- `meta/llama-3.2-90b-vision-instruct`
- `microsoft/phi-3-vision-128k-instruct`

**Embeddings**:
- `nvidia/nv-embed-v1`
- `nvidia/nv-embedqa-e5-v5`

[View all models →](https://docs.nvidia.com/nim/)

## ⚙️ Configuration

**Key Parameters**:
- **Model**: Choose from 20+ NVIDIA models
- **Temperature**: 0.0-2.0 (default: 0.7)
- **Max Tokens**: Response length (default: 1024)
- **Top P**: Nucleus sampling (default: 1.0)

## 📋 Requirements

- n8n v1.0.0+ (with AI Agent support)
- Node.js v18.17.0+
- NVIDIA NGC API Key

## 📚 Resources

- [CHANGELOG](./CHANGELOG.md) - Version history
- [GitHub Repository](https://github.com/Akash9078/n8n-nodes-nvidia-nim)
- [npm Package](https://www.npmjs.com/package/n8n-nodes-nvidia-nim)
- [NVIDIA NIM Docs](https://docs.nvidia.com/nim/)

## � License

MIT License - see [LICENSE](./LICENSE)

## 🤝 Contributing

Issues and PRs welcome on [GitHub](https://github.com/Akash9078/n8n-nodes-nvidia-nim)

---

Made by [Akash Kumar Naik](https://github.com/Akash9078)
