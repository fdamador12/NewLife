import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DatabaseService {
  private readonly dbUrl = `${process.env.ROBLE_BASE_URL}/database/${process.env.ROBLE_PROJECT_TOKEN}`;
  private readonly TIMEOUT = 30000; // 30 segundos
  private readonly MAX_RETRIES = 3;

  // Método para reintentos
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        console.warn(
          `⚠️ ${operationName} - Intento ${attempt}/${this.MAX_RETRIES} falló:`,
          error.message
        );

        if (attempt === this.MAX_RETRIES) {
          console.error(`❌ ${operationName} falló después de ${this.MAX_RETRIES} intentos`);
          throw error;
        }

        // Espera progresiva: 1s, 2s, 3s
        const delayMs = 1000 * attempt;
        console.log(`⏳ Esperando ${delayMs}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  async find(tableName: string, filters: any, token: string) {
    return this.executeWithRetry(
      () =>
        axios.get(`${this.dbUrl}/read`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { tableName, ...filters },
          timeout: this.TIMEOUT,
        }),
      `find(${tableName})`
    ).then(res => res.data);
  }

  async insert(tableName: string, records: any[], token: string) {
    return this.executeWithRetry(
      () =>
        axios.post(
          `${this.dbUrl}/insert`,
          { tableName, records },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: this.TIMEOUT,
          }
        ),
      `insert(${tableName})`
    ).then(res => res.data);
  }

  async update(
    tableName: string,
    idColumn: string,
    idValue: any,
    updates: any,
    token: string
  ) {
    return this.executeWithRetry(
      () =>
        axios.put(
          `${this.dbUrl}/update`,
          {
            tableName,
            idColumn,
            idValue,
            updates,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: this.TIMEOUT,
          }
        ),
      `update(${tableName})`
    ).then(res => res.data);
  }

  async delete(tableName: string, idColumn: string, idValue: any, token: string) {
    return this.executeWithRetry(
      () =>
        axios.delete(`${this.dbUrl}/delete`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { tableName, idColumn, idValue },
          timeout: this.TIMEOUT,
        }),
      `delete(${tableName})`
    ).then(res => res.data);
  }
}