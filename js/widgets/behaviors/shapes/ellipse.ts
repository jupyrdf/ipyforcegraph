/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type THREE from 'three';

import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { INodeCanvasBehaveOptions, INodeThreeBehaveOptions } from '../../../tokens';
import { ShapeBaseModel } from '../base';

import { ELLIPSE_DEFAULTS, FULL_CIRCLE, IBaseOptions, IEllipseOptions } from './base';

export class EllipseShapeModel extends ShapeBaseModel {
  static model_name = 'EllipseShapeModel';

  protected get _modelClass(): typeof EllipseShapeModel {
    return EllipseShapeModel;
  }

  static serializers = {
    ...ShapeBaseModel.serializers,
    width: { deserialize },
    height: { deserialize },
    depth: { deserialize },
    fill: { deserialize },
    opacity: { deserialize },
    stroke: { deserialize },
    stroke_width: { deserialize },
    scale_on_zoom: { deserialize },
  };

  drawNode2D(options: INodeCanvasBehaveOptions): void {
    const { context, node, globalScale } = options;
    const { x, y } = node;

    this._drawCanvas({
      ...ELLIPSE_DEFAULTS,
      context,
      globalScale,
      x,
      y,
      ...this._resolveFacets(options),
    });
  }

  drawNode3D(options: INodeThreeBehaveOptions): THREE.Object3D {
    const { node, iframeClasses } = options;
    const { x, y } = node;

    return this._drawThree({
      ...ELLIPSE_DEFAULTS,
      context: null,
      globalScale: null,
      x,
      y,
      iframeClasses,
      ...this._resolveFacets(options),
    });
  }

  protected _drawCanvas(options: IEllipseOptions & IBaseOptions): void {
    const {
      context,
      globalScale,
      fill,
      x,
      y,
      scale_on_zoom,
      stroke_width,
      opacity,
      stroke,
      width,
      height,
    } = {
      ...ELLIPSE_DEFAULTS,
      ...options,
    };

    context.globalAlpha = opacity;

    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.beginPath();
    context.lineWidth = scale_on_zoom ? stroke_width / globalScale : stroke_width;
    context.ellipse(
      x,
      y,
      scale_on_zoom ? width / 2 / globalScale : width / 2,
      scale_on_zoom ? height / 2 / globalScale : height / 2,
      0,
      0,
      FULL_CIRCLE
    );
    context.fill();
    context.stroke();
  }

  protected _drawThree(options: IEllipseOptions & IBaseOptions): THREE.Object3D {
    const { width, height, depth, fill, iframeClasses, opacity } = {
      ...ELLIPSE_DEFAULTS,
      ...options,
    };

    const _THREE: typeof THREE = iframeClasses.THREE;

    const geometry = new _THREE.SphereGeometry(width, height, depth);
    const material = new _THREE.MeshLambertMaterial({
      color: fill,
      transparent: true,
      opacity,
    });
    const sphere = new _THREE.Mesh(geometry, material);

    return sphere;
  }
}
