const { validationResult } = require('express-validator');
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Token } = require('../models/token');

exports.register  = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }));
      return res.status(400).json({ errors: errorMessages });
    }
    try {
        let user = new User({
            ...req.body,
            passwordHash: bcrypt.hashSync(req.body.password, 8),
        });
        user = await user.save();

        if(!user) {
            return res.status(500).json({message: 'Internal Server Error', message: 'User cannot be created'});
        }

        return res.status(201).json(user);

    } catch (error) {
        if(error.message.includes('email_1 dup key')) {
            return res.status(409).json({
                type: 'AuthError',
                message: 'Email already exists'
            });
        }
    }
};

exports.login  = async function (req, res)  {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        
        if(!user) {
            return res.status(404).json({
                message: 'User not found \n Check your email and try again.'});
        };

        if(!bcrypt.compareSync(password, user.passwordHash)) {
            return res.status(400).json({
                message: 'Incorrect password!',
            });
        }

        const accessToken = jwt.sign({
            id: user.id,
            isAdmin: user.isAdmin},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '24h'}
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '60d'}
        );

        const token = await Token.findOne({userId: user.id});
        if(token) await Token.deleteOne({userId: user.id});
        await new Token({
            userId: user.id,
            accessToken,
            refreshToken,
        }).save();


        user.passwordHash = undefined;
        return res.json({...user.toObject(), accessToken});
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            type: error.name,
            message: 'Internal Server Error'});
    }
};

exports.forgotPassword  = async (req, res) => {}
exports.verifyPasswordResetOTP  = async (req, res) => {}
exports.resetPassword  = async (req, res) => {}