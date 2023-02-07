/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceRadial as d3ForceRadial } from 'd3-force-3d';

import { IBehave, IForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class RadialForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'RadialForceModel';
  _force: d3ForceRadial;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: RadialForceModel.model_name,
    };
  }

  forceFactory(): d3ForceRadial {
    return d3ForceRadial();
  }

  get force(): d3ForceRadial {
    const { strength, radius, x, y, z } = this;

    let force =this._force;
    force = strength == null ? force : force.strength(strength);
    force = radius == null ? force : force.radius(this.radius);
    force = x == null ? force : force.x(x);
    force = y == null ? force : force.y(y);
    force = z == null ? force : force.z(z);
    return force;
  }

  get triggerChanges(): string {
    return "change:strength change:radius change:x change:y change:z";
  }

  get strength() {
    return this.get('strength');
  }

  get radius() {
    return this.get('radius');
  }

  get x() {
    return this.get('x');
  }

  get y() {
    return this.get('y');
  }

  get z() {
    return this.get('z');
  }
}
