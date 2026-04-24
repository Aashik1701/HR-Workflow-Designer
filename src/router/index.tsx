import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../pages/Dashboard';
import { WorkflowsList } from '../pages/WorkflowsList';
import { WorkflowEditor } from '../pages/WorkflowEditor';
import { Automations } from '../pages/Automations';
import { Logs } from '../pages/Logs';
import { LandingPage } from '../pages/LandingPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { path: 'dashboard',            element: <Dashboard /> },
      { path: 'workflows',            element: <WorkflowsList /> },
      { path: 'workflows/:id/edit',   element: <WorkflowEditor /> },
      { path: 'automations',          element: <Automations /> },
      { path: 'logs',                 element: <Logs /> },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
