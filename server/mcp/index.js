#!/usr/bin/env node

/**
 * DoSJE MCP Server — Stdio Executable
 * Connects the DoSJE MCP Server to standard I/O for local AI assistants:
 * - Antigravity
 * - Claude Desktop
 * - Cursor
 * - Claude Code
 *
 * Usage:
 *   node server/mcp/index.js
 */

const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { createDosjeMcpServer } = require('./dosjeMcpServer');
const { initDB } = require('../db/schema');

async function main() {
  // Ensure database tables exist
  initDB();

  const server = createDosjeMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error('🚀 DoSJE MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error running DoSJE MCP server:', err);
  process.exit(1);
});
