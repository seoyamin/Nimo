const express = require("express")
const {User, History, SimulData} = require("../models")
const Sequelize = require("sequelize")

const quiz = {
    userInfo: async function (req, res, next) {
        try {
            const user = await User.findOne({where: {id: req.user_id}});
            let all = await SimulData.count()
            let done = await History.count({where: {user_nickname: user.nickname}})

            info = {
                nickname: user.nickname,
                pushOk: user.push_ok,
                all: all,
                done: done
            }

            return res.status(200).json(info)
        } catch (err) {
            return res.status(400);
        }
    }
}

module.exports = quiz;