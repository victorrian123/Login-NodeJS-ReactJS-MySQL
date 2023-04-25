const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");
const bcrtpt = require("bcrypt");
const saltRounds = 10;

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "banco",
});

app.use(express.json());
app.use(cors());

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.length == 0) {
      bcrtpt.hash(password, saltRounds, (err, hash) => {
        db.query(
          "INSERT INTO usuarios (email, password) VALUES ( ?,? )",
          [email, hash],
          (err, result) => {
            if (err) {
              res.send(err);
            }
            res.send({ msg: "CADASTRADO COM SUCESSO" });
          },
        );
      });
    } else {
      res.send({ msg: "USUARIO JA CADASTRADO" });
    }
  });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {
    if (err) {
      req.send(err);
    }
    if (result.length > 0) {
      bcrtpt.compare(password, result[0].password, (erro, result) => {
        if (result) {
          res.send({ msg: "USUARIO LOGADO COM SUCESSO" });
        } else {
          res.send({ msg: "SEMHA INCORRETA" });
        }
      });
    } else {
      res.send({ msg: "CONTA NAO ENCONTRADA" });
    }
  });
});

app.listen(3001, () => {
  console.log("Rodando");
});
