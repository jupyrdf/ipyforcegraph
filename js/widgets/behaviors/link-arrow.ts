/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { FacetedModel } from './base';

export class LinkArrowModel extends FacetedModel implements IBehave {
  static model_name = 'LinkArrowModel';

  static serializers = {
    ...FacetedModel.serializers,
    length: { deserialize },
    color: { deserialize },
    relative_position: { deserialize },
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
