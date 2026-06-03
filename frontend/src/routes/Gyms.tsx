import { useEffect, useState } from "react";
import { MapPin, MessageSquareText, Star } from "lucide-react";
import { LoadingPage } from "../components/LoadingPanel";
import { apiBaseUrl } from "../config";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type Gym = {
  id: number;
  name: string;
  location: string;
  reviews: Review[];
  createdAt: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; gyms: Gym[] }
  | { status: "error"; message: string };

function formatRating(reviews: Review[]) {
  if (reviews.length === 0) {
    return "No ratings yet";
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return `${(total / reviews.length).toFixed(1)} average`;
}

function getReviewRatingClass(rating: number) {
  if (rating > 3) {
    return "review-rating good";
  }

  if (rating === 3) {
    return "review-rating okay";
  }

  return "review-rating bad";
}

export function Gyms() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadGyms() {
      try {
        const response = await fetch(`${apiBaseUrl}/gyms`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setState({ status: "error", message: "Gyms could not be loaded!" });
          return;
        }

        const gyms = (await response.json()) as Gym[];
        setState({ status: "loaded", gyms });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setState({ status: "error", message: "Gyms could not be loaded" });
      }
    }

    void loadGyms();

    return () => controller.abort();
  }, []);

  async function handleDelete(id: number) {
    const response = await fetch(`${apiBaseUrl}/gyms/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      setState((prev) => {
        if (prev.status !== "loaded") return prev;
        return {
          status: "loaded",
          gyms: prev.gyms.filter((g) => g.id !== id),
        };
      });
    }
  }

  if (state.status === "loading") {
    return <LoadingPage />;
  }

  if (state.status === "error") {
    return (
      <main className="dashboard-page">
        <section className="dashboard-shell">
          <div className="empty-panel">
            <h1>Gyms</h1>
            <p>{state.message}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell" aria-labelledby="gyms-title">
        <div className="page-heading">
          <p className="eyebrow">Public Directory</p>
          <h1 id="gyms-title">Gyms</h1>
          <p className="supporting-copy">
            Browse gyms and reviews from the community.
          </p>
        </div>

        {state.gyms.length === 0 ? (
          <div className="empty-panel">
            <h1>Gyms</h1>
            <p>No gyms found.</p>
          </div>
        ) : (
          <div className="gym-list">
            {state.gyms.map((gym) => (
              <article className="gym-card" key={gym.id}>
                <div className="gym-card-header">
                  <div>
                    <h2>{gym.name}</h2>
                    <p>
                      <MapPin size={17} strokeWidth={2.2} />
                      {gym.location}
                    </p>
                  </div>

                  <div className="rating-pill">
                    <Star size={17} strokeWidth={2.2} />
                    {formatRating(gym.reviews)}
                  </div>

                  <button onClick={() => handleDelete(gym.id)}>Delete</button>
                </div>

                <div className="review-section">
                  <div className="review-section-title">
                    <MessageSquareText size={18} strokeWidth={2.2} />
                    <span>{gym.reviews.length} reviews</span>
                  </div>

                  {gym.reviews.length === 0 ? (
                    <p className="muted-text">No reviews yet.</p>
                  ) : (
                    <div className="review-list">
                      {gym.reviews.map((review) => (
                        <div className="review-item" key={review.id}>
                          <strong
                            className={getReviewRatingClass(review.rating)}
                          >
                            {review.rating}/5
                          </strong>
                          <p>{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
