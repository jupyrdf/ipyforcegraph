/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ForceGraphInstance } from 'force-graph/dist/force-graph';

import { unpack_models as deserialize } from '@jupyter-widgets/base';

import { IBehave, IForce } from '../../../tokens';
import { yes } from '../../../utils';

import { FacetedForceModel } from './force';

export class DAGBehaviorModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'DAGBehaviorModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    mode: { deserialize },
    level_distance: { deserialize },
    // node template
    node_filter: { deserialize },
  };

  protected get _modelClass(): typeof DAGBehaviorModel {
    return DAGBehaviorModel;
  }

  forceFactory(): void {
    // raises an error otherwise
  }

  refreshBehavior(graph: ForceGraphInstance) {
    const { mode, level_distance, node_filter } = this._facets;

    const activeMode = this.active && mode ? mode() : null;
    graph.dagMode(activeMode || null);
    graph.dagLevelDistance(level_distance ? level_distance() : null);

    const nodeFilter = node_filter ? (this.wrapForNode(node_filter) as any) : yes;

    function todo_remove_me(...args: any) {
      return nodeFilter(...args);
    }

    graph.dagNodeFilter(todo_remove_me as any);
  }
}
