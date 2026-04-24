import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, JWTPayload, jwtVerify } from 'jose';
import { UserService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

type SocialProvider = 'google' | 'apple';

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
);
const APPLE_JWKS = createRemoteJWKSet(
  new URL('https://appleid.apple.com/auth/keys'),
);

const DEFAULT_GOOGLE_CLIENT_ID =
  '401742216274-ft674rtsvo06f0ck08qrn8og521o21ps.apps.googleusercontent.com';

interface SocialProfile {
  provider: SocialProvider;
  providerUserId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private sanitizeUser(user: any) {
    if (!user) return user;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  private getGoogleClientId() {
    const clientId =
      this.configService.get<string>('GOOGLE_CLIENT_ID') ||
      DEFAULT_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new UnauthorizedException(
        'Google login is not configured on the backend',
      );
    }
    return clientId;
  }

  private getAppleClientId() {
    const clientId = this.configService.get<string>('APPLE_CLIENT_ID');
    if (!clientId) {
      throw new UnauthorizedException(
        'Apple login is not configured on the backend',
      );
    }
    return clientId;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      return this.sanitizeUser(user);
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.sanitizeUser(user),
    };
  }

  private async verifyGoogleCredential(credential: string): Promise<SocialProfile> {
    try {
      const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
        issuer: ['accounts.google.com', 'https://accounts.google.com'],
        audience: this.getGoogleClientId(),
      });

      if (payload.email_verified !== true) {
        throw new UnauthorizedException('Google account email is not verified');
      }

      return {
        provider: 'google',
        providerUserId: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
        name: typeof payload.name === 'string' ? payload.name : undefined,
        avatarUrl: typeof payload.picture === 'string' ? payload.picture : undefined,
      };
    } catch (error) {
      console.error('Google login verification failed:', error?.message || error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Google login token is invalid or expired');
    }
  }

  private async verifyAppleIdentityToken(identityToken: string): Promise<SocialProfile> {
    try {
      const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
        issuer: 'https://appleid.apple.com',
        audience: this.getAppleClientId(),
      });

      if (!payload.sub) {
        throw new UnauthorizedException('Invalid Apple identity token');
      }

      return {
        provider: 'apple',
        providerUserId: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
        name: undefined,
        avatarUrl: undefined,
      };
    } catch (error) {
      console.error('Apple login verification failed:', error?.message || error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Apple login token is invalid or expired');
    }
  }

  private buildFallbackEmail(provider: SocialProvider, providerUserId: string) {
    return `${provider}.${providerUserId}@neva.social`;
  }

  private parseMockSocialCredential(rawCredential: string, provider: SocialProvider): SocialProfile {
    try {
      const payload = JSON.parse(String(rawCredential).replace(/^mock:/, ''));
      const email = typeof payload.email === 'string' ? payload.email : undefined;
      const name = typeof payload.name === 'string' ? payload.name : undefined;
      const avatarUrl = typeof payload.avatarUrl === 'string' ? payload.avatarUrl : undefined;
      const providerUserId =
        typeof payload.providerUserId === 'string'
          ? payload.providerUserId
          : email || name || `${provider}-local-user`;

      return {
        provider,
        providerUserId,
        email,
        name,
        avatarUrl,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid local mock social credential');
    }
  }

  private async upsertSocialUser(profile: SocialProfile, nameHint?: string) {
    const normalizedEmail = profile.email?.toLowerCase();
    let user = await this.userService.findByProvider(
      profile.provider,
      profile.providerUserId,
    );

    if (!user && normalizedEmail) {
      user = await this.userService.findByEmail(normalizedEmail);
    }

    const preferredName =
      nameHint?.trim() ||
      profile.name?.trim() ||
      user?.name ||
      normalizedEmail?.split('@')[0] ||
      `${profile.provider === 'google' ? 'Google' : 'Apple'} User`;

    if (user) {
      const updates: Record<string, unknown> = {};

      if (!user.auth_provider) updates.auth_provider = profile.provider;
      if (!user.provider_user_id) updates.provider_user_id = profile.providerUserId;
      if (profile.avatarUrl && !user.avatar_url) updates.avatar_url = profile.avatarUrl;
      if (preferredName && preferredName !== user.name) updates.name = preferredName;
      if (normalizedEmail && normalizedEmail !== user.email && user.email?.includes('@neva.social')) {
        updates.email = normalizedEmail;
      }

      if (Object.keys(updates).length > 0) {
        user = await this.userService.update(user.id, updates);
      }

      return this.sanitizeUser(user);
    }

    const createdUser = await this.userService.create({
      name: preferredName,
      email: normalizedEmail || this.buildFallbackEmail(profile.provider, profile.providerUserId),
      avatar_url: profile.avatarUrl,
      auth_provider: profile.provider,
      provider_user_id: profile.providerUserId,
    });

    return this.sanitizeUser(createdUser);
  }

  async loginWithGoogle(credential: string) {
    if (String(credential || '').startsWith('mock:')) {
      const profile = this.parseMockSocialCredential(credential, 'google');
      const user = await this.upsertSocialUser(profile);
      return this.login(user);
    }

    const profile = await this.verifyGoogleCredential(credential);
    const user = await this.upsertSocialUser(profile);
    return this.login(user);
  }

  async loginWithApple(identityToken: string, userInfo?: any) {
    if (String(identityToken || '').startsWith('mock:')) {
      const profile = this.parseMockSocialCredential(identityToken, 'apple');
      const rawName = userInfo?.name;
      const nameHint =
        typeof rawName === 'string'
          ? rawName.trim()
          : [rawName?.firstName, rawName?.lastName].filter(Boolean).join(' ').trim();
      const user = await this.upsertSocialUser(profile, nameHint);
      return this.login(user);
    }

    const profile = await this.verifyAppleIdentityToken(identityToken);
    const rawName = userInfo?.name;
    const nameHint =
      typeof rawName === 'string'
        ? rawName.trim()
        : [rawName?.firstName, rawName?.lastName].filter(Boolean).join(' ').trim();
    const user = await this.upsertSocialUser(profile, nameHint);
    return this.login(user);
  }

  async issueTemporarySocialSession(provider: SocialProvider, payload: JWTPayload) {
    const providerUserId = payload.sub;
    if (!providerUserId) {
      throw new UnauthorizedException(`Invalid ${provider} identity payload`);
    }

    const profile: SocialProfile = {
      provider,
      providerUserId,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      name: typeof payload.name === 'string' ? payload.name : undefined,
      avatarUrl: typeof payload.picture === 'string' ? payload.picture : undefined,
    };

    const user = await this.upsertSocialUser(profile);
    return this.login(user);
  }
}
