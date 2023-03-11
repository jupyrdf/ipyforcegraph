/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { FacetedModel } from './base';

export class LinkShapeModel extends FacetedModel implements IBehave {
  static model_name = 'LinkShapeModel';

  static serializers = {
    ...FacetedModel.serializers,
    color: { deserialize },
    curvature: { deserialize },
    link_shape: { deserialize },
    line_dash: { deserialize },
    width: { deserialize },
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
