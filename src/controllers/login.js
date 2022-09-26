const connection = require("../connection");
const securePassword = require("secure-password");
const pwd = securePassword();
const jwt = require("jsonwebtoken");
const jwtSecret = require("../secretPassword");

async function loginUser(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos são obrigatorios." });
  }

  try {
    const { rows, rowCount } = await connection.query(
      "select * from usuarios where email = $1",
      [email]
    );

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ mensagem: "Usuário e/ou senha inválido(s)." });
    }

    const usuario = rows[0];

    const result = await pwd.verify(
      Buffer.from(senha),
      Buffer.from(usuario.senha, "hex")
    );

    switch (result) {
      case securePassword.INVALID_UNRECOGNIZED_HASH:
      case securePassword.INVALID:
        return res
          .status(400)
          .json({ mensagem: "Usuário e/ou senha inválido(s)." });
      case securePassword.VALID:
        break;
      case securePassword.VALID_NEEDS_REHASH:
        try {
          const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");
          const usuario = await conexao.query(
            "update usuarios set senha = $1 where email = $2",
            [hash, email]
          );
        } catch {}
        break;
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
      jwtSecret
    );

    const { senha: responseSenha, ...userData } = usuario;

    return res.status(200).json({
      usuario: userData,
      token,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

module.exports = {
  loginUser,
};
