import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DatabaseService {
  private readonly dbBaseUrl = `${process.env.ROBLE_BASE_URL}/database/${process.env.ROBLE_PROJECT_TOKEN}`;

  async find(tableName: string, filters: any, userToken: string) {
    const response = await axios.get(`${this.dbBaseUrl}/read`, {
      headers: { Authorization: userToken },
      params: { tableName, ...filters }
    });
    return Array.isArray(response.data) ? response.data : (response.data.rows || []);
  }

  async insert(tableName: string, records: any[], userToken: string) {
    const response = await axios.post(`${this.dbBaseUrl}/insert`, 
      { tableName, records },
      { headers: { Authorization: userToken } }
    );
    return response.data;
  }
}