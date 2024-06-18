require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var morgan = require('morgan');

var app = express();

app.use(cookieSession({
    name: 'session',
    secret: process.env.COOKIE_SECRET,
    maxAge: 24 * 60 * 60 * 1000
}))

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));

const adminRouter = require("./routes/adminRoutes");
const alunoRouter = require("./routes/alunoRoutes");
//const aulaRouter = require("./routes/aulaRoutes");
//const inscricaoRouter = require("./routes/inscricaoRoutes");
//const progressoRouter =  require("./routes/progressoRoutes");
//const categoriaRouter = require("./routes/categoriaRoutes");

app.use("/api/admin", adminRouter);
app.use("/api/user", alunoRouter);
//app.use("/api/aula", aulaRouter);
//app.use("/api/inscricao", inscricaoRouter);
//app.use("/api/progresso", progressoRouter);
//app.use("/api/categoria", categoriaRouter);
app.use(express.static(path.join(__dirname, './web')));

const port = parseInt(process.env.PORT || '8080');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './web', 'home.html'));
  });

app.listen(port, function() {
    console.log("Server running at http://localhost:" + port);
  });
 

