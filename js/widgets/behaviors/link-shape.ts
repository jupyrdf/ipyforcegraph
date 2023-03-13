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
    width: { deserialize },
    color: { deserialize },
  };

  protected get _modelClass(): typeof LinkShapeModel {
    return LinkShapeModel;
  }

  getLinkWidth(options: ILinkBehaveOptions): number | null {
    return this._facets.width ? this._facets.width(options) : null;
  }

  getLinkColor(options: ILinkBehaveOptions): string | null {
    return this._facets.color ? this._facets.color(options) : null;
  }
}
