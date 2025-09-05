#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Environment variables from MCPB user config
const API_URL = process.env.API_URL || 'https://polyneural.ai';
const API_KEY = process.env.API_KEY;
const DEBUG = process.env.DEBUG === 'true';
// Convert timeout from seconds to milliseconds (Claude passes seconds, we need ms)
const TIMEOUT = parseInt(process.env.TIMEOUT || '30') * 1000;

// Validate required configuration
if (!API_KEY) {
  console.error('ERROR: API_KEY environment variable is required');
  process.exit(1);
}

// Validate API key format
if (!API_KEY.startsWith('kg_')) {
  console.error('ERROR: API_KEY must start with "kg_" (PolyNeural.ai format)');
  process.exit(1);
}

if (DEBUG) {
  console.error('DEBUG: Starting PolyNeural.ai MCPB MCP Server (HTTP Bridge)');
  console.error('DEBUG: API_URL:', API_URL);
  console.error('DEBUG: API_KEY:', API_KEY ? 'kg_***' : 'NOT SET');
}

// HTTP request helper with proper timeout and error handling
async function makeHttpRequest(endpoint, method = 'POST', data = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  
  try {
    const url = `${API_URL}/mcp${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-Request-Timeout': TIMEOUT.toString(),
        'User-Agent': '@polyneural/mcpb/1.0.0'
      },
      signal: controller.signal
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    if (DEBUG) {
      console.error(`DEBUG: HTTP ${method} ${url}`);
      if (data) console.error('DEBUG: Request body:', JSON.stringify(data, null, 2));
    }
    
    const response = await fetch(url, options);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    if (DEBUG) {
      console.error('DEBUG: Response:', JSON.stringify(result, null, 2));
    }
    
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (DEBUG) {
      console.error('DEBUG: HTTP request error:', error);
    }
    
    // Provide more specific error messages
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${TIMEOUT}ms`);
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error(`Unable to connect to PolyNeural.ai API at ${API_URL}`);
    }
    
    throw error;
  }
}

// Create MCP Server
const server = new Server(
  {
    name: '@polyneural/mcpb',
    version: '1.0.0',
    description: 'PolyNeural.ai Knowledge Graph MCP Bundle via HTTP Bridge'
  },
  {
    capabilities: {
      tools: { list: true, call: true },
      resources: { subscribe: false, listChanged: false }
    }
  }
);

// Initialize handler
server.setRequestHandler(z.object({
  method: z.literal('initialize'),
  params: z.object({
    protocolVersion: z.string(),
    capabilities: z.object({}).optional(),
    clientInfo: z.object({
      name: z.string(),
      version: z.string()
    })
  })
}), async (request) => {
  if (DEBUG) {
    console.error('DEBUG: Handling initialize request');
  }
  
  // Forward to backend initialize endpoint
  const backendResponse = await makeHttpRequest('/initialize', 'POST', {
    jsonrpc: '2.0',
    id: request.params?.id || 1,
    method: 'initialize',
    params: request.params
  });
  
  return backendResponse.result;
});

// Tools list handler
server.setRequestHandler(z.object({
  method: z.literal('tools/list')
}), async (request) => {
  if (DEBUG) {
    console.error('DEBUG: Handling tools/list request');
  }
  
  const backendResponse = await makeHttpRequest('/tools/list', 'POST', {
    jsonrpc: '2.0',
    id: request.params?.id || 1,
    method: 'tools/list',
    params: {}
  });
  
  return backendResponse.result;
});

// Tool call handler
server.setRequestHandler(z.object({
  method: z.literal('tools/call'),
  params: z.object({
    name: z.string(),
    arguments: z.record(z.any()).optional()
  })
}), async (request) => {
  if (DEBUG) {
    console.error('DEBUG: Handling tool call:', request.params.name);
  }
  
  const backendResponse = await makeHttpRequest('/tools/call', 'POST', {
    jsonrpc: '2.0',
    id: request.params?.id || 1,
    method: 'tools/call',
    params: request.params
  });
  
  return backendResponse.result;
});

// Start server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    if (DEBUG) {
      console.error('DEBUG: PolyNeural.ai MCPB MCP Server started');
    }
  } catch (error) {
    console.error('ERROR: Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('ERROR: Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('ERROR: Uncaught exception:', error);
  process.exit(1);
});

// Start the server
main().catch(error => {
  console.error('ERROR: Failed to start server:', error);
  process.exit(1);
});
