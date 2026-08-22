import jwt, { SignOptions } from 'jsonwebtoken';

export interface JWTPayload {
  id: string;
  employeeId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, options);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};
