/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ForceGraphInstance } from 'force-graph';

import { IBackboneModelOptions } from '@jupyter-widgets/base';

import { IBehave, IZoomData, WIDGET_DEFAULTS } from '../../tokens';
import { widget_serialization } from '../serializers/widget';

import { FacetedModel } from './base';

class ZoomBase extends FacetedModel implements IBehave {
  get zoom(): number | null {
    return this.get('zoom');
  }

  set zoom(zoom: number | null) {
    this.set('zoom', zoom);
  }

  get center(): number[] {
    return this.get('center');
  }

  set center(center: number[]) {
    this.set('center', center);
  }
}

export class GraphCameraModel extends ZoomBase implements IBehave {
  static model_name = 'GraphCameraModel';

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: GraphCameraModel.model_name,
      zoom: 0,
      center: [0, 0],
    };
  }

  onZoom(zoom: IZoomData): void {
    this.zoom = zoom.k;
    const z = zoom.z == null ? [] : [zoom.z];
    this.center = [zoom.x, zoom.y, ...z];
    this.save();
  }
}

export class GraphDirectorModel extends ZoomBase implements IBehave {
  static model_name = 'GraphDirectorModel';

  private _resetting = false;

  static serializers = {
    ...FacetedModel.serializers,
    fit_nodes: widget_serialization,
  };

  protected get _modelClass(): typeof GraphDirectorModel {
    return GraphDirectorModel;
  }

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: GraphCameraModel.model_name,
      zoom: null,
      fit_nodes: null,
      fit_padding: null,
      center: null,
      zoom_first: false,
      zoom_duration: 0.2,
      pan_duration: 0.2,
      fit_duration: 0.2,
    };
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on(
      'change:zoom change:center change:fit_nodes change:fit_padding',
      this.onZoomChanged,
      this
    );
    this.updateRequested.connect(this.onZoomChanged, this);
    this.onZoomChanged();
  }

  get zoomFirst(): boolean {
    return this.get('zoom_first');
  }

  set zoomFirst(zoomFirst: boolean) {
    this.set('zoom_first', zoomFirst);
  }

  get zoomDuration(): number {
    return (this.get('zoom_duration') || 0) * 1000;
  }

  set zoomDuration(zoomDuration: number) {
    this.set('zoom_duration', zoomDuration);
  }

  get panDuration(): number {
    return (this.get('pan_duration') || 0) * 1000;
  }

  set panDuration(panDuration: number) {
    this.set('pan_duration', panDuration);
  }

  get fitDuration(): number {
    return (this.get('fit_duration') || 0) * 1000;
  }

  set fitDuration(fitDuration: number) {
    this.set('fit_duration', fitDuration);
  }

  get fitPadding(): number {
    return this.get('fit_padding');
  }

  set fitPadding(fitPadding: number) {
    this.set('fit_padding', fitPadding);
  }

  onZoomChanged() {
    if (!this._resetting) {
      this._graphCameraUpdateRequested.emit();
    }
  }

  async updateGraphCamera(graph: ForceGraphInstance): Promise<void> {
    let fitNodes = null;
    if (this.get('fit_nodes')) {
      await this.ensureFacets();
      fitNodes = this._nodeFacets['fit_nodes'];
    }
    if (fitNodes) {
      const wrappedFit = this.wrapForNode(fitNodes) as any;
      graph.zoomToFit(this.fitDuration, this.fitPadding, wrappedFit);
    } else {
      const k = this.zoom;
      const [x, y] = this.center || [];
      if (this.zoomFirst) {
        k == null ? null : graph.zoom(k, this.zoomDuration);
        this.center == null ? null : graph.centerAt(x, y, this.panDuration);
      } else {
        k == null ? null : graph.centerAt(x, y, this.panDuration);
        this.center == null ? null : graph.zoom(k, this.zoomDuration);
      }
      this._resetting = true;
      this.save({ zoom: null, center: null });
      setTimeout(this._doneResetting, this.panDuration + this.zoomDuration);
    }
  }

  private _doneResetting = () => {
    this._resetting = false;
  };
}
