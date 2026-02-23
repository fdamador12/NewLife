import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) throw new UnauthorizedException('Token no provisto');

    try {
      const data = await this.authProvider.verifyToken(token);
      
      const id = data?.user?.id || data?.id || data?.user?.sub || data?.sub || data?.user?.uid;
      
      if (!id) throw new UnauthorizedException('No se pudo identificar al usuario');

      request.userId = id;
      request.userEmail = data?.user?.email || data?.email;
      request.userRole = data?.user?.role || data?.role;
      request.userToken = token;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
  }
}