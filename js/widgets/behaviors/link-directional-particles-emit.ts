/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBackboneModelOptions } from '@jupyter-widgets/base';

import { IBehave, WIDGET_DEFAULTS } from '../../tokens';

import { BehaviorModel } from './base';

export class LinkEmitParticleModel extends BehaviorModel implements IBehave {
  static model_name = 'LinkEmitParticleModel';

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: LinkEmitParticleModel.model_name,
      links: [],
    };
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:links', this.onValueChange, this);
    this.onValueChange();
  }

  onValueChange(change?: any) {
    this._updateRequested.emit(void 0);
  }
}
