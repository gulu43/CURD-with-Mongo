import conHelperFn, { User, con, checkConnection } from "./db_connection.js"
import mongoose from 'mongoose'
import jwt from "jsonwebtoken";
import "./paths.utils.js"
import dotenv from 'dotenv'
import { error } from "console";
import bcrypt from "bcryptjs";
import { decode } from "punycode";
import e from "cors";
// how to db and collection code plz

// dotenv.config({
//     path: dotenvPath
// })

let result;
let accessToken;
let refreshToken;
let hashedPassword;

// export const generateMethordFn = async (req, res) => {}

export const initialRequest = async (req, res) => {
    console.log('***initialRequest hit');

    res.status(200).json({ message: 'ok!' })
}

// export const initialAccessTokenRequest = async (req, res) => {
//     const rt = req.query.rt
//     console.log(req.query.rt);

//     if (!rt) return res.status(404).json({ message: 'refreshToken not found' })
//     jwt.verify(rt, process.env.SECRET, async (err, decode) => {
//         if (err) return res.status(404).json({ message: 'refreshToken not found', error: err })
//         if (decode) {
//             return res.status(200).json({ message: 'ok!' })
//         }
//     })

// }

export const refreshTokenFn = async (req, res) => {
    console.log('***refresh hit');
    // console.log('req---: ', req);
    // console.log('header: ', req.headers.refreshtoken);

    try {

        const refreshtoken_ = req.headers.refreshtoken;
        console.log('refreshToken: ', refreshtoken_);

        if (!refreshtoken_) return res.status(404).json({ message: 'refresh token not found, login again.' })

        jwt.verify(refreshtoken_, process.env.SECRET, async (err, decode) => {
            // Check TokenExpiredError FIRST
            if (err?.name == 'TokenExpiredError') {
                return res.status(401).json({
                    message: `refresh token expired, login again.: ${err}`,
                    error: err
                })
            }
            if (err) {
                return res.status(400).json({ message: `Error while verifying the token: ${err}.` })
            }
            else {
                console.log('connection check', checkConnection(con))
                result = await User.findOne({ refreshToken: refreshtoken_ }).exec()
                console.log('RefreshToken Found in db:- ', result?.refreshToken);

                if (result?.refreshToken) {
                    accessToken = jwt.sign({ users_id: result._id }, process.env.SECRET, { expiresIn: '1m' })
                    console.log('accessToken sending: ', accessToken);

                    return res.status(201).json({ message: 'accessToken refresh and send', accessToken: accessToken })
                } else {
                    return res.status(404).json({ message: 'accessToken refresh not found in db, login in again.' }, { 'redirect: ': '/login' })
                }
            }
        })

    } catch (error) {
        console.log('error in refresh: ', error);
        throw error
    }
}

export const homeUserFn = async (req, res) => {
    console.log("home end point")

    res
        .status(200)
        .json({
            message: "HOME"
        })

}
export const loginUserFn = async (req, res) => {
    try {
        const { usersname, password } = req.body
        // console.log("from user: --------", usersname, password);

        if (!usersname || !password) {
            return res
                .status(400)
                .json({
                    message: `fields should not be empty.`
                })
        }

        result = await User.findOne({ usersname })
        if (!result) {
            return res
                .status(404)
                .json({
                    message: `User does not exists, Please register first`
                })
        }
        const checkPassword = await bcrypt.compare(password, result.password)
        // console.log('did it mached: ------', checkPassword);

        if (checkPassword && result.status == false) {
            return res
                .status(422)
                .json({
                    message: `User is Not active, please contact user support.`
                })
        }
        else if (checkPassword == true) {
            // console.log('logedin! ')
            // console.log('result_id: -',result._id);

            accessToken = jwt.sign({ users_id: result._id }, process.env.SECRET, { expiresIn: '1m' })
            refreshToken = jwt.sign({ users_id: result._id }, process.env.SECRET, { expiresIn: '7d' })

            result = await User.updateOne({ _id: result._id }, { $set: { refreshToken: refreshToken } })
            // console.log('update the refresh token in db: ', result.refreshToken);

            return res
                .status(200)
                .json({
                    message: `You logedin!`,
                    matchedCount: result.matchedCount,
                    modifiedCount: result.modifiedCount,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                })

        } else {
            return res
                .status(401)
                .json({
                    message: `usersname or password is wrong.`
                })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error?.message || 'Something went wrong',
        })
    }

}

// export const checkAccessTokenMiddleware = async (req, res, next) => {

//     console.log('-------------------------------------------------------------------------------------');
//     console.log('middleware hit')
//     // accesstoken
//     const accessToken_ = req.headers.accesstoken
//     console.log(accessToken_)

//     if (!accessToken_) {
//         return res.status(401).json({ message: 'token not found' })
//     }
//     jwt.verify(accessToken_, process.env.SECRET, (error, decoded) => {
//         if (error?.name == 'TokenExpiredError') {
//             console.log('error :', error);
//             return res.status(401).json({ message: 'middleware ,Token is expired', error })
//         }
//         if (error) {
//             // console.log('403 one',accessToken_, error);

//             return res.status(403).json({ message: 'middleware error, Can not be verifyed token, login in again: ', error })
//         }
//         console.log(decoded);

