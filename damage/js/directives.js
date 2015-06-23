(function() {

var app = angular.module('optc');

var directives = { };

/*****************
 * UI directives *
 *****************/

directives.autoFocus = function($timeout) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			$timeout(function(){ element[0].focus(); });
		}
	};
};

directives.decorateSlot = function() {
    return {
        restrict: 'A',
        scope: { uid: '=' },
        link: function(scope, element, attrs) {
            var update = function(uid) { 
                if (!uid) return;
                var target = element[0];
                target.style.backgroundImage = 'url(' + Utils.getThumbnailUrl(uid) + ')';
                target.setAttribute('title', Utils.getThumbnailTitle(uid));
            };
            scope.$watch('uid',update);
            update(scope.uid);
        }
    };
};

directives.expandableDamage = function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.detailsVisible = false;
            element.click(function(e) {
                if (e.which != 1 || e.ctrlKey) return;
                element.toggleClass('details');
                if (!scope.detailsVisible) {
                    element[0].style.zIndex = 5;
                    setTimeout(function() { scope.detailsVisible = true; scope.$apply();
                    },500);
                } else {
                    scope.detailsVisible = false;
                    scope.$apply();
                    setTimeout(function() { element[0].style.zIndex = 4; },500);
                }
            });
        },
    };
};

directives.detailPane = function() {
    return {
        restrict: 'A',
        templateUrl: 'views/details.html',
        scope: true,
        link: function(scope, element, attrs) {
            var modifiers = [ 'Miss', 'Good', 'Great', 'Perfect' ];
            scope.modifyDamage = function(e,n) {
                if (e.which != 2 && (e.which != 1 || !e.ctrlKey)) return;
                var custom = $.extend([ ],scope.numbers[scope.type].hitModifiers);
                custom[n] = modifiers[(modifiers.indexOf(custom[n])+1)%4];
                scope.data.customHitModifiers = custom;
                e.preventDefault();
                e.stopPropagation();
                return false;
            };
        }
    };
};

/************************
 * Component directives *
 ************************/

directives.mainController = function() {
    return {
        restrict: 'A',
        controller: 'MainCtrl'
    };
};

directives.sidebar = function() {
    return {
        restrict: 'E',
        templateUrl: 'views/sidebar.html',
        replace: true
    };
};

directives.cruncher = function() {
    return {
        restrict: 'E',
        controller: 'CruncherCtrl',
        templateUrl: 'views/results.html',
        replace: true
    };
};

directives.units = function() {
    return {
        restrict: 'E',
        templateUrl: 'views/units.html',
        replace: true,
    };
};

directives.slot = function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/fragments/slot.html',
        scope: true,
        link: function(scope, element, attrs) {
            scope.slot = element.index();
        }
    };
};

directives.hpBar = function() {
    return {
        rstrict: 'A',
        replace: true,
        template: '<div id="hp"><div id="hpSlider"></div>' + 
            '<div id="hpLabel">{{ data.hp.current | number }} HP ({{ data.hp.perc || number }}%)</div></div>',
        link: function(scope, element, attrs) {
            var slider = element.find('#hpSlider').noUiSlider({
                start: [ scope.data.hp.current ],
                range: { min: [ 1 ], max: [ scope.data.hp.max || 1 ] },
                connect: 'lower'
            });
            var update = function(event,value) {
                scope.data.hp.current = Math.floor(value);
                scope.data.hp.perc = Math.round(scope.data.hp.current / scope.data.hp.max * 10000) / 100;
                scope.$apply();
            };
            slider.on({ change: update, slide: update });
            scope.$watch('data.hp.max',function() {
                slider.noUiSlider({ range: { min: [ 1 ], max: [ scope.data.hp.max || 1 ] } },true);
            });
        }
    };
};

directives.levelLabel = function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: '<div class="unitLevel">Lv. {{ data.team[slot].level }}<input ng-show="editorVisible" ng-model="level"></input></div>',
        link: function(scope, element, attrs) {
            scope.level = scope.data.team[scope.slot].level;
            var input = element.find('input');
            element.click(function(e) {
                scope.level = '';
                if (e.which == 1 && !e.ctrlKey) {
                    if (scope.options.slidersEnabled) $('.unit').eq(scope.slot).addClass('slide');
                    else scope.editorVisible = true;
                } else if (e.which == 2 || (e.which == 1 && e.ctrlKey))
                    scope.data.team[scope.slot].level = scope.data.team[scope.slot].unit.maxLevel;
                scope.$apply();
                if (scope.editorVisible) input.focus();
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            var update = function(e) {
                if (e.type == 'keyup' && e.which != 13) return;
                var level = parseInt(scope.level,10); 
                scope.editorVisible = false;
                scope.$apply();
                if (isNaN(level)) return;
                scope.data.team[scope.slot].level = Math.min(Math.max(1,level),scope.data.team[scope.slot].unit.maxLevel);
            };
            input.focusout(update);
            input.keyup(update);
        }
    };
};

