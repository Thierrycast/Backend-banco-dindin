CREATE DATABASE dindin

DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios(
  id serial PRIMARY KEY,
  nome varchar(60) NOT NULL,
  email text UNIQUE NOT NULL,
  senha text NOT NULL
);

DROP TABLE IF EXISTS categorias;
CREATE TABLE categorias(
  id serial PRIMARY KEY,
  descricao text
);

DROP TABLE IF EXISTS transacoes;
CREATE TABLE transacoes(
  id serial PRIMARY KEY,
  descricao text,
  valor int ,
  data_cadastro timestamp DEFAULT NOW(),
  categoria_id int references categorias(id) NOT NULL,
  usuario int references usuarios(id) NOT NULL,
  tipo varchar(20) NOT NULL
);

INSERT INTO categorias (descricao) VALUES ('Alimentação');
INSERT INTO categorias (descricao) VALUES ('Assinaturas e Serviços');
INSERT INTO categorias (descricao) VALUES ('Casa');
INSERT INTO categorias (descricao) VALUES ('Mercado');
INSERT INTO categorias (descricao) VALUES ('Cuidados Pessoais');
INSERT INTO categorias (descricao) VALUES ('Educação');
INSERT INTO categorias (descricao) VALUES ('Família');
INSERT INTO categorias (descricao) VALUES ('Lazer');
INSERT INTO categorias (descricao) VALUES ('Pets');
INSERT INTO categorias (descricao) VALUES ('Presentes');
INSERT INTO categorias (descricao) VALUES ('Roupas');
INSERT INTO categorias (descricao) VALUES ('Saúde');
INSERT INTO categorias (descricao) VALUES ('Transporte');
INSERT INTO categorias (descricao) VALUES ('Salário');
INSERT INTO categorias (descricao) VALUES ('Vendas');
INSERT INTO categorias (descricao) VALUES ('Outras receitas');
INSERT INTO categorias (descricao) VALUES ('Outras despesas');