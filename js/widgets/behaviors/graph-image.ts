/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBackboneModelOptions, WidgetModel } from '@jupyter-widgets/base';
import { ImageModel } from '@jupyter-widgets/controls';

import { EMOJI, EUpdate, IBehave, IRenderOptions, WIDGET_DEFAULTS } from '../../tokens';
import { widget_serialization } from '../serializers/widget';

import { BehaviorModel } from './base';

export class GraphImageModel extends BehaviorModel implements IBehave {
  static model_name = 'GraphImageModel';
  static serializers = {
    ...WidgetModel.serializers,
    frames: widget_serialization,
  };

  protected _framesToCapture = 0;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: GraphImageModel.model_name,
      enabled: false,
      frame_count: 1,
      frames: [],
    };
  }

  get frameCount(): number {
    return this.get('frame_count');
  }

  get capturing(): boolean {
    return this.get('capturing');
  }

  get frames(): ImageModel[] {
    return this.get('frames');
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:capturing', this.onCapturingChanged, this);
    this.onCapturingChanged();
  }

  protected onCapturingChanged(e?: any): void {
    this._framesToCapture = this.capturing ? this.frameCount : 0;
    if (this._framesToCapture) {
      this._updateRequested.emit(EUpdate.Render);
    }
  }

  onRender(options: IRenderOptions): void {
    const { _framesToCapture } = this;

    if (!_framesToCapture) {
      return;
    }

    const { frameCount } = this;

    const index = frameCount - _framesToCapture;

    this._framesToCapture -= 1;

    const { context2d, renderer3d } = options;

    let canvas: HTMLCanvasElement | null = null;

    if (context2d) {
      canvas = context2d.canvas;
    } else if (renderer3d) {
      canvas = renderer3d.domElement;
    }

    if (canvas == null) {
      console.warn(`${EMOJI} couldn't handle post render of`, options);
      return;
    }

    canvas.toBlob(this.onBlob.bind(this, index, this._framesToCapture === 0));
  }

  protected onBlob = async (
    index: number,
    save: boolean,
    blob: Blob
  ): Promise<void> => {
    let frame = this.frames[index];
    const value = new DataView(await blob.arrayBuffer());
    frame.set({ value });
    if (!save) {
      return;
    }
    for (frame of this.frames) {
      frame.save();
    }
    this.set({ capturing: false });
    this.save();
  };
}
