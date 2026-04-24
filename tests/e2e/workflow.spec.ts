import { test, expect } from '@playwright/test';

test.describe('Workflow Canvas e2e Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app, assuming standard Vite port
    await page.goto('/');
  });

  test('can drag a node from the sidebar and place it on the canvas', async ({ page }) => {
    // 1. Identify a draggable node in the sidebar
    // Adjust selector to match actual DOM if needed: usually data attributes or text
    const taskNodeSidebarItem = page.locator('text="Task"').first();

    // The canvas area where we want to drop
    const canvasArea = page.locator('.react-flow__pane');

    // Make sure sidebar item and canvas area exist
    await expect(taskNodeSidebarItem).toBeVisible();
    await expect(canvasArea).toBeVisible();

    // Workaround for HTML5 drag and drop in React Flow
    // We dispatch dragstart, drop, etc manually because generic mouse events 
    // are sometimes flaky with synthetic React DragEvents.
    await taskNodeSidebarItem.dragTo(canvasArea, {
      targetPosition: { x: 300, y: 300 }
    });

    // 3. Verify the node appears in the canvas
    const newTaskNode = page.locator('.react-flow__node:has-text("Task")').first();
    await expect(newTaskNode).toBeVisible();
  });

  test('can connect nodes using edges', async ({ page }) => {
    // Navigate home implicit from beforeEach
    const canvasArea = page.locator('.react-flow__pane');
    await expect(canvasArea).toBeVisible();

    // 1. Drag a Start Node
    const startSidebarItem = page.locator('text="Start"').first();
    await startSidebarItem.dragTo(canvasArea, { targetPosition: { x: 150, y: 150 } });

    // Wait for the new Start node to appear on canvas
    const startNode = page.locator('.react-flow__node:has-text("Start")').first();
    await expect(startNode).toBeVisible();

    // 2. Drag a Task Node
    const taskItem = page.locator('text="Task"').first();
    await taskItem.dragTo(canvasArea, { targetPosition: { x: 450, y: 150 } });

    // Wait for the new Task node to appear
    const taskNode = page.locator('.react-flow__node:has-text("New Task")').first();
    await expect(taskNode).toBeVisible();

    // 3. Connect them
    // Find the source handle of Start node (usually named "source" and on the right side)
    const startHandle = startNode.locator('.react-flow__handle.source').first();
    
    // Find the target handle of Task node (usually "target" and on the left side)
    const taskTargetHandle = taskNode.locator('.react-flow__handle.target').first();

    await expect(startHandle).toBeVisible();
    await expect(taskTargetHandle).toBeVisible();

    // Perform drag for standard XYFlow edge connection
    await startHandle.dragTo(taskTargetHandle);

    // Verify there is at least one visible Edge in DOM
    const edge = page.locator('.react-flow__edge').first();
    await expect(edge).toBeVisible();
  });
});
