/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { LinkColumnOrTemplateModel } from './base';

export class LinkDirectionalParticleWidthModel
  extends LinkColumnOrTemplateModel
  implements IBehave
{
  static model_name = 'LinkDirectionalParticleWidthModel';

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkDirectionalParticleWidthModel.model_name,
    };
  }

  getLinkDirectionalParticleWidth(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
