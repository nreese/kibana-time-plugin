import _ from 'lodash';
import dateMath from '@elastic/datemath';
import moment from 'moment';
import 'ui/timepicker/time_units';
import { SimpleEmitter } from 'ui/utils/simple_emitter';
import { timeUnits } from 'ui/timepicker/time_units';
import { timefilter } from 'ui/timefilter';
import { uiModules } from 'ui/modules';
const module = uiModules.get('kibana/kibana-time-plugin', ['kibana', 'ktp-ui.bootstrap.carousel', 'BootstrapAddons']);

const msearchEmitter = new SimpleEmitter();
module.config(function($httpProvider) {
  $httpProvider.interceptors.push(function() {
    return {
      response: function(resp) {
        if (resp.config.url.includes('_msearch')) {
          msearchEmitter.emit('msearch:response');
        }
        return resp;
      }
    }
  });
});

  module.controller('KbnTimeVisController', function (config, $scope, $rootScope, Private, $filter, $timeout) {
    const TIMESLIDER_INSTR = "Click and drag to select a time range."
    const DATE_FORMAT = 'MMMM Do YYYY, HH:mm:ss z';
    $rootScope.plugin = {
      timePlugin: {}
    };

    let lastUpdated = 0;

    //$scope.$listenAndDigestAsync(timefilter, 'timeUpdate', setTime);

    $scope.$listen(timefilter, 'timeUpdate', () => {
      $scope.$evalAsync(() => setTime());
    });

    var changeVisOff = $rootScope.$on(
      'change:vis',
      _.debounce(updateTimeslider, 200, false));
    $scope.$on('$destroy', function() {
      changeVisOff();
    });

    var expectedFrom = moment();
    var expectedTo = moment();
    $scope.animationTitle = TIMESLIDER_INSTR;

    const quickRanges = config.get('timepicker:quickRanges');
    $scope.quickLists = quickRanges;

    $scope.units = timeUnits;
    $scope.relativeOptions = [
      {text: 'Seconds ago', value: 's'},
      {text: 'Minutes ago', value: 'm'},
      {text: 'Hours ago', value: 'h'},
      {text: 'Days ago', value: 'd'},
      {text: 'Weeks ago', value: 'w'},
      {text: 'Months ago', value: 'M'},
      {text: 'Years ago', value: 'y'},
    ];
    $scope.relative = {
      count: 1,
      unit: 'm',
      preview: undefined,
      round: false
    };
    $scope.sliderRoundOptions = [
      {text: 'Second', value: 's'},
      {text: 'Minute', value: 'm'},
      {text: 'Hour', value: 'h'},
      {text: 'Day', value: 'd'},
      {text: 'Week', value: 'w'},
      {text: 'Month', value: 'M'},
      {text: 'Year', value: 'y'},
    ];
    $scope.slider = {
      roundUnit: 's',
    };

    //custom playback that waits for kibana msearch response before advancing timeframe
    let nextStep = null;
    $scope.kibanaPlayback = {
      play: function(nextCallback) {
        nextCallback();
        const delay = _.get($scope.vis.params, 'animation_frame_delay', 1) * 1000;
        nextStep = _.debounce(nextCallback, delay);
      },
      pause: function() {
        if (nextStep) {
          nextStep.cancel();
          nextStep = null;
        }
      }
    }
    msearchEmitter.on('msearch:response', function() {
      if (nextStep) {
        nextStep();
      }
    });

    //When timeslider carousel slide is not displayed, it has a width of 0
    //attach click handler to carousel controls to redraw
    $timeout(function() {
      var elems = document.getElementsByClassName('carousel-control');
      for (var i=0; i<elems.length; i++) {
        elems[i].onclick = function() {
          updateTimeslider();
        }
      }
      var elems = document.querySelectorAll('.carousel-indicators li');
      for (var i=0; i<elems.length; i++) {
        elems[i].onclick = function() {
          updateTimeslider();
        }
      }
    }, 0);

    function setTime() {

      const now = Date.now();

      //setTime is called from subscribing to kibana's timefilter
      //Avoid updating our $scope if the timefilter change is triggered by us
      if(now - lastUpdated > 200) {
        console.log("updating KbnTimeVisController.$scope stay in sync with kibana timefilter");
        const newTime = timefilter.getTime();

        //clean up old selections
        $scope.activeSlide = {
          absolute: false,
          quick: false,
          relative: false
        };

        //set new selections based on new time
        $scope.time = {
          from: newTime.from,
          to: newTime.to,
          absolute_from: dateMath.parse(newTime.from),
          absolute_to: dateMath.parse(newTime.to, true)
        }
        setRelativeParts(newTime.to, newTime.from);
        if('quick' === newTime.mode) {
          $scope.activeSlide.quick = true;
          for(var i=0; i<quickRanges.length; i++) {
            if(quickRanges[i].from === newTime.from && quickRanges[i].to === newTime.to) {
              $scope.selectedQuick = quickRanges[i];
              break;
            }
          }
        } else if ('relative' === newTime.mode) {
          $scope.activeSlide.relative = true;
        } else {
          $scope.activeSlide.absolute = true;
        }
        updateTimeslider();
      }
    }
    setTime();

    $scope.filterByTime = function(start, end) {
      $scope.time.mode = 'absolute';
      expectedFrom = moment(start);
      expectedTo = moment(end);
      $scope.animationTitle = 'Frame: ' + expectedFrom.format(DATE_FORMAT) + ' to ' + expectedTo.format(DATE_FORMAT);
      updateKbnTime();
    }

    $scope.removeTimeFilter = function() {
      $scope.animationTitle = TIMESLIDER_INSTR;
      expectedFrom = $scope.time.from;
      expectedTo = $scope.time.to;
      updateKbnTime();
    }

    $scope.setAbsolute = function() {
      $scope.time.mode = 'absolute';
      $scope.time.from = $scope.time.absolute_from;
      $scope.time.to = $scope.time.absolute_to;
      expectedFrom = $scope.time.from;
      expectedTo = $scope.time.to;
      updateKbnTime();
    };

    $scope.setRelative = function () {
      $scope.time.from = getRelativeString();
      $scope.time.to = 'now';
      $scope.time.mode = 'relative';
      expectedFrom = $scope.time.from;
      expectedTo = $scope.time.to;
      updateKbnTime();
    };

    $scope.setQuick = function (selectedQuick) {
      $scope.time.from = selectedQuick.from;
      $scope.time.to = selectedQuick.to;
      $scope.time.mode = 'quick';
      expectedFrom = $scope.time.from;
      expectedTo = $scope.time.to, true;
      updateKbnTime();
    };

    $scope.snapToNearest = function() {
      $scope.$broadcast('timesliderSnapToNearest', {
        snapToNearest: $scope.slider.roundUnit
      });
    }

    function updateKbnTime() {
      lastUpdated = Date.now();
      timefilter.setTime({
        from: expectedFrom,
        to: expectedTo,
        mode: $scope.time.mode
      });

      //keep other carousel slides in sync with new values
      if($scope.time.mode !== 'absolute') {
        $scope.time.absolute_from = dateMath.parse($scope.time.from);
        $scope.time.absolute_to = dateMath.parse($scope.time.to, true);
      }
      if($scope.time.mode !== 'relative') {
        //wrapped in $timeout to avoid calling $apply while all ready in progress
        $timeout(setRelativeParts($scope.time.to, $scope.time.from), 0);
      }
      updateTimeslider();
    }

    function updateTimeslider() {
      $timeout(function() {
        $scope.$broadcast('timesliderForceRender');
      }, 0);
    }

    //Relative date logic copied from https://github.com/elastic/kibana/blob/4.4/src/ui/public/timepicker/timepicker.js

    //convert to and from into pieces needed for relative inputs
    function setRelativeParts(to, from) {
      var fromParts = from.toString().split('-');
      var relativeParts = [];

      // Try to parse the relative time, if we can't use moment duration to guestimate
      if (to.toString() === 'now' && fromParts[0] === 'now' && fromParts[1]) {
        relativeParts = fromParts[1].match(/([0-9]+)([smhdwMy]).*/);
      }
      if (relativeParts[1] && relativeParts[2]) {
        $scope.relative.count = parseInt(relativeParts[1], 10);
        $scope.relative.unit = relativeParts[2];
      } else {
        var duration = moment.duration(moment().diff(dateMath.parse(from)));
        var units = _.pluck(_.clone($scope.relativeOptions).reverse(), 'value');
        if (from.toString().split('/')[1]) $scope.relative.round = true;
        for (var i = 0; i < units.length; i++) {
          var as = duration.as(units[i]);
          if (as > 1) {
            $scope.relative.count = Math.round(as);
            $scope.relative.unit = units[i];
            break;
          }
        }
      }

      if (from.toString().split('/')[1]) $scope.relative.round = true;
      formatRelative();
    }
    function formatRelative() {
      var parsed = dateMath.parse(getRelativeString());
      $scope.relative.preview =  parsed ? parsed.format($scope.format) : undefined;
      return parsed;
    }
    $scope.formatRelative = formatRelative;

    function getRelativeString() {
      return 'now-' + $scope.relative.count + $scope.relative.unit + ($scope.relative.round ? '/' + $scope.relative.unit : '');
    }

    // avoid digest cycle overflow by cachine start Date
    let lastStart;
    $scope.getStartTime = function() {
      const start = $scope.time.absolute_from.toDate();
      if (lastStart && lastStart.getTime() === start.getTime()) {
        return lastStart;
      }

      lastStart = start;
      return start;
    }

    // avoid digest cycle overflow by cachine end Date
    let lastEnd;
    $scope.getEndTime = function() {
      const end = $scope.time.absolute_to.toDate();
      if (lastEnd && lastEnd.getTime() === end.getTime()) {
        return lastEnd;
      }

      lastEnd = end;
      return end;
    }

    $scope.renderComplete();
  });
