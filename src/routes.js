const express = require("express");
const route = express();
const verifyToken = require("./filter/verifyToken");

const users = require("./controllers/users");
const login = require("./controllers/login");
const category = require("./controllers/category");
const transaction = require("./controllers/transaction");

//Users
route.post("/usuario", users.registerUser);
route.get("/usuario", verifyToken, users.detailUser);
route.put("/usuario", verifyToken, users.updateUser);

//login
route.post("/login", login.loginUser);

//category
route.get("/categoria", verifyToken, category.listCategories);

//transaction
route.get("/transacao", verifyToken, transaction.listTransactions);
route.get("/transacao/extrato", verifyToken, transaction.transactionExtract);
route.get("/transacao/:id", verifyToken, transaction.detailTransaction);
route.post("/transacao", verifyToken, transaction.registerTransaction);
route.put("/transacao/:id", verifyToken, transaction.updateTransaction);
route.delete("/transacao/:id", verifyToken, transaction.deletetransaction);

module.exports = route;
