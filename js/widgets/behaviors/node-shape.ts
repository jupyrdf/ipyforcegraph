/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type THREE from 'three';

import { IBackboneModelOptions } from '@jupyter-widgets/base';

import {
  EUpdate,
  IBehave,
  INodeBehaveOptions,
  INodeCanvasBehaveOptions,
  INodeThreeBehaveOptions,
  emptyArray,
} from '../../tokens';
import { widget_serialization } from '../serializers/widget';

import { BehaviorModel, FacetedModel } from './base';
import type { ShapeBaseModel } from './shapes/base';

export class NodeShapeFacetsModel extends FacetedModel implements IBehave {
  static model_name = 'NodeShapeFacetsModel';
  static serializers = {
    ...BehaviorModel.serializers,
    size: widget_serialization,
    color: widget_serialization,
  };

  get _facetClass(): typeof NodeShapeFacetsModel {
    return NodeShapeFacetsModel;
  }

  getNodeSize(options: INodeBehaveOptions): number | null {
    return this._nodeFacets.size ? this._nodeFacets.size(options) : null;
  }

  getNodeColor(options: INodeBehaveOptions): string | null {
    return this._nodeFacets.color ? this._nodeFacets.color(options) : null;
  }
}

export class NodeShapeModel extends NodeShapeFacetsModel implements IBehave {
  static model_name = 'NodeShapeModel';
  static serializers = {
    ...NodeShapeFacetsModel.serializers,
    shapes: widget_serialization,
  };

  defaults() {
    return { ...super.defaults(), _model_name: NodeShapeModel.model_name, shapes: [] };
  }

  get _modelClass(): typeof NodeShapeModel {
    return NodeShapeModel;
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

    const anyThis = this as any;

    if (this.shapes.length && !anyThis.getNodeCanvasObject) {
      anyThis.getNodeCanvasObject = this._getNodeCanvasObject;
      anyThis.getNodeThreeObject = this._getNodeThreeObject;
      this._updateRequested.emit(EUpdate.Behavior);
    } else if (!this.shapes.length && anyThis.getNodeCanvasObject) {
      delete anyThis.getNodeCanvasObject;
      delete anyThis.getNodeThreeObject;
      this._updateRequested.emit(EUpdate.Behavior);
    } else {
      this._updateRequested.emit(void 0);
    }
  }

  get shapes(): ShapeBaseModel[] {
    return this.get('shapes') || emptyArray;
  }

  _getNodeCanvasObject(options: INodeCanvasBehaveOptions): void {
    for (const shape of this.shapes) {
      shape.drawNode2D(options);
    }
  }

  _getNodeThreeObject(options: INodeThreeBehaveOptions): THREE.Object3D | null {
    for (const shape of this.shapes) {
      const obj = shape.drawNode3D(options);
      if (obj) {
        return obj;
      }
    }
  }
}
