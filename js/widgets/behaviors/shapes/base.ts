/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { LinkObject } from 'force-graph/dist/force-graph';
import type THREE from 'three';

import {
  EMOJI,
  EMark,
  ILinkCanvasBehaveOptions,
  ILinkThreeBehaveOptions,
  INodeCanvasBehaveOptions,
  INodeThreeBehaveOptions,
} from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';
import { FacetedModel } from '../base';

export interface IBaseOptions {
  iframeClasses?: Record<string, any>;
}

export interface INodeOptions extends IBaseOptions {
  x: number;
  y: number;
  globalScale: number;
}

export interface ILinkOptions extends IBaseOptions {
  link: LinkObject;
}

export interface ILinkCanvasOptions extends ILinkOptions {
  context: CanvasRenderingContext2D;
}

export interface INodeCanvasOptions extends INodeOptions {
  context: CanvasRenderingContext2D;
}

export type TBoundingBox = number[];

export const black = 'rgba(0,0,0,1)';
export const transparent = 'rgba(0,0,0,0)';
export const FULL_CIRCLE = Math.PI * 2;

// mixins

export interface IScaleOptions {
  scale_on_zoom?: boolean;
}

export interface IFillAndStrokeOptions extends IScaleOptions {
  fill?: string;
  stroke_width?: number;
  stroke?: string;
  line_dash?: number[];
}

export interface IDimensionOptions extends IFillAndStrokeOptions {
  width?: number;
  height?: number;
  depth?: number;
  opacity?: number;
  offset_x?: number;
  offset_y?: number;
  offset_z?: number;
}

// options for specific shapes

export interface IEllipseOptions extends IDimensionOptions {
  // no additional options
}

export interface ITextOptions extends IFillAndStrokeOptions {
  text: string;
  size?: number;
  size_pixels?: number;
  font?: string;
  background?: string;
  padding?: number;
  offset_x?: number;
  offset_y?: number;
  offset_z?: number;
}

export interface IRectangleOptions extends IDimensionOptions {
  // no additional options
}

// defaults

export const ELLIPSE_DEFAULTS: IEllipseOptions = Object.freeze({
  width: 12,
  height: 12,
  depth: 12,
  opacity: 0.75,
  fill: transparent,
  scale_on_zoom: false,
  stroke: transparent,
  stroke_width: 2,
  offset_x: 0,
  offset_y: 0,
  offset_z: 0,
});

export const RECTANGLE_DEFAULTS: IRectangleOptions = Object.freeze({
  width: 12,
  height: 12,
  depth: 12,
  opacity: 0.75,
  fill: transparent,
  scale_on_zoom: false,
  stroke: transparent,
  stroke_width: 2,
  offset_x: 0,
  offset_y: 0,
  offset_z: 0,
});

export const TEXT_DEFAULTS: ITextOptions = Object.freeze({
  size: 12,
  fill: black,
  font: 'sans-serif',
  padding: 0.2,
  text: '',
  scale_on_zoom: true,
  stroke_width: 2,
  offset_x: 0,
  offset_y: 0,
  offset_z: 0,
});

export class ShapeBaseModel extends FacetedModel {
  /** Required in subclass. The model name should be unique between shapes.  */
  static model_name = 'ShapeBaseModel';

  /** Required in subclass. Draw a node shape on a canvas. */
  drawNode2D(options: INodeCanvasBehaveOptions): void {
    return;
  }

  /** Required in subclass. Draw a node shape in Three.js. */
  drawNode3D(options: INodeThreeBehaveOptions): THREE.Object3D | null {
    return;
  }

  /** Required in subclass. Draw a link shape on a canvas. */
  drawLink2D(options: ILinkCanvasBehaveOptions): void {
    return;
  }

  /** Required in subclass. Draw a link shape in Three.js. */
  drawLink3D(options: ILinkThreeBehaveOptions): THREE.Object3D | null {
    return;
  }

  /** Required in subclass. Position a link shape in Three.js. */
  positionLink3D(options: ILinkThreeBehaveOptions): void {
    return;
  }

