# kibana-time-plugin
Widget to view and edit the time range from within dashboards. This plugin started as a work around for issue [Timepicker as part of embedded dashboard](https://github.com/elastic/kibana/issues/2739).

Use this widget to view and edit the time range from within dashboards. Use the carousel controls to switch between 'quick', 'relative', 'absolute', and 'time animation' inputs.
![preview-create](/resources/quick.png)

![preview-edit](/resources/relative.png)

![preview-edit](/resources/absolute.png)

Use the time animation controls to easily explore data by time blocks. Click and drag on the time animation bar to select a time range. Grab the brush to move or resize. Click outside of the brush to remove. Use the step buttons to advance to the next time block.
![preview-edit](/resources/time_animation.png)

# Install
## Kibana 5.0.0
```bash
./bin/kibana-plugin install https://github.com/nreese/kibana-time-plugin/releases/download/v5.0.0/kibana.zip
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