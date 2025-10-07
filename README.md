# n8n-nodes-nvidia-nim# n8n-nodes-nvi## 📋 Requirements



![n8n.io - Workflow Automation](https://img.shields.io/badge/n8n-workflow%20automation-FF6D5A.svg)- n8n v1.0.0+

![npm version](https://img.shields.io/npm/v/n8n-nodes-nvidia-nim.svg)- Node.js v18.17.0+

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)- NVIDIA NGC API Key ([Get one here](https://ngc.nvidia.com))



n8n community node for **NVIDIA NIM** - Chat completions and image analysis with NVIDIA AI models.## 📦 Installation



## FeaturesIn n8n: **Settings** → **Community Nodes** → Install `n8n-nodes-nvidia-nim` - Workflow Automation](https://img.shields.io/badge/n8n-workflow%20automation-FF6D5A.svg)

![npm version](https://img.shields.io/npm/v/n8n-nodes-nvidia-nim.svg)

- Dynamic model loading from NVIDIA NIM API![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

- Searchable model dropdown with automatic updates

- Support for 20+ NVIDIA models (Llama 3, Mistral, etc.)
- Image analysis with Vision Language Models (NeVA, Fuyu, Kosmos, etc.)

n8n community node for **NVIDIA NIM** (NVIDIA Inference Microservices) - Chat completions and image analysis with NVIDIA AI models.

- Configurable parameters (temperature, max tokens, etc.)

## ✨ Features

## Requirements

- Dynamic model loading from NVIDIA NIM API

- n8n v1.0.0+- Support for 20+ NVIDIA NIM models (Llama 3, Mistral, etc.)

- Node.js v18.17.0+- Searchable model dropdown with automatic updates

- [NVIDIA NGC API Key](https://ngc.nvidia.com)- Streaming support and comprehensive error handling



## Installation## 📋 Prerequisites



In n8n: **Settings** → **Community Nodes** → Install `n8n-nodes-nvidia-nim`- **n8n** version 1.0.0 or higher (with AI Agent support)

- **Node.js** v18.17.0 or higher

## Setup- **NVIDIA NGC API Key** - Get yours at [ngc.nvidia.com](https://ngc.nvidia.com)



1. Get API Key at [ngc.nvidia.com](https://ngc.nvidia.com)## � Installation

2. In n8n: **Credentials** → **New** → **NVIDIA NIM API**

3. Enter API Key and Base URL: `https://integrate.api.nvidia.com/v1`**Via n8n Community Nodes** (Recommended):

1. Go to **Settings** → **Community Nodes**

## Usage2. Click **Install**

3. Enter: `n8n-nodes-nvidia-nim`

1. Add "NVIDIA NIM" node to workflow for text-based chat
2. Add "NVIDIA NIM Image Analysis" node to workflow for image analysis

2. Select model from dropdown (e.g., `meta/llama3-8b-instruct`)**Via npm**:

3. Add messages (user/assistant roles)```bash

4. Configure optional parametersnpm install n8n-nodes-nvidia-nim

5. Execute```



## Available ModelsRestart n8n after installation.



- `meta/llama3-8b-instruct` (recommended)## ⚙️ Setup

- `meta/llama3-70b-instruct`

- `meta/llama3-405b-instruct`1. **Get NVIDIA API Key**: [ngc.nvidia.com](https://ngc.nvidia.com)

- `mistralai/mixtral-8x7b-instruct-v0.1`2. **Add Credentials** in n8n:

- [View all models →](https://docs.nvidia.com/nim/)   - Go to **Credentials** → **New**

   - Select **NVIDIA NIM API**

## Configuration   - Enter API Key and Base URL: `https://integrate.api.nvidia.com/v1`



**Key Parameters:**## 🎯 Basic Usage

- Model: Choose from searchable dropdown

- Temperature: 0.0-2.0 (default: 0.7)```

- Max Tokens: Response length (default: 100)Manual Trigger → NVIDIA NIM

- Top P: Nucleus sampling (default: 1.0)```

- System Prompt: Guide AI behavior

- Frequency/Presence Penalty: Control repetition**Steps**:

1. Add "NVIDIA NIM" node → Configure model (e.g., `meta/llama3-8b-instruct`)

### Image Analysis Usage

1. Add "NVIDIA NIM Image Analysis" node → Configure vision model (e.g., `nvidia/neva-22b`)
2. Provide image data (URL, base64, or data URL) and analysis prompt
3. Connect: Trigger → NVIDIA NIM Image Analysis (main)
4. Execute workflow

## Resources2. Connect: Trigger → NVIDIA NIM (main)

3. Execute workflow

- [CHANGELOG](./CHANGELOG.md)

- [GitHub](https://github.com/Akash9078/n8n-nodes-nvidia-nim)## � Common Patterns

- [npm](https://www.npmjs.com/package/n8n-nodes-nvidia-nim)

- [NVIDIA NIM Docs](https://docs.nvidia.com/nim/)

**Production Setup**:

## License- Use larger models: `meta/llama3-405b-instruct`

- Configure timeout and error handling

MIT License - [Akash Kumar Naik](https://github.com/Akash9078)


## 🤖 Available Models

### Text Models

- `meta/llama3-8b-instruct` ⭐ (recommended)
- `meta/llama3-70b-instruct`
- `meta/llama3-405b-instruct`
- `mistralai/mixtral-8x7b-instruct-v0.1`

[View all models →](https://docs.nvidia.com/nim/)

### Vision Models
- `meta/llama-3-2-11b-vision-instruct` ⭐ (recommended)
- `meta/llama-3-2-90b-vision-instruct`
- `microsoft/phi-3-vision-128k-instruct`

[View all vision models →](https://docs.nvidia.com/nim/)

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
