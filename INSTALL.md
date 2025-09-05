# Installation Guide for @polyneural/mcpb

## Current Compatibility Status (September 2025)

🚫 **Claude Desktop** (Current): Uses legacy DXT format (requires `dxt_version` field)
✅ **Future MCPB Apps**: Will use MCPB standard (requires `manifest_version` field)

**Our Solution**: The bundle includes both fields for maximum compatibility!

## Installation Options

### Option 1: Claude Desktop (Current) 

1. **Download**: Get `polyneural-mcpb.mcpb` from releases
2. **Install**: Double-click the `.mcpb` file 
3. **Configure**: Set your PolyNeural.ai API key when prompted
4. **Use**: Access 16 knowledge graph tools in Claude

### Option 2: Manual Installation (All Apps)

1. **Clone/Download** this repository
2. **Install dependencies**: `npm install`
3. **Configure** your MCP client with:
   ```json
   {
     "mcpServers": {
       "@polyneural/mcpb": {
         "command": "node",
         "args": ["/path/to/mcpb/server/index.js"],
         "env": {
           "API_URL": "https://api.polyneural.ai",
           "API_KEY": "kg_your_api_key_here",
           "DEBUG": "false",
           "TIMEOUT": "30"
         }
       }
     }
   }
   ```

## Configuration

### Required Settings
- **API_KEY**: Your PolyNeural.ai API key (format: `kg_xxxxxxxx`)

### Optional Settings
- **API_URL**: API endpoint (default: `https://api.polyneural.ai`)
- **DEBUG**: Enable debug logging (default: `false`)
- **TIMEOUT**: Request timeout in seconds (default: `30`)

## Troubleshooting

### "Extension Preview Failed" (Claude Desktop)
This usually means:
1. **Missing API Key**: Ensure your PolyNeural.ai API key is set
2. **Invalid Format**: API key must start with `kg_`
3. **Network Issues**: Check connection to `api.polyneural.ai`

### "No tools available"
1. **Restart** your MCP client after installation
2. **Check logs** for authentication errors
3. **Verify** the PolyNeural.ai backend is accessible

### Debug Mode
Enable debug logging to see detailed communication:
```bash
DEBUG=true npm start
```

## Available Tools

Once installed, you'll have access to 16 knowledge graph tools:

### Core Operations
- `create_entities` - Store new knowledge entities
- `create_relations` - Create relationships between entities  
- `search_nodes` - Search the knowledge graph
- `open_nodes` - Retrieve specific entities
- `read_graph` - Get complete graph structure

### Advanced Operations  
- `add_observations` - Add details to existing entities
- `delete_entities` - Remove entities
- `delete_relations` - Remove relationships
- `get_entities_by_identifiers` - Bulk entity retrieval
- `get_entity_relationships` - Get entity connections
- `get_recent_changes` - Recent activity tracking
- `get_trending_entities` - Popular entities
- `search_with_frecency` - Smart search with ranking

## Support

- **Issues**: [GitHub Issues](https://github.com/PolyNeural-ai/mcpb/issues)
- **Documentation**: [docs.polyneural.ai](https://docs.polyneural.ai)
- **Email**: support@polyneural.ai

---

**Note**: This bundle is designed to work with both current Claude Desktop (DXT format) and future MCPB-compliant applications. As MCPB support rolls out, the experience will only get better!
