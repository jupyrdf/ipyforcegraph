export interface IOptions {
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
}

export const TEXT_DEFAULTS: Partial<ITextOptions> = {
  size: 12,
  background: 'rgba(255, 255, 255, 0.0)',
  fill: 'rgba(0,0,0,1)',
  font: 'sans-serif',
  padding: 0.2,
};

export type TBoundingBox = number[];

export function text(options: ITextOptions & IOptions): TBoundingBox {
  const { context, text, size, globalScale, font, padding, fill, background, x, y } = {
    ...TEXT_DEFAULTS,
    ...options,
  };
  const fontSize = size / globalScale;
  context.font = `${fontSize}px ${font}`;
  const textWidth = context.measureText(text).width;
  const bb = [textWidth + fontSize * padding, fontSize + fontSize * padding];
  context.fillStyle = background;
  context.fillRect(x - bb[0] / 2, y - bb[1] / 2, bb[0], bb[1]);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = fill;
  context.fillText(text, x, y);
  return bb;
}
