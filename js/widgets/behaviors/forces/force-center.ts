/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceCenter as d3ForceCenter } from 'd3-force-3d';

import { IBehave, IForce, TAnyForce } from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';

import { FacetedForceModel } from './force';

export class CenterForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'CenterForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    x: widget_serialization,
    y: widget_serialization,
    z: widget_serialization,
  };

  _force: d3ForceCenter;

  protected get _modelClass(): typeof CenterForceModel {
    return CenterForceModel;
  }

  forceFactory(): d3ForceCenter {
    return d3ForceCenter();
  }

  get force(): TAnyForce {
    const { x, y, z } = this._facets;

    let force = this._force;
    force = x == null ? force : force.x(x());
    force = y == null ? force : force.y(y());
    force = z == null ? force : force.z(z());
    return force;
  }
}
