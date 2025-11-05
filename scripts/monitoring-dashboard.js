#!/usr/bin/env ts-node
"use strict";
/**
 * Standalone Monitoring Dashboard Runner
 * Starts the monitoring dashboard server independently
 */
Object.defineProperty(exports, "__esModule", { value: true });
const monitoring_dashboard_1 = require("../src/monitoring-dashboard");
async function main() {
    console.log('📊 Starting OpenAI Agents Monitoring Dashboard...\n');
    try {
        // Start the dashboard
        monitoring_dashboard_1.monitoringDashboard.start();
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down monitoring dashboard...');
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down monitoring dashboard...');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('❌ Failed to start monitoring dashboard:', error);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
