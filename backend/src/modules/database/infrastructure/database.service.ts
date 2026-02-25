import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DatabaseService {
  private readonly dbUrl = `${process.env.ROBLE_BASE_URL}/database/${process.env.ROBLE_PROJECT_TOKEN}`;

  async find(tableName: string, filters: any, token: string) {
    const res = await axios.get(`${this.dbUrl}/read`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { tableName, ...filters },
      timeout: 30000
    });
    return res.data;
  }

  async insert(tableName: string, records: any[], token: string) {
    const res = await axios.post(`${this.dbUrl}/insert`,
      { tableName, records },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return res.data;
  }

  async update(tableName: string, idColumn: string, idValue: any, updates: any, token: string) {
    const url = `${this.dbUrl}/update`;

    const res = await axios.put(url,
      {
        tableName,
        idColumn,
        idValue,
        updates
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return res.data;
  }

  async delete(tableName: string, idColumn: string, idValue: any, token: string) {
    const res = await axios.delete(`${this.dbUrl}/delete`, {
      headers: { 'Authorization': `Bearer ${token}` },
      data: { tableName, idColumn, idValue }
    });
    return res.data;
  }
}