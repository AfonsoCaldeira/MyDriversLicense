const express = require('express');
const router = express.Router();
const User = require("../models/alunoModel");
const utils = require("../config/utils");
const auth = require("../middleware/auth");
const tokenSize = 64;
const bcrypt = require("bcrypt");
const pool = require("../config/database");

router.use(express.json());



router.post('/auth', async function (req, res) {
    try {
        console.log("Login user ");
        let user = new User();
        user.email = req.body.aluno_email;
        user.pass = req.body.aluno_pass;

        const token = utils.genToken(tokenSize);
        console.log("Generated token:", token);

        req.session.token = token;
        // Dentro da rota de autenticação
        let result = await User.checkLogin(user);

console.log("Result from checkLogin:", result);

if (result.status != 200) {
    res.status(result.status).send(result.result);
    return;
}


        const alunoId = result.result.id;
        user = result.result;
        user.token = token;
        result = await User.saveToken(user);
        console.log(user);

        res.status(200).send({ msg: "Successful Login!", alunoId: alunoId });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.get('/auth', auth.verifyAuth, async function (req, res, next) {
    try {
        console.log("Get authenticated user");
        if (!req.user || !req.user.id) {
            return res.status(400).send({ msg: 'User not properly authenticated' });
        }

        let result = await User.getUserById(req.user.id);

        if (result.status !== 200) {
            return res.status(result.status).send(result.result);
        }

        let user = new User();
        user.id = req.user.id;
        user.nome = req.user.nome;
        user.escola = req.user.escola;

        res.status(result.status).send(user);

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});


router.post('/register', async function (req, res) {
    try {
        const user = {
            nome: req.body.nome,
            mail: req.body.email,
            pass: req.body.pass,
            uni: req.body.escola
        };

        console.log('Received registration request:', user);

        const result = await User.register(user);

        console.log('Registration result:', result);

        res.status(result.status).send(result.result);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.post('/auth', async function (req, res) {
    try {
        console.log("Login user");
        let user = new User();
        user.email = req.body.email;
        user.pass = req.body.pass;
        let result = await User.checkLogin(user);
        if (result.status !== 200) {
            res.status(result.status).send(result.result);
            return;
        }
        const authenticatedUser = result.result;
        res.status(200).send({ msg: "Successful Login!", user: authenticatedUser });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.get('/listar-escolas', async function (req, res) {
    try {
        const userInstance = new User();
        const escolas = await userInstance.listarEscolas();
        res.status(200).json({ escolas });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao listar escolas." });
    }
});




module.exports = router;

