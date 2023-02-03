/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type d3Force from 'd3-force';

import { LinkColumnOrTemplateModel } from '../base';

export class ForceBehaviorModel extends LinkColumnOrTemplateModel {
  static model_name = 'ForceBehaviorModel';
  static force: any;
  enabled: boolean;
  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceBehaviorModel.model_name,
      enabled: true,
    };
  }

  get force(): d3Force.Force<any, any> {
    return;
  }

  forceFactory() {}
}
