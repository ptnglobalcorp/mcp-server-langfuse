# Langfuse Prompt Management MCP

Model Context Protocol (MCP) Server for Langfuse Prompt Management. This server allows you to access and manage your Langfuse prompts through the Model Context Protocol.

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

## Todo

- [x] Get prompt
- [x] List "production" prompts
- [x] Insert variables into prompts
- [ ] Export prompts as tools to increase compatibility with other MCP clients that do not support prompt capability
- [ ] Filter prompts by tag on list
- [ ] Set label that is to be used globally

## Potential Improvements to Langfuse in order to better support MCP

- [ ] Add support for prompt variable descriptions
- [ ] Return available variables on the /prompts endpoint to reduce the number of requests
