/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceZ as d3ZForce } from 'd3-force-3d';

import { IBehave, IForce, TAnyForce } from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';

import { FacetedForceModel } from './force';

export class ZForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'ZForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    z: widget_serialization,
    strength: widget_serialization,
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
