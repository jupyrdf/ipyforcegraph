/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, IHasGraph, ILinkBehaveOptions } from '../../tokens';

import { LinkColumnOrTemplateModel } from './base';

export class LinkLabelModel extends LinkColumnOrTemplateModel implements IBehave {
  static model_name = 'NodeLabelModel';

  defaults() {
    return { ...super.defaults(), _model_name: LinkLabelModel.model_name };
  }

  columnName(hasGraph: IHasGraph): string | null {
    return super.getColumnName(hasGraph);
  }

  getLinkLabel(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
