/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
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

export interface ITextOptions {
  text: string;
  size?: number;
  font?: string;
  fill?: string;
  background?: string;
  padding?: number;
  scale_on_zoom?: boolean;
  stroke_width?: number;
  stroke?: string;
}

export const TEXT_DEFAULTS: ITextOptions = Object.freeze({
  size: 12,
  fill: black,
  font: 'sans-serif',
  padding: 0.2,
  text: '',
  scale_on_zoom: true,
  stroke_width: 2,
});

export interface IEllipseOptions {
  width?: number;
  height?: number;
  depth?: number;
  fill?: string;
  opacity?: number;
  stroke_width?: number;
  stroke?: string;
  scale_on_zoom?: boolean;
}

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

export const FULL_CIRCLE = Math.PI * 2;
