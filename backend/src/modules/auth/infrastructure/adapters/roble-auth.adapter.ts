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

            return new UserAuthEntity(
                user.id,
                email,
                accessToken,
                refreshToken,
                user.role || 'paciente'
            );
        } catch (error: any) {
            const message = error.response?.data?.message || 'Error de acceso a Roble';
            throw new UnauthorizedException(message);
        }
    }

    async register(data: { email: string; password: string; name: string }): Promise<UserAuthEntity> {
        try {
            await axios.post(`${this.authBaseUrl}/signup-direct`, {
                name: data.name,
                email: data.email,
                password: data.password
            });
            return new UserAuthEntity('', data.email, '', '', 'paciente');
        } catch (error: any) {
            throw error;
        }
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
}