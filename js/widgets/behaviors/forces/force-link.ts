/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
// import type d3Force from 'd3-force';
import { forceLink as d3ForceLink } from 'd3-force-3d';
import type { Template } from 'nunjucks';

import { IBehave, IForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class LinkForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'LinkForceModel';
  _force: d3ForceLink;

  protected _strengthTemplate: Template | null;
  protected _distanceTemplate: Template | null;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkForceModel.model_name,
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

  get strength() {
    return this.get('strength');
  }

  get distance() {
    return this.get('distance');
  }
}
