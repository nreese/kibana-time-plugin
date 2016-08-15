angular.module('BootstrapAddons', ['BootstrapAddonsTemplateCache']);
angular.module('BootstrapAddons')
.directive('timeslider', ["$document", "$timeout", function($document, $timeout) {
  const SVG_ID = "timesliderSvg";
  const CONTROLS_WIDTH = 72; //fixed width of buttons used to advance timeslider
  return {
    restrict: 'E',
    scope: {
      end: "=",
      onClear: "&",
      onChange: "&",
      start: "=",
      ticks: "@",
      width: "@",
    },
    templateUrl: 'timeslider/timeslider.html',
    replace: true,
    link: function(scope, elem, attr) {
      var brush;
      var autoScale = false;
      if(!scope.width) {
        autoScale = true;
      }
      scope.actionIcon = "glyphicon-play";
      var intervalId = null;
      drawTimeline();

      scope.$watch('end', function(newVal, oldVal) {
        if(newVal.getTime() !== oldVal.getTime()) {
          scope.end = newVal;
          redraw();
        }
      }, true);

      scope.$on('timesliderForceRender', function() {
        redraw();
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

      function brushend() {
        //Brush events fired by interactions directly on svg are outside of angularjs
        //Wrap callbacks in $timeout so callbacks are always fireed within Angular's $apply context
        if(brush.extent()[0].getTime() === brush.extent()[1].getTime()) {
          $timeout(function() {
            scope.onClear()();
          });
        } else {
          $timeout(function() {
            scope.onChange()(brush.extent()[0], brush.extent()[1]);
          });
        }
      }

      function select(start, end) {
        //update extent
        brush.extent([start, end]);
        //draw brush to match new extent
        brush(d3.select('.brush'));
        //fire brush events
        brush.event(d3.select('.brush'));
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
        var oldBrush = brush.extent();
        drawTimeline();
        if(oldBrush[0].getTime() !== oldBrush[1].getTime()) {
          brush.extent([oldBrush[0], oldBrush[1]]);
          brush(d3.select('.brush'));
        }
      }

      function drawTimeline() {
        if(autoScale) {
          scope.width = elem[0].clientWidth - CONTROLS_WIDTH;
        }
        if(scope.width <= 0) scope.width = CONTROLS_WIDTH * 2;

        var container = d3.select("#timesliderContainer");
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
          .attr("class", 'timeslider');

        var timeScale = d3.time.scale.utc()
          .domain([scope.start.getTime(), scope.end.getTime()])
          .range([0, parseInt(scope.width, 10)]);

        //draw time scale ticks
        timeScale.ticks(parseInt(scope.ticks, 10)).forEach(function(tick, index) {
          svg.append('line')
            .attr('class', 'scaleLine')
            .attr('x1', timeScale(tick))
            .attr('x2', timeScale(tick))
            .attr('y1', 0)
            .attr('y2', 22);

          if(index % 2 != 0) {
            var hours = tick.getUTCHours();
            if (hours < 10) hours = "0" + hours;
            svg.append('text')
              .attr('class', 'scaleLabel')
              .attr('x', timeScale(tick))
              .attr('dx', '-1.25em')
              .attr('y', 11)
              .attr('text-anchor', 'left')
              .attr('dominant-baseline', 'middle')
              .text(hours);

            var mins = tick.getUTCMinutes();
            if (mins < 10) mins = "0" + mins;
            svg.append('text')
              .attr('class', 'scaleLabel')
              .attr('x', timeScale(tick))
              .attr('dx', '0.25em')
              .attr('y', 11)
              .attr('text-anchor', 'right')
              .attr('dominant-baseline', 'middle')
              .text(mins);
          }
        });

        brush = d3.svg.brush()
          .x(timeScale)
          .on('brushend', brushend);
        svg.append('g')
          .attr('class', 'brush')
          .call(brush)
          .selectAll('rect')
            .attr('height', 22);
      }
    }
  }
}]);
angular.module("BootstrapAddonsTemplateCache", []).run(["$templateCache", function($templateCache) {$templateCache.put("timeslider/timeslider.html","<div><div class=\"btn-group\"><button class=\"btn btn-xs btn-primary\" ng-click=\"togglePlay()\"><span class=\"glyphicon {{actionIcon}}\"></span></button> <button class=\"btn btn-xs btn-primary\" ng-click=\"stepBack()\"><span class=\"glyphicon glyphicon-step-backward\"></span></button> <button class=\"btn btn-xs btn-primary\" ng-click=\"stepForward()\"><span class=\"glyphicon glyphicon-step-forward\"></span></button> <span id=\"timesliderContainer\"></span></div></div>");}]);