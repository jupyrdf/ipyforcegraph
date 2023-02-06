/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceManyBody as d3ForceManyBody } from 'd3-force-3d';

import { IBehave, IForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class ManyBodyForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'ManyBodyForceModel';
  forceFactory: d3ForceManyBody = d3ForceManyBody;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ManyBodyForceModel.model_name,
    };
  }
}
