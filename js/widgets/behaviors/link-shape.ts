/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { IBackboneModelOptions } from '@jupyter-widgets/base';

import {
  EUpdate,
  IBehave,
  ILinkBehaveOptions,
  ILinkCanvasBehaveOptions,
  ILinkThreeBehaveOptions,
  emptyArray,
} from '../../tokens';
import { widget_serialization } from '../serializers/widget';

import { BehaviorModel, FacetedModel } from './base';
import { ShapeBaseModel } from './shapes/base';

export class LinkShapeFacetsModel extends FacetedModel implements IBehave {
  static model_name = 'NodeShapeFacetsModel';
  static serializers = {
    ...BehaviorModel.serializers,
    color: widget_serialization,
    curvature: widget_serialization,
    line_dash: widget_serialization,
    width: widget_serialization,
  };

  get _facetClass(): typeof LinkShapeFacetsModel {
    return LinkShapeFacetsModel;
  }

  getLinkColor(options: ILinkBehaveOptions): string | null {
    return this._linkFacets.color ? this._linkFacets.color(options) : null;
  }

  getLinkCurvature(options: ILinkBehaveOptions): number | null {
    return this._linkFacets.curvature ? this._linkFacets.curvature(options) : null;
  }

  getLinkLineDash(options: ILinkBehaveOptions): number[] | null {
    return this._linkFacets.line_dash ? this._linkFacets.line_dash(options) : null;
  }

  getLinkWidth(options: ILinkBehaveOptions): number | null {
    return this._linkFacets.width ? this._linkFacets.width(options) : null;
  }
}

export class LinkShapeModel extends LinkShapeFacetsModel implements IBehave {
  static model_name = 'LinkShapeModel';

  static serializers = {
    ...LinkShapeFacetsModel.serializers,
    shapes: widget_serialization,
  };

  defaults() {
    return { ...super.defaults(), _model_name: LinkShapeModel.model_name, shapes: [] };
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
      anyThis.getLinkCanvasObject = this._getLinkCanvasObject;
      anyThis.getLinkThreeObject = this._getLinkThreeObject;
      this._updateRequested.emit(EUpdate.Behavior);
    } else if (this.shapes.length && !anyThis.getNodeCanvasObject) {
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

  protected get _modelClass(): typeof LinkShapeModel {
    return LinkShapeModel;
  }

  _getLinkCanvasObject(options: ILinkCanvasBehaveOptions): void {
    for (const shape of this.shapes) {
      shape.drawLink2D(options);
    }
  }

  _getLinkThreeObject(options: ILinkThreeBehaveOptions): THREE.Object3D | null {
    for (const shape of this.shapes) {
      const obj = shape.drawLink3D(options);
      if (obj) {
        return obj;
      }
    }
  }
}
