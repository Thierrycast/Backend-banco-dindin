const jwt = require("jsonwebtoken");
const connection = require("../connection");
const jwtSecret = require("../secretPassword");

const verifyToken = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(404).json({ mensagem: "token não informado" });
  }

  try {
    const token = authorization.replace("Bearer", "").trim();
    const { id } = jwt.verify(token, jwtSecret);

    const query = `select * from usuarios where id = $1`;
    const { rows, rowCount } = await connection.query(query, [id]);

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "O usuario não foi encontrado" });
    }

    const { senha: senhaUser, ...user } = rows[0];

    req.user = user;
    next();
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = verifyToken;
