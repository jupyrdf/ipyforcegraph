/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, INodeBehaveOptions } from '../../tokens';
import { widget_serialization } from '../serializers/widget';

import { FacetedModel } from './base';

export class NodeTooltipModel extends FacetedModel implements IBehave {
  static model_name = 'NodeTooltipModel';

  static serializers = {
    ...FacetedModel.serializers,
    label: widget_serialization,
  };

  protected get _modelClass(): typeof NodeTooltipModel {
    return NodeTooltipModel;
  }

  getNodeLabel(options: INodeBehaveOptions): string | null {
    return this._nodeFacets.label ? this._nodeFacets.label(options) : null;
  }
}
