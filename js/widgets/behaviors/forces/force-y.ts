/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceY as d3YForce } from 'd3-force-3d';

import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { FacetedForceModel } from './force';

export class YForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'YForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    y: { deserialize },
    strength: { deserialize },
  };

  _force: d3YForce;

  protected get _modelClass(): typeof YForceModel {
    return YForceModel;
  }

  forceFactory(): d3YForce {
    return d3YForce();
  }

  get force(): TAnyForce {
    const { y, strength } = this._facets;

    let force = this._force;
    force = y == null ? force : force.y(this.wrapForNode(y));
    force = strength == null ? force : force.strength(this.wrapForNode(strength));
    return force;
  }
}
