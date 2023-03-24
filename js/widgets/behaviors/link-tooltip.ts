/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';
import { widget_serialization } from '../serializers/widget';

import { FacetedModel } from './base';

export class LinkTooltipModel extends FacetedModel implements IBehave {
  static model_name = 'LinkTooltipModel';

  static serializers = {
    ...FacetedModel.serializers,
    label: widget_serialization,
  };

  protected get _modelClass(): typeof LinkTooltipModel {
    return LinkTooltipModel;
  }

  getLinkLabel(options: ILinkBehaveOptions): string | null {
    return this._facets.label ? this._facets.label(options) : null;
  }
}
