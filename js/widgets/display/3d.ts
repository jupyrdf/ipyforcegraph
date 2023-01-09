/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { ForceGraph3DInstance } from '3d-force-graph';

import { ForceGraphModel, ForceGraphView } from './2d';

export class ForceGraph3DModel extends ForceGraphModel {
  static model_name = 'ForceGraph3DModel';
  static serializers = {
    ...ForceGraphModel.serializers,
  };

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceGraph3DModel.model_name,
      _view_name: ForceGraph3DView.view_name,
    };
  }
}

export class ForceGraph3DView extends ForceGraphView<ForceGraph3DInstance> {
  static view_name = 'ForceGraph3DView';

  model: ForceGraph3DModel;

  protected get graphJsClass(): string {
    return 'ForceGraph3D';
  }

  protected async getJsUrl() {
    return (await import('!!file-loader!3d-force-graph/dist/3d-force-graph.min.js'))
      .default;
  }
}
