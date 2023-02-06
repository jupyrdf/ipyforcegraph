/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceCollide as d3ForceCollision } from 'd3-force-3d';

import { IBehave, IForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class CollisionForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'CollisionForceModel';
  forceFactory: d3ForceCollision = d3ForceCollision;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: CollisionForceModel.model_name,
    };
  }
}
