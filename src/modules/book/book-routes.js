import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import * as controller from "./book-controller.js";
import { validationMiddleware } from "../../middlewares/validation-middleware.js";
import * as validator from "./book-validation-schema.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { allowedExtensions } from "../../utils/allowedExtentions.js";

const router = Router();

router.post(
  "/createBook",
  auth([systemRoles.Admin]),
  validationMiddleware(validator.createBookSchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(controller.createBook)
);

router.put(
  "/updateBook/:bookId",
  auth([systemRoles.Admin]),
  validationMiddleware(validator.updateBookSchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(controller.updateBook)
);

router.delete(
  "/deleteBook/:bookId",
  auth([systemRoles.Admin]),
  validationMiddleware(validator.deleteBookSchema),
  expressAsyncHandler(controller.deleteBook)
);

router.get(
  "/getBookById/:bookId",
  auth([systemRoles.Admin, systemRoles.User]),
  validationMiddleware(validator.getBookByIdSchema),
  expressAsyncHandler(controller.getBookById)
);

router.get(
  "/getAllBooks",
  auth([systemRoles.Admin, systemRoles.User]),
  validationMiddleware(validator.getAllBooksSchema),
  expressAsyncHandler(controller.getAllBooks)
);

export default router;
