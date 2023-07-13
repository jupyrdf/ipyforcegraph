/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type THREE from 'three';

import { GeometryShapeModel, INodeCanvasOptions } from './base';
import { INodeOptions, IRectangleOptions, RECTANGLE_DEFAULTS } from './base';

export class RectangleShapeModel extends GeometryShapeModel {
  static model_name = 'RectangleShapeModel';

  protected get _modelClass() {
    return RectangleShapeModel;
  }

  protected get shapeDefaults() {
    return RECTANGLE_DEFAULTS;
  }

  protected _drawCanvasPath(options: IRectangleOptions & INodeCanvasOptions): void {
    const { width, height, context, x, y, scale_on_zoom, globalScale } = options;
    const finalWidth = scale_on_zoom ? width / globalScale : width;
    const finalHeight = scale_on_zoom ? height / globalScale : height;
    context.rect(x - finalWidth / 2, y - finalHeight / 2, finalWidth, finalHeight);
  }

  protected _drawThreeGeometry(
    options: IRectangleOptions & INodeOptions
  ): THREE.BufferGeometry {
    const _THREE: typeof THREE = options.iframeClasses.THREE;
    return new _THREE.BoxGeometry(options.width, options.height, options.depth);
  }
}
