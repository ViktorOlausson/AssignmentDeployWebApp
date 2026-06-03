import * as dotenv from "dotenv";
import type { Request } from "express";
import type { RequestHandler } from "express";
import expressOpenIdConnect from "express-openid-connect";

dotenv.config({ path: ["backend/.env", ".env"], quiet: true });

const { auth, requiresAuth: auth0RequiresAuth } = expressOpenIdConnect;

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
};

const isTestAuthEnabled =
  process.env.ENABLE_TEST_AUTH === "true" || process.env.VITEST === "true";

const testUser = {
  name: "Test User",
  email: "test@example.com",
  sub: "test-user",
};

const hasTestSession = (req: Request) =>
  req.header("x-test-user") === "true" || req.header("cookie")?.includes("test_auth=1");

const setTestOidc = (req: Request) => {
  req.oidc = {
    isAuthenticated: () => true,
    user: testUser,
    login: ({ returnTo }: { returnTo?: string } = {}) => {
      req.res?.cookie("test_auth", "1", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      req.res?.redirect(returnTo || "/profile");
    },
  } as unknown as typeof req.oidc;
};

const testAuthMiddleware: RequestHandler = (req, _res, next) => {
  if (hasTestSession(req)) {
    setTestOidc(req);
  } else if (req.path === "/login") {
    req.oidc = {
      isAuthenticated: () => false,
      login: ({ returnTo }: { returnTo?: string } = {}) => {
        req.res?.cookie("test_auth", "1", {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        });
        req.res?.redirect(returnTo || "/profile");
      },
    } as unknown as typeof req.oidc;
  }

  next();
};

const testRequiresAuth = (): RequestHandler => (req, res, next) => {
  if (hasTestSession(req)) {
    setTestOidc(req);
    next();
    return;
  }

  res.status(401).json({ error: "Unauthorized" });
};

const createAuth0Config = () => {
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const auth0BaseUrl = requiredEnv("AUTH0_BASE_URL");
  const isHttpsBaseUrl = auth0BaseUrl.startsWith("https://");

  return {
    authRequired: false,
    auth0Logout: true,
    errorOnRequiredAuth: true,
    secret: requiredEnv("AUTH0_SECRET"),
    baseURL: auth0BaseUrl,
    clientID: requiredEnv("AUTH0_CLIENT_ID"),
    issuerBaseURL: requiredEnv("AUTH0_ISSUER_BASE_URL"),
    session: {
      cookie: {
        sameSite: isHttpsBaseUrl ? "None" : "Lax",
        secure: isHttpsBaseUrl,
      },
    },
    routes: {
      login: false as const,
      postLogoutRedirect: `${frontendOrigin}/login`,
    },
    ...(clientSecret
      ? {
          clientSecret,
          authorizationParams: {
            response_type: "code",
            response_mode: "query",
            scope: "openid profile email",
          },
        }
      : {}),
  };
};

export const authMiddleware: RequestHandler = isTestAuthEnabled
  ? testAuthMiddleware
  : auth(createAuth0Config());
export const requiresAuth: () => RequestHandler = isTestAuthEnabled
  ? testRequiresAuth
  : auth0RequiresAuth;
