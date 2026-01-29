/**
 * Indodax API Load Testing using k6 - SIMPLIFIED VERSION
 *
 * Configuration:
 * - Virtual Users: 5
 * - Spawn Rate: 10 users/second (ramp-up in 0.5s)
 * - Duration: 30 seconds
 * - Target: Indodax Public API (https://indodax.com/api)
 *
 * Test Coverage: ALL 7 endpoints tested in each iteration
 *
 * Run Command with HTML Dashboard:
 * K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=reports/dashboard.html k6 run tests/indodax_load_test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric for error tracking
const errorRate = new Rate('errors');

// Test configuration
export const options = {
    // Stages define the load pattern
    stages: [
        { duration: '0.5s', target: 5 },  // Ramp-up to 5 users in 0.5s (10 users/sec spawn rate)
        { duration: '29.5s', target: 5 }, // Stay at 5 users for remaining time (total 30s)
    ],

    // Thresholds define pass/fail criteria
    thresholds: {
        'http_req_duration': ['p(95)<1000'], // 95% of requests should be below 1s
        'http_req_failed': ['rate<0.05'],    // Error rate should be less than 5%
        'errors': ['rate<0.05'],             // Custom error rate should be less than 5%
    },

    // Additional options
    userAgent: 'k6-load-test/1.0',
    insecureSkipTLSVerify: true,
};

// Base URL
const BASE_URL = 'https://indodax.com/api';

/**
 * Setup function - runs once before all VUs start
 */
export function setup() {
    console.log('========================================');
    console.log('   Indodax API Load Test with k6');
    console.log('========================================');
    console.log('Configuration:');
    console.log('  Virtual Users    : 5');
    console.log('  Spawn Rate       : 10 users/second');
    console.log('  Test Duration    : 30 seconds');
    console.log('  Target API       : https://indodax.com/api');
    console.log('  Endpoints Tested : ALL 7 endpoints per iteration');
    console.log('========================================\n');

    return { startTime: new Date().toISOString() };
}

/**
 * Main test function - Tests ALL 7 endpoints in each iteration
 * This is SIMPLER and tests every endpoint every time
 */
export default function(data) {
    // Test ALL 7 endpoints in sequence
    testServerTime();
    testTickerBtcIdr();
    testTickerEthIdr();
    testTickerUsdtIdr();
    testPairs();
    testPriceIncrements();
    testSummaries();

    // Short pause between iterations (1 second)
    sleep(1);
}

/**
 * Test 1: Server Time
 */
function testServerTime() {
    const response = http.get(`${BASE_URL}/server_time`, {
        tags: { name: 'GET /api/server_time' }
    });

    const passed = check(response, {
        'server_time: status is 200': (r) => r.status === 200,
        'server_time: has server_time': (r) => r.json('server_time') !== undefined,
        'server_time: has timezone': (r) => r.json('timezone') !== undefined,
    });

    errorRate.add(!passed);
}

/**
 * Test 2: BTC/IDR Ticker
 */
function testTickerBtcIdr() {
    const response = http.get(`${BASE_URL}/ticker/btcidr`, {
        tags: { name: 'GET /api/ticker/btcidr' }
    });

    const passed = check(response, {
        'ticker_btcidr: status is 200': (r) => r.status === 200,
        'ticker_btcidr: has ticker': (r) => r.json('ticker') !== undefined,
        'ticker_btcidr: has last price': (r) => r.json('ticker.last') !== undefined,
    });

    errorRate.add(!passed);
}

/**
 * Test 3: ETH/IDR Ticker
 */
function testTickerEthIdr() {
    const response = http.get(`${BASE_URL}/ticker/ethidr`, {
        tags: { name: 'GET /api/ticker/ethidr' }
    });

    const passed = check(response, {
        'ticker_ethidr: status is 200': (r) => r.status === 200,
        'ticker_ethidr: has ticker': (r) => r.json('ticker') !== undefined,
    });

    errorRate.add(!passed);
}

/**
 * Test 4: USDT/IDR Ticker
 */
function testTickerUsdtIdr() {
    const response = http.get(`${BASE_URL}/ticker/usdtidr`, {
        tags: { name: 'GET /api/ticker/usdtidr' }
    });

    const passed = check(response, {
        'ticker_usdtidr: status is 200': (r) => r.status === 200,
        'ticker_usdtidr: has ticker': (r) => r.json('ticker') !== undefined,
    });

    errorRate.add(!passed);
}

/**
 * Test 5: All Trading Pairs
 */
function testPairs() {
    const response = http.get(`${BASE_URL}/pairs`, {
        tags: { name: 'GET /api/pairs' }
    });

    const passed = check(response, {
        'pairs: status is 200': (r) => r.status === 200,
        'pairs: response is array': (r) => Array.isArray(r.json()),
        'pairs: has data': (r) => r.json().length > 0,
    });

    errorRate.add(!passed);
}

/**
 * Test 6: Price Increments
 */
function testPriceIncrements() {
    const response = http.get(`${BASE_URL}/price_increments`, {
        tags: { name: 'GET /api/price_increments' }
    });

    const passed = check(response, {
        'price_increments: status is 200': (r) => r.status === 200,
        'price_increments: has increments': (r) => r.json('increments') !== undefined,
    });

    errorRate.add(!passed);
}

/**
 * Test 7: Market Summaries
 */
function testSummaries() {
    const response = http.get(`${BASE_URL}/summaries`, {
        tags: { name: 'GET /api/summaries' }
    });

    const passed = check(response, {
        'summaries: status is 200': (r) => r.status === 200,
        'summaries: has tickers': (r) => r.json('tickers') !== undefined,
    });

    errorRate.add(!passed);
}

/**
 * Teardown function - runs once after all VUs finish
 */
export function teardown(data) {
    console.log('\n========================================');
    console.log('  Load Test Completed!');
    console.log('========================================');
    console.log(`Start Time: ${data.startTime}`);
    console.log(`End Time: ${new Date().toISOString()}`);
    console.log('========================================\n');
}
