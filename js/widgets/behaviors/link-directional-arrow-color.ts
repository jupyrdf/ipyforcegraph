/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { LinkColumnOrTemplateModel } from './base';

export class LinkDirectionalArrowColorModel
  extends LinkColumnOrTemplateModel
  implements IBehave
{
  static model_name = 'LinkDirectionalArrowColorModel';

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkDirectionalArrowColorModel.model_name,
    };
  }

  getLinkDirectionalArrowColor(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
