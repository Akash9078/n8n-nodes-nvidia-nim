# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2025-10-07

### Added - Image Analysis Capabilities 🖼️
- **NVIDIA NIM Image Analysis Node** ⭐ NEW: Analyze images with NVIDIA Vision Language Models
  - Support for Llama and Phi vision models
  - Accepts image URLs, base64 encoded images, or data URLs
  - OpenAI-compatible API format for image analysis
  - Dynamic model loading from live NVIDIA NIM API
  - Searchable model dropdown with automatic updates
  - Support for Llama and Phi vision models

### Features
- **Dual Node Architecture**: Separate nodes for text chat and image analysis
- **Flexible Image Input**: Accept URLs, base64 data, or data URLs (JPG, JPEG, PNG)
- **Vision Model Support**: Llama 3.2 Vision and Phi Vision models
- **Comprehensive Parameters**: Temperature, max tokens, top-p for image analysis
- **Proper Error Handling**: Validation for image formats and model availability

### Technical Details
- Added `NvidiaNimImage.node.ts` with OpenAI-compatible image analysis implementation
- Updated package.json to include new node and additional keywords
- Enhanced README with image analysis usage instructions
- Extended model filtering to include vision/language models
- Improved image input validation and processing

### Benefits
- ✅ Expand NVIDIA NIM capabilities beyond text to include vision
- ✅ Focus on Llama and Phi models for image analysis
- ✅ Flexible image input handling (URL, base64, data URL)
- ✅ Consistent API with existing chat completion node
- ✅ Automatic model discovery from NVIDIA NIM API

## [2.2.0] - 2025-01-11

### Removed - Major Simplification 🧹
- **LmChatNvidiaNim Node**: Removed AI Agent sub-node completely
- **LangChain Dependencies**: Removed @langchain/core and @langchain/openai (22 packages uninstalled)
- **Source Files**: Deleted LmChatNvidiaNim.node.ts and all compiled outputs

### Changed - Simplified Architecture
- **Single Node**: Package now contains only the main NVIDIA NIM chat node
- **Reduced Package Size**: 56.5 KB → 31.87 KB (43% reduction)
- **Cleaner Dependencies**: Only n8n-workflow peer dependency remains
- **Simplified README**: Reduced from 110 lines to 67 lines
- **Updated Description**: Reflects simplified chat completions focus

### Fixed - Message Validation
- **Empty Content Error**: Added validation to prevent empty message content
- **API Error Prevention**: Validates all messages have at least 1 character before API call
- **Better Error Messages**: Clear error messages indicating which message is empty

### Benefits
- ✅ 43% smaller package size (faster installation)
- ✅ Zero runtime dependencies (better performance)
- ✅ Simpler architecture (easier maintenance)
- ✅ Faster load time in n8n
- ✅ No LangChain version conflicts
- ✅ Clearer purpose and documentation

### Technical Details
- Package size: 31.87 KB (was 56.5 KB)
- Dependencies removed: 22 packages
- Files cleaned: Source, compiled, and documentation
- Message validation: Prevents API 400 errors for empty content

## [2.1.3] - 2025-01-11

### Added - Dynamic Model Loading 🚀
- **Dynamic Model Fetching**: Model selection now fetches available models from live NVIDIA NIM API
- **No More Hardcoded Lists**: Models are automatically updated without package updates
- **Searchable Dropdown**: New resourceLocator UI with search functionality
- **Manual ID Entry**: Option to enter model IDs directly for new/unlisted models
- **Smart Fallback**: Returns default models if API is unavailable
- **Model Filtering**: Automatically excludes embedding and reranking models, shows only chat completions

### Changed
- **NvidiaNim Node**: Model parameter converted from static options to resourceLocator
- **LmChatNvidiaNim Sub-Node**: Model parameter converted from string to resourceLocator
- **Model Display Names**: Auto-formatted for better readability (e.g., "Llama 3.1 8B Instruct")