  /** Evaluate all facets with the runtime shape into the "dumb" data for drawing. */
  protected _resolveFacets(
    options:
      | INodeCanvasBehaveOptions
      | INodeThreeBehaveOptions
      | ILinkCanvasBehaveOptions
      | ILinkThreeBehaveOptions,
    markType: EMark
  ): Record<string, any> {
    const draw: Record<string, any> = {};
    const facets = markType == 'link' ? this._linkFacets : this._nodeFacets;
    for (const facetName of this._facetNames) {
      if (facets[facetName]) {
        try {
          draw[facetName] = facets[facetName](options);
        } catch (err) {
          console.warn(`${EMOJI} encountered error for ${facetName}`, options, err);
        }
      }
    }
    return draw;
  }
}

export class GeometryShapeModel extends ShapeBaseModel {
  /**
   * All sublcasses of this use the same serializers.
   */
  protected get _facetClass(): typeof GeometryShapeModel {
    return GeometryShapeModel;
  }

  static serializers = {
    ...ShapeBaseModel.serializers,
    width: widget_serialization,
    height: widget_serialization,
    depth: widget_serialization,
    fill: widget_serialization,
    opacity: widget_serialization,
    stroke: widget_serialization,
    stroke_width: widget_serialization,
    scale_on_zoom: widget_serialization,
    line_dash: widget_serialization,
    offset_x: widget_serialization,
    offset_y: widget_serialization,
    offset_z: widget_serialization,
  };

  protected get shapeDefaults(): IDimensionOptions {
    throw new Error(`${EMOJI} missing shape defaults for ${this._modelClass}`);
  }

  drawNode2D(options: INodeCanvasBehaveOptions): void {
    const { context, node, globalScale } = options;
    const { x, y } = node;

    const drawOptions = {
      ...this.shapeDefaults,
      context,
      globalScale,
      x,
      y,
      ...this._resolveFacets(options, EMark.node),
    };

    if (!drawOptions.width) {
      return;
    }

    this._drawCanvas(drawOptions);
  }

  drawNode3D(options: INodeThreeBehaveOptions): THREE.Object3D | null {
    const { node, iframeClasses } = options;
    const { x, y } = node;

    const drawOptions = {
      ...this.shapeDefaults,
      context: null,
      globalScale: null,
      x,
      y,
      iframeClasses,
      ...this._resolveFacets(options, EMark.node),
    };

    if (!drawOptions.width) {
      return null;
    }

    return this._drawThree(drawOptions);
  }

  protected _drawCanvasPath(options: IDimensionOptions & INodeCanvasOptions): void {
    throw new Error(`${EMOJI} does not draw canvas ${this._modelClass}`);
  }

  protected _drawCanvas(options: IDimensionOptions & INodeCanvasOptions): void {
    const { context, globalScale, fill, scale_on_zoom, stroke_width, opacity, stroke } =
      {
        ...RECTANGLE_DEFAULTS,
        ...options,
      };

    context.globalAlpha = opacity;

    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.lineWidth = scale_on_zoom ? stroke_width / globalScale : stroke_width;

    context.setLineDash(options.line_dash || []);

    context.beginPath();

    this._drawCanvasPath(options);

    context.fill();
    context.stroke();
  }

  protected _drawThreeGeometry(
    options: IDimensionOptions & INodeOptions
  ): THREE.BufferGeometry {
    throw new Error(`${EMOJI} doesn't implement 3d geometry ${this._modelClass}`);
  }

  protected _drawThree(options: IDimensionOptions & INodeOptions): THREE.Object3D {
    const { fill, iframeClasses, opacity } = {
      ...RECTANGLE_DEFAULTS,
      ...options,
    };

    const _THREE: typeof THREE = iframeClasses.THREE;

    const geometry = this._drawThreeGeometry(options);

    const material = new _THREE.MeshLambertMaterial({
      color: fill,
      transparent: true,
      opacity,
    });
    const sphere = new _THREE.Mesh(geometry, material);

    return sphere;
  }
}
