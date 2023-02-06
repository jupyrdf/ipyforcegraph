/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceZ as d3ZForce } from 'd3-force-3d';

import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class ZForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'ZForceModel';

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ZForceModel.model_name,
      z: null,
    };
  }
  get triggerChanges(): string {
    return 'change:z';
  }

  get force(): TAnyForce {
    const { z } = this;

    let force = d3ZForce();
    force = z == null ? force : force.z(z);
    return force;
  }

  get z() {
    return this.get('z');
  }
}
