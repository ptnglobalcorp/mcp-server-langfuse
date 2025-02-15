import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Create server instance
const server = new McpServer(
  {
    name: "langfuse-prompts",
    version: "1.0.0",
  },
  {
    capabilities: {
      prompts: {},
    },
  }
);

const PROMPTS = {
  "git-commit": {
    name: "git-commit",
    description: "Generate a Git commit message",
    arguments: [
      {
        name: "changes",
        description: "Git diff or description of changes",
        required: true,
      },
    ],
  },
  "explain-code": {
    name: "explain-code",
    description: "Explain how code works",
    arguments: [
      {
        name: "code",
        description: "Code to explain",
        required: true,
      },
      {
        name: "language",
        description: "Programming language",
        required: false,
      },
    ],
  },
};

// List available prompts
server.server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: Object.values(PROMPTS),
  };
});

// Get specific prompt
server.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const promptName = request.params.name;

  // if (!Object.keys(PROMPTS).includes(promptName)) {
  //   throw new Error(`Prompt not found: ${request.params.name}`);
  // }
  const prompt = PROMPTS[promptName as keyof typeof PROMPTS];

  if (promptName === "git-commit") {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a concise but descriptive commit message for these changes:\n\n${request.params.arguments?.changes}`,
          },
        },
      ],
    };
  }

  if (promptName === "explain-code") {
    const language = request.params.arguments?.language || "Unknown";
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Explain how this ${language} code works:\n\n${request.params.arguments?.code}`,
          },
        },
      ],
    };
  }

  throw new Error("Prompt implementation not found");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Langfuse Prompts MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
