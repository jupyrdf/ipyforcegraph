/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
// import type d3Force from 'd3-force';
import { forceLink as d3ForceLink } from 'd3-force-3d';

import { IBehave, IForce } from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';

import { FacetedForceModel } from './force';

export class LinkForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'LinkForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    strength: widget_serialization,
    distance: widget_serialization,
  };

  _force: d3ForceLink;

  protected get _modelClass(): typeof LinkForceModel {
    return LinkForceModel;
  }

  forceFactory(): d3ForceLink {
    return d3ForceLink();
  }

  get force(): d3ForceLink {
    const { strength, distance } = this._facets;

    let force = this._force;
    force = strength == null ? force : force.strength(this.wrapForLink(strength));
    force = distance == null ? force : force.distance(this.wrapForLink(distance));
    return force;
  }
}
