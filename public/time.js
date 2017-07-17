import 'ui/angular-bootstrap';
import 'plugins/kibana-time-plugin/lib/angular-bootstrap/css/carousel.less';
import 'plugins/kibana-time-plugin/lib/angular-bootstrap/js/carousel.js';
import 'plugins/kibana-time-plugin/bower_components/bootstrap-addons/dist/css/bootstrap-addons.css';
import 'plugins/kibana-time-plugin/bower_components/bootstrap-addons/dist/js/bootstrap-addons.js';
import 'plugins/kibana-time-plugin/time.less';
import 'plugins/kibana-time-plugin/timeController';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import visTemplate from 'plugins/kibana-time-plugin/time.html';
import optionsTemplate from 'plugins/kibana-time-plugin/timeOptions.html';

require('ui/registry/vis_types').register(TimeVisProvider);

  function TimeVisProvider(Private) {
    const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);

    return new TemplateVisType({
      name: 'time',
      title: 'Time widget',
      icon: 'fa-clock-o',
      description: 'Embedded dashboards do not display the time range or allow users to modify the time range. Use this widget to view and edit the time range with embedded dashboards.',
      template: visTemplate,
      params: {
          editor: optionsTemplate,
          defaults: {
              enable_quick: true,
              enable_relative: true,
              enable_absolut: true,
              enable_animation: true,
          }
      },
      requiresSearch: false
    });
  }

export default TimeVisProvider;
