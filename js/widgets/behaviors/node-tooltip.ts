/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { IBehave, INodeBehaveOptions } from '../../tokens';

import { FacetedModel } from './base';

export class NodeTooltipModel extends FacetedModel implements IBehave {
  static model_name = 'NodeTooltipModel';

  static serializers = {
    ...FacetedModel.serializers,
    label: { deserialize },
  };

  protected get _modelClass(): typeof NodeTooltipModel {
    return NodeTooltipModel;
  }

  getNodeLabel(options: INodeBehaveOptions): string | null {
    return this._facets.label ? this._facets.label(options) : null;
  }
}
