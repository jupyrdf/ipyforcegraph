/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceZ as d3ZForce } from 'd3-force-3d';

import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { FacetedForceModel } from './force';

export class ZForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'ZForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    z: { deserialize },
    strength: { deserialize },
  };

  _force: d3ZForce;

  protected get _modelClass(): typeof ZForceModel {
    return ZForceModel;
  }

  forceFactory(): d3ZForce {
    return d3ZForce();
  }

  get force(): TAnyForce {
    const { z, strength } = this._facets;

    let force = this._force;
    force = z == null ? force : force.z(this.wrapForNode(z));
    force = strength == null ? force : force.strength(this.wrapForNode(strength));
    return force;
  }
}
