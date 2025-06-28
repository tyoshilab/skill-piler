# Testing Guide for Skill Piler

This document provides guidance on running and maintaining tests for the Skill Piler project.

## Test Architecture

### API Tests (Python/FastAPI)
- **Framework**: pytest with pytest-asyncio, pytest-mock, pytest-cov
- **Location**: `api/tests/`
- **Coverage**: Services and core business logic
- **Key Features**:
  - Mocked external dependencies (GitHub API, Redis, Database)
  - Async test support
  - Coverage reporting

### Frontend Tests (React/TypeScript)
- **Framework**: Jest with React Testing Library
- **Location**: `front/src/**/*.test.{ts,tsx}`
- **Coverage**: Components, hooks, and services
- **Key Features**:
  - Component behavior testing (not implementation details)
  - Mocked API calls and external dependencies
  - User interaction simulation

## Running Tests

### Using Docker (Recommended)

#### Run All Tests
```bash
./scripts/run-tests.sh
```

#### Run API Tests Only
```bash
docker-compose --profile test run --rm skill-piler-api-test
```

#### Run Frontend Tests Only
```bash
docker-compose --profile test run --rm skill-piler-front-test
```

### Manual Testing (Development)

#### API Tests
```bash
cd api
pip install -r requirements.txt
python -m pytest -v --cov=app --cov-report=html
```

#### Frontend Tests
```bash
cd front
npm install
npm test -- --coverage --watchAll=false
```

## Test Coverage Goals

- **Target**: 80%+ coverage for critical business logic
- **API Services**: 90%+ coverage (IntencyService, AnalysisService, GitHubService)
- **Frontend Components**: 85%+ coverage for user-facing components
- **Integration Points**: 100% coverage for API endpoints

## Test Structure

### API Test Organization
```
api/tests/
├── services/
│   ├── test_analysis_service.py    # Core analysis orchestration
│   ├── test_github_service.py      # GitHub API integration
│   ├── test_intency_service.py     # Intensity calculation algorithms
│   ├── test_auth_service.py        # Authentication logic
│   └── test_cache_service.py       # Redis caching
├── routers/
│   ├── test_analysis_router.py     # Analysis endpoints
│   └── test_auth_router.py         # Auth endpoints
└── conftest.py                     # Shared fixtures
```

### Frontend Test Organization
```
front/src/
├── components/
│   ├── UserInput.test.tsx          # Input form component
│   ├── AnalysisResult.test.tsx     # Results display
│   └── PiledBarPlot.test.tsx       # Data visualization
├── hooks/
│   ├── useAnalysisStore.test.ts    # State management
│   └── useAuthStore.test.ts        # Auth state
├── services/
│   └── apiService.test.ts          # API communication
└── setupTests.ts                   # Test configuration
```

## Mocking Strategy

### API Tests
- **GitHub API**: Mock httpx.AsyncClient responses
- **Database**: Use in-memory SQLite for integration tests
- **Redis**: Mock CacheService methods
- **Time-based functions**: Mock datetime.now() for consistent results

### Frontend Tests
- **API Calls**: Mock axios/ApiService with jest.mock()
- **Zustand Store**: Mock store state and actions
- **Timers**: Use jest.useFakeTimers() for polling tests
- **DOM Events**: Use @testing-library/user-event for realistic interactions

## Continuous Integration

### GitHub Actions Integration (Future)
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: ./scripts/run-tests.sh
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

### Test Data Management
- Use factories for generating test data
- Keep test data minimal and focused
- Isolate tests from each other (no shared state)

## Debugging Failed Tests

### API Tests
```bash
# Run specific test with verbose output
docker-compose --profile test run --rm skill-piler-api-test python -m pytest tests/services/test_analysis_service.py::TestAnalysisService::test_start_analysis -v -s

# Generate coverage report
docker-compose --profile test run --rm skill-piler-api-test python -m pytest --cov=app --cov-report=html
# View coverage report at api/htmlcov/index.html
```

### Frontend Tests
```bash
# Run specific test
docker-compose --profile test run --rm skill-piler-front-test npm test -- --testNamePattern="UserInput" --no-watch

# Debug mode with verbose output
docker-compose --profile test run --rm skill-piler-front-test npm test -- --verbose --no-watch
```

## Best Practices

### Writing Effective Tests
1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Use Descriptive Test Names**: `test_analysis_fails_with_invalid_github_token` vs `test_error`
3. **Arrange-Act-Assert Pattern**: Structure tests clearly
4. **Single Responsibility**: One test should verify one behavior
5. **Mock External Dependencies**: Keep tests fast and reliable

### Maintaining Tests
1. **Update Tests with Code Changes**: Tests should evolve with the codebase
2. **Regular Coverage Reviews**: Monitor coverage trends
3. **Performance Testing**: Ensure tests run quickly
4. **Flaky Test Management**: Investigate and fix non-deterministic tests

## Common Issues

### Docker-related
- **Port Conflicts**: Ensure no other services are using ports 25432, 6379
- **Volume Permissions**: Use appropriate user permissions for mounted volumes
- **Memory Limits**: Increase Docker memory if tests fail due to resource constraints

### Test-specific
- **Async Test Timing**: Use proper async/await patterns
- **Mock Cleanup**: Ensure mocks are reset between tests
- **Database State**: Ensure clean database state for each test run