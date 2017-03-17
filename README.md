# kibana-time-plugin
Widget to view and edit the time range from within dashboards. This plugin started as a work around for issue [Timepicker as part of embedded dashboard](https://github.com/elastic/kibana/issues/2739).

## Time Animation
Use the time animation controls to easily explore data by time blocks. Click and drag on the time animation bar to select a time range. Grab the brush to move or resize. Click outside of the brush to remove. Use the step buttons to advance to the next time block.

![alt text](https://github.com/nreese/kibana-time-plugin/blob/gh-pages/images/time_animation.gif)

## Quick, Relative, and Absolue
Use this widget to view and edit the time range from within dashboards. Use the carousel controls to switch between 'quick', 'relative', 'absolute', and 'time animation' inputs.

![alt text](https://github.com/nreese/kibana-time-plugin/blob/gh-pages/images/time.gif)

# Install
## Kibana 5.x
```bash
cd KIBANA_HOME/plugins
git clone git@github.com:nreese/kibana-time-plugin.git
cd KIBANA_HOME/plugins/kibana-time-plugin
bower install
vi kibana-time-plugin/package.js //set version to match kibana version
```

## Kibana 4.x
```bash
./bin/kibana plugin -i kibana-time-plugin -u https://github.com/nreese/kibana-time-plugin/archive/4.x.zip
```

# Uninstall
## Kibana 5.x
```bash
./bin/kibana-plugin remove kibana-time-plugin
```
