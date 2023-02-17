/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ObjectHash } from 'backbone';
import { ForceGraphInstance, NodeObject } from 'force-graph/dist/force-graph';

import { IBackboneModelOptions } from '@jupyter-widgets/base';

import { makeForceNodeTemplate } from '../../template-utils';
import { IBehave } from '../../tokens';

import { BehaviorModel } from './base';

export class DAGBehaviorModel extends BehaviorModel implements IBehave {
  static model_name = 'DAGBehaviorModel';
  _nodeFilter: CallableFunction | null;

  defaults() {
    return {
      ...super.defaults(),
      _model_name: DAGBehaviorModel.model_name,
      mode: null,
      level_distance: null,
      node_filter: null,
      active: null,
    };
  }

  initialize(attributes: ObjectHash, options: IBackboneModelOptions): void {
    super.initialize(attributes, options);
    this.on(this.triggerChanges, this.onChanged, this);
    this._nodeFilter = null;
  }

  get triggerChanges(): string {
    return 'change:mode change:level_distance change:node_filter change:active';
  }

  async onChanged(model) {
    if (this.active) {
      await this.update();
      this._updateRequested.emit(void 0);
    } else if ('active' in model.changed) {
      this._updateRequested.emit(void 0);
    }
  }

  async update() {
    let value = this.get('node_filter');
    if (value) {
      this._nodeFilter = await makeForceNodeTemplate(value);
    } else {
      this._nodeFilter = null;
    }
  }

  get mode() {
    return this.get('mode');
  }

  get levelDistance() {
    return this.get('level_distance');
  }

  get active() {
    return this.get('active');
  }

  refreshBehavior(graph: ForceGraphInstance) {
    let { mode, levelDistance, nodeFilter } = this;
    graph.dagMode(mode).dagLevelDistance(levelDistance).dagNodeFilter(nodeFilter);
  }

  nodeFilter = (node: NodeObject): boolean => {
    let template = this._nodeFilter;
    if (template == null) {
      return true;
    }
    return template(node);
  };
}
