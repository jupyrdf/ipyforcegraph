/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
// import type d3Force from 'd3-force';
import { forceLink as d3ForceLink } from 'd3-force-3d';

import { isNumeric, makeLinkTemplate } from '../../../template-utils';
import { IBehave, IForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class LinkForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'LinkForceModel';
  _force: d3ForceLink;

  protected strength: CallableFunction | Number | null;
  protected distance: CallableFunction | Number | null;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkForceModel.model_name,
      strength: null,
      distance: null,
    };
  }

  forceFactory(): d3ForceLink {
    return d3ForceLink();
  }

  get force(): d3ForceLink {
    const { strength, distance } = this;

    let force = this._force;
    force = strength == null ? force : force.strength(strength);
    force = distance == null ? force : force.distance(distance);
    return force;
  }

  get triggerChanges(): string {
    return 'change:strength change:distance';
  }

  async onChanged() {
    await this.update_distance();
    await this.update_strength();
    this._updateRequested.emit(void 0);
  }

  async update_strength() {
    let value = this.get('strength');
    if (isNumeric(value)) {
      this.strength = Number(value);
    } else {
      this.strength = await makeLinkTemplate(value);
    }
  }

  async update_distance() {
    let value = this.get('distance');
    if (isNumeric(value)) {
      this.distance = Number(value);
    } else {
      this.distance = await makeLinkTemplate(value);
    }
  }
}