directives.levelSlider = function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<input disabled class="unitSlider"></input>',
        link: function(scope, element, attrs) {
            var currentValue = 0;
            var unit = scope.data.team[scope.slot];
            var onRelease = function(value) {
                if (!value || value <= 0 || currentValue == value) return;
                currentValue = value;
                scope.data.team[scope.slot].level = value;
                scope.$apply();
            };
            var update = function(value) {
                if (!value || value <= 0 || currentValue == value) return;
                currentValue = Math.min(value,scope.data.team[scope.slot].unit ? scope.data.team[scope.slot].unit.maxLevel : 1);
                element.val(currentValue).trigger('change');
            };
            var updateMax = function(value) {
                if (!value) value = 1;
                element.trigger('configure',{ max: value });
                if (value < currentValue) update(1);
            };
            var slider = element.knob({
                width: 88,
                height: 88,
                angleOffset: -120,
                angleArc: 240,
                release: onRelease,
                min: 1,
                max: 99
            });
            scope.$watch('data.team[slot].level',update);
            scope.$watch('data.team[slot].unit.maxLevel',updateMax);
            element.parent().click(function(e) {
                $('.unit').eq(scope.slot).removeClass('slide'); 
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        }
    };
};

directives.unitOrb = function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: '<div class="unitOrb {{glow()}}"><i class="fa" ng-class="{ \'fa-caret-up\': ' +
            'data.team[slot].orb == 2, \'fa-caret-down\': data.team[slot].orb == 0.5 }"></i></div>',
        link: function(scope, element, attrs) {
            scope.glow = function() {
                var unit = scope.data.team[scope.slot];
                if (unit.orb == 1) return 'none';
                if (unit.orb == 2) return unit.unit.type;
                return Utils.getOppositeType(unit.unit.type) + ' opposite';
            };
            var onClick = function(e) {
                var unit = scope.data.team[scope.slot];
                if (!$(e.target).hasClass('unitPortrait')) return;
                if (unit.unit === null || e.target.className == 'unitLevel') return;
                if (e.which == 2 || (e.which == 1 && (e.ctrlKey || Utils.isClickOnOrb(e,e.target)))) {
                    unit.orb = (unit.orb == 1 ? 2 : unit.orb == 2 ? 0.5 : 1);
                    scope.glow();
                    scope.$apply();
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            };
            element.parent().parent().click(onClick);
        },
        controller: function($scope, $timeout) {
            $timeout(function() { 
                if ($scope.data.team[$scope.slot].orb != 1)
                    $scope.$apply();
            });
        }
    };
};

directives.special = function() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: '<li class="special" ng-show="hasSpecial"><div>{{data.team[slot].unit.name | truncate:25}}</div></li>',
        link: function(scope, element, attrs) {
            scope.slot = element.prevAll('.special').length;
            var type = null;
            var isSelected = scope.data.team[scope.slot].special;
            scope.hasSpecial = false;
            scope.$watch('data.team[slot].unit',function(unit) {
                if (type !== null) element.removeClass(type);
                scope.hasSpecial = unit && specials.hasOwnProperty(unit.number);
                type = (unit !== null ? scope.data.team[scope.slot].unit.type : null);
            });
            scope.$watch('data.specialsEnabled[slot]',function(enabled) {
                if (isSelected && type) element.addClass(type);
                else if (type) element.removeClass(type);
            });
            element.click(function(e) {
                isSelected = !isSelected;
                scope.data.specialsEnabled[scope.slot] = isSelected;
                scope.$apply();
            });
        }
    };
};

/****************************
 * Directive initialization *
 ****************************/

for (var key in directives)
    app.directive(key, directives[key]);

/***********
 * Filters *
 ***********/

var filters = { };

filters.truncate = function() {
    return function(input,length) {
        if (!input) return input;
        if (input.length <= length) return input;
        return input.slice(0,length) + '...';
    };
};

/*************************
 * Filter initialization *
 *************************/

for (var filter in filters)
    app.filter(filter, filters[filter]);

})();
