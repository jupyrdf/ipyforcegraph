/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceX as d3XForce } from 'd3-force-3d';

import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { FacetedForceModel } from './force';

export class XForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'XForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    x: { deserialize },
    strength: { deserialize },
  };

  _force: d3XForce;

  protected get _modelClass(): typeof XForceModel {
    return XForceModel;
  }

  forceFactory(): d3XForce {
    return d3XForce();
  }

  get force(): TAnyForce {
    const { x, strength } = this._facets;

    let force = this._force;
    force = x == null ? force : force.x(this.wrapForNode(x));
    force = strength == null ? force : force.strength(this.wrapForNode(strength));
    return force;
  }
}
