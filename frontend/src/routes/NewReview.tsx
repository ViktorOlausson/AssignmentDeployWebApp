import { FormEvent, useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { LoadingPage } from "../components/LoadingPanel";

const apiBaseUrl = "https://assignmentdeploywebapp-backend-qvcj.onrender.com/";

type Gym = {
  id: number;
  name: string;
  location: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; gyms: Gym[] }
  | { status: "error"; message: string };

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function NewReview() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [gymId, setGymId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadGyms() {
      try {
        const response = await fetch(`${apiBaseUrl}/gyms`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setLoadState({
            status: "error",
            message: "Gyms could not be loaded.",
          });
          return;
        }

        const gyms = (await response.json()) as Gym[];
        setLoadState({ status: "loaded", gyms });
        setGymId(gyms[0]?.id.toString() ?? "");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setLoadState({ status: "error", message: "Gyms could not be loaded." });
      }
    }

    void loadGyms();

    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "submitting" });

    const response = await fetch(`${apiBaseUrl}/gyms/${gymId}/reviews`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating: Number(rating), comment }),
    });

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message: "Review could not be created.",
      });
      return;
    }

    setRating("5");
    setComment("");
    setSubmitState({ status: "success", message: "Review created." });
  }

  if (loadState.status === "loading") {
    return <LoadingPage />;
  }

  if (loadState.status === "error") {
    return (
      <main className="dashboard-page">
        <section className="dashboard-shell">
          <div className="empty-panel">
            <h1>Add Review</h1>
            <p>{loadState.message}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section
        className="dashboard-shell form-shell"
        aria-labelledby="new-review-title"
      >
        <div className="page-heading">
          <p className="eyebrow">Protected</p>
          <h1 id="new-review-title">Add Review</h1>
          <p className="supporting-copy">
            Share a rating and comment for a listed gym.
          </p>
        </div>

        {loadState.gyms.length === 0 ? (
          <div className="empty-panel">
            <h1>Add Review</h1>
            <p>Create a gym before adding a review.</p>
          </div>
        ) : (
          <form className="form-panel" onSubmit={handleSubmit}>
            <label className="field">
              <span>Gym</span>
              <select
                value={gymId}
                onChange={(event) => setGymId(event.target.value)}
                required
              >
                {loadState.gyms.map((gym) => (
                  <option key={gym.id} value={gym.id}>
                    {gym.name} - {gym.location}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Rating</span>
              <input
                max="5"
                min="1"
                type="number"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Comment</span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                required
              />
            </label>

            {submitState.status === "success" ||
            submitState.status === "error" ? (
              <p className={`form-message ${submitState.status}`}>
                {submitState.message}
              </p>
            ) : null}

            <button
              className="submit-button"
              type="submit"
              disabled={submitState.status === "submitting"}
            >
              {submitState.status === "submitting" ? (
                <span className="button-spinner" aria-hidden="true" />
              ) : (
                <MessageSquareText size={20} strokeWidth={2.2} />
              )}
              {submitState.status === "submitting"
                ? "Creating..."
                : "Create review"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
