#!/usr/bin/env node

/**
 * MCPB Bundle Validation Script
 * Validates that the bundle structure conforms to MCPB specification
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const REQUIRED_MANIFEST_FIELDS = [
  'name', 
  'version',
  'description',
  'author',
  'server'
];

const VERSION_FIELDS = ['manifest_version', 'dxt_version'];

const REQUIRED_SERVER_FIELDS = [
  'type',
  'entry_point',
  'mcp_config'
];

const REQUIRED_MCP_CONFIG_FIELDS = [
  'command',
  'args'
];

function validateManifest() {
  console.log('🔍 Validating MCPB manifest...');
  
  if (!existsSync('manifest.json')) {
    throw new Error('❌ manifest.json not found');
  }

  const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
  
  // Check version fields (either manifest_version or dxt_version for backward compatibility)
  const hasValidVersion = VERSION_FIELDS.some(field => manifest[field]);
  if (!hasValidVersion) {
    throw new Error('❌ Missing version field: either manifest_version or dxt_version required');
  }
  
  if (manifest.manifest_version && manifest.manifest_version !== '0.1') {
    throw new Error(`❌ Invalid manifest_version: ${manifest.manifest_version} (expected: 0.1)`);
  }
  
  if (manifest.dxt_version && manifest.dxt_version !== '0.1') {
    throw new Error(`❌ Invalid dxt_version: ${manifest.dxt_version} (expected: 0.1)`);
  }
  
  // Check required fields
  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (!manifest[field]) {
      throw new Error(`❌ Missing required field: ${field}`);
    }
  }
  
  // Check server configuration
  for (const field of REQUIRED_SERVER_FIELDS) {
    if (!manifest.server[field]) {
      throw new Error(`❌ Missing required server field: ${field}`);
    }
  }
  
  // Check MCP config
  for (const field of REQUIRED_MCP_CONFIG_FIELDS) {
    if (!manifest.server.mcp_config[field]) {
      throw new Error(`❌ Missing required mcp_config field: ${field}`);
    }
  }
  
  // Check entry point exists
  if (!existsSync(manifest.server.entry_point)) {
    throw new Error(`❌ Entry point file not found: ${manifest.server.entry_point}`);
  }
  
  // Validate name format
  if (!manifest.name.startsWith('@polyneural/')) {
    console.warn('⚠️ Name should follow npm scoped package format: @polyneural/mcpb');
  }
  
  // Validate compatibility
  if (manifest.compatibility) {
    if (manifest.compatibility.platforms && !Array.isArray(manifest.compatibility.platforms)) {
      throw new Error('❌ compatibility.platforms must be an array');
    }
  }
  
  console.log('✅ Manifest validation passed');
  return manifest;
}

function validatePackageJson() {
  console.log('🔍 Validating package.json...');
  
  if (!existsSync('package.json')) {
    throw new Error('❌ package.json not found');
  }

  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  
  if (pkg.name !== '@polyneural/mcpb') {
    console.warn(`⚠️ package.json name (${pkg.name}) doesn't match expected @polyneural/mcpb`);
  }
  
  const requiredDeps = ['@modelcontextprotocol/sdk'];
  for (const dep of requiredDeps) {
    if (!pkg.dependencies || !pkg.dependencies[dep]) {
      throw new Error(`❌ Missing required dependency: ${dep}`);
    }
  }
  
  console.log('✅ package.json validation passed');
  return pkg;
}

function validateServerCode(entryPoint) {
  console.log('🔍 Validating server code...');
  
  const serverCode = readFileSync(entryPoint, 'utf8');
  
  // Check for required imports
  if (!serverCode.includes('@modelcontextprotocol/sdk')) {
    throw new Error('❌ Server must import @modelcontextprotocol/sdk');
  }
  
  // Check for server creation
  if (!serverCode.includes('new Server(')) {
    throw new Error('❌ Server must create a new Server instance');
  }
  
  // Check for transport
  if (!serverCode.includes('StdioServerTransport')) {
    throw new Error('❌ Server must use StdioServerTransport');
  }
  
  console.log('✅ Server code validation passed');
}

function validateBundleStructure() {
  console.log('🔍 Validating bundle structure...');
  
  const requiredFiles = [
    'manifest.json',
    'package.json', 
    'server/index.js'
  ];
  
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      throw new Error(`❌ Required file missing: ${file}`);
    }
  }
  
  console.log('✅ Bundle structure validation passed');
}

async function main() {
  try {
    console.log('🚀 Starting MCPB Bundle Validation\n');
    
    validateBundleStructure();
    const manifest = validateManifest();
    validatePackageJson();
    validateServerCode(manifest.server.entry_point);
    
    console.log('\n🎉 All validations passed! Your MCPB bundle is ready.');
    console.log('\n📦 Bundle Summary:');
    console.log(`   Name: ${manifest.name}`);
    console.log(`   Version: ${manifest.version}`);  
    console.log(`   Description: ${manifest.description}`);
    console.log(`   Tools: ${manifest.tools?.length || 0} declared`);
    console.log(`   Platforms: ${manifest.compatibility?.platforms?.join(', ') || 'all'}`);
    
  } catch (error) {
    console.error('\n💥 Validation failed:', error.message);
    process.exit(1);
  }
}

main();
