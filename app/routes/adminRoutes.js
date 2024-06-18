const express = require('express');
const router = express.Router();
const Admin = require("../models/adminModel");
const utils = require("../config/utils");
const auth = require("../middleware/auth");
const tokenSize = 64;
router.use(express.json());

router.get('/auth', auth.verifyAuth, async function (req, res, next) {
    try {
        console.log("Get authenticated admin");
        let result = await Admin.getAdminById(req.admin.id);
        if (result.status != 200)
            res.status(result.status).send(result.result);
        let admin = new Admin();
        admin.id = req.admin.id;
        admin.escola = req.admin.escola;
        
        res.status(result.status).send(admin);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.post('/auth', async function (req, res, next) {
    try {
        console.log("Admin user ");
        let admin = new Admin();
        admin.email = req.body.adminmail;
        admin.pass = req.body.password;

        const token = utils.genToken(tokenSize);
        console.log("Generated token:", token);

        req.session.token = token;

        let result = await Admin.login(admin);
        if (result.status != 200) {
            res.status(result.status).send(result.result);
            return;
        }

        // Obtenha o ID do administrador a partir do resultado
        const adminId = result.result.id;

        admin = result.result;
        admin.token = token;
        result = await Admin.saveToken(admin);
        console.log(admin);

        // Inclua o ID do administrador na resposta
        res.status(200).json({ msg: "Successful Login!", adminId: adminId });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});


router.post('/register', async function (req, res) {
    try {
        const admin = {
            mail: req.body.adminmail,
            uni: req.body.adminuni,
            pass: req.body.password
        };

        const result = await Admin.register(admin);

        res.status(result.status).send(result.result);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.post('/auth', async function (req, res) {
    try {
        console.log("Login user ");
        let admin = new Admin();
        admin.email = req.body.adminmail;
        admin.pass = req.body.password;
        let result = await Admin.login(admin);

        if (result.status != 200) {
            res.status(result.status).send(result.result);
            return;
        }

        const authenticatedAdmin = result.result;

        // Gere um token e envie de volta para o cliente
        const token = utils.genToken(tokenSize);
        authenticatedAdmin.token = token;

        // Salve o token no banco de dados ou onde quer que você esteja armazenando
        const saveTokenResult = await Admin.saveToken(authenticatedAdmin);

        if (saveTokenResult.status != 200) {
            res.status(saveTokenResult.status).send(saveTokenResult.result);
            return;
        }

        // Envie a resposta com o token e o ID do admin para o cliente
        res.status(200).send({ msg: "Successful Login!", adminId: authenticatedAdmin.id, token });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});



router.delete('/auth', auth.verifyAuth, async function (req, res, next) {
    try {
        console.log("Logout admin");
        req.session = null;
        let result = await Admin.saveToken(req.admin);

        if (result.status === 200) {
            res.status(204).send({ message: "Admin logged out successfully" }); 
        } else {
            res.status(result.status).send({ error: result.result });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
module.exports = router;