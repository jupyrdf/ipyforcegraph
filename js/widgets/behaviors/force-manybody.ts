/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave } from '../../tokens';

import {
    forceManyBody as d3ForceManyBody,
 } from "d3-force-3d";
 import {ForceBehaviorModel} from "./force";


export class ForceManyBody extends ForceBehaviorModel implements IBehave {
  static model_name = 'ForceManyBody';
  static force:d3ForceManyBody


  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceManyBody.model_name,
      force: d3ForceManyBody(),
    };
  }



}
