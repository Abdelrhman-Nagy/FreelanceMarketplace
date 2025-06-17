// server/index.ts
import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import Vision from "@hapi/vision";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var server = Hapi.server({
  port: process.env.PORT || 5e3,
  host: "0.0.0.0",
  routes: {
    cors: {
      origin: ["*"],
      headers: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
      ],
      additionalHeaders: ["cache-control", "x-requested-with"],
    },
    files: {
      relativeTo: path.join(__dirname, "../public"),
    },
  },
});
var dbConfig = {
  type: "sqlserver",
  connectionString:
    process.env.DATABASE_URL ||
    "Server=localhost;Database=freelancing_platform;User Id=app_user;Password=Xman@123;Encrypt=true;TrustServerCertificate=true;",
  server: process.env.DB_SERVER || "localhost",
  user: process.env.DB_USER || "app_user",
  password: process.env.DB_PASSWORD || "Xman@123",
  database: process.env.DB_DATABASE || "freelancing_platform",
  port: parseInt(process.env.DB_PORT || "1433"),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};
server.route({
  method: "GET",
  path: "/api/test",
  handler: (request, h) => {
    return {
      status: "success",
      message: "API is working correctly",
      timestamp: /* @__PURE__ */ new Date().toISOString(),
      server: "Node.js Hapi",
      database: dbConfig.type,
      config: {
        server: dbConfig.server,
        database: dbConfig.database,
        port: dbConfig.port,
      },
    };
  },
});

server.route({
  method: "GET",
  path: "/api/health",
  handler: (request, h) => {
    return {
      status: "healthy",
      service: "Freelancing Platform API",
      version: "1.0.0",
      timestamp: /* @__PURE__ */ new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: dbConfig.type,
      connection: {
        server: dbConfig.server,
        database: dbConfig.database,
        port: dbConfig.port,
        user: dbConfig.user,
      },
    };
  },
});
server.route({
  method: "GET",
  path: "/api/my-stats",
  handler: (request, h) => {
    return {
      totalJobs: 15,
      activeProposals: 3,
      completedContracts: 8,
      totalEarnings: 12500,
      status: "success",
    };
  },
});
var init = async () => {
  await server.register([Inert, Vision]);
  server.route({
    method: "GET",
    path: "/src/{param*}",
    handler: (request, h) => {
      const filePath = request.params.param;
      const response = h.file(filePath);
      if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
        return response.type("application/javascript");
      }
      if (filePath.endsWith(".css")) {
        return response.type("text/css");
      }
      return response;
    },
    options: {
      files: {
        relativeTo: path.join(__dirname, "../public/src"),
      },
    },
  });
  server.route({
    method: "GET",
    path: "/{param*}",
    handler: (request, h) => {
      const requestPath = request.path;
      if (requestPath.startsWith("/api/")) {
        return h.continue;
      }
      if (requestPath.includes(".") && !requestPath.startsWith("/src/")) {
        return h.file(requestPath);
      }
      return h.file("index.html");
    },
    options: {
      files: {
        relativeTo: path.join(__dirname, "../public"),
      },
    },
  });
  await server.start();
  console.log(`Server running on port ${server.info.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Server: Hapi.js`);
};
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
init();
