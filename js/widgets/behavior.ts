/*
 * Copyright (c) 2022 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import ndarray from 'ndarray';

import { ISignal, Signal } from '@lumino/signaling';

import { WidgetModel, unpack_models as deserialize } from '@jupyter-widgets/base';

import { IBehave, IHasGraph, WIDGET_DEFAULTS } from '../tokens';

const SELECTED_COLOR = '#B3A369';
const NOT_SELECTED_COLOR = '#003057';

export class BehaviorModel extends WidgetModel implements IBehave {
  protected _updateRequested: Signal<IBehave, void>;

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this._updateRequested = new Signal(this);
  }

  get updateRequested(): ISignal<IBehave, void> {
    return this._updateRequested;
  }

  onUpdate(hasGraph: IHasGraph) {
    throw new Error('unimplemented');
  }
}

/**
 * A model which wraps an `ndarray.NdArray` of indices in `force-graph.GraphData.nodes`.
 */
export class NodeSelectionModel extends BehaviorModel {
  static model_name = 'NodeSelectionModel';
  static serializers = {
    ...WidgetModel.serializers,
    value: { deserialize },
  };

  protected _graph: IHasGraph | null = null;

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: NodeSelectionModel.model_name,
      value: null,
      multiple: true,
    };
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    this.on('change:value', this.onValueChange, this);
    this.onValueChange();
  }

  onValueChange(change?: any) {
    let value = this.get('value');
    if (value) {
      value.on('change:array', this.onKernelData, this);
      this.onKernelData();
    }
  }

  onKernelData() {
    this._updateRequested.emit(void 0);
  }

  get selected(): Set<number> {
    let value = this.get('value');
    return new Set<number>([...(value.get('array')?.data || [])]);
  }

  set selected(selected: Set<number>) {
    let value = this.get('value');
    const newArray = ndarray(new Int32Array([...selected]), [selected.size]);
    value.set({ array: newArray });
    value.save_changes();
  }

  registerGraph(hasGraph: IHasGraph): void {
    this._graph = hasGraph;
    hasGraph.graph.onNodeClick((node, event) => {
      let { selected } = this;
      const id = node.id as number;
      if (this.get('multiple') && (event.ctrlKey || event.shiftKey || event.altKey)) {
        selected.has(id) ? selected.delete(id) : selected.add(id);
      } else {
        selected.clear();
        selected.add(id);
      }

      this.selected = selected;
    });
  }

  onUpdate(hasGraph: IHasGraph) {
    if (hasGraph !== this._graph) {
      this.registerGraph(hasGraph);
    }

    const { selected } = this;

    hasGraph.graph.nodeColor((node) => {
      return selected.has(node.id as number) ? SELECTED_COLOR : NOT_SELECTED_COLOR;
    });
  }
}
