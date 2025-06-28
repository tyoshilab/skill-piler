#!/bin/bash

echo "=== Skill Piler Test Suite ==="

# Function to print colored output
print_status() {
    echo "=== $1 ==="
}

print_success() {
    echo "✓ $1"
}

print_error() {
    echo "✗ $1"
}

# Ensure we're in the project root
cd "$(dirname "$0")/.."

print_status "Building and running tests"

# Stop and clean up any existing containers
docker-compose down

# Build test images
print_status "Building API test image"
docker-compose --profile test build skill-piler-api-test

print_status "Building Frontend test image"  
docker-compose --profile test build skill-piler-front-test

# Start databases
print_status "Starting databases"
docker-compose up -d skill-piler-db skill-piler-redis

# Wait for databases
print_status "Waiting for databases"
sleep 15

# Run API tests
print_status "Running API Tests"
if docker-compose --profile test run --rm skill-piler-api-test; then
    print_success "API tests passed"
    API_TESTS_PASSED=true
else
    print_error "API tests failed"
    API_TESTS_PASSED=false
fi

# Run Frontend tests (without database dependency)
print_status "Running Frontend Tests"
if docker-compose --profile test run --rm skill-piler-front-test; then
    print_success "Frontend tests passed"
    FRONTEND_TESTS_PASSED=true
else
    print_error "Frontend tests failed"
    FRONTEND_TESTS_PASSED=false
fi

# Cleanup
print_status "Cleaning up"
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
    print_success "All tests passed!"
    exit 0
else
    echo ""
    print_error "Some tests failed!"
    exit 1
fi