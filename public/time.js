import 'ui/angular-bootstrap';
import 'plugins/kibana-time-plugin/lib/angular-bootstrap/css/btn-group.less';
import 'plugins/kibana-time-plugin/lib/angular-bootstrap/css/carousel.less';
import 'plugins/kibana-time-plugin/lib/angular-bootstrap/js/carousel.js';
import 'plugins/kibana-time-plugin/bower_components/bootstrap-addons/dist/css/bootstrap-addons.css';
import 'plugins/kibana-time-plugin/bower_components/bootstrap-addons/dist/js/bootstrap-addons.js';
import 'plugins/kibana-time-plugin/time.less';
import 'plugins/kibana-time-plugin/timeController';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import visTemplate from 'plugins/kibana-time-plugin/time.html';
import optionsTemplate from 'plugins/kibana-time-plugin/timeOptions.html';

VisTypesRegistryProvider.register(TimeVisProvider);

function TimeVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);

  return VisFactory.createAngularVisualization({
    name: 'time',
    title: 'Time widget',
    icon: 'fa-clock-o',
    description: 'Add time inputs to your dashboards.',
    category: CATEGORY.OTHER,
    visConfig: {
      template: visTemplate,
      defaults: {
          enable_quick: true,
          enable_relative: true,
          enable_absolut: true,
          enable_animation: true,
      }
    },
    editorConfig: {
      optionsTemplate: optionsTemplate
    },
    requestHandler: 'none',
    responseHandler: 'none'
  });
}
