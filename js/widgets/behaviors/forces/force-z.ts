/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceZ as d3ZForce } from 'd3-force-3d';

import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class ZForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'ZForceModel';
  _force: d3ZForce;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ZForceModel.model_name,
      z: null,
    };
  }

  forceFactory(): d3ZForce {
    return d3ZForce();
  }

  get triggerChanges(): string {
    return 'change:z change:strength';
  }

  get force(): TAnyForce {
    const { z, strength } = this;

    let force = this._force;
    force = z == null ? force : force.z(z);
    force = strength == null ? force : force.strength(strength);
    return force;
  }

  get z() {
    return this.get('z');
  }

  get strength() {
    return this.get('strength');
  }
}
