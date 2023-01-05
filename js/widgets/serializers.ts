/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { compress, decompress, init } from '@bokuweb/zstd-wasm';
import { Buffer } from 'buffer';

import { IWidgetManager, WidgetModel } from '@jupyter-widgets/base';

import { DEBUG, EMOJI } from '../tokens';

export interface IReceivedSerializedDataFrame {
  buffer: DataView;
}

export interface ISendSerializedDataFrame {
  buffer: DataView;
}

export function jsonToDataFrame(
  obj: IReceivedSerializedDataFrame | null,
  manager?: IWidgetManager
): any {
  const data = decompress(Buffer.from(obj.buffer.buffer));
  const json = JSON.parse(Buffer.prototype.toString.call(data, 'utf8'));
  return json;
}

export function dataFrameToJson(
  obj: any,
  widget?: WidgetModel
): ISendSerializedDataFrame | null {
  console.warn(compress);
  if (obj === null) {
    return null;
  }
  return {
    buffer: null as any,
  };
}

export const dataframe_serialization = {
  deserialize: jsonToDataFrame,
  serialize: dataFrameToJson,
};

export async function initializeZstd() {
  await init();
  DEBUG && console.warn(`${EMOJI} zstd loaded`);
}
