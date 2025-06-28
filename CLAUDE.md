# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Skill Piler" - a web application that analyzes GitHub repositories to visualize programming language experience and skill levels for engineers. The app helps users understand their technical growth and create portfolios.

## Development Environment Setup

The project uses Docker for development orchestration:

```bash
# Start all services (frontend, backend, database)
docker-compose up

# Services will be available at:
# Frontend: http://localhost:4000
# Backend API: http://localhost:4001  
# PostgreSQL: localhost:25432
```

**Required Directories** (need to be created):
- `./front/` - React frontend application
- `./api/` - Backend API application  
- `./db/sql/` - Database initialization scripts

## Architecture

The project follows a **SPA (Single Page Application)** architecture with separated frontend and backend:

- **Frontend**: React-based static web application 
  - Development port: 4000 (maps to container port 3000)
  - Uses Recharts/D3.js for data visualization
  - Handles GitHub OAuth for private repository access

- **Backend**: Python/FastAPI-based API server
  - Development port: 4001 (maps to container port 3001)
  - Analyzes GitHub repositories using GitHub API (GraphQL)
  - Calculates custom "intensity" scores for programming languages
  - Handles authentication and caching

- **Database**: PostgreSQL 17.4
  - Development port: 25432 (maps to container port 5432)
  - Database: skill-piler
  - User/Password: skill-piler/skill-piler
  - For user data and encrypted GitHub access tokens
  - Redis planned for caching GitHub API responses

## Key Components

### Frontend (React)
- `MainPage` - Main application page
  - `UserInput` - GitHub username input form
  - `AnalysisResult` - Analysis results display
- `GraphContainer` - Visualization components
  - `PiledBarPlot` - Stacked bar chart
  - `BubbleChart` - Bubble chart visualization
  - `TimeLapseSlider` - Time-series skill evolution slider
- `Header` with `LoginButton` for GitHub OAuth
- `ShareButton` for sharing analysis results

### Backend (Python/FastAPI)
- `analysis_router.py` - Analysis endpoints (`/analyze`, `/analyze/{job_id}`)
- `auth_router.py` - GitHub OAuth endpoints (`/login`, `/callback`) 
- `analysis_service.py` - Main analysis logic orchestration
- `github_service.py` - GitHub API communication
- `intency_service.py` - Custom skill intensity calculation
- `cache_service.py` - Redis caching operations

## Development Standards

- **File encoding**: UTF-8 with LF line endings
- **Indentation**: 4 spaces
- **Naming conventions**:
  - Variables/functions: camelCase (`userName`, `getUserData`)
  - Classes: PascalCase (`UserService`)
  - Constants: UPPER_CASE (`MAX_COUNT`)
  - Files: snake_case (`user_service.py`)
- **Comments**: English, with docstrings for all functions/classes
- **Error handling**: Structured exception handling with appropriate logging levels
- **Testing**: 80%+ unit test coverage target

## Git Workflow

- `main` - Production releases
- `develop` - Development integration
- `feature/[name]` - Feature development
- `hotfix/[fix]` - Emergency fixes

Commit message format: `[type] summary` where type is: feat, fix, docs, style, refactor, test

## External Dependencies

- **GitHub API**: GraphQL API for repository analysis
- **OAuth**: GitHub OAuth 2.0 for private repository access
- **Containerization**: Docker for backend deployment
- **State Management**: Zustand or Redux Toolkit for frontend global state

## Security Considerations

- GitHub access tokens are encrypted in PostgreSQL
- OAuth 2.0 flow for secure authentication
- No sensitive tokens exposed to frontend
- API rate limiting through caching strategy

# Phased Implementation Approach
Apply principles in three phases according to importance (to manage cognitive load).

## Phase 1: Critical (Strictly Follow)
1. **Run lint/test after implementation**: Baseline for quality assurance.
2. **Strictly prohibit deleting existing tests**: Prevents data loss.
3. **Think Deeply**.

## Phase 2: Important (Consciously Execute)
1. **Record technical decisions**: A 3-line memo on why the choice was made.
2. **Preliminary research of existing code**: Check 3-5 files with similar implementations to follow naming conventions, architectural patterns, and code style.

## Phase 3: Ideal (When time permits)
1. **Performance optimization**: Execute within acceptable limits after evaluating readability, maintainability, and bug risk.
2. **Write detailed comments**: Explain the technical intent, not just a simple translation.

# Automatic Deep Thinking (Mandatory Every Time)
Always execute the following before responding:

