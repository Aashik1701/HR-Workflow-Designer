# HR Workflow Designer

> Visual workflow orchestration for HR Operations and IT Automation — design, validate, simulate, and deploy process logic without writing code.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square&logo=vercel)](https://hr-workflow-agent.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/Aashik1701?tab=repositories)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## Table of Contents

1. [Overview](#overview)
2. [Live Demo](#live-demo)
3. [Core Capabilities](#core-capabilities)
4. [Architecture](#architecture)
5. [Layer Responsibilities](#layer-responsibilities)
6. [Domain Model](#domain-model)
7. [Validation Rules](#validation-rules)
8. [API Surface](#api-surface)
9. [Technology Stack](#technology-stack)
10. [Project Structure](#project-structure)
11. [Quick Start](#quick-start)
12. [Available Scripts](#available-scripts)
13. [Testing](#testing)
14. [Workflow JSON Schema](#workflow-json-schema)
15. [Known Limitations](#known-limitations)
16. [Roadmap](#roadmap)

---

## Overview

HR Workflow Designer is a high-fidelity visual orchestration platform built for HR Operations, IT Automation, and People Teams. It enables non-technical users to model, validate, simulate, and launch complex business logic through a premium drag-and-drop canvas — no backend required for local development.

**Primary persona:** HR Administrators and Operations Engineers designing and validating business workflows before production rollout.

**Primary outcomes:**

- Faster process modeling through a visual-first interface
- Early error detection via graph integrity validation
- Safe pre-deployment simulation with step-by-step execution trace
- Zero-friction local development through MSW-backed API contracts

The platform opens with a polished landing page that guides users into the Architect Dashboard, then into the drag-and-drop workflow editor where they configure step properties, validate workflow integrity, and execute simulation runs.

---

## Live Demo

| Environment | URL                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Production  | [https://hr-workflow-agent.vercel.app/](https://hr-workflow-agent.vercel.app/)                   |
| GitHub      | [https://github.com/Aashik1701?tab=repositories](https://github.com/Aashik1701?tab=repositories) |

---

## Core Capabilities

### Visual Workflow Builder

Drag-and-drop node palette for workflow composition across five node types. Smart edge routing, node selection, deletion, and canvas repositioning powered by `@xyflow/react`.

### Dynamic Node Configuration

Each node type renders a dedicated property panel with type-safe form fields, Zod schema validation, and live canvas synchronization. Changes reflect in the node card immediately without a save step.

### Graph Validation Engine

Structural integrity checks run before every simulation. The validator enforces acyclicity, connectivity, and start/end constraints. Errors are pinned to specific nodes on the canvas with inline error badges.

### Simulation Sandbox

Serialize the full workflow graph and POST it to the simulation endpoint. A step-by-step execution timeline renders with per-node status, duration, and log messages — giving teams confidence before promoting a workflow to production.

### Import / Export

Serialize any workflow to JSON for version control, handoff, or templating. Import a saved JSON to restore the full canvas state including node positions, types, and configuration.

### AI Workflow Copilot (AI-Powered)

Describe your intent in plain English (e.g., "send email and then ping slack"). The AI auto-wires the nodes, handles the layout, and scaffolds the entire logic path instantly on the canvas.

### Real-Time Multiplayer Collaboration

Figma-style co-editing powered by **Supabase Realtime**. Multiple HR admins can join the same canvas simultaneously with live presence avatars, real-time cursor tracking, and instant node locking to prevent concurrent editing conflicts.

### Real-Time Execution Playback (Visual Debugger)

Visualize exactly how data flows. Nodes pulse **Green** for success and **Red** for failure as the simulation runs, allowing for real-time logic tracing and debugging on the canvas.

### Advanced Orchestration (Split & Delay)

Deploy **Split Flow** nodes for A/B testing and **Delay Nodes** to pause execution for minutes, hours, or days. The simulation engine handles branching logic and time-based wait states.

### Visual Data Mapping (Variable Engine)

Turn your designer into a true logic engine with `{{ mustache }}` variable interpolation. Pass data payloads seamlessly between nodes to create dynamic, personalized automations.

### Landing Page

A conversion-optimized landing page introduces the product with animated workflow previews, feature highlights, and CTAs routing into the Dashboard and Workflow Editor.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Layer                              │
│           (HR Admin · Operations Engineer · Tech Lead)          │
└───────────────────────────┬─────────────────────────────────────┘
                            │  Interactions
┌───────────────────────────▼─────────────────────────────────────┐
│                       Frontend Layer                            │
│                                                                 │
│  LandingPage  ──►  Dashboard  ──►  WorkflowEditor               │
│       │                │                  │                     │
│  NodeSidebar    StatsCards          ReactFlow Canvas            │
│  NodeFormPanel  ActivityLog         NodeSidebar                 │
│  SimPanel       RecentWorkflows     NodeFormPanel               │
└───────────────────────────┬─────────────────────────────────────┘
                            │  State reads / writes
┌───────────────────────────▼─────────────────────────────────────┐
│                     State Layer (Zustand)                       │
│                                                                 │
│  nodes · edges · selectedNodeId · onNodesChange · onEdgesChange │
│  updateNodeData · importWorkflow · clearWorkflow                │
└──────────────┬────────────────────────────┬─────────────────────┘
               │  Custom Hooks              │  Domain Logic
┌──────────────▼──────────────┐  ┌──────────▼─────────────────────┐
│     useSimulation           │  │     graphValidator.ts          │
│     useAutomations          │  │     serializer.ts              │
│     useWorkflow             │  │     nodeDefaults.ts            │
└──────────────┬──────────────┘  └────────────────────────────────┘
               │  HTTP
┌──────────────▼──────────────────────────────────────────────────┐
│                      API Layer                                  │
│                                                                 │
│   workflowApi.ts   GET /api/automations                         │
│                    POST /api/simulate                           │
└──────────────┬──────────────────────────────────────────────────┘
               │  Intercepted in dev
┌──────────────▼──────────────────────────────────────────────────┐
│              Mock Service Worker (MSW)                          │
│                                                                 │
│   handlers.ts  →  deterministic automation catalog              │
│                →  simulated execution timeline                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

| Layer             | Responsibility                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| **User**          | Initiates workflow design, edits node properties, triggers simulation                                 |
| **Frontend**      | Renders canvas, handles drag-drop interactions, property forms, simulation UX                         |
| **Zustand Store** | Single source of truth for all graph state — nodes, edges, selection                                  |
| **Custom Hooks**  | `useSimulation` — local validation + API call + result state; `useAutomations` — loads action catalog |
| **Domain Logic**  | Type contracts, graph validation, node defaults, JSON serialization                                   |
| **API Layer**     | Thin HTTP client module; isolates fetch logic from components                                         |
| **MSW**           | Intercepts network requests in dev; returns deterministic contracts without a running server          |

---

## Domain Model

### Node Types

| Type                | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| `startNode`         | Workflow entry point. Exactly one required per workflow.      |
| `taskNode`          | Human task with assignee, due date, and custom fields.        |
| `approvalNode`      | Manager or HR approval step with auto-approve threshold.      |
| `automatedStepNode` | System-triggered action sourced from the automations catalog. |
| `endNode`           | Workflow completion with optional summary flag.               |

### Core TypeScript Contracts

```typescript
// Discriminated union — every node's data conforms to exactly one member
type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData;

// Simulation output model
interface SimulationStep {
  nodeId: string;
  nodeType: NodeType;
  nodeTitle: string;
  status: "pending" | "running" | "success" | "error" | "skipped";
  message: string;
  timestamp: string;
  durationMs: number;
}

interface SimulationResult {
  success: boolean;
  totalSteps: number;
  executedSteps: SimulationStep[];
  errors: string[];
  completedAt: string;
}

// Validation output
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[]; // { nodeId: string; message: string }[]
}
```

---

## Validation Rules

The graph validator (`src/utils/graphValidator.ts`) enforces the following constraints before every simulation run:

| Rule                             | Description                                                      |
| -------------------------------- | ---------------------------------------------------------------- |
| Non-empty graph                  | Workflow must contain at least one node                          |
| Single start node                | Exactly one `startNode` must exist                               |
| At least one end node            | At least one `endNode` must exist                                |
| Incoming edge on non-start nodes | Every node except the start must have at least one incoming edge |
| Outgoing edge on non-end nodes   | Every node except end nodes must have at least one outgoing edge |
| Acyclicity                       | Graph must contain no directed cycles (DFS-based detection)      |

Validation errors are surfaced in two places: the simulation panel as a list, and as inline `hasError` / `errorMessage` flags written back to individual node data so the canvas renders error badges directly on affected nodes.

---

## API Surface

### `GET /api/automations`

Returns the catalog of available automation actions for use in `automatedStepNode` configuration.

**Response shape:**

```json
[
  {
    "id": "send_email",
    "label": "Send Email",
    "params": ["to", "subject", "body"]
  },
  {
    "id": "generate_doc",
    "label": "Generate Document",
    "params": ["template", "recipient"]
  }
]
```

---

### `POST /api/simulate`

Accepts the serialized workflow graph and returns a mock step-by-step execution result.

**Request body:**

```json
{
  "nodes": [
    /* ReactFlow node array */
  ],
  "edges": [
    /* ReactFlow edge array */
  ]
}
```

**Response shape:**

```json
{
  "success": true,
  "totalSteps": 4,
  "executedSteps": [
    {
      "nodeId": "start-1",
      "nodeType": "startNode",
      "nodeTitle": "Employee Onboarding",
      "status": "success",
      "message": "Workflow initiated successfully",
      "timestamp": "2026-04-24T10:00:00.000Z",
      "durationMs": 142
    }
  ],
  "errors": [],
  "completedAt": "2026-04-24T10:00:02.341Z"
}
```

Both endpoints are intercepted by MSW in development. No running backend is required.

---

## Technology Stack

| Category       | Library                  | Version     | Rationale                                                   |
| -------------- | ------------------------ | ----------- | ----------------------------------------------------------- |
| Framework      | React + TypeScript       | 19 / strict | Component model + type safety across domain contracts       |
| Build tool     | Vite                     | 8           | Sub-second HMR, native ESM, fast production builds          |
| Graph engine   | @xyflow/react            | 12          | Industry standard for node-based UIs, custom node API       |
| State          | Zustand                  | latest      | Zero boilerplate, no provider nesting, easy graph mutations |
| Forms          | React Hook Form + Zod    | latest      | Type-safe schemas, no re-render on every keystroke          |
| Styling        | Tailwind CSS             | 3           | Utility-first, consistent spacing, responsive design        |
| Realtime       | Supabase                 | latest      | Presence, cursor broadcasting, and node locking             |
| Mocking        | Mock Service Worker      | 2           | Network-level interception, real XHR in DevTools            |
| Icons          | Lucide React             | latest      | Consistent, tree-shakable SVG icon set                      |
| Testing (unit) | Vitest + Testing Library | latest      | Vite-native, fast, co-located with source                   |
| Testing (e2e)  | Playwright               | latest      | Cross-browser, reliable selector model                      |

---

## Project Structure

```
src/
├── api/
│   └── workflowApi.ts          # HTTP client — getAutomations, simulateWorkflow
│
├── components/
│   ├── canvas/
│   │   ├── WorkflowCanvas.tsx  # ReactFlow wrapper, drag-drop, node registration
│   │   ├── NodeSidebar.tsx     # Draggable node palette
│   │   └── CanvasToolbar.tsx   # Validate, Export, Import, Clear actions
│   │
│   ├── nodes/
│   │   ├── BaseNode.tsx        # Shared node shell — handles, delete, error badge
│   │   ├── StartNode.tsx
│   │   ├── TaskNode.tsx
│   │   ├── ApprovalNode.tsx
│   │   ├── AutomatedStepNode.tsx
│   │   └── EndNode.tsx
│   │
│   ├── forms/
│   │   ├── NodeFormPanel.tsx   # Container — reads selectedNodeId, renders correct form
│   │   ├── StartNodeForm.tsx
│   │   ├── TaskNodeForm.tsx
│   │   ├── ApprovalNodeForm.tsx
│   │   ├── AutomatedStepNodeForm.tsx
│   │   └── EndNodeForm.tsx
│   │
│   ├── simulation/
│   │   └── SimulationPanel.tsx # Sandbox panel — validate, call API, render timeline
│   │
│   └── ui/
│       ├── KeyValueEditor.tsx  # Reusable key-value pair input
│       ├── Badge.tsx
│       └── Toggle.tsx
│
├── hooks/
│   ├── useSimulation.ts        # Validation → API → result state orchestration
│   └── useAutomations.ts       # Fetches GET /api/automations on mount
│
├── mocks/
│   ├── browser.ts              # MSW worker setup
│   └── handlers.ts             # All mock route handlers
│
├── store/
│   └── workflowStore.ts        # Zustand store — nodes, edges, selection, mutations
│
├── types/
│   └── workflow.ts             # All TypeScript interfaces and discriminated unions
│
├── utils/
│   ├── graphValidator.ts       # Pure validation function — no React deps
│   ├── nodeDefaults.ts         # Default data factory per node type
│   └── serializer.ts           # Workflow → JSON and JSON → workflow
│
└── main.tsx                    # MSW init → ReactDOM.createRoot
```

---

## Quick Start

### Prerequisites

- Node.js 20 or later
- npm 10 or later

### Install

```bash
npm install
```

### Initialize MSW (first time only)

```bash
npx msw init public/ --save
```

### Run Development Server

```bash
npm run dev
```

### Open in Browser

```
http://localhost:5173/
```

The landing page loads at `/`. The workflow editor is at `/workflows`. No backend server or environment variables are required for local development — MSW handles all API traffic.

---

## Available Scripts

| Script                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Start Vite development server with HMR            |
| `npm run build`       | TypeScript compile + production bundle            |
| `npm run preview`     | Serve production build locally                    |
| `npm run lint`        | Run ESLint across the codebase                    |
| `npm run test`        | Run Vitest unit tests once                        |
| `npm run test:watch`  | Run Vitest in interactive watch mode              |
| `npm run test:e2e`    | Run Playwright end-to-end tests (headless)        |
| `npm run test:e2e:ui` | Open Playwright UI for interactive test debugging |

---

## Testing

### Unit Tests (Vitest)

Unit tests cover the domain logic layer — pure functions with no React dependency.

Key coverage targets:

- `graphValidator.ts` — all six validation rules, including cycle detection
- `nodeDefaults.ts` — default data shape per node type
- `serializer.ts` — round-trip serialization fidelity

Run once:

```bash
npm run test
```

Run in watch mode during development:

```bash
npm run test:watch
```

---

### End-to-End Tests (Playwright)

Playwright tests validate primary user journeys across the full application.

Install browser binaries (required once):

```bash
npx playwright install --with-deps chromium
```

Run in headless mode:

```bash
npm run test:e2e
```

Open interactive UI for debugging:

```bash
npm run test:e2e:ui
```

Current coverage:

- Landing page hero section renders correctly
- `Start Building` CTA routes to `/workflows`
- `Open Dashboard` CTA routes to `/dashboard`
- Canvas accepts a drag-drop node from the palette
- Node selection opens the property panel
- Simulation panel validates and renders execution steps

---

## Workflow JSON Schema

Workflows serialize as a flat JSON object containing `nodes` and `edges` arrays. This format is used for both export/import and the POST `/api/simulate` request body.

```json
{
  "nodes": [
    {
      "id": "start-1",
      "type": "startNode",
      "position": { "x": 160, "y": 80 },
      "data": {
        "type": "startNode",
        "title": "Employee Onboarding",
        "metadata": [{ "key": "department", "value": "engineering" }]
      }
    },
    {
      "id": "task-1",
      "type": "taskNode",
      "position": { "x": 160, "y": 260 },
      "data": {
        "type": "taskNode",
        "title": "Collect Documents",
        "description": "Request ID and address proofs",
        "assignee": "hr-team@company.com",
        "dueDate": "2026-05-01",
        "customFields": []
      }
    },
    {
      "id": "approval-1",
      "type": "approvalNode",
      "position": { "x": 160, "y": 440 },
      "data": {
        "type": "approvalNode",
        "title": "Manager Sign-Off",
        "approverRole": "Manager",
        "autoApproveThreshold": 0
      }
    },
    {
      "id": "auto-1",
      "type": "automatedStepNode",
      "position": { "x": 160, "y": 620 },
      "data": {
        "type": "automatedStepNode",
        "title": "Send Welcome Email",
        "actionId": "send_email",
        "actionParams": {
          "to": "{{ employee.email }}",
          "subject": "Welcome to the team"
        }
      }
    },
    {
      "id": "end-1",
      "type": "endNode",
      "position": { "x": 160, "y": 800 },
      "data": {
        "type": "endNode",
        "endMessage": "Onboarding complete",
        "summaryFlag": true
      }
    }
  ],
  "edges": [
    { "id": "e1", "source": "start-1", "target": "task-1" },
    { "id": "e2", "source": "task-1", "target": "approval-1" },
    { "id": "e3", "source": "approval-1", "target": "auto-1" },
    { "id": "e4", "source": "auto-1", "target": "end-1" }
  ]
}
```

---

## Known Limitations

- **Backend is fully mocked.** All API responses are generated by MSW. Production integration requires replacing `workflowApi.ts` with real endpoints and removing MSW from the build pipeline.
- **No authentication.** Workflows are not persisted between sessions. Refreshing the page clears the canvas. (Note: Multiplayer assigns temporary guest identities).
- **E2E coverage is shallow.** Current Playwright tests cover landing-page routing and primary navigation. Canvas interaction tests (drag-drop, edge creation, simulation run) need to be added before production readiness.

---

## Roadmap

| Priority | Item                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| High     | Replace MSW simulation with real backend integration (Node.js or Edge Functions)  |
| High     | Supabase Database integration — persist workflows, activity logs, simulation history |
| High     | Expand E2E tests to cover canvas interactions and full simulation flow            |
| Medium   | **🔐 Real Authentication (FUTURE UPDATED)** — Supabase Auth for secure login      |
| Medium   | **📂 Workspaces (FUTURE UPDATED)** — Isolated orchestrators for HR, IT, and Legal |
| Medium   | Workflow versioning — named snapshots and audit trail per workflow                |
| Low      | Telemetry dashboard — per-workflow execution analytics and completion rates       |

---

## Contributing

This project was built as a case study submission for the Tredence Studio AI Agentic Platforms internship cohort. Architecture feedback, extension proposals, and backend contract alignment discussions are welcome via GitHub Issues.

---

_Built with React 19 · TypeScript · @xyflow/react · Zustand · Supabase · MSW · Tailwind CSS_
