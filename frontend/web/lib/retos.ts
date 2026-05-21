import api from './axios';
import { ChallengeType, ChallengeDifficulty } from '@/app/admin/(panel)/retos/page';

export interface CreateChallengePayload {
  titulo: string;
  descripcion: string;
  dificultad: ChallengeDifficulty;
  tipo: ChallengeType;
  target: number;
}

export interface UpdateChallengePayload extends Partial<CreateChallengePayload> {}

export async function getChallenges(): Promise<any[]> {
  const res = await api.get('/api/web/admin/challenges');
  return res.data;
}

export async function getChallengeById(id: string): Promise<any> {
  const res = await api.get(`/api/web/admin/challenges/${id}`);
  return res.data;
}

export async function createChallenge(data: CreateChallengePayload): Promise<any> {
  const res = await api.post('/api/web/admin/challenges', data);
  return res.data;
}

export async function updateChallenge(id: string, data: UpdateChallengePayload): Promise<any> {
  const res = await api.patch(`/api/web/admin/challenges/${id}`, data);
  return res.data;
}

export async function deleteChallenge(id: string): Promise<void> {
  await api.delete(`/api/web/admin/challenges/${id}`);
}

export async function publishChallenge(id: string): Promise<any> {
  const res = await api.post(`/api/web/admin/challenges/${id}/publish`);
  return res.data;
}