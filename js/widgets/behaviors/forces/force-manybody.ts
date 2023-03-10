/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceManyBody as d3ForceManyBody } from 'd3-force-3d';

import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { IBehave, IForce } from '../../../tokens';

import { FacetedForceModel } from './force';

export class ManyBodyForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'ManyBodyForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    strength: { deserialize },
    theta: { deserialize },
    distance_max: { deserialize },
    distance_min: { deserialize },
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
