/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceCenter as d3ForceCenter } from 'd3-force-3d';

import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class CenterForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'CenterForceModel';
  _force: d3ForceCenter;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: CenterForceModel.model_name,
      x: null,
      y: null,
      z: null,
    };
  }

  forceFactory(): d3ForceCenter {
    return d3ForceCenter();
  }

  get triggerChanges(): string {
    return 'change:x change:y change:z change:active';
  }

  get force(): TAnyForce {
    const { x, y, z } = this;

    let force = this._force;
    force = x == null ? force : force.x(x);
    force = y == null ? force : force.y(y);
    force = z == null ? force : force.z(z);
    return force;
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
