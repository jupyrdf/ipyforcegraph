/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type THREE from 'three';

import { GeometryShapeModel } from './base';
import { IBaseOptions, IRectangleOptions, RECTANGLE_DEFAULTS } from './base';

export class RectangleShapeModel extends GeometryShapeModel {
  static model_name = 'RectangleShapeModel';

  protected get shapeDefaults() {
    return RECTANGLE_DEFAULTS;
  }

  protected _drawCanvasPath(options: IRectangleOptions & IBaseOptions): void {
    const { width, height, context, x, y, scale_on_zoom, globalScale } = options;
    context.rect(
      x,
      y,
      scale_on_zoom ? width / globalScale : width,
      scale_on_zoom ? height / globalScale : height
    );
  }

  protected _drawThreeGeometry(
    options: IRectangleOptions & IBaseOptions
  ): THREE.BufferGeometry {
    const _THREE: typeof THREE = options.iframeClasses.THREE;
    return new _THREE.BoxGeometry(options.width, options.height, options.depth);
  }
}
