# n8n-nodes-nvidia-nim

![n8n.io - Workflow Automation](https://img.shields.io/badge/n8n-workflow%20automation-FF6D5A.svg)
![npm version](https://img.shields.io/npm/v/n8n-nodes-nvidia-nim.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

**Visual AI Agent Architecture for NVIDIA NIM** - Connect NVIDIA's powerful AI models to n8n's AI Agent ecosystem with drag-and-drop simplicity.

## 🎨 v2.1 - Complete AI Agent with ReAct Pattern

Version 2.1 adds a **complete AI Agent node** with intelligent tool calling and memory management:

```
┌─────────────────────────────┐
│  NVIDIA NIM Chat Model      │ ← Configure model
└─────────────┬───────────────┘
              │ ai_languageModel
              ▼
┌─────────────────────────────┐
│  NVIDIA NIM AI Agent  ⭐NEW │ ← ReAct pattern agent
├─ Memory (optional)          │ ← Conversation history
├─ Tools (optional, multi)    │ ← Calculator, Code, etc.
└─────────────────────────────┘
```

**Options:**
1. **Use NVIDIA NIM AI Agent** ⭐ Recommended - Complete agent with tool calling
2. **Use n8n's built-in AI Agent** - Standard n8n agent (also works great!)

## 🚀 Features

- **🤖 NVIDIA NIM AI Agent** ⭐ NEW: Complete AI Agent with ReAct pattern, tool calling, and memory
- **🎨 Visual Sub-Node Architecture**: Drag-and-drop Chat Model connections
- **🧠 Memory Support**: Connect any n8n Memory node (Window Buffer, Motorhead, etc.)
- **🛠️ Intelligent Tool Use**: Agent automatically selects and uses connected tools
- **🔗 LangChain Integration**: Full LangChain Agent ecosystem support
- **⚡ Production Ready**: Battle-tested architecture following n8n patterns
- **🔄 Modular**: Easily swap Chat Models in your workflows
- **📊 Execution Tracking**: Monitor agent iterations, tool usage, and performance

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

#### Option A: Using NVIDIA NIM AI Agent ⭐ Recommended

1. **Add Manual Trigger**
   - Drag "Manual Trigger" onto canvas

2. **Add NVIDIA NIM Chat Model**
   - Search for "NVIDIA NIM Chat Model"
   - Configure model: `meta/llama3-8b-instruct`
   - Adjust temperature, max tokens if needed

3. **Add NVIDIA NIM AI Agent** ⭐
   - Search for "NVIDIA NIM AI Agent"
   - Drag onto canvas
   - Configure system message (optional)
   - Set max iterations (default: 10)

4. **Connect them visually**
   - Connect: Manual Trigger → NVIDIA NIM AI Agent (main input)
   - Connect: NVIDIA NIM Chat Model → NVIDIA NIM AI Agent (ai_languageModel input)

5. **Test it!**
   - Add input text: `{{ "What is 25 * 47?" }}`
   - Execute the workflow
   - See the agent's response!

#### Option B: Using n8n's Built-in AI Agent

1. Follow steps 1-2 above
2. Add "AI Agent" (n8n built-in) instead
3. Connect: Chat Model → AI Agent (ai_languageModel)
4. Connect: Trigger → AI Agent (main)
5. Test!

## 📖 Usage Examples

### Example 1: Basic Chat Agent ⭐ NEW

```
Workflow:
├─ Manual Trigger
├─ NVIDIA NIM Chat Model (meta/llama3-8b-instruct)
├─ NVIDIA NIM AI Agent
└─ [Agent Output]
```

**Setup:**
1. Add "Manual Trigger"
2. Add "NVIDIA NIM Chat Model" → Configure: `meta/llama3-8b-instruct`
3. Add "NVIDIA NIM AI Agent"
4. Connect: Chat Model → AI Agent (ai_languageModel)
5. Connect: Trigger → AI Agent (main)
6. Set input: `{{ "Tell me about NVIDIA" }}`

**Result:** A basic conversational AI powered by NVIDIA NIM!

**Output Includes:**
- `output`: The agent's response
- `executionTime`: How long it took (ms)
- `metadata`: Model used, tools available, iterations

### Example 2: Agent with Memory ⭐ NEW

```
Workflow:
├─ Manual Trigger
├─ NVIDIA NIM Chat Model (meta/llama3-70b-instruct)
├─ Window Buffer Memory
├─ NVIDIA NIM AI Agent
└─ [Remembers conversation history]
```

**Setup:**
1. Follow Example 1 setup
2. Add "Window Buffer Memory" node
3. Configure: Context window size = 10
4. Connect: Memory → AI Agent (ai_memory)

**Test:**
- First message: `{{ "My name is Alice" }}`
- Second message: `{{ "What's my name?" }}`

**Result:** Agent remembers "Alice" from previous message!

**Benefits:**
- Multi-turn conversations
- Context retention
- Personalized responses

### Example 3: Agent with Tools ⭐ NEW - Intelligent Tool Calling

```
Workflow:
├─ Manual Trigger
├─ NVIDIA NIM Chat Model
├─ Calculator Tool
├─ Code Tool (JavaScript)
├─ HTTP Request Tool
├─ NVIDIA NIM AI Agent (ReAct pattern)
└─ [Agent automatically uses tools when needed]
```

**Setup:**
1. Follow Example 1 setup
2. Add "Calculator" node (from Tools → AI Tools)
3. Add "Code Tool" node
4. Add "HTTP Request Tool" node
5. Connect all tools → AI Agent (ai_tool)

**Test Queries:**
- `{{ "What is 127 * 384?" }}` → Uses Calculator
- `{{ "Run Python code to generate fibonacci sequence" }}` → Uses Code Tool
- `{{ "Fetch weather from wttr.in" }}` → Uses HTTP Request

**Result:** Agent **intelligently decides** which tool to use!

**Features:**
- Automatic tool selection
- Multi-step reasoning
- Chained tool calls

### Example 4: Production Agent ⭐ NEW - Complete Setup

```
Workflow:
├─ Webhook (for external apps)
├─ NVIDIA NIM Chat Model (meta/llama3-405b-instruct, temp: 0.7)
├─ Motorhead Memory (persistent across sessions)
├─ Calculator Tool
├─ Code Tool
├─ HTTP Request Tool (with your API endpoints)
├─ Your Custom Tool (n8n workflow as tool)
├─ NVIDIA NIM AI Agent (ReAct pattern)
│  ├─ System Message: "You are a helpful assistant..."
│  ├─ Max Iterations: 10
│  ├─ Return Intermediate Steps: true
│  └─ Verbose: true (for debugging)
└─ [Production-ready agent with tracking]
```

**Configuration:**

**1. Chat Model:**
- Model: `meta/llama3-405b-instruct` (most capable)
- Temperature: 0.7 (balanced creativity)
- Max Tokens: 2048

**2. Memory:**
- Use Motorhead for persistent memory
- Set session ID from webhook data

**3. Agent Options:**
- **System Message**: 
  ```
  You are a helpful AI assistant. Follow these rules:
  1. Always use tools when needed
  2. Be concise and accurate
  3. Ask clarifying questions if needed
  ```
- **Max Iterations**: 10 (prevents infinite loops)
- **Return Intermediate Steps**: true (for debugging)
- **Verbose**: true (detailed logs)

**4. Tools:**
- Add all capabilities your agent needs
- Each tool should have clear description

**Output:**
```json
{
  "output": "The answer is 42",
  "executionTime": 2347,
  "metadata": {
    "modelUsed": "ChatOpenAI",
    "memoryUsed": true,
    "toolsAvailable": ["calculator", "code", "http"],
    "iterations": 3
  },
  "intermediateSteps": [
    {
      "action": "calculator",
      "input": "25 * 47",
      "output": "1175"
    }
  ]
}
```

**Benefits:**
- Full execution tracking
- Detailed debugging info
- Production-grade error handling
- Graceful degradation

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
