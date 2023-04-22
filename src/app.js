import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
// import joi from "joi";

// Criação do servidor
const app = express();

// Configurações
app.use(cors());
app.use(express.json());
dotenv.config();

// Conexão com o Banco de Dados
const mongoClient = new MongoClient(process.env.MONGO_URI);
try {
  await mongoClient.connect();
  console.log("MongoDB conectado!");
} catch (err) {
  console.log(err.message);
}
export const db = mongoClient.db();

// Schemas
// export const usuarioSchema = joi.object({
//     nome: joi.string().required()
// })


// Endpoints
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body

  try{
    //verificar se esse e-mail ja foi cadastrado
    const usuario = await db.collection("usuarios").findOne({email})
    if(usuario) return res.status(409).send("E-mail já cadastrado")
  
    //criptografar senha
    const hash =bcrypt.hashSync(senha, 10)

    //criar conta e guardar senha encriptografada no bd
    await db.collection("usuarios").insertOne({nome, email, senha: hash})
    res.status(201).send("Conta criada com sucesso!")
  } catch (err){
    res.status(500).send(err.message)
  }
  
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body

  try{
  //verificar se o e-mail esta cadastrado
  const usuario = await db.collection("usuario").findOne({email})
  if(!usuario) return res.status(404).send("E-mail não cadastrado")

  //verificar se a senha digitada corresponde com a criptografada
  const senhaCorreta = bcrypt.compareSync(senha, usuario.senha)
  if(!senhaCorreta) return res.status(401).send("Senha Incorreta")

  //se deu tudo certo, criar um token para enviar ao usuario
  const token = uuid()

  //guardar o token e o id do usuario para saber que ele esta logado
  await db.collection("sessoes").insertOne(idUsuario: usuario._id, token)

  //finalizar com status de sucesso e enviar token para o cliente
  res.status(200).send(token)
  
  } catch(err) {
    res.status(500).send(err.message)
  }
});

app.post("/nova-transacao/:tipo", async (req, res) => {
  const { xxx } = req.body;
  return res.status(422).send("Todos os campos são obrigatórios!");
});

app.get("/home", async (req, res) => {
  db.collection("home")
    .find()
    .toArray()
    .then((home) => res.status(200).send(home))
    .catch((err) => res.status(500).send(err.message));
});

// Deixa o app escutando, à espera de requisições
const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
