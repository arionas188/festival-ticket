import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"
import App from "./App.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import DashboardHomePage from "./pages/DashboardHomePage.jsx"
import TenantProfilePage from "./pages/TenantProfilePage.jsx"

const queryClient = new QueryClient()

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: "tenant/:tenantId/profile", element: <TenantProfilePage /> },
    ],
  },
])

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
