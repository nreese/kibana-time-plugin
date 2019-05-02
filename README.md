# kibana-time-plugin
Widget to view and edit the time range from within dashboards. This plugin started as a work around for issue [Timepicker as part of embedded dashboard](https://github.com/elastic/kibana/issues/2739).

## Time Animation
Use the time animation controls to easily explore data by time blocks. Click and drag on the time animation bar to select a time range. Grab the brush to move or resize. Click outside of the brush to remove. Use the step buttons to advance to the next time block.

![alt text](https://github.com/nreese/kibana-time-plugin/blob/gh-pages/images/time_animation.gif)

## Quick, Relative, and Absolue
Use this widget to view and edit the time range from within dashboards. Use the carousel controls to switch between 'quick', 'relative', 'absolute', and 'time animation' inputs.

![alt text](https://github.com/nreese/kibana-time-plugin/blob/gh-pages/images/time.gif)

# Install
## Kibana 6.7 and 7.0
```bash
cd KIBANA_HOME/plugins
git clone git@github.com:nreese/kibana-time-plugin.git (or git clone https://github.com/nreese/kibana-time-plugin.git)
cd KIBANA_HOME/plugins/kibana-time-plugin

git checkout master

bower install
vi kibana-time-plugin/package.json //set version to match kibana version
```

## Kibana 6.6
```bash
cd KIBANA_HOME/plugins
git clone git@github.com:nreese/kibana-time-plugin.git (or git clone https://github.com/nreese/kibana-time-plugin.git)
cd KIBANA_HOME/plugins/kibana-time-plugin

git checkout 6.6

bower install
vi kibana-time-plugin/package.json //set version to match kibana version
```

# Install
## Kibana 6.4 and 6.5
```bash
cd KIBANA_HOME/plugins
git clone git@github.com:nreese/kibana-time-plugin.git (or git clone https://github.com/nreese/kibana-time-plugin.git)
cd KIBANA_HOME/plugins/kibana-time-plugin

git checkout 6.5

bower install
vi kibana-time-plugin/package.json //set version to match kibana version
```

## Kibana 6.3
```bash
cd KIBANA_HOME/plugins
git clone git@github.com:nreese/kibana-time-plugin.git (or git clone https://github.com/nreese/kibana-time-plugin.git)
cd KIBANA_HOME/plugins/kibana-time-plugin

git checkout 6.3

bower install
vi kibana-time-plugin/package.json //set version to match kibana version
```

## Kibana 6.2
```bash
cd KIBANA_HOME/plugins
git clone git@github.com:nreese/kibana-time-plugin.git (or git clone https://github.com/nreese/kibana-time-plugin.git)
cd KIBANA_HOME/plugins/kibana-time-plugin

git checkout 6.2

bower install
vi kibana-time-plugin/package.json //set version to match kibana version
```

## Kibana 6.0 - 6.1
```bash
cd KIBANA_HOME/plugins
git clone git@github.com:nreese/kibana-time-plugin.git (or git clone https://github.com/nreese/kibana-time-plugin.git)
cd KIBANA_HOME/plugins/kibana-time-plugin

git checkout 6.0

bower install
vi kibana-time-plugin/package.json //set version to match kibana version
```

## Kibana 5.5 - 5.6
```bash
cd KIBANA_HOME/plugins
git clone git@github.com:nreese/kibana-time-plugin.git (or git clone https://github.com/nreese/kibana-time-plugin.git)
cd KIBANA_HOME/plugins/kibana-time-plugin

git checkout 5.5

bower install
vi kibana-time-plugin/package.json //set version to match kibana version
```

## Kibana 5.0 - 5.4
```bash
cd KIBANA_HOME/plugins
git clone git@github.com:nreese/kibana-time-plugin.git (or git clone https://github.com/nreese/kibana-time-plugin.git)
cd KIBANA_HOME/plugins/kibana-time-plugin

git checkout 5.4

bower install
vi kibana-time-plugin/package.json //set version to match kibana version
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
