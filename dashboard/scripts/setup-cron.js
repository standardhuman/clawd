#!/usr/bin/env node

/**
 * Setup cron jobs for dashboard data collection
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function setupCronJobs() {
  console.log('Setting up cron jobs for dashboard data collection...');
  
  const scriptPath = path.join(__dirname, 'collect-data.js');
  const logPath = path.join(__dirname, '..', 'cron.log');
  
  // Create cron job entries
  const cronJobs = [
    // Every 15 minutes during business hours (8 AM - 8 PM)
    `*/15 8-20 * * * cd ${path.dirname(__dirname)} && node ${scriptPath} >> ${logPath} 2>&1`,
    
    // Every hour outside business hours
    `0 * * * * cd ${path.dirname(__dirname)} && node ${scriptPath} >> ${logPath} 2>&1`,
    
    // Daily backup at midnight
    `0 0 * * * cd ${path.dirname(__dirname)} && cp data.json data-backup-$(date +%Y%m%d).json`,
    
    // Weekly cleanup of old backups (keep last 7 days)
    `0 2 * * 0 find ${path.dirname(__dirname)} -name "data-backup-*.json" -mtime +7 -delete`
  ];
  
  // Create a temporary crontab file
  const tempCronFile = '/tmp/dashboard-cron';
  await fs.writeFile(tempCronFile, cronJobs.join('\n') + '\n');
  
  try {
    // Add to current user's crontab
    const { stdout, stderr } = await execAsync(`crontab -l 2>/dev/null || true; cat ${tempCronFile} | crontab -`);
    
    console.log('Cron jobs installed successfully:');
    cronJobs.forEach((job, i) => {
      console.log(`  ${i + 1}. ${job}`);
    });
    
    console.log(`\nLogs will be written to: ${logPath}`);
    console.log('\nTo view current crontab: crontab -l');
    console.log('To edit manually: crontab -e');
    
  } catch (error) {
    console.error('Failed to install cron jobs:', error);
    process.exit(1);
  }
}

// Also create a systemd service for more reliable scheduling
async function createSystemdService() {
  const serviceContent = `[Unit]
Description=Dashboard Data Collection Service
After=network.target

[Service]
Type=simple
User=${process.env.USER}
WorkingDirectory=${path.dirname(__dirname)}
ExecStart=/usr/bin/node ${path.join(__dirname, 'collect-data.js')}
Restart=on-failure
RestartSec=10
StandardOutput=append:${path.join(__dirname, '..', 'service.log')}
StandardError=append:${path.join(__dirname, '..', 'service-error.log')}

[Install]
WantedBy=multi-user.target
`;

  const serviceFile = `/etc/systemd/system/dashboard-data.service`;
  
  try {
    // Check if we can write to systemd directory
    await execAsync('sudo -n true 2>/dev/null');
    
    console.log('\nCreating systemd service for more reliable scheduling...');
    
    // Write service file
    await execAsync(`echo '${serviceContent.replace(/'/g, "'\"'\"'")}' | sudo tee ${serviceFile}`);
    
    // Create timer for periodic execution
    const timerContent = `[Unit]
Description=Run dashboard data collection every 15 minutes

[Timer]
OnCalendar=*:0/15
Persistent=true

[Install]
WantedBy=timers.target
`;

    const timerFile = `/etc/systemd/system/dashboard-data.timer`;
    await execAsync(`echo '${timerContent.replace(/'/g, "'\"'\"'")}' | sudo tee ${timerFile}`);
    
    // Reload systemd and enable
    await execAsync('sudo systemctl daemon-reload');
    await execAsync('sudo systemctl enable dashboard-data.timer');
    await execAsync('sudo systemctl start dashboard-data.timer');
    
    console.log('Systemd timer installed and started');
    console.log('To check status: sudo systemctl status dashboard-data.timer');
    console.log('To view logs: sudo journalctl -u dashboard-data.service');
    
  } catch (error) {
    console.log('\nNote: Could not create systemd service (may need sudo privileges)');
    console.log('Cron jobs have been installed instead.');
  }
}

// Run setup
async function main() {
  try {
    await setupCronJobs();
    await createSystemdService();
    
    // Run initial data collection
    console.log('\nRunning initial data collection...');
    const { updateDashboardData } = require('./collect-data.js');
    await updateDashboardData();
    
    console.log('\n✅ Setup complete!');
    console.log('Dashboard data will be automatically updated every 15 minutes.');
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupCronJobs, createSystemdService };