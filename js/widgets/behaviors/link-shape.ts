/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';
import { widget_serialization } from '../serializers/widget';

import { FacetedModel } from './base';

export class LinkShapeModel extends FacetedModel implements IBehave {
  static model_name = 'LinkShapeModel';

  static serializers = {
    ...FacetedModel.serializers,
    color: widget_serialization,
    curvature: widget_serialization,
    line_dash: widget_serialization,
    width: widget_serialization,
  };

  protected get _modelClass(): typeof LinkShapeModel {
    return LinkShapeModel;
  }

  getLinkColor(options: ILinkBehaveOptions): string | null {
    return this._facets.color ? this._facets.color(options) : null;
  }

  getLinkCurvature(options: ILinkBehaveOptions): number | null {
    return this._facets.curvature ? this._facets.curvature(options) : null;
  }

  getLinkLineDash(options: ILinkBehaveOptions): number[] | null {
    return this._facets.line_dash ? this._facets.line_dash(options) : null;
  }

  getLinkWidth(options: ILinkBehaveOptions): number | null {
    return this._facets.width ? this._facets.width(options) : null;
  }
}
