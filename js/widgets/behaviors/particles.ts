/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { BehaviorModel } from './base';

export class ParticlesModel extends BehaviorModel {
  static model_name = 'ParticlesModel';

  protected get _modelClass(): typeof ParticlesModel {
    return ParticlesModel;
  }

  static serializers = {
    ...BehaviorModel.serializers,
    color: { deserialize },
    density: { deserialize },
    speed: { deserialize },
    width: { deserialize },
  };

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ParticlesModel.model_name,
    };
  }
}
