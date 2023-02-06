/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */


import { WidgetModel, unpack_models as deserialize } from '@jupyter-widgets/base';

import { LinkColumnOrTemplateModel } from '../base';
import { IForce, TAnyForce } from "../../../tokens";

export class ForceBehaviorModel extends LinkColumnOrTemplateModel implements IForce{
  static model_name = 'ForceBehaviorModel';
  static force: any;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceBehaviorModel.model_name,
    };
  }

  forceFactory(): TAnyForce{
    throw new Error("Not implemented");
  }

  get force(): TAnyForce {
    return this.forceFactory();
  }
}

export class GraphForcesBehaviorModel extends LinkColumnOrTemplateModel {
  static model_name = 'GraphForcesBehaviorModel';
  static serializers = {
    ...WidgetModel.serializers,
    forces: { deserialize },
  };

  defaults() {
    return {
      ...super.defaults(),
      _model_name: GraphForcesBehaviorModel.model_name,
      forces: {},
    };
  }

  get forces(): Map<string, ForceBehaviorModel | null> {
    return this.get('forces');
  }
}
