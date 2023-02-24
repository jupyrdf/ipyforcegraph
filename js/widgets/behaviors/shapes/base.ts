/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */

export interface IBaseOptions {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  globalScale: number;
}

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

export const TEXT_DEFAULTS: ITextOptions = {
  size: 12,
  fill: 'rgba(0,0,0,1)',
  font: 'sans-serif',
  padding: 0.2,
  text: '',
  scale_on_zoom: true,
  stroke_width: 2,
};

export type TBoundingBox = number[];
