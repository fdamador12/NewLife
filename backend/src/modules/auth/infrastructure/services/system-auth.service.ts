import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { IAuthProviderPort } from '../../domain/ports/auth-provider.port';

@Injectable()
export class SystemAuthService implements OnModuleInit {
  private masterToken: string | null = null;

  constructor(
    @Inject('IAuthProviderPort')
    private readonly authProvider: IAuthProviderPort,
  ) {}

  async onModuleInit() {
    await this.refreshMasterToken();
  }

  async refreshMasterToken(): Promise<string> {
    const auth = await this.authProvider.login(
      process.env.ROBLE_SYSTEM_EMAIL,
      process.env.ROBLE_SYSTEM_PASSWORD
    );
    this.masterToken = auth.accessToken;
    return this.masterToken;
  }

  async getMasterToken(): Promise<string> {
    if (!this.masterToken) return await this.refreshMasterToken();
    return this.masterToken;
  }
}