# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
