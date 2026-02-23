import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';
import { UserAuthEntity } from '../../domain/entities/user-auth.entity';

@Injectable()
export class RobleAuthAdapter implements IAuthProviderPort {
    private readonly authBaseUrl = `${process.env.ROBLE_BASE_URL}/auth/${process.env.ROBLE_PROJECT_TOKEN}`;

    async login(email: string, password: string): Promise<UserAuthEntity> {
        try {
            const res = await axios.post(`${this.authBaseUrl}/login`, { email, password });
            const { accessToken, refreshToken } = res.data;
            const verifyRes = await this.verifyToken(accessToken);

            const id = verifyRes?.user?.id || verifyRes?.id || verifyRes?.user?.sub || verifyRes?.sub || verifyRes?.user?.uid;
            const role = verifyRes?.user?.role || verifyRes?.role || 'paciente';

            return new UserAuthEntity(id, email, accessToken, refreshToken, role);
        } catch (error: any) {
            throw new UnauthorizedException(error.response?.data?.message || 'Error de autenticación');
        }
    }

    async register(data: { email: string; password: string; name: string; rol: string }): Promise<UserAuthEntity> {
        try {
            const endpoint = 'signup';
            const url = `${this.authBaseUrl}/${endpoint}`;

            const res = await axios.post(url, {
                name: data.name,
                email: data.email,
                password: data.password
            });

            const user = res.data.user;
            return new UserAuthEntity(user.uid || user.id, user.email, '', '', data.rol);
        } catch (error: any) {
            throw new BadRequestException(error.response?.data?.message || 'Fallo al registrar en Roble');
        }
    }
    async verifyToken(token: string): Promise<any> {
        try {
            const res = await axios.get(`${this.authBaseUrl}/verify-token`, {
                headers: { Authorization: token }
            });
            return res.data;
        } catch (error) {
            return null;
        }
    }
}