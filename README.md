# n8n-nodes-nvidia-nim

![n8n.io - Workflow Automation](https://img.shields.io/badge/n8n-workflow%20automation-FF6D5A.svg)
![npm version](https://img.shields.io/npm/v/n8n-nodes-nvidia-nim.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

This is an n8n community node that integrates **NVIDIA NIM (NVIDIA Inference Microservices)** into your n8n workflows. It allows you to leverage NVIDIA's powerful AI models for chat completions, text generation, embeddings, and more.

## 🚀 Features

- **Chat Completions**: Create conversational AI experiences with context-aware responses
- **Function Calling / Tool Use** ⭐ **NEW v1.1.0**: Build AI agents that can call external tools and functions
- **Text Completions**: Generate text continuations from prompts
- **Embeddings**: Convert text into vector embeddings for semantic search and similarity
- **Model Management**: List and discover available NVIDIA AI models
- **Full Parameter Control**: Fine-tune temperature, top-p, frequency/presence penalties, and more
- **MCP Ready**: Foundation for Model Context Protocol integration

## 📋 Prerequisites

Before you begin, ensure you have:

- **n8n** installed (version 0.200.0 or higher)
- **Node.js** v18.17.0 or higher
- **NVIDIA NGC API Key** - Get yours at [ngc.nvidia.com](https://ngc.nvidia.com)

## 📦 Installation

### Option 1: Install via n8n Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter: `n8n-nodes-nvidia-nim`
5. Click **Install**

### Option 2: Install via npm

```bash
npm install n8n-nodes-nvidia-nim
```

### Option 3: Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n/custom

# Install the package
npm install n8n-nodes-nvidia-nim
```

After installation, restart your n8n instance.

## 🔧 Configuration

### 1. Set up NVIDIA NIM Credentials

1. In n8n, go to **Credentials** → **New**
2. Search for **NVIDIA NIM API**
3. Enter your credentials:
   - **API Key**: Your NVIDIA NGC API key
   - **Base URL**: `https://integrate.api.nvidia.com/v1` (default)
4. Click **Save**

### 2. Add the Node to Your Workflow

1. Create or open a workflow
2. Click the **+** button to add a node
3. Search for **NVIDIA NIM**
4. Select the node and choose your credentials

## 📖 Usage Examples

### Example 1: Simple Chat Completion

```
Resource: Chat
Operation: Create
Model: meta/llama3-8b-instruct
Messages:
  - Role: system
    Content: You are a helpful assistant
  - Role: user
    Content: What is machine learning?
```

### Example 2: Text Generation with Custom Parameters

```
Resource: Completion
Operation: Create
Model: meta/llama3-70b-instruct
Prompt: Write a product description for...
Additional Options:
  - Max Tokens: 200
  - Temperature: 0.8
  - Top P: 0.95
```

### Example 3: Generate Embeddings

```
Resource: Embedding
Operation: Create
Model: nvidia/nv-embed-v1
Input: Transform this text into vector embeddings
```

### Example 4: Function Calling / Tool Use ⭐ NEW

Build AI agents that can call external functions:

```
Resource: Chat
Operation: Create
Model: meta/llama3-8b-instruct
Messages: [{"role": "user", "content": "What's the weather in Tokyo?"}]

Tools:
  - Function Name: get_current_weather
  - Description: Get the current weather in a given location
  - Parameters (JSON Schema):
    {
      "type": "object",
      "properties": {
        "location": {
          "type": "string",
          "description": "City and state, e.g. Tokyo, Japan"
        },
        "unit": {
          "type": "string",
          "enum": ["celsius", "fahrenheit"]
        }
      },
      "required": ["location"]
    }

Tool Choice: auto
```

The model will generate:
```json
{
  "tool_calls": [{
    "function": {
      "name": "get_current_weather",
      "arguments": "{\"location\": \"Tokyo, Japan\", \"unit\": \"celsius\"}"
    }
  }]
}
```

**📘 See [FUNCTION_CALLING_GUIDE.md](./FUNCTION_CALLING_GUIDE.md) for complete documentation and examples.**

### Example 5: List Available Models

```
Resource: Model
Operation: List
```

## 🎯 Available Resources

### Chat
Create conversational AI responses with full conversation context and function calling capabilities.

**Operations:**
- `Create`: Generate chat completions with message history

**Parameters:**
- `Model`: AI model identifier (e.g., `meta/llama3-8b-instruct`)
- `Messages`: Array of conversation messages with roles (system/user/assistant)
- `Tools` ⭐ **NEW**: Define functions the model can call (name, description, JSON Schema parameters)
- `Tool Choice` ⭐ **NEW**: Control tool usage (auto, none, required)
- `Max Tokens`: Maximum response length
- `Temperature`: Creativity control (0-2)
- `Top P`: Nucleus sampling parameter
- `Frequency Penalty`: Reduce repetition (-2 to 2)
- `Presence Penalty`: Encourage new topics (-2 to 2)

### Completion
Generate text continuations from prompts.

**Operations:**
- `Create`: Generate text completions

**Parameters:**
- `Model`: AI model identifier
- `Prompt`: Text prompt to complete
- Same additional options as Chat

### Embedding
Convert text into vector embeddings.

**Operations:**
- `Create`: Generate embeddings

**Parameters:**
- `Model`: Embedding model (e.g., `nvidia/nv-embed-v1`)
- `Input`: Text to embed

### Model
Manage and discover models.

**Operations:**
- `List`: Get all available models

## 🔑 Supported Models

**Chat/Completion Models:**
- `meta/llama3-8b-instruct` - Fast, efficient LLM
- `meta/llama3-70b-instruct` - High-performance LLM
- `mistralai/mixtral-8x7b-instruct-v0.1` - Mixture of Experts model
- `google/gemma-7b` - Google's Gemma model

**Embedding Models:**
- `nvidia/nv-embed-v1` - NVIDIA's embedding model
- `sentence-transformers/all-MiniLM-L6-v2` - Compact embeddings

For the latest model list, use the **Model → List** operation.

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/n8n-nodes-nvidia-nim.git
cd n8n-nodes-nvidia-nim

# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
npm link
```

### Project Structure

```
n8n-nodes-nvidia-nim/
├── credentials/
│   └── NvidiaNimApi.credentials.ts
├── nodes/
│   └── NvidiaNim/
│       ├── NvidiaNim.node.ts
│       ├── NvidiaNim.node.json
│       └── nvidia-nim.svg
├── package.json
├── tsconfig.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [documentation](https://docs.nvidia.com/nim/)
2. Search [existing issues](https://github.com/yourusername/n8n-nodes-nvidia-nim/issues)
3. Create a [new issue](https://github.com/yourusername/n8n-nodes-nvidia-nim/issues/new)

## 🔗 Resources

- [n8n Documentation](https://docs.n8n.io)
- [NVIDIA NIM Documentation](https://docs.nvidia.com/nim/)
- [NVIDIA NGC](https://ngc.nvidia.com)
- [Community Node Development](https://docs.n8n.io/integrations/creating-nodes/)

## 📊 Version History

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## 🌟 Show Your Support

If this project helped you, please give it a ⭐️!

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

**Made with ❤️ for the n8n community**
