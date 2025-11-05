#!/usr/bin/env ts-node
// Search historical agent enhancements in Pinecone
// Usage: pnpm search-enhancements "sentiment analysis"

import { searchPineconeRecords } from '../orchestrator/pinecone-integration';

const PINECONE_INDEX = "agent-enhancements";
const PINECONE_NAMESPACE = "social-media-agent";

async function searchEnhancements() {
  const query = process.argv[2];

  if (!query) {
    console.log("❌ Usage: pnpm search-enhancements \"your query here\"");
    console.log("📝 Example: pnpm search-enhancements \"sentiment analysis\"");
    process.exit(1);
  }

  console.log(`🔍 Searching for: "${query}"`);
  console.log("📍 Index: agent-enhancements");
  console.log("🏷️  Namespace: social-media-agent");
  console.log("---");

  try {
    const results = await searchPineconeRecords(query);

    if (results.length === 0) {
      console.log("📭 No results found. Try different search terms.");
      return;
    }

    console.log(`🎯 Found ${results.length} enhancement(s):`);
    console.log("");

    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.id}`);
      console.log(`   📊 Score: ${(result.score * 100).toFixed(1)}%`);
      if (result.metadata) {
        console.log(`   🎯 Objective: ${result.metadata.objective || 'N/A'}`);
        console.log(`   🔗 Dependencies: ${result.metadata.depends_on?.join(', ') || 'None'}`);
        console.log(`   📅 Created: ${result.metadata.timestamp || 'Unknown'}`);
      }
      console.log("");
    });

    // Provide follow-up suggestions
    console.log("💡 Try these related searches:");
    const suggestions = [
      `"${query}" dependencies`,
      `"${query}" implementation`,
      `"${query}" sources`,
      `"${query}" validation`
    ];
    suggestions.forEach(suggestion => console.log(`   • ${suggestion}`));

  } catch (error) {
    console.error("❌ Search failed:", error);
    console.log("");
    console.log("🔧 Troubleshooting:");
    console.log("   1. Ensure Pinecone MCP is properly configured");
    console.log("   2. Check your Pinecone API key and environment");
    console.log("   3. Verify the index 'agent-enhancements' exists");
    console.log("   4. Confirm namespace 'social-media-agent' is correct");
  }
}

// Advanced search options (uncomment to use)
/*
async function advancedSearch(options: {
  query: string;
  filterByStatus?: 'planned' | 'in_progress' | 'done';
  minScore?: number;
  limit?: number;
}) {
  // Implementation for filtered searches
}
*/

if (require.main === module) {
  searchEnhancements();
}
