/**
 * MCP-SSE Server Implementation
 * This file implements a Model Context Protocol server using Server-Sent Events
 * for bi-directional communication between the MCP server and clients.
 */

import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { sampleText } from "./resources/sample.js";

// Create a new MCP server instance with name and version
const server = new McpServer({
  name: "mcp-sse", // Name of the MCP server
  version: "1.0.0", // Version of the MCP server
  capabilities: {
    resources: {}, // Define resources capabilities (none defined yet)
    tools: {}, // Define tools capabilities (none defined yet)
  },
});

// Store SSE transports for multiple client connections
// This allows the server to maintain multiple concurrent connections
const transports: { [sessionId: string]: SSEServerTransport } = {};

// Initialize Express application
const app = express();
app.use(express.json()); // Enable JSON body parsing for POST requests

/**
 * SSE Endpoint (/sse)
 * Establishes a Server-Sent Events connection with the client.
 * Each client gets a unique transport with a sessionId.
 */
app.get("/sse", async (_: Request, res: Response) => {
  // Create a new SSE transport for this connection
  const transport = new SSEServerTransport("/messages", res);
  // Store the transport by its session ID for later access
  transports[transport.sessionId] = transport;

  // Clean up the transport when the connection closes
  res.on("close", () => {
    delete transports[transport.sessionId];
  });

  // Connect the transport to the MCP server
  await server.connect(transport);
});

/**
 * Messages Endpoint (/messages)
 * Handles incoming messages from clients via POST requests.
 * Messages are associated with a specific session using the sessionId query parameter.
 */
app.post("/messages", async (req: Request, res: Response) => {
  // Extract the session ID from the query parameters
  const sessionId = req.query.sessionId as string;
  // Look up the corresponding transport
  const transport = transports[sessionId];

  if (transport) {
    // If transport exists, forward the message to it
    await transport.handlePostMessage(req, res);
  } else {
    // If no transport exists for this session ID, return an error
    res.status(400).send("No transport found for sessionId");
  }
});

/**
 * DYNAMIC PROMPT GENERATION
 * Tool: story-outline-generator
 * Purpose: Generates a prompt for creating a structured story outline
 * Parameters:
 *   - genre: Type of story (e.g., "sci-fi", "fantasy", "thriller", "romance")
 *   - context: What the story is about (main premise, character, or setting)
 * Returns: A prompt for generating a structured story outline
 * Note: User must provide both required variables (genre, context).
 *       If any are missing, ask the user to provide the missing information.
 */
server.tool(
  "story-outline-generator",
  "Creates a prompt for generating a structured story outline.",
  {
    genre: z
      .string()
      .describe("Type of story (e.g., sci-fi, fantasy, thriller, romance)"),
    context: z
      .string()
      .describe(
        "What the story is about (main premise, character, or setting)"
      ),
  },
  async ({ genre, context }) => {
    console.error(
      `[Tool] Generating story outline for ${genre} story about: ${context}`
    );

    const prompt = `Create a structured outline for a ${genre} story about ${context}.

The outline should include:
1. Premise (1-2 sentences capturing the core concept)
2. Main Characters (brief descriptions, motivations, and arcs)
3. Setting (time, place, and relevant worldbuilding elements)
4. Plot Structure
   - Inciting Incident
   - Rising Action (key events)
   - Climax
   - Resolution
5. Key Themes and Motifs
6. Potential Plot Twists

Format the outline to be clear, creative, and cohesive, while incorporating genre-specific conventions of ${genre} fiction. Keep it short and concise less than 100 words.`;

    return {
      content: [
        {
          type: "text",
          text: prompt,
        },
      ],
    };
  }
);

/**
 * RESOURCE IMPLEMENTATION
 *
 * For read-only operations that provide data to the client, we use resources.
 * Resources are identified by URIs and are meant to be browsed and consumed
 * by clients without causing side effects.
 */

/**
 * Resource: sample-text
 * Purpose: Provides access to the content of the sample.txt file
 * URI: sample://text
 * Returns: The content of the sample.txt file
 */
server.resource("sample-text", "sample://text", async (uri) => {
  console.error(`[Resource] Providing sample text content`);
  try {
    console.error(`[Resource] Successfully loaded sample text content`);

    return {
      contents: [
        {
          uri: uri.href,
          text: sampleText,
        },
      ],
    };
  } catch (error) {
    console.error(`[Error] Failed to load sample text: ${error}`);
    return {
      contents: [
        {
          uri: uri.href,
          text: `Error: Failed to load sample text content. ${error}`,
        },
      ],
      isError: true,
    };
  }
});

// Export the Express app for Vercel serverless deployment
export default app;
