/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceCenter as d3ForceCenter } from 'd3-force-3d';

import { IBehave, IForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class CenterForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'CenterForceModel';
  forceFactory: d3ForceCenter = d3ForceCenter;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: CenterForceModel.model_name,
      x: null,
      y: null,
      z: null,
    };
  }
}
