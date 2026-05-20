import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireLogin } from "./components/RequireLogin";
import { TopMenu } from "./components/TopMenu";
import { Gyms } from "./routes/Gyms";
import { Login } from "./routes/Login";
import { NewGym } from "./routes/NewGym";
import { NewReview } from "./routes/NewReview";
import { Profile } from "./routes/Profile";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="app-frame">
        <TopMenu />
        <Routes>
          <Route path="/gyms" element={<Gyms />} />
          <Route
            path="/gyms/new"
            element={
              <RequireLogin>
                <NewGym />
              </RequireLogin>
            }
          />

          <Route
            path="/reviews/new"
            element={
              <RequireLogin>
                <NewReview />
              </RequireLogin>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>,
);
