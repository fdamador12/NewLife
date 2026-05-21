import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetCategoriasUseCase {
  constructor(private readonly db: DatabaseService, private readonly systemAuth: SystemAuthService) {}

  async execute() {
    const token = await this.systemAuth.getMasterToken();
    
    // 1. Obtener todas las categorías
    const result = await this.db.find('categorias_contenido', {}, token);
    const categorias = Array.isArray(result) ? result : (result?.rows ?? []);

    // 2. Obtener todo el contenido publicado
    const contenidoResult = await this.db.find('contenido_educativo', { estado: 'PUBLISHED' }, token);
    const listaContenido = Array.isArray(contenidoResult) ? contenidoResult : (contenidoResult?.rows ?? []);

    // 3. Contar contenidos por categoría
    const contadorPorCategoria: Record<string, number> = {};
    listaContenido.forEach((c) => {
      const catId = c.categoria_id || 'otros';
      contadorPorCategoria[catId] = (contadorPorCategoria[catId] || 0) + 1;
    });

    // 4. Agregar contador a cada categoría
    const data = categorias.map((cat) => ({
      ...cat,
      cantidad_contenidos: contadorPorCategoria[cat.categoria_id] || 0,
    }));

    // 5. Agregar "Otros" si hay contenido sin categoría
    const contadorOtros = contadorPorCategoria['otros'] || 0;
    if (contadorOtros > 0) {
      data.push({
        categoria_id: null,
        nombre: 'Otros',
        descripcion: 'Contenido sin categoría específica',
        created_at: new Date().toISOString(),
        cantidad_contenidos: contadorOtros,
      });
    }

    return { data };
  }
}