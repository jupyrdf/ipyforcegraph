/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import {
  IBackboneModelOptions,
  WidgetModel,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import { IBehave, IRenderOptions, WIDGET_DEFAULTS } from '../../tokens';
import { DataFrameSourceModel } from '../sources';

import { BehaviorModel } from './base';

export class GraphDataModel extends BehaviorModel implements IBehave {
  static model_name = 'GraphDataModel';
  static serializers = {
    ...WidgetModel.serializers,
    sources: { deserialize },
  };

  protected _sourcesToCapture = 0;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: GraphDataModel.model_name,
      capturing: false,
      source_count: 1,
      sources: [],
    };
  }

  get sourceCount(): number {
    return this.get('source_count');
  }

  get capturing(): boolean {
    return this.get('capturing');
  }

  get sources(): DataFrameSourceModel[] {
    return this.get('sources');
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:capturing', this.onCapturingChanged, this);
    this.onCapturingChanged();
  }

  protected onCapturingChanged(e?: any): void {
    this._sourcesToCapture = this.capturing ? this.sourceCount : 0;
  }

  onRender(options: IRenderOptions): void {
    const { _sourcesToCapture } = this;

    if (!_sourcesToCapture) {
      return;
    }

    const { sourceCount, sources } = this;

    const index = sourceCount - _sourcesToCapture;

    this._sourcesToCapture -= 1;

    let source = sources[index];

    source.setFromGraphData(options.graphData);

    if (this._sourcesToCapture) {
      return;
    }

    for (source of sources) {
      source.save();
    }
    this.set({ capturing: false });
    this.save();
  }
}
