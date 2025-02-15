import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListPromptsRequestSchema,
  ListPromptsResult,
  GetPromptRequestSchema,
  GetPromptResult,
} from "@modelcontextprotocol/sdk/types.js";
import { Langfuse, ChatPromptClient, TextPromptClient } from "langfuse";
import { extractVariables } from "./utils.js";

// Requires Environment Variables
const langfuse = new Langfuse({});

// Create MCP server instance with a "prompts" capability.
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
  "test-1": {
    name: "test-1",
    description: "A test prompt",
    arguments: [],
  },
  "movie-critic-chat-ai": {
    name: "movie-critic-chat-ai",
    description: "A chatbot that can answer questions about movies",
    arguments: [],
  },
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
server.server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
  try {
    const cursor = request.params?.cursor;
    const page = cursor ? Number(cursor) : 1;
    if (cursor !== undefined && isNaN(page)) {
      throw new Error("Cursor must be a valid number");
    }

    const res = await langfuse.api.promptsList({
      limit: 100,
      page,
      label: "production",
    });

    const resPrompts: ListPromptsResult["prompts"] = await Promise.all(
      res.data.map(async (i) => {
        const prompt = await langfuse.getPrompt(i.name, undefined, {
          cacheTtlSeconds: 0,
        });
        const variables = extractVariables(JSON.stringify(prompt.prompt));
        return {
          name: i.name,
          arguments: variables.map((v) => ({
            name: v,
            required: false,
          })),
        };
      })
    );

    return {
      prompts: resPrompts,
      nextCursor:
        res.meta.totalPages > page ? (page + 1).toString() : undefined,
    };
  } catch (error) {
    console.error("Error fetching prompts:", error);
    throw new Error("Failed to fetch prompts");
  }
});

// Implement getPrompt handler (ignoring the list endpoint for now)
server.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const promptName: string = request.params.name;
  const args = request.params.arguments || {};

  try {
    // Initialize Langfuse client and fetch the prompt by name.
    let compiledTextPrompt: string | undefined;
    let compiledChatPrompt: ChatPromptClient["prompt"] | undefined; // Langfuse chat prompt type

    try {
      // try chat prompt type first
      const prompt = await langfuse.getPrompt(promptName, undefined, {
        type: "chat",
      });
      if (prompt.type !== "chat") {
        throw new Error(`Prompt '${promptName}' is not a chat prompt`);
      }
      compiledChatPrompt = prompt.compile(args);
    } catch (error) {
      // fallback to text prompt type
      const prompt = await langfuse.getPrompt(promptName, undefined, {
        type: "text",
      });
      compiledTextPrompt = prompt.compile(args);
    }

    if (compiledChatPrompt) {
      const result: GetPromptResult = {
        messages: compiledChatPrompt.map((msg) => ({
          role: ["ai", "assistant"].includes(msg.role) ? "assistant" : "user",
          content: {
            type: "text",
            text: msg.content,
          },
        })),
      };
      return result;
    } else if (compiledTextPrompt) {
      const result: GetPromptResult = {
        messages: [
          {
            role: "user",
            content: { type: "text", text: compiledTextPrompt },
          },
        ],
      };
      return result;
    } else {
      throw new Error(`Failed to get prompt for '${promptName}'`);
    }
  } catch (error: any) {
    throw new Error(
      `Failed to get prompt for '${promptName}': ${error.message}`
    );
  }
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
