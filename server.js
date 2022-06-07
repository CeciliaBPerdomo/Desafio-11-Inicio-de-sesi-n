/* 
npm init -y
npm i express
npm i express socket.io
npm i ejs
npm i express-session
npm i connect-mongo --save
npm i passport
npm i passport-local
npm i mongoose
*/
const express = require('express')
const session = require('express-session')

const passport = require('passport')
const { Strategy: LocalStrategy } = require('passport-local')

const MongoStore = require('connect-mongo')
const advancedOptins = { useNewUrlParser: true, useUnifiedTopology: true }

/* database */
const usuarios = []

/* passport */
passport.use('registrarse', new LocalStrategy({
    passReqToCallback: true
}, (req, username, password, done) => {

    const usuario = usuarios.find(usuario => usuarios.nombre == nombre)
    if(usuario){ return done('Usuario ya registrado')}
    
    const user = {
        username,
        password
    }
    usuarios.push(user)
    return done(null, user)
}))

passport.use('login', new LocalStrategy((username, password, done) => {
    const user = usuarios.find(usuario => usuarios.username == username)
    if (!user){ return done (null, false) }
    if (user.password != password) { return done (null, false) }
    user.contador = 0
    return done(null, user)
}))

passport.serializeUser(function (user, done){
    done(null, username)
})

passport.deserializeUser(function(username, done){
    const usuario = usuarios.find(usuario => usuarios.username == username)
    done(null, usuario)
})

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

/* ------------------------------------------------------------------- */
/*              Persistencia database                                  */
/* ------------------------------------------------------------------- */
app.use(session({
    store: MongoStore.create({ 
        mongoUrl: 'mongodb+srv://Cecilia:ceci1984@cluster1.sf6kh.mongodb.net/?retryWrites=true&w=majority',
        mongoOptions: advancedOptins
    }), 
    secret: 'sh',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 100000 }
}))

app.use(passport.initialize())
app.use(passport.session())

let messages = []
const productos = []

app.use(express.urlencoded({ extended: true }))
app.set('views', './views')
app.set('view engine', 'ejs')

/* Auth */
function isAuth(req, res, next) {
    if (req.isAuthenticated()){
        next()
    } else {
        res.redirect('/login')
    }
}

app.get('/', (req, res) => {
    let productos = [
        {nombre: 'Escuadra', precio: 20, foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Squadra_45.jpg/640px-Squadra_45.jpg"}, 
        {nombre: 'Regla', precio: 10, foto: "https://image.shutterstock.com/image-vector/school-measuring-plastic-ruler-20-260nw-615662024.jpg"}, 
        {nombre: 'Compás', precio: 20, foto: "https://thumbs.dreamstime.com/b/comp%C3%A1s-de-dibujo-aislado-rojo-132996590.jpg"}
    ]
    const usuario = req.session.usuario
    try{
        if(req.session.usuario) {
            res.render('productos', { productos, usuario})
        } else {
            res.sendFile(__dirname + '/public/registrarse.html')
        }
    } catch (error){ console.log(error) }
    
})

app.post('/productos', (req, res) => {
    productos.push(req.body)
    console.log(productos)
    res.redirect('/')
})

app.use(express.static('public'))

io.on('connection', function(socket){
    console.log('Un cliente se ha conectado')
    /* Emitir todos los mensajes a un cliente nuevo */
    socket.emit('messages', messages)

    socket.on('new-message', function(data){
        /* Agregar mensajes a array */
        messages.push(data)

        /* Emitir a todos los clientes */ 
        io.sockets.emit('messages', messages)
    })
})


/* Login */ 
app.post('/login', (req, res) => {
    let usuario = req.body.usuario
    let contras = req.body.password
    req.session.usuario = usuario
    req.session.password = contras
    console.log('Usuario: ', usuario, '. Contraseña: ', contras)
    res.redirect('/')
})

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

const PORT = process.env.PORT || 8080

const srv = server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${srv.address().port}`)
})
srv.on('error', error => console.log(`Error en el servidor ${error}`))