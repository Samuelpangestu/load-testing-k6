# Indodax API Load Testing - k6

Professional load testing for Indodax Public API using **k6** with automatic HTML dashboard.

## Quick Info

- **Tool**: k6 (JavaScript-based, Go-powered)
- **Virtual Users**: 5
- **Spawn Rate**: 10 users/second
- **Duration**: 30 seconds
- **Endpoints**: ALL 7 APIs tested per iteration
- **Reports**: HTML Dashboard + JSON (auto-generated)

## Installation

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo apt-get install k6

# Windows
choco install k6

# Verify
k6 version
```

## Running the Test

**Simple - just run:**

```bash
./run_load_test.sh
```

**View results:**

```bash
open reports/*-load-test-dashboard.html
```

## What Gets Tested

ALL 7 endpoints in each iteration (simple sequential approach):

| # | Endpoint | Validation |
|---|----------|------------|
| 1 | GET /api/server_time | Status 200, has fields |
| 2 | GET /api/ticker/btcidr | Status 200, has ticker |
| 3 | GET /api/ticker/ethidr | Status 200, has ticker |
| 4 | GET /api/ticker/usdtidr | Status 200, has ticker |
| 5 | GET /api/pairs | Status 200, array check |
| 6 | GET /api/price_increments | Status 200, has data |
| 7 | GET /api/summaries | Status 200, has tickers |

**Simple approach:** Every iteration tests all 7 endpoints. No complex logic.
**Result:** ~60 iterations × 7 endpoints = ~420 total requests

## Reports Generated

### HTML Dashboard (Main)
`reports/[TIMESTAMP]-load-test-dashboard.html`
- Interactive charts
- Response time graphs
- Threshold validation
- Percentiles (p90, p95, p99)

### JSON Summary
`reports/[TIMESTAMP]-load-test-summary.json`
- Aggregated metrics
- Request statistics

## Test Results

**Expected:**
- Total Requests: ~420-490
- Success Rate: 100%
- Avg Response: <300ms
- RPS: ~12-15

**Actual (Last Run):**
```
Total Requests: 441
Iterations: 63
Success Rate: 100%
Avg Response: 205ms
P95 Response: 840ms
Error Rate: 0%
All Thresholds: PASSED ✓
```

## Success Criteria (Thresholds)

| Threshold | Requirement | Status |
|-----------|-------------|--------|
| P95 Response Time | < 1000ms | ✓ Pass |
| HTTP Failure Rate | < 5% | ✓ Pass |
| Custom Error Rate | < 5% | ✓ Pass |

## Requirements Compliance

| Requirement | Status |
|-------------|--------|
| Tool: k6 | ✓ |
| VUs: 5 | ✓ |
| Spawn Rate: 10/s | ✓ |
| Duration: 30s | ✓ |
| Min 3 Endpoints | ✓ (7 endpoints) |
| Response Time | ✓ Captured |
| RPS | ✓ Captured |
| Error Rate | ✓ Captured |
| HTML Report | ✓ Auto-generated |
| JSON Report | ✓ Auto-generated |

## Manual Commands

```bash
# With HTML dashboard (recommended)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
K6_WEB_DASHBOARD=true \
K6_WEB_DASHBOARD_EXPORT="reports/${TIMESTAMP}-dashboard.html" \
k6 run tests/indodax_load_test.js

# Basic run (console only)
k6 run tests/indodax_load_test.js
```

## Customization

**Change users/duration:**

Edit `tests/indodax_load_test.js`:
```javascript
export const options = {
    stages: [
        { duration: '1s', target: 10 },   // 10 VUs
        { duration: '59s', target: 10 },  // 60s total
    ],
};
```

Or via CLI:
```bash
k6 run --vus 10 --duration 60s tests/indodax_load_test.js
```

## Project Structure

```
load-testing-k6/
├── tests/indodax_load_test.js    # Test script (simple)
├── reports/                       # Generated reports
├── run_load_test.sh              # Run script
└── README.md                      # This file
```

## Why This Approach is Simple

**Code approach:**
```javascript
export default function() {
    // Test ALL 7 endpoints in sequence
    testServerTime();
    testTickerBtcIdr();
    testTickerEthIdr();
    testTickerUsdtIdr();
    testPairs();
    testPriceIncrements();
    testSummaries();

    sleep(1);
}
```

- ✅ No weighted random logic
- ✅ No complex if-else conditions
- ✅ All endpoints tested equally
- ✅ Predictable and easy to debug

## Alternative: Locust

Alternative Locust implementation available in `../load-testing/`.

**k6 (this)**: Modern, fast, HTML dashboard, JavaScript
**Locust**: Specified in requirements, Python-based, weighted tasks

---

**Author**: QA Automation Engineer - Indodax Technical Test
**Date**: January 2025
