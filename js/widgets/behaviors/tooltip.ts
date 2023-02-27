/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import {
  IBehave,
  IHasGraph,
  ILinkBehaveOptions,
  INodeBehaveOptions,
} from '../../tokens';

import { LinkColumnOrTemplateModel, NodeColumnOrTemplateModel } from './base';

export class NodeTooltipModel extends NodeColumnOrTemplateModel implements IBehave {
  static model_name = 'NodeTooltipModel';

  defaults() {
    return { ...super.defaults(), _model_name: NodeTooltipModel.model_name };
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

export class LinkTooltipModel extends LinkColumnOrTemplateModel implements IBehave {
  static model_name = 'LinkTooltipModel';

  defaults() {
    return { ...super.defaults(), _model_name: LinkTooltipModel.model_name };
  }

  getLinkLabel(options: ILinkBehaveOptions): string | null {
    return super.getLinkAttr(options);
  }
}
