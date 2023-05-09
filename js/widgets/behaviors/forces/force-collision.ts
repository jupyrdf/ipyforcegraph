/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceCollide as d3ForceCollision } from 'd3-force-3d';

import { IBehave, IForce } from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';

import { FacetedForceModel } from './force';

export class CollisionForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'CollisionForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    radius: widget_serialization,
    strength: widget_serialization,
  };

  _force: d3ForceCollision;

  protected get _modelClass(): typeof CollisionForceModel {
    return CollisionForceModel;
  }

  forceFactory(): d3ForceCollision {
    return d3ForceCollision();
  }

  get force(): d3ForceCollision {
    const { radius, strength } = this._nodeFacets;

    let force = this._force;
    force = radius == null ? force : force.radius(this.wrapForNode(radius));
    force = strength == null ? force : force.strength(strength());
    return force;
  }
}
