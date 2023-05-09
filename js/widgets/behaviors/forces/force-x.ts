/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceX as d3XForce } from 'd3-force-3d';

import { IBehave, IForce, TAnyForce } from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';

import { FacetedForceModel } from './force';

export class XForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'XForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    x: widget_serialization,
    strength: widget_serialization,
  };

  _force: d3XForce;

  protected get _modelClass(): typeof XForceModel {
    return XForceModel;
  }

  forceFactory(): d3XForce {
    return d3XForce();
  }

  get force(): TAnyForce {
    const { x, strength } = this._nodeFacets;

    let force = this._force;
    force = x == null ? force : force.x(this.wrapForNode(x));
    force = strength == null ? force : force.strength(this.wrapForNode(strength));
    return force;
  }
}
