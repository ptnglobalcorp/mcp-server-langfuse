# Langfuse Prompt Management MCP Server

[Model Context Protocol](https://github.com/modelcontextprotocol) (MCP) Server for [Langfuse Prompt Management](https://langfuse.com/docs/prompts/get-started). This server allows you to access and manage your Langfuse prompts through the Model Context Protocol.

## Features

### MCP Prompt

This server implements the [MCP Prompts specification](https://modelcontextprotocol.io/docs/concepts/prompts) for prompt discovery and retrieval.

Only prompts with a `production` label in Langfuse are returned.

- `prompts/list`: List all available prompts

  - Optional cursor-based pagination
  - Returns prompt names and their required arguments, limitation: all arguments are assumed to be optional and do not include descriptions as variables do not have specification in Langfuse
  - Includes next cursor for pagination if there's more than 1 page of prompts

- `prompts/get`: Get a specific prompt

  - Transforms Langfuse prompts (text and chat) into MCP prompt objects
  - Compiles prompt with provided variables

### Tools

To increase compatibility with other MCP clients that do not support the prompt capability, the server also exports tools that replicate the functionality of the MCP Prompts.

- `get-prompts`: List available prompts

  - Optional `cursor` parameter for pagination
  - Returns a list of prompts with their arguments

- `get-prompt`: Retrieve and compile a specific prompt
  - Required `name` parameter: Name of the prompt to retrieve
  - Optional `arguments` parameter: JSON object with prompt variables

## Development

```bash
npm install

# build current file
npm run build

# test in mcp inspector
npx @modelcontextprotocol/inspector node ./build/index.js
```

## Usage

### Step 1: Build

```bash
npm install
npm run build
```

### Step 2: Add the server to your MCP servers:

#### Claude Desktop

Configure Claude for Desktop by editing your configuration file:

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "langfuse": {
      "command": "node",
      "args": ["<absolute-path>/build/index.js"],
      "env": {
        "LANGFUSE_PUBLIC_KEY": "your-public-key",
        "LANGFUSE_SECRET_KEY": "your-secret-key",
        "LANGFUSE_BASEURL": "https://cloud.langfuse.com"
      }
    }
  }
}
```

Make sure to replace the environment variables with your actual Langfuse API keys. The server will now be available to use in Claude Desktop.

#### Cursor

Add new server to Cursor:

- Name: `Langfuse Prompts`
- Type: `command`
- Command:
  ```bash
  LANGFUSE_PUBLIC_KEY="your-public-key" LANGFUSE_SECRET_KEY="your-secret-key" LANGFUSE_BASEURL="https://cloud.langfuse.com" node absolute-path/build/index.js
  ```

## Potential Improvements to Langfuse in order to better support MCP

- [ ] Add support for prompt variable descriptions
- [ ] Return available variables on the /prompts endpoint to reduce the number of requests
