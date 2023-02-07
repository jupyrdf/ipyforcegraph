/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { forceRadial as d3ForceRadial } from 'd3-force-3d';

import { IBehave, IForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class RadialForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'RadialForceModel';
  _force: d3ForceRadial;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: RadialForceModel.model_name,
    };
  }

  forceFactory(): d3ForceRadial {
    return d3ForceRadial();
  }
}
