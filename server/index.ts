import {safeError,apiHeaders,requireSameOrigin,publicOrigin} from "./security";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.disable("x-powered-by");
app.use("/api",apiHeaders,requireSameOrigin(publicOrigin()));
app.use((req,res,next)=>{
 const start=Date.now();res.on("finish",()=>{
 if(req.path.startsWith('/api'))log(`${req.method} ${typeof req.route?.path==='string'?req.route.path:'<unmatched>'} ${res.statusCode} ${Date.now()-start}ms`);
 });next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use(safeError);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
