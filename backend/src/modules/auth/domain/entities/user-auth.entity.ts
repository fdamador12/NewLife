export class UserAuthEntity {
  constructor(
    public readonly uid: string,
    public readonly email: string,
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly role: string,
  ) {}
}