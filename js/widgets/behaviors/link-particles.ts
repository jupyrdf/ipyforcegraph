/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { IBehave, ILinkBehaveOptions } from '../../tokens';

import { FacetedModel } from './base';

export class LinkParticleModel extends FacetedModel implements IBehave {
  static model_name = 'LinkParticleModel';

  static serializers = {
    ...FacetedModel.serializers,
    color: { deserialize },
    density: { deserialize },
    speed: { deserialize },
    width: { deserialize },
  };

  protected get _modelClass(): typeof LinkParticleModel {
    return LinkParticleModel;
  }

  getLinkDirectionalParticleColor(options: ILinkBehaveOptions): string | null {
    return this._facets.color ? this._facets.color(options) : null;
  }

  getLinkDirectionalParticleSpeed(options: ILinkBehaveOptions): number | null {
    return this._facets.speed ? this._facets.speed(options) : null;
  }

  getLinkDirectionalParticles(options: ILinkBehaveOptions): number | null {
    return this._facets.density ? this._facets.density(options) : null;
  }

  getLinkDirectionalParticleWidth(options: ILinkBehaveOptions): number | null {
    return this._facets.width ? this._facets.width(options) : null;
  }
}
