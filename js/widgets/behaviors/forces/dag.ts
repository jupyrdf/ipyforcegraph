/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ForceGraphInstance, NodeObject } from 'force-graph/dist/force-graph';

import { makeForceNodeTemplate } from '../../../template-utils';
import { IBehave, IForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

export class DAGBehaviorModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'DAGBehaviorModel';
  _nodeFilter: CallableFunction | null;
  _force = null;

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

  forceFactory(): void {}

  get triggerChanges(): string {
    return 'change:mode change:level_distance change:node_filter change:active';
  }

  async update() {
    let value = this.get('node_filter');
    if (value) {
      this._nodeFilter = await makeForceNodeTemplate(value, toBool);
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

    if (!this.active) {
      mode = null;
    }

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

// Only explicit false values are false
function toBool(value: string): boolean {
  value = value?.trim().toLocaleLowerCase();
  if (value == 'false') {
    return false;
  }
  return true;
}
