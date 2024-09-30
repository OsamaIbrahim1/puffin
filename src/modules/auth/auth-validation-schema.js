import Joi from "joi";
import { systemRoles } from "../../utils/system-roles.js";
import * as regex from "../../utils/regex.js";

export const signUpSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).required().pattern(regex.nameRegex),
    email: Joi.string().email().required().pattern(regex.emailRegex),
    password: Joi.string().min(6).max(20).required().pattern(regex.passwordRegex),
    role: Joi.string().valid(systemRoles.Admin, systemRoles.User).default(systemRoles.User).required(),
  }),
};

export const signInSchema = {
  body: Joi.object({
    email: Joi.string().email().required().pattern(regex.emailRegex),
    password: Joi.string().min(6).max(20).required().pattern(regex.passwordRegex),
  }),
};
