/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, INodeBehaveOptions } from '../../tokens';

import { NodeColumnOrTemplateModel } from './base';

export class NodeColorModel extends NodeColumnOrTemplateModel implements IBehave {
  static model_name = 'NodeColorModel';

  defaults() {
    return { ...super.defaults(), _model_name: NodeColorModel.model_name };
  }

  getNodeColor(options: INodeBehaveOptions): string | null {
    return super.getNodeAttr(options);
  }
}
