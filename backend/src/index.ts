import dotenv from "dotenv";
import express from "express";
import type { ErrorRequestHandler } from "express";
import cors from "cors";
import { prisma } from "./prisma.js";
import { authMiddleware, isTestAuthEnabled, requiresAuth } from "./auth.js";
import logger from "./logger.js";

dotenv.config({ path: ["backend/.env", ".env"], quiet: true });

export const app = express();

type HttpError = Error & {
  status?: number;
  statusCode?: number;
};

const getFrontendOrigin = () => (process.env.FRONTEND_ORIGIN || "http://localhost:5173").replace(/\/$/, "");
const getFrontendLoginUrl = () => `${getFrontendOrigin()}/login`;

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(authMiddleware);

app.get("/login", (req, res) => {
  const frontendOrigin = getFrontendOrigin();

  logger.info("Login started");

  if (isTestAuthEnabled) {
    res.cookie("test_auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    res.redirect(`${frontendOrigin}/profile`);
    return;
  }

  res.oidc.login({
    returnTo: `${frontendOrigin}/profile`,
  });
});

app.get("/logout", async (req, res, next) => {
  const loginUrl = getFrontendLoginUrl();

  logger.info("Logout started");

  if (isTestAuthEnabled) {
    res.clearCookie("test_auth", {
      path: "/",
    });
    res.redirect(loginUrl);
    return;
  }

  try {
    await res.oidc.logout({
      returnTo: loginUrl,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/ping", (req, res) => {
  logger.info("Ping checked");
  res.json({ message: "pong" });
});

app.get("/gyms", async (req, res) => {
  const gyms = await prisma.gym.findMany({
    include: {
      reviews: true,
    },
  });

  logger.info(`Gyms listed: ${gyms.length}`);
  res.status(200).json(gyms);
});

app.get("/gyms/:id", async (req, res) => {
  const id = Number(req.params.id);

  const gym = await prisma.gym.findUnique({
    where: { id },
    include: {
      reviews: true,
    },
  });

  if (!gym) {
    logger.info(`Gym not found: ${id}`);
    return res.status(404).json({ error: "Gym not found" });
  }

  logger.info(`Gym loaded: ${id}`);
  res.status(200).json(gym);
});

app.post("/gyms", requiresAuth(), async (req, res) => {
  const { name, location } = req.body;

  if (!name || !location) {
    logger.info("Gym create rejected: missing fields");
    return res.status(400).json({
      error: "Name and location are required",
    });
  }

  const gym = await prisma.gym.create({
    data: {
      name,
      location,
    },
  });

  logger.info(`Gym created: ${gym.id}`);
  res.status(201).json(gym);
});

app.post("/gyms/:id/reviews", requiresAuth(), async (req, res) => {
  const gymId = Number(req.params.id);
  const { rating, comment } = req.body;

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
  });

  if (!gym) {
    logger.info(`Review create rejected: gym ${gymId} not found`);
    return res.status(404).json({ error: "Gym not found" });
  }

  if (!rating || !comment) {
    logger.info(`Review create rejected: missing fields for gym ${gymId}`);
    return res.status(400).json({
      error: "Rating and comment are required",
    });
  }

  const review = await prisma.review.create({
    data: {
      rating: Number(rating),
      comment,
      gymId,
    },
  });

  logger.info(`Review created: ${review.id} for gym ${gymId}`);
  res.status(201).json(review);
});

app.get("/profile", requiresAuth(), (req, res) => {
  logger.info("Profile loaded");
  res.status(200).json({
    user: req.oidc.user,
  });
});

const errorHandler: ErrorRequestHandler = (error: HttpError, req, res, _next) => {
  const status = error.status || error.statusCode || 500;

  if (status === 401) {
    logger.info(`Unauthorized request: ${req.method} ${req.path}`);
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  logger.error(error.stack || error.message || "Unexpected server error");
  res.status(status).json({ error: "Internal server error" });
};

app.use(errorHandler);