### Technical Details
- Added `methods.listSearch.getModels()` to both nodes
- API endpoint: `GET {baseUrl}/models` with Bearer token authentication
- Regex validation for manual model IDs: `^[a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+$`
- Fallback models: llama-3.1 (8B, 70B, 405B), mixtral-8x7b
- Model name formatting: Capitalizes words, handles "8B", "128K" special cases

### Benefits
- ✅ Always up-to-date model list
- ✅ Better user experience with searchable dropdown
- ✅ Flexibility to use new models immediately
- ✅ Automatic filtering of irrelevant models
- ✅ Graceful fallback if API is unavailable

## [2.1.2] - 2025-10-07

### Fixed - Package Loading Issue 🔧
- **CRITICAL**: Removed `"main": "index.js"` from package.json
- **Root Cause**: n8n community nodes don't need a main entry point, this was causing "Class could not be found" error
- **Solution**: Removed unnecessary main field, n8n loads nodes directly from the `n8n.nodes` configuration

## [2.1.1] - 2025-10-07 ⚠️ Still had loading issue

### Fixed - Package Loading Issue 🔧
- **CRITICAL**: Removed NVIDIA NIM AI Agent node from package distribution
- **Root Cause**: Community packages cannot include complex LangChain agent dependencies
- **Issue**: Package published successfully to npm but failed to load in n8n with "Class could not be found" error
- **Solution**: Use n8n's built-in AI Agent node instead

### Changed - Architecture Simplification
- **Removed from package.json**: `dist/nodes/NvidiaNim/NvidiaNimAgent.node.js`
- **Package now includes only**:
  - `NVIDIA NIM` node (simple chat completions)
  - `NVIDIA NIM Chat Model` sub-node (for AI Agents)

### Removed - Codebase Cleanup 🧹
- **Source Files**: Deleted `NvidiaNimAgent.node.ts` (345 lines, no longer needed)
- **Compiled Files**: Removed all NvidiaNimAgent compiled outputs from dist/
- **Documentation**: Removed `docs/` folder (9 files, ~183KB of development/research docs)
- **Dependencies**: Removed unused `langchain` package (saved 5 packages)
  - Kept only essential: `@langchain/core` and `@langchain/openai`

### Improved - Visual Design ✨
- **New Icon**: Completely redesigned `nvidia-nim.svg` with modern, professional look
  - Enhanced NVIDIA eye logo with depth and shadows
  - Added neural network connection pattern
  - Integrated AI chip icon for inference representation
  - Improved color gradients and glow effects
  - Better scalability and contrast
  - Professional "NIM" badge design

### Recommended Usage
Use the **NVIDIA NIM Chat Model** sub-node with **n8n's built-in AI Agent**:
```
Workflow:
├─ NVIDIA NIM Chat Model ← Configure your NVIDIA model
├─ AI Agent (n8n built-in) ← Handles tools, memory, orchestration
└─ [Output]
```

### Why This Change?
- **Community Package Limitations**: n8n community packages cannot bundle complex agent orchestration logic
- **Dependency Resolution**: LangChain agent imports (`langchain/agents`, `@langchain/core/prompts`) fail to load in n8n runtime
- **Better Architecture**: n8n's built-in AI Agent is designed for this - community packages should provide models/tools
- **Simpler for Users**: One clear path, no confusion about which agent to use

### Benefits
- ✅ Package loads successfully in n8n
- ✅ Clearer architecture and user experience  
- ✅ Access to all n8n AI Agent features (tools, memory, etc.)
- ✅ Better maintained by n8n core team
- ✅ Significantly smaller package size (~37KB dist)
- ✅ Fewer dependencies to install and resolve
- ✅ Cleaner, more maintainable codebase
- ✅ Professional, modern icon design

### Documentation Updated
- README examples now show correct architecture
- Removed references to custom Agent node
- Clarified sub-node pattern with built-in AI Agent
- Updated package description