## 1. Thinking Triggers (Self-Questioning)
□ Asked "Why?" 3 times? (Why-Why-Why Analysis)
□ Questioned "Is this really enough?"
□ Considered "What does the user really want?"
□ Spent 30 seconds thinking "Is there a better way?"

## 2. Multi-faceted Review (Mandatory review from 3 perspectives)
□ Technical perspective: Feasibility, performance, maintainability.
□ User perspective: Usability, clarity, alignment with expectations.
□ Operational perspective: Long-term impact, scalability, risk.

## 3. Quality Self-Assessment (Score 4+ on each item to pass)
□ Specificity: Is it concrete and executable? (out of 5)
□ Completeness: Are there any omissions? (out of 5)
□ Practicality: Is it actually useful? (out of 5)
□ Insightfulness: Does it get to the core, not just the surface? (out of 5)

## 4. Signs of Insufficient Thinking (Reconsider if you see the following)
- The answer came to mind immediately.
- There is only one option.
- Using expressions like "easily" or "quickly".
- No concrete examples or numbers.

# Actionable Concrete Rules

## Implementation Plan Quality Standards
Only start implementation if all 4 items below are specified:
□ Target file names for changes
□ Summary of changes (1-2 lines)
□ Estimated scope of impact
□ Testing strategy

## Handling Principle Violations
If a principle is violated:
1. Stop work immediately.
2. Clearly state "Violated the XX principle".
3. Confirm the correction method with the user.
4. Record the cause of the violation in one line (add to global memory).

## Prioritization (If principles conflict)
1st: Prevent data loss (protect existing files and tests).
2nd: User approval (prevent unauthorized implementation).
3rd: Quality assurance (lint/test).
4th: Other improvement suggestions.

# Basic Action Principles

## Principle Confirmation Process at Task Start (Mandatory Every Time)
When receiving a new task, always execute the following before starting implementation:

### 1. Principle Confirmation Checklist
```
【Principle Confirmation】
- Phase 1 Critical: Show diff -> Wait for approval -> Start implementation
- Run lint/test after implementation
- Strictly prohibit deleting existing tests
- Think Deeply

【Task Understanding】
- Request details: [Summarize user's request]
- Work plan: [Specify the approach]

【Pre-start Confirmation】
I will proceed with the work while adhering to the principles above.
```

### 2. Execution Timing
- At the start of a new task (Mandatory)
- When resuming after an interruption (Mandatory)
- During phase transitions of complex tasks (Recommended)

### 3. Thorough Habituation
- To counter LLM memory limitations, execute reliably every time without depending on external memory.
- Starting a task without this process is prohibited.
- Respond in the user's language.
- Implement features with test-driven development.
- When the task is finished, execute the shell command `say {task name} completed`.

# Design and Development Quality Principles
- **Respect Existing Conventions**: Always check 3-5 files with similar functionality before implementing new features.
- **Framework Best Practices**: Adhere to the recommended patterns and principles of the tech stack being used.
- **Handle Unused Variables**: After implementation, delete or explicitly ignore unused variables.
- **Prioritize Type Safety**: Basically prohibit type coercion; resolve with appropriate type definitions.
- **Test Essential Functions**: Test the behavior of the features experienced by the user, not the implementation details.
- **Understand the Root Cause**: Address warnings and errors after understanding the root cause, not just with superficial fixes.
- **Prioritize Design Review**: Prioritize reviewing the test design or the approach itself over technical workarounds.
- **File Operation Safety**: Before renaming or moving a file, always check if the destination file does not already exist. If it does, check its contents and decide whether to merge, or rename.

# Meta-Principles
- If a principle itself becomes an obstacle, consult with the user to adjust it.
- When adding a new principle, delete or merge one existing principle (to manage cognitive load).

## Gemini CLI 連携ガイド

### 目的
ユーザーが **「Geminiと相談しながら進めて」** （または同義語）と指示した場合、Claude は以降のタスクを **Gemini CLI** と協調しながら進める。
Gemini から得た回答はそのまま提示し、Claude 自身の解説・統合も付け加えることで、両エージェントの知見を融合する。

---

### トリガー
- 正規表現: `/Gemini.*相談しながら/`
- 例:
- 「Geminiと相談しながら進めて」
- 「この件、Geminiと話しつつやりましょう」

---

### 基本フロー
1. **PROMPT 生成**
Claude はユーザーの要件を 1 つのテキストにまとめ、環境変数 `$PROMPT` に格納する。

2. **Gemini CLI 呼び出し**
```bash
gemini <<EOF
$PROMPT
EOF