/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceManyBody as d3ForceManyBody } from 'd3-force-3d';

import { IBehave, IForce } from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';

import { FacetedForceModel } from './force';

export class ManyBodyForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'ManyBodyForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    strength: widget_serialization,
    theta: widget_serialization,
    distance_max: widget_serialization,
    distance_min: widget_serialization,
  };

  _force: d3ForceManyBody;

  forceFactory(): d3ForceManyBody {
    return d3ForceManyBody();
  }

  protected get _modelClass(): typeof ManyBodyForceModel {
    return ManyBodyForceModel;
  }

  get force(): d3ForceManyBody {
    const { strength, theta, distance_max, distance_min } = this._facets;

    let force = this._force;
    force = strength == null ? force : force.strength(this.wrapForNode(strength));

    force = theta == null ? force : force.theta(theta());
    force = distance_max == null ? force : force.distanceMax(distance_max());
    force = distance_min == null ? force : force.distanceMin(distance_min());
    return force;
  }
}
