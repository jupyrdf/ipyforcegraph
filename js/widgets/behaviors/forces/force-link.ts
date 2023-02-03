/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
// import type d3Force from 'd3-force';
import { forceLink as d3ForceLink } from 'd3-force-3d';

import { IBehave } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class LinkForceModel extends ForceBehaviorModel implements IBehave {
  static model_name = 'LinkForceModel';
  static force_factory: d3ForceLink;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkForceModel.model_name,
    };
  }
}
