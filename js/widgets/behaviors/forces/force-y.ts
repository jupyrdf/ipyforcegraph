/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceY as d3YForce } from 'd3-force-3d';

import { isNumeric, makeNodeTemplate } from '../../../template-utils';
import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class YForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'YForceModel';
  _force: d3YForce;
  y: CallableFunction | Number | null;
  strength: CallableFunction | Number | null;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: d3YForce.model_name,
      y: null,
    };
  }

  forceFactory(): d3YForce {
    return d3YForce();
  }

  get triggerChanges(): string {
    return 'change:y change:strength';
  }

  get force(): TAnyForce {
    const { y, strength } = this;

    let force = this._force;
    force = y == null ? force : force.y(y);
    force = strength == null ? force : force.strength(strength);
    return force;
  }

  async onChanged() {
    await this.update_y();
    await this.update_strength();
    this._updateRequested.emit(void 0);
  }

  async update_y() {
    let value = this.get('y');
    if (isNumeric(value)) {
      this.y = Number(value);
    } else {
      this.y = await makeNodeTemplate(value);
    }
  }

  async update_strength() {
    let value = this.get('strength');
    if (isNumeric(value)) {
      this.strength = Number(value);
    } else {
      this.strength = await makeNodeTemplate(value);
    }
  }
}
