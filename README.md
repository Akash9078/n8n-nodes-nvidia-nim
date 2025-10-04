# n8n-nodes-nvidia-nim

![n8n.io - Workflow Automation](https://img.shields.io/badge/n8n-workflow%20automation-FF6D5A.svg)
![npm version](https://img.shields.io/npm/v/n8n-nodes-nvidia-nim.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

**Visual AI Agent Architecture for NVIDIA NIM** - Connect NVIDIA's powerful AI models to n8n's AI Agent ecosystem with drag-and-drop simplicity.

## 🎨 v2.0 - Visual Sub-Node Architecture

Version 2.0 introduces a complete architectural redesign following n8n's visual AI Agent pattern:

```
┌─────────────────────────────┐
│  NVIDIA NIM Chat Model      │ ← Configure model
└─────────────┬───────────────┘
              │ ai_languageModel
              ▼
┌─────────────────────────────┐
│  AI Agent (n8n built-in)    │ ← Visual connections
├─ Memory (optional)          │
├─ Tools (optional)           │
└─────────────────────────────┘
```

## 🚀 Features

- **🎨 Visual Sub-Node Architecture**: Drag-and-drop Chat Model connections
- **🤖 n8n AI Agent Compatible**: Works with n8n's built-in AI Agent node
- **🧠 Memory Support**: Connect any n8n Memory node (Window Buffer, Motorhead, etc.)
- **🛠️ Tool Use**: Connect any n8n Tool node (Calculator, Code, HTTP Request, etc.)
- **🔗 LangChain Integration**: Full LangChain ecosystem support
- **⚡ Production Ready**: Battle-tested architecture following n8n patterns
- **🔄 Modular**: Easily swap Chat Models in your workflows

## 📋 Prerequisites

- **n8n** version 1.0.0 or higher (with AI Agent support)
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

After installation, restart your n8n instance.

## 🔧 Quick Start Guide

### Step 1: Set up NVIDIA NIM Credentials

1. In n8n, go to **Credentials** → **New**
2. Search for **NVIDIA NIM API**
3. Enter your credentials:
   - **API Key**: Your NVIDIA NGC API key
   - **Base URL**: `https://integrate.api.nvidia.com/v1`
4. Click **Save**

### Step 2: Build Your First AI Agent

1. **Add Chat Trigger** (or Manual Trigger)
   - Drag "When chat message received" onto canvas

2. **Add NVIDIA NIM Chat Model**
   - Search for "NVIDIA NIM Chat Model"
   - Configure model: `meta/llama3-8b-instruct`
   - Adjust temperature, max tokens if needed

3. **Add AI Agent** (n8n built-in)
   - Search for "AI Agent"
   - Drag onto canvas

4. **Connect them visually**
   - Drag from Chat Model's output to AI Agent's "Chat Model" input
   - You'll see a visual connection line

5. **Test it!**
   - Execute the workflow
   - Ask a question in the chat

## 📖 Usage Examples

### Example 1: Basic Chat Agent

```
Workflow:
├─ When chat message received
├─ NVIDIA NIM Chat Model (meta/llama3-8b-instruct)
├─ AI Agent
└─ [Chat response sent back]
```

**Setup:**
1. Add "When chat message received" trigger
2. Add "NVIDIA NIM Chat Model" → Configure model
3. Add "AI Agent"
4. Connect: Chat Model → AI Agent (ai_languageModel connection)
5. Connect: Trigger → AI Agent (main connection)

**Result:** A basic conversational AI powered by NVIDIA NIM!

### Example 2: Agent with Memory

```
Workflow:
├─ When chat message received
├─ NVIDIA NIM Chat Model (meta/llama3-70b-instruct)
├─ Window Buffer Memory
├─ AI Agent
└─ [Remembers conversation history]
```

**Setup:**
1. Follow Example 1 setup
2. Add "Window Buffer Memory" node
3. Connect: Memory → AI Agent (ai_memory connection)
4. Configure memory window size (default: 10 messages)

**Result:** Agent remembers previous messages in the conversation!

### Example 3: Agent with Tools

```
Workflow:
├─ When chat message received
├─ NVIDIA NIM Chat Model
├─ Calculator Tool
├─ Code Tool (JavaScript)
├─ HTTP Request Tool
├─ AI Agent
└─ [Can perform calculations, run code, make API calls]
```

**Setup:**
1. Follow Example 1 setup
2. Add "Calculator" node (from AI Tools category)
3. Add "Code Tool" node
4. Add "HTTP Request Tool" node
5. Connect all tools → AI Agent (ai_tool connections)

**Result:** Agent can use tools to solve complex tasks!

### Example 4: Production Agent

```
Workflow:
├─ When chat message received
├─ NVIDIA NIM Chat Model (temperature: 0.7)
├─ Motorhead Memory (persistent)
├─ Calculator Tool
├─ Code Tool
├─ Your Custom Tool (n8n workflow as tool)
├─ AI Agent (with system message)
└─ [Full-featured production AI agent]
```

**Configuration:**
- **Chat Model**: Set appropriate temperature (0.3 for focused, 0.8 for creative)
- **Memory**: Use Motorhead for persistent memory across sessions
- **System Message** (in AI Agent): Define agent personality and rules
- **Tools**: Add all necessary capabilities

## 🎯 Available NVIDIA NIM Models

### Text Generation Models
- `meta/llama3-8b-instruct` - Fast, balanced (recommended)
- `meta/llama3-70b-instruct` - Larger, more capable
- `meta/llama3-405b-instruct` - Maximum capability
- `mistralai/mixtral-8x7b-instruct-v0.1` - Great for coding
- `mistralai/mistral-7b-instruct-v0.3` - Fast, efficient

### Multimodal Models
- `meta/llama-3.2-90b-vision-instruct` - Vision + text
- `microsoft/phi-3-vision-128k-instruct` - Efficient vision

### Embedding Models
Use with Vector Store nodes:
- `nvidia/nv-embed-v1` - General purpose
- `nvidia/nv-embedqa-e5-v5` - Q&A optimized

## 🔧 Configuration Options

### Chat Model Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Model | string | meta/llama3-8b-instruct | NVIDIA NIM model to use |
| Temperature | number | 0.7 | Controls randomness (0.0-2.0) |
| Max Tokens | number | 1024 | Maximum response length |
| Top P | number | 1.0 | Nucleus sampling (0.0-1.0) |
| Frequency Penalty | number | 0.0 | Reduces repetition (-2.0-2.0) |
| Presence Penalty | number | 0.0 | Encourages new topics (-2.0-2.0) |
| Timeout | number | 60000 | Request timeout (milliseconds) |

## 🎨 Visual Connections Guide

### Connection Types

1. **ai_languageModel** (Chat Model → Agent)
   - Required for all agents
   - Provides the AI model's intelligence
   - Yellow connection line in n8n

2. **ai_memory** (Memory → Agent)
   - Optional but recommended
   - Enables conversation history
   - Blue connection line

3. **ai_tool** (Tools → Agent)
   - Optional
   - Gives agent capabilities
   - Purple connection line

4. **main** (Trigger → Agent)
   - Standard workflow connection
   - Passes input data
   - Gray connection line

## 🚨 Breaking Changes from v1.x

### What Changed

**v1.x (Old - Parameter-Based):**
```typescript
// Tools defined as parameters in node
{
  tools: [
    { name: "calculator", ... },
    { name: "search", ... }
  ]
}
```

**v2.0 (New - Visual Sub-Nodes):**
```
Visual Canvas:
NVIDIA NIM Chat Model → AI Agent ← Calculator Tool
                                  ← Search Tool
```

### Migration Guide

1. **Replace NVIDIA NIM Node** with "NVIDIA NIM Chat Model" sub-node
2. **Add n8n AI Agent** (built-in node)
3. **Connect Chat Model** → AI Agent (ai_languageModel)
4. **Replace tool parameters** with actual Tool nodes
5. **Connect Tools** → AI Agent (ai_tool)
6. **Add Memory** if needed → AI Agent (ai_memory)

Benefits:
- ✅ Visual workflow - see data flow
- ✅ Modular - swap models easily
- ✅ Reusable - same tools for multiple agents
- ✅ Debuggable - inspect connections
- ✅ Standard - follows n8n patterns

## 📚 Documentation

- **[AI_AGENT_GUIDE.md](./AI_AGENT_GUIDE.md)**: Complete production guide
  - Message roles and workflows
  - Memory management best practices
  - Tool design patterns
  - Token optimization strategies

- **[CHANGELOG.md](./CHANGELOG.md)**: Version history and updates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- [GitHub Repository](https://github.com/Akash9078/n8n-nodes-nvidia-nim)
- [npm Package](https://www.npmjs.com/package/n8n-nodes-nvidia-nim)
- [NVIDIA NIM Documentation](https://docs.nvidia.com/nim/)
- [n8n Documentation](https://docs.n8n.io/)

## 🙏 Acknowledgments

- n8n team for the amazing workflow automation platform
- NVIDIA for providing powerful AI models via NIM
- LangChain community for the AI framework

---

**Need Help?** Open an issue on [GitHub](https://github.com/Akash9078/n8n-nodes-nvidia-nim/issues)

**Want to Contribute?** PRs welcome!

Made with ❤️ by [Akash Kumar Naik](https://github.com/Akash9078)
