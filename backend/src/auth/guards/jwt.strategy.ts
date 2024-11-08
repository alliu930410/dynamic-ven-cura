import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.DYNAMIC_PUBLIC_KEY,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any, done: any) {
    const { iat, exp, sub, sid, iss, ...rest } = payload;
    // sub is the dynamicUserId
    return done(null, { dynamicUserId: sub });
  }
}
