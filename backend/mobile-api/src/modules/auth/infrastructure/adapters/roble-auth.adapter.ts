import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';
import { UserAuthEntity } from '../../domain/entities/user-auth.entity';

@Injectable()
export class RobleAuthAdapter implements IAuthProviderPort {
  private readonly authBaseUrl = `${process.env.ROBLE_BASE_URL}/auth/${process.env.ROBLE_PROJECT_TOKEN}`;

  async login(email: string, password: string): Promise<UserAuthEntity> {
    try {
      const res = await axios.post(`${this.authBaseUrl}/login`, { email, password });
      const { accessToken, refreshToken, user } = res.data;
      console.log('Roble login response:', JSON.stringify(res.data));

      return new UserAuthEntity(
        user.id,
        email,
        accessToken,
        refreshToken,
        user.role || 'paciente',
        user.name || ''
      );
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error de acceso a Roble';
      throw new UnauthorizedException(message);
    }
  }

  async register(data: { email: string; password: string; name: string }): Promise<UserAuthEntity> {
    try {
      const res = await axios.post(`${this.authBaseUrl}/signup`, {
        name: data.name,
        email: data.email,
        password: data.password
      });

      console.log('Roble register response:', JSON.stringify(res.data));

      const uid = res.data?.user?.id || res.data?.id || res.data?.uid || '';

      return new UserAuthEntity(uid, data.email, '', '', 'paciente');
    } catch (error: any) {
      throw error;
    }
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    await axios.post(
      `${this.authBaseUrl}/verify-email`,
      { email, code },
    );
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const res = await axios.get(`${this.authBaseUrl}/verify-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch {
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const res = await axios.post(`${this.authBaseUrl}/refresh-token`, { refreshToken });
    return { accessToken: res.data.accessToken };
  }

  async logout(accessToken: string): Promise<void> {
    await axios.post(`${this.authBaseUrl}/logout`, null, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await axios.post(`${this.authBaseUrl}/forgot-password`, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axios.post(`${this.authBaseUrl}/reset-password`, { token, newPassword });
  }
}