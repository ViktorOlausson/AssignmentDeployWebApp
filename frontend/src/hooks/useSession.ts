import { useEffect, useState } from "react";

const apiBaseUrl = "https://assignmentdeploywebapp-backend-qvcj.onrender.com";

type SessionState = "loading" | "authenticated" | "unauthenticated";

export function useSession() {
  const [status, setStatus] = useState<SessionState>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
      try {
        const response = await fetch(`${apiBaseUrl}/profile`, {
          credentials: "include",
          signal: controller.signal,
        });

        setStatus(response.ok ? "authenticated" : "unauthenticated");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStatus("unauthenticated");
      }
    }

    void checkSession();

    return () => controller.abort();
  }, []);

  return status;
}
