/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceX as d3XForce } from 'd3-force-3d';

import { isNumeric, makeForceNodeTemplate } from '../../../template-utils';
import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class XForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'XForceModel';
  _force: d3XForce;
  x: CallableFunction | Number | null;
  strength: CallableFunction | Number | null;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: XForceModel.model_name,
      x: null,
      strength: null,
    };
  }

  forceFactory(): d3XForce {
    return d3XForce();
  }

  get triggerChanges(): string {
    return 'change:x change:strength';
  }

  get force(): TAnyForce {
    const { x, strength } = this;

    let force = this._force;
    force = x == null ? force : force.x(x);
    force = strength == null ? force : force.strength(strength);
    return force;
  }

  async onChanged() {
    await this.update_x();
    await this.update_strength();
    this._updateRequested.emit(void 0);
  }

  async update_x() {
    let value = this.get('x');
    if (isNumeric(value)) {
      this.x = Number(value);
    } else {
      this.x = await makeForceNodeTemplate(value);
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
