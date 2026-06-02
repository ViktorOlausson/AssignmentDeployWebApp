import type { ReactNode } from "react";
import { UserRound } from "lucide-react";
import { useSession } from "../hooks/useSession";
import { LoadingPage } from "./LoadingPanel";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  "https://assignmentdeploywebapp-backend.onrender.com";

type RequireLoginProps = {
  children: ReactNode;
};

export function RequireLogin({ children }: RequireLoginProps) {
  const status = useSession();

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (status === "unauthenticated") {
    return (
      <main className="dashboard-page">
        <section className="dashboard-shell">
          <div className="empty-panel">
            <UserRound size={34} strokeWidth={2.2} />
            <h1>Sign in required</h1>
            <p>You need to be logged in to use this page.</p>
            <a className="login-button" href={`${apiBaseUrl}/login`}>
              Sign in
            </a>
          </div>
        </section>
      </main>
    );
  }

  return children;
}
