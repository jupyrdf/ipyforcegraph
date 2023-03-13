/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type THREE from 'three';

import { GeometryShapeModel } from './base';
import { ELLIPSE_DEFAULTS, FULL_CIRCLE, IBaseOptions, IEllipseOptions } from './base';

export class EllipseShapeModel extends GeometryShapeModel {
  static model_name = 'EllipseShapeModel';

  protected get _modelClass() {
    return EllipseShapeModel;
  }

  protected get shapeDefaults() {
    return ELLIPSE_DEFAULTS;
  }

  protected _drawCanvasPath(options: IEllipseOptions & IBaseOptions): void {
    const { width, height, context, x, y, scale_on_zoom, globalScale } = options;
    const radiusX = width / 2;
    const radiusY = height / 2;
    context.ellipse(
      x,
      y,
      scale_on_zoom ? radiusX / globalScale : radiusX,
      scale_on_zoom ? radiusY / globalScale : radiusY,
      0,
      0,
      FULL_CIRCLE
    );
  }

  protected _drawThreeGeometry(
    options: IEllipseOptions & IBaseOptions
  ): THREE.BufferGeometry {
    const { height, width, depth, scale_on_zoom, globalScale } = options;
    const _THREE: typeof THREE = options.iframeClasses.THREE;
    const geometry = new _THREE.SphereGeometry(
      scale_on_zoom ? width / globalScale : width
    );
    geometry.applyMatrix4(
      new _THREE.Matrix4().makeScale(1.0, height / width, depth / width)
    );
    return geometry;
  }
}
