import { Application, IPlugin } from '@lumino/application';
import { Widget } from '@lumino/widgets';

import { IJupyterWidgetRegistry } from '@jupyter-widgets/base';

import '../style/index.css';

import { FORCEGRAPH_DEBUG, NAME, VERSION } from './tokens';

const EXTENSION_ID = `${NAME}:plugin`;

const plugin: IPlugin<Application<Widget>, void> = {
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
  autoStart: true,
  activate: (app: Application<Widget>, registry: IJupyterWidgetRegistry) => {
    FORCEGRAPH_DEBUG && console.warn('forcegraph activated');
    registry.registerWidget({
      name: NAME,
      version: VERSION,
      exports: async () => {
        const widgetExports = {
          ...(await import(
            /* webpackChunkName: "forcegraph_display" */ './display_widget'
          )),
        };
        FORCEGRAPH_DEBUG && console.warn('widgets loaded');
        return widgetExports;
      },
    });
  },
};
export default plugin;
