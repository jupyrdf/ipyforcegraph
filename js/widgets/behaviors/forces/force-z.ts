/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceZ as d3ZForce } from 'd3-force-3d';

import { isNumeric, makeForceNodeTemplate } from '../../../template-utils';
import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class ZForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'ZForceModel';
  _force: d3ZForce;
  z: CallableFunction | Number | null;
  strength: CallableFunction | Number | null;

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
    return 'change:z change:strength change:active';
  }

  get force(): TAnyForce {
    const { z, strength } = this;

    let force = this._force;
    force = z == null ? force : force.z(z);
    force = strength == null ? force : force.strength(strength);
    return force;
  }

  async update() {
    await this.update_z();
    await this.update_strength();
  }

  async update_z() {
    let value = this.get('z');
    if (isNumeric(value)) {
      this.z = Number(value);
    } else {
      this.z = await makeForceNodeTemplate(value);
    }
  }

  async update_strength() {
    let value = this.get('strength');
    if (isNumeric(value)) {
      this.strength = Number(value);
    } else {
      this.strength = await makeForceNodeTemplate(value);
    }
  }
}
