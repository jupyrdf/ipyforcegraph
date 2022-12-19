// import { Signal } from '@lumino/signaling';
import ForceGraph from 'force-graph';
import { ForceGraphInstance } from 'force-graph';

import {
  DOMWidgetModel,
  DOMWidgetView,
  WidgetModel,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';


export class Source extends WidgetModel {
  static model_name = "SourceModel";

}

import { NAME, VERSION } from './tokens';

console.log('loading');
export class ForceGraphModel extends DOMWidgetModel {
  static model_name = 'ForceGraphModel';
  static serializers = {
    ...DOMWidgetModel.serializers,
  };

  defaults() {
    let defaults = {
      ...super.defaults(),

      _model_name: ForceGraphModel.model_name,
      _model_module_version: VERSION,
      _view_module: NAME,
      _view_name: ForceGraphView.view_name,
      _view_module_version: VERSION,
      symbols: {},
      source: null,
      control_overlay: null,
    };
    return defaults;
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
  }
}

export class ForceGraphView extends DOMWidgetView {
  static view_name = 'ForceGraphView';
  graph: ForceGraphInstance;

  initialize(parameters: any) {
    super.initialize(parameters);
  }

  async render() {
    const root = this.el as HTMLDivElement;
    const containerDiv = document.createElement('div');

    root.appendChild(containerDiv);

    // don't bother initializing sprotty until actually on the page
    // schedule it

    // this.wait_for_visible(true);

    const N = 300;
    const gData = {
      nodes: [...Array(N).keys()].map((i) => ({ id: i })),
      links: [...Array(N).keys()]
        .filter((id) => id)
        .map((id) => ({
          source: id,
          target: Math.round(Math.random() * (id - 1)),
        })),
    };

    this.graph = ForceGraph()(containerDiv)
      .linkDirectionalParticles(2)
      .graphData(gData);
  }

  // wait_for_visible = (initial = false) => {
  //   if (!this.luminoWidget.isVisible) {
  //     this.was_shown.resolve();
  //   } else {
  //     setTimeout(this.wait_for_visible, initial ? 0 : POLL);
  //   }
  // };
}
