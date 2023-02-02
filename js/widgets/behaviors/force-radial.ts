/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave } from '../../tokens';

import {
    forceRadial as d3ForceRadial
 } from "d3-force-3d";
 import {ForceBehaviorModel} from "./force";


export class ForceRadial extends ForceBehaviorModel implements IBehave {
  static model_name = 'ForceRadial';
  static force:d3ForceRadial


  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceRadial.model_name,
      force: d3ForceRadial(),
    };
  }
}
