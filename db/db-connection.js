import mongoose from "mongoose";

const db_connection = async () => {
  await mongoose
    .connect(process.env.DATABASE_CONNECTION_URL)
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log("Error connecting to database", err);
    });
};

export default db_connection;
