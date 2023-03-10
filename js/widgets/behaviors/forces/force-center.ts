/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceCenter as d3ForceCenter } from 'd3-force-3d';

import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { FacetedForceModel } from './force';

export class CenterForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'CenterForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    x: { deserialize },
    y: { deserialize },
    z: { deserialize },
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
