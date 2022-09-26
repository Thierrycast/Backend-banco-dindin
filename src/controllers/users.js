const connection = require("../connection");
const securePassword = require("secure-password");
const pwd = securePassword();

async function registerUser(req, res) {
  const { nome, email, senha } = req.body;

  //mandatory field verification
  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatorios" });
  }

  try {
    const verifyEmail = await connection.query(
      "select * from usuarios where email = $1",
      [email]
    );

    //checking if the email already exists in the table
    if (verifyEmail.rowCount > 0) {
      return res.status(400).json({
        mensagem: "Já existe usuário cadastrado com o e-mail informado.",
      });
    }

    //password encryption
    const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");

    //inserting data into the table
    const query = `insert into usuarios(nome, email, senha) values($1, $2, $3)`;
    const user = await connection.query(query, [nome, email, hash]);

    if (user.rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "não foi possivel cadastrar o usuario." });
    }

    const responseUser = await connection.query(
      "select * from usuarios where email = $1",
      [email]
    );

    const { senha: respnseSenha, ...userData } = responseUser.rows[0];

    return res.status(201).json(userData);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

async function detailUser(req, res) {
  const { user } = req;

  try {
    const query = `select * from usuarios where id = $1`;
    const { rows, rowCount } = await connection.query(query, [user.id]);

    if (rowCount === 0) {
      return res.status(400).json({ mensagem: "Usuario não encontrado" });
    }

    const { senha, ...userData } = rows[0];

    return res.status(200).json(userData);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

async function updateUser(req, res) {
  const { nome, email, senha } = req.body;
  const { user } = req;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatorios" });
  }

  try {
    const verifyNewEmail = await connection.query(
      "select * from usuarios where email = $1 and id <> $2",
      [email, user.id]
    );

    if (verifyNewEmail.rowCount > 0) {
      return res.status(400).json({
        mensagem:
          "O e-mail informado já está sendo utilizado por outro usuário.",
      });
    }

    //password encryption
    const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");

    //data update
    const query = `
    UPDATE usuarios 
    SET nome = $1 ,
    email = $2 ,
    senha = $3
    WHERE id = $4`;

    const { rowCount } = await connection.query(query, [
      nome,
      email,
      hash,
      user.id,
    ]);

    if (rowCount === 0) {
      return res.status(400).json({
        mensagem: "Não foi possivel atualizar o usuário",
      });
    }

    return res.status(200).send();
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

module.exports = {
  registerUser,
  detailUser,
  updateUser,
};
