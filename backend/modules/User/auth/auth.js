import User from '../models/user.js';
import {GraphQLError} from 'graphql';
import {config} from '../../../services/config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const saltRounds = 10;

export async function login({email, password}) {

  if (!email || !password) {
    throw new Error('Een email en een wachtwoord zijn verplicht.');
  }

  const user = await User.findOne({email}).select('+password');

  if (!user || !(await bcrypt.compare(password, user?.password))) {
    throw new Error('Ongeldige gebruikersnaam of wachtwoord.');
  }


  const {role: role, permissions } = user;
  const id = String(user._id);
  const payload = {role, permissions, sub: id};
  const token = jwt.sign(payload, config.token.private, {expiresIn: '7d'});

  return {accessToken: token};
}


export async function adminSwitch({email}) {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new GraphQLError('Ongeldige gebruikersnaam of wachtwoord.');
  }
  const role = user.role;
  const permissions = user.permissions;
  const id = String(user._id);

  const payload = {role, permissions, sub: id};

  const token = jwt.sign(payload, config.token.private, {expiresIn: '7d'});


  return {accessToken: token};
}

export async function hashPassword(password) {
  // Generate a salt
  const salt = await bcrypt.genSalt(saltRounds);
  // Create password hash and return it
  return await bcrypt.hash(password, salt);
}

export function makeHash(length) {
  let result           = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
  }
  return result;
}