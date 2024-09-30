import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { validationMiddleware } from "../../middlewares/validation-middleware.js";
import * as controller from "./auth-controller.js";
import * as validator from "./auth-validation-schema.js";

const router = Router();

router.post(
  "/signUp",
  validationMiddleware(validator.signUpSchema),
  expressAsyncHandler(controller.signUp)
);

router.post(
  "/signIn",
  validationMiddleware(validator.signInSchema),
  expressAsyncHandler(controller.signIn)
);


export default router;
