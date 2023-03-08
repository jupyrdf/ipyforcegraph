/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { BehaviorModel } from './base';

export class ArrowsModel extends BehaviorModel {
  static model_name = 'ParticlesModel';

  protected get _modelClass(): typeof ArrowsModel {
    return ArrowsModel;
  }

  static serializers = {
    ...BehaviorModel.serializers,
    color: { deserialize },
    length: { deserialize },
    relative_position: { deserialize },
  };

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ArrowsModel.model_name,
    };
  }
}
