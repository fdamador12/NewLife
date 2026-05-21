import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { IPetProviderPort } from '../../domain/ports/pet-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { calculateForm, calculateLevel } from '../../domain/config/xp-config';

@Injectable()
export class SelectFormUseCase {
  private logger = new Logger(SelectFormUseCase.name);

  constructor(
    @Inject('IPetProviderPort')
    private readonly petProvider: IPetProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string, form: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const pet = await this.petProvider.getPet(usuarioId, masterToken);

    if (!pet) throw new BadRequestException('Pet no encontrada');

    if (!pet.unlocked_forms.includes(form)) {
      throw new BadRequestException(`La forma ${form} no está desbloqueada`);
    }

    await this.petProvider.upsertPet({
      usuario_id: usuarioId,
      xp: pet.xp,
      selected_form: form,
      unlocked_forms: pet.unlocked_forms,
    }, masterToken);

    this.logger.log(`✅ Forma seleccionada: ${form} para usuario ${usuarioId}`);

    return {
      xp: pet.xp,
      level: calculateLevel(pet.xp),
      form: calculateForm(pet.xp),
      selected_form: form,
      unlocked_forms: pet.unlocked_forms,
    };
  }
}