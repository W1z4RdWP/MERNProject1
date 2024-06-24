const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

const getAllUsers = asyncHandler(async(req, resp) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length){
        return resp.status(400).json({message: 'No users found'})
    }
    resp.json(users)
})

const createNewUser = asyncHandler(async(req, resp) => {
    const {username, password, roles } = req.body
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return resp.status(400).json({message: 'Все поля должны быть заполнены'})
    }
    const duplicate = await User.findOne({username}).lean().exec()
    if (duplicate){
        return resp.status(409).json({message: 'Имя пользователя уже используется!'})
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = {username, "password": hashedPwd, roles}

    const user = await User.create(userObject)
    if(user){
        resp.status(201).json({message:`Новый пользователь ${username} создан`})
    }else{
        resp.status(400).json({message: 'Вы ввели неверные данные'})
    }


})

const updateUser = asyncHandler(async(req, resp) => {
    const {id, username, roles, active, password} = req.body

    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
        return resp.status(400).json({message: 'All fields are required'})
    }
    const user = await User.findById(id).exec()

    if(!user){
        return resp.status(400).json({message: "Пользователь не найден!"})
    }

    const duplicate = await User.findOne({username}).lean().exec()
    if(duplicate && duplicate?._id.toString() !== id){
        return resp.status(409).json({message: "Имя пользователя уже существует!"})
    }
    user.username = username
    user.roles = roles
    user.active = active

    if(password){
        user.password = await bcrypt.hash(password,10)
    }

    const updatedUser = await user.save()

    resp.json({message: `${updatedUser.username} обновлен`})

})

const deleteUser = asyncHandler(async(req, resp) => {
    const { id } = req.body

    if (!id ){
        return resp.status(400).json({message: "Укажите ID пользователя"})
    }

    const notes = await Note.findOne({user: id}).lean().exec()

    if(notes?.length){
        return resp.status(400).json({message: 'У пользователя имеются заметки'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return resp.status(400).json({message: 'Пользователь не найден'})
    }

    const result = await user.deleteOne()

    const reply = `Пользователь ${result.username} с ID ${result._id} успешно удален!`

    resp.json(reply)

})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}