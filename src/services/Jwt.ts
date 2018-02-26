import { addDays } from 'date-fns';
import { sign, decode, verify } from 'jsonwebtoken';

const secret_key = 'secret';
export const generateToken = (payload: {
  id: number;
  name: string;
  email: string;
  role: string;
}): string => {
  return sign(payload, process.env.SECRET || secret_key, {
    expiresIn: 30 * 24 * 60 * 60
  });
};

export const decodeAndVerifyToken = (bearerToken: string): Promise<any> => {
  if (!bearerToken) {
    return Promise.reject('no token');
  }
  const token = bearerToken.split(' ')[1];
  const prefix = bearerToken.split(' ')[0];
  if (prefix !== 'Bearer') {
    return Promise.reject('bad prefix');
  }
  try {
    const decoded = verify(token, process.env.SECRET || secret_key);
    return Promise.resolve(decoded);
  } catch (err) {
    return Promise.reject(err.message);
  }
};
