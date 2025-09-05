# PolyNeural.ai MCP Bundle (@polyneural/mcpb)

An MCP Bundle that provides AI agents with persistent memory through the PolyNeural.ai knowledge graph platform.

## Architecture

This MCP Bundle implements a **stdio MCP server** that bridges to the PolyNeural.ai backend HTTP MCP endpoints. This approach provides:

- ✅ **No code duplication** - Uses existing PolyNeural.ai backend MCP endpoints
- ✅ **Seamless authentication** - Forwards API keys via HTTP headers
- ✅ **Protocol translation** - Bridges stdio MCP ↔ HTTP MCP endpoints
- ✅ **Easy maintenance** - Single source of truth for MCP tools and logic

## Prerequisites

1. **PolyNeural.ai Backend Running**: The backend must be accessible (default: `http://localhost:8787`)
2. **Valid API Key**: You need a PolyNeural.ai API key (format: `kg_xxxxxxxx`)
3. **Node.js 16+**: Required for running the extension

## Installation

### Option 1: As MCPB Bundle (Recommended)

1. Download the latest `polyneural-mcpb.mcpb` file from the releases page
2. Install using your MCPB-compatible application:
   - **Claude Desktop**: Double-click the `.mcpb` file to install
   - **Other MCPB clients**: Follow your client's installation process
3. Configure your PolyNeural.ai API key in the bundle settings UI

### Option 2: Manual Installation

1. Install dependencies:
```bash
npm install
```

2. **For Claude Desktop**: Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "@polyneural/mcpb": {
      "command": "node",
      "args": ["/path/to/mcpb/server/index.js"],
      "env": {
        "API_URL": "http://localhost:8787",
        "API_KEY": "kg_your_api_key_here",
        "DEBUG": "false",
        "TIMEOUT": "30"
      }
    }
  }
}
```

## Configuration

The MCPB bundle supports these user configuration options (set via MCPB client UI or environment variables):

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `API_URL` | PolyNeural.ai backend URL | `http://localhost:8787` | No |
| `API_KEY` | Your PolyNeural.ai API key | - | **Yes** |
| `DEBUG` | Enable debug logging | `false` | No |
| `TIMEOUT` | Request timeout in seconds | `30` | No |

## Available Tools

Once installed, Claude will have access to these PolyNeural.ai knowledge graph tools:

### Core Operations
- `create_entities` - Store new knowledge entities
- `create_relations` - Create relationships between entities
- `search_nodes` - Search the knowledge graph
- `open_nodes` - Retrieve specific entities
- `read_graph` - Get the complete graph structure

### Advanced Operations
- `add_observations` - Add details to existing entities
- `delete_entities` - Remove entities
- `delete_relations` - Remove relationships
- `delete_observations` - Remove specific observations
- `get_entities_by_identifiers` - Bulk entity retrieval
- `get_entity_relationships` - Get entity connections
- `get_entities_by_date_range` - Time-based queries
- `get_recent_changes` - Recent activity tracking
- `get_trending_entities` - Popular entities
- `get_frecency_entities` - Frequency + recency ranking
- `search_with_frecency` - Smart search with ranking

## Testing

### Manual Testing
```bash
# Set environment variables and run
API_URL=http://localhost:8787 API_KEY=kg_your_key DEBUG=true npm start
```

### Create MCPB Bundle
```bash
# Install MCPB CLI (if not already installed)
npm install -g @anthropic-ai/mcpb

# Create the bundle
mcpb pack
```

### Integration Testing
```bash
# Run the integration test script
node test-integration.js
```

## Troubleshooting

### Common Issues

**Bundle won't start:**
- Verify the PolyNeural.ai backend is running: `curl http://localhost:8787/health`
- Check your API key format (must start with `kg_`)
- Enable debug mode in the bundle configuration

**No tools available in Claude:**
- Ensure Claude Desktop is restarted after installing the bundle
- Check the logs for authentication errors
- Verify the bundle was installed correctly

**Connection timeouts:**
- Increase the `TIMEOUT` value
- Check network connectivity to the backend
- Verify the backend MCP endpoints are accessible: `curl -H "Authorization: Bearer kg_your_key" http://localhost:8787/mcp/initialize`

### Debug Mode

Enable debug logging to see detailed communication:
```bash
DEBUG=true npm start
```

This will show:
- HTTP request details and responses
- Authentication headers
- MCP message routing
- Error details

## Architecture Details

```
MCP Client (stdio MCP client)
    ↕ (JSON-RPC over stdio)
@polyneural/mcpb MCP Server (HTTP bridge)
    ↕ (HTTP with Authorization headers)
PolyNeural.ai Backend (HTTP MCP endpoints)
    ↕ (Database operations)
Knowledge Graph Database
```

The MCPB server handles:
- stdio MCP server implementation
- HTTP requests to backend MCP endpoints
- Authentication header forwarding
- Request/response translation
- Error handling and logging

## Development

To modify this MCPB bundle:

1. **Server Logic**: Edit `server/index.js` (HTTP bridge implementation)
2. **Bundle Configuration**: Modify `manifest.json` for MCPB-specific settings
3. **Dependencies**: Update `package.json` as needed
4. **Build Bundle**: Run `mcpb pack` to create the `.mcpb` file

The beauty of this architecture is that all the actual MCP tool logic remains in the PolyNeural.ai backend - this bundle is purely an HTTP bridge.

## MCPB Compliance

This bundle follows the [MCPB specification](https://github.com/anthropics/mcpb):
- ✅ Valid `manifest.json` with `manifest_version: "0.1"`
- ✅ **Backward Compatible**: Also includes `dxt_version: "0.1"` for current Claude Desktop
- ✅ Proper MCP server implementation using `@modelcontextprotocol/sdk`
- ✅ User configuration via `user_config` field
- ✅ Platform compatibility declarations
- ✅ Proper error handling and timeout management
- ✅ Comprehensive tool and capability declarations

### Compatibility Note

The manifest includes both `manifest_version` (MCPB standard) and `dxt_version` (current Claude Desktop requirement) to ensure compatibility with both current and future versions of MCPB-compatible applications.
