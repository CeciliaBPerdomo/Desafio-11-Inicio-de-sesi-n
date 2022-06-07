const mongoose = require('mongoose')

const usuarios = new mongoose.Schema({
    usuario: {
        id: {type: String, required: true, max: 4, index: true}, 
        userName: {type: String, required: true, max: 100}, 
        password: {type: String, required: true, max: 100} 
    }
})

export default mongoose.model('usuarios', usuarios)
