/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceCollide as d3ForceCollision } from 'd3-force-3d';

import { IBehave, IForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class CollisionForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'CollisionForceModel';
  _force: d3ForceCollision;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: CollisionForceModel.model_name,
      strength: null,
      radius: null,
    };
  }

  forceFactory(): d3ForceCollision {
    return d3ForceCollision();
  }

  get force(): d3ForceCollision {
    const { radius, strength } = this;

    let force =this._force;
    force = radius == null ? force : force.radius(radius);
    force = strength == null ? force : force.strength(strength);
    return force;
  }

  get triggerChanges(): string {
    return 'change:radius change:strength';
  }

  get strength() {
    return this.get('strength');
  }

  get radius() {
    return this.get('radius');
  }
}
