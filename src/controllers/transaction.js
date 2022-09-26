const connection = require("../connection");

async function listTransactions(req, res) {
  const { user } = req;

  //select all transactions
  try {
    const query = `select * from transacoes where usuario_id = $1`;
    const { rows } = await connection.query(query, [user.id]);

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

async function detailTransaction(req, res) {
  const { user } = req;
  const { id } = req.params;

  //selects all information of a selected transaction
  try {
    const query = `select * from transacoes where id = $1 and usuario_id = $2`;
    const { rows, rowCount } = await connection.query(query, [id, user.id]);

    if (rowCount === 0) {
      return res.status(400).json({ mensagem: "Transação não encontrada." });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

async function registerTransaction(req, res) {
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  const { user } = req;

  if (!descricao || !valor || !data || !categoria_id || !tipo) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (tipo !== "entrada" && tipo !== "saida") {
    return res
      .status(400)
      .json({ mensagem: "O tipo deve ser uma 'entrada' ou 'saida'" });
  }

  try {
    //Validating if transaction exists for id
    const verifyCategory = await connection.query(
      "select * from categorias where id = $1",
      [categoria_id]
    );

    if (verifyCategory.rowCount === 0) {
      return res.status(400).json({ mensagem: "Categoria não encotrada" });
    }

    //enter transaction data
    const query = `INSERT into transacoes 
    (descricao, valor, data_cadastro, categoria_id, tipo, usuario_id )
    VALUES ($1, $2, $3, $4, $5, $6)`;

    const { rowCount } = await connection.query(query, [
      descricao,
      valor,
      data,
      categoria_id,
      tipo,
      user.id,
    ]);

    if (rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possivel cadastrar a transação" });
    }

    //return transaction data
    const selectTransaction = `
     SELECT t.id, t.tipo, t.descricao, t.valor, t.data_cadastro as data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome
     FROM transacoes t
     left join categorias c
     on t.categoria_id = c.id
     WHERE t.usuario_id = $1`;

    const { rows: transactionData } = await connection.query(
      selectTransaction,
      [user.id]
    );

    const lastTransactionData = transactionData[transactionData.length - 1];

    return res.status(200).json(lastTransactionData);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

async function updateTransaction(req, res) {
  const { id } = req.params;
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  const { user } = req;

  if (!descricao || !valor || !data || !categoria_id || !tipo) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
  }

  if (tipo !== "entrada" && tipo !== "saida") {
    return res
      .status(400)
      .json({ mensagem: "O tipo deve ser uma 'entrada' ou 'saida'" });
  }

  try {
    //Validating if transaction exists for id
    const verifyTransaction = await connection.query(
      "select * from transacoes where id = $1 and usuario_id = $2",
      [id, user.id]
    );

    if (verifyTransaction.rowCount === 0) {
      return res.status(400).json({
        mensagem: "Não existe transação desse usuario para o id informado ",
      });
    }

    //Validating if the category exists
    const verifyCategory = await connection.query(
      "select * from categorias where id = $1",
      [categoria_id]
    );

    if (verifyCategory.rowCount === 0) {
      return res.status(400).json({ mensagem: "Categoria não encotrada" });
    }

    //Updating transaction data
    const query = `UPDATE transacoes
    SET descricao = $1, 
    valor = $2, 
    data_cadastro = $3, 
    categoria_id = $4, 
    tipo = $5
    Where id = $6`;

    const { rowCount } = await connection.query(query, [
      descricao,
      valor,
      data,
      categoria_id,
      tipo,
      id,
    ]);

    if (rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possivel cadastrar a transação" });
    }

    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

async function deletetransaction(req, res) {
  const { id } = req.params;
  const { user } = req;

  try {
    //Validating if transaction exists for id
    const verifyTransaction = await connection.query(
      "select * from transacoes where id = $1 and usuario_id = $2",
      [id, user.id]
    );

    if (verifyTransaction.rowCount === 0) {
      return res.status(400).json({
        mensagem: "Não existe transação desse usuario para o id informado ",
      });
    }

    const query = `DELETE FROM transacoes WHERE id = $1`;
    const { rowCount } = await connection.query(query, [id]);

    if (rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possivel deletar a transação" });
    }

    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

async function transactionExtract(req, res) {
  const { user } = req;

  try {
    const query = `SELECT * FROM transacoes WHERE usuario_id = $1`;
    const { rows, rowCount } = await connection.query(query, [user.id]);

    if (rowCount === 0) {
      return res.status(400).json({ mensagem: "Transação não encontrada." });
    }

    let typeEntrada = 0;
    let typeSaida = 0;

    for (let row of rows) {
      if (row.tipo === "entrada") {
        typeEntrada += row.valor;
      }

      if (row.tipo === "saida") {
        typeSaida += row.valor;
      }
    }

    return res.status(200).json({
      entrada: typeEntrada,
      saida: typeSaida,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

module.exports = {
  listTransactions,
  detailTransaction,
  registerTransaction,
  updateTransaction,
  deletetransaction,
  transactionExtract,
};
