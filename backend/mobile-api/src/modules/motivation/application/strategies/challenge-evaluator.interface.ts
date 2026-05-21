export interface IChallengeEvaluator {
  evaluate(
    usuarioId: string, 
    target: number, 
    fechaInicio: string,
    userToken: string, 
    masterToken?: string
  ): Promise<number>;
}