//         next();
//     })
// console.log('-------------------------------------------------------------------------------------');
//     // next()
// }
export function checkAccessTokenMiddleware(req, res, next) {
    console.log('-------------------------------------------------------------------------------------');
    console.log('middleware hit')

    const accessToken_ = req.headers.accesstoken;
    console.log('in backend accessToken: ', accessToken_);

    if (!accessToken_) {
        return res.status(401).json({ message: "token not found" });
    }

    jwt.verify(accessToken_, process.env.SECRET, (error, decoded) => {

        if (error?.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }

        if (error) {
            return res.status(403).json({ message: "Invalid token" });
        }

        // req.user = decoded;
        next();
    });
    console.log('-------------------------------------------------------------------------------------');
}

// export const middlewareAuth = async (req, res, next) => {
//     accessToken = req.headers['accesstoken']
//     refreshToken = req.headers['refreshtoken']

//     if (!accessToken) {
//         return res
//             .status(401)
//             .json({
//                 message: 'Please Login first, accessToken is undefine.'
//             })

//     }
//     jwt.verify(accessToken, process.env.SECRET, (err, decode) => {
//         if (err) {
//             return res
//                 .status(401)
//                 .json({
//                     message: 'Please Login first, accessToken is undefine: ', err
//                 })
//         } else if (err == 'TokenExpiredError') {
//             console.log('accessToken is expired re-generating accesToken with refreshToken')
//             if (!refreshToken) {
//                 return res
//                     .status(401)
//                     .json({
//                         message: 'Please Login first, refreshToken is undefine.'
//                     })
//             }
//             jwt.verify(refreshToken, process.env.SECRET, async (err, decode) => {
//                 if (err) {
//                     console.error(err)
//                     return res
//                         .status(401)
//                         .json({
//                             message: 'Error while verifying refreshToken.', err
//                         })
//                 }
//                 else if (err == 'TokenExpiredError') {
//                     // console.log('refreshToken is expired login again')
//                     console.error(err)
//                     return res
//                         .status(401)
//                         .json({
//                             message: 'refreshToken is expired login again', err
//                         })
//                 }
//                 else {
//                     const _id = decode.users_id
//                     result = await User.findById(_id)
//                     if (!result) {
//                         console.log('testing:', result)
//                     }
//                     accessToken = jwt.sign({ users_id: result._id }, process.env.SECRET, { expiresIn: '1h' })
//                     return res
//                         .status(200)
//                         .json({
//                             message: 'accessToken re-generated from refreshToken',
//                             accessToken: accessToken
//                         })
//                         .redirect('/home')

//                 }
//             })

//         } else {
//             next()

//         }
//     })


// }

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

        hashedPassword = await bcrypt.hash(password, 10)

        console.log("all: ", name, age, usersname, password);
        result = await User.create({ name, age, usersname, password: hashedPassword })

        return res
            .status(201)
            .json({
                message: `message: ${result}`
            })
    } catch (error) {
        console.error(error);
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
    console.log(usersname, password, newPassword);

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
        console.log('result password:- ', result);

        if (result == false) {
            return res
                .status(404)
                .json({ message: 'User does not exsist' })
        }
        const check = await bcrypt.compare(password, result.password)
        console.log('check', check)

        if (!check) {
            return res
                .status(401)
                .json({ message: 'Password is rong' })
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        result = await User.updateOne({ usersname }, { $set: { password: hashed } })
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

export const deleteUserFn = async (req, res) => {
    const { usersname } = req.body
    if (!usersname) {
        return res
            .status(400)
            .json({
                message: `feield/s should not be empty`
            })
    }

    try {
        result = await User.findOne({ usersname })
        const _id = result._id
        console.log("users id: ", _id);

        if (!result) {
            return res
                .status(404)
                .json({ message: 'User does not exsist' })
        }
        result = await User.deleteOne({ _id })
        // console.log("see: ", result);

        if (result.acknowledged == true && result.deletedCount == 1) {
            return res
                .status(200)
                .json({ message: 'User deleted sucess' })
        } else {
            return res
                .status(500)
                .json({ message: 'User deleted faild' })
        }
    } catch (error) {
        res
            .status(500)
            .json({
                message: error?.message || 'Something went wrong white deleting',
            })
    }
}

export const finduserFn = async (req, res) => {

    const { usersname } = req.query
    console.log('what i am getting from users: ', usersname);

    console.log("finduser api hit")

    try {
        if (usersname) {
            result = await User.findOne({ usersname }).select({ _id: 0, password: 0, createdAt: 0, updatedAt: 0, __v: 0, status: 0 })
            console.log('single users: ', result)
            if (!result) {
                return res
                    .status(404)
                    .json({ message: 'user does not exist' })
            }
            return res
                .status(200)
                .json({ data: result })
        } else {
            result = await User.find().select({ _id: 0, password: 0, createdAt: 0, updatedAt: 0, __v: 0, status: 0 })
            console.log('All users: ', result)

            return res
                .status(200)
                .json({ data: result })
        }
    } catch (error) {
        return res
            .status(500)
            .json({ message: error || 'Something went roung in findusersFn' })
    }


}