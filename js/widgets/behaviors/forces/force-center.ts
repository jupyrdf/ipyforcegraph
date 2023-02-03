/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceCenter as d3ForceCenter } from 'd3-force-3d';

import { IBehave } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class CenterForce extends ForceBehaviorModel implements IBehave {
  static model_name = 'CenterForceModel';
  static force_factory: d3ForceCenter;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: CenterForce.model_name,
      x: null,
      y: null,
      z: null,
    };
  }
}
