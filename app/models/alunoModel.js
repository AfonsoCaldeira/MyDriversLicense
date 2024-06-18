const pool = require("../config/database");
const bcrypt = require("bcrypt");

function dbUserToUser(dbUser){
    let user= new User();
    user.id = dbUser.aluno_id;
    user.nome = dbUser.aluno_nome;
    user.email = dbUser.aluno_email;
    user.pass = dbUser.aluno_pass;
    user.escola = dbUser.aluno_escola;
    user.token = dbUser.aluno_token;
    return user;
}

class User {
    constructor(id, nome, email, pass, escola, token){
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.pass = pass;
        this.escola = escola;
        this.token = token;
    }

    static async getUserById(id){
        let dbResult=await pool.query("Select*from estudante where aluno_id=$1", [id]);
        let dbUsers= dbResult.rows;
        if(!dbUsers.length)
            return { status: 404, result:{msg: "No user found for that id."} } ;
        let dbUser= dbUsers[0];
        return {status: 200, result:
            new User(dbUser.aluno_id, dbUser.aluno_nome, dbUser.aluno_email, dbUser.aluno_pass, dbUser.aluno_escola)};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
    }
    
    static async register(user){
        try {
            let dbResult = await pool.query("SELECT * FROM aluno WHERE aluno_email = $1", [user.email]);
            let dbUsers = dbResult.rows;
            if (dbUsers.length) {
                return {
                    status: 400,
                    result: [{
                        location: "body",
                        param: "email",
                        msg: "That email already exists"
                    }]
                };
            }
          

            const hashedPassword = await bcrypt.hash(user.pass, 10);
            
            dbResult = await pool.query(
                `INSERT INTO aluno (aluno_nome, aluno_email, aluno_pass, aluno_escola)
                     VALUES ($1, $2, $3, $4)`,
                [user.nome, user.email, hashedPassword, user.escola]
            );

            return { status: 200, result: { msg: "Registered! You can now log in." } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async checkLogin(user) {
        try {
            console.log("Checking login for email:", user.email);
    
            const loginQuery = "SELECT * FROM aluno WHERE aluno_email = $1";
            const dbResult = await pool.query(loginQuery, [user.email]);
    
            console.log("DB Result:", dbResult);
    
            if (dbResult.rows.length === 0) {
                console.log("Email not found");
                return { status: 401, result: { msg: "Email not found" } };
            }
    
            const dbUser = dbResult.rows[0];
            const isPassValid = await bcrypt.compare(user.pass, dbUser.aluno_pass);
    
            if (!isPassValid) {
                console.log("Incorrect password");
                return { status: 401, result: { msg: "Incorrect password" } };
            }
    
            const authenticatedUser = dbUserToUser(dbUser);
    
            console.log("Login successful:", authenticatedUser);
    
            return { status: 200, result: authenticatedUser };
        } catch (err) {
            console.log("Error during login check:", err);
            return { status: 500, result: err };
        }
    }

    static async saveToken(user) {
        try {
            console.log("Saving token for user:", user.id);
            console.log("Token to be saved:", user.token);
    
            let dbResult = await pool.query(`Update aluno set aluno_token=$1 where aluno_id = $2`, [user.token, user.id]);
    
            console.log("Token saved for user:", user.id);
            return { status: 200, result: { msg: "Token saved!" } };
        } catch (err) {
            console.log("Error saving token:", err);
            return { status: 500, result: err };
        }
    }

    async listarEscolas() {
        const query = 'SELECT DISTINCT admin_escola FROM administrador;';
        try {
            const result = await pool.query(query);
            const escolas = result.rows.map(row => row.admin_escola);
            return escolas;
        } catch (error) {   
            console.error('Erro ao listar escolas:', error);
            throw error;
        }
    }

} 
module.exports = User;

