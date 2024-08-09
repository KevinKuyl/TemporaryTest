import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const getUser = (token) => {
  try {
    if (token) {
      return jwt.verify (token, config.token.private);
    } else {
      return null;
    }
  } catch (error) {
    return error;
  }
};
