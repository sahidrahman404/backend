import express from "express";
import cors from "cors";
import { config } from "@/config";
import userRouter from "@/user";
import bodyParser from "body-parser";
import {
  appError,
  injectDatabase,
  validateRequest,
} from "@/middleware/middlewareServices";
import emailVerificationRouter from "@/email-verification-token";
import resetPasswordRouter from "@/reset-password-token";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(injectDatabase);
app.use(validateRequest);

const v1 = express.Router();

v1.get("/health-check", (_, res) => {
  res.json({ healthy: true });
});

v1.use(userRouter);
v1.use(emailVerificationRouter);
v1.use(resetPasswordRouter);

app.use("/v1", v1);

app.use(appError);

app.listen(config.server.port, () =>
  console.log(`App listening on port ${config.server.port}`),
);
