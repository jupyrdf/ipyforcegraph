/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import {
  IBackboneModelOptions,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import { IBehave } from '../../tokens';

import { BehaviorModel } from './base';

export class NodeTooltipModel extends BehaviorModel implements IBehave {
  static model_name = 'NodeTooltipModel';
  static serializers = {
    ...BehaviorModel.serializers,
    label: { deserialize },
  };

  defaults() {
    return {
      ...super.defaults(),
      _model_name: NodeTooltipModel.model_name,
      label: 'id',
    };
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:label', this.onLabelChanged, this);
    void this.onLabelChanged.call(this);
  }

  async onLabelChanged() {
    for (const label of this.label) {
      await label.ensureFacets();
      label.updateRequested.connect(this.onLabelChanged, this);
    }
    this._updateRequested.emit(void 0);
  }

  get label(): String {
    return this.get('label') || 'id';
  }
}
