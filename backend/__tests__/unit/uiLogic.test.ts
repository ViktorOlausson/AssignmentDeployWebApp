import { describe, it, expect } from "vitest";

type User = {
  name: string;
};

type Gym = {
  id: number;
  name: string;
};

function getLoginMessage(user: User | null) {
  return user ? `Logged in as ${user.name}` : "Not logged in";
}

function shouldShowProtectedForm(user: User | null) {
  return Boolean(user);
}

function getGymListMessage(gyms: Gym[]) {
  if (gyms.length === 0) {
    return "No gyms found";
  }

  return `${gyms.length} gyms found`;
}

describe("UI logic unit tests", () => {
  it("shows not logged in message when there is no user", () => {
    expect(getLoginMessage(null)).toBe("Not logged in");
  });

  it("shows the user's name when logged in", () => {
    expect(getLoginMessage({ name: "Alex" })).toBe("Logged in as Alex");
  });

  it("hides protected form when not logged in", () => {
    expect(shouldShowProtectedForm(null)).toBe(false);
  });

  it("shows protected form when logged in", () => {
    expect(shouldShowProtectedForm({ name: "Alex" })).toBe(true);
  });

  it("shows an error message when the gym list is empty", () => {
    expect(getGymListMessage([])).toBe("No gyms found");
  });
});
