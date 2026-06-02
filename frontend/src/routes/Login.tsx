import { Dumbbell, LogIn } from "lucide-react";

const apiBaseUrl = "https://assignmentdeploywebapp-backend-qvcj.onrender.com/";

export function Login() {
  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true">
          <Dumbbell size={30} strokeWidth={2.4} />
        </div>

        <div className="login-copy">
          <p className="eyebrow">Gym Reviews</p>
          <h1 id="login-title">Sign in</h1>
          <p className="supporting-copy">
            Continue with your account to add gyms, write reviews, and manage
            your profile.
          </p>
        </div>

        <a className="login-button" href={`${apiBaseUrl}/login`}>
          <LogIn size={20} strokeWidth={2.2} />
          Continue with Auth0
        </a>
      </section>
    </main>
  );
}
