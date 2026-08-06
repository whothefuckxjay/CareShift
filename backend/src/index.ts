import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import nurseRoutes from "./routes/nurses.routes";
import shiftRoutes from "./routes/shifts.routes";
import leaveRoutes from "./routes/leave.routes";
import availabilityRoutes from "./routes/availability.routes";
import statsRoutes from "./routes/stats.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/nurses", nurseRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/stats", statsRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`CareShift API listening on http://localhost:${PORT}`);
});
