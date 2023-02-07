/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceManyBody as d3ForceManyBody } from 'd3-force-3d';

import { IBehave, IForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class ManyBodyForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'ManyBodyForceModel';
  _force: d3ForceManyBody;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ManyBodyForceModel.model_name,
    };
  }

  forceFactory(): d3ForceManyBody {
    return d3ForceManyBody();
  }

  get force(): d3ForceManyBody {
    const { strength, theta, distanceMax, distanceMin } = this;

    let force =this._force;
    force = strength == null ? force : force.strength(strength);
    force = theta == null ? force : force.theta(theta);
    force = distanceMax == null ? force : force.distanceMax(distanceMax);
    force = distanceMin == null ? force : force.distanceMin(distanceMin);
    return force;
  }

  get triggerChanges(): string {
    return "change:strength change:theta change:distance_min change:distance_max";
  }

  get strength() {
    return this.get('strength');
  }

  get theta() {
    return this.get('theta');
  }

  get distanceMin() {
    return this.get('distance_min');
  }

  get distanceMax() {
    return this.get('distance_max');
  }
}
