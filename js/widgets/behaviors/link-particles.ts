/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave, ILinkBehaveOptions } from '../../tokens';
import { widget_serialization } from '../serializers/widget';

import { FacetedModel } from './base';

export class LinkParticleModel extends FacetedModel implements IBehave {
  static model_name = 'LinkParticleModel';

  static serializers = {
    ...FacetedModel.serializers,
    color: widget_serialization,
    density: widget_serialization,
    speed: widget_serialization,
    width: widget_serialization,
  };

  protected get _modelClass(): typeof LinkParticleModel {
    return LinkParticleModel;
  }

  getLinkDirectionalParticleColor(options: ILinkBehaveOptions): string | null {
    return this._linkFacets.color ? this._linkFacets.color(options) : null;
  }

  getLinkDirectionalParticleSpeed(options: ILinkBehaveOptions): number | null {
    return this._linkFacets.speed ? this._linkFacets.speed(options) : null;
  }

  getLinkDirectionalParticles(options: ILinkBehaveOptions): number | null {
    return this._linkFacets.density ? this._linkFacets.density(options) : null;
  }

  getLinkDirectionalParticleWidth(options: ILinkBehaveOptions): number | null {
    return this._linkFacets.width ? this._linkFacets.width(options) : null;
  }
}
