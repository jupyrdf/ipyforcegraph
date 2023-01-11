/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { LinkColumnOrTemplateModel } from './base';

export class LinkDirectionalParticlesModel
  extends LinkColumnOrTemplateModel
  implements IBehave
{
  static model_name = 'LinkDirectionalParticlesModel';

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkDirectionalParticlesModel.model_name,
    };
  }

  getLinkDirectionalParticles(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
