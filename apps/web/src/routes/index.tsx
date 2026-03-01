import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <Navigate to="/login" />;
}
