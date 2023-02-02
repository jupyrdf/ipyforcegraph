/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave } from '../../tokens';

import {
    forceCollide as d3ForceCollision,
 } from "d3-force-3d";
 import {ForceBehaviorModel} from "./force";


export class ForceCollision extends ForceBehaviorModel implements IBehave {
  static model_name = 'ForceCollision';
  static force:d3ForceCollision


  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceCollision.model_name,
      force: d3ForceCollision(),
    };
  }
}
