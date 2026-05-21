import { Module, forwardRef } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';

// --- Controllers ---
import { SupportGroupController } from './presentation/controllers/grupo-apoyo.controller';
import { CategoriaController } from './presentation/controllers/categoria.controller';
import { ContenidoController } from './presentation/controllers/contenido.controller';

// --- Ports & Adapters ---
import { GRUPO_APOYO_REPOSITORY } from './domain/ports/grupo-apoyo.repository.port';
import { RobleGrupoApoyoRepository } from './infrastructure/adapters/roble-grupo-apoyo.repository';
import { CATEGORIA_REPOSITORY } from './domain/ports/categoria.repository.port';
import { RobleCategoriaRepository } from './infrastructure/adapters/roble-categoria.repository';
import { CONTENIDO_REPOSITORY } from './domain/ports/contenido.repository.port';
import { RobleContenidoRepository } from './infrastructure/adapters/roble-contenido.repository';

// --- Use Cases ---
import { CreateGrupoUseCase } from './application/use-cases/grupos/create-grupo.use-case';
import { UpdateGrupoUseCase } from './application/use-cases/grupos/update-grupo.use-case';
import { DeleteGrupoUseCase } from './application/use-cases/grupos/delete-grupo.use-case';
import { GetAllGruposUseCase } from './application/use-cases/grupos/get-all-grupos.use-case';
import { GetGrupoByIdUseCase } from './application/use-cases/grupos/get-grupo-by-id.use-case';

import { CreateCategoriaUseCase } from './application/use-cases/categorias/create-categoria.use-case';
import { UpdateCategoriaUseCase } from './application/use-cases/categorias/update-categoria.use-case';
import { DeleteCategoriaUseCase } from './application/use-cases/categorias/delete-categoria.use-case';
import { GetAllCategoriasUseCase } from './application/use-cases/categorias/get-all-categorias.use-case';
import { GetCategoriaByIdUseCase } from './application/use-cases/categorias/get-categoria-by-id.use-case';

import { CreateContenidoUseCase } from './application/use-cases/contenido/create-contenido.use-case';
import { UpdateContenidoUseCase } from './application/use-cases/contenido/update-contenido.use-case';
import { DeleteContenidoUseCase } from './application/use-cases/contenido/delete-contenido.use-case';
import { GetAllContenidoUseCase } from './application/use-cases/contenido/get-all-contenido.use-case';
import { GetContenidoByIdUseCase } from './application/use-cases/contenido/get-contenido-by-id.use-case';

@Module({
  imports: [forwardRef(() => AdminModule)],
  controllers: [
    SupportGroupController,
    CategoriaController,
    ContenidoController
  ],
  providers: [
    { provide: GRUPO_APOYO_REPOSITORY, useClass: RobleGrupoApoyoRepository },
    { provide: CATEGORIA_REPOSITORY, useClass: RobleCategoriaRepository },
    { provide: CONTENIDO_REPOSITORY, useClass: RobleContenidoRepository },
    
    // Inyección de los 15 Use Cases
    CreateGrupoUseCase, UpdateGrupoUseCase, DeleteGrupoUseCase, GetAllGruposUseCase, GetGrupoByIdUseCase,
    CreateCategoriaUseCase, UpdateCategoriaUseCase, DeleteCategoriaUseCase, GetAllCategoriasUseCase, GetCategoriaByIdUseCase,
    CreateContenidoUseCase, UpdateContenidoUseCase, DeleteContenidoUseCase, GetAllContenidoUseCase, GetContenidoByIdUseCase
  ],
  exports: [GRUPO_APOYO_REPOSITORY, CATEGORIA_REPOSITORY, CONTENIDO_REPOSITORY],
})
export class CareModule {}