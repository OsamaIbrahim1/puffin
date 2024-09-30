import Joi from "joi";
import { generalRules } from "../../utils/general.validation.rule.js";

export const createBookSchema = {
  body: Joi.object({
    title: Joi.string().min(2).max(60),
    author: Joi.string().min(3).max(50),
    pages: Joi.number(),
    price: Joi.number(),
    summary: Joi.string().min(10).max(1000),
  }).required(),
  headers: generalRules.headersRules,
};

export const updateBookSchema = {
  body: Joi.object({
    title: Joi.string().min(2).max(60),
    author: Joi.string().min(3).max(50),
    pages: Joi.number(),
    price: Joi.number(),
    summary: Joi.string().min(10).max(1000),
  }),
  headers: generalRules.headersRules,
  params: Joi.object({ bookId: generalRules.dbId }),
};

export const deleteBookSchema = {
  headers: generalRules.headersRules,
  params: Joi.object({ bookId: generalRules.dbId }),
};

export const getBookByIdSchema = {
  headers: generalRules.headersRules,
  params: Joi.object({ bookId: generalRules.dbId }),
};

export const getAllBooksSchema = {
  headers: generalRules.headersRules,
  query: Joi.object({
    page: Joi.number().required(),
    size: Joi.number().required(),
  }),
};
