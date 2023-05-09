/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceY as d3YForce } from 'd3-force-3d';

import { IBehave, IForce, TAnyForce } from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';

import { FacetedForceModel } from './force';

export class YForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'YForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    y: widget_serialization,
    strength: widget_serialization,
  };

  _force: d3YForce;

  protected get _modelClass(): typeof YForceModel {
    return YForceModel;
  }

  forceFactory(): d3YForce {
    return d3YForce();
  }

  get force(): TAnyForce {
    const { y, strength } = this._nodeFacets;

    let force = this._force;
    force = y == null ? force : force.y(this.wrapForNode(y));
    force = strength == null ? force : force.strength(this.wrapForNode(strength));
    return force;
  }
}
