import { CirclePlus, Dumbbell, LogIn, LogOut, MapPinned, MessageSquareText, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSession } from "../hooks/useSession";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export function TopMenu() {
  const isLoggedIn = useSession() === "authenticated";

  return (
    <header className="top-menu">
      <NavLink className="top-menu-brand" to="/profile" aria-label="Gym Reviews profile">
        <span className="brand-mark menu-mark" aria-hidden="true">
          <Dumbbell size={20} strokeWidth={2.4} />
        </span>
        <span>Gym Reviews</span>
      </NavLink>

      <nav className="top-menu-nav" aria-label="Primary navigation">
        <NavLink className="menu-link" to="/gyms" end>
          <MapPinned size={18} strokeWidth={2.2} />
          <span>Gyms</span>
        </NavLink>

        {isLoggedIn ? (
          <>
            <NavLink className="menu-link" to="/gyms/new">
              <CirclePlus size={18} strokeWidth={2.2} />
              <span>Add Gym</span>
            </NavLink>

            <NavLink className="menu-link" to="/reviews/new">
              <MessageSquareText size={18} strokeWidth={2.2} />
              <span>Add Review</span>
            </NavLink>

            <NavLink className="menu-link" to="/profile">
              <UserRound size={18} strokeWidth={2.2} />
              <span>Profile</span>
            </NavLink>

            <a className="menu-icon-link tooltip-link" href={`${apiBaseUrl}/logout`} aria-label="Log out">
              <LogOut size={19} strokeWidth={2.2} />
              <span className="tooltip" role="tooltip">
                Logout
              </span>
            </a>
          </>
        ) : (
          <NavLink className="menu-link" to="/login">
            <LogIn size={18} strokeWidth={2.2} />
            <span>Login</span>
          </NavLink>
        )}
      </nav>
    </header>
  );
}
