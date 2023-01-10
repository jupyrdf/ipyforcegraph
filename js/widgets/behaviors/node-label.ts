/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, IHasGraph, INodeBehaveOptions } from '../../tokens';

import { NodeColumnOrTemplate } from './base';

export class NodeLabelModel extends NodeColumnOrTemplate implements IBehave {
  static model_name = 'NodeLabelModel';

  defaults() {
    return { ...super.defaults(), _model_name: NodeLabelModel.model_name };
  }

  columnName(hasGraph: IHasGraph): string | null {
    let columnName = super.getColumnName(hasGraph);
    if (columnName == null) {
      try {
        columnName = (hasGraph.source as any).get('node_id_column');
      } catch (err) {
        console.error('failed to fetch id column', err);
      }
    }
    return columnName || null;
  }

  getNodeLabel(options: INodeBehaveOptions): string | null {
    return super.getNodeAttr(options);
  }
}
