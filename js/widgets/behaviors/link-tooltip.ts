/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';

// import { LinkColumnOrTemplateModel } from './base';

export class LinkTooltipModel extends LinkColumnOrTemplateModel implements IBehave {
  static model_name = 'LinkTooltipModel';

  defaults() {
    return { ...super.defaults(), _model_name: LinkTooltipModel.model_name };
  }

  getLinkLabel(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
