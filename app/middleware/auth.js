// auth.js
const Admin = require('../models/adminModel');

// Função de middleware para verificar a autenticação do usuário
module.exports.verifyAuth = async function (req, res, next) {
    try {
        // Obtenha o token de autenticação da sessão do usuário
        let token = req.session.token;

        if (!token) {
            // Se não houver token, o usuário não está autenticado
            return res.status(401).json({ msg: 'Please log in.' });
        }

        // Verifique se o token é válido consultando o banco de dados
        const result = await Admin.getUserByToken(token);

        if (result.status !== 200) {
            // Se o token não for válido, retorne uma resposta não autorizada
            return res.status(result.status).json(result.result);
        }

        // Se o token for válido, você pode armazenar os detalhes do usuário autenticado no objeto de solicitação
        req.admin = result.result;

        // Continue para a próxima rota/middleware
        next();
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
};