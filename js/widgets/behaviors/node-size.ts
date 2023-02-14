/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, IHasGraph, INodeBehaveOptions } from '../../tokens';

import { NodeColumnOrTemplateModel } from './base';

export class NodeSizeModel extends NodeColumnOrTemplateModel implements IBehave {
  static model_name = 'NodeSizeModel';

  defaults() {
    return { ...super.defaults(), _model_name: NodeSizeModel.model_name };
  }

  columnName(hasGraph: IHasGraph): string | null {
    let columnName = super.getColumnName(hasGraph);
    return columnName || null;
  }

  getNodeSize(options: INodeBehaveOptions): string | null {
    return super.getNodeAttr(options);
  }
}
