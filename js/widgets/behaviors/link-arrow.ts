/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';
import { widget_serialization } from '../serializers/widget';

import { FacetedModel } from './base';

export class LinkArrowModel extends FacetedModel implements IBehave {
  static model_name = 'LinkArrowModel';

  static serializers = {
    ...FacetedModel.serializers,
    length: widget_serialization,
    color: widget_serialization,
    relative_position: widget_serialization,
  };

  protected get _modelClass(): typeof LinkArrowModel {
    return LinkArrowModel;
  }

  getLinkDirectionalArrowColor(options: ILinkBehaveOptions): string | null {
    return this._facets.color ? this._facets.color(options) : null;
  }

  getLinkDirectionalArrowLength(options: ILinkBehaveOptions): number | null {
    return this._facets.length ? this._facets.length(options) : null;
  }

  getLinkDirectionalArrowRelPos(options: ILinkBehaveOptions): number | null {
    return this._facets.relative_position
      ? this._facets.relative_position(options)
      : null;
  }
}
