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
  if (!obj.buffer) {
    return obj;
  }
  const compressedData = Buffer.from(obj.buffer.buffer);
  const data = decompress(compressedData);
  const jsonString = Buffer.prototype.toString.call(data, 'utf8');
  const json = JSON.parse(jsonString);
  return json;
}

export function dataFrameToJson(
  obj: any,
  widget?: WidgetModel
): ISendSerializedDataFrame | null {
  const jsonString = JSON.stringify(obj);
  const data = Buffer.from(jsonString, 'utf-8');
  const compressedData = compress(data);
  return {
    buffer: compressedData.buffer as any,
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
