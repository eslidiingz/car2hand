import { Elysia } from "elysia";

import { cors } from "@elysiajs/cors";

import { authRoutes, usersRoutes } from "./auth";
import { listingRoutes } from "./listings";

const app = new Elysia()
  .use(cors())
  .use(authRoutes)
  .use(usersRoutes)
  .use(listingRoutes)
  .get("/", () => "Hello Elysia")
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
