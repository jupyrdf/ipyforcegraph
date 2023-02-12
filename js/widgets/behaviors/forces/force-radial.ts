/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceRadial as d3ForceRadial } from 'd3-force-3d';

import { isNumeric, makeNodeTemplate } from '../../../template-utils';
import { IBehave, IForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class RadialForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'RadialForceModel';
  _force: d3ForceRadial;
  radius: CallableFunction | Number | null;
  strength: CallableFunction | Number | null;

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

    let force = this._force;
    force = strength == null ? force : force.strength(strength);
    force = radius == null ? force : force.radius(this.radius);
    force = x == null ? force : force.x(x);
    force = y == null ? force : force.y(y);
    force = z == null ? force : force.z(z);
    return force;
  }

  get triggerChanges(): string {
    return 'change:strength change:radius change:x change:y change:z';
  }

  async onChanged() {
    await this.update_radius();
    await this.update_strength();
    this._updateRequested.emit(void 0);
  }

  async update_strength() {
    let value = this.get('strength');
    if (isNumeric(value)) {
      this.strength = Number(value);
    } else {
      this.strength = await makeNodeTemplate(value);
    }
  }

  async update_radius() {
    let value = this.get('radius');
    if (isNumeric(value)) {
      this.radius = Number(value);
    } else {
      this.radius = await makeNodeTemplate(value);
    }
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
