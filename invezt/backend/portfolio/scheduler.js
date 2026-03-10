/**
 * Scheduler for automatic price updates
 */
const cron = require('node-cron');
const updateAllPrices = require('./scripts/updatePrices');

// Run every hour at minute 0
cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running scheduled price update');
    await updateAllPrices();
}, {
    scheduled: true,
    timezone: "Asia/Colombo"
});

console.log('📅 Scheduler started - prices will update every hour');

module.exports = cron;