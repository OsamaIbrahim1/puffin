import db_connection from "../db/db-connection.js";
import { globalResponse } from "./middlewares/global-response-middleware.js";
import * as routers from "./modules/index-routes.js";

export const initiateApp = (app, express) => {
  const port = +process.env.PORT;

  app.use(express.json());

  app.use("/auth", routers.userRouter);
  app.use("/book", routers.bookRouter);

  app.use("*", (req, res, next) => {
    res.status(404).json({ message: "Not Found" });
  });

  app.use(globalResponse);

  db_connection();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};