### Technical Details
- Deleted NvidiaNimAgent source and compiled files
- Sub-node pattern (`supplyData()`) works correctly for community packages
- Agent orchestration handled by n8n's built-in nodes
- Added `docs/` to `.gitignore` to prevent future bloat

## [2.1.0] - 2025-10-07 ⚠️ DEPRECATED - Package Loading Error

### Added - AI Agent Node 🤖⭐
- **NVIDIA NIM AI Agent Node** ⭐ NEW: Complete AI Agent implementation with ReAct pattern
  - Full LangChain Agent integration with `createToolCallingAgent`
  - Visual connection architecture (Model, Memory, Tools)
  - Supports multiple tools via n8n's ai_tool connection type
  - Optional memory integration via ai_memory connection
  - Required chat model connection via ai_languageModel
  - Rich output with execution metadata and tracking
  - Intermediate steps logging for debugging
  - Comprehensive error handling with graceful degradation
  - Support for max iterations and verbose logging
  - Fully typed TypeScript implementation

### Features
- **ReAct Pattern**: Industry-standard Reasoning + Acting agent loop
- **Tool Calling**: Automatically selects and uses connected tools
- **Memory Management**: Optional conversation history via Memory nodes
- **Execution Tracking**: Tracks execution time, iterations, and tool usage
- **Error Recovery**: Graceful error handling with continueOnFail support
- **Verbose Mode**: Detailed logging for debugging agent behavior
- **Flexible Configuration**: Customizable system message and max iterations

### Architecture
```
┌─────────────────────────────┐
│  NVIDIA NIM Chat Model      │ ← Configure AI model
└─────────────┬───────────────┘
              │ ai_languageModel (required)
              ▼
┌─────────────────────────────┐
│  NVIDIA NIM AI Agent        │ ← New node!
│  (ReAct Pattern)            │
├─ ai_memory (optional)       │ ← Window Buffer Memory, etc.
├─ ai_tool (optional, multi)  │ ← Calculator, Code, HTTP, etc.
└─────────────┬───────────────┘
              │ main
              ▼
         [Agent Output]
```

### Best Practices Implemented
- Follows n8n's official AI Agent architecture patterns
- Based on LangChain's createToolCallingAgent (2025 standard)
- Proper connection type validation
- Type-safe error handling (TypeScript strict mode)
- ESLint compliance with proper disable comments

### Documentation
- Complete implementation with 300+ lines of production-ready code
- Inline comments explaining agent architecture
- Full TypeScript type safety
- Follows n8n INodeType interface specifications

### Use Cases
- **Conversational AI**: Build chatbots with memory and context
- **Task Automation**: Agents that can use tools to accomplish complex tasks
- **Research Assistants**: Connect web search tools for information gathering
- **Code Assistants**: Use code execution tools for programming help
- **Multi-Step Workflows**: Agents that chain multiple tool calls intelligently

### Technical Details
- Uses `AgentExecutor` with tool calling support
- Prompt template with placeholders: `{chat_history}`, `{input}`, `{agent_scratchpad}`
- Handles parsing errors automatically
- Returns structured JSON with metadata
- Supports batch processing of multiple items
- Compatible with all n8n AI sub-nodes (Memory, Tools, Chat Models)

### Fixed
- ESLint errors: Removed color property (not allowed in community nodes)
- TypeScript strict mode: Added proper type guards for error handling
- Connection validation: Comprehensive validation for all connection types
- Package configuration: Added NvidiaNimAgent.node.js to package.json

### Research & Development
- 15,000+ lines of comprehensive research documentation created
- Best practices from LangChain, LangGraph, and n8n official patterns
- Analyzed 30+ code examples from official LangGraph.js documentation
- Validated against TypeScript/JavaScript patterns (not just Python)

## [2.0.4] - 2025-01-10

