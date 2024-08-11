import express from "express";
import AppError from "@/error/appError";
import { getSessionStats } from "@/session/sessionServices";

const sessionRouter = express();
const session = express.Router();

session.get("/stats", async (req, res, next) => {
  try {
    const user = res.locals.user;
    if (!user) {
      throw new AppError(400, "Unauthorized");
    }

    const sessionsStats = await getSessionStats(req.db);
    res.status(200).json({
      success: true,
      data: sessionsStats,
    });
  } catch (err) {
    next(err);
  }
});

sessionRouter.use("/sessions", session);

export default sessionRouter;
