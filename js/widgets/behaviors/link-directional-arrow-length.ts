/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { LinkColumnOrTemplateModel } from './base';

export class LinkDirectionalArrowLengthModel
  extends LinkColumnOrTemplateModel
  implements IBehave
{
  static model_name = 'LinkDirectionalArrowLengthModel';

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkDirectionalArrowLengthModel.model_name,
    };
  }

  getLinkDirectionalArrowLength(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
