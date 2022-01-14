import { Sequelize } from "sequelize";

// Config database dengan sequelize
const db = new Sequelize("dbauthnodejs", "root", "", {
    host: "localhost",
    dialect: "mysql"
});

export default db;