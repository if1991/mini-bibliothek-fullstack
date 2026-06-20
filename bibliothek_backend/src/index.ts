import express from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

import { ObjectIdScalar } from "../scalars/objektIdScalar";
import { autorResolvers } from "./resolvers/autorResolvers";
import { buchResolvers } from "./resolvers/buchResolvers";
import { userResolvers } from "./resolvers/userResolvers";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typeDefs = fs.readFileSync(
  path.join(__dirname, "../graphql/schema.graphql"),
  "utf-8"
);

const resolvers = {
  ObjectId: ObjectIdScalar,

  Query: {
    ...autorResolvers.Query,
    ...buchResolvers.Query,
    ...userResolvers.Query,
  },

  Mutation: {
    ...autorResolvers.Mutation,
    ...buchResolvers.Mutation,
    ...userResolvers.Mutation,
  },
};

type BenutzerRolle = "USER" | "ADMIN";

interface GraphQLContext {
  userId?: string;
  rolle?: BenutzerRolle;
}

const PORT = Number(process.env.PORT) || 4000;

function umgebungsvariableLesen(name: string): string {
  const wert = process.env[name];

  if (!wert) {
    throw new Error(
      `${name} wurde im Backend nicht konfiguriert.`
    );
  }

  return wert;
}

const JWT_SECRET: string =
  umgebungsvariableLesen("JWT_SECRET");

const MONGO_URI: string =
  umgebungsvariableLesen("MONGO_URI");

async function startServer(): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
  });

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Verbunden mit MongoDB");
  } catch (error) {
    console.error(
      "Fehler bei der MongoDB-Verbindung:",
      error
    );

    process.exit(1);
  }

  await server.start();

  app.use(cors());
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware<GraphQLContext>(server, {
      context: async ({ req }): Promise<GraphQLContext> => {
        const authHeader =
          req.headers.authorization || "";

        if (!authHeader.startsWith("Bearer ")) {
          return {};
        }

        const token = authHeader
          .replace("Bearer ", "")
          .trim();

        try {
          const payload = jwt.verify(
            token,
            JWT_SECRET
          );

          if (
            typeof payload === "string" ||
            typeof payload.userId !== "string"
          ) {
            return {};
          }

          const rolle: BenutzerRolle =
            payload.rolle === "ADMIN"
              ? "ADMIN"
              : "USER";

          return {
            userId: payload.userId,
            rolle,
          };
        } catch {
          console.warn(
            "Ungültiger oder abgelaufener Token."
          );

          return {};
        }
      },
    })
  );

  httpServer.listen(PORT, () => {
    console.log(
      `Server läuft auf http://localhost:${PORT}/graphql`
    );
  });
}

startServer().catch((error) => {
  console.error(
    "Der Backend-Server konnte nicht gestartet werden:",
    error
  );

  process.exit(1);
});
