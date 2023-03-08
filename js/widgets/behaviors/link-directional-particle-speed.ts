/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { LinkColumnOrTemplateModel } from './base';

export class LinkDirectionalParticleSpeedModel
  extends LinkColumnOrTemplateModel
  implements IBehave
{
  static model_name = 'LinkDirectionalParticleSpeedModel';

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkDirectionalParticleSpeedModel.model_name,
    };
  }

  getLinkDirectionalParticleSpeed(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
