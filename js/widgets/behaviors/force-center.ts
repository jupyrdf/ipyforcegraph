/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave } from '../../tokens';

import {
    forceCenter as d3ForceCenter,
 } from "d3-force-3d";
 import {ForceBehaviorModel} from "./force";


export class ForceCenter extends ForceBehaviorModel implements IBehave {
  static model_name = 'ForceCenter';
  static force:d3ForceCenter


  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceCenter.model_name,
      force: d3ForceCenter(),
    };
  }
}
