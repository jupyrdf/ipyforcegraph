/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { LinkColumnOrTemplateModel } from './base';

export class LinkDirectionalParticleColorModel
  extends LinkColumnOrTemplateModel
  implements IBehave
{
  static model_name = 'LinkDirectionalParticleColorModel';

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkDirectionalParticleColorModel.model_name,
    };
  }

  getLinkDirectionalParticleColor(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
