const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors")

const app = express();
app.use(cors())
app.use(express.json());
const porta = 3001;

const Produto = mongoose.model("Produto", {
    nomeProduto: String,
    id: String,
    imagem: String,
    favoritado: Boolean,
    tipo: String
});

// Rota GET para obter os dados do MongoDB
app.get("/", async (req, res) => {
    try {
        // Obter os dados diretamente do MongoDB
        const dados = await Produto.find();

        res.send(dados);
    } catch (error) {
        console.error("Erro ao obter dados do MongoDB:", error.message);
        res.status(500).send("Erro interno do servidor");
    }
});

// Rota PUT para modificar dados no MongoDB
app.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nomeProduto, imagem, favoritado, tipo } = req.body;

        // Encontrar o produto pelo ID e atualizar os campos desejados
        const produtoAtualizado = await Produto.findByIdAndUpdate(
            id,
            { nomeProduto, imagem, favoritado, tipo },
            { new: true } // Retorna o documento atualizado
        );

        if (!produtoAtualizado) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        res.json(produtoAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar produto:", error.message);
        res.status(500).send("Erro interno do servidor");
    }
});

// Rota GET para obter dados da API externa e salvar no MongoDB
app.post("/", async (req, res) => {
    try {
        const response = await axios.get("https://run.mocky.io/v3/5ab15ba4-fe75-4a4f-b54c-7efa540e3e3d");
        const endpoint = response.data.products;

        const dados = endpoint.map((produto) => ({
            nomeProduto: produto.name,
            id: produto.product.details.sku,
            imagem: produto.product.image,
            favoritado: false,
            tipo: produto.productType.name
        }));

        // Salvar os dados no MongoDB
        await Produto.insertMany(dados);

        res.send(dados);
    } catch (error) {
        console.error("Erro ao chamar a API externa:", error.message);
        res.status(500).send("Erro interno do servidor");
    }
});

mongoose.connect('mongodb+srv://wishlist:HDHnaP6kTu8ysxrB@starwars-api.0t1waiu.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
        console.log("Conectado ao MongoDB");
        // Iniciar o servidor após conectar ao MongoDB
        app.listen(porta, () => {
            console.log("Rodando na porta: " + porta);
        });
    })
    .catch((error) => {
        console.error("Erro ao conectar ao MongoDB:", error.message);
    });
