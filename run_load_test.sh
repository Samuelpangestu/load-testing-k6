#!/bin/bash

##############################################
# Indodax API Load Test Execution Script (k6)
#
# Configuration:
# - Virtual Users: 5
# - Spawn Rate: 10 users/second
# - Duration: 30 seconds
# - Target: Indodax Public API
# - HTML Dashboard: Enabled
##############################################

echo "=========================================="
echo "   Indodax API Load Test with k6"
echo "=========================================="
echo ""
echo "Configuration:"
echo "  Virtual Users    : 5"
echo "  Spawn Rate       : 10 users/second"
echo "  Test Duration    : 30 seconds"
echo "  Target API       : https://indodax.com/api"
echo "  HTML Dashboard   : Enabled"
echo ""
echo "=========================================="
echo ""

# Create reports directory
mkdir -p reports

# Get timestamp for unique report names
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "Starting load test..."
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null
then
    echo "ERROR: k6 is not installed!"
    echo ""
    echo "Please install k6 first:"
    echo "  macOS:   brew install k6"
    echo "  Linux:   sudo apt-get install k6  (or check https://k6.io/docs/getting-started/installation/)"
    echo "  Windows: choco install k6"
    echo ""
    exit 1
fi

# Run k6 test with HTML Dashboard export
K6_WEB_DASHBOARD=true \
K6_WEB_DASHBOARD_EXPORT="reports/${TIMESTAMP}-load-test-dashboard.html" \
k6 run \
    --summary-export=reports/${TIMESTAMP}-load-test-summary.json \
    tests/indodax_load_test.js

# Check if test completed successfully
if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  Load Test Completed Successfully!"
    echo "=========================================="
    echo ""
    echo "Reports generated:"
    echo "  HTML Dashboard : reports/${TIMESTAMP}-load-test-dashboard.html"
    echo "  JSON Summary   : reports/${TIMESTAMP}-load-test-summary.json"
    echo ""
    echo "To view HTML report:"
    echo "  open reports/${TIMESTAMP}-load-test-dashboard.html"
    echo ""
    echo "=========================================="

    # Display summary if it exists
    if [ -f "reports/${TIMESTAMP}-load-test-summary.json" ]; then
        echo ""
        echo "Quick Summary (Response Times):"
        echo "----------------------------------------"
        if command -v jq &> /dev/null; then
            cat "reports/${TIMESTAMP}-load-test-summary.json" | jq -r '.metrics.http_req_duration | "  Avg: \(.values.avg)ms | Min: \(.values.min)ms | Max: \(.values.max)ms | P95: \(.values["p(95)"])ms"'
            cat "reports/${TIMESTAMP}-load-test-summary.json" | jq -r '.metrics.http_reqs | "  Total Requests: \(.values.count) | Rate: \(.values.rate)/s"'
            cat "reports/${TIMESTAMP}-load-test-summary.json" | jq -r '.metrics.http_req_failed | "  Failed Requests: \(.values.rate * 100)%"'
        else
            echo "  Install 'jq' to see formatted summary: brew install jq"
            echo "  Raw summary: reports/${TIMESTAMP}-load-test-summary.json"
        fi
        echo "----------------------------------------"
    fi
else
    echo ""
    echo "=========================================="
    echo "  Load Test Failed!"
    echo "=========================================="
    exit 1
fi
