import { useEffect, useState } from "react";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { LoadingPage } from "../components/LoadingPanel";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  "https://assignmentdeploywebapp-backend.onrender.com";

type ProfileUser = {
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
  sub?: string;
};

type ProfileResponse = {
  user: ProfileUser;
};

type LoadState =
  | { status: "loading" }
  | { status: "authenticated"; user: ProfileUser }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

export function Profile() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const response = await fetch(`${apiBaseUrl}/profile`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (response.status === 401) {
          setState({ status: "unauthenticated" });
          return;
        }

        if (!response.ok) {
          setState({ status: "error", message: "Profile could not be loaded" });
          return;
        }

        const data = (await response.json()) as ProfileResponse;
        setState({ status: "authenticated", user: data.user });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({ status: "error", message: "Profile could not be loaded" });
      }
    }

    void loadProfile();

    return () => controller.abort();
  }, []);

  if (state.status === "loading") {
    return <LoadingPage />;
  }

  if (state.status === "unauthenticated") {
    return (
      <main className="dashboard-page">
        <section className="dashboard-shell">
          <div className="empty-panel">
            <UserRound size={34} strokeWidth={2.2} />
            <h1>Profile</h1>
            <p>Sign in to view your dashboard.</p>
            <a className="login-button" href={`${apiBaseUrl}/login`}>
              Sign in
            </a>
          </div>
        </section>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="dashboard-page">
        <section className="dashboard-shell">
          <div className="empty-panel">
            <h1>Profile</h1>
            <p>{state.message}</p>
          </div>
        </section>
      </main>
    );
  }

  const { user } = state;
  const displayName = user.name || user.nickname || "Gym reviewer";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell" aria-labelledby="profile-title">
        <div className="profile-hero">
          {user.picture ? (
            <img className="avatar" src={user.picture} alt="" />
          ) : (
            <div className="avatar fallback" aria-hidden="true">
              {initials}
            </div>
          )}

          <div>
            <p className="eyebrow">Profile Dashboard</p>
            <h1 id="profile-title">{displayName}</h1>
            <p className="supporting-copy">
              {user.email || "Authenticated member"}
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <Mail size={22} strokeWidth={2.2} />
            <div>
              <span>Email</span>
              <strong>{user.email || "Not provided"}</strong>
            </div>
          </article>

          <article className="dashboard-card">
            <ShieldCheck size={22} strokeWidth={2.2} />
            <div>
              <span>Auth ID</span>
              <strong>{user.sub || "Active session"}</strong>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
