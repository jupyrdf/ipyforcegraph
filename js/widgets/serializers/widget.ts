/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { unpack_models } from '@jupyter-widgets/base';

export const widget_serialization = {
  deserialize: unpack_models,
  // serialize: (models: WidgetModel[]): string[] => {
  //   const modelIds: string[] = [];
  //   for (const model of models || []) {
  //     modelIds.push(`IPY_MODEL_${model.model_id}`);
  //   }
  //   return modelIds;
  // },
};