### Fixed
- **System Role Error**: Removed 'system' role option from messages (NVIDIA NIM API doesn't support system role)
- **API Error**: Fixed "System role not supported" 500 error

### Added
- **System Prompt Option**: Added 'System Prompt' to Additional Options
  - System instructions are now prepended to the first user message
  - Workaround for APIs that don't support system role

### Changed
- **Message Roles**: Only 'user' and 'assistant' roles are now available
- **System Instructions**: Use the new 'System Prompt' field in Additional Options instead of system role

## [2.0.3] - 2025-01-10

### Performance Improvements
- **Optimized additionalOptions handling**: Replaced multiple if statements with efficient loop using object mapping
- **Reduced code duplication**: Cleaner, more maintainable code structure

### Removed - Code Cleanup
- **Redundant documentation files**: Removed 8 duplicate/outdated MD files (AI_AGENT_GUIDE.md, BUG_FIX_SUMMARY.md, FUNCTION_CALLING_GUIDE.md, INDEX.md, PROJECT_COMPLETE.md, PROJECT_OVERVIEW.md, SETUP_GUIDE.md, VISUAL_SUMMARY.md)
- **Temporary scripts**: Removed fix-api-urls.ps1 and fix_urls.py (one-time utilities no longer needed)
- **Backup files**: Removed NvidiaNim.node.ts.backup
- **Unused files**: Removed NvidiaNim.node.json (not used by n8n)

### Changed
- **Updated README.md**: Replaced with v2 architecture documentation
- **Smaller package size**: Reduced from 13.9 kB to ~10 kB by removing redundant files

## [2.0.2] - 2025-01-10

### Removed
- **Tools Functionality**: Removed tools/function calling from main node (use Chat Model sub-node with AI Agent for advanced features)
- **Tool Choice Parameter**: Removed tool_choice parameter
- **Tool Role**: Removed 'tool' role option from messages

### Fixed
- **Empty Messages Validation**: Added proper validation to ensure at least one message is provided
- **API Error**: Fixed "List should have at least 1 item after validation" error by validating messages array

### Changed
- **Simplified Main Node**: Main node is now for simple chat completions only
- **Description Updated**: Changed description to reflect simpler use case
- **For Advanced Features**: Use the "NVIDIA NIM Chat Model" sub-node with n8n's AI Agent for tools, memory, and function calling

## [2.0.1] - 2025-01-10

### Fixed
- **Parameter Dependencies**: Removed `displayOptions` from fixedCollection parent parameters that referenced removed `resource` and `operation` fields
- **Removed Legacy Fields**: Cleaned up old completion and embedding parameter definitions
- **Build Errors**: Fixed "Could not resolve parameter dependencies. Max iterations reached!" error

### Changed
- Main node now always shows Messages, Tools, and Tool Choice parameters (no conditional display)

## [2.0.0] - 2025-01-10

### 🚨 BREAKING CHANGE - New Visual AI Agent Architecture

This is a major architectural change introducing n8n's visual sub-node pattern for AI Agents.

### Added - Visual Sub-Node Architecture 🎨
- **NVIDIA NIM Chat Model Sub-Node** ⭐ NEW: Connect visually to AI Agents and Chains
  - Outputs `NodeConnectionTypes.AiLanguageModel`
  - Compatible with n8n's built-in AI Agent node
  - LangChain integration via `ChatOpenAI` class
  - Visual drag-and-drop connections
  - Appears in "Chat Models (Recommended)" category
  
- **LangChain Dependencies**: Full integration with LangChain ecosystem
  - `@langchain/openai`: ^0.6.14
  - `@langchain/core`: ^0.3.78
  - `langchain`: ^0.3.35

### Changed - Architecture Redesign
- **Chat Model is now a Sub-Node**: Use separate "NVIDIA NIM Chat Model" node
- **Connect to n8n's AI Agent**: Visual workflow building with sub-nodes
- **Memory & Tools Support**: Works with n8n's built-in Memory and Tool nodes
- **Production Ready**: Follows established n8n AI Agent patterns

### Migration Guide (v1.x → v2.0)

**OLD (v1.x - Parameter-Based):**
```
NVIDIA NIM Node
├─ Messages (parameter)
├─ Tools (parameter)
└─ Model (parameter)
```

**NEW (v2.0 - Visual Sub-Nodes):**
```
Workflow Canvas:
┌─────────────────────┐
│  NVIDIA NIM Chat    │
│  Model              │◄─── Configure model
└──────────┬──────────┘
           │ ai_languageModel
           ▼
┌─────────────────────┐
│  AI Agent           │◄─── n8n built-in
│  (n8n built-in)     │
├─ Memory (optional)  │◄─── Visual connections
├─ Tools (optional)   │
└─────────────────────┘
```

### Benefits
- ✅ Visual workflow building
- ✅ Compatible with all n8n AI nodes
- ✅ Modular architecture (swap Chat Models easily)
- ✅ Memory persistence via n8n's Memory nodes
- ✅ Tool use via n8n's Tool nodes
- ✅ Better debugging (see data flow)
- ✅ Established n8n patterns
- ✅ LangChain ecosystem access

### Example Usage
1. Add "NVIDIA NIM Chat Model" node
2. Configure model (e.g., `meta/llama3-8b-instruct`)
3. Add n8n's "AI Agent" node
4. Connect Chat Model → AI Agent (ai_languageModel)
5. Optionally add Memory nodes → AI Agent
6. Optionally add Tool nodes → AI Agent
7. Execute workflow!

### Breaking Changes
- ⚠️ Previous parameter-based tool configuration no longer supported
- ⚠️ Use n8n's Tool nodes instead of tools parameter
- ⚠️ Chat Model must be connected as sub-node
- ⚠️ Workflows from v1.x will need restructuring

### Documentation
- Updated README with new architecture
- Visual connection examples
- Sub-node usage guide
- Migration guide from v1.x

## [1.2.0] - 2025-01-10

### Added - Production AI Agent Support 🤖
- **Assistant Role Re-added**: Essential for multi-turn conversations with tool calls
- **Tool Role Support** ⭐ NEW: Proper OpenAI-compatible tool message handling
- **Tool Call ID Field**: Link tool execution results to specific tool calls
- **Tool Name Field**: Specify which function was executed
- **Enhanced Message Structure**: Proper handling of assistant messages with tool_calls
- **Comprehensive AI_AGENT_GUIDE.md**: 400+ line production guide with:
  - Message role explanations (system, user, assistant, tool)
  - Complete agent workflow patterns
  - Memory management best practices (rolling window, summarization, smart memory formation)
  - n8n workflow implementation patterns
  - Token optimization strategies
  - Production checklist
  - Complete working examples
  - Troubleshooting guide

### Fixed
- **Tool Workflow Compatibility**: Messages now properly structured for multi-turn tool calling
- **Conversation History**: Assistant role enables proper conversation context
- **Tool Response Handling**: Tool messages properly formatted with required fields

### Technical Details
- Tool messages now include `tool_call_id` and `name` fields as per OpenAI spec
- Message building logic updated to conditionally add tool-specific fields
- Supports complete agent loop: User → Assistant (tool calls) → Tool (results) → Assistant (final answer)

### Best Practices Implemented
Based on 2025 industry standards from:
- Anthropic's Context Engineering research
- Mem0's Memory Management guide
- OpenAI's Function Calling specification
- LangGraph's Agent Architecture patterns

## [1.1.0] - 2025-01-10

### Added - Function Calling / Tool Use Support 🚀
- **NEW**: Function calling (tool use) capabilities for AI agents
- **Tools Parameter**: Define custom functions the model can call
- **Tool Choice Parameter**: Control how the model uses tools (auto, none, required)
- **OpenAI-Compatible API**: Follows OpenAI function calling specification
- **JSON Schema Support**: Define function parameters using standard JSON Schema
- **Multi-Tool Support**: Model can choose from multiple available tools
- **Tool Call Parsing**: Response includes structured tool_calls for execution
- **MCP Ready**: Foundation for Model Context Protocol integration

### Features
- Add multiple tools/functions to a single chat request
- Define function name, description, and parameters (JSON Schema)
- Control tool usage with tool_choice: auto/none/required
- Model intelligently decides when to call functions
- Structured JSON output for tool calls
- Support for parallel tool calls (model-dependent)
- Full parameter validation and error handling

### Documentation
- Comprehensive FUNCTION_CALLING_GUIDE.md with:
  - What is function calling and how it works
  - Step-by-step setup instructions
  - 4 detailed examples (weather, database, email, multi-function)
  - Best practices for tool definitions
  - n8n workflow patterns for processing tool calls
  - JSON Schema reference
  - Troubleshooting guide
  - MCP integration guidance

### Use Cases Enabled
- 🤖 **AI Agents**: Build autonomous agents that can take actions
- 🔍 **API Integration**: Models can query external APIs
- 📊 **Data Access**: Enable natural language database queries
- 📧 **Automation**: Send emails, notifications, create tickets
- 🌐 **Web Actions**: Search, scrape, and interact with web services
- 🧮 **Calculations**: Perform complex computations and analysis

### Technical Details
- Added `tools` parameter as fixedCollection (multiple tool definitions)
- Added `tool_choice` parameter with options: auto, none, required
- Tool definitions include: name, description, parameters (JSON Schema)
- Request body includes tools array when defined
- Response includes tool_calls array when model wants to use tools
- Follows OpenAI ChatCompletionMessageToolCall specification

### Compatibility
- Works with NVIDIA NIM models supporting function calling
- Compatible with Llama 3.1, 3.2, 4, Mistral, and other tool-enabled models
- OpenAI-compatible API ensures broad model support

## [1.0.1] - 2025-01-04

### Fixed
- **CRITICAL**: Fixed "Invalid URL" error that prevented all API requests from working
- Added `baseURL` parameter to all API calls (`requestWithAuthentication`)
- Now properly retrieves base URL from credentials for each request
- Affected endpoints: chat completions, text completions, embeddings, and model listing

### Technical Details
- All four API endpoints now include: `baseURL: (await this.getCredentials('nvidiaNimApi')).baseUrl as string`
- This ensures proper URL construction: `https://integrate.api.nvidia.com/v1/chat/completions`
- Users should update immediately if experiencing connection issues

## [1.0.0] - 2025-10-04

### Added
- Initial release of n8n-nodes-nvidia-nim
- Chat completion support with conversation context
- Text completion support for prompt-based generation
- Embedding generation for semantic search
- Model listing to discover available NVIDIA models
- Full parameter control (temperature, top-p, penalties, etc.)
- Comprehensive error handling and validation
- Professional node icon and branding
- Complete TypeScript implementation
- n8n credential system integration
- NVIDIA NGC API key authentication
- Support for multiple NVIDIA NIM models:
  - meta/llama3-8b-instruct
  - meta/llama3-70b-instruct
  - mistralai/mixtral-8x7b-instruct-v0.1
  - nvidia/nv-embed-v1
  - And more

### Features
- OpenAI-compatible API interface
- Streaming support (when available)
- Multi-message conversation handling
- Stop sequence configuration
- Token limit controls
- Temperature and sampling controls
- Frequency and presence penalties

### Documentation
- Comprehensive README with usage examples
- Installation instructions for multiple methods
- Configuration guide for NVIDIA credentials
- Example workflows and use cases
- API reference documentation

### Developer Experience
- TypeScript source code
- ESLint configuration for code quality
- Prettier formatting
- Build scripts for compilation
- Development watch mode
- Professional package structure

## [Unreleased]

### Planned Features
- Streaming response support in n8n UI
- Additional model-specific parameters
- Batch processing optimization
- Cost estimation and tracking
- Response caching options
- Multi-model comparison workflows
- Advanced prompt templates
- Token usage statistics
- Rate limiting handling

---

For more information, visit [GitHub Repository](https://github.com/yourusername/n8n-nodes-nvidia-nim)
