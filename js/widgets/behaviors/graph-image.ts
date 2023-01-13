/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { WidgetModel, unpack_models as deserialize } from '@jupyter-widgets/base';
import { ImageModel } from '@jupyter-widgets/controls';

import { IBehave, IRenderOptions, WIDGET_DEFAULTS } from '../../tokens';

import { BehaviorModel } from './base';

export class GraphImageModel extends BehaviorModel implements IBehave {
  static model_name = 'GraphImageModel';
  static serializers = {
    ...WidgetModel.serializers,
    frames: { deserialize },
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

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this.on('change:capturing', this.onCapturingChanged, this);
    this.onCapturingChanged();
  }

  protected onCapturingChanged(e?: any): void {
    this._framesToCapture = this.capturing ? this.frameCount : 0;
  }

  onRender(options: IRenderOptions): void {
    const { _framesToCapture } = this;

    if (!_framesToCapture) {
      return;
    }

    const { frameCount } = this;

    const index = frameCount - _framesToCapture;

    this._framesToCapture -= 1;

    const ctx = options.ctx as CanvasRenderingContext2D;
    const canvas = ctx.canvas;
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
