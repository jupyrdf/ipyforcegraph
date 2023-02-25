/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import {
  IBackboneModelOptions,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import { IBehave, INodeCanvasBehaveOptions } from '../../tokens';

import { BehaviorModel, ShapeBaseModel } from './base';

export class NodeShapeModel extends BehaviorModel implements IBehave {
  static model_name = 'NodeShapeModel';
  static serializers = {
    ...BehaviorModel.serializers,
    shapes: { deserialize },
  };

  defaults() {
    return { ...super.defaults(), _model_name: NodeShapeModel.model_name, shapes: [] };
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on('change:shapes', this.onShapesChanged, this);
    void this.onShapesChanged.call(this);
  }

  async onShapesChanged() {
    for (const shape of this.shapes) {
      await shape.ensureFacets();
      shape.updateRequested.connect(this.onShapesChanged, this);
    }
    this._updateRequested.emit(void 0);
  }

  get shapes(): ShapeBaseModel[] {
    return this.get('shapes') || [];
  }

  getNodeCanvasObject(options: INodeCanvasBehaveOptions): any {
    for (const shape of this.shapes) {
      shape.drawNode(options);
    }
  }
}