/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceManyBody as d3ForceManyBody } from 'd3-force-3d';

import { IBehave } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class ManyBodyForce extends ForceBehaviorModel implements IBehave {
  static model_name = 'ManyBodyForceModel';
  static force: d3ForceManyBody;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ManyBodyForce.model_name,
      force: d3ForceManyBody(),
    };
  }
}
