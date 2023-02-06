/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceY as d3YForce } from 'd3-force-3d';

import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class YForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'YForceModel';

  defaults() {
    return {
      ...super.defaults(),
      _model_name: d3YForce.model_name,
      y: null,
    };
  }
  get triggerChanges(): string {
    return 'change:y';
  }

  get force(): TAnyForce {
    const { y } = this;

    let force = d3YForce();
    force = y == null ? force : force.y(y);
    return force;
  }

  get y() {
    return this.get('y');
  }
}
