angular.module('BootstrapAddons', ['BootstrapAddonsTemplateCache']);
angular.module('BootstrapAddons')
.directive('timeslider', ["$document", "$timeout", function($document, $timeout) {
  const SVG_ID = "timesliderSvg";
  const MIN_LABEL_SPACING = 8 * 14; //min spacing between labels is roughly 8 chars
  const CONTROLS_WIDTH = 72; //fixed width of buttons used to advance timeslider
  const MS_PER_DAY = 86400000;
  return {
    restrict: 'E',
    scope: {
      end: "=",
      onClear: "&",
      onChange: "&",
      start: "=",
      width: "@",
    },
    templateUrl: 'timeslider/timeslider.html',
    replace: true,
    link: function(scope, elem, attr) {
      var brush;
      var snapInterval = getInterval('s');
      var autoScale = false;
      if(!scope.width) {
        autoScale = true;
      }
      scope.actionIcon = "glyphicon-play";
      var intervalId = null;
      drawTimeline();

      scope.$on('timesliderForceRender', function() {
        redraw();
      });
      scope.$on('timesliderSnapToNearest', function(event, data) {
        snapInterval = getInterval(data.snapToNearest);
        if(brush.extent()[0].getTime() !== brush.extent()[1].getTime()) {
          select(brush.extent()[0], brush.extent()[1]);
        }
      });

      scope.togglePlay = function() {
        if(intervalId) {
          pause();
        } else {
          play();
        }
      }
      scope.stepBack = function() {
        var nextStart = new Date(brush.extent()[0].getTime() - getBrushSize());
        var nextStop = brush.extent()[0];
        if (nextStop.getTime() <= scope.start.getTime()) {
          nextStart = new Date(scope.end.getTime() - getBrushSize());
          nextStop = scope.end;
        }
        select(nextStart, nextStop);
      }
      scope.stepForward = function() {
        var nextStart = brush.extent()[1];
        var nextStop = new Date(brush.extent()[1].getTime() + getBrushSize());
        if (nextStart.getTime() >= scope.end.getTime()) {
          nextStart = scope.start;
          nextStop = new Date(scope.start.getTime() + getBrushSize());
        }
        select(nextStart, nextStop);
      }

      /*
       * support brush snapping to whole time units
       * https://bl.ocks.org/mbostock/6232537
       * 
       * Brush events fired by interactions directly on svg are outside of angularjs
       * Wrap callbacks in $timeout so callbacks are always fireed within Angular's $apply context
       */
      function brushend() {
        if(brush.extent()[0].getTime() === brush.extent()[1].getTime()) {
          $timeout(function() {
            scope.onClear()();
          });
        } else if (!d3.event.sourceEvent) {
          //event triggered programmatically - act on event
          $timeout(function() {
            scope.onChange()(brush.extent()[0], brush.extent()[1]);
          });
        } else {
          //event triggered by user - snap extent and fire another event.
          d3.select(this).transition()
            .call(brush.extent(snappedExent(brush.extent())))
            .call(brush.event);
        }
      }

      function snappedExent(extent) {
        var start = extent[0];
        var stop = extent[1];
        var snappedStart = snapInterval.round(start);
        var snappedStop = snapInterval.round(stop);

        //ensure extent not rounded to zero
        if (snappedStart.getTime() === snappedStop.getTime()) {
          snappedStart = snapInterval.floor(start);
          snappedStop = snapInterval.ceil(stop);
        }

        //ensure extent not snapped past slider boundaries
        if(snappedStart.getTime() <= scope.start.getTime()) {
          snappedStart = scope.start;
        }
        if(snappedStop.getTime() >= scope.end.getTime()) {
          snappedStop = scope.end;
        }
        return [snappedStart, snappedStop];
      }

      function select(start, end) {
        //update extent
        brush.extent(snappedExent([start, end]));
        //draw brush to match new extent
        brush(d3.select('.ba-brush'));
        //fire brush events
        brush.event(d3.select('.ba-brush'));
      }

      function pause() {
        scope.actionIcon = "glyphicon-play";
        if(intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }

      function play() {
        scope.actionIcon = "glyphicon-pause";
        intervalId = setInterval(
          function() {
            scope.stepForward();
          },
          1000
        );
      }

      function getBrushSize() {
        var brushSize = brush.extent()[1].getTime() - brush.extent()[0].getTime();
        if (brushSize <= 0) {
          brushSize = (scope.end.getTime() - scope.start.getTime()) / 45;
        }
        return brushSize;
      }

      function redraw() {
        if(elem[0].clientWidth > 0) {
          var oldBrush = null;
          if(brush) oldBrush = brush.extent();
          drawTimeline();
          if(oldBrush && oldBrush[0].getTime() !== oldBrush[1].getTime()) {
            brush.extent([oldBrush[0], oldBrush[1]]);
            brush(d3.select('.ba-brush'));
          }
        }
      }

      function drawTimeline() {
        if(autoScale) {
          scope.width = elem[0].clientWidth - CONTROLS_WIDTH;
        }
        if(scope.width <= 0) {
          return;
        }
        var numTicks = scope.width / MIN_LABEL_SPACING;
        var timeWidth = scope.end.getTime() - scope.start.getTime();

        var container = d3.select("#ba-timeslider-container");
        container.selectAll('#' + SVG_ID).remove();
        var svg = container.append('svg')
          .attr("id", SVG_ID)
          .attr("width", scope.width)
          .attr("height", 22);
        svg.append('g').append('rect')
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", scope.width)
          .attr("height", 22)
          .attr("class", 'ba-timeslider');

        var timeScale = d3.time.scale.utc()
          .domain([scope.start.getTime(), scope.end.getTime()])
          .range([0, parseInt(scope.width, 10)]);
        var endPixelLocation = timeScale(scope.end.getTime());

        //draw time scale ticks
        var lastTick = null;
        timeScale.ticks(numTicks).forEach(function(tick, index) {
          var tickPixelLocation = timeScale(tick);
          svg.append('line')
            .attr('class', 'ba-scaleline')
            .attr('x1', tickPixelLocation)
            .attr('x2', tickPixelLocation)
            .attr('y1', 0)
            .attr('y2', 22);

          //Only add label to line if not close to start or end
          if(tickPixelLocation > 25 && (endPixelLocation - tickPixelLocation) > 25) {
            var format = getTimeFormator(timeWidth, tick, lastTick);
            var label = format(tick).split(" ");
            if(label.length === 1) label.push("");
            lastTick = tick;
            svg.append('text')
              .attr('class', 'ba-scalelabel')
              .attr('x', tickPixelLocation)
              .attr('dx', function() {
                var dx = '-1.25em';
                if(label[0].length > 2) var dx = '-2.25em';
                return dx;
              })
              .attr('y', 11)
              .attr('text-anchor', 'left')
              .attr('dominant-baseline', 'middle')
              .text(label[0]);
            svg.append('text')
              .attr('class', 'ba-scalelabel')
              .attr('x', tickPixelLocation)
              .attr('dx', '0.25em')
              .attr('y', 11)
              .attr('text-anchor', 'right')
              .attr('dominant-baseline', 'middle')
              .text(label[1]);
          }
        });

        brush = d3.svg.brush()
          .x(timeScale)
          .on('brushend', brushend);
        svg.append('g')
          .attr('class', 'ba-brush')
          .call(brush)
          .selectAll('rect')
            .attr('height', 22);
      }

      //https://github.com/d3/d3-3.x-api-reference/blob/master/Time-Formatting.md
      function getTimeFormator(timeWidth, tick, lastTick) {
        var format = null;
        if (timeWidth <= MS_PER_DAY) {
          if(!lastTick) {
            format = d3.time.format.utc('%a %d');
          } else {
            format = d3.time.format.utc('%H %M');
          }
        } else if (timeWidth <= (MS_PER_DAY * 28)) {
          if(lastTick && tick.getUTCDate() === lastTick.getUTCDate()) {
            format = d3.time.format.utc('%H %M');
          } else {
            format = d3.time.format.utc('%a %d');
          }
        } else if (timeWidth <= (MS_PER_DAY * 365)) {
          format = d3.time.format.utc('%b %d');
        } else {
          if(!lastTick || tick.getUTCFullYear() !== lastTick.getUTCFullYear()) {
            format = d3.time.format.utc('%b %Y');
          } else {
            format = d3.time.format.utc('%b %d');
          }
        }
        return format;
      }

      function getInterval(snapTo) {
        var interval;
        switch (snapTo) {
          case "s":
            interval = d3.time.second.utc;
            break;
          case "m":
            interval = d3.time.minute.utc;
            break;
          case "h":
            interval = d3.time.hour.utc;
            break;
          case "d":
            interval = d3.time.day.utc;
            break;
          case "w":
            interval = d3.time.week.utc;
            break;
          case "M":
            interval = d3.time.month.utc;
            break;
          case "y":
            interval = d3.time.year.utc;
            break;
          default:
            console.log("Unexpected snap interval: " + snapTo + ", defaulting to seconds.");
            interval = d3.time.second.utc;
        }
        return interval;
      }
    }
  }
}]);
angular.module("BootstrapAddonsTemplateCache", []).run(["$templateCache", function($templateCache) {$templateCache.put("timeslider/timeslider.html","<div><div class=\"btn-group\"><button class=\"btn btn-xs btn-primary\" ng-click=\"togglePlay()\"><span class=\"glyphicon {{actionIcon}}\"></span></button> <button class=\"btn btn-xs btn-primary\" ng-click=\"stepBack()\"><span class=\"glyphicon glyphicon-step-backward\"></span></button> <button class=\"btn btn-xs btn-primary\" ng-click=\"stepForward()\"><span class=\"glyphicon glyphicon-step-forward\"></span></button> <span id=\"ba-timeslider-container\"></span></div></div>");}]);