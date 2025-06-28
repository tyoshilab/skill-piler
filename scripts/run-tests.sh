#!/bin/bash

echo "=== Skill Piler Test Suite ==="

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${YELLOW}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Ensure we're in the project root
cd "$(dirname "$0")/.."

print_status "Starting databases for testing"
docker-compose up -d skill-piler-db skill-piler-redis

# Wait for databases to be ready
print_status "Waiting for databases to be ready"
sleep 10

# Run API tests
print_status "Running API Unit Tests"
if docker-compose --profile test run --rm skill-piler-api-test; then
    print_success "API tests passed"
    API_TESTS_PASSED=true
else
    print_error "API tests failed"
    API_TESTS_PASSED=false
fi

# Run Frontend tests
print_status "Running Frontend Unit Tests"
if docker-compose --profile test run --rm skill-piler-front-test; then
    print_success "Frontend tests passed"
    FRONTEND_TESTS_PASSED=true
else
    print_error "Frontend tests failed"
    FRONTEND_TESTS_PASSED=false
fi

# Cleanup
print_status "Cleaning up test environment"
docker-compose down

# Summary
echo ""
print_status "Test Results Summary"
if [ "$API_TESTS_PASSED" = true ]; then
    print_success "API Unit Tests: PASSED"
else
    print_error "API Unit Tests: FAILED"
fi

if [ "$FRONTEND_TESTS_PASSED" = true ]; then
    print_success "Frontend Unit Tests: PASSED"
else
    print_error "Frontend Unit Tests: FAILED"
fi

# Exit with error if any tests failed
if [ "$API_TESTS_PASSED" = true ] && [ "$FRONTEND_TESTS_PASSED" = true ]; then
    echo ""
    print_success "All tests passed! 🎉"
    exit 0
else
    echo ""
    print_error "Some tests failed! 😞"
    exit 1
fi