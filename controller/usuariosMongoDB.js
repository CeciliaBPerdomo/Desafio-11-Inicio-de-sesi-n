const res = require('express/lib/response')
const mongoose = require('mongoose')
const mongoDB = require('../db/dbMongo')

const usuarioSchema = new mongoose.Schema({
    usuario: {
        id: {type: String, required: true, max: 4, index: true}, 
        userName: {type: String, required: true, max: 100}, 
        password: {type: String, required: true, max: 100} 
    }
})

const model = mongoose.model('usuarios', usuarioSchema)

class usuarioReg extends mongoDB {
    constructor(connection) {
        super(connection)
    }

    listarUsuarios = async = () => {return model.find({})}

    buscarXNombre = async(usuario) => {
        const result = model.find({'userName': usuario})
        return result[0]
    }
}

module.exports = usuarioReg