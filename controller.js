import conHelperFn, { User, con, checkConnection } from "./db_connection.js"
import mongoose from 'mongoose'

// how to db and collection code plz



let result;
export const insertUserFn = async (req, res) => {

    // console.log('controller: ',checkConnection(con))
    const { name, age, usersname, password } = req.body

    try {
        if (!name || !age || !usersname || !password) {
            return res
                .status(400)
                .json({
                    message: `feields should not be empty`
                })
        }

        result = await User.create({ name, age, usersname, password })

        return res
            .status(201)
            .json({
                message: `message: ${result}`
            })
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key (unique field conflict)
            res.status(400).json({
                message: 'Username is already taken. Try another one.',
            })
        } else {
            console.error(error);
            res.status(500).json({
                message: error.message || 'Something went wrong',
            })
        }
    }

}

export const updatePasswordFn = async (req, res) => {
    const { usersname, password, newPassword } = req.body
    if (!usersname || !password || !newPassword) {
        return res
            .status(400)
            .json({
                message: `feields should not be empty`
            })
    }
    if (password == newPassword) {
        return res
            .status(400)
            .json({ message: 'New password can not be same as current password' })
    }

    try {
        result = await User.findOne({ usersname })
        if (!result) {
            return res
                .status(404)
                .json({ message: 'User does not exsist' })
        }
        if (result.password != password) {
            return res
                .status(404)
                .json({ message: 'Password is rong' })
        }
        result = await User.updateOne({ usersname }, { $set: { password: newPassword } })
        if (result.matchedCount == 1 && result.modifiedCount == 1) {
            return res
                .status(201)
                .json({ message: 'password update sucess' })
        } else {
            return res
                .status(400)
                .json({ message: 'password update faild' })
        }
    } catch (error) {
        res
            .status(500)
            .json({
                message: error?.message || 'Something went wrong',
            })
    }
}