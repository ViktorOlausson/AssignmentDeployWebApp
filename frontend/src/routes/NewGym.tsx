import { FormEvent, useState } from "react";
import { CirclePlus } from "lucide-react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function NewGym() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "submitting" });

    const response = await fetch(`${apiBaseUrl}/gyms`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, location }),
    });

    if (!response.ok) {
      setSubmitState({ status: "error", message: "Gym could not be created." });
      return;
    }

    setName("");
    setLocation("");
    setSubmitState({ status: "success", message: "Gym created." });
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell form-shell" aria-labelledby="new-gym-title">
        <div className="page-heading">
          <p className="eyebrow">Protected</p>
          <h1 id="new-gym-title">Add Gym</h1>
          <p className="supporting-copy">Create a gym listing for the public directory.</p>
        </div>

        <form className="form-panel" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>

          <label className="field">
            <span>Location</span>
            <input value={location} onChange={(event) => setLocation(event.target.value)} required />
          </label>

          {submitState.status === "success" || submitState.status === "error" ? (
            <p className={`form-message ${submitState.status}`}>{submitState.message}</p>
          ) : null}

          <button className="submit-button" type="submit" disabled={submitState.status === "submitting"}>
            <CirclePlus size={20} strokeWidth={2.2} />
            {submitState.status === "submitting" ? "Creating..." : "Create gym"}
          </button>
        </form>
      </section>
    </main>
  );
}
