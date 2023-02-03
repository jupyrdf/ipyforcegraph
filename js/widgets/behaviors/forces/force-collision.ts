/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceCollide as d3ForceCollision } from 'd3-force-3d';

import { IBehave } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class CollisionForce extends ForceBehaviorModel implements IBehave {
  static model_name = 'CollisionForceModel';
  static force: d3ForceCollision;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: CollisionForce.model_name,
      force: d3ForceCollision(),
    };
  }
}
