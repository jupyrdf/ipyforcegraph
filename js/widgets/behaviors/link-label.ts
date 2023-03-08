/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { LinkColumnOrTemplateModel } from './base';

export class LinkLabelModel extends LinkColumnOrTemplateModel implements IBehave {
  static model_name = 'LinkLabelModel';

  defaults() {
    return { ...super.defaults(), _model_name: LinkLabelModel.model_name };
  }

  getLinkLabel(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
