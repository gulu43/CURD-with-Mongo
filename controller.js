import conHelperFn, { User, RefreshToken, con, checkConnection, Task, Member, Comment, Attachment } from "./db_connection.js"
import mongoose from 'mongoose'
import jwt from "jsonwebtoken";
import "./paths.utils.js"
import dotenv from 'dotenv'
import { error } from "console";
import bcrypt from "bcryptjs";
// import { decode } from "punycode";
import e from "cors";
import path from 'node:path';
import { ObjectId } from "mongodb";
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
        console.log('refreshToken: ', refreshtoken_)

        if (!refreshtoken_) return res.status(404).json({ message: 'refresh token not found, login again.' })

        jwt.verify(refreshtoken_, process.env.SECRET, async (err, decode) => {
            // Check TokenExpiredError FIRST
            if (err?.name == 'TokenExpiredError') {
                return res.status(401).json({
                    message: `refresh token expired, login again.: ${err}`
                })
            }
            if (err) {
                return res.status(400).json({ message: `Error while verifying the token: ${err}.` })
            }
            else {
                console.log('connection check', checkConnection(con))
                result = await RefreshToken.findOne({ token: refreshtoken_ }).exec()
                console.log('RefreshToken Found in col:- ', result.token);

                // checking time
                const expireTimeOfToken = new Date(result.expiryDate).getTime()
                const currentTime = Date.now()
                const expireCheck = expireTimeOfToken > currentTime;
                // console.log(expireTimeOfToken , currentTime);

                // console.log('value:', expireCheck);

                if (expireCheck === false || result.isRevoked === true) {
                    return res.status(401).json({ message: 'RefreshToken expired, or revoked' })
                }
                if (result.token) {

                    accessToken = jwt.sign({ users_id: result.usersId, role: decode.role, usersname: decode.usersname }, process.env.SECRET, { expiresIn: '15m' })
                    console.log('accessToken sending: ', accessToken);

                    // console.log('diff: ',decode, result.token);

                    // console.log('decode in refesh: --------',decode);
                    req.user = decode
                    // console.log('user in refresh----- : ',req.user);

                    return res.status(201).json({ message: 'accessToken refresh and send', accessToken: accessToken })
                } else {
                    return res.status(404).json({ message: 'token not found or it is expired, login again.' })
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

    let profileInfo = {};

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

        profileInfo.usersname = result.usersname
        profileInfo.name = result.name
        profileInfo.role = result.role

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

            accessToken = jwt.sign({ users_id: result._id, role: result.role, usersname: result.usersname }, process.env.SECRET, { expiresIn: '15m' })
            refreshToken = jwt.sign({ users_id: result._id, role: result.role, usersname: result.usersname }, process.env.SECRET, { expiresIn: '7d' })

            // console.log('values: ', refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
            const refResult = await RefreshToken.create({ usersId: result._id, token: refreshToken, expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
            // console.log('update the refresh token in db: ', result.refreshToken);

            return res
                .status(200)
                .json({
                    message: `You logedin!`,
                    refreshToken: refResult.token,
                    accessToken: accessToken,
                    rawDetails: profileInfo
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

    jwt.verify(accessToken_, process.env.SECRET, (error, decode) => {

        if (error?.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }

        if (error) {
            return res.status(403).json({ message: "Invalid token" });
        }

        console.log('AuthMiddleWare AccessToken Value: ', decode)
        req.user = decode;
        console.log('AuthMiddleWare user values:', req.user);

        next();
    });
    console.log('-------------------------------------------------------------------------------------');
}

export function allowedRoles(...roles) {
    return (req, res, next) => {
        console.log('Middleware Allowed Roles: ', roles)
        console.log('users permission: ', req.user)

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' })
        }
        next()
    }

}

export const insertUserFn = async (req, res) => {

    let userData = {};

    // console.log('controller: ',checkConnection(con))
    const { name, age, usersname, password, status, role } = req.body

    if (status !== undefined) userData.status = status;
    if (role !== undefined) userData.role = role;

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
        result = await User.create({ name, age, usersname, password: hashedPassword, status: userData.status, role: userData.role })

        return res
            .status(201)
            .json({
                message: `message: ${result}`
            })
    } catch (error) {
        console.error(error)
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
    const { usersname } = req.user
    console.log('ok: ', req.user);

    const { password, newPassword } = req.body
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

export const updateUserFn = async (req, res) => {
    const { _id, name, age, usersname, password, status, role } = req.body;

    if (!_id) {
        return res.status(400).json({
            message: "Id is required for updating user"
        });
    }

    try {
        // Check if user exists
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const updateData = {};

        if (name) updateData.name = name;
        if (age) updateData.age = age;
        if (usersname) updateData.usersname = usersname;
        if (status) updateData.status = status;
        if (role) updateData.role = role;
        if (password) updateData.password = await bcrypt.hash(password, 10);

        console.log('updated data: ', updateData);


        const result = await User.updateOne({ _id }, { $set: updateData });
        console.log('not happing: ', result);

        if (result.matchedCount === 1 && result.modifiedCount === 1) {
            return res.status(200).json({ message: "User updated successfully" });
        } else {
            return res.status(400).json({ message: "Nothing updated" });
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Something went wrong"
        });
    }
};


export const deleteUserFn = async (req, res) => {
    try {
        // console.log('decoded: id: ', req.user.users_id);

        const { userId } = req.body
        console.log('in server : ', userId);

        const result = await User.deleteOne({ _id: userId })

        if (result.deletedCount === 0)
            return res.status(404).json({ message: 'User does not exist' })

        return res.status(200).json({ message: 'User deleted successfully' })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Something went wrong' })
    }
}

export const logoutFn = async (req, res) => {
    const { token } = req.body
    if (!token) {
        return res
            .status(404)
            .json({ message: 'token does not exsist' })
    }
    const logoutResult = await RefreshToken.findOneAndUpdate({ token: token }, { isRevoked: true }, { new: true })
    // console.log('logout revoked: ', logoutResult);
    // console.log('logoutResult.isRevoked', logoutResult.isRevoked);

    if (logoutResult.isRevoked === true) {
        return res.status(201).json({ message: 'token revoked!', isRevoked: logoutResult.isRevoked })
    } else {
        return res.status(500).json({ message: 'Internal Error while revoking token, plz clear cookies/local manually to resolve this error' })
    }
}

export const finduserPostFn = async (req, res) => {

    // const { _id, skip, limit } = req.body
    const { _id } = req.body
    console.log('what i am getting from users: ', _id);

    // console.log("finduser api hit")

    try {
        if (_id) {
            // result = await User.findOne({ usersname }).select({ _id: 0, password: 0, createdAt: 0, updatedAt: 0, __v: 0, status: 0 })
            result = await User.findById({ _id })
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
            result = await User.find().skip(Number(skip)).limit(Number(limit))
            // result = await User.find().select({ _id: 0, password: 0, createdAt: 0, updatedAt: 0, __v: 0, status: 0 })
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

export const finduserFn = async (req, res) => {

    const { usersname, skip, limit } = req.query
    // console.log('what i am getting from users: ', usersname);

    // console.log("finduser api hit")

    try {
        if (usersname) {
            // result = await User.findOne({ usersname }).select({ _id: 0, password: 0, createdAt: 0, updatedAt: 0, __v: 0, status: 0 })
            result = await User.findOne({ usersname })
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
            result = await User.find().skip(Number(skip)).limit(Number(limit))
            // result = await User.find().select({ _id: 0, password: 0, createdAt: 0, updatedAt: 0, __v: 0, status: 0 })
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

export const createTaskFn = async (req, res) => {
    // const { title, dessciption, status, isAssigned, priority, dueDate, createdBy, updatedBy, isDeleted } = req.body

    let { title, description, priority, dueDate, createdBy, status, isAssigned, updatedBy, isDeleted } = req.body

    console.log(req.user.users_id);
    createdBy = req.user.users_id

    console.log('this are the values: ', title, description, priority, dueDate, createdBy);
    if (!title || !description || !priority || !dueDate || !createdBy) {
        return res.status(400).json({ message: 'feilds should not be empty' })
    }

    const result = await Task.create({
        title,
        description,
        priority,
        dueDate,
        createdBy,
        status,
        isAssigned,
        updatedBy,
        isDeleted
    })
    console.log('task result: ', result);

    // 2️ Save Attachments (if any)
    if (req.files && req.files.length > 0) {
        const attachmentsData = req.files.map(file => ({
            taskId: result._id,
            fileName: file.filename,
            fileExt: path.extname(file.originalname),
            filePath: file.path,
            uploadedBy: createdBy,
            mimeType: file.mimetype,
            fileSize: file.size
        }));

        const fileupload = await Attachment.insertMany(attachmentsData);
        // console.log('ok: ', fileupload);

    }

    if (result) {
        return res.status(201).json({ message: 'Task Createds' })

    } else {
        // Cleanup uploaded files if any
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        return res.status(500).json({ message: 'error while creating data' })
    }



}

export const getTasksFn = async (req, res, next) => {
    try {
        const result = await Task.find().populate('createdBy', 'name usersname')
        return res.status(200).json({ allTasks: result })
    } catch (error) {
        return next(error)
    }
}


export const deleteTaskFn = async (req, res) => {
    try {
        const { taskId } = req.body

        const result = await Task.deleteOne({ _id: taskId })

        if (result.deletedCount === 0)
            return res.status(404).json({ message: 'Task does not exist' })

        return res.status(200).json({ message: 'Task deleted successfully' })

    } catch (error) {
        res.status(500).json({ message: error.message || 'Something went wrong while deleing the task' })
    }
}

export const findTaskPostFn = async (req, res) => {

    const { _id } = req.body

    if (!_id) {
        return res
            .status(404)
            .json({ message: '_id is needed for searching (edit task backend fn)' })
    }

    result = await Task.findById({ _id })
    if (!result) {
        return res
            .status(404)
            .json({ message: 'task does not exist' })
    } else {

        return res
            .status(200)
            .json({ data: result })
    }

}

export const findUserForTaskFn = async (req, res) => {
    const { name } = req.body
    if (!name) {
        return res.status(400).json({ message: 'feild reqired' })
    }
    try {
        const result = await User.find({
            name: { $regex: `^${name}`, $options: 'i' }
        }).limit(20);
        // const result = await User.find({})
        if (!result) {
            return res
                .status(404)
                .json({ message: 'user does not exist' })
        }
        // console.log(': ', result);

        return res
            .status(200)
            .json({ usersList: result })

    } catch (error) {
        return res
            .status(500)
            .json({ message: error || 'Something went roung in findUserForTaskFn' })
    }
}

export const assignTaskFn = async (req, res) => {
    try {

        const { taskId, userId, role } = req.body;
        const addedBy = req.user.users_id;

        if (!taskId || !userId || !addedBy || !role) {
            return res.status(400).json({ message: 'Fields required' });
        }

        if (role === 'assignee') {

            const exists = await Member.findOne({ taskId, role: 'assignee' });
            if (exists) {
                return res.status(409).json({ message: 'Assignee already exists' });
            }
        }
        if (role === 'watcher') {
            const exists = await Member.findOne({ taskId, userId, role: 'watcher' })
            if (exists) {
                return res.status(409).json({ message: 'Watcher already exists' });
            }
        }

        await Member.create({
            taskId,
            userId,
            role,
            addedBy
        });

        await Task.updateOne(
            { _id: taskId },
            {
                updatedBy: addedBy,
                isAssigned: true
            }
        );

        return res.status(200).json({
            message: 'Task assigned successfully'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error while assigning task', error
        });
    }
};

export const getTasksDetailsFn = async (req, res) => {

    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Field required' });
    }

    try {
        const task = await Task.findById(id)
            .populate('createdBy', '_id name usersname')
            .populate('updatedBy', '_id name usersname');

        const attachments = await Attachment.find({ taskId: id })
            .populate('uploadedBy', '_id name usersname')
            .lean();

        const members = await Member.find({ taskId: id })
            .populate('userId', '_id name usersname')
            .populate('addedBy', '_id name usersname');

        // adding basevalue
        console.log('base url: ', process.env.BASE_URL);

        const resolvedPath = await attachments.map((file) => ({
            ...file,
            fileUrl: `${process.env.BASE_URL}/${file.filePath.replace(/\\/g, '/')}`
        }))

        // console.log('checking path: ', resolvedPath[0].filePath);
        // console.log('checking url: ', resolvedPath[0].fileUrl);

        return res.status(200)
            .json({
                task: task,
                attachments: resolvedPath,
                members: members
            })

    } catch (error) {
    }
}

export const downloadAttachmentFn = async (req, res) => {

    try {
        // console.log('doenloads hit=======================');

        const file = await Attachment.findById(req.params.id).lean();
        if (!file) return res.status(404).send('File not found');

        // const absolutePath = `${process.env.BASE_URL}/${file.filePath.replace(/\\/g, '/')}`;
        const absolutePath1 = path.join(process.cwd(), file.filePath);
        // console.log('absolute: ----------------***-----------*****-----: ',absolutePath1);

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${file.fileName}"`
        );
        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');

        res.download(absolutePath1, file.fileName);

    } catch (error) {
        return next(error)
    }
}

export const addCommentFn = async (req, res) => {

    try {
        const { taskId, message } = req.body;
        const commentedBy = req.user.users_id;

        let attachmentsData = [];
        if (req.files && req.files.length > 3) {
            return res.status(400).json({message: 'total 3 files can be send'})
        }
        
        if (req.files && req.files.length > 0) {
            attachmentsData = req.files.map(file => ({
                fileName: file.originalname,
                fileExt: path.extname(file.originalname),
                filePath: file.path,
                fileUrl: `${process.env.BASE_URL}/${file.path.replace(/\\/g, '/')}`,
                mimeType: file.mimetype,
                fileSize: file.size
            }));
        }

        await Comment.create({
            taskId,
            message,
            commentedBy,
            ...(attachmentsData.length && { attachments: attachmentsData })
        });

        return res.status(201).json({ message: 'Comment Added' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error while creating comment' });
    }
};

export const getAllCommentsFn = async (req, res) => {
    console.log('comment hit ---------------');
        
    const { taskId } = req.body
    if (!taskId) {
        return res.status(401).json({'message': 'taskId is required'})
    }
    const result = await Comment.find({ taskId }).populate('commentedBy', '_id name usersname')
    return res.status(200).json({ 'allcomments': result })
}