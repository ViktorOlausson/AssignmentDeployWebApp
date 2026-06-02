import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";
import { authMiddleware, requiresAuth } from "./auth.js";
import logger from "./logger.js";

dotenv.config({ path: ["backend/.env", ".env"], quiet: true });

export const app = express();

app.set("trust proxy", 1);

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(authMiddleware);

app.get("/login", (req, res) => {
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

  logger.info("Login started");

  if (process.env.NODE_ENV === "test") {
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

app.delete("/gyms/:id", requiresAuth(), async (req, res) => {
  const id = Number(req.params.id);

  const gym = await prisma.gym.findUnique({
    where: { id },
  });

  if (!gym) {
    logger.info(`Gym delete rejected: ${id} not found`);
    return res.status(404).json({ error: "Gym not found" });
  }

  await prisma.gym.delete({
    where: { id },
  });

  logger.info(`Gym deleted: ${id}`);
  res.status(200).json({ message: "Gym deleted" });
});
