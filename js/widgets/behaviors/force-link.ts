/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBehave } from '../../tokens';

import {
    forceLink as d3ForceLink,
 } from "d3-force-3d";
import {ForceBehaviorModel} from "./force";

export class ForceLinkModel extends ForceBehaviorModel implements IBehave {
  static model_name = 'ForceLinkModel';
  static force:d3ForceLink


  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceLinkModel.model_name,
      force: d3ForceLink(),
    };
  }



}
