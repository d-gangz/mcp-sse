# MCP-SSE: Model Context Protocol Server with Server-Sent Events

This project demonstrates a Model Context Protocol (MCP) server implementation using Server-Sent Events (SSE) for bi-directional communication between the MCP server and clients.

## What is MCP?

The Model Context Protocol (MCP) is a standardized way for AI assistants to interact with external tools and resources. This implementation showcases how to build an MCP server using SSE as the transport layer, enabling real-time, event-driven communication.

## Features

- **SSE Transport**: Implements the Server-Sent Events protocol for real-time, one-way communication from server to client
- **Bi-directional Communication**: Uses SSE for server-to-client events and HTTP POST for client-to-server messages
- **Session Management**: Maintains concurrent client connections with unique session IDs
- **Example Tool Implementation**: Includes a sample dynamic prompt generation tool
- **Example Resource Implementation**: Demonstrates how to expose static content as a resource
- **TypeScript Support**: Built with TypeScript for type safety and improved developer experience
- **Vercel Deployment**: Configured for easy deployment to Vercel

## Prerequisites

- Node.js 16 or higher
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/mcp-sse.git
cd mcp-sse
```

2. Install dependencies:

```bash
npm install
```

## Development

1. Build the TypeScript code:

```bash
npm run build
```

2. Start the server:

```bash
npm start
```

The server will start on the default port (usually 3000). You can access the SSE endpoint at `/sse` and the messages endpoint at `/messages`.

## Project Structure

- `src/index.ts`: Main server implementation with MCP server setup, SSE transport, and endpoints
- `src/resources/sample.ts`: Sample resource content
- `vercel.json`: Vercel deployment configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project dependencies and scripts

## Tools and Resources

This MCP server provides the following:

### Tools

- **story-outline-generator**: A tool that generates a structured prompt for creating story outlines based on genre and context.

### Resources

- **sample-text**: A sample text resource accessible via the `sample://text` URI.


## Deployment to Vercel

This project is configured for deployment to Vercel:

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. Log in to Vercel:

```bash
vercel login
```

3. Deploy the project:

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## API Endpoints

- `GET /sse`: Establishes an SSE connection with the client
- `POST /messages?sessionId=<sessionId>`: Handles incoming messages from clients for a specific session

## Configuration for Claude Desktop

Add this MCP server to Claude Desktop by configuring it in the settings:

```json
{
  "mcpServers": {
    "mcp-sse": {
      "url": "https://your-vercel-app-link.vercel.app/sse",
      "messageUrl": "https://your-vercel-app-link.vercel.app/messages"
    }
  }
}
```

## License

MIT License - See LICENSE file for details.
