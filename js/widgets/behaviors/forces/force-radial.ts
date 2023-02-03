/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceRadial as d3ForceRadial } from 'd3-force-3d';

import { IBehave } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class RadialForce extends ForceBehaviorModel implements IBehave {
  static model_name = 'RadialForceModel';
  static force: d3ForceRadial;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: RadialForce.model_name,
      force: d3ForceRadial(),
    };
  }
}
