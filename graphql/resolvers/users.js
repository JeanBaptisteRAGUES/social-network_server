const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const User = require('../../models/User');
const { SECRET_KEY } = require('../../config');
const {validateRegisterInput, validateLoginInput} = require('../../util/validators');

function generateToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, { expiresIn: '1h' });
}

module.exports = {
    Query: {
        async getUserInfos(_, {username}){
            const user = await User.findOne({username});

            if(!user){
                throw new UserInputError('Utilisateur inconnu');
            }

            return {
                ...user._doc,
                id: user._id
            };
        }
    },
    Mutation: {
        async login(_, {username, password}){
            const {errors, valid} = validateLoginInput(username, password);
            const user = await User.findOne({username});

            if(!valid){
                throw new UserInputError('Errors', { errors })
            }

            if(!user){
                errors.general = 'Utilisateur inconnu';
                throw new UserInputError('Utilisateur inconnu', {errors});
            }

            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = 'Identifiants invalides';
                throw new UserInputError('Identifiants invalides', {errors});
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            };
        },
        async register(_, {registerInput : {username, email, password, confirmPassword}}){
            //Validate user data
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
            if(!valid){
                throw new UserInputError('Errors', { errors });
            }
            //Make sure user doesn't already exist
            const user = await User.findOne({ username });
            if(user){
                throw new UserInputError('Pseudo déjà utilisé', {
                    errors: {
                        username: "Ce pseudo n'est pas disponible"
                    }
                })
            }
            //hash password and create auth token
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token
            };
        }
    }
}