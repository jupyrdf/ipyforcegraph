/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type THREE from 'three';

import { JSONExt } from '@lumino/coreutils';

import {
  IBackboneModelOptions,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import {
  EMOJI,
  INodeCanvasBehaveOptions,
  INodeThreeBehaveOptions,
} from '../../../tokens';
import { functor } from '../../../utils';
import { BehaviorModel, DynamicModel } from '../base';

export interface IBaseOptions {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  globalScale: number;
  iframeClasses?: Record<string, any>;
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
}

export interface IDimensionOptions extends IFillAndStrokeOptions {
  width?: number;
  height?: number;
  depth?: number;
  opacity?: number;
}

// options for specific shapes

export interface IEllipseOptions extends IDimensionOptions {
  // no additional options
}

export interface ITextOptions extends IFillAndStrokeOptions {
  text: string;
  size?: number;
  font?: string;
  background?: string;
  padding?: number;
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
});

export const TEXT_DEFAULTS: ITextOptions = Object.freeze({
  size: 12,
  fill: black,
  font: 'sans-serif',
  padding: 0.2,
  text: '',
  scale_on_zoom: true,
  stroke_width: 2,
});

export class ShapeBaseModel extends BehaviorModel {
  /** Required in subclass. The model name should be unique between shapes.  */
  static model_name = 'TextShapeModel';

  /** Required in subclass. All new traits of a shape might be dynamic  */
  static serializers = {
    ...BehaviorModel.serializers,
  };

  /** Required in subclass. Provides acesss to active `__class__`. */
  protected get _modelClass(): typeof ShapeBaseModel {
    return ShapeBaseModel;
  }

  /** Required in subclass. Draw a shape on a canvas. */
  drawNode2D(options: INodeCanvasBehaveOptions): void {
    return;
  }

  /** Required in subclass. Draw a shape in Three.js. */
  drawNode3D(options: INodeThreeBehaveOptions): THREE.Object3D | null {
    return;
  }

  /** Facets are cached as handlers for a specific entity. */
  protected _facets: Record<string, Function> = JSONExt.emptyObject as any;

  /** Names of facets are calculated once, on initialization. */
  protected _facetNames: string[] | null = null;

  /** Lazily calculate asset names. */
  protected get facetNames() {
    if (this._facetNames == null) {
      const baseKeys = [...Object.keys(ShapeBaseModel.serializers)];
      const facetNames: string[] = [];
      for (const key of Object.keys(this._modelClass.serializers)) {
        if (baseKeys.includes(key)) {
          continue;
        }
        facetNames.push(key);
      }
      this._facetNames = facetNames;
    }
    return this._facetNames;
  }

  /** Initialize the model and wire up listeners.  */
  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    let events = '';
    for (const facet of this.facetNames) {
      events += `change:${facet} `;
    }
    this.on(events, this._onFacetsChanged, this);
    void this._onFacetsChanged.call(this);
  }

  /** Populate facet handlers. */
  async ensureFacets() {
    const facets: Record<string, Function> = {};
    for (const facetName of this.facetNames) {
      let facet = this.get(facetName);
      if (facet instanceof DynamicModel) {
        await facet.ensureHandlers();
        facets[facetName] = facet.nodeHandler;
        facet.updateRequested.connect(this._onFacetsChanged, this);
        continue;
      }

      if (facet != null) {
        facets[facetName] = functor(facet);
      }
    }
    this._facets = facets;
  }

  /** Evaluate all facets with the runtime shape*/
  protected _resolveFacets(
    options: INodeCanvasBehaveOptions | INodeThreeBehaveOptions
  ): Record<string, any> {
    const draw: Record<string, any> = {};
    for (const facetName of this._facetNames) {
      if (this._facets[facetName]) {
        try {
          draw[facetName] = this._facets[facetName](options);
        } catch (err) {
          console.warn(`${EMOJI} encountered error for ${facetName}`, options, err);
        }
      }
    }
    return draw;
  }

  /** Handle the fact changing. */
  protected async _onFacetsChanged() {
    this._facets = JSONExt.emptyObject as any;
    this._updateRequested.emit(void 0);
  }

  defaults() {
    return { ...super.defaults(), _model_name: this._modelClass.model_name };
  }
}

export class GeometryShapeModel extends ShapeBaseModel {
  protected get _modelClass(): typeof GeometryShapeModel {
    return GeometryShapeModel;
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

  protected get shapeDefaults(): IDimensionOptions {
    throw new Error(`${EMOJI} missing shape defaults for ${this._modelClass}`);
  }

  drawNode2D(options: INodeCanvasBehaveOptions): void {
    const { context, node, globalScale } = options;
    const { x, y } = node;

    this._drawCanvas({
      ...this.shapeDefaults,
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
      ...this.shapeDefaults,
      context: null,
      globalScale: null,
      x,
      y,
      iframeClasses,
      ...this._resolveFacets(options),
    });
  }

  protected _drawCanvasPath(options: IDimensionOptions & IBaseOptions): void {
    throw new Error(`${EMOJI} does not draw canvas ${this._modelClass}`);
  }

  protected _drawCanvas(options: IDimensionOptions & IBaseOptions): void {
    const { context, globalScale, fill, scale_on_zoom, stroke_width, opacity, stroke } =
      {
        ...RECTANGLE_DEFAULTS,
        ...options,
      };

    context.globalAlpha = opacity;

    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.lineWidth = scale_on_zoom ? stroke_width / globalScale : stroke_width;

    context.beginPath();

    this._drawCanvasPath(options);

    context.fill();
    context.stroke();
  }

  protected _drawThreeGeometry(
    options: IDimensionOptions & IBaseOptions
  ): THREE.BufferGeometry {
    throw new Error(`${EMOJI} doesn't implement 3d geometry ${this._modelClass}`);
  }

  protected _drawThree(options: IDimensionOptions & IBaseOptions): THREE.Object3D {
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
