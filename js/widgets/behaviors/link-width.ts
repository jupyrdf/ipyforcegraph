/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { LinkColumnOrTemplateModel } from './base';

export class LinkWidthModel extends LinkColumnOrTemplateModel implements IBehave {
  static model_name = 'LinkWidthModel';

  defaults() {
    return { ...super.defaults(), _model_name: LinkWidthModel.model_name };
  }

  getLinkWidth(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
