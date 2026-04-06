import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SessionService } from '../session/session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private sessionService: SessionService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'la-ligue-informatique-secret-key-2024',
    });
  }

  async validate(payload: { sub: number; email: string; role: string; sessionId?: string }) {
    // Validate server-side session if present
    if (payload.sessionId) {
      const valid = await this.sessionService.validateSession(payload.sessionId);
      if (!valid) {
        throw new UnauthorizedException('Session expiree ou invalide');
      }
    }

    return { userId: payload.sub, email: payload.email, role: payload.role, sessionId: payload.sessionId };
  }
}
