define(function (require) {
  require('ui/registry/vis_types').register(TimeVisProvider);
  require('plugins/kibana-time-plugin/lib/bootstrap-addons/dist/css/bootstrap-addons.css');
  require('plugins/kibana-time-plugin/lib/bootstrap-addons/dist/js/bootstrap-addons.js');
  require('plugins/kibana-time-plugin/time.less');
  require('plugins/kibana-time-plugin/timeController');

  function TimeVisProvider(Private) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));

    return new TemplateVisType({
      name: 'time',
      title: 'Time widget',
      icon: 'fa-clock-o',
      description: 'Embedded dashboards do not display the time range or allow users to modify the time range. Use this widget to view and edit the time range with embedded dashboards.',
      template: require('plugins/kibana-time-plugin/time.html'),
      params: {
        editor: require('plugins/kibana-time-plugin/timeOptions.html')
      },
      requiresSearch: false
    });
  }

  return TimeVisProvider;
});
