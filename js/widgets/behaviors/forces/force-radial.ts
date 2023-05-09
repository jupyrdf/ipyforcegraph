/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceRadial as d3ForceRadial } from 'd3-force-3d';

import { IBehave, IForce } from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';

import { FacetedForceModel } from './force';

export class RadialForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'RadialForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    x: widget_serialization,
    y: widget_serialization,
    z: widget_serialization,
    radius: widget_serialization,
    strength: widget_serialization,
  };

  _force: d3ForceRadial;

  protected get _modelClass(): typeof RadialForceModel {
    return RadialForceModel;
  }

  forceFactory(): d3ForceRadial {
    return d3ForceRadial();
  }

  get force(): d3ForceRadial {
    const { strength, radius, x, y, z } = this._nodeFacets;

    let force = this._force;
    force = strength == null ? force : force.strength(this.wrapForNode(strength));
    force = radius == null ? force : force.radius(this.wrapForNode(radius));
    force = x == null ? force : force.x(x());
    force = y == null ? force : force.y(y());
    force = z == null ? force : force.z(z());
    return force;
  }
}
