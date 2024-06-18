const pool = require("../config/database");
const auth = require("../config/utils");
const bcrypt = require("bcrypt");

function dbAdminToAdmin(dbAdmin) {
    let admin = new admin();
    admin.id = dbAdmin.admin_id;
    admin.email = dbAdmin.admin_email;
    admin.pass = dbAdmin.admin_pass;
    admin.escola = dbAdmin.admin_escola;
    admin.telefone = dbAdmin.admin_telefone;
    return admin;
}

class Admin {
    constructor(id, email, pass, escola, telefone, token) {
        this.id = id;
        this.email = email;
        this.pass = pass;
        this.escola = escola;
        this.telefone = telefone;
        this.token = token;
    }
    export() {
        let admin = new Admin();
        admin.id = this.id;
        return admin;
    }

    static async getAdminById(id) {
        try{
            let dbResult = await pool.query("Select * from administrador where admin_id=$1", [id]);
            let dbAdmins = dbResult.rows;
            if (!dbAdmins.legth)
                return{ status: 404, result:{msg: "No user found for that id."} };
            let dbAdmin = dbAdmins[0];
            return { status: 200, result:
                new Admin(dbAdmin.admin_id, dbAdmin.admin_email, dbAdmin.admin_pass, dbAdmin.admin_escola, dbAdmin.admin_telefone, dbAdmin.admin_token)};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err};
        }
    }

    static async getUserByToken(token){
        try {
            let dbResult = await pool.query(`Select * from administrador where admin_token = $1`, [token]);
            let dbAdmins = dbResult.rows;
            if (!dbAdmins.legth)
                return { status: 403, result: {msg:"Invalid authentication!"}} ;
            let admin = dbAdminToAdmin(dbAdmins[0]);
            return {status: 200, result: admin};
        } catch (err) {
            console.log(err);
            return {status: 500, result: err};
        }
    }

    static async register(admin) {
        try {
            const emailExistsQuery = "SELECT admin_id FROM administrador WHERE admin_email = $1";
            const emailExistsResult = await pool.query(emailExistsQuery, [admin.email]);

            if (emailExistsResult.rows.length > 0) {
                return {
                    status: 400,
                    result: "Email already exists"
                };
        }
        const hashedPassword = await bcrypt.hash(admin.pass, 10);

        const insertQuery = "INSERT INTO administrador (admin_email, admin_pass, admin_escola, admin_telefone) VALUES ($1, $2, $3, $4)";
        await pool.query(insertQuery, [admin.email, hashedPassword, admin.escola, admin.telefone]);

        return{
             status: 200,
                result: "Registered! You can now log in."
        };
        } catch (err) {
        console.error(err);
        return {
            status: 500,
                result: err.message || "An error occurred during registration"
        };
        }
    }

    static async login(admin) {
        try {
            const loginQuery = "SELECT * FROM administrador WHERE admin_Email = $1";
            const dbResult = await pool.query(loginQuery, [admin.email]);

            if (dbResult.rows.length === 0) {
                console.log("Admin login failed: No user found.");
                return { status: 401, result: { msg: "Wrong username or password!" } };
            }

            const dbAdmin = dbResult.rows[0];

            const isPassValid = await bcrypt.compare(admin.pass, dbAdmin.admin_pass);

            if (!isPassValid) {
                console.log("Admin login failed: Invalid password.");
                return { status: 401, result: { msg: "Wrong username or password!" } };
            }

            const authenticatedAdmin = dbAdminToAdmin(dbAdmin);
            return { status: 200, result: authenticatedAdmin };
        
        } catch (err) {
            console.log("Admin login failed:", err);
            return { status: 500, result: err };
        }
    }

    static async saveToken(admin) {
        try {
            let dbResult =await pool.query(`Update administrador set admin_token=$1 where admin_id = $2`, [admin.token, admin.id]);
            console.log("Token saved for admin:", admin.id);
            return { status: 200, result: { msg: "Token saved!" } };
        } catch (err) {
            console.log("Error saving token:", err);
            return { status: 500, result: err };
        }
    }

}
module.exports = Admin;



   

