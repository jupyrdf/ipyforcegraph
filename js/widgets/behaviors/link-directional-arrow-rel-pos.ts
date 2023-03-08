/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { LinkColumnOrTemplateModel } from './base';

export class LinkDirectionalArrowRelPosModel
  extends LinkColumnOrTemplateModel
  implements IBehave
{
  static model_name = 'LinkDirectionalArrowRelPosModel';

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkDirectionalArrowRelPosModel.model_name,
    };
  }

  getLinkDirectionalArrowRelPos(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
