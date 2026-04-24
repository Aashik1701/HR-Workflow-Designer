# HR Workflow Designer

HR Workflow Designer is a visual workflow modeling and simulation platform for HR operations.  
It enables HR admins to compose processes using drag-and-drop nodes, configure step properties, validate workflow integrity, and execute a simulation run before deployment.

## Table of Contents

1.  [Overview](#overview)
2.  [Core Capabilities](#core-capabilities)
3.  [Architecture Diagram](#architecture-diagram)
4.  [Sample Application UI](#sample-application-ui)
5.  [Layer Responsibilities](#layer-responsibilities)
6.  [Domain Model and Contracts](#domain-model-and-contracts)
7.  [Validation Rules](#validation-rules)
8.  [API Surface](#api-surface)
9.  [Technology Stack](#technology-stack)
10.  [Project Structure](#project-structure)
11.  [Quick Start](#quick-start)
12.  [Available Scripts](#available-scripts)
13.  [Workflow JSON Example](#workflow-json-example)
14.  [Known Limitations](#known-limitations)
15.  [Roadmap](#roadmap)

## Overview

This project provides a layered architecture that separates UI rendering, state orchestration, domain validation, and API integration.  
The implementation is optimized for iterative product development with mocked backend contracts using Mock Service Worker (MSW).

Primary user persona:

-   HR Administrator designing and validating business workflows.

Primary outcomes:

-   Faster process modeling.
-   Early error detection through graph validation.
-   Safe pre-run simulation before production integration.

## Core Capabilities

-   Drag-and-drop node palette for workflow composition.
-   Dynamic node property panel with form-based editing.
-   Graph validation with start/end/connectivity/cycle checks.
-   Workflow import/export as JSON.
-   Simulation runner with step timeline and status visualization.
-   Mocked automation and simulation APIs for local development.

## Architecture Diagram

![HR Workflow Designer Architecture](https://file%2B.vscode-resource.vscode-cdn.net/Users/mohammedaashik/Documents/PROJECT/full-stack-tredence/hr-workflow-designer/public/architecture%2520diagram.png)

The diagram above documents the end-to-end architectural flow across user interactions, frontend modules, hooks, domain validation, API integration, and MSW-backed simulation services.

## Sample Application UI

![Sample Workflow Designer UI](https://file%2B.vscode-resource.vscode-cdn.net/Users/mohammedaashik/Documents/PROJECT/full-stack-tredence/hr-workflow-designer/public/sample_screenshot.png)

This sample view shows a full workflow path from Start to End with multiple node types and the right-side configuration panel in edit mode.

## Layer Responsibilities

### User Layer

-   Initiates workflow design, edits node details, and runs simulation.

### Frontend Layer

-   Renders the canvas and node components.
-   Handles drag-drop interactions and graph editing.
-   Provides property forms and simulation UX.
-   Maintains UI state using Zustand.

### Custom Hooks Layer

-   `useSimulation`: orchestrates local validation and simulation execution.
-   `useAutomations`: loads available automation actions for automated steps.

### Domain and Logic Layer

-   Defines node and edge domain model contracts.
-   Enforces validation rules for structural integrity.
-   Converts graph state into serialized payloads for API transport.

### API Layer

-   Encapsulates HTTP requests behind a thin client module.
-   Provides dedicated methods for automation retrieval and workflow simulation.

### Backend Mock Service Layer

-   Intercepts API requests in local development using MSW.
-   Returns deterministic automation catalogs.
-   Produces simulated execution timelines for UX validation.

## Domain Model and Contracts

### Node Types

-   `startNode`
-   `taskNode`
-   `approvalNode`
-   `automatedStepNode`
-   `endNode`

### Core Contracts

-   `WorkflowNodeData`: discriminated union for all node payloads.
-   `SimulationStep` and `SimulationResult`: execution timeline model.
-   `ValidationResult`: graph validation output and error list.

## Validation Rules

The validator enforces the following constraints:

-   Workflow must not be empty.
-   Exactly one start node must exist.
-   At least one end node must exist.
-   Every non-start node must have an incoming edge.
-   Every non-end node must have an outgoing edge.
-   Graph must be acyclic.

## API Surface

### `GET /api/automations`

Returns available automation actions and required parameters.

### `POST /api/simulate`

Accepts workflow graph payload and returns simulation execution results.

## Technology Stack

-   React 19 + TypeScript
-   Vite 8
-   React Flow (`@xyflow/react`)
-   Zustand (state management)
-   React Hook Form + Zod (form handling and schema validation)
-   Tailwind CSS
-   Mock Service Worker (MSW)

## Project Structure

text

Copy

```text
src/	api/               # API client methods	components/		canvas/          # Canvas, toolbar, palette		forms/           # Node configuration forms		nodes/           # Custom React Flow node renderers		simulation/      # Simulation viewer		ui/              # Shared UI controls	hooks/             # useSimulation, useAutomations	mocks/             # MSW browser and handlers	store/             # Zustand workflow store	types/             # Domain and contract types	utils/             # Validator and node defaults
```

## Quick Start

### Prerequisites

-   Node.js 20+
-   npm 10+

### Install

bash

Copy

```bash
npm install
```

### Run Development Server

bash

Copy

```bash
npm run dev
```

### Open in Browser

Use the local URL shown by Vite, typically:

text

Copy

```text
http://localhost:5173/
```

## Available Scripts

-   `npm run dev`: start Vite development server.
-   `npm run build`: run TypeScript build and production bundle.
-   `npm run preview`: preview production build.
-   `npm run lint`: run ESLint checks.
-   `npm run test`: run unit tests once with Vitest.
-   `npm run test:watch`: run Vitest in watch mode.
-   `npm run test:e2e`: run Playwright UI integration tests in headless mode.
-   `npm run test:e2e:ui`: open Playwright UI mode for interactive debugging.

## UI Integration Testing

Playwright is configured to validate end-to-end behavior for the workflow canvas.

Current coverage includes:

-   Dragging a node from the palette onto the canvas.
-   Connecting nodes by dragging from source to target handles.

Setup notes:

-   Install browser binaries once: `npx playwright install --with-deps chromium`
-   Run tests: `npm run test:e2e`

## Workflow JSON Example

json

Copy

```json
{	"nodes": [		{			"id": "start-1",			"type": "startNode",			"position": { "x": 160, "y": 80 },			"data": {				"type": "startNode",				"title": "Employee Onboarding",				"metadata": [{ "key": "department", "value": "engineering" }]			}		},		{			"id": "task-1",			"type": "taskNode",			"position": { "x": 160, "y": 260 },			"data": {				"type": "taskNode",				"title": "Collect Documents",				"description": "Request ID and address proofs",				"assignee": "hr-team@company.com",				"dueDate": "2026-05-01",				"customFields": []			}		},		{			"id": "end-1",			"type": "endNode",			"position": { "x": 160, "y": 440 },			"data": {				"type": "endNode",				"endMessage": "Onboarding complete",				"summaryFlag": true			}		}	],	"edges": [		{ "id": "e-start-task", "source": "start-1", "target": "task-1" },		{ "id": "e-task-end", "source": "task-1", "target": "end-1" }	]}
```

## Known Limitations

-   Backend is mocked for development and demo purposes.
-   E2E coverage currently focuses on core canvas mechanics and should be expanded for complex multi-branch workflows.

## Roadmap

-   Replace MSW simulation with real backend integration.
-   Add persisted workflow versioning and audit trail.
-   Add unit and integration tests for validation and simulation flows.
-   Introduce role-based access and workflow permissions.

---

For architecture evolution, production readiness planning, or backend contract alignment, open an issue or start a design discussion in this repository.