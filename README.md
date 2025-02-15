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

## Todo

- [x] Get prompt
- [] List "production" prompts
- [] Insert variables into prompts
- [] Filter prompts by tag on list
- [] Set label that is to be used globally
