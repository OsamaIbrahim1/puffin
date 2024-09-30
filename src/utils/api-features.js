import { paginationFunction } from "./pagination.js";

export class APIFeature {
  constructor(query, mongooseQuery) {
    this.query = query;
    this.mongooseQuery = mongooseQuery;
  }

  pagination({ page, size }) {
    const { limit, skip } = paginationFunction({ page, size });
    this.mongooseQuery = this.mongooseQuery.limit(limit).skip(skip);
    return this;
  }
}
