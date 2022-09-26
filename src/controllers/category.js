const connection = require("../connection");

async function listCategories(req, res) {
  try {
    const categories = await connection.query("select * from categorias");

    return res.status(200).json(categories.rows);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

module.exports = {
  listCategories,
};
