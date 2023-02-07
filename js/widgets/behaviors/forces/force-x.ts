/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceX as d3XForce } from 'd3-force-3d';

import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class XForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'XForceModel';
  _force: d3XForce;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: XForceModel.model_name,
      x: null,
    };
  }

  forceFactory(): d3XForce {
    return d3XForce();
  }

  get triggerChanges(): string {
    return 'change:x';
  }

  get force(): TAnyForce {
    const { x } = this;

    let force = this._force;
    force = x == null ? force : force.x(x);
    return force;
  }

  get x() {
    return this.get('x');
  }
}
