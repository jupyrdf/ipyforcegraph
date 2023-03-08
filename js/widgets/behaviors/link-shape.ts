/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { BehaviorModel } from './base';

export class LinkShape extends BehaviorModel {
  static model_name = 'LinkShape';

  protected get _modelClass(): typeof LinkShape {
    return LinkShape;
  }

  static serializers = {
    ...BehaviorModel.serializers,
    color: { deserialize },
    width: { deserialize },
  };

  defaults() {
    return {
      ...super.defaults(),
      _model_name: LinkShape.model_name,
    };
  }
}
