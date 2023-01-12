/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { LinkColumnOrTemplateModel } from './base';

export class LinkColorModel extends LinkColumnOrTemplateModel implements IBehave {
  static model_name = 'NodeColorModel';

  defaults() {
    return { ...super.defaults(), _model_name: LinkColorModel.model_name };
  }

  getLinkColor(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
