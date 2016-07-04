(function (w, d) {
	'use strict';

	/**
	 * @ngdoc service
	 * @name mx.components.Utils
	 * @module mx.components
	 *
	 * @description
	 * Utilizes list of heterogeneous methods
	 *
	 * */
	var MxUtils = function () {
	};

	MxUtils.prototype = (function () {
		var result = {
			guid: guid,
			guidEmpty: guidEmpty,
			htmlDecode: htmlDecode,
			htmlEncode: htmlEncode,
			formatJavaScriptBreaks: formatJavaScriptBreaks,
			windowSize: windowSize,
			elementInViewport: elementInViewport,
			arraysEqual: arraysEqual
		};

		var decimalSeparator = null;
		Object.defineProperty(result, 'decimalSeparator', {
			get: function () {
				if (decimalSeparator === null) {
					var val = 1.1;
					decimalSeparator = val.toLocaleString().substring(1, 2);
				}
				return decimalSeparator;
			}, set: function () {
				throw new Error('decimalSeparator cannot be set');
			}
		});

		var thousandsDelimiter = null;
		Object.defineProperty(result, 'thousandsDelimiter', {
			get: function () {
				if (thousandsDelimiter === null) {
					var val = 1000;
					thousandsDelimiter = val.toLocaleString().substring(1, 2);
				}
				return thousandsDelimiter;
			}, set: function () {
				throw new Error('thousandsDelimiter cannot be set');
			}
		});

		return result;

		function arraysEqual(a, b, elementsEqualFn) {
			if (a === b) {
				return true;
			}
			if (!Array.isArray(a) || !Array.isArray(b)) {
				return false;
			}
			if (a.length !== b.length) {
				return false;
			}

			var sortedA = a.slice(0).sort();
			var sortedB = b.slice(0).sort();
			for (var i = 0; i < sortedA.length; ++i) {
				var equals = elementsEqualFn ? elementsEqualFn(sortedA[i], sortedB[i]) : sortedA[i] === sortedB[i];
				if (!equals) {
					return false;
				}
			}

			return true;
		}

		function guid() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}

			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		}
		
		function guidEmpty() {
			return '00000000-0000-0000-0000-000000000000';
		}

		function htmlDecode(value) {
			if (!value) {
				return '';
			}
			return value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&amp;/g, '&');
		}

		function htmlEncode(value) {
			if (!value) {
				return '';
			}
			return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
		}

		function formatJavaScriptBreaks(value) {
			if (!value) {
				return value;
			}
			var parts = value.split('\n');
			if (parts.length > 1) {
				return '<p>' + parts.join('</p><p>') + '</p>';
			} else {
				return value;
			}
		}

		function windowSize() {
			return {
				width: Math.max(d.documentElement.clientWidth, w.innerWidth || 0),
				height: Math.max(d.documentElement.clientHeight, w.innerHeight || 0)
			};
		}

		function elementInViewport(el) {
			var top = el.offsetTop;
			var left = el.offsetLeft;
			var width = el.offsetWidth;
			var height = el.offsetHeight;

			while (el.offsetParent) {
				el = el.offsetParent;
				top += el.offsetTop;
				left += el.offsetLeft;
			}

			return top >= window.pageYOffset &&
				left >= window.pageXOffset &&
				top + height <= window.pageYOffset + window.innerHeight &&
				left + width <= window.pageXOffset + window.innerWidth;
		}
	})();

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.Utils = new MxUtils();

})(window, document);

'use strict';

angular.module('mx.components', [
	'ngSanitize',
	'ngMaterial',
	'ngFileUpload',
	'ui.grid',
	'ui.grid.selection',
	'ui.grid.resizeColumns',
	'ui.grid.autoResize',
	'ui.grid.moveColumns',
	'ui.grid.edit',
	'ui.grid.cellNav',
	'ui.grid.pagination',
	'ui.grid.expandable',
	'scDateTime',
	'ui.tinymce',
	'oc.lazyLoad'
])
.config([
	'$mdIconProvider',
	'mx.internationalizationProvider',
	'$ocLazyLoadProvider',
	function(
		$mdIconProvider,
		internationalizationProvider,
		$ocLazyLoadProvider
	) {
		$mdIconProvider.iconSet('mxComponents', 'mx-components-icons.svg');

		internationalizationProvider.addNamespace(
			new mx.internationalization.Namespace('components', null, mx.components.internationalization)
		);

		// Here in details https://oclazyload.readme.io/docs/oclazyloadprovider
		$ocLazyLoadProvider.config({
			events: true
		});
	}
]);

(function() {
	'use strict';

	angular.module('mx.components').directive('mxTransclude', function() {
		return {
			restrict: 'A',
			compile: function(tElem, tAttrs, transclude) {
				return function(scope, elem) {
					transclude(scope, function(clone) {
						elem.append(clone);
					});
				};
			}
		};
	});
})();

(function () {
	'use strict';

	angular.module('mx.components').directive('mxRepeaterComplete', ['$timeout', '$parse', function ($timeout, $parse) {
		return {
			restrict: 'A',
			link: function (scope, element, attr) {
				if (scope.$last === true) {
					$timeout(function () {
						$parse(attr.mxRepeaterComplete)(scope);
					});
				}
			}
		};
	}]);
})();

(function () {
	'use strict';

	angular.module('mx.components').factory('mx.components.Recursion', ['$compile', function ($compile) {
		return {
			/**
			 * Manually compiles the element, fixing the recursion loop.
			 * @param element
			 * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
			 * @returns An object containing the linking functions.
			 */
			compile: function (element, link) {
				// Normalize the link parameter
				if (angular.isFunction(link)) {
					link = {post: link};
				}

				// Break the recursion loop by removing the contents
				var contents = element.contents().remove();
				var compiledContents;
				return {
					pre: link && link.pre ? link.pre : null,
					/**
					 * Compiles and re-adds the contents
					 */
					post: function (scope, element) {
						// Compile the contents
						if (!compiledContents) {
							compiledContents = $compile(contents);
						}
						// Re-add the compiled contents to the element
						compiledContents(scope, function (clone) {
							element.append(clone);
						});

						// Call the post-linking function, if any
						if (link && link.post) {
							link.post.apply(null, arguments);
						}
					}
				};
			}
		};
	}]);
})();

(function (w) {
	'use strict';

	var tokens = {
		'0': {pattern: /\d/, _default: '0'},
		'9': {pattern: /\d/, optional: true},
		'#': {pattern: /\d/, optional: true, recursive: true},
		'S': {pattern: /[a-zA-Z]/},
		'U': {
			pattern: /[a-zA-Z]/, transform: function (c) {
				return c.toLocaleUpperCase();
			}
		},
		'L': {
			pattern: /[a-zA-Z]/, transform: function (c) {
				return c.toLocaleLowerCase();
			}
		},
		'$': {escape: true}
	};

	var MxMask = function (pattern, opt) {
		this.options = opt || {};
		this.options = {
			reverse: this.options.reverse || false,
			usedefaults: this.options.usedefaults || this.options.reverse
		};
		this.pattern = pattern;
	};

	MxMask.prototype = {
		process: function (value) {
			if (!value) {
				return {result: '', valid: false};
			}
			value = value + '';
			var pattern2 = this.pattern;
			var valid = true;
			var formatted = '';
			var valuePos = this.options.reverse ? value.length - 1 : 0;
			var optionalNumbersToUse = calcOptionalNumbersToUse(pattern2, value);
			var escapeNext = false;
			var recursive = [];
			var inRecursiveMode = false;

			var steps = {
				start: this.options.reverse ? pattern2.length - 1 : 0,
				end: this.options.reverse ? -1 : pattern2.length,
				inc: this.options.reverse ? -1 : 1
			};

			function continueCondition(options) {
				if (!inRecursiveMode && hasMoreTokens(pattern2, i, steps.inc)) {
					return true;
				} else if (!inRecursiveMode) {
					inRecursiveMode = recursive.length > 0;
				}

				if (inRecursiveMode) {
					var pc = recursive.shift();
					recursive.push(pc);
					if (options.reverse && valuePos >= 0) {
						i++;
						pattern2 = insertChar(pattern2, pc, i);
						return true;
					} else if (!options.reverse && valuePos < value.length) {
						pattern2 = insertChar(pattern2, pc, i);
						return true;
					}
				}
				return i < pattern2.length && i >= 0;
			}

			for (var i = steps.start; continueCondition(this.options); i = i + steps.inc) {
				var pc = pattern2.charAt(i);
				var vc = value.charAt(valuePos);
				var token = tokens[pc];
				if (!inRecursiveMode || vc) {
					if (this.options.reverse && isEscaped(pattern2, i)) {
						formatted = concatChar(formatted, pc, this.options, token);
						i = i + steps.inc;
						continue;
					} else if (!this.options.reverse && escapeNext) {
						formatted = concatChar(formatted, pc, this.options, token);
						escapeNext = false;
						continue;
					} else if (!this.options.reverse && token && token.escape) {
						escapeNext = true;
						continue;
					}
				}

				if (!inRecursiveMode && token && token.recursive) {
					recursive.push(pc);
				} else if (inRecursiveMode && !vc) {
					if (!token || !token.recursive) {
						formatted = concatChar(formatted, pc, this.options, token);
					}
					continue;
				} else if (recursive.length > 0 && token && !token.recursive) {
					// Recursive tokens most be the last tokens of the pattern
					valid = false;
					continue;
				} else if (!inRecursiveMode && recursive.length > 0 && !vc) {
					continue;
				}

				if (!token) {
					formatted = concatChar(formatted, pc, this.options, token);
					if (!inRecursiveMode && recursive.length) {
						recursive.push(pc);
					}
				} else if (token.optional) {
					if (token.pattern.test(vc) && optionalNumbersToUse) {
						formatted = concatChar(formatted, vc, this.options, token);
						valuePos = valuePos + steps.inc;
						optionalNumbersToUse--;
					} else if (recursive.length > 0 && vc) {
						valid = false;
						break;
					}
				} else if (token.pattern.test(vc)) {
					formatted = concatChar(formatted, vc, this.options, token);
					valuePos = valuePos + steps.inc;
				} else if (!vc && token._default && this.options.usedefaults) {
					formatted = concatChar(formatted, token._default, this.options, token);
				} else {
					valid = false;
					break;
				}
			}

			return {result: formatted, valid: valid};
		},
		apply: function (value) {
			return this.process(value).result;
		},
		validate: function (value) {
			return this.process(value).valid;
		}
	};

	MxMask.process = function (value, pattern, options) {
		return new MxMask(pattern, options).process(value);
	};

	MxMask.apply = function (value, pattern, options) {
		return new MxMask(pattern, options).apply(value);
	};

	MxMask.validate = function (value, pattern, options) {
		return new MxMask(pattern, options).validate(value);
	};

	function isEscaped(pattern, pos) {
		var count = 0;
		var i = pos - 1;
		var token = {escape: true};
		while (i >= 0 && token && token.escape) {
			token = tokens[pattern.charAt(i)];
			count += token && token.escape ? 1 : 0;
			i--;
		}
		return count > 0 && count % 2 === 1;
	}

	function calcOptionalNumbersToUse(pattern, value) {
		var numbersInP = pattern.replace(/[^0]/g, '').length;
		var numbersInV = value.replace(/[^\d]/g, '').length;
		return numbersInV - numbersInP;
	}

	function concatChar(text, character, options, token) {
		if (token && typeof token.transform === 'function') {
			character = token.transform(character);
		}
		if (options.reverse) {
			return character + text;
		}
		return text + character;
	}

	function hasMoreTokens(pattern, pos, inc) {
		var pc = pattern.charAt(pos);
		var token = tokens[pc];
		if (pc === '') {
			return false;
		}
		return token && !token.escape ? true : hasMoreTokens(pattern, pos + inc, inc);
	}

	function insertChar(text, character, position) {
		var t = text.split('');
		t.splice(position >= 0 ? position : 0, 0, character);
		return t.join('');
	}

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.Mask = MxMask;

})(window);

(function (w) {
	'use strict';

	angular.module('mx.components').provider('mx.components.DataProviderRegistry', function () {
		var vm = this;

		var providers = {};

		vm.register = function (name, provider) {
			providers[name] = provider;
		};

		vm.$get = ['$q', '$injector', function ($q, $injector) {

			return {
				get: get,
				getData: getData
			};

			function get(name) {
				if (providers.hasOwnProperty(name)) {
					return providers[name];
				}
				throw new Error('Data provider with name "' + name + '" was not found');
			}

			function getData(name, parameters) {
				var defer = $q.defer();
				$q.when(get(name).getData($injector, parameters)).then(function (data) {
					defer.resolve(data);
				}, function (error) {
					defer.reject(error);
				});
				return defer.promise;
			}
		}];
	});

	function MxDataProvider(getData) {
		if (!getData || typeof getData !== 'function') {
			throw new Error('data provider should have getData method');
		}
		Object.defineProperty(this, 'getData', {value: getData});
	}

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.DataProvider = MxDataProvider;

})(window);

(function () {
	'use strict';

	/**
	 * @ngdoc provider
	 * @name mx.components:LazyLoadCfg
	 *
	 * @description
	 * `LazyLoadCfg` allows to set components dir, where modules/js-files that should be loaded on demand are places.
	 * This approach allows to set `componentsDir` via 'mx.components.LazyLoadCfgProvider' on config phase
	 * as well as via 'mx.components.LazyLoadCfg' on executing phase.
	 *
	 * Default dir is: 'bower_components/'.
	 *
	 * To configure components Dir make like this:
	 *
	 * For config phase:
	 * ```js
	 * .config(['mx.components.LazyLoadCfgProvider', function (lazyLoadCfgProvider) {
	 * 		lazyLoadCfgProvider.setComponentsDir('my_components_root/');
	 * 	}])
	 * ```
	 *
	 * For executing phase:
	 * ```js
	 * .run('myCtrl', ['mx.components.LazyLoadCfg', function (lazyLoadCfg) {
	 * 		lazyLoadCfg.componentsDir = 'my_components_root/';
	 * 	}]);
	 * ```
	 */
	angular
	.module('mx.components')
	.provider('mx.components.LazyLoadCfg', function () {
		var _componentsDir = 'bower_components/';
		this.setComponentsDir = function(dir) {
			_componentsDir = dir;
		};
		this.$get = function () {
			return {
				componentsDir: _componentsDir
			};
		};
	});

})();

(function (w) {
	'use strict';

	var mxi18nNamespace = function (name, url, definition) {
		Object.defineProperty(this, 'name', {writable: true, value: name});
		Object.defineProperty(this, 'url', {writable: true, value: url});
		Object.defineProperty(this, 'definition', {writable: true, value: definition});
		Object.defineProperty(this, 'languages', {writable: true, value: {}});
	};

	mxi18nNamespace.prototype = {
		localize: function (language, chunks) {

			function loadLanguage(that, lng) {
				var lngDef = {};
				if (that.definition) {
					lngDef = that.definition[lng] || {};
				} else {
					if (that.url) {
						var url = that.url.replace('#LNG#', lng);
						var xhr = new XMLHttpRequest();
						xhr.open('GET', url, false);
						xhr.send(null);
						if (xhr.status === 200) {
							lngDef = JSON.parse(xhr.responseText);
						} else {
							throw new Error('Cannot load language "' + lng + '" localization from ' + url);
						}
					}
				}
				that.languages[lng] = lngDef;
				return lngDef;
			}

			var localization = this.languages[language] || loadLanguage(this, language);
			chunks.forEach(function (chunk, index) {
				localization = localization[chunk] || (index + 1 === chunks.length ? null : {});
			});
			return localization;
		}
	};

	angular.module('mx.components').provider('mx.internationalization', function () {
		var vm = this;

		var devLanguageName = 'en';
		var language = devLanguageName;
		var namespaceDefs = {};

		vm.setLanguage = function (lng) {
			language = lng;
		};

		vm.addNamespace = function (namespace) {
			namespaceDefs[namespace.name] = namespace;
		};

		vm.$get = function () {

			var vm = {
				get: get,
				getFormatted: getFormatted
			};

			Object.defineProperty(vm, 'language', {
				get: function () {
					return language;
				},
				set: function (value) {
					language = value;
				}
			});

			return vm;

			function def(defValue, key) {
				return typeof defValue === 'undefined' ? '[localization:' + key + ']' : defValue;
			}

			function get(key, defValue) {
				if (!key) {
					return def(defValue, key);
				}

				var chunks = key.split('.');
				if (chunks.length === 1) {
					throw new Error('"' + key + '" cannot be used as a key for localization. Use [namespace.key] format.');
				}
				var namespace = chunks[0];
				var namespaceDef = namespaceDefs[namespace];
				if (!namespaceDef) {
					throw new Error('"' + namespace + '" not found. Use mx.internationalizationProvider.addNamespace to register a namespace.');
				}

				var res = namespaceDef.localize(language, chunks.slice(1));

				if (!res && language !== devLanguageName) {
					//fallback to development language
					res = namespaceDef.localize(devLanguageName, chunks.slice(1));
				}

				return  res || def(defValue, key);
			}

			function getFormatted() {
				var key = arguments[0];
				var str = get(key);
				if (!str || str.indexOf('[localization:') === 0) {
					return str;
				}
				for (var i = 1; i < arguments.length; i++) {
					var regEx = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
					str = str.replace(regEx, arguments[i]);
				}
				return str;
			}
		};
	});

	w.mx = w.mx || {};
	w.mx.internationalization = w.mx.internationalization || {};
	w.mx.internationalization.Namespace = mxi18nNamespace;
})(window);

(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxTiles
	 * @module mx.components
	 * @restrict E
	 *
	 * @description
	 * Visualizes tiles data.
	 *
	 * The following example shows hot to use mxTiles.
	 * mxTiles expects that vm.myTiles is an array of objects with 'title', 'description' and 'image' keys in following example.
	 * Like this: [{'title': 'My title', 'description': 'Some text', 'image': 'http://...jpg'}, ... ]
	 * ```html
	 * <mx-tiles list="vm.myTiles"></mx-tiles>
	 * ```
	 *
	 * If you need to use other keys like [{'name': 'My title', 'about': 'Some text', 'icon': 'http://...gif'}, ... ],
	 * it can be done next way:
	 * ```html
	 * <mx-tiles
	 *    list="vm.myTiles"
	 *    image-key='icon'
	 *    title-key='name'
	 *    description-key='about'>
	 * </mx-tiles>
	 * ```
	 *
	 * To make possible select items, it can be done next way:
	 * ```html
	 * <mx-tiles list="vm.myTiles" use-checkboxes="true" selected-items="vm.mySelectedItems"></mx-tiles>
	 * ```
	 *
	 * An `on-item-click` attribute allows to set handler for item-click event.
	 * ```html
	 * <mx-tiles list="vm.myTiles" on-item-click="vm.handeItemClick(item)"></mx-tiles>
	 * ```
	 *
	 * If 'vm.mySelectedItems' array contains some item-objects from 'vm.myTiles' array on start - the mxTiles will mark those items as selected on UI.
	 * And vice versa: When items are selected on UI, they will be added into 'vm.mySelectedItems' array.
	 *
	 * It's possible to set actions for each item with help "item-actions" attribute.
	 * Expected data format the same as for <mx-dropdown /> directive.
	 *
	 **/

	MxTilesCtrl.$inject = ['$scope', '$element'];

	function MxTilesCtrl($scope, $element) {
		var vm = this;
		vm._useCheckboxes = (vm.useCheckboxes || '').toLowerCase() === 'true';
		vm.handleSelection = handleSelection;
		vm._titleKey = vm.titleKey || 'title';
		vm._descriptionKey = vm.descriptionKey || 'description';
		vm._imageKey = vm.imageKey || 'image';
		vm.selectedItems = vm.selectedItems || [];
		vm._showItemActions = !!$element.attr('get-item-actions') || !!$element.attr('data-get-item-actions');
		angular.forEach(vm.selectedItems, function (item) {
			item.__isSelected = true;
		});

		$scope.$watch('vm.list', function (newList, oldList) {
			if (newList !== oldList && Array.isArray(vm.selectedItems)) {
				var previousSelectedItems = vm.selectedItems.slice(0);

				vm.selectedItems = [];
				newList.forEach(function (item) {
					if (item.__isSelected) {
						vm.selectedItems.push(item);
					}
				});

				if (!mx.components.Utils.arraysEqual(previousSelectedItems, vm.selectedItems, function (a, b) {
						return a.id === b.id;
					})) {
					vm.selectionChanged({selectedItems: vm.selectedItems});
				}
			}
		});

		function handleSelection(item) {
			var pos;
			if (item.__isSelected) {
				vm.selectedItems.push(item);
			} else {
				pos = vm.selectedItems.indexOf(item);
				if (pos !== -1) {
					vm.selectedItems.splice(pos, 1);
				}
			}
			vm.selectionChanged({selectedItems: vm.selectedItems});
		}

		return vm;
	}

	var template =
		'<div class="mx-tile-wrapper"> ' +
		'	<div ' +
		'		ng-repeat="item in vm.list" ' +
		'		ng-click="vm.onItemClick({item: item})" ' +
		'		aria-label="Click on tile" ' +
		'		class="md-whiteframe-z2 mx-tile">' +
		'		<div class="mx-tile-content">' +
		'			#ITEM-TEMPLATE# ' +
		'		</div>' +
		'		<div class="mx-tile-descr--fade-shadow"></div> ' +
		'		<md-checkbox ' +
		'			class="mx-tile-checkbox" ' +
		'			aria-label="Check"' +
		'			ng-if="vm._useCheckboxes" ' +
		'			ng-model="item.__isSelected" ' +
		'			ng-change="vm.handleSelection(item)" ' +
		'			ng-click="$event.stopPropagation()"> ' +
		'		</md-checkbox> ' +
		'		<div ' +
		'			class="mx-tile--actions" ' +
		'			ng-if="::vm._showItemActions">' +
		'			<mx-dropdown' +
		'				load-items="vm.getItemActions({item: item})"' +
		'				icon="more_vert"' +
		'				context="item">' +
		'			</mx-dropdown>' +
		'		</div>' +
		'	</div> ' +
		'	<div class="mx-tile-clearfix">&nbsp;</div> ' +
		'</div>';

	var dirOpts = {
		restrict: 'E',
		scope: {},
		bindToController: {
			list: '=',
			selectedItems: '=',
			titleKey: '@',
			descriptionKey: '@',
			imageKey: '@',
			useCheckboxes: '@',
			selectionChanged: '&',
			getItemActions: '&',
			onItemClick: '&'
		},
		controller: MxTilesCtrl,
		controllerAs: 'vm',
		template: template.replace('#ITEM-TEMPLATE#',
			'		<div class="mx-tile-img" ng-style="::{\'background-image\': \'url(\'+item[vm._imageKey]+\')\'}"></div> ' +
			'		<h5 class="mx-tile-title" title="{{:: item[vm._titleKey] }}">{{:: item[vm._titleKey] }}</h5> ' +
			'		<p class="mx-tile-descr" title="{{:: item[vm._descriptionKey] }}">{{:: item[vm._descriptionKey] }}</p> '
		)
	};

	angular.module('mx.components')
	.directive('mxTiles', function () {return dirOpts;})
	.directive('mxTemplateTiles', function () {
		return angular.extend(dirOpts, {
			transclude: true,
			template: template.replace('#ITEM-TEMPLATE#', '<div mx-transclude></div>')
		});
	});

})();

(function (w) {
	'use strict';

	MxTextBoxCtrl.$inject = ['mx.internationalization', '$element', '$timeout'];

	function MxTextBoxCtrl(internationalization, $element, $timeout) {
		mx.components.FormControlControllerBase.call(this, internationalization, $timeout);
		var vm = this;
		vm.type = vm.type || 'text';
		vm.trackInternal = vm.type !== 'text' && vm.type !== 'password';

		var input = $element.find('input');
		if (input) {
			input.on('blur', function() {
				$element.blur();
			});
			input.on('focus', function() {
				$element.triggerHandler('focus');
			});
		}

		return vm;
	}

	/**
	 * @ngdoc directive
	 * @name mx.components:mxTextBox
	 * @module mx.components
	 * @restrict 'E'
	 * @description
	 * The mx-text-box control is used to create a text box where the user can input text.
	 *
	 * The example below demonstrates some of the attributes you may use with the TextBox control:
	 * @param {string} name@ - The name property sets or returns the value of the name attribute of a mxTextBox.
	 * @param {string} label@ - Defines label displayed on the form
	 * @param {boolean} required= - The required property sets or returns whether a mxTextBox must be filled out before submitting a form.
	 * @param {boolean} disabled= - The disabled property sets or returns whether a mxTextBox should be disabled, or not.
	 * @param {boolean} readOnly= - The readOnly property sets or returns whether the contents of a mxTextBox should be read-only.
	 * @param {object} model=ngModel - directive binds element to the object in the model.
	 * @param {string} type="email" - <a href="https://docs.angularjs.org/api/ng/input/input[email]">E-mail directive</a>
	 * @param {string} ngPattern - <a href="https://docs.angularjs.org/api/ng/directive/ngPattern">ngPattern</a>
	 *
	 * @usage <mx-text-box ng-model="vm.inputData" data-label="mixed" data-read-only="true" data-disabled="true" data-required="true" data-name="readOnly" ng-pattern="regex"></mx-text-box>
	 */
	angular.module('mx.components').directive('mxTextBox', function () {
		var directive = new mx.components.FormControlBase(MxTextBoxCtrl, 'mx-text-box/mx-text-box.html');
		angular.extend(directive.bindToController,
			{
				type: '@',
				pattern:'='
			});
		return directive;
	});


	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.Forms = w.mx.components.Forms || {};
})(window);


(function () {
	'use strict';

	MxTextAreaCtrl.$inject = ['mx.internationalization'];

	function MxTextAreaCtrl(internationalization) {
		mx.components.FormControlControllerBase.call(this, internationalization);
		return this;
	}

	angular.module('mx.components').directive('mxTextArea', function () {
		var directive = new mx.components.FormControlBase(MxTextAreaCtrl, 'mx-text-area/mx-text-area.html');
		angular.extend(directive.bindToController, {
			rows: '@'
		});
		return directive;
	});
})();


(function () {
	'use strict';

	function mxTabs() {

		MxTabsCtrl.$inject = ['$scope'];
		function MxTabsCtrl($scope) {
			var vm = this;

			vm.tabs.sort(function(a, b) {
				if (a.position < b.position) {
					return -1;
				}
				if (a.position > b.position) {
					return 1;
				}
				return 0;
			});

			vm.initScope = function () {
				if (vm.parentControllerAs) {
					$scope[vm.parentControllerAs] = $scope.$parent[vm.parentControllerAs];
				} else {
					$scope.dataModel = $scope.$parent;
				}
			};

		}

		return {
			restrict: 'E',
			scope: {},
			bindToController: {
				tabs: '=',
				parentControllerAs: '@',
			},
			templateUrl: 'mx-tabs/mx-tabs.html',
			controller: MxTabsCtrl,
			controllerAs: '__$vm'
		};
	}

	angular.module('mx.components').directive('mxTabs', [mxTabs]);

})();

// jscs:disable
// jshint ignore: start
/**
 * Swiper 3.0.3
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * 
 * http://www.idangero.us/swiper/
 * 
 * Copyright 2015, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 * 
 * Licensed under MIT
 * 
 * Released on: March 1, 2015
 */
(function () {
    'use strict';
    /*===========================
    Swiper
    ===========================*/
    window.Swiper = function (container, params) {

        var defaults = {
            direction: 'horizontal',
            touchEventsTarget: 'container',
            initialSlide: 0,
            speed: 300,
            // autoplay
            autoplay: false,
            autoplayDisableOnInteraction: true,
            // Free mode
            freeMode: false,
            freeModeMomentum: true,
            freeModeMomentumRatio: 1,
            freeModeMomentumBounce: true,
            freeModeMomentumBounceRatio: 1,
            // Effects
            effect: 'slide', // 'slide' or 'fade' or 'cube' or 'coverflow'
            coverflow: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows : true
            },
            cube: {
                slideShadows: true,
                shadow: true,
                shadowOffset: 20,
                shadowScale: 0.94
            },
            fade: {
                crossFade: false
            },
            // Parallax
            parallax: false,
            // Scrollbar
            scrollbar: null,
            scrollbarHide: true,
            // Keyboard Mousewheel
            keyboardControl: false,
            mousewheelControl: false,
            mousewheelForceToAxis: false,
            // Hash Navigation
            hashnav: false,
            // Slides grid
            spaceBetween: 0,
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerColumnFill: 'column',
            slidesPerGroup: 1,
            centeredSlides: false,
            // Touches
            touchRatio: 1,
            touchAngle: 45,
            simulateTouch: true,
            shortSwipes: true,
            longSwipes: true,
            longSwipesRatio: 0.5,
            longSwipesMs: 300,
            followFinger: true,
            onlyExternal: false,
            threshold: 0,
            touchMoveStopPropagation: true,
            // Pagination
            pagination: null,
            paginationClickable: false,
            paginationHide: false,
            // Resistance
            resistance: true,
            resistanceRatio: 0.85,
            // Next/prev buttons
            nextButton: null,
            prevButton: null,
            // Progress
            watchSlidesProgress: false,
            watchVisibility: false,
            // Cursor
            grabCursor: false,
            // Clicks
            preventClicks: true,
            preventClicksPropagation: true,
            releaseFormElements: true,
            slideToClickedSlide: false,
            // Images
            updateOnImagesReady: true,
            // loop
            loop: false,
            loopAdditionalSlides: 0,
            loopedSlides: null,
            // Control
            control: undefined,
            controlInverse: false,
            // Swiping/no swiping
            allowSwipeToPrev: true,
            allowSwipeToNext: true,
            swipeHandler: null, //'.swipe-handler',
            noSwiping: true,
            noSwipingClass: 'swiper-no-swiping',
            // NS
            slideClass: 'swiper-slide',
            slideActiveClass: 'swiper-slide-active',
            slideVisibleClass: 'swiper-slide-visible',
            slideDuplicateClass: 'swiper-slide-duplicate',
            slideNextClass: 'swiper-slide-next',
            slidePrevClass: 'swiper-slide-prev',
            wrapperClass: 'swiper-wrapper',
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
            buttonDisabledClass: 'swiper-button-disabled',
            paginationHiddenClass: 'swiper-pagination-hidden',
            // Observer
            observer: false,
            observeParents: false,
            // Callbacks
            runCallbacksOnInit: true
            /*
            Callbacks:
            onInit: function (swiper)
            onDestroy: function (swiper)
            onClick: function (swiper, e) 
            onTap: function (swiper, e) 
            onDoubleTap: function (swiper, e) 
            onSliderMove: function (swiper, e) 
            onSlideChangeStart: function (swiper) 
            onSlideChangeEnd: function (swiper) 
            onTransitionStart: function (swiper) 
            onTransitionEnd: function (swiper) 
            onImagesReady: function (swiper) 
            onProgress: function (swiper, progress) 
            onTouchStart: function (swiper, e) 
            onTouchMove: function (swiper, e) 
            onTouchMoveOpposite: function (swiper, e) 
            onTouchEnd: function (swiper, e) 
            onReachBeginning: function (swiper) 
            onReachEnd: function (swiper) 
            onSetTransition: function (swiper, duration) 
            onSetTranslate: function (swiper, translate) 
            onAutoplayStart: function (swiper)
            onAutoplayStop: function (swiper)
            */
        };
        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            }
            else if (typeof params[def] === 'object') {
                for (var deepDef in defaults[def]) {
                    if (typeof params[def][deepDef] === 'undefined') {
                        params[def][deepDef] = defaults[def][deepDef];
                    }
                }
            }
        }
        
        // Swiper
        var s = this;
        
        // Params
        s.params = params;
        /*=========================
          Dom Library and plugins
          ===========================*/
        var $;
        if (typeof Dom7 === 'undefined') {
            $ = window.Dom7 || window.Zepto || window.jQuery;
        }
        else {
            $ = Dom7;
        }
        if (!$) return;
        
        /*=========================
          Preparation - Define Container, Wrapper and Pagination
          ===========================*/
        s.container = $(container);
        if (s.container.length === 0) return;
        if (s.container.length > 1) {
            s.container.each(function () {
                new Swiper(this, params);
            });
            return;
        }
        
        // Save instance in container HTML Element and in data
        s.container[0].swiper = s;
        s.container.data('swiper', s);
        
        s.container.addClass('swiper-container-' + s.params.direction);
        
        if (s.params.freeMode) {
            s.container.addClass('swiper-container-free-mode');
        }
        // Enable slides progress when required
        if (s.params.parallax || s.params.watchVisibility) {
            s.params.watchSlidesProgress = true;
        }
        // Coverflow / 3D
        if (['cube', 'coverflow'].indexOf(s.params.effect) >= 0) {
            if (s.support.transforms3d) {
                s.params.watchSlidesProgress = true;
                s.container.addClass('swiper-container-3d');
            }
            else {
                s.params.effect = 'slide';
            }
        }
        if (s.params.effect !== 'slide') {
            s.container.addClass('swiper-container-' + s.params.effect);
        }
        if (s.params.effect === 'cube') {
            s.params.resistanceRatio = 0;
            s.params.slidesPerView = 1;
            s.params.slidesPerColumn = 1;
            s.params.slidesPerGroup = 1;
            s.params.centeredSlides = false;
            s.params.spaceBetween = 0;
        }
        if (s.params.effect === 'fade') {
            s.params.watchSlidesProgress = true;
            s.params.spaceBetween = 0;
        }
        
        // Grab Cursor
        if (s.params.grabCursor && s.support.touch) {
            s.params.grabCursor = false;
        }
        
        // Wrapper
        s.wrapper = s.container.children('.' + s.params.wrapperClass);
        
        // Pagination
        if (s.params.pagination) {
            s.paginationContainer = $(s.params.pagination);
            if (s.params.paginationClickable) {
                s.paginationContainer.addClass('swiper-pagination-clickable');
            }
        }
        
        // Is Horizontal
        function isH() {
            return s.params.direction === 'horizontal';
        }
        
        // RTL
        s.rtl = isH() && (s.container[0].dir.toLowerCase() === 'rtl' || s.container.css('direction') === 'rtl');
        if (s.rtl) s.container.addClass('swiper-container-rtl');
        
        // Wrong RTL support
        if (s.rtl) {
            s.wrongRTL = s.wrapper.css('display') === '-webkit-box';
        }
        
        // Translate
        s.translate = 0;
        
        // Progress
        s.progress = 0;
        
        // Velocity
        s.velocity = 0;
        
        // Locks, unlocks
        s.lockSwipeToNext = function () {
            s.params.allowSwipeToNext = false;
        };
        s.lockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = false;
        };
        s.lockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = false;
        };
        s.unlockSwipeToNext = function () {
            s.params.allowSwipeToNext = true;
        };
        s.unlockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = true;
        };
        s.unlockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = true;
        };
        
        // Columns
        if (s.params.slidesPerColumn > 1) {
            s.container.addClass('swiper-container-multirow');
        }
        
        
        /*=========================
          Set grab cursor
          ===========================*/
        if (s.params.grabCursor) {
            s.container[0].style.cursor = 'move';
            s.container[0].style.cursor = '-webkit-grab';
            s.container[0].style.cursor = '-moz-grab';
            s.container[0].style.cursor = 'grab';
        }
        /*=========================
          Update on Images Ready
          ===========================*/
        s.imagesToLoad = [];
        s.imagesLoaded = 0;
        
        function loadImage(img) {
            var image, src;
            var onReady = function () {
                if (typeof s === 'undefined' || s === null) return;
                if (s.imagesLoaded !== undefined) s.imagesLoaded++;
                if (s.imagesLoaded === s.imagesToLoad.length) {
                    s.update();
                    if (s.params.onImagesReady) s.params.onImagesReady(s);
                }
            };
        
            if (!img.complete) {
                src = (img.currentSrc || img.getAttribute('src'));
                if (src) {
                    image = new Image();
                    image.onload = onReady;
                    image.onerror = onReady;
                    image.src = src;
                } else {
                    onReady();
                }
        
            } else {//image already loaded...
                onReady();
            }
        }
        s.preloadImages = function () {
            s.imagesToLoad = s.container.find('img');
        
            for (var i = 0; i < s.imagesToLoad.length; i++) {
                loadImage(s.imagesToLoad[i]);
            }
        };
        
        /*=========================
          Autoplay
          ===========================*/
        s.autoplayTimeoutId = undefined;
        s.autoplaying = false;
        s.autoplayPaused = false;
        function autoplay() {
            s.autoplayTimeoutId = setTimeout(function () {
                if (s.params.loop) {
                    s.fixLoop();
                    s._slideNext();
                }
                else {
                    if (!s.isEnd) {
                        s._slideNext();
                    }
                    else {
                        if (!params.autoplayStopOnLast) {
                            s._slideTo(0);
                        }
                        else {
                            s.stopAutoplay();
                        }
                    }
                }
            }, s.params.autoplay);
        }
        s.startAutoplay = function () {
            if (typeof s.autoplayTimeoutId !== 'undefined') return false;
            if (!s.params.autoplay) return false;
            if (s.autoplaying) return false;
            s.autoplaying = true;
            if (s.params.onAutoplayStart) s.params.onAutoplayStart(s);
            autoplay();
        };
        s.stopAutoplay = function (internal) {
            if (!s.autoplayTimeoutId) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplaying = false;
            s.autoplayTimeoutId = undefined;
            if (s.params.onAutoplayStop) s.params.onAutoplayStop(s);
        };
        s.pauseAutoplay = function (speed) {
            if (s.autoplayPaused) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplayPaused = true;
            if (speed === 0) {
                s.autoplayPaused = false;
                autoplay();
            }
            else {
                s.wrapper.transitionEnd(function () {
                    s.autoplayPaused = false;
                    if (!s.autoplaying) {
                        s.stopAutoplay();
                    }
                    else {
                        autoplay();
                    }
                });
            }
        };
        /*=========================
          Min/Max Translate
          ===========================*/
        s.minTranslate = function () {
            return (-s.snapGrid[0]);
        };
        s.maxTranslate = function () {
            return (-s.snapGrid[s.snapGrid.length - 1]);
        };
        /*=========================
          Slider/slides sizes
          ===========================*/
        s.updateContainerSize = function () {
            s.width = s.container[0].clientWidth;
            s.height = s.container[0].clientHeight;
            s.size = isH() ? s.width : s.height;
        };
        
        s.updateSlidesSize = function () {
            s.slides = s.wrapper.children('.' + s.params.slideClass);
            s.snapGrid = [];
            s.slidesGrid = [];
            s.slidesSizesGrid = [];
            
            var spaceBetween = s.params.spaceBetween,
                slidePosition = 0,
                i,
                prevSlideSize = 0,
                index = 0;
            if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
                spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * s.size;
            }
        
            s.virtualWidth = -spaceBetween;
            // reset margins
            if (s.rtl) s.slides.css({marginLeft: '', marginTop: ''});
            else s.slides.css({marginRight: '', marginBottom: ''});
        
            var slidesNumberEvenToRows;
            if (s.params.slidesPerColumn > 1) {
                if (Math.floor(s.slides.length / s.params.slidesPerColumn) === s.slides.length / s.params.slidesPerColumn) {
                    slidesNumberEvenToRows = s.slides.length;
                }
                else {
                    slidesNumberEvenToRows = Math.ceil(s.slides.length / s.params.slidesPerColumn) * s.params.slidesPerColumn;
                }
            }
        
            // Calc slides
            var slideSize;
            for (i = 0; i < s.slides.length; i++) {
                slideSize = 0;
                var slide = s.slides.eq(i);
                if (s.params.slidesPerColumn > 1) {
                    // Set slides order
                    var newSlideOrderIndex;
                    var column, row;
                    var slidesPerColumn = s.params.slidesPerColumn;
                    var slidesPerRow;
                    if (s.params.slidesPerColumnFill === 'column') {
                        column = Math.floor(i / slidesPerColumn);
                        row = i - column * slidesPerColumn;
                        newSlideOrderIndex = column + row * slidesNumberEvenToRows / slidesPerColumn;
                        slide
                            .css({
                                '-webkit-box-ordinal-group': newSlideOrderIndex,
                                '-moz-box-ordinal-group': newSlideOrderIndex,
                                '-ms-flex-order': newSlideOrderIndex,
                                '-webkit-order': newSlideOrderIndex,
                                'order': newSlideOrderIndex
                            });
                    }
                    else {
                        slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
                        row = Math.floor(i / slidesPerRow);
                        column = i - row * slidesPerRow;
                        
                    }
                    slide
                        .css({
                            'margin-top': (row !== 0 && s.params.spaceBetween) && (s.params.spaceBetween + 'px')
                        })
                        .attr('data-swiper-column', column)
                        .attr('data-swiper-row', row);
                        
                }
                if (slide.css('display') === 'none') continue;
                if (s.params.slidesPerView === 'auto') {
                    slideSize = isH() ? slide.outerWidth(true) : slide.outerHeight(true);
                }
                else {
                    slideSize = (s.size - (s.params.slidesPerView - 1) * spaceBetween) / s.params.slidesPerView;
                    if (isH()) {
                        s.slides[i].style.width = slideSize + 'px';
                    }
                    else {
                        s.slides[i].style.height = slideSize + 'px';
                    }
                }
                s.slides[i].swiperSlideSize = slideSize;
                s.slidesSizesGrid.push(slideSize);
                
                
                if (s.params.centeredSlides) {
                    slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                    if (i === 0) slidePosition = slidePosition - s.size / 2 - spaceBetween;
                    if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
                    if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                }
                else {
                    if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                    slidePosition = slidePosition + slideSize + spaceBetween;
                }
        
                s.virtualWidth += slideSize + spaceBetween;
        
                prevSlideSize = slideSize;
        
                index ++;
            }
            s.virtualWidth = Math.max(s.virtualWidth, s.size);
        
            var newSlidesGrid;
        
            if (s.rtl && s.wrongRTL && (s.params.effect === 'slide' || s.params.effect === 'coverflow')) {
                s.wrapper.css({width: s.virtualWidth + s.params.spaceBetween + 'px'});
            }
        
            if (s.params.slidesPerColumn > 1) {
                s.virtualWidth = (slideSize + s.params.spaceBetween) * slidesNumberEvenToRows;
                s.virtualWidth = Math.ceil(s.virtualWidth / s.params.slidesPerColumn) - s.params.spaceBetween;
                s.wrapper.css({width: s.virtualWidth + s.params.spaceBetween + 'px'});
                if (s.params.centeredSlides) {
                    newSlidesGrid = [];
                    for (i = 0; i < s.snapGrid.length; i++) {
                        if (s.snapGrid[i] < s.virtualWidth + s.snapGrid[0]) newSlidesGrid.push(s.snapGrid[i]);
                    }
                    s.snapGrid = newSlidesGrid;
                }
            }
        
            // Remove last grid elements depending on width
            if (!s.params.centeredSlides) {
                newSlidesGrid = [];
                for (i = 0; i < s.snapGrid.length; i++) {
                    if (s.snapGrid[i] <= s.virtualWidth - s.size) {
                        newSlidesGrid.push(s.snapGrid[i]);
                    }
                }
                s.snapGrid = newSlidesGrid;
                if (Math.floor(s.virtualWidth - s.size) > Math.floor(s.snapGrid[s.snapGrid.length - 1])) {
                    s.snapGrid.push(s.virtualWidth - s.size);
                }
            }
            if (s.snapGrid.length === 0) s.snapGrid = [0];
                
            if (s.params.spaceBetween !== 0) {
                if (isH()) {
                    if (s.rtl) s.slides.css({marginLeft: spaceBetween + 'px'});
                    else s.slides.css({marginRight: spaceBetween + 'px'});
                }
                else s.slides.css({marginBottom: spaceBetween + 'px'});
            }
            if (s.params.watchSlidesProgress) {
                s.updateSlidesOffset();
            }
        };
        s.updateSlidesOffset = function () {
            for (var i = 0; i < s.slides.length; i++) {
                s.slides[i].swiperSlideOffset = isH() ? s.slides[i].offsetLeft : s.slides[i].offsetTop;
            }
        };
        
        /*=========================
          Slider/slides progress
          ===========================*/
        s.updateSlidesProgress = function (translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            if (s.slides.length === 0) return;
            if (typeof s.slides[0].swiperSlideOffset === 'undefined') s.updateSlidesOffset();
        
            var offsetCenter = s.params.centeredSlides ? -translate + s.size / 2 : -translate;
            if (s.rtl) offsetCenter = s.params.centeredSlides ? translate - s.size / 2 : translate;
        
            // Visible Slides
            var containerBox = s.container[0].getBoundingClientRect();
            var sideBefore = isH() ? 'left' : 'top';
            var sideAfter = isH() ? 'right' : 'bottom';
            s.slides.removeClass(s.params.slideVisibleClass);
            for (var i = 0; i < s.slides.length; i++) {
                var slide = s.slides[i];
                var slideCenterOffset = (s.params.centeredSlides === true) ? slide.swiperSlideSize / 2 : 0;
                var slideProgress = (offsetCenter - slide.swiperSlideOffset - slideCenterOffset) / (slide.swiperSlideSize + s.params.spaceBetween);
                if (s.params.watchVisibility) {
                    var slideBefore = -(offsetCenter - slide.swiperSlideOffset - slideCenterOffset);
                    var slideAfter = slideBefore + s.slidesSizesGrid[i];
                    var isVisible =
                        (slideBefore >= 0 && slideBefore < s.size) ||
                        (slideAfter > 0 && slideAfter <= s.size) ||
                        (slideBefore <= 0 && slideAfter >= s.size);
                    if (isVisible) {
                        s.slides.eq(i).addClass(s.params.slideVisibleClass);
                    }
                }
                slide.progress = s.rtl ? -slideProgress : slideProgress;
            }
        };
        s.updateProgress = function (translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            var translatesDiff = s.maxTranslate() - s.minTranslate();
            if (translatesDiff === 0) {
                s.progress = 0;
                s.isBeginning = s.isEnd = true;
            }
            else {
                s.progress = (translate - s.minTranslate()) / (translatesDiff);
                s.isBeginning = s.progress <= 0;
                s.isEnd = s.progress >= 1;
            }
            if (s.isBeginning && s.params.onReachBeginning) s.params.onReachBeginning(s);
            if (s.isEnd && s.params.onReachEnd) s.params.onReachEnd(s);
            
            if (s.params.watchSlidesProgress) s.updateSlidesProgress(translate);
            if (s.params.onProgress) s.params.onProgress(s, s.progress);
        };
        s.updateActiveIndex = function () {
            var translate = s.rtl ? s.translate : -s.translate;
            var newActiveIndex, i, snapIndex;
            for (i = 0; i < s.slidesGrid.length; i ++) {
                if (typeof s.slidesGrid[i + 1] !== 'undefined') {
                    if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1] - (s.slidesGrid[i + 1] - s.slidesGrid[i]) / 2) {
                        newActiveIndex = i;
                    }
                    else if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1]) {
                        newActiveIndex = i + 1;
                    }
                }
                else {
                    if (translate >= s.slidesGrid[i]) {
                        newActiveIndex = i;
                    }
                }
            }
            // Normalize slideIndex
            if (newActiveIndex < 0 || typeof newActiveIndex === 'undefined') newActiveIndex = 0;
            // for (i = 0; i < s.slidesGrid.length; i++) {
                // if (- translate >= s.slidesGrid[i]) {
                    // newActiveIndex = i;
                // }
            // }
            snapIndex = Math.floor(newActiveIndex / s.params.slidesPerGroup);
            if (snapIndex >= s.snapGrid.length) snapIndex = s.snapGrid.length - 1;
        
            if (newActiveIndex === s.activeIndex) {
                return;
            }
            s.snapIndex = snapIndex;
            s.previousIndex = s.activeIndex;
            s.activeIndex = newActiveIndex;
            s.updateClasses();
        };
        
        /*=========================
          Classes
          ===========================*/
        s.updateClasses = function () {
            s.slides.removeClass(s.params.slideActiveClass + ' ' + s.params.slideNextClass + ' ' + s.params.slidePrevClass);
            var activeSlide = s.slides.eq(s.activeIndex);
            // Active classes
            activeSlide.addClass(s.params.slideActiveClass);
            activeSlide.next('.' + s.params.slideClass).addClass(s.params.slideNextClass);
            activeSlide.prev('.' + s.params.slideClass).addClass(s.params.slidePrevClass);
        
            // Pagination
            if (s.bullets && s.bullets.length > 0) {
                s.bullets.removeClass(s.params.bulletActiveClass);
                var bulletIndex;
                if (s.params.loop) {
                    bulletIndex = s.activeIndex - s.loopedSlides;
                    if (bulletIndex > s.slides.length - 1 - s.loopedSlides * 2) {
                        bulletIndex = bulletIndex - (s.slides.length - s.loopedSlides * 2);
                    }
                }
                else {
                    if (typeof s.snapIndex !== 'undefined') {
                        bulletIndex = s.snapIndex;
                    }
                    else {
                        bulletIndex = s.activeIndex || 0;
                    }
                }
                s.bullets.eq(bulletIndex).addClass(s.params.bulletActiveClass);
            }
        
            // Next/active buttons
            if (!s.params.loop) {
                if (s.params.prevButton) {
                    if (s.isBeginning) $(s.params.prevButton).addClass(s.params.buttonDisabledClass);
                    else $(s.params.prevButton).removeClass(s.params.buttonDisabledClass);
                }
                if (s.params.nextButton) {
                    if (s.isEnd) $(s.params.nextButton).addClass(s.params.buttonDisabledClass);
                    else $(s.params.nextButton).removeClass(s.params.buttonDisabledClass);
                }
            }
        };
        
        /*=========================
          Pagination
          ===========================*/
        s.updatePagination = function () {
            if (!s.params.pagination) return;
            if (s.paginationContainer && s.paginationContainer.length > 0) {
                var bulletsHTML = '';
                var numberOfBullets = s.params.loop ? s.slides.length - s.loopedSlides * 2 : s.snapGrid.length;
                for (var i = 0; i < numberOfBullets; i++) {
                    bulletsHTML += '<span class="' + s.params.bulletClass + '"></span>';
                }
                s.paginationContainer.html(bulletsHTML);
                s.bullets = s.paginationContainer.find('.' + s.params.bulletClass);
            }
        };
        /*=========================
          Common update method
          ===========================*/
        s.update = function (updateTranslate) {
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            s.updatePagination();
            s.updateClasses();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            function forceSetTranslate() {
                newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            }
            if (updateTranslate) {
                var translated, newTranslate;
                if (s.params.freeMode) {
                    forceSetTranslate();
                }
                else {
                    if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
                        translated = s.slideTo(s.slides.length - 1, 0, false, true);
                    }
                    else {
                        translated = s.slideTo(s.activeIndex, 0, false, true);
                    }
                    if (!translated) {
                        forceSetTranslate();
                    }
                }
                    
            }
        };
        
        /*=========================
          Resize Handler
          ===========================*/
        s.onResize = function () {
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            if (s.params.slidesPerView === 'auto' || s.params.freeMode) s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            if (s.params.freeMode) {
                var newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            }
            else {
                s.updateClasses();
                if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
                    s.slideTo(s.slides.length - 1, 0, false, true);
                }
                else {
                    s.slideTo(s.activeIndex, 0, false, true);
                }
            }
                
        };
        
        /*=========================
          Events
          ===========================*/
        
        //Define Touch Events
        var desktopEvents = ['mousedown', 'mousemove', 'mouseup'];
        if (window.navigator.pointerEnabled) desktopEvents = ['pointerdown', 'pointermove', 'pointerup'];
        else if (window.navigator.msPointerEnabled) desktopEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
        s.touchEvents = {
            start : s.support.touch || !s.params.simulateTouch  ? 'touchstart' : desktopEvents[0],
            move : s.support.touch || !s.params.simulateTouch ? 'touchmove' : desktopEvents[1],
            end : s.support.touch || !s.params.simulateTouch ? 'touchend' : desktopEvents[2]
        };
            
        
        // WP8 Touch Events Fix
        if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
            (s.params.touchEventsTarget === 'container' ? s.container : s.wrapper).addClass('swiper-wp8-' + s.params.direction);
        }
        
        // Attach/detach events
        s.events = function (detach) {
            var actionDom = detach ? 'off' : 'on';
            var action = detach ? 'removeEventListener' : 'addEventListener';
            var touchEventsTarget = s.params.touchEventsTarget === 'container' ? s.container[0] : s.wrapper[0];
            var target = s.support.touch ? touchEventsTarget : document;
        
            var moveCapture = s.params.nested ? true : false;
        
            //Touch Events
            if (s.browser.ie) {
                touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
                target[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                target[action](s.touchEvents.end, s.onTouchEnd, false);
            }
            else {
                if (s.support.touch) {
                    touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
                    touchEventsTarget[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                    touchEventsTarget[action](s.touchEvents.end, s.onTouchEnd, false);
                }
                if (params.simulateTouch && !s.device.ios && !s.device.android) {
                    touchEventsTarget[action]('mousedown', s.onTouchStart, false);
                    target[action]('mousemove', s.onTouchMove, moveCapture);
                    target[action]('mouseup', s.onTouchEnd, false);
                }
            }
            window[action]('resize', s.onResize);
        
            // Next, Prev, Index
            if (s.params.nextButton) $(s.params.nextButton)[actionDom]('click', s.onClickNext);
            if (s.params.prevButton) $(s.params.prevButton)[actionDom]('click', s.onClickPrev);
            if (s.params.pagination && s.params.paginationClickable) {
                $(s.paginationContainer)[actionDom]('click', '.' + s.params.bulletClass, s.onClickIndex);
            }
        
            // Prevent Links Clicks
            if (s.params.preventClicks || s.params.preventClicksPropagation) touchEventsTarget[action]('click', s.preventClicks, true);
        };
        s.attachEvents = function (detach) {
            s.events();
        };
        s.detachEvents = function () {
            s.events(true);
        };
        
        /*=========================
          Handle Clicks
          ===========================*/
        // Prevent Clicks
        s.allowClick = true;
        s.preventClicks = function (e) {
            if (!s.allowClick) {
                if (s.params.preventClicks) e.preventDefault();
                if (s.params.preventClicksPropagation) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }
        };
        // Clicks
        s.onClickNext = function (e) {
            e.preventDefault();
            s.slideNext();
        };
        s.onClickPrev = function (e) {
            e.preventDefault();
            s.slidePrev();
        };
        s.onClickIndex = function (e) {
            e.preventDefault();
            var index = $(this).index() * s.params.slidesPerGroup;
            if (s.params.loop) index = index + s.loopedSlides;
            s.slideTo(index);
        };
        
        /*=========================
          Handle Touches
          ===========================*/
        function findElementInEvent(e, selector) {
            var el = $(e.target);
            if (!el.is(selector)) {
                if (typeof selector === 'string') {
                    el = el.parents(selector);
                }
                else if (selector.nodeType) {
                    var found;
                    el.parents().each(function (index, _el) {
                        if (_el === selector) found = selector;
                    });
                    if (!found) return undefined;
                    else return selector;
                }
            }
            if (el.length === 0) {
                return undefined;
            }
            return el[0];
        }
        s.updateClickedSlide = function (e) {
            var slide = findElementInEvent(e, '.' + s.params.slideClass);
            if (slide) {
                s.clickedSlide = slide;
                s.clickedIndex = $(slide).index();
            }
            else {
                s.clickedSlide = undefined;
                s.clickedIndex = undefined;
                return;
            }
            if (s.params.slideToClickedSlide && s.clickedIndex !== undefined && s.clickedIndex !== s.activeIndex) {
                var slideToIndex = s.clickedIndex,
                    realIndex;
                if (s.params.loop) {
                    realIndex = $(s.clickedSlide).attr('data-swiper-slide-index');
                    if (slideToIndex > s.slides.length - s.params.slidesPerView) {
                        s.fixLoop();
                        slideToIndex = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]').eq(0).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    }
                    else if (slideToIndex < s.params.slidesPerView - 1) {
                        s.fixLoop();
                        var duplicatedSlides = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]');
                        slideToIndex = duplicatedSlides.eq(duplicatedSlides.length - 1).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    }
                    else {
                        s.slideTo(slideToIndex);
                    }
                }
                else {
                    s.slideTo(slideToIndex);
                }
            }
        };
        
        var isTouched, 
            isMoved, 
            touchStartTime, 
            isScrolling, 
            currentTranslate, 
            startTranslate, 
            allowThresholdMove,
            // Form elements to match
            formElements = 'input, select, textarea, button',
            // Last click time
            lastClickTime = Date.now(), clickTimeout,
            //Velocities
            velocities = [], 
            allowMomentumBounce;
        
        // Animating Flag
        s.animating = false;
        
        // Touches information
        s.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0
        };
        
        // Touch handlers
        var isTouchEvent;
        s.onTouchStart = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            isTouchEvent = e.type === 'touchstart';
            if (!isTouchEvent && 'which' in e && e.which === 3) return;
            if (s.params.noSwiping && findElementInEvent(e, '.' + s.params.noSwipingClass)) {
                s.allowClick = true;
                return;
            }
            if (s.params.swipeHandler) {
                if (!findElementInEvent(e, s.params.swipeHandler)) return;
            }
            isTouched = true;
            isMoved = false;
            isScrolling = undefined;
            s.touches.startX = s.touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
            s.touches.startY = s.touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
            touchStartTime = Date.now();
            s.allowClick = true;
            s.updateContainerSize();
            s.swipeDirection = undefined;
            if (s.params.threshold > 0) allowThresholdMove = false;
            if (e.type !== 'touchstart') {
                var preventDefault = true;
                if ($(e.target).is(formElements)) preventDefault = false;
                if (document.activeElement && $(document.activeElement).is(formElements)) document.activeElement.blur();
                if (preventDefault) {
                    e.preventDefault();
                }
            }
            if (s.params.onTouchStart) s.params.onTouchStart(s, e);
        };
        
        s.onTouchMove = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            if (isTouchEvent && e.type === 'mousemove') return;
            if (e.preventedByNestedSwiper) return;
            if (s.params.onlyExternal) {
                isMoved = true;
                s.allowClick = false;
                return;
            }
            if (s.params.onTouchMove) s.params.onTouchMove(s, e);
            s.allowClick = false;
            if (e.targetTouches && e.targetTouches.length > 1) return;
            
            s.touches.currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            s.touches.currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
        
            if (typeof isScrolling === 'undefined') {
                var touchAngle = Math.atan2(Math.abs(s.touches.currentY - s.touches.startY), Math.abs(s.touches.currentX - s.touches.startX)) * 180 / Math.PI;
                isScrolling = isH() ? touchAngle > s.params.touchAngle : (90 - touchAngle > s.params.touchAngle);
                // isScrolling = !!(isScrolling || Math.abs(touchesCurrent.y - touchesStart.y) > Math.abs(touchesCurrent.x - touchesStart.x));
            }
            if (isScrolling && s.params.onTouchMoveOpposite) {
                s.params.onTouchMoveOpposite(s, e);
            }
            if (!isTouched) return;
            if (isScrolling)  {
                isTouched = false;
                return;
            }
            if (s.params.onSliderMove) s.params.onSliderMove(s, e);
        
            e.preventDefault();
            if (s.params.touchMoveStopPropagation && !s.params.nested) {
                e.stopPropagation();
            }
        
            if (!isMoved) {
                if (params.loop) {
                    s.fixLoop();
                }
                startTranslate = s.params.effect === 'cube' ? ((s.rtl ? -s.translate: s.translate) || 0) : s.getWrapperTranslate();
                s.setWrapperTransition(0);
                if (s.animating) {
                    s.wrapper.trigger('webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd');
                }
                if (s.params.autoplay && s.autoplaying) {
                    if (s.params.autoplayDisableOnInteraction) {
                        s.stopAutoplay();
                    }
                    else {
                        s.pauseAutoplay();
                    }
                }
                allowMomentumBounce = false;
                //Grab Cursor
                if (s.params.grabCursor) {
                    s.container[0].style.cursor = 'move';
                    s.container[0].style.cursor = '-webkit-grabbing';
                    s.container[0].style.cursor = '-moz-grabbin';
                    s.container[0].style.cursor = 'grabbing';
                }
            }
            isMoved = true;
        
            var diff = s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
        
            diff = diff * s.params.touchRatio;
            if (s.rtl) diff = -diff;
        
            s.swipeDirection = diff > 0 ? 'prev' : 'next';
            currentTranslate = diff + startTranslate;
        
            var disableParentSwiper = true;
            if ((diff > 0 && currentTranslate > s.minTranslate())) {
                disableParentSwiper = false;
                if (s.params.resistance) currentTranslate = s.minTranslate() - 1 + Math.pow(-s.minTranslate() + startTranslate + diff, s.params.resistanceRatio);
            }
            else if (diff < 0 && currentTranslate < s.maxTranslate()) {
                disableParentSwiper = false;
                if (s.params.resistance) currentTranslate = s.maxTranslate() + 1 - Math.pow(s.maxTranslate() - startTranslate - diff, s.params.resistanceRatio);
            }
            
            if (disableParentSwiper) {
                e.preventedByNestedSwiper = true;
            }
        
            // Directions locks
            if (!s.params.allowSwipeToNext && s.swipeDirection === 'next' && currentTranslate < startTranslate) {
                currentTranslate = startTranslate;
            }
            if (!s.params.allowSwipeToPrev && s.swipeDirection === 'prev' && currentTranslate > startTranslate) {
                currentTranslate = startTranslate;
            }
            
            if (!s.params.followFinger) return;
        
            // Threshold
            if (s.params.threshold > 0) {
                if (Math.abs(diff) > s.params.threshold || allowThresholdMove) {
                    if (!allowThresholdMove) {
                        allowThresholdMove = true;
                        s.touches.startX = s.touches.currentX;
                        s.touches.startY = s.touches.currentY;
                        currentTranslate = startTranslate;
                        s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
                        return;
                    }
                }
                else {
                    currentTranslate = startTranslate;
                    return;
                }
            }
            // Update active index in free mode
            if (s.params.freeMode || s.params.watchSlidesProgress) {
                s.updateActiveIndex();
            }
            if (s.params.freeMode) {
                //Velocity
                if (velocities.length === 0) {
                    velocities.push({
                        position: s.touches[isH() ? 'startX' : 'startY'],
                        time: touchStartTime
                    });
                }
                velocities.push({
                    position: s.touches[isH() ? 'currentX' : 'currentY'],
                    time: (new Date()).getTime()
                });
            }
            // Update progress
            s.updateProgress(currentTranslate);
            // Update translate
            s.setWrapperTranslate(currentTranslate);
        };
        s.onTouchEnd = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            if (s.params.onTouchEnd) s.params.onTouchEnd(s, e);
            if (!isTouched) return;
        
            //Return Grab Cursor
            if (s.params.grabCursor && isMoved && isTouched) {
                s.container[0].style.cursor = 'move';
                s.container[0].style.cursor = '-webkit-grab';
                s.container[0].style.cursor = '-moz-grab';
                s.container[0].style.cursor = 'grab';
            }
        
            // Time diff
            var touchEndTime = Date.now();
            var timeDiff = touchEndTime - touchStartTime;
        
            // Tap, doubleTap, Click
            if (s.allowClick) {
                s.updateClickedSlide(e);
                if (s.params.onTap) s.params.onTap(s, e);
                if (timeDiff < 300 && (touchEndTime - lastClickTime) > 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    clickTimeout = setTimeout(function () {
                        if (!s) return;
                        if (s.params.paginationHide && s.paginationContainer.length > 0 && !$(e.target).hasClass(s.params.bulletClass)) {
                            s.paginationContainer.toggleClass(s.params.paginationHiddenClass);
                        }
                        if (s.params.onClick) s.params.onClick(s, e);
                    }, 300);
                    
                }
                if (timeDiff < 300 && (touchEndTime - lastClickTime) < 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    if (s.params.onDoubleTap) {
                        s.params.onDoubleTap(s, e);
                    }
                }
            }
        
            lastClickTime = Date.now();
            setTimeout(function () {
                if (s && s.allowClick) s.allowClick = true;
            }, 0);
        
            if (!isTouched || !isMoved || !s.swipeDirection || s.touches.diff === 0 || currentTranslate === startTranslate) {
                isTouched = isMoved = false;
                return;
            }
            isTouched = isMoved = false;
        
            var currentPos;
            if (s.params.followFinger) {
                currentPos = s.rtl ? s.translate : -s.translate;
            }
            else {
                currentPos = -currentTranslate;
            }
            if (s.params.freeMode) {
                if (currentPos < -s.minTranslate()) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                else if (currentPos > -s.maxTranslate()) {
                    s.slideTo(s.slides.length - 1);
                    return;
                }
                
                if (s.params.freeModeMomentum) {
                    if (velocities.length > 1) {
                        var lastMoveEvent = velocities.pop(), velocityEvent = velocities.pop();
        
                        var distance = lastMoveEvent.position - velocityEvent.position;
                        var time = lastMoveEvent.time - velocityEvent.time;
                        s.velocity = distance / time;
                        s.velocity = s.velocity / 2;
                        if (Math.abs(s.velocity) < 0.02) {
                            s.velocity = 0;
                        }
                        // this implies that the user stopped moving a finger then released.
                        // There would be no events with distance zero, so the last event is stale.
                        if (time > 150 || (new Date().getTime() - lastMoveEvent.time) > 300) {
                            s.velocity = 0;
                        }
                    } else {
                        s.velocity = 0;
                    }
        
                    velocities.length = 0;
                    var momentumDuration = 1000 * s.params.freeModeMomentumRatio;
                    var momentumDistance = s.velocity * momentumDuration;
        
                    var newPosition = s.translate + momentumDistance;
                    if (s.rtl) newPosition = - newPosition;
                    var doBounce = false;
                    var afterBouncePosition;
                    var bounceAmount = Math.abs(s.velocity) * 20 * s.params.freeModeMomentumBounceRatio;
                    if (newPosition < s.maxTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition + s.maxTranslate() < -bounceAmount) {
                                newPosition = s.maxTranslate() - bounceAmount;
                            }
                            afterBouncePosition = s.maxTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        }
                        else {
                            newPosition = s.maxTranslate();
                        }
                    }
                    if (newPosition > s.minTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition - s.minTranslate() > bounceAmount) {
                                newPosition = s.minTranslate() + bounceAmount;
                            }
                            afterBouncePosition = s.minTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        }
                        else {
                            newPosition = s.minTranslate();
                        }
                    }
                    //Fix duration
                    if (s.velocity !== 0) {
                        if (s.rtl) {
                            momentumDuration = Math.abs((-newPosition - s.translate) / s.velocity);
                        }
                        else {
                            momentumDuration = Math.abs((newPosition - s.translate) / s.velocity);
                        }
                    }
        
                    if (s.params.freeModeMomentumBounce && doBounce) {
                        s.updateProgress(afterBouncePosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        s.animating = true;
                        s.wrapper.transitionEnd(function () {
                            if (!s || !allowMomentumBounce) return;
                            if (s.params.onMomentumBounce) s.params.onMomentumBounce(s);
        
                            s.setWrapperTransition(s.params.speed);
                            s.setWrapperTranslate(afterBouncePosition);
                            s.wrapper.transitionEnd(function () {
                                s.onTransitionEnd();
                            });
                        });
                    } else if (s.velocity) {
                        s.updateProgress(newPosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        if (!s.animating) {
                            s.animating = true;
                            s.wrapper.transitionEnd(function () {
                                s.onTransitionEnd();
                            });
                        }
                            
                    } else {
                        s.updateProgress(newPosition);
                    }
                    
                    s.updateActiveIndex();
                }
                if (!s.params.freeModeMomentum || timeDiff >= s.params.longSwipesMs) {
                    s.updateProgress();
                    s.updateActiveIndex();
                }
                return;
            }
        
            // Find current slide
            var i, stopIndex = 0, groupSize = s.slidesSizesGrid[0];
            for (i = 0; i < s.slidesGrid.length; i += s.params.slidesPerGroup) {
                if (typeof s.slidesGrid[i + s.params.slidesPerGroup] !== 'undefined') {
                    if (currentPos >= s.slidesGrid[i] && currentPos < s.slidesGrid[i + s.params.slidesPerGroup]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[i + s.params.slidesPerGroup] - s.slidesGrid[i];
                    }
                }
                else {
                    if (currentPos >= s.slidesGrid[i]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[s.slidesGrid.length - 1] - s.slidesGrid[s.slidesGrid.length - 2];
                    }
                }
            }
        
            // Find current slide size
            var ratio = (currentPos - s.slidesGrid[stopIndex]) / groupSize;
            
            if (timeDiff > s.params.longSwipesMs) {
                // Long touches
                if (!s.params.longSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    if (ratio >= s.params.longSwipesRatio) s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);
        
                }
                if (s.swipeDirection === 'prev') {
                    if (ratio > (1 - s.params.longSwipesRatio)) s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);
                }
            }
            else {
                // Short swipes
                if (!s.params.shortSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    s.slideTo(stopIndex + s.params.slidesPerGroup);
        
                }
                if (s.swipeDirection === 'prev') {
                    s.slideTo(stopIndex);
                }
            }
        };
        /*=========================
          Transitions
          ===========================*/
        s._slideTo = function (slideIndex, speed) {
            return s.slideTo(slideIndex, speed, true, true);
        };
        s.slideTo = function (slideIndex, speed, runCallbacks, internal) {
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (typeof slideIndex === 'undefined') slideIndex = 0;
            if (slideIndex < 0) slideIndex = 0;
            s.snapIndex = Math.floor(slideIndex / s.params.slidesPerGroup);
            if (s.snapIndex >= s.snapGrid.length) s.snapIndex = s.snapGrid.length - 1;
            
            var translate = - s.snapGrid[s.snapIndex];
        
            // Stop autoplay
        
            if (s.params.autoplay && s.autoplaying) {
                if (internal || !s.params.autoplayDisableOnInteraction) {
                    s.pauseAutoplay(speed);
                }
                else {
                    s.stopAutoplay();
                }
            }
            // Update progress
            s.updateProgress(translate);
        
            // Normalize slideIndex
            for (var i = 0; i < s.slidesGrid.length; i++) {
                if (- translate >= s.slidesGrid[i]) {
                    slideIndex = i;
                }
            }
        
            if (typeof speed === 'undefined') speed = s.params.speed;
            s.previousIndex = s.activeIndex || 0;
            s.activeIndex = slideIndex;
            
            if (translate === s.translate) {
                s.updateClasses();
                return false;
            }
            s.onTransitionStart(runCallbacks);
            var translateX = isH() ? translate : 0, translateY = isH() ? 0 : translate;
            if (speed === 0) {
                s.setWrapperTransition(0);
                s.setWrapperTranslate(translate);
                s.onTransitionEnd(runCallbacks);
            }
            else {
                s.setWrapperTransition(speed);
                s.setWrapperTranslate(translate);
                if (!s.animating) {
                    s.animating = true;
                    s.wrapper.transitionEnd(function () {
                        s.onTransitionEnd(runCallbacks);
                    });
                }
                    
            }
            s.updateClasses();
            return true;
        };
        
        s.onTransitionStart = function (runCallbacks) {
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (runCallbacks) {
                if (s.params.onTransitionStart) s.params.onTransitionStart(s);
                if (s.params.onSlideChangeStart && s.activeIndex !== s.previousIndex) s.params.onSlideChangeStart(s);
            }
        };
        s.onTransitionEnd = function (runCallbacks) {
            s.animating = false;
            s.setWrapperTransition(0);
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (runCallbacks) {
                if (s.params.onTransitionEnd) s.params.onTransitionEnd(s);
                if (s.params.onSlideChangeEnd && s.activeIndex !== s.previousIndex) s.params.onSlideChangeEnd(s);
            }
                
        };
        s.slideNext = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return false;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
            }
            else return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
        };
        s._slideNext = function (speed) {
            return s.slideNext(true, speed, true);
        };
        s.slidePrev = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return false;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
            }
            else return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
        };
        s._slidePrev = function (speed) {
            return s.slidePrev(true, speed, true);
        };
        s.slideReset = function (runCallbacks, speed, internal) {
            return s.slideTo(s.activeIndex, speed, runCallbacks);
        };
        
        /*=========================
          Translate/transition helpers
          ===========================*/
        s.setWrapperTransition = function (duration, byController) {
            s.wrapper.transition(duration);
            if (s.params.onSetTransition) s.params.onSetTransition(s, duration);
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTransition(duration);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTransition(duration);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTransition(duration);
            }
            if (s.params.control && s.controller) {
                s.controller.setTransition(duration, byController);
            }
        };
        s.setWrapperTranslate = function (translate, updateActiveIndex, byController) {
            var x = 0, y = 0, z = 0;
            if (isH()) {
                x = s.rtl ? -translate : translate;
            }
            else {
                y = translate;
            }
            
            if (s.support.transforms3d) s.wrapper.transform('translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)');
            else s.wrapper.transform('translate(' + x + 'px, ' + y + 'px)');
            s.translate = isH() ? x : y;
            if (updateActiveIndex) s.updateActiveIndex();
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTranslate(s.translate);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTranslate(s.translate);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTranslate(s.translate);
            }
            if (s.params.control && s.controller) {
                s.controller.setTranslate(s.translate, byController);
            }
            if (s.params.hashnav && s.hashnav) {
                s.hashnav.setHash();
            }
            if (s.params.onSetTranslate) s.params.onSetTranslate(s, s.translate);
        };
        
        s.getTranslate = function (el, axis) {
            var matrix, curTransform, curStyle, transformMatrix;
        
            // automatic axis detection
            if (typeof axis === 'undefined') {
                axis = 'x';
            }
        
            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                // Some old versions of Webkit choke when 'none' is passed; pass
                // empty string instead in this case
                transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
            }
            else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                matrix = transformMatrix.toString().split(',');
            }
        
            if (axis === 'x') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m41;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[4]);
            }
            if (axis === 'y') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m42;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[5]);
            }
            if (s.rtl && curTransform) curTransform = -curTransform;
            return curTransform || 0;
        };
        s.getWrapperTranslate = function (axis) {
            if (typeof axis === 'undefined') {
                axis = isH() ? 'x' : 'y';
            }
            return s.getTranslate(s.wrapper[0], axis);
        };
        
        /*=========================
          Observer
          ===========================*/
        s.observers = [];
        function initObserver(target, options) {
            options = options || {};
            // create an observer instance
            var ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
            var observer = new ObserverFunc(function (mutations) {
                mutations.forEach(function (mutation) {
                    s.onResize();
                });
            });
             
            observer.observe(target, {
                attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
                childList: typeof options.childList === 'undefined' ? true : options.childList,
                characterData: typeof options.characterData === 'undefined' ? true : options.characterData
            });
        
            s.observers.push(observer);
        }
        s.initObservers = function () {
            if (s.params.observeParents) {
                var containerParents = s.container.parents();
                for (var i = 0; i < containerParents.length; i++) {
                    initObserver(containerParents[i]);
                }
            }
        
            // Observe container
            initObserver(s.container[0], {childList: false});
        
            // Observe wrapper
            initObserver(s.wrapper[0], {attributes: false});
        };
        s.disconnectObservers = function () {
            for (var i = 0; i < s.observers.length; i++) {
                s.observers[i].disconnect();
            }
            s.observers = [];
        };
        /*=========================
          Loop
          ===========================*/
        // Create looped slides
        s.createLoop = function () {
            // Remove duplicated slides
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
        
            var slides = s.wrapper.children('.' + s.params.slideClass);
            s.loopedSlides = parseInt(s.params.loopedSlides || s.params.slidesPerView, 10);
            s.loopedSlides = s.loopedSlides + s.params.loopAdditionalSlides;
            if (s.loopedSlides > slides.length) {
                s.loopedSlides = slides.length;
            }
        
            var prependSlides = [], appendSlides = [], i;
            slides.each(function (index, el) {
                var slide = $(this);
                if (index < s.loopedSlides) appendSlides.push(el);
                if (index < slides.length && index >= slides.length - s.loopedSlides) prependSlides.push(el);
                slide.attr('data-swiper-slide-index', index);
            });
            for (i = 0; i < appendSlides.length; i++) {
                s.wrapper.append($(appendSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
            for (i = prependSlides.length - 1; i >= 0; i--) {
                s.wrapper.prepend($(prependSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
        };
        s.destroyLoop = function () {
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
        };
        s.fixLoop = function () {
            var newIndex;
            //Fix For Negative Oversliding
            if (s.activeIndex < s.loopedSlides) {
                newIndex = s.slides.length - s.loopedSlides * 3 + s.activeIndex;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            }
            //Fix For Positive Oversliding
            else if ((s.params.slidesPerView === 'auto' && s.activeIndex >= s.loopedSlides * 2) || (s.activeIndex > s.slides.length - s.params.slidesPerView * 2)) {
                newIndex = -s.slides.length + s.activeIndex + s.loopedSlides;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            }
        };
        /*=========================
          Append/Prepend/Remove Slides
          ===========================*/
        s.appendSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.append(slides[i]);
                }
            }
            else {
                s.wrapper.append(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
        };
        s.prependSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            var newActiveIndex = s.activeIndex + 1;
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.prepend(slides[i]);
                }
                newActiveIndex = s.activeIndex + slides.length;
            }
            else {
                s.wrapper.prepend(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            s.slideTo(newActiveIndex, 0, false);
        };
        s.removeSlide = function (slidesIndexes) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            var newActiveIndex = s.activeIndex,
                indexToRemove;
            if (typeof slidesIndexes === 'object' && slidesIndexes.length) {
                for (var i = 0; i < slidesIndexes.length; i++) {
                    indexToRemove = slidesIndexes[i];
                    if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
                    if (indexToRemove < newActiveIndex) newActiveIndex--;
                }
                newActiveIndex = Math.max(newActiveIndex, 0);
            }
            else {
                indexToRemove = slidesIndexes;
                if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
                if (indexToRemove < newActiveIndex) newActiveIndex--;
                newActiveIndex = Math.max(newActiveIndex, 0);
            }
        
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            s.slideTo(newActiveIndex, 0, false);
        };
        s.removeAllSlides = function () {
            var slidesIndexes = [];
            for (var i = 0; i < s.slides.length; i++) {
                slidesIndexes.push(i);
            }
            s.removeSlide(slidesIndexes);
        };
        

        /*=========================
          Effects
          ===========================*/
        s.effects = {
            fade: {
                setTranslate: function () {
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var offset = slide[0].swiperSlideOffset;
                        var tx = -offset - s.translate;
                        var ty = 0;
                        if (!isH()) {
                            ty = tx;
                            tx = 0;
                        }
                        var slideOpacity = s.params.fade.crossFade ?
                                Math.max(1 - Math.abs(slide[0].progress), 0) :
                                1 + Math.min(Math.max(slide[0].progress, -1), 0);
                        slide
                            .css({
                                opacity: slideOpacity
                            })
                            .transform('translate3d(' + tx + 'px, ' + ty + 'px, 0px)');
        
                    }
                },
                setTransition: function (duration) {
                    s.slides.transition(duration);
                }
            },
            cube: {
                setTranslate: function () {
                    var wrapperRotate = 0, cubeShadow;
                    if (s.params.cube.shadow) {
                        if (isH()) {
                            cubeShadow = s.wrapper.find('.swiper-cube-shadow');
                            if (cubeShadow.length === 0) {
                                cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                                s.wrapper.append(cubeShadow);
                            }
                            cubeShadow.css({height: s.width + 'px'});
                        }
                        else {
                            cubeShadow = s.container.find('.swiper-cube-shadow');
                            if (cubeShadow.length === 0) {
                                cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                                s.container.append(cubeShadow);
                            }
                        }
                    }
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var slideAngle = i * 90;
                        var round = Math.floor(slideAngle / 360);
                        if (s.rtl) {
                            slideAngle = -slideAngle;
                            round = Math.floor(-slideAngle / 360);
                        }
                        var progress = Math.max(Math.min(slide[0].progress, 1), -1);
                        var tx = 0, ty = 0, tz = 0;
                        if (i % 4 === 0) {
                            tx = - round * 4 * s.size;
                            tz = 0;
                        }
                        else if ((i - 1) % 4 === 0) {
                            tx = 0;
                            tz = - round * 4 * s.size;
                        }
                        else if ((i - 2) % 4 === 0) {
                            tx = s.size + round * 4 * s.size;
                            tz = s.size;
                        }
                        else if ((i - 3) % 4 === 0) {
                            tx = - s.size;
                            tz = 3 * s.size + s.size * 4 * round;
                        }
                        if (s.rtl) {
                            tx = -tx;
                        }
                        
                        if (!isH()) {
                            ty = tx;
                            tx = 0;
                        }
                        
                        var transform = 'rotateX(' + (isH() ? 0 : -slideAngle) + 'deg) rotateY(' + (isH() ? slideAngle : 0) + 'deg) translate3d(' + tx + 'px, ' + ty + 'px, ' + tz + 'px)';
                        if (progress <= 1 && progress > -1) {
                            wrapperRotate = i * 90 + progress * 90;
                            if (s.rtl) wrapperRotate = -i * 90 - progress * 90;
                        }
                        slide.transform(transform);
                        if (s.params.cube.slideShadows) {
                            //Set shadows
                            var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                            var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                            if (shadowBefore.length === 0) {
                                shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                                slide.append(shadowAfter);
                            }
                            var shadowOpacity = slide[0].progress;
                            if (shadowBefore.length) shadowBefore[0].style.opacity = -slide[0].progress;
                            if (shadowAfter.length) shadowAfter[0].style.opacity = slide[0].progress;
                        }
                    }
                    s.wrapper.css({
                        '-webkit-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        '-moz-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        '-ms-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        'transform-origin': '50% 50% -' + (s.size / 2) + 'px'
                    });
                        
                    if (s.params.cube.shadow) {
                        if (isH()) {
                            cubeShadow.transform('translate3d(0px, ' + (s.width / 2 + s.params.cube.shadowOffset) + 'px, ' + (-s.width / 2) + 'px) rotateX(90deg) rotateZ(0deg) scale(' + (s.params.cube.shadowScale) + ')');
                        }
                        else {
                            var shadowAngle = Math.abs(wrapperRotate) - Math.floor(Math.abs(wrapperRotate) / 90) * 90;
                            var multiplier = 1.5 - (Math.sin(shadowAngle * 2 * Math.PI / 360) / 2 + Math.cos(shadowAngle * 2 * Math.PI / 360) / 2);
                            var scale1 = s.params.cube.shadowScale,
                                scale2 = s.params.cube.shadowScale / multiplier,
                                offset = s.params.cube.shadowOffset;
                            cubeShadow.transform('scale3d(' + scale1 + ', 1, ' + scale2 + ') translate3d(0px, ' + (s.height / 2 + offset) + 'px, ' + (-s.height / 2 / scale2) + 'px) rotateX(-90deg)');
                        }
                    }
                    var zFactor = (s.isSafari || s.isUiWebView) ? (-s.size / 2) : 0;
                    s.wrapper.transform('translate3d(0px,0,' + zFactor + 'px) rotateX(' + (isH() ? 0 : wrapperRotate) + 'deg) rotateY(' + (isH() ? -wrapperRotate : 0) + 'deg)');
                },
                setTransition: function (duration) {
                    s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
                    if (s.params.cube.shadow && !isH()) {
                        s.container.find('.swiper-cube-shadow').transition(duration);
                    }
                }
            },
            coverflow: {
                setTranslate: function () {
                    var transform = s.translate;
                    var center = isH() ? -transform + s.width / 2 : -transform + s.height / 2;
                    var rotate = isH() ? s.params.coverflow.rotate: -s.params.coverflow.rotate;
                    var translate = s.params.coverflow.depth;
                    //Each slide offset from center
                    for (var i = 0, length = s.slides.length; i < length; i++) {
                        var slide = s.slides.eq(i);
                        var slideSize = s.slidesSizesGrid[i];
                        var slideOffset = slide[0].swiperSlideOffset;
                        var offsetMultiplier = (center - slideOffset - slideSize / 2) / slideSize * s.params.coverflow.modifier;
        
                        var rotateY = isH() ? rotate * offsetMultiplier : 0;
                        var rotateX = isH() ? 0 : rotate * offsetMultiplier;
                        // var rotateZ = 0
                        var translateZ = -translate * Math.abs(offsetMultiplier);
        
                        var translateY = isH() ? 0 : s.params.coverflow.stretch * (offsetMultiplier);
                        var translateX = isH() ? s.params.coverflow.stretch * (offsetMultiplier) : 0;
        
                        //Fix for ultra small values
                        if (Math.abs(translateX) < 0.001) translateX = 0;
                        if (Math.abs(translateY) < 0.001) translateY = 0;
                        if (Math.abs(translateZ) < 0.001) translateZ = 0;
                        if (Math.abs(rotateY) < 0.001) rotateY = 0;
                        if (Math.abs(rotateX) < 0.001) rotateX = 0;
        
                        var slideTransform = 'translate3d(' + translateX + 'px,' + translateY + 'px,' + translateZ + 'px)  rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
        
                        slide.transform(slideTransform);
                        slide[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
                        if (s.params.coverflow.slideShadows) {
                            //Set shadows
                            var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                            var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                            if (shadowBefore.length === 0) {
                                shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                                slide.append(shadowAfter);
                            }
                            if (shadowBefore.length) shadowBefore[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
                            if (shadowAfter.length) shadowAfter[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0;
                        }
                    }
        
                    //Set correct perspective for IE10
                    if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
                        var ws = s.wrapper.style;
                        ws.perspectiveOrigin = center + 'px 50%';
                    }
                },
                setTransition: function (duration) {
                    s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
                }
            }
        };

        /*=========================
          Scrollbar
          ===========================*/
        s.scrollbar = {
            set: function () {
                if (!s.params.scrollbar) return;
                var sb = s.scrollbar;
                sb.track = $(s.params.scrollbar);
                sb.drag = sb.track.find('.swiper-scrollbar-drag');
                if (sb.drag.length === 0) {
                    sb.drag = $('<div class="swiper-scrollbar-drag"></div>');
                    sb.track.append(sb.drag);
                }
                sb.drag[0].style.width = '';
                sb.drag[0].style.height = '';
                sb.trackSize = isH() ? sb.track[0].offsetWidth : sb.track[0].offsetHeight;
                
                sb.divider = s.size / s.virtualWidth;
                sb.moveDivider = sb.divider * (sb.trackSize / s.size);
                sb.dragSize = sb.trackSize * sb.divider;
        
                if (isH()) {
                    sb.drag[0].style.width = sb.dragSize + 'px';
                }
                else {
                    sb.drag[0].style.height = sb.dragSize + 'px';
                }
        
                if (sb.divider >= 1) {
                    sb.track[0].style.display = 'none';
                }
                else {
                    sb.track[0].style.display = '';
                }
                if (s.params.scrollbarHide) {
                    sb.track[0].style.opacity = 0;
                }
            },
            setTranslate: function () {
                if (!s.params.scrollbar) return;
                var diff;
                var sb = s.scrollbar;
                var translate = s.translate || 0;
                var newPos;
                
                var newSize = sb.dragSize;
                newPos = (sb.trackSize - sb.dragSize) * s.progress;
                if (s.rtl && isH()) {
                    newPos = -newPos;
                    if (newPos > 0) {
                        newSize = sb.dragSize - newPos;
                        newPos = 0;
                    }
                    else if (-newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize + newPos;
                    }
                }
                else {
                    if (newPos < 0) {
                        newSize = sb.dragSize + newPos;
                        newPos = 0;
                    }
                    else if (newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize - newPos;
                    }
                }
                if (isH()) {
                    sb.drag.transform('translate3d(' + (newPos) + 'px, 0, 0)');
                    sb.drag[0].style.width = newSize + 'px';
                }
                else {
                    sb.drag.transform('translate3d(0px, ' + (newPos) + 'px, 0)');
                    sb.drag[0].style.height = newSize + 'px';
                }
                if (s.params.scrollbarHide) {
                    clearTimeout(sb.timeout);
                    sb.track[0].style.opacity = 1;
                    sb.timeout = setTimeout(function () {
                        sb.track[0].style.opacity = 0;
                        sb.track.transition(400);
                    }, 1000);
                }
            },
            setTransition: function (duration) {
                if (!s.params.scrollbar) return;
                s.scrollbar.drag.transition(duration);
            }
        };

        /*=========================
          Controller
          ===========================*/
        s.controller = {
            setTranslate: function (translate, byController) {
                var controlled = s.params.control;
                var multiplier, controlledTranslate;
                if (s.isArray(controlled)) {
                    for (var i = 0; i < controlled.length; i++) {
                        if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                            translate = controlled[i].rtl && controlled[i].params.direction === 'horizontal' ? -s.translate : s.translate;
                            multiplier = (controlled[i].maxTranslate() - controlled[i].minTranslate()) / (s.maxTranslate() - s.minTranslate());
                            controlledTranslate = (translate - s.minTranslate()) * multiplier + controlled[i].minTranslate();
                            if (s.params.controlInverse) {
                                controlledTranslate = controlled[i].maxTranslate() - controlledTranslate;
                            }
                            controlled[i].updateProgress(controlledTranslate);
                            controlled[i].setWrapperTranslate(controlledTranslate, false, s);
                            controlled[i].updateActiveIndex();
                        }
                    }
                }
                else if (controlled instanceof Swiper && byController !== controlled) {
                    translate = controlled.rtl && controlled.params.direction === 'horizontal' ? -s.translate : s.translate;
                    multiplier = (controlled.maxTranslate() - controlled.minTranslate()) / (s.maxTranslate() - s.minTranslate());
                    controlledTranslate = (translate - s.minTranslate()) * multiplier + controlled.minTranslate();
                    if (s.params.controlInverse) {
                        controlledTranslate = controlled.maxTranslate() - controlledTranslate;
                    }
                    controlled.updateProgress(controlledTranslate);
                    controlled.setWrapperTranslate(controlledTranslate, false, s);
                    controlled.updateActiveIndex();
                }
            },
            setTransition: function (duration, byController) {
                var controlled = s.params.control;
                if (s.isArray(controlled)) {
                    for (var i = 0; i < controlled.length; i++) {
                        if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                            controlled[i].setWrapperTransition(duration, s);
                        }
                    }
                }
                else if (controlled instanceof Swiper && byController !== controlled) {
                    controlled.setWrapperTransition(duration, s);
                }
            }
        };

        /*=========================
          Hash Navigation
          ===========================*/
        s.hashnav = {
            init: function () {
                if (!s.params.hashnav) return;
                s.hashnav.initialized = true;
                var hash = document.location.hash.replace('#', '');
                if (!hash) return;
                var speed = 0;
                for (var i = 0, length = s.slides.length; i < length; i++) {
                    var slide = s.slides.eq(i);
                    var slideHash = slide.attr('data-hash');
                    if (slideHash === hash && !slide.hasClass(s.params.slideDuplicateClass)) {
                        var index = slide.index();
                        s._slideTo(index, speed);
                    }
                }
            },
            setHash: function () {
                if (!s.hashnav.initialized || !s.params.hashnav) return;
                document.location.hash = s.slides.eq(s.activeIndex).attr('data-hash') || '';
            }
        };

        /*=========================
          Keyboard Control
          ===========================*/
        function handleKeyboard(e) {
            if (e.originalEvent) e = e.originalEvent; //jquery fix
            var kc = e.keyCode || e.charCode;
            if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
            if (document.activeElement && document.activeElement.nodeName && (document.activeElement.nodeName.toLowerCase() === 'input' || document.activeElement.nodeName.toLowerCase() === 'textarea')) {
                return false;
            }
            if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
                var inView = false;
                //Check that swiper should be inside of visible area of window
                if (s.container.parents('.swiper-slide').length > 0 && s.container.parents('.swiper-slide-active').length === 0) {
                    return;
                }
                var windowScroll = {
                    left: window.pageXOffset,
                    top: window.pageYOffset
                };
                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;
                var swiperOffset = s.container.offset();
                
                var swiperCoord = [
                    [swiperOffset.left, swiperOffset.top],
                    [swiperOffset.left + s.width, swiperOffset.top],
                    [swiperOffset.left, swiperOffset.top + s.height],
                    [swiperOffset.left + s.width, swiperOffset.top + s.height]
                ];
                for (var i = 0; i < swiperCoord.length; i++) {
                    var point = swiperCoord[i];
                    if (
                        point[0] >= windowScroll.left && point[0] <= windowScroll.left + windowWidth &&
                        point[1] >= windowScroll.top && point[1] <= windowScroll.top + windowHeight
                    ) {
                        inView = true;
                    }
        
                }
                if (!inView) return;
            }
            if (isH()) {
                if (kc === 37 || kc === 39) {
                    if (e.preventDefault) e.preventDefault();
                    else e.returnValue = false;
                }
                if (kc === 39) s.slideNext();
                if (kc === 37) s.slidePrev();
            }
            else {
                if (kc === 38 || kc === 40) {
                    if (e.preventDefault) e.preventDefault();
                    else e.returnValue = false;
                }
                if (kc === 40) s.slideNext();
                if (kc === 38) s.slidePrev();
            }
        }
        s.disableKeyboardControl = function () {
            $(document).off('keydown', handleKeyboard);
        };
        s.enableKeyboardControl = function () {
            $(document).on('keydown', handleKeyboard);
        };
        

        /*=========================
          Mousewheel Control
          ===========================*/
        s._wheelEvent = false;
        s._lastWheelScrollTime = (new Date()).getTime();
        if (s.params.mousewheelControl) {
            if (document.onmousewheel !== undefined) {
                s._wheelEvent = 'mousewheel';
            }
            if (!s._wheelEvent) {
                try {
                    new WheelEvent('wheel');
                    s._wheelEvent = 'wheel';
                } catch (e) {}
            }
            if (!s._wheelEvent) {
                s._wheelEvent = 'DOMMouseScroll';
            }
        }
        function handleMousewheel(e) {
            if (e.originalEvent) e = e.originalEvent; //jquery fix
            var we = s._wheelEvent;
            var delta = 0;
            //Opera & IE
            if (e.detail) delta = -e.detail;
            //WebKits
            else if (we === 'mousewheel') {
                if (s.params.mousewheelForceToAxis) {
                    if (isH()) {
                        if (Math.abs(e.wheelDeltaX) > Math.abs(e.wheelDeltaY)) delta = e.wheelDeltaX;
                        else return;
                    }
                    else {
                        if (Math.abs(e.wheelDeltaY) > Math.abs(e.wheelDeltaX)) delta = e.wheelDeltaY;
                        else return;
                    }
                }
                else {
                    delta = e.wheelDelta;
                }
            }
            //Old FireFox
            else if (we === 'DOMMouseScroll') delta = -e.detail;
            //New FireFox
            else if (we === 'wheel') {
                if (s.params.mousewheelForceToAxis) {
                    if (isH()) {
                        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) delta = -e.deltaX;
                        else return;
                    }
                    else {
                        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) delta = -e.deltaY;
                        else return;
                    }
                }
                else {
                    delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? - e.deltaX : - e.deltaY;
                }
            }
        
            if (!s.params.freeMode) {
                if ((new Date()).getTime() - s._lastWheelScrollTime > 60) {
                    if (delta < 0) s.slideNext();
                    else s.slidePrev();
                }
                s._lastWheelScrollTime = (new Date()).getTime();
        
            }
            else {
                //Freemode or scrollContainer:
                var position = s.getWrapperTranslate() + delta;
        
                if (position > 0) position = 0;
                if (position < s.maxTranslate()) position = s.maxTranslate();
        
                s.setWrapperTransition(0);
                s.setWrapperTranslate(position);
                s.updateProgress();
                s.updateActiveIndex();
        
                // Return page scroll on edge positions
                if (position === 0 || position === s.maxTranslate()) return;
            }
            if (s.params.autoplay) s.stopAutoplay();
        
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            return false;
        }
        s.disableMousewheelControl = function () {
            if (!s._wheelEvent) return false;
            s.container.off(s._wheelEvent, handleMousewheel);
            return true;
        };
        
        s.enableMousewheelControl = function () {
            if (!s._wheelEvent) return false;
            s.container.on(s._wheelEvent, handleMousewheel);
            return true;
        };

        /*=========================
          Parallax
          ===========================*/
        function setParallaxTransform(el, progress) {
            el = $(el);
            var p, pX, pY, tX, tY;
            
            p = el.attr('data-swiper-parallax');
            pX = el.attr('data-swiper-parallax-x');
            pY = el.attr('data-swiper-parallax-y');
            if (!pX && !pY && p) {
                if (isH()) {
                    pX = p;
                    pY = '0';
                }
                else {
                    pY = p;
                    pX = '0';
                }
            }
            else {
                if (pX) pX = pX;
                else pX = '0';
                if (pY) pY = pY;
                else pY = '0';
            }
            if ((pX).indexOf('%') >= 0) {
                pX = parseInt(pX, 10) * progress + '%';
            }
            else {
                pX = pX * progress + 'px' ;
            }
            if ((pY).indexOf('%') >= 0) {
                pY = parseInt(pY, 10) * progress + '%';
            }
            else {
                pY = pY * progress + 'px' ;
            }
            tX = pX;
            tY = pY;
        
            el.transform('translate3d(' + tX + ', ' + tY + ',0px)');
        }   
        s.parallax = {
            setTranslate: function () {
                s.container.children('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){
                    setParallaxTransform(this, s.progress);
                    
                });
                s.slides.each(function () {
                    var slide = $(this);
                    slide.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function () {
                        var progress = Math.min(Math.max(slide[0].progress, -1), 1);
                        setParallaxTransform(this, progress);
                    });
                });
            },
            setTransition: function (duration) {
                if (typeof duration === 'undefined') duration = s.params.speed;
                s.container.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){
                    var el = $(this);
                    var parallaxDuration = parseInt(el.attr('data-swiper-parallax-duration'), 10) || duration;
                    if (duration === 0) parallaxDuration = 0;
                    el.transition(parallaxDuration);
                });
            }
        };
            

        /*=========================
          Init/Destroy
          ===========================*/
        s.init = function () {
            if (s.params.loop) s.createLoop();
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                if (!s.params.loop) s.updateProgress();
                s.effects[s.params.effect].setTranslate();
            }
            if (s.params.loop) {
                s.slideTo(s.params.initialSlide + s.loopedSlides, 0, s.params.runCallbacksOnInit);
            }
            else {
                s.slideTo(s.params.initialSlide, 0, s.params.runCallbacksOnInit);
                if (s.params.initialSlide === 0 && s.parallax && s.params.parallax) {
                    s.parallax.setTranslate();               
                }
            }
            s.attachEvents();
            if (s.params.observer && s.support.observer) {
                s.initObservers();
            }
            if (s.params.updateOnImagesReady) {
                s.preloadImages();
            }
            if (s.params.autoplay) {
                s.startAutoplay();
            }
            if (s.params.keyboardControl) {
                if (s.enableKeyboardControl) s.enableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.enableMousewheelControl) s.enableMousewheelControl();
            }
            if (s.params.hashnav) {
                if (s.hashnav) s.hashnav.init();
            }
            if (s.params.onInit) s.params.onInit(s);
        };
        
        // Destroy
        s.destroy = function (deleteInstance) {
            s.detachEvents();
            s.disconnectObservers();
            if (s.params.keyboardControl) {
                if (s.disableKeyboardControl) s.disableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.disableMousewheelControl) s.disableMousewheelControl();
            }
            if (s.params.onDestroy) s.params.onDestroy();
            if (deleteInstance !== false) s = null;
        };
        
        s.init();
        
        

        
        // Return swiper instance
        return s;
    };
    

    /*==================================================
        Prototype
    ====================================================*/
    Swiper.prototype = {
        isSafari: (function () {
            var ua = navigator.userAgent.toLowerCase();
            return (ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0);
        })(),
        isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),
        isArray: function (arr) {
            return Object.prototype.toString.apply(arr) === '[object Array]';
        },
        /*==================================================
        Browser
        ====================================================*/
        browser: {
            ie: window.navigator.pointerEnabled || window.navigator.msPointerEnabled
        },
        /*==================================================
        Devices
        ====================================================*/
        device: (function () {
            var ua = navigator.userAgent;
            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
            var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
            var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
            return {
                ios: ipad || iphone || ipad,
                android: android
            };
        })(),
        /*==================================================
        Feature Detection
        ====================================================*/
        support: {
            touch : (window.Modernizr && Modernizr.touch === true) || (function () {
                return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
            })(),
    
            transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
                var div = document.createElement('div').style;
                return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
            })(),
    
            flexbox: (function () {
                var div = document.createElement('div').style;
                var styles = ('WebkitBox msFlexbox MsFlexbox WebkitFlex MozBox flex').split(' ');
                for (var i = 0; i < styles.length; i++) {
                    if (styles[i] in div) return true;
                }
            })(),
    
            observer: (function () {
                return ('MutationObserver' in window || 'WebkitMutationObserver' in window);
            })()
        }
    };
    

    /*===========================
    Dom7 Library
    ===========================*/
    var Dom7 = (function () {
        var Dom7 = function (arr) {
            var _this = this, i = 0;
            // Create array-like object
            for (i = 0; i < arr.length; i++) {
                _this[i] = arr[i];
            }
            _this.length = arr.length;
            // Return collection with methods
            return this;
        };
        var $ = function (selector, context) {
            var arr = [], i = 0;
            if (selector && !context) {
                if (selector instanceof Dom7) {
                    return selector;
                }
            }
            if (selector) {
                // String
                if (typeof selector === 'string') {
                    var els, tempParent, html = selector.trim();
                    if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
                        var toCreate = 'div';
                        if (html.indexOf('<li') === 0) toCreate = 'ul';
                        if (html.indexOf('<tr') === 0) toCreate = 'tbody';
                        if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) toCreate = 'tr';
                        if (html.indexOf('<tbody') === 0) toCreate = 'table';
                        if (html.indexOf('<option') === 0) toCreate = 'select';
                        tempParent = document.createElement(toCreate);
                        tempParent.innerHTML = selector;
                        for (i = 0; i < tempParent.childNodes.length; i++) {
                            arr.push(tempParent.childNodes[i]);
                        }
                    }
                    else {
                        if (!context && selector[0] === '#' && !selector.match(/[ .<>:~]/)) {
                            // Pure ID selector
                            els = [document.getElementById(selector.split('#')[1])];
                        }
                        else {
                            // Other selectors
                            els = (context || document).querySelectorAll(selector);
                        }
                        for (i = 0; i < els.length; i++) {
                            if (els[i]) arr.push(els[i]);
                        }
                    }
                }
                // Node/element
                else if (selector.nodeType || selector === window || selector === document) {
                    arr.push(selector);
                }
                //Array of elements or instance of Dom
                else if (selector.length > 0 && selector[0].nodeType) {
                    for (i = 0; i < selector.length; i++) {
                        arr.push(selector[i]);
                    }
                }
            }
            return new Dom7(arr);
        };
        Dom7.prototype = {
            // Classes and attriutes
            addClass: function (className) {
                if (typeof className === 'undefined') {
                    return this;
                }
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.add(classes[i]);
                    }
                }
                return this;
            },
            removeClass: function (className) {
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.remove(classes[i]);
                    }
                }
                return this;
            },
            hasClass: function (className) {
                if (!this[0]) return false;
                else return this[0].classList.contains(className);
            },
            toggleClass: function (className) {
                var classes = className.split(' ');
                for (var i = 0; i < classes.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        this[j].classList.toggle(classes[i]);
                    }
                }
                return this;
            },
            attr: function (attrs, value) {
                if (arguments.length === 1 && typeof attrs === 'string') {
                    // Get attr
                    if (this[0]) return this[0].getAttribute(attrs);
                    else return undefined;
                }
                else {
                    // Set attrs
                    for (var i = 0; i < this.length; i++) {
                        if (arguments.length === 2) {
                            // String
                            this[i].setAttribute(attrs, value);
                        }
                        else {
                            // Object
                            for (var attrName in attrs) {
                                this[i][attrName] = attrs[attrName];
                                this[i].setAttribute(attrName, attrs[attrName]);
                            }
                        }
                    }
                    return this;
                }
            },
            removeAttr: function (attr) {
                for (var i = 0; i < this.length; i++) {
                    this[i].removeAttribute(attr);
                }
            },
            data: function (key, value) {
                if (typeof value === 'undefined') {
                    // Get value
                    if (this[0]) {
                        var dataKey = this[0].getAttribute('data-' + key);
                        if (dataKey) return dataKey;
                        else if (this[0].dom7ElementDataStorage && (key in this[0].dom7ElementDataStorage)) return this[0].dom7ElementDataStorage[key];
                        else return undefined;
                    }
                    else return undefined;
                }
                else {
                    // Set value
                    for (var i = 0; i < this.length; i++) {
                        var el = this[i];
                        if (!el.dom7ElementDataStorage) el.dom7ElementDataStorage = {};
                        el.dom7ElementDataStorage[key] = value;
                    }
                    return this;
                }
            },
            // Transforms
            transform : function (transform) {
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
                }
                return this;
            },
            transition: function (duration) {
                if (typeof duration !== 'string') {
                    duration = duration + 'ms';
                }
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
                }
                return this;
            },
            //Events
            on: function (eventName, targetSelector, listener, capture) {
                function handleLiveEvent(e) {
                    var target = e.target;
                    if ($(target).is(targetSelector)) listener.call(target, e);
                    else {
                        var parents = $(target).parents();
                        for (var k = 0; k < parents.length; k++) {
                            if ($(parents[k]).is(targetSelector)) listener.call(parents[k], e);
                        }
                    }
                }
                var events = eventName.split(' ');
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof targetSelector === 'function' || targetSelector === false) {
                        // Usual events
                        if (typeof targetSelector === 'function') {
                            listener = arguments[1];
                            capture = arguments[2] || false;
                        }
                        for (j = 0; j < events.length; j++) {
                            this[i].addEventListener(events[j], listener, capture);
                        }
                    }
                    else {
                        //Live events
                        for (j = 0; j < events.length; j++) {
                            if (!this[i].dom7LiveListeners) this[i].dom7LiveListeners = [];
                            this[i].dom7LiveListeners.push({listener: listener, liveListener: handleLiveEvent});
                            this[i].addEventListener(events[j], handleLiveEvent, capture);
                        }
                    }
                }
    
                return this;
            },
            off: function (eventName, targetSelector, listener, capture) {
                var events = eventName.split(' ');
                for (var i = 0; i < events.length; i++) {
                    for (var j = 0; j < this.length; j++) {
                        if (typeof targetSelector === 'function' || targetSelector === false) {
                            // Usual events
                            if (typeof targetSelector === 'function') {
                                listener = arguments[1];
                                capture = arguments[2] || false;
                            }
                            this[j].removeEventListener(events[i], listener, capture);
                        }
                        else {
                            // Live event
                            if (this[j].dom7LiveListeners) {
                                for (var k = 0; k < this[j].dom7LiveListeners.length; k++) {
                                    if (this[j].dom7LiveListeners[k].listener === listener) {
                                        this[j].removeEventListener(events[i], this[j].dom7LiveListeners[k].liveListener, capture);
                                    }
                                }
                            }
                        }
                    }
                }
                return this;
            },
            once: function (eventName, targetSelector, listener, capture) {
                var dom = this;
                if (typeof targetSelector === 'function') {
                    targetSelector = false;
                    listener = arguments[1];
                    capture = arguments[2];
                }
                function proxy(e) {
                    listener(e);
                    dom.off(eventName, targetSelector, proxy, capture);
                }
                dom.on(eventName, targetSelector, proxy, capture);
            },
            trigger: function (eventName, eventData) {
                for (var i = 0; i < this.length; i++) {
                    var evt;
                    try {
                        evt = new CustomEvent(eventName, {detail: eventData, bubbles: true, cancelable: true});
                    }
                    catch (e) {
                        evt = document.createEvent('Event');
                        evt.initEvent(eventName, true, true);
                        evt.detail = eventData;
                    }
                    this[i].dispatchEvent(evt);
                }
                return this;
            },
            transitionEnd: function (callback) {
                var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
                    i, j, dom = this;
                function fireCallBack(e) {
                    if (e.target !== this) return;
                    callback.call(this, e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            },
            // Sizing/Styles
            width: function () {
                if (this[0] === window) {
                    return window.innerWidth;
                }
                else {
                    if (this.length > 0) {
                        return parseFloat(this.css('width'));
                    }
                    else {
                        return null;
                    }
                }
            },
            outerWidth: function (includeMargins) {
                if (this.length > 0) {
                    if (includeMargins)
                        return this[0].offsetWidth + parseFloat(this.css('margin-right')) + parseFloat(this.css('margin-left'));
                    else
                        return this[0].offsetWidth;
                }
                else return null;
            },
            height: function () {
                if (this[0] === window) {
                    return window.innerHeight;
                }
                else {
                    if (this.length > 0) {
                        return parseFloat(this.css('height'));
                    }
                    else {
                        return null;
                    }
                }
            },
            outerHeight: function (includeMargins) {
                if (this.length > 0) {
                    if (includeMargins)
                        return this[0].offsetHeight + parseFloat(this.css('margin-top')) + parseFloat(this.css('margin-bottom'));
                    else
                        return this[0].offsetHeight;
                }
                else return null;
            },
            offset: function () {
                if (this.length > 0) {
                    var el = this[0];
                    var box = el.getBoundingClientRect();
                    var body = document.body;
                    var clientTop  = el.clientTop  || body.clientTop  || 0;
                    var clientLeft = el.clientLeft || body.clientLeft || 0;
                    var scrollTop  = window.pageYOffset || el.scrollTop;
                    var scrollLeft = window.pageXOffset || el.scrollLeft;
                    return {
                        top: box.top  + scrollTop  - clientTop,
                        left: box.left + scrollLeft - clientLeft
                    };
                }
                else {
                    return null;
                }
            },
            css: function (props, value) {
                var i;
                if (arguments.length === 1) {
                    if (typeof props === 'string') {
                        if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
                    }
                    else {
                        for (i = 0; i < this.length; i++) {
                            for (var prop in props) {
                                this[i].style[prop] = props[prop];
                            }
                        }
                        return this;
                    }
                }
                if (arguments.length === 2 && typeof props === 'string') {
                    for (i = 0; i < this.length; i++) {
                        this[i].style[props] = value;
                    }
                    return this;
                }
                return this;
            },
            
            //Dom manipulation
            each: function (callback) {
                for (var i = 0; i < this.length; i++) {
                    callback.call(this[i], i, this[i]);
                }
                return this;
            },
            html: function (html) {
                if (typeof html === 'undefined') {
                    return this[0] ? this[0].innerHTML : undefined;
                }
                else {
                    for (var i = 0; i < this.length; i++) {
                        this[i].innerHTML = html;
                    }
                    return this;
                }
            },
            is: function (selector) {
                if (!this[0]) return false;
                var compareWith, i;
                if (typeof selector === 'string') {
                    var el = this[0];
                    if (el === document) return selector === document;
                    if (el === window) return selector === window;
    
                    if (el.matches) return el.matches(selector);
                    else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
                    else if (el.mozMatchesSelector) return el.mozMatchesSelector(selector);
                    else if (el.msMatchesSelector) return el.msMatchesSelector(selector);
                    else {
                        compareWith = $(selector);
                        for (i = 0; i < compareWith.length; i++) {
                            if (compareWith[i] === this[0]) return true;
                        }
                        return false;
                    }
                }
                else if (selector === document) return this[0] === document;
                else if (selector === window) return this[0] === window;
                else {
                    if (selector.nodeType || selector instanceof Dom7) {
                        compareWith = selector.nodeType ? [selector] : selector;
                        for (i = 0; i < compareWith.length; i++) {
                            if (compareWith[i] === this[0]) return true;
                        }
                        return false;
                    }
                    return false;
                }
                
            },
            index: function () {
                if (this[0]) {
                    var child = this[0];
                    var i = 0;
                    while ((child = child.previousSibling) !== null) {
                        if (child.nodeType === 1) i++;
                    }
                    return i;
                }
                else return undefined;
            },
            eq: function (index) {
                if (typeof index === 'undefined') return this;
                var length = this.length;
                var returnIndex;
                if (index > length - 1) {
                    return new Dom7([]);
                }
                if (index < 0) {
                    returnIndex = length + index;
                    if (returnIndex < 0) return new Dom7([]);
                    else return new Dom7([this[returnIndex]]);
                }
                return new Dom7([this[index]]);
            },
            append: function (newChild) {
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof newChild === 'string') {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newChild;
                        while (tempDiv.firstChild) {
                            this[i].appendChild(tempDiv.firstChild);
                        }
                    }
                    else if (newChild instanceof Dom7) {
                        for (j = 0; j < newChild.length; j++) {
                            this[i].appendChild(newChild[j]);
                        }
                    }
                    else {
                        this[i].appendChild(newChild);
                    }
                }
                return this;
            },
            prepend: function (newChild) {
                var i, j;
                for (i = 0; i < this.length; i++) {
                    if (typeof newChild === 'string') {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newChild;
                        for (j = tempDiv.childNodes.length - 1; j >= 0; j--) {
                            this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
                        }
                        // this[i].insertAdjacentHTML('afterbegin', newChild);
                    }
                    else if (newChild instanceof Dom7) {
                        for (j = 0; j < newChild.length; j++) {
                            this[i].insertBefore(newChild[j], this[i].childNodes[0]);
                        }
                    }
                    else {
                        this[i].insertBefore(newChild, this[i].childNodes[0]);
                    }
                }
                return this;
            },
            insertBefore: function (selector) {
                var before = $(selector);
                for (var i = 0; i < this.length; i++) {
                    if (before.length === 1) {
                        before[0].parentNode.insertBefore(this[i], before[0]);
                    }
                    else if (before.length > 1) {
                        for (var j = 0; j < before.length; j++) {
                            before[j].parentNode.insertBefore(this[i].cloneNode(true), before[j]);
                        }
                    }
                }
            },
            insertAfter: function (selector) {
                var after = $(selector);
                for (var i = 0; i < this.length; i++) {
                    if (after.length === 1) {
                        after[0].parentNode.insertBefore(this[i], after[0].nextSibling);
                    }
                    else if (after.length > 1) {
                        for (var j = 0; j < after.length; j++) {
                            after[j].parentNode.insertBefore(this[i].cloneNode(true), after[j].nextSibling);
                        }
                    }
                }
            },
            next: function (selector) {
                if (this.length > 0) {
                    if (selector) {
                        if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) return new Dom7([this[0].nextElementSibling]);
                        else return new Dom7([]);
                    }
                    else {
                        if (this[0].nextElementSibling) return new Dom7([this[0].nextElementSibling]);
                        else return new Dom7([]);
                    }
                }
                else return new Dom7([]);
            },
            nextAll: function (selector) {
                var nextEls = [];
                var el = this[0];
                if (!el) return new Dom7([]);
                while (el.nextElementSibling) {
                    var next = el.nextElementSibling;
                    if (selector) {
                        if($(next).is(selector)) nextEls.push(next);
                    }
                    else nextEls.push(next);
                    el = next;
                }
                return new Dom7(nextEls);
            },
            prev: function (selector) {
                if (this.length > 0) {
                    if (selector) {
                        if (this[0].previousElementSibling && $(this[0].previousElementSibling).is(selector)) return new Dom7([this[0].previousElementSibling]);
                        else return new Dom7([]);
                    }
                    else {
                        if (this[0].previousElementSibling) return new Dom7([this[0].previousElementSibling]);
                        else return new Dom7([]);
                    }
                }
                else return new Dom7([]);
            },
            prevAll: function (selector) {
                var prevEls = [];
                var el = this[0];
                if (!el) return new Dom7([]);
                while (el.previousElementSibling) {
                    var prev = el.previousElementSibling;
                    if (selector) {
                        if($(prev).is(selector)) prevEls.push(prev);
                    }
                    else prevEls.push(prev);
                    el = prev;
                }
                return new Dom7(prevEls);
            },
            parent: function (selector) {
                var parents = [];
                for (var i = 0; i < this.length; i++) {
                    if (selector) {
                        if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
                    }
                    else {
                        parents.push(this[i].parentNode);
                    }
                }
                return $($.unique(parents));
            },
            parents: function (selector) {
                var parents = [];
                for (var i = 0; i < this.length; i++) {
                    var parent = this[i].parentNode;
                    while (parent) {
                        if (selector) {
                            if ($(parent).is(selector)) parents.push(parent);
                        }
                        else {
                            parents.push(parent);
                        }
                        parent = parent.parentNode;
                    }
                }
                return $($.unique(parents));
            },
            find : function (selector) {
                var foundElements = [];
                for (var i = 0; i < this.length; i++) {
                    var found = this[i].querySelectorAll(selector);
                    for (var j = 0; j < found.length; j++) {
                        foundElements.push(found[j]);
                    }
                }
                return new Dom7(foundElements);
            },
            children: function (selector) {
                var children = [];
                for (var i = 0; i < this.length; i++) {
                    var childNodes = this[i].childNodes;
    
                    for (var j = 0; j < childNodes.length; j++) {
                        if (!selector) {
                            if (childNodes[j].nodeType === 1) children.push(childNodes[j]);
                        }
                        else {
                            if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector)) children.push(childNodes[j]);
                        }
                    }
                }
                return new Dom7($.unique(children));
            },
            remove: function () {
                for (var i = 0; i < this.length; i++) {
                    if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
                }
                return this;
            },
            add: function () {
                var dom = this;
                var i, j;
                for (i = 0; i < arguments.length; i++) {
                    var toAdd = $(arguments[i]);
                    for (j = 0; j < toAdd.length; j++) {
                        dom[dom.length] = toAdd[j];
                        dom.length++;
                    }
                }
                return dom;
            }
        };
        $.fn = Dom7.prototype;
        $.unique = function (arr) {
            var unique = [];
            for (var i = 0; i < arr.length; i++) {
                if (unique.indexOf(arr[i]) === -1) unique.push(arr[i]);
            }
            return unique;
        };
    
        return $;
    })();
    

    /*===========================
    Add .swiper plugin from Dom libraries
    ===========================*/
    var swiperDomPlugins = ['jQuery', 'Zepto', 'Dom7'];
    function addLibraryPlugin(lib) {
        lib.fn.swiper = function (params) {
            var firstInstance;
            lib(this).each(function () {
                var s = new Swiper(this, params);
                if (!firstInstance) firstInstance = s;
            });
            return firstInstance;
        };
    }
    for (var i = 0; i < swiperDomPlugins.length; i++) {
        if (window[swiperDomPlugins[i]]) {
            addLibraryPlugin(window[swiperDomPlugins[i]]);
        }
    }
    // Required DOM Plugins
    var domLib;
    if (typeof Dom7 === 'undefined') {
        domLib = window.Dom7 || window.Zepto || window.jQuery;
    }
    else {
        domLib = Dom7;
    }
    if (domLib) {
        if (!('transitionEnd' in domLib.fn)) {
            domLib.fn.transitionEnd = function (callback) {
                var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
                    i, j, dom = this;
                function fireCallBack(e) {
                    if (e.target !== this) return;
                    callback.call(this, e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            };
        }
        if (!('transform' in domLib.fn)) {
            domLib.fn.transform = function (transform) {
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
                }
                return this;
            };
        }
        if (!('transition' in domLib.fn)) {
            domLib.fn.transition = function (duration) {
                if (typeof duration !== 'string') {
                    duration = duration + 'ms';
                }
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
                }
                return this;
            };
        }
    }
        
    

})();
// jshint ignore: end
// jscs:enable

(function (w) {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxRichTextBox
	 * @module mx.components
	 * @restrict 'E'
	 * @scope {}
	 * @description Rich text box (WYSIWYG editor).
	 * @param {string} ng-model= - editing model as html.
	 * @param {boolean} advancedMode@ - (default: `true`) there are 2 modes: "simple" and "advanced".
	 *        For mobile-device it uses "simple" mode always, no metter the value.
	 *        If "advancedMode" set as `true` then for wide-screens will be used "advanced" mode.
	 *        If "advancedMode" set as `false` then for wide-screens will be used "simple" mode.
	 * @param {callback} on-focus& - fires of focus.
	 * @param {callback} on-blur& - fires of blur.
	 * @param {boolean} set-focus@  - if `true` then the focus will be set automatically.
	 * @usage <mx-rich-text-box nd-model="myHtml"></mx-rich-text-box>
	 */

	MxRichTextBoxCtrl.$inject = [
		'$scope',
		'$element',
		'$window',
		'mx.internationalization',
		'mxTinymceConfig',
		'uiTinymceConfig',
		'$timeout'
	];

	function MxRichTextBoxCtrl(
		$scope,
		$element,
		$window,
		internationalization,
		mxTinymceConfig,
		uiTinymceConfig,
		$timeout
	) {
		var vm = this;
		var editorInstace;

		/* default settings (should be moved to API)   start */
		var maxMobileDeviceWidth = 959;
		/* tablet-landscape */
		var isMobile = $window.matchMedia('(max-device-width: ' + maxMobileDeviceWidth + 'px)').matches ||
			$window.outerWidth <= maxMobileDeviceWidth;

		var useAdvancedMode = isMobile ?
			false :
			vm.advancedMode ? vm.advancedMode.toLowerCase() !== 'false' : true;

		vm.tinymceOptions = {
			menubar: false,
			statusbar: false,
			plugins: useAdvancedMode ? ['textcolor colorpicker textpattern paste link image'] : undefined,
			/* enables pasting images from clipboard */
			paste_data_images: !isMobile,
			/* prevents auto upload for images */
			automatic_uploads: false,
			/* prevents converting img src to blob */
			images_dataimg_filter: function (img) {
				return img.hasAttribute('internal-blob');
			},
			height: useAdvancedMode ? 300 : 115,
			min_height: 100,
			toolbar: useAdvancedMode ?
				'bold italic underline fontsizeselect link image alignleft aligncenter alignright alignjustify outdent indent bullist numlist' :
				'bold italic underline | bullist',
			toolbar_items_size: useAdvancedMode ? 'small' : 'normal',
			setup: function (editor) {
				editorInstace = editor;
				_handleDisabledMode(editor, vm._disabled);
				_handleReadonlyMode(editor, vm._readOnly);
				_handleFocus(editor, vm.setFocus);
				editor.on('init', function () {
					this.getDoc().body.style.fontSize = '14px';
					this.getDoc().body.style.lineHeight = '16px';
					$(this.getDoc().head).append('<style>p {margin: 5px 0px;}</style>');
					editor.on('focus', function (e) {
						$timeout(function () {
							vm.onFocus({event: e, editor: editor});
						});
					});
					editor.on('blur', function (e) {
						$timeout(function () {
							vm.onBlur({event: e, editor: editor});
						});
					});
				});
				editor.on('keypress', function (event) {
					if (this.getBody().getAttribute('contenteditable') === 'false') {
						event.preventDefault();
					}
				});
				if (!useAdvancedMode) {
					_putToolbarToBottom(editor);
				}
				if (mxTinymceConfig.baseUrl) {
					editorInstace.baseURL = mxTinymceConfig.baseUrl;
					uiTinymceConfig.baseUrl = mxTinymceConfig.baseUrl;
				}
			},
		};

		angular.extend(vm.tinymceOptions, mxTinymceConfig);

		/* default settings (should be moved to API)     end */

		$scope.$watch('vm.setFocus', function (newValue) {
			_handleFocus(editorInstace, newValue);
		});

		$scope.$watch('vm._disabled', function (newValue) {
			_handleDisabledMode(editorInstace, newValue);
		});

		$scope.$watch('vm._readOnly', function (newValue) {
			_handleReadonlyMode(editorInstace, newValue);
		});

		function _putToolbarToBottom(editor) {
			editor.on('init', function (evt) {
				var editorEl = $(evt.target.editorContainer);
				editorEl.addClass('mx-rich-text-box-toolbar-bottom-mode');
				var toolbar = editorEl.find('>.mce-container-body >.mce-toolbar-grp');
				var editor = editorEl.find('>.mce-container-body >.mce-edit-area');
				// switch the order of the elements
				toolbar.detach().insertAfter(editor);
			});
		}

		function _defineBoolValue(value) {
			return typeof value === 'boolean' ?
				value :
				typeof value === 'string' ? value.toLowerCase() !== 'false' : !!value;
		}

		function _handleFocus(editor, value) {
			var boolValue = _defineBoolValue(value);
			if (editor && boolValue) {
				$timeout(function () {
					editor.focus();
				}, 200);
			}
		}

		function _handleDisabledMode(editor, value) {
			var boolValue = _defineBoolValue(value);
			if (editor) {
				editor.settings.readonly = boolValue;
				editor.settings.disabled = boolValue;
				$($element).attr('disabled', boolValue);
			}
		}

		function _handleReadonlyMode(editor, value) {
			var boolValue = _defineBoolValue(value);
			if (editor) {
				editor.settings.readonly = boolValue;
				$($element).attr('readonly', boolValue);
			}
		}

		mx.components.FormControlControllerBase.call(this, internationalization);
		return vm;
	}

	angular.module('mx.components')
		.value('mxTinymceConfig', {})
		.directive('mxRichTextBox', function () {
			var directive = new mx.components.FormControlBase(
				MxRichTextBoxCtrl,
				'mx-rich-text-box/mx-rich-text-box.html'
			);
			angular.extend(directive.bindToController, {
				toolbar: '=',
				advancedMode: '@',
				onBlur: '&',
				onFocus: '&',
				setFocus: '@'
			});
			return directive;
		});

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.Forms = w.mx.components.Forms || {};

})(window);

(function () {
	'use strict';
	function mxRepeater() {

		MxRepeaterCtrl.$inject = ['$scope'];

		function MxRepeaterCtrl($scope) {
			var __$vm = this;
			__$vm.initScope = function () {
				if (__$vm.parentControllerAs) {
					$scope[__$vm.parentControllerAs] = $scope.$parent[__$vm.parentControllerAs];
				} else {
					$scope.dataModel = $scope.$parent;
				}
			};
		}

		return {
			restrict: 'E',
			scope: {
				entity: '=' /* object used in scopes of templates */
			},
			bindToController: {
				entities: '=',
				templateId: '@',
				parentControllerAs: '@'
			},
			templateUrl: 'mx-repeater/mx-repeater.html',
			controller: MxRepeaterCtrl,
			controllerAs: '__$vm'
		};
	}

	angular.module('mx.components').directive('mxRepeater', [mxRepeater]);
})();
(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxRating
	 * @module mx.components
	 * @restrict 'E'
	 * @scope {}
	 * @description Rating with stars directive
	 * @param {string} label@ - Text to be displayed with rating
	 * @param {int} max@ - Maximum value
	 * @param {int} value@ - Current value
	 * @param {boolean} disabled= - Specifies if control is disabled
	 * @usage <mx-rating label='Rate me' value='3' max='5'></mx-rating>
	 */
	angular.module('mx.components').directive('mxRating', MxRating);

	RatingController.$inject = ['$scope'];

	function RatingController($scope) {
		var vm = this;

		updateStars();

		if (!vm.max) {
			vm.max = 5;
		}
		vm._disabled = !!vm.disabled;

		vm.toggle = function (index) {
			if (vm._disabled !== true && vm.readOnly !== true) {
				vm.value = index + 1;
			}
		};

		$scope.$watch('vm.value', function (newValue) {
			if (newValue) {
				updateStars(newValue);
			}
		});

		function updateStars(newValue) {
			vm.stars = [];
			for (var i = 0; i < vm.max; i++) {
				vm.stars.push({
					filled: i < newValue
				});
			}
		}

		return vm;
	}

	function MxRating() {
		return {
			restrict: 'E',
			templateUrl: 'mx-rating/mx-rating.html',
			scope: {},
			controller: RatingController,
			controllerAs: 'vm',
			bindToController: {
				value: '=',
				max: '@',
				disabled: '=',
				label: '@',
				readOnly: '='
			}
		};
	}
})();

/**
 * Created by mabdurashidov on 2/21/2016.
 */

(function(w){
	'use strict';

	MxSelectCtrl.$inject = ['$timeout', '$q', '$element', '$scope','mx.internationalization'];
	function MxSelectCtrl($timeout, $q, $element, $scope, internationalization) {
		var vm = this;

		vm.getTrackingValue = getTrackingValue;
		vm.setFirstSelected = true;


		Object.defineProperty(vm, 'selectModel', {
			get: function () {
				return vm.model;
			},
			set: function (value) {
				vm.setModelInternal(value);
			}
		});


		function getTrackingValue(item) {
			return typeof item === 'object' ? vm.getId(item) : item;
		}

		mx.components.SinglePickerCtrl.call(this, $timeout, $q, $element, $scope, internationalization);
	}
	angular.module('mx.components').directive('mxSelect', function () {
		var directive = new mx.components.FormControlBase(MxSelectCtrl, 'mx-picker/mx-select.html');
		angular.extend(directive.bindToController, mx.components.BasePickerProperties);

		return directive;
	});

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.SelectCtrl = MxSelectCtrl;

})(window);

(function (w){
	'use strict';
	MxSinglePickerCtrl.$inject = ['$timeout', '$q', '$element', '$scope','mx.internationalization'];
	function MxSinglePickerCtrl($timeout, $q, $element, $scope, internationalization) {
		var vm = this;
		vm.single = true;

		mx.components.MultiPickerControllerBase.call(this, $timeout, $q, $element, $scope, internationalization);
	}
	angular.module('mx.components')
		/**
		 * @ngdoc directive
		 * @name mx.components:mxPicker
		 * @module mx.components
		 * @restrict 'E'
		 * @description
		 * The mx-picker control is used to create a picker where the user can select items.
		 *
		 * The example below demonstrates some of the attributes you may use with the Picker control:
		 * @param {string} name@ - The name property sets or returns the value of the name attribute of a mxPicker.
		 * @param {string} label@ - Defines control label displayed on the form.
		 * @param {boolean} required= - The required property sets or returns whether a mxPicker must be filled out before submitting a form.
		 * @param {boolean} disabled= - The disabled property sets or returns whether a mxPicker should be disabled, or not.
		 * @param {boolean} readOnly= - The readOnly property sets or returns whether the contents of a mxPicker should be read-only.
		 * @param {object} model=ngModel - directive binds element to the object in the model.
		 * @param {object[]} items= - The items property sets or returns items to be loaded for selection.
		 * @param {object} selectedItem= - Item to be selected.
		 * @param {string} itemTitleField@ - Specify field name to be displayed as picker item name
		 * @param {string} itemIdField@ - field name to be interpreted as ID
		 * @param {function(searchText:string): object} loadItems= - Callback function for loading
		 * available `items` which match the typed text. Returns the object has the following properties:
		 *
		 * - `items` – `{Array}` – Array of Items.
		 * - `searchText` – `{string}` – Keyword text for which `items` been found
		 * - `all` – `{boolean}` – Signals whether the all `items` been returns which fits the `searchText`.
		 * @param {boolean} loadOnTyping= - Reloads items on typing.
		 * @param {int} loadDelay= - Delay (ms) before data loading start
		 * @param {function(item:object)} navigateItem= - A callback Function which handles the selected Item navigation event. If the property is not defined
		 * the navigation logic is disabled.
		 * The function accepts the following parameters:
		 * - `item` – `{object}` – Item to navigate.
		 *
		 * @param {function(item:object):object} browseLookup= - A callback function which provides extended view for
		 * browsing available items. Returns a new selected item. In case `null` is returned, then the control selection is clean up.
		 * * If function returns `undefined` then the operation skipped.
		 *
		 * Parameters:
		 * - `item` – `{object}` – Control selected item. `null` if nothing selected.
		 *
		 * @param {string} dropdownHtmlClass@ - This will be applied to the dropdown menu for styling
		 *
		 * @usage <mx-picker data-items="vm.pickerData" ng-model="vm.pickerValue" ng-required="true" data-label="Classic, predfined items" value-as-id="true" data-item-title-field="'title'"> </mx-picker>
		 */
		.directive('mxPicker', function () {
			var directive = new mx.components.FormControlBase(MxSinglePickerCtrl, 'mx-picker/mx-multi-picker.html');
			angular.extend(directive.bindToController, mx.components.CommonPickerProperties);

			return directive;
		});

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.SinglePickerCtrl = MxSinglePickerCtrl;
})(window);

(function(w){
	'use strict';

	var basePickerProperties = {
		items: '=',
		itemIdField: '@',
		itemsIsPlainArray: '@',
		itemTitleField: '@',
		loadItems: '=',
		dropdownHtmlClass: '@',
		selectedItems: '='
	};

	var commonPickerProperties = angular.extend(
		basePickerProperties,
		{
			loadOnTyping: '@',
			loadDelay: '@',
			navigateItem: '=',
			browseLookup: '=',
			notFound: '=',
			itemDetailsField: '@'
		});

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.CommonPickerProperties = commonPickerProperties;
	w.mx.components.BasePickerProperties = basePickerProperties;
})(window);

(function(w){
	'use strict';

	var MxPickerControlControllerBase = function ($timeout, $q, $element, $scope, internationalization) {
		var vm = this;
		vm.internalSet = false;
		var _items = null;
		var _tempValue = null;
		var valueReset = false;
		var _isAutoTyping;

		vm.notFoundMessage =  vm.notFound ? vm.notFound.message : internationalization.get('components.mx-picker.defaultNotFoundMessage');

		vm.defaultPickerLabel = internationalization.get('components.mx-picker.defaultLabel');
		vm.itemsIsPlainArray = typeof vm.itemsIsPlainArray === 'string' ? (vm.itemsIsPlainArray || '').toLowerCase() === 'true' : vm.itemsIsPlainArray || false;
		vm.isLoading = false;
		vm.setModelInternal = setModelInternal;
		_setItemsValue(vm.items);

		Object.defineProperty(vm, 'items', {
			get: function () {
				return _items;
			},
			set: _setItemsValue
		});

		function _setItemsValue(value) {
			_items = value || [];
			vm.itemsIsPlainArray = _items.length > 0 ? typeof _items[0] !== 'object' : vm.itemsIsPlainArray;

			if (_items.length > 0) {
				if (vm.isLoading) {
					if (_tempValue !== null) {
						vm.isLoading = false;
						vm.model = _tempValue;
						_tempValue = null;
					} else {
						var found = false;

						if (vm.model !== null && vm.model !== undefined) {
							var modelId = vm.model;

							for (var i = 0; i < _items.length; i++) {
								if (vm.getId(_items[i]) === modelId) {
									found = true;
									break;
								}
							}
						}

						if (!found) {
							vm.setModelInternal(vm.setFirstSelected ? vm.getId(_items[0]): null);
						}
					}
				}
			}
		}

		vm.loadOnTyping = typeof vm.loadOnTyping !== 'undefined' && vm.loadOnTyping !== false;
		if (vm.loadOnTyping && !vm.loadDelay) {
			vm.loadDelay = 1000;
		}

		vm.itemTitleField = vm.itemTitleField || 'name';
		vm.itemIdField = vm.itemIdField || 'id';

		var loadedItemsSearchText = null;
		var loadedItemsCompletely = false;

		vm.label = vm.label || vm.defaultPickerLabel;

		if (vm.loadItems && !vm.loadOnTyping) {
			reload();
		}

		vm.getTitle = getTitle;
		vm.getId = getId;
		vm.autoCompleteSearch = autoCompleteSearch;
		vm.autoCompleteSearchText = null;
		vm.autoCompleteSelectedItemChange = autoCompleteSelectedItemChange;
		vm.autoCompleteSearchTextChange = autoCompleteSearchTextChange;
		vm.setNotFoundButtonAvailability = setNotFoundButtonAvailability;
		vm.resetItemsCache = resetItemsCache;
		vm.availableNotFoundButton = false;


		this.onValueChanging = function(value) {
			if (vm.internalSet) {
				return value;
			}

			if (value !== null && value !== undefined) {
				var valueArray = null;
				var throwError = false;
				if (typeof value === 'string' && !isNaN(value)) {
					value = Number(value);
				} else if(Array.isArray(value)) {
					if (value.length > 0 && typeof value[0] === 'object') {
						throwError = true;
					}
					valueArray = value;
				} else if (typeof value === 'object') {
					throwError = true;

				}
				if (throwError) {
					throw new Error('Picker control does not recognize assigned data type');
				}
				if (!valueArray) {
					valueArray = [value];
				}

				if (valueArray.length !== 0) {
					if (vm.loadOnTyping) {
						//try get Display Strings

						vm.setSelectedItems(_valuesToItems(valueArray));
						return value;
					}
					var items = vm.items;

					if (items && items.length > 0) {

						var selectedItems = [];
						for(var i = 0; i < items.length; i++) {
							if (valueArray.indexOf(vm.getId(items[i])) >= 0) {
								selectedItems.push(items[i]);

								if (selectedItems.length === valueArray.length) {
									break;
								}
							}
						}

						vm.setSelectedItems(selectedItems);
						return vm.selectedItemsToValue();
					} else if(vm.isLoading) {
						_tempValue = value;
						vm.setSelectedItems(Array.isArray(value) ? value : [value]);
						return value;
					}
				}
			}

			vm.setSelectedItems([]);
			return null;
		};

		vm.setNotFoundButtonAvailability();

		vm.notFoundClick = function() {
			if(vm.notFound && vm.notFound.buttonClick) {
				vm.notFound.buttonClick();
				vm.availableNotFoundButton = false;
				loadedItemsCompletely = false;
				loadedItemsSearchText = '';
				//reload items list
				vm.searchInput.focus();
			}

			return true;
		};

		function setNotFoundButtonAvailability(makeCall) {
			if (vm.notFound) {
				var isConfigured = typeof vm.notFound.buttonClick === 'function';
				if (!vm.availableNotFoundButton && isConfigured && makeCall) {
					vm.notFound.buttonClick(true);
				}
				vm.availableNotFoundButton = isConfigured;
			}
		}

		Object.defineProperty(vm, '_isTyping', {
			get: function () {
				return _isAutoTyping;
			},
			set: function (value) {
				_isAutoTyping = value;
				if(vm.TypingChanged) {
					vm.TypingChanged();
				}
			}
		});

		vm.searchInput = null;

		$timeout(function() {
			vm.searchInput = $element.find('input');
		});

		mx.components.FormControlControllerBase.call(this, internationalization, $timeout);

		return vm;

		function _valuesToItems(values) {
			var items = values.map(function(val) {
				var item = {};
				item[vm.itemIdField] = val;
				return item;
			});

			vm.loadItems(null, vm, items);
			return items;
		}

		function getId(item) {
			if (vm.itemsIsPlainArray) {
				return item;
			}
			if (!item) {
				return null;
			}
			return item[vm.itemIdField];
		}

		function getTitle(item) {
			if (vm.itemsIsPlainArray) {
				return item;
			}
			if (!item) {
				return null;
			}
			return item[vm.itemTitleField];
		}

		function setModelInternal(value) {
			vm.internalSet = true;
			vm.model = value;
			//if(value === null){
			//	vm.autoCompleteSearchText = null;
			//}
			vm.internalSet = false;
		}

		function reload() {
			var searchText = vm.autoCompleteSearchText ? vm.autoCompleteSearchText.toLowerCase() : '';
			if (loadedItemsSearchText && searchText.startsWith(loadedItemsSearchText) && (loadedItemsCompletely || searchText.length === loadedItemsSearchText.length)) {
				if (loadedItemsSearchText !== searchText) {
					vm.items = filterItemsByTitle(searchText);
				}
				return vm.items;
			}

			return reloadAsync(searchText).then(function (data) {
				loadedItemsSearchText = null;
				var items = [];
				if (Array.isArray(data)) {
					items = data;
				}
				else if (data && data.items) {
					items = data.items;
					loadedItemsSearchText = data.searchText;
					loadedItemsCompletely = data.all;
				}

				vm.items = filterSelectedItems(items);

				return vm.items;
			});
		}

		function filterSelectedItems(items) {
			if (vm.extraFilterSelectedItems) {
				items = vm.extraFilterSelectedItems(items);
			}
			return items;
		}

		function resetItemsCache() {
			loadedItemsSearchText = null;
			loadedItemsCompletely = false;
		}

		function reloadAsync(searchText) {
			vm.isLoading = true;
			return vm.loadItems(searchText, vm);
		}

		function autoCompleteSearch() {
			if (vm.loadOnTyping && vm.loadItems) {
				if (!vm.autoCompleteSearchText) {
					return [];
				}
				return reload();
			} else {
				return filterItemsByTitle(vm.autoCompleteSearchText);
			}
		}

		function filterItemsByTitle(query) {
			query = (query || '').toLowerCase();
			var filteredItems = query ? vm.items.filter(function (item) {
				return getTitle(item).toLowerCase().indexOf(query) !== -1;
			}) : vm.items;

			return filterSelectedItems(filteredItems);
		}

		function autoCompleteSelectedItemChange(item) {
			var itemValue = item ? getId(item) : null;
			if (itemValue !== vm.model) {
				if (!itemValue) {
					if (vm._isTyping) {
						valueReset = true;
						return;
					}
				}

				_setAutoCompleteValue(itemValue);
			} else if(item === undefined) {
				vm.autoCompleteSearchText = null;
			}

			valueReset = false;
		}

		function _setAutoCompleteValue(value) {
			if (vm.setAutoCompleteValue) {
				vm.internalSet = true;
				vm.setAutoCompleteValue(value);
				if (!value) {
					vm.autoCompleteSearchText = null;
				}
				vm.internalSet = false;
			}

		}

		function autoCompleteSearchTextChange() {
			if (typeof vm._isTyping === 'undefined') {
				vm._isTyping = true;

				vm.searchInput.on('focus', function() {
					vm._isTyping = true;
				});

				vm.searchInput.on('blur', function() {
					vm._isTyping = false;
					if (valueReset) {
						$timeout(function() {
							if (valueReset) {
								valueReset = false;
								_setAutoCompleteValue(null);
							}
						}, 500);
					}
					else {
						if (vm.autoCompleteSearchText && !vm.model) {
							$timeout(function() {
								if (!vm.model) {
									vm.autoCompleteSearchText = null;
								}
							}, 300);
						}
					}
				});
			}
		}
	};

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.PickerControlControllerBase = MxPickerControlControllerBase;

})(window);

(function (w){
	'use strict';
	/**
	 * @ngdoc directive
	 * @name mx.components:mxMultiPicker
	 * @module mx.components
	 * @restrict 'E'
	 * @description
	 * The mx-multi-picker control is used to create a picker where the user can select multiple items.
	 *
	 * The example below demonstrates some of the attributes you may use with the MultiPicker control:
	 * @param {string} name@ - The name property sets or returns the value of the name attribute.
	 * @param {string} label@ - Defines control label displayed on the form.
	 * @param {boolean} required= - The required property sets or returns whether a mxMultiPicker must be filled out before submitting a form.
	 * @param {boolean} disabled= - The disabled property sets or returns whether a mxMultiPicker should be disabled, or not.
	 * @param {boolean} readOnly= - The readOnly property sets or returns whether the contents of a mxPicker should be read-only.
	 * @param {object} model=ngModel - directive binds element to the object in the model.
	 * @param {object[]} items= - The items property sets or returns items to be loaded for selection.
	 * @param {string} itemTitleField@ - Specify field name to be displayed as picker item name
	 * @param {string} itemIdField@ - field name to be interpreted as ID
	 * @param {function(searchText:string): object} loadItems= - Callback function for loading
	 * available `items` which match the typed text. Returns the object has the following properties:
	 *
	 * - `items` – `{Array}` – Array of Items.
	 * - `searchText` – `{string}` – Keyword text for which `items` been found
	 * - `all` – `{boolean}` – Signals whether the all `items` been returns which fits the `searchText`.
	 * @param {boolean} loadOnTyping= - Reloads items on typing.
	 * @param {int} loadDelay= - Delay (ms) before data loading start
	 * @param {function(item:object)} navigateItem= - A callback Function which handles the selected Item navigation event. If the property is not defined
	 * the navigation logic is disabled.
	 * The function accepts the following parameters:
	 * - `item` – `{object}` – Item to navigate.
	 *
	 * @param {function(items:object[]):object[]} browseLookup= - A callback function which provides extended view for
	 * browsing available items. Returns an array of extra selected item. In case `null` is returned, then the control selection is clean up.
	 * If function returns `undefined` then the operation skipped.
	 * Parameters:
	 * - `items` – `{object[]}` – Array of currently selected items. `null` if nothing selected.
	 *
	 * @param {string} dropdownHtmlClass@ - This will be applied to the dropdown menu for styling
	 *
	 * @usage <mx-multi-picker class="mx-multi-picker-default" data-items="vm.pickerData" ng-model="vm.pickerValue" ng-required="true" data-label="Classic, predfined items" data-item-title-field="title"> </mx-multi-picker>
	 */
	angular.module('mx.components').directive('mxMultiPicker', function () {
		var directive = new mx.components.FormControlBase(MxMultiPickerCtrl, 'mx-picker/mx-multi-picker.html');
		angular.extend(directive.bindToController, mx.components.CommonPickerProperties);
		angular.extend(directive.bindToController,
			{
				separatorChar: '@'
			});
		return directive;
	});

	MxMultiPickerCtrl.$inject = ['$timeout', '$q', '$element', '$scope','mx.internationalization'];

	function MxMultiPickerCtrl($timeout, $q, $element, $scope, internationalization) {

		var vm = this;
		vm.single = false;

		mx.components.MultiPickerControllerBase.call(this, $timeout, $q, $element, $scope, internationalization);
	}

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.MultiPickerCtrl = MxMultiPickerCtrl;

})(window);

(function (w){
	'use strict';

	var MxMultiPickerControllerBase = function($timeout, $q, $element, $scope, internationalization) {
		var vm = this;
		vm.onNavigateItem = onNavigateItem;
		vm.onBrowseLookup = onBrowseLookup;
		vm.selectedItems = [];
		vm.extraFilterSelectedItems = extraFilterSelectedItems;
		vm.onSelectionChange = onSelectionChange;
		vm.selectedItemsToValue = selectedItemsToValue;
		vm.setSelectedItems = setSelectedItems;
		vm.getSelectedItemTitle = getSelectedItemTitle;
		vm.getItemDetails = getItemDetails;
		vm.itemsIsPlainArray = typeof vm.itemsIsPlainArray === 'string' ? (vm.itemsIsPlainArray || '').toLowerCase() === 'true' : vm.itemsIsPlainArray || false;

		function getItemDetails(item) {
			if (vm.itemDetailsField) {
				return item[vm.itemDetailsField];
			}
			return null;
		}

		vm.TypingChanged = function() {
			_setLabels();
		};

		_setLabels();

		mx.components.PickerControlControllerBase.call(this, $timeout, $q, $element, $scope, internationalization);

		function getSelectedItemTitle(item) {
			var name = vm.getTitle(item);

			if (vm.itemDetailsField) {
				var details = item[vm.itemDetailsField];
				if (details) {
					name += details;
				}
			}
			return name;
		}


		function extraFilterSelectedItems(items) {
			if (items.length > 0 && vm.selectedItems.length > 0) {
				var selectedIds = vm.selectedItems.map(function(item) {
					return vm.getId(item);
				});
				items = items.filter(function (item) {
					return selectedIds.indexOf(vm.getId(item)) < 0;
				});
			}
			return items;
		}

		function onBrowseLookup() {
			if (vm.browseLookup) {
				vm.browseLookup(vm.model).then(function(data) {
					if (data === null) {
						//clear selection
						vm.model = null;
					} else if(Array.isArray(data)) {
						var newItems = extraFilterSelectedItems(data);
						vm.model = vm.model ? vm.model.concat(newItems) : newItems;
					} else {
						vm.model = data;
					}
				});
			}
		}

		function onNavigateItem(item) {
			if (vm.navigateItem) {
				vm.navigateItem(item);
			}
		}

		function onSelectionChange() {
			vm.internalSet = true;
			vm.model = vm.selectedItemsToValue();
			_setLabels();

			vm.setNotFoundButtonAvailability(true);

			vm.internalSet = false;

			if(vm.model === null){
				if(vm.searchInput !== null){
					vm.searchInput.focus();
				}
			}
		}

		function _setLabels() {
			if (vm.selectedItems.length > 0 || vm._isTyping) {
				vm.controlLabel = vm.label;
				vm.autoPlaceholder = vm.defaultPickerLabel;
			} else {
				vm.controlLabel = null;
				vm.autoPlaceholder = vm.label;
			}
		}

		function selectedItemsToValue() {
			var len = vm.selectedItems.length;

			if (len === 0) {
				return null;
			}
			var res = null;

			if (vm.single) {
				if (len > 1) {
					vm.selectedItems = [vm.selectedItems[len - 1]];
				}
				res = vm.getId(vm.selectedItems[0]);

			} else {

				res = vm.selectedItems.map(function(item) {
					return vm.getId(item);
				});
				if (vm.separatorChar) {
					res = res.join(vm.separatorChar);
				}
			}

			return res;
		}

		function setSelectedItems(items) {
			vm.selectedItems = items;
			_setLabels();
		}
	};

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.MultiPickerControllerBase = MxMultiPickerControllerBase;
})(window);



(function (w) {
	'use strict';

	MxAutocompleteCtrl.$inject = ['$timeout', '$q', '$element', '$scope','mx.internationalization'];

	function MxAutocompleteCtrl($timeout, $q, $element, $scope, internationalization) {
		var vm = this;
		vm.selectedItem = vm.model;
		//var _selectedItem = vm.model;
		//Object.defineProperty(vm, 'selectedItem', {
		//	get: function () {
		//		return _selectedItem;
		//	},
		//	set: function(value){
		//		_selectedItem = value;
		//	}
		//});

		mx.components.SinglePickerCtrl.call(this, $timeout, $q, $element, $scope, internationalization);

		vm.setSelectedItems = setSelectedItems;
		vm.selectedItemsToValue = selectedItemsToValue;
		vm.setAutoCompleteValue = setAutoCompleteValue;

		function setAutoCompleteValue(value) {
			vm.model = value;
		}

		function setSelectedItems(items) {
			vm.selectedItem = items.length ? items[0] : null;
		}

		function selectedItemsToValue() {
			return vm.selectedItem ? vm.getId(vm.selectedItem) : null;
		}
	}

	angular.module('mx.components')	.directive('mxAutocomplete', function () {
		var directive = new mx.components.FormControlBase(MxAutocompleteCtrl, 'mx-picker/mx-autocomplete.html');
		angular.extend(directive.bindToController, mx.components.BasePickerProperties);
		directive.bindToController.loadOnTyping = '@';
		return directive;
	});

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.AutocompleteCtrl = MxAutocompleteCtrl;

})(window);

(function(w) {
	'use strict';

	MxNumericEditCtrl.$inject = ['mx.internationalization'];

	function MxNumericEditCtrl(internationalization) {
		mx.components.FormControlControllerBase.call(this, internationalization);
		var vm = this;
		vm.format = vm.format || mxNumericEditFormat.Integer;
		return vm;
	}

	angular.module('mx.components').directive('mxNumericEdit', function() {
		var directive = new mx.components.FormControlBase(MxNumericEditCtrl, 'mx-numeric-edit/mx-numeric-edit.html');
		angular.extend(directive.bindToController, {format: '@'});
		return directive;
	});

	var mxNumericEditFormat = {
		Integer: 'integer',
		Float: 'float'
	};

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.Forms = w.mx.components.Forms || {};
	w.mx.components.Forms.NumericEditFormat = mxNumericEditFormat;

})(window);

(function (w, a) {
	'use strict';

	function MxRegExpMask() {

		MxRegExpMaskImplementation.prototype = Object.create(mx.components.masks.Base.prototype);
		a.extend(MxRegExpMaskImplementation.prototype, {
			createFormatter: function () {
				return null;
			},
			createParser: function () {
				return null;
			}
		});

		function MxRegExpMaskImplementation() {
			mx.components.masks.Base.call(this);
		}

		//for cross-references
		w.mx.components.masks.RegExp = MxRegExpMaskImplementation;
		return new MxRegExpMaskImplementation(arguments);
	}

	w.mx = window.mx || {};
	w.mx.components = mx.components || {};
	w.mx.components.masks = mx.components.masks || {};
	w.mx.components.masks.RegExp = MxRegExpMask;
})(window, angular);

(function (w, a) {
	'use strict';

	function mxNumericMask() {

		MxNumericMaskImplementation.prototype = Object.create(mx.components.masks.Base.prototype);
		a.extend(MxNumericMaskImplementation.prototype, {
			createFormatter: function () {
				return function (value) {
					var prefix = value < 0 ? '-' : '';
					var valueToFormat = prepareNumberToFormatter(value, this.decimals);
					return prefix + this.viewMask.apply(valueToFormat);
				};
			},
			createParser: function (ngModel) {
				return function (value) {
					var valueToFormat = clearDelimitersAndLeadingZeros(value) || '0';
					var formatedValue = this.viewMask.apply(valueToFormat);
					var actualNumber = parseFloat(this.modelMask.apply(valueToFormat));
					var isNegative = value[0] === '-';
					var needsToInvertSign = value.slice(-1) === '-';

					//only apply the minus sign if it is negative or(exclusive) needs to be negative and the number is different from zero
					if (needsToInvertSign ? !isNegative : isNegative && !!actualNumber) {
						actualNumber *= -1;
						formatedValue = '-' + formatedValue;
					}

					var validity = true;
					if (this.mxMaskMin) {
						var min = parseFloat(this.mxMaskMin);
						validity = isNaN(min) || actualNumber >= min;
						if (!validity) {
							actualNumber = min;
						}
					}
					if (validity && this.mxMaskMax) {
						var max = parseFloat(this.mxMaskMax);
						validity = isNaN(max) || actualNumber <= max;
						if (!validity) {
							actualNumber = max;
						}
					}
					if (!validity) {
						var prefix = actualNumber < 0 ? '-' : '';
						formatedValue = prefix + this.viewMask.apply(actualNumber);
					}

					if (ngModel.$viewValue !== formatedValue) {
						ngModel.$setViewValue(formatedValue);
						ngModel.$render();
					}

					return actualNumber;
				};
			},
			initialize: function () {
				var i;
				var mask = '#' + mx.components.Utils.thousandsDelimiter + '##0';

				if (this.decimals > 0) {
					mask += mx.components.Utils.decimalSeparator;
					for (i = 0; i < this.decimals; i++) {
						mask += '0';
					}
				}
				this.viewMask = this.createMask(mask, {reverse: true});

				mask = '###0';

				if (this.decimals > 0) {
					mask += '.';
					for (i = 0; i < this.decimals; i++) {
						mask += '0';
					}
				}
				this.modelMask = this.createMask(mask, {reverse: true});
			}
		});

		function MxNumericMaskImplementation(decimals) {
			mx.components.masks.Base.call(this);
			this.decimals = decimals || 0;
			this.parseAttributes = ['mxMaskMin', 'mxMaskMax'];
		}

		function clearDelimitersAndLeadingZeros(value) {
			var cleanValue = value.replace(/^-/, '').replace(/^0*/, '');
			cleanValue = cleanValue.replace(/[^0-9]/g, '');
			return cleanValue;
		}

		function prepareNumberToFormatter(value, decimals) {
			return clearDelimitersAndLeadingZeros((parseFloat(value)).toFixed(decimals));
		}

		//for cross-references
		w.mx.components.masks.Numeric = MxNumericMaskImplementation;
		return new MxNumericMaskImplementation(arguments);
	}

	w.mx = window.mx || {};
	w.mx.components = mx.components || {};
	w.mx.components.masks = mx.components.masks || {};
	w.mx.components.masks.Numeric = mxNumericMask;
})(window, angular);

(function () {
	'use strict';

	angular.module('mx.components').directive('mxMask', ['$parse', 'mx.internationalization', function ($parse, internationalization) {

		return {
			restrict: 'A',
			require: ['?ngModel'],
			link: function (scope, element, attrs, ngModel) {
				if (!ngModel[0]) {
					throw new Error(internationalization.get('components.errors.mx_mask_without_ng_model'));
				}
				var modelCtrl = ngModel[0];
				var maskType = attrs.mxMask;
				var mask = null;
				switch (maskType) {
					case 'integer':
						mask = new mx.components.masks.Numeric();
						break;
					case 'float':
						mask = new mx.components.masks.Numeric(2);
						break;
					default:
						mask = new mx.components.masks.RegExp();
						break;
				}
				mask.link(scope, attrs, modelCtrl, $parse);
			}
		};
	}]);
})();

(function (w) {
	'use strict';

	function MxBaseMask() {
		this.parseAttributes = [];
	}

	MxBaseMask.prototype = {
		link: function (scope, attrs, ngModel, $parse) {
			var that = this;
			var formatter = that.createFormatter(ngModel);
			var parser = that.createParser(ngModel);
			if (formatter) {
				ngModel.$formatters.push(function (value) {
					if (ngModel.$isEmpty(value)) {
						return value;
					}
					return formatter.call(that, value);
				});
			}
			if (parser) {
				ngModel.$parsers.push(function (value) {
					if (ngModel.$isEmpty(value)) {
						return value;
					}
					return parser.call(that, value);
				});
			}

			this.parseAttributes.forEach(function (item) {
				if (attrs[item]) {
					that[item] = $parse(attrs[item])(scope);
				}
			});

			this.initialize();
		},
		createParser: function () {
			throw new Error('Mask. createParser method is not implemented');
		},
		createFormatter: function () {
			throw new Error('Mask. createFormatter method is not implemented');
		},
		initialize: function () {

		},
		createMask: function (pattern, options) {
			return new mx.components.Mask(pattern, options);
		}
	};

	w.mx = window.mx || {};
	w.mx.components = mx.components || {};
	w.mx.components.masks = mx.components.masks || {};
	w.mx.components.masks.Base = MxBaseMask;
})(window);

(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxList
	 * @module mx.components
	 * @restrict E
	 *
	 * @description
	 * Visualizes list data.
	 *
	 * The following example shows hot to use mxList.
	 * mxList expects that vm.myList is an array of objects with 'title' and 'description' keys in following example.
	 * Like this: [{'title': 'My title', 'description': 'Some text'}, ... ]
	 * ```html
	 * <mx-list list="vm.myList"></mx-list>
	 * ```
	 *
	 * If you need to use other keys like  [{'name': 'My title', 'about': 'Some text'}, ... ],
	 * it can be done next way:
	 * ```html
	 * <mx-list list="vm.myList" title-key='name' description-key='about'></mx-list>
	 * ```
	 *
	 * An `on-item-click` attribute allows to set handler for item-click event.
	 * ```html
	 * <mx-list list="vm.myList" on-item-click="vm.handeItemClick(item)"></mx-list>
	 * ```
	 *
	 * Attribute `highlight-On-Click` responsible for on click behaviour. If set to true clicked item will be highlighted(true by default).
	 * ```html
	 * <mx-list list="vm.myList" on-item-click="vm.handeItemClick(item)"></mx-list>
	 * ```
	 *
	 * To make possible select items, it can be done next way:
	 * ```html
	 * <mx-list list="vm.myList" use-checkboxes="true" selected-items="vm.mySelectedItems"></mx-list>
	 * ```
	 * If 'vm.mySelectedItems' array contains some item-objects from 'vm.myList' array on start - the mxList will mark those items as selected on UI.
	 * And vice versa: When items are selected on UI, they will be added into 'vm.mySelectedItems' array.
	 *
	 *
	 * It's possible to set actions for each item with help "item-actions" attribute.
	 * Expected data format the same as for <mx-dropdown /> directive.
	 *
	 * To switch to virtual mode use:
	 * ```html
	 * <mx-list list="vm.myList" virtual="true"></mx-list>
	 * ```
	 * Full support for virtual mode will be provided upon virtual repeat fix (https://github.com/angular/material/issues/4169).
	 **/

	MxListCtrl.$inject = ['$scope', '$element', '$timeout'];

	function MxListCtrl($scope, $element, $timeout) {
		var vm = this;
		vm._virtual = (vm.virtual || '').toLowerCase() === 'true';
		vm._useCheckboxes = (vm.useCheckboxes || '').toLowerCase() === 'true';
		vm._highlightOnClick = (vm.highlightOnClick || 'true').toLowerCase() === 'true';
		vm.handleSelection = handleSelection;
		vm.handleItemClick = handleItemClick;
		vm._titleKey = vm.titleKey || 'title';
		vm._descriptionKey = vm.descriptionKey || 'description';
		vm.selectedItems = vm.selectedItems || [];
		vm._showItemActions = !!$element.attr('get-item-actions') || !!$element.attr('data-get-item-actions');

		vm.initScope = function () {
			if (vm.parentControllerAs) {
				$scope[vm.parentControllerAs] = $scope.$parent[vm.parentControllerAs];
			} else {
				$scope.dataModel = $scope.$parent;
			}
		};

		vm._loading = true;
		vm.allowPaging = (typeof vm.allowPaging !== 'undefined' ? vm.allowPaging : '').toLowerCase() === 'true';
		vm.pageSize = +(vm.pageSize || 10);
		vm.pageNumber = +(vm.pageNumber || 0);

		initPaging();

		var currentItem = null;

		angular.forEach(vm.selectedItems, function (item) {
			item.__isSelected = true;
		});
		vm.resultList = [];

		reload();

		$scope.$watch('__$vm.list', function (newList, oldList) {
			if (newList !== oldList && Array.isArray(vm.selectedItems)) {
				initPaging();
				reload();
			}
		});

		return vm;

		function reload() {
			var previousSelectedItems = vm.selectedItems.slice(0);

			vm.selectedItems = [];

			var mapFn = function(item) {
				var mappedItem = {item: item, __visible: false, __highlighted: false, __isSelected: false};

				if (mappedItem.__isSelected) {
					vm.selectedItems.push(mappedItem);
				}
				return mappedItem;
			};

			vm.resultList = [];
			var resultList = [];
			if (vm.allowPaging) {
					var start = vm.paging.page * vm.paging.pageSize;
					var end = start + vm.paging.pageSize;
					resultList = (vm.list || []).filter(function(element, index){
						return index >= start && index < end;
					}).map(mapFn);

			} else {
				resultList = (vm.list || []).map(mapFn);
			}

			$timeout(function(){
				vm.resultList = resultList;
				vm._loading = false;
			});


			if (!mx.components.Utils.arraysEqual(previousSelectedItems, vm.selectedItems, function (a, b) {
					return a.item.id === b.item.id;
				})) {
				selectionChanged();
			}
		}

		function initPaging(){
			if (vm.allowPaging) {
				vm.paging = new PagingPreprocessor(vm.pageNumber, vm.pageSize, (vm.list || []).length, function () {
					reload();
				});
			}
		}
		function handleItemClick(listItem) {
			if (vm._highlightOnClick) {
				if (currentItem !== listItem) {
					if (currentItem) {
						currentItem.__highlighted = false;
					}
					currentItem = listItem;
					currentItem.__highlighted = true;
				}
			}

			vm.onItemClick({item: listItem.item});
		}

		function handleSelection(item) {
			var pos;
			if (item.__isSelected) {
				vm.selectedItems.push(item);
			} else {
				pos = vm.selectedItems.indexOf(item);
				if (pos !== -1) {
					vm.selectedItems.splice(pos, 1);
				}
			}
			selectionChanged();
		}

		function selectionChanged() {
			vm.selectionChanged({
				selectedItems: vm.selectedItems.map(function(listItem) { return listItem.item; })
			});
		}

		function PagingPreprocessor(pageNumber, pageSize, count, changedCallback) {
			var _changeCallback = changedCallback;
			var self = {
				page: pageNumber,
				count: count,
				pageSize: pageSize,
				callChanged: function() {
					if (typeof _changeCallback !== 'undefined') {
						_changeCallback(self.page);
					}
				}

			};

			return self;
		}


	}

	var innerTemplate =
		'		<md-checkbox ' +
		'			aria-label="Check"' +
		'			ng-if="__$vm._useCheckboxes" ' +
		'			ng-model="listItem.__isSelected" ' +
		'			ng-change="__$vm.handleSelection(listItem);" ' +
		'			ng-click="$event.stopPropagation();"> ' +
		'		</md-checkbox> ' +
		'		#ITEM-TEMPLATE# ' +
		'		<div ' +
		'			class="mx-list--actions" ' +
		'			ng-if="::__$vm._showItemActions">' +
		'			<mx-dropdown' +
		'				load-items="__$vm.getItemActions({item: item})"' +
		'				icon="more_horiz"' +
		'				context="item">' +
		'			</mx-dropdown>' +
		'		</div>';

	var template =
		'<div class="mx-list layout-column layout-align-center-center">' +
		'	<div ng-show="__$vm._loading" class="" layout="row" layout-sm="column"' +
		'		layout-align="space-around">' +
		'		<md-progress-circular md-mode="indeterminate" md-diameter="100"></md-progress-circular>' +
		'</div>' +
		'	<md-virtual-repeat-container ng-if="__$vm._virtual" ng-show="__$vm.resultList.length"> ' +
		'		<md-list-item ' +
		'			ng-class="{\'list-item_active\' : listItem.__highlighted}"' +
		'			md-virtual-repeat="listItem in __$vm.resultList" ' +
		'			ng-click="__$vm.handleItemClick(listItem)" ' +
		'			ng-init="item=listItem.item"' +
		'			aria-label="Click on item" ' +
		'			class="md-2-line"> ' +
		innerTemplate +
		'		</md-list-item> ' +
		'	</md-virtual-repeat-container> ' +
		'	<md-list ng-if="!__$vm._virtual && __$vm.resultList.length">' +
		'		<md-list-item ' +
		'			ng-class="{\'list-item_active\' : listItem.__highlighted}"' +
		'			ng-repeat="listItem in __$vm.resultList" ' +
		'			ng-click="__$vm.handleItemClick(listItem)" ' +
		'			ng-init="item=listItem.item"' +
		'			aria-label="Click on item" ' +
		'			class="md-2-line"> ' +
		innerTemplate +
		'		</md-list-item> ' +
		'	</md-list>' +
			'<div class="mx-list-no-data" ng-show="__$vm.resultList.length === 0 && !__$vm._loading">' +
		'		{{\'components.common.noData\' | mxi18n }}' +
		'	</div> ' +
		'	<mx-workspace-common-paging-panel preprocessor="__$vm.paging" ng-if="__$vm.allowPaging" ng-show="__$vm.resultList.length">' +
		'	</mx-workspace-common-paging-panel>' +
		'</div>'
		;

	var replacement =
		'			<div class="md-list-item-text" ng-if="__$vm._virtual"> ' +
		'				<h3>{{ item[__$vm._titleKey] }}</h3> ' +
		'				<p>{{ item[__$vm._descriptionKey] }}</p> ' +
		'			</div> ' +
		'			<div class="md-list-item-text" ng-if="!__$vm._virtual"> ' +
		'				<h3>{{:: item[__$vm._titleKey] }}</h3> ' +
		'				<p>{{:: item[__$vm._descriptionKey] }}</p> ' +
		'			</div> ';



	var dirOpts = {
		restrict: 'E',
		scope: {},
		bindToController: {
			list: '=',
			selectedItems: '=',
			titleKey: '@',
			descriptionKey: '@',
			useCheckboxes: '@',
			highlightOnClick: '@',
			selectionChanged: '&',
			getItemActions: '&',
			allowPaging:'@',
			pageNumber:'=',
			pageSize:'@',
			virtual: '@',
			onItemClick: '&',
			parentControllerAs: '&'
		},
		controller: MxListCtrl,
		controllerAs: '__$vm',
		template: template.split('#ITEM-TEMPLATE#').join(replacement)
	};

	angular.module('mx.components')
		.directive('mxList', function () {
			return dirOpts;
		})
		.directive('mxTemplateList', function () {

			//var templateReplacement1 = '<div class="md-list-item-text" mx-transclude></div>';
			var templateReplacement2 = '<div class="md-list-item-text" ng-if="__$vm.templateId" ng-include src="__$vm.templateId"></div>' +
										'<div class="md-list-item-text" ng-if="!__$vm.templateId" mx-transclude></div>';

			var dir = angular.copy(dirOpts);
			dir = angular.extend(dir, {
				transclude: true,
				template : template.split('#ITEM-TEMPLATE#').join(templateReplacement2),
				bindToController : angular.extend(dir.bindToController, {
					templateId: '@'
				})
			});

			return dir;
		});

})();

(function (w) {
	'use strict';

	function LazyLoad(src) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.src = '/' + src;
		var first = document.getElementsByTagName('script')[0];
		first.parentNode.insertBefore(script, first);
	}

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.LazyLoad = LazyLoad;


//	function MxLazyLoadCtrl(){
//		return this;
//	}
//
//	angular.module('mx.components').directive('mxLazyLoad', function() {
//		return {
//			restrict: 'E',
//			scope: false,
////			replace:true,
//			controller:MxLazyLoadCtrl,
//			controllerAs: 'vm',
//			bindToController: {
//				src:'@'
//			},
//			template: function(elem, attrs){
//				return '<script src="' + attrs.src + '"></script>';
//			} ,
//			link: function(scope, elem, attr) {
//				var code = elem.text();
//				var f = new Function(code);// jshint ignore:line
//				f();
//			}
//		};
//	});


	angular.module('mx.components').directive('mxLazyLoad', function () {
		return {
			restrict: 'A',
			scope: false,
			link: function (/*scope, elem, attr*/) {
				//if(attr.type === 'text/javascript-lazy'){
				//	var code = elem.text();
				//	var f = new Function(code);// jshint ignore:line
				//	f();
				//}
			}
		};
	});

}(window));

(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxJournal
	 * @module mx.components
	 * @restrict 'E'
	 * @description
	 * The mxJournal control provides simple journal functionality.
	 *
	 * The example below demonstrates some of the attributes you may use with the Journal control:
	 * @param {string} itemsPerPage@ - How many items should be shown at once
	 * @param {string} currentUserId@ - current user identifier
	 * @param {string} currentUserPhoto@ - current user avatar image
	 * @param {expression} onGetData& - Callback function to load journal items
	 * @param {expression} onAdd& - Callback function to add new comment
	 * @param {expression} attachFilesHandler& - if set then files attaching functionality will be enabled.
	 * 			It expects a function that returns a promise,
	 *			result of which is an array of file objects that have at least a key "DisplayString".
	 *			Example: [
	 *				{DisplayString: "file1.txt", url: "path/to/file/file1.txt"},
	 *				{DisplayString: "file2.pdf", url: "path/to/file/file2.pdf"},
	 *				...
	 *			];
	 * @param {boolean} readOnly= - The readOnly property sets or returns whether the contents of a mxTextBox should be read-only.
	 *
	 * @usage:
	 *	 	<mx-journal
	 *			on-add="vm.addComment()"
	 *			on-get-data="vm.getData()"
	 *			read-only="false"
	 *			data-disabled="true"
	 *			current-user-id="12345"
	 *			items-per-page="5">
	 *		</mx-journal>
	 */
	angular.module('mx.components').directive('mxJournal', function () {

		MxJournalCtrl.$inject = [
			'$q',
			'$timeout',
			'$scope',
			'$element',
			'mx.internationalization',
			'mx.shell.NotificationService'
		];

		function MxJournalCtrl(
			$q,
			$timeout,
			$scope,
			$element,
			internationalization,
			notificationService
		) {
			var vm = this;

			vm.processingItems = false;
			vm.canLoadMore = false;
			vm._showRichEditor = false;

			var itemsPerPage = vm.itemsPerPage ? parseInt(vm.itemsPerPage, 10) : 10;

			vm.loadMoreItems = loadMoreItems;

			vm.newComment = '';
			vm.addComment = addComment;

			vm._attachingInProgress = false;
			vm._useFileAttachments = !!$($element).attr('attach-files-handler');
			vm.attachments = [];
			vm.attachFiles = attachFiles;
			vm._handleRichTextBoxBlur = _handleRichTextBoxBlur;

			vm.readOnly = !!vm.readOnly;

			vm.items = [];

			reload();

			$scope.$watch('vm._showRichEditor', function () {
				if (vm._showRichEditor) {
					// scroll down on editor activated if there are scrollbar
					$timeout(function () {
						var parent = $element[0];
						while (parent && !_hasScrollBar(parent) && parent.tabName !== 'BODY') {
							parent = parent.parentElement;
						}
						if (parent && parent.tabName !== 'BODY') {
							$(parent).animate({
								scrollTop: parent.scrollTop + 110 + 'px'
							}, 600);
						}
					}, 200);
				}
			});

			return vm;

			function reload() {
				vm.newComment = '';
				vm.attachments = [];
				getJournalEntries(true);
			}

			function finishProcessingItems() {
				vm.processingItems = false;
			}

			function loadMoreItems() {
				if (vm.processingItems || !vm.canLoadMore) {
					return;
				}
				getJournalEntries(false);
			}

			function getJournalEntries(reload) {
				vm.canLoadMore = false;
				vm.processingItems = true;
				var start = 0;
				if (!reload) {
					start = vm.items.length;
				}
				$q.when(vm.onGetData({start: start, count: itemsPerPage + 1})).then(function (data) {
					data = data || [];
					var moreItemsExists = data.length === itemsPerPage + 1;
					if (moreItemsExists) {
						data.pop();
					}

					data.forEach(function (item) {
						item.__my = item.userId === vm.currentUserId;
						item.__created = new Date(item.created);

					});
					var items = null;
					if (reload) {
						items = data;
					} else {
						items = vm.items;
						for (var i = 0; i < data.length; i++) {
							items.push(data[i]);
						}
					}
					if (items && items.length) {
						items.forEach(function (item) {
							item.__my = item.userId === vm.currentUserId;
						});
						vm.items = items;
					}
					vm.canLoadMore = moreItemsExists;
				})
				.finally(function () {
					finishProcessingItems();
				});
			}

			function addComment() {
				if (!vm.newComment && vm.attachments.length === 0) {
					return;
				}
				vm.adding = true;
				$q.when(vm.onAdd({
					text: vm.newComment,
					attachments: vm.attachments
				}))
				.then(function () {
					reload();
					$timeout(function () {
						vm._showRichEditor = false;
					}, 100);
				}, function (error) {
					notificationService.error(
						internationalization.get('components.journal.adding_error') +
						(error && error.statusText ? ': ' + error.statusText : '')
					);
				})
				.finally(function () {
					vm.adding = false;
				});
			}

			function attachFiles() {
				vm._attachingInProgress = true;
				$q.when(vm.attachFilesHandler())
				.then(function (result) {
					var _fileNamesList = vm.attachments.map(function (file) {
						return file.DisplayString;
					});
					result.selectedObjects.forEach(function (file) {
						if (_fileNamesList.indexOf(file.DisplayString) === -1) {
							vm.attachments.push(file);
						}
					});
				})
				.finally(function () {
					vm._attachingInProgress = false;
				});
			}

			function _hasScrollBar(el) {
				var result = false;
				if (el) {
					result = !!el.scrollTop;
					if (!result) {
						el.scrollTop = 1;
						result = !!el.scrollTop;
						el.scrollTop = 0;
					}
					result = result && $(el).css('overflow-y') !== 'hidden';
				}
				return result;
			}

			function _handleRichTextBoxBlur() {
				$timeout(function () {
					vm._showRichEditor = vm.newComment!=='' || vm.attachments.length > 0 || vm._attachingInProgress;
				}, 100);
			}
		}

		return {
			restrict: 'E',
			scope: {},
			bindToController: {
				itemsPerPage: '@',
				onGetData: '&',
				onAdd: '&',
				attachFilesHandler: '&',
				currentUserId: '@',
				currentUserPhoto: '@',
				readOnly: '='
			},
			controller: MxJournalCtrl,
			controllerAs: 'vm',
			templateUrl: 'mx-journal/mx-journal.html'
		};
	});
})();

(function () {
	'use strict';

	angular.module('mx.components')
		.directive('mxImagePreview', [
			'$rootScope',
			'$timeout',
			'$mdDialog',
			'mxImageLightbox',
			function ($rootScope,
					  $timeout,
					  $mdDialog,
					  lightbox) {
				return {
					restrict: 'A',
					link: function (scope, element) {
						element.on('click', function (e) {
							//let's give a chance to cancel the event
							$timeout(function () {
								if (e && e.originalEvent && e.originalEvent.defaultPrevented) {
									return;
								}
								openPreview();
							}, 10);
						});
						function openPreview() {
							var routeHandler = $rootScope.$on('$locationChangeStart', function () {
								lightbox.cancel();
							});
							lightbox.openModal([{url: element.attr('src')}], 0).then(function () {
								routeHandler();
							}, function () {
								routeHandler();
							});
						}
					}
				};
			}])
		.service('mxImageLoader', ['$q',
			function ($q) {
				/**
				 * Load the image at the given URL.
				 * @param  {String}  url
				 * @return {Promise} A $q promise that resolves when the image has loaded
				 *   successfully.
				 */
				this.load = function (url) {
					var deferred = $q.defer();

					var image = new Image();

					// when the image has loaded
					image.onload = function () {
						// check image properties for possible errors
						if (typeof this.complete === 'boolean' && this.complete === false ||
							typeof this.naturalWidth === 'number' && this.naturalWidth === 0) {
							deferred.reject();
						}

						deferred.resolve(image);
					};

					// when the image fails to load
					image.onerror = function () {
						deferred.reject();
					};

					// start loading the image
					image.src = url;

					return deferred.promise;
				};
			}])
		.provider('mxImageLightbox', [function () {
			var internationalization;
			this.$get = ['mx.internationalization', function (_internationalization_) {
				internationalization = _internationalization_;
			}];

			/**
			 * Template URL .
			 * @type {String}
			 */
			this.templateUrl = 'mx-image-preview/mx-image-preview.html';

			/**
			 * @param  {*}      image An element in the array of images.
			 * @return {String}       The URL of the given image.
			 */
			this.getImageUrl = function (image) {
				return image.url;
			};

			/**
			 * @param  {*}      image An element in the array of images.
			 * @return {String}       The caption of the given image.
			 */
			this.getImageCaption = function (image) {
				return image.caption;
			};

			/**
			 * Calculate the max and min limits to the width and height of the displayed
			 *   image (all are optional). The max dimensions override the min
			 *   dimensions if they conflict.
			 * @param  {Object} dimensions Contains the properties windowWidth,
			 *   windowHeight, imageWidth, imageHeight.
			 * @return {Object} May optionally contain the properties minWidth,
			 *   minHeight, maxWidth, maxHeight.
			 */
			this.calculateImageDimensionLimits = function (dimensions) {
				if (dimensions.windowWidth >= 768) {
					return {
						// 108px = 2 * (30px margin of md-content + 24px padding of md-content)
						// with the goal of 30px side margins; however, the actual side margins
						// will be slightly less (at 22.5px) due to the vertical scrollbar
						'maxWidth': dimensions.windowWidth - 108,
						// 154px = 108px as above
						//         + 46px outer height of md-subheader
						'maxHeight': dimensions.windowHeight - 154
					};
				} else {
					return {
						// 68px = 2 * (10px margin of md-content + 24px padding of md-content)
						'maxWidth': dimensions.windowWidth - 68,
						// 114px = 68px as above
						//        + 46px outer height of md-subheader
						'maxHeight': dimensions.windowHeight - 114
					};
				}
			};

			/**
			 * Calculate the width and height of the modal. This method gets called
			 *   after the width and height of the image, as displayed inside the modal,
			 *   are calculated.
			 * @param  {Object} dimensions Contains the properties windowWidth,
			 *   windowHeight, imageDisplayWidth, imageDisplayHeight.
			 * @return {Object} Must contain the properties width and height.
			 */
			this.calculateModalDimensions = function (dimensions) {
				// 400px = arbitrary min width
				// 48px = 2 * (24px padding of md-content)
				var width = Math.max(400, dimensions.imageDisplayWidth + 48);

				// 200px = arbitrary min height
				// 98px = 48px as above
				//        + 50px outer height of md-subheader
				var height = Math.max(200, dimensions.imageDisplayHeight + 98);

				// first case:  the modal width cannot be larger than the window width
				//              20px = arbitrary value larger than the vertical scrollbar
				//                     width in order to avoid having a horizontal scrollbar
				// second case: Bootstrap modals are not centered below 768px
				if (width >= dimensions.windowWidth - 20 || dimensions.windowWidth < 768) {
					width = 'auto';
				}

				// the modal height cannot be larger than the window height
				if (height >= dimensions.windowHeight) {
					height = 'auto';
				}

				return {
					'width': width,
					'height': height
				};
			};

			this.$get = ['$document', '$timeout', 'mxImageLoader', '$mdDialog', function ($document, $timeout, ImageLoader, $mdDialog) {
				// array of all images to be shown in the lightbox (not Image objects)
				var images = [];

				// the index of the image currently shown (Lightbox.image)
				var index = -1;

				/**
				 * The service object for the lightbox.
				 * @type {Object}
				 */
				var Lightbox = {};

				// set the configurable properties and methods, the defaults of which are
				// defined above
				Lightbox.templateUrl = this.templateUrl;
				Lightbox.getImageUrl = this.getImageUrl;
				Lightbox.getImageCaption = this.getImageCaption;
				Lightbox.calculateImageDimensionLimits = this.calculateImageDimensionLimits;
				Lightbox.calculateModalDimensions = this.calculateModalDimensions;

				/**
				 * Whether keyboard navigation is currently enabled for navigating through
				 *   images in the lightbox.
				 * @type {Boolean}
				 */
				Lightbox.keyboardNavEnabled = false;

				/**
				 * The current image.
				 * @type {*}
				 */
				Lightbox.image = {};

				/**
				 * The modal promise.
				 * @type {*}
				 */
				Lightbox.modalPromise = null;

				/**
				 * The URL of the current image. This is a property of the service rather
				 *   than of Lightbox.image because Lightbox.image need not be an object,
				 *   and besides it would be poor practice to alter the given objects.
				 * @type {String}
				 */
				// Lightbox.imageUrl = '';

				/**
				 * The caption of the current image. See the description of
				 *   Lightbox.imageUrl.
				 * @type {String}
				 */
				// Lightbox.imageCaption = '';

				/**
				 * Open the modal.
				 * @param  {Array}  newImages An array of images. Each image may be of any
				 *   type.
				 * @param  {Number} newIndex  The index in newImages to set as the current
				 *   image.
				 * @return {Promise} A [modal promise].
				 */
				Lightbox.openModal = function (newImages, newIndex) {
					images = newImages;
					Lightbox.setImage(newIndex);

					// store the modal instance so we can close it manually if we need to
					Lightbox.modalPromise = $mdDialog.show({
						'templateUrl': Lightbox.templateUrl,
						'controller': ['$scope', function ($scope) {
							// $scope is the modal scope, a child of $rootScope
							$scope.Lightbox = Lightbox;

							Lightbox.keyboardNavEnabled = true;
						}],
						'windowClass': 'lightbox-modal'
					});

					// modal close handler
					Lightbox.modalPromise.then(function () {
						cleanUp();
					}, function () {
						cleanUp();
					});

					function cleanUp() {
						// prevent the lightbox from flickering from the old image when it gets
						// opened again
						Lightbox.image = {};
						Lightbox.imageUrl = null;
						Lightbox.imageCaption = null;

						Lightbox.keyboardNavEnabled = false;

						// complete any lingering loading bar progress
						//Pace.stop();
					}

					return Lightbox.modalPromise;
				};

				/**
				 * Close the lightbox modal.
				 * @param {*} result This argument can be useful if the modal promise gets
				 *   handler(s) attached to it.
				 */
				Lightbox.closeModal = function (result) {
					$mdDialog.hide(result);
				};

				Lightbox.cancel = function (result) {
					$mdDialog.cancel(result);
				};

				/**
				 * This method can be used in all methods which navigate/change the
				 *   current image.
				 * @param {Number} newIndex The index in the array of images to set as the
				 *   new current image.
				 */
				Lightbox.setImage = function (newIndex) {
					if (!(newIndex in images)) {
						throw internationalization ?
							internationalization.get('components.errors.invalid_image') :
							'Invalid image.';
					}

					//Pace.start();
					var success = function () {
						index = newIndex;
						Lightbox.image = images[index];
						//Pace.stop();
					};

					var imageUrl = Lightbox.getImageUrl(images[newIndex]);

					// load the image before setting it, so everything in the view is updated
					// at the same time; otherwise, the previous image remains while the
					// current image is loading
					ImageLoader.load(imageUrl).then(function () {
						success();

						// set the url and caption
						Lightbox.imageUrl = imageUrl;
						Lightbox.imageCaption = Lightbox.getImageCaption(Lightbox.image);
					}, function () {
						success();

						// blank image
						Lightbox.imageUrl = '//:0';
						// use the caption to show the user an error
						Lightbox.imageCaption = internationalization ?
							internationalization.get('components.errors.failed_to_load_image') :
							'Failed to load image';
					});
				};

				/**
				 * Navigate to the first image.
				 */
				Lightbox.firstImage = function () {
					Lightbox.setImage(0);
				};

				/**
				 * Navigate to the previous image.
				 */
				Lightbox.prevImage = function () {
					Lightbox.setImage((index - 1 + images.length) % images.length);
				};

				/**
				 * Navigate to the next image.
				 */
				Lightbox.nextImage = function () {
					Lightbox.setImage((index + 1) % images.length);
				};

				/**
				 * Navigate to the last image.
				 */
				Lightbox.lastImage = function () {
					Lightbox.setImage(images.length - 1);
				};

				/**
				 * Call this method to set both the array of images and the current image
				 *   (based on the current index). A use case is when the image collection
				 *   gets changed dynamically in some way while the lightbox is still open.
				 * @param {Array} newImages The new array of images.
				 */
				Lightbox.setImages = function (newImages) {
					images = newImages;
					Lightbox.setImage(index);
				};

				/**
				 * Bind the left and right arrow keys for image navigation. This event
				 *   handler never gets unbinded. Disable this using the
				 *   keyboardNavEnabled flag. It is automatically disabled when
				 *   the target is an input and or a textarea.
				 */
				$document.bind('keydown', function (event) {
					if (!Lightbox.keyboardNavEnabled) {
						return;
					}

					// method of Lightbox to call
					var method = null;

					switch (event.which) {
						case 39: // right arrow key
							method = 'nextImage';
							break;
						case 37: // left arrow key
							method = 'prevImage';
							break;
					}

					if (method !== null && ['input', 'textarea'].indexOf(
							event.target.tagName.toLowerCase()) === -1) {
						// the view doesn't update without a manual digest
						$timeout(function () {
							Lightbox[method]();
						});

						event.preventDefault();
					}
				});

				return Lightbox;
			}];
		}])
		.directive('mxLightboxSrc', ['$window', 'mxImageLoader', 'mxImageLightbox', function ($window, ImageLoader, Lightbox) {
			/**
			 * Calculate the dimensions to display the image. The max dimensions
			 *   override the min dimensions if they conflict.
			 */
			var calculateImageDisplayDimensions = function (dimensions) {
				var w = dimensions.width;
				var h = dimensions.height;
				var minW = dimensions.minWidth;
				var minH = dimensions.minHeight;
				var maxW = dimensions.maxWidth;
				var maxH = dimensions.maxHeight;

				var displayW = w;
				var displayH = h;

				// resize the image if it is too small
				if (w < minW && h < minH) {
					// the image is both too thin and short, so compare the aspect ratios to
					// determine whether to min the width or height
					if (w / h > maxW / maxH) {
						displayH = minH;
						displayW = Math.round(w * minH / h);
					} else {
						displayW = minW;
						displayH = Math.round(h * minW / w);
					}
				} else if (w < minW) {
					// the image is too thin
					displayW = minW;
					displayH = Math.round(h * minW / w);
				} else if (h < minH) {
					// the image is too short
					displayH = minH;
					displayW = Math.round(w * minH / h);
				}

				// resize the image if it is too large
				if (w > maxW && h > maxH) {
					// the image is both too tall and wide, so compare the aspect ratios
					// to determine whether to max the width or height
					if (w / h > maxW / maxH) {
						displayW = maxW;
						displayH = Math.round(h * maxW / w);
					} else {
						displayH = maxH;
						displayW = Math.round(w * maxH / h);
					}
				} else if (w > maxW) {
					// the image is too wide
					displayW = maxW;
					displayH = Math.round(h * maxW / w);
				} else if (h > maxH) {
					// the image is too tall
					displayH = maxH;
					displayW = Math.round(w * maxH / h);
				}

				return {
					'width': displayW || 0,
					'height': displayH || 0 // NaN is possible when dimensions.width is 0
				};
			};

			// the dimensions of the image
			var imageWidth = 0;
			var imageHeight = 0;

			return {
				'link': function (scope, element, attrs) {
					// resize the img element and the containing modal
					var resize = function () {
						// get the window dimensions
						var windowWidth = $window.innerWidth;
						var windowHeight = $window.innerHeight;

						// calculate the max/min dimensions for the image
						var imageDimensionLimits = Lightbox.calculateImageDimensionLimits({
							'windowWidth': windowWidth,
							'windowHeight': windowHeight,
							'imageWidth': imageWidth,
							'imageHeight': imageHeight
						});

						// calculate the dimensions to display the image
						var imageDisplayDimensions = calculateImageDisplayDimensions(
							angular.extend({
								'width': imageWidth,
								'height': imageHeight,
								'minWidth': 1,
								'minHeight': 1,
								'maxWidth': 3000,
								'maxHeight': 3000
							}, imageDimensionLimits)
						);

						// calculate the dimensions of the modal container
						var modalDimensions = Lightbox.calculateModalDimensions({
							'windowWidth': windowWidth,
							'windowHeight': windowHeight,
							'imageDisplayWidth': imageDisplayDimensions.width,
							'imageDisplayHeight': imageDisplayDimensions.height
						});

						// resize the image
						element.css({
							'width': imageDisplayDimensions.width + 'px',
							'height': imageDisplayDimensions.height + 'px'
						});

						// setting the height on .modal-dialog does not expand the div with the
						// background, which is .modal-content
						angular.element(
							document.querySelector('.md-dialog-container md-dialog')
						).css({
							'width': modalDimensions.width + 'px'
						});

						// .modal-content has no width specified; if we set the width on
						// .modal-content and not on .modal-dialog, .modal-dialog retains its
						// default width of 600px and that places .modal-content off center
						angular.element(
							document.querySelector('.md-dialog-container md-content')
						).css({
							'height': modalDimensions.height + 'px'
						});
					};

					// load the new image whenever the attr changes
					scope.$watch(function () {
						return attrs.mxLightboxSrc;
					}, function (src) {
						// blank the image before resizing the element; see
						// http://stackoverflow.com/questions/5775469/whats-the-valid-way-to-include-an-image-with-no-src
						element[0].src = '//:0';

						ImageLoader.load(src).then(function (image) {
							// these variables must be set before resize(), as they are used in it
							imageWidth = image.naturalWidth;
							imageHeight = image.naturalHeight;

							// resize the img element and the containing modal
							resize();

							// show the image
							element[0].src = src;
						});
					});

					// resize the image and modal whenever the window gets resized
					angular.element($window).on('resize', resize);
				}
			};
		}]);
})();

(function (){
    'use strict';

    angular.module('mx.components')
    /**
     * @ngdoc directive
     * @name mx.components:mxIconPicker
     * @module mx.components
     * @restrict 'E'
     * @description
     * The mx-icon-picker control is used to create a picker where the user can select icons.
     *
     * The example below demonstrates some of the attributes you may use with the Picker control:
     * @param {string} name@ - The name property sets or returns the value of the name attribute of a mxIconPicker.
     * @param {string} label@ - Defines control label displayed on the form.
     * @param {boolean} ng-required= - The required property sets or returns whether a mxPicker must be filled out before submitting a form.
     * @param {boolean} disabled= - The disabled property sets or returns whether a mxPicker should be disabled, or not.
     * @param {boolean} readOnly= - The readOnly property sets or returns whether the contents of a mxPicker should be read-only.
     * @param {object} model=ngModel - directive binds element to the object in the model.
     * @param {expression} onChange& - on change callback
     * @usage <mx-icon-picker ng-model="vm.pickerValue" ng-required="true" data-label="Classic, predfined items" > </mx-icon-picker>
     */
        .directive('mxIconPicker', function () {
            return new mx.components.FormControlBase(MxIconPickerCtrl, 'mx-icon-picker/mx-icon-picker.html');
        });


    MxIconPickerCtrl.$inject = ['$timeout', '$document', '$q', '$scope','mx.internationalization'];

    function MxIconPickerCtrl($timeout, $document, $q, $scope, internationalization) {

        mx.components.FormControlControllerBase.call(this, internationalization, $timeout);

        var vm = this;
        var typing = 0;

        vm.innerClick = innerClick;
        vm.apply = applyIcon;
        vm.activate = activate;
        vm.close = closePanel;
        vm.clear = clear;


        vm.active = false;
        vm.itemsFound = true;

        $scope.$watch('vm.model', function(model){
            vm.text = model;
            // validate?
            initIcon(model);
        });

        $scope.$watch('vm.text', function(text){

            if (!vm.library) {
                return;
            }



            search(text);

        });

        return vm;


        function initIcon(iconId){
            if (iconId) {
                return mx.components.Icons.some(function(cat) {
                    return cat.icons.some(function (icon) {
                        if (icon.id === iconId) {
                            vm.icon = icon.id;
                            return true;
                        }
                    });
                });
            } else {
                vm.icon = '';
                return false;
            }
        }


        function innerClick(event){
            if (event){
                event.stopPropagation();
            }
        }

        function activate(event){

            if (event){
                event.stopPropagation();
            }

            if (vm._readOnly || vm._disabled) {
                return;
            }

            $document.bind('click', closePanel);

            initLibrary();

            $timeout(function() {
                vm.active = true;
            });
        }

        function initLibrary(){
            vm.library = vm.library || mx.components.Icons.map(function(cat) {
                cat.icons.forEach(function(icon) {
                    icon.visible = true;
                });
                return {
                    name:cat.name,
                    visible: true,
                    icons: cat.icons.map(function(icon){
                        return { visible: true, icon: icon};
                    })
                };
            });
        }

        function closePanel() {
            $document.unbind('click', closePanel);

            $timeout(function(){
                vm.text = vm.model;
                vm.active = false;
            });
        }
        function search(text) {

            typing++;
            var i = typing;

            setTimeout(function(){

                if (i === typing) {
                    typing = 0;

                    if (vm.model === vm.text) {
                        text = '';
                    }
                    var found = false;
                    text = (text || '').toLowerCase();

                    vm.library.forEach(function(category){

                        var catVisible = false;
                        category.icons.forEach(function(item) {
                            item.visible = item.icon.name.indexOf(text) !== -1 || item.icon.id.indexOf(text) !== -1;
                            catVisible = catVisible || item.visible;
                        });

                        category.visible = catVisible;
                        found = found || category.visible;
                    });
                    vm.itemsFound = found;
                    $scope.$apply();
                }
            }, 200);

        }

        function clear(event) {

            if (event){
                event.stopPropagation();
            }

            vm.text = '';
            vm.icon = '';
            vm.model = '';

            closePanel();
        }

        function applyIcon(event, icon) {

            if (event){
                event.stopPropagation();
            }

            vm.model = icon.id;
            if (vm.text === icon.id) {
                search('');
            } else {
                vm.text = icon.id;
            }

            vm.icon = icon.id;

            closePanel();
        }
    }

})();

(function () {
	'use strict';

	angular.module('mx.components').filter('mxi18n', ['mx.internationalization', function (internationalization) {
		function mxi18nFilter(string, defaultText) {
			return internationalization.get(string, defaultText);
		}

		return mxi18nFilter;
	}]);

})();

(function () {


	'use strict';

	angular.module('mx.components').directive('uiGridSelectionHover', function () {

		/*
		 Custom hover effect can be realised to add  "rowHoverCssClassName=< myCustomclass >"  as additional parameter to the mx-grid directive
		 Logging can be acivated by adding 			 "rowHoverCssClassName= true			"  as additional parameter to the mx-grid directive
		 */

		var logging = false;
		var cssClass = 'ui-grid-selection-hover';


		var linkFunction = function (scope, element, attributes) {
			if (attributes.enablerowhoverlogging) {
				logging = attributes.enablerowhoverlogging;
			}
			if (attributes.rowhovercssclassname) {
				cssClass = attributes.rowhovercssclassname;
			}

		};

		return {
			restrict: 'A',
			link: linkFunction,
			priority: 0,
			require: '^uiGrid',
			controller: ['$scope', '$element', '$templateCache', function ($scope, $element, $templateCache) {

				//var hoverClassName = 'ui-grid-selection-hover';

				var lastEnteredRow = null;

				$scope.uiGridHandleItemClick = function (row) {
					if ($scope.currentRow !== row) {
						if ($scope.currentRow) {
							$scope.currentRow.__highlighted = false;
						}
						$scope.currentRow = row;
						$scope.currentRow.__highlighted = true;
					}
				};

				$scope.uiGirdSelectionHoverOnMouseEnter = function ($event) {

					// Inspect the Parent of the current mousetarget

					var parent = angular.element($event.target);

					// Iterate through each parent to search for the row-element
					while (parent) {
						if (parent.hasClass('ui-grid-row')) {
							break;
						}
						else if (parent.length === 0) {
							break;
						}
						parent = parent.parent();
					}

					// check where we are (left or right, checkboxes/gridcontent)
					var checkParent = parent.parent().parent().parent();
					var rowIndex = parent.attr('data-element-index');
					var selectionRow = null;

					if (checkParent.hasClass('left')) {
						selectionRow = $element[0].querySelectorAll('.ui-grid-render-container-body.ui-grid-render-container .ui-grid-viewport .ui-grid-canvas .ui-grid-row')[rowIndex];
						if (logging) {
							console.log('Hovering over Checkbox-Row -> RowIndex: ', rowIndex, ' -Class: ', selectionRow.className);
						}
					} else {
						selectionRow = $element[0].querySelectorAll('.left.ui-grid-render-container-left.ui-grid-render-container .ui-grid-viewport .ui-grid-canvas .ui-grid-row')[rowIndex];
						if (logging) {
							console.log('Hovering over Grid-Data-Row -> RowIndex: ', rowIndex, ' -Class: ', selectionRow.className);
						}
					}

					//Add the custom CSS class for either left or right side row
					if (logging) {
						console.log('Adding class "' + cssClass + '" for hover effect\n\n');
					}
					angular.element(selectionRow).addClass(cssClass);

					// Save the last visited row in order to access it for deleting the hover effect( mouse leave )
					lastEnteredRow = angular.element(selectionRow);
				};


				$scope.uiGirdSelectionHoverOnMouseLeave = function () {
					if (!lastEnteredRow) {
						return;
					}
					if (logging) {
						console.log('Leaving Row -> -Class: ', lastEnteredRow[0].className, ' \nRemoving class "' + cssClass + '"\n\n');
					}
					lastEnteredRow.removeClass(cssClass);
				};

				// Default 'angular-ui-grid' rowTemplate with additional mouseLeave- and mouseEnter events
				var template =
					'<div role="rowgroup" class="ui-grid-viewport" ng-style="colContainer.getViewportStyle()"> ' +
					'<div class="ui-grid-canvas">' +
					'<div data-element-index="{{$index}}" ng-class="{\'grid-row_active\' : row.__highlighted}" ng-repeat="(rowRenderIndex, row) in rowContainer.renderedRows track by $index" class="ui-grid-row" ng-style="Viewport.rowStyle(rowRenderIndex)" ng-mouseenter="grid.appScope.uiGirdSelectionHoverOnMouseEnter($event)" ng-click="grid.appScope.uiGridHandleItemClick(row)" ng-mouseleave="grid.appScope.uiGirdSelectionHoverOnMouseLeave($event)"> ' +
					'<div role="row" ui-grid-row="row" row-render-index="rowRenderIndex"></div> ' +
					'</div> ' +
					'</div> ' +
					'</div>';

				// add the new tempalte
				$templateCache.put('ui-grid/uiGridViewport', template);


			}]
		};
	});

})();



(function (w) {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxGrid
	 * @module mx.components
	 * @restrict E
	 *
	 * @description
	 * Visualizes table/grid data.
	 *
	 * The following example shows how to use mxGrid.
	 * The mxGrid expects an attribute 'data' which is an array.
	 *
	 * ```html
	 * <mx-grid data="vm.myData"></mx-grid>
	 * ```
	 * where: vm.myData = [{'title': 'My title', 'description': 'Some text'}, ... ]
	 *
	 * Also data can be passed through an 'options' attribute like this:
	 * ```html
	 * <mx-grid options="vm.gridOptions"></mx-grid>
	 * ```
	 * where: vm.gridOptions = { data: [{'title': 'My title', 'description': 'Some text'}, ... ] }
	 *
	 * The 'selection-changed' attribute can be used if needed.
	 * It expects a function, which will be executed when some item(s) a (un)selected.
	 * This function receives an array of selected items as a parameter.
	 * This event can be passed in 'options' attribute like a 'selectionChanged' key, similar with 'data' attribute.
	 *
	 * The 'on-item-click' attribute can be used if it's need to set row click handler.
	 * Handler-function gets corresponding item-object as parameret.
	 *
	 * 'columns' attribute expects an array of columns with mandatory keys: 'Name', Title',
	 * and not mandatory:
	 *        - 'IsDisplay'    - (boolean) - show or hide column
	 *        - 'Width'        - (integer) width in pixels. 0 - if 'autosize'
	 *        - 'Sorting'      - 0 - don't sort, 1 - sort ASC, 2 - sort DESC
	 *        - 'Alignment'    - 0 - left, 1 - center, 2 - right
	 *
	 *  editMode
	 *  0  - read only
	 *  1  - inline edit
	 *  2  - edit form
	 *  3 - relation grid
	 *
	 *  allowPaging
	 *
	 *  ### Stylebehavior (html/css)
	 *
	 *  The Grid itself has by default a minimum height of 250px and sets its width automatically to the parent container.
	 *  The size and general style behaviour can be changed by adding styles/classes to the mx-grid directive itself.
	 *
	 *  - Example for auto-height (grid sets its height to the parent-containers 500px):
	 *
	 * ```html
	 * <div name="parent-container" style="height:500px;" layout="column">
	 *  <mx-grid
	 *    flex
	 *    data="vm.myData"
	 *    options="vm.gridOptions"
	 *    selection-changed="vm.selectionChanged(selectedItems)"
	 *    selected-items="vm.selectedItems"
	 *    data-get-item-actions="vm.getItemActions(item)">
	 *  </mx-grid>
	 * </div>
	 * ```
	 *
	 *  - Example for custom height:
	 *
	 * ```html
	 * <div name="parent-container" style="height:500px;">
	 *  <mx-grid
	 *    style="height: 350px"
	 *    data="vm.myData"
	 *    options="vm.gridOptions"
	 *    selection-changed="vm.selectionChanged(selectedItems)"
	 *    selected-items="vm.selectedItems"
	 *    data-get-item-actions="vm.getItemActions(item)">
	 *  </mx-grid>
	 * </div>
	 * ```
	 *
	 **/

	MxGridCtrl.$inject = ['$scope', 'uiGridConstants', '$templateCache', '$timeout', '$attrs', 'gridUtil', '$filter'];

	function MxGridCtrl($scope, uiGridConstants, $templateCache, $timeout, $attrs, gritUtil, $filter) {

		//Overrides angular-ui-grids on-mousewheel function, which destroys scrolling when the grid has a certain height
		gritUtil.on.mousewheel = function () {
		};

		var vm = this;
		var editMode = +(vm.options && vm.options.editMode || 0);
		var allowPaging = vm.options && vm.options.allowPaging;
		var totalItems = vm.options && vm.options.totalItems;
		var enableCellEdit = editMode === 1;
		vm.options = vm.options || {};

		var loadOptions = {};

		vm.selectionChanged = $attrs.selectionChanged ?
			vm.selectionChanged :
			vm.options && vm.options.selectionChanged ?
				vm.options.selectionChanged :
				vm.selectionChanged;

		vm.onItemClick = $attrs.onItemClick ?
			vm.onItemClick :
			vm.options && vm.options.onItemClick ?
				vm.options.onItemClick :
				vm.onItemClick;

		vm.loadData = vm.options && vm.options.loadData || vm.loadData;

		$scope.highlightOnClick = false;
		if (vm.options) {
			$scope.highlightOnClick = vm.options.highlightOnClick !== false;
		}

		$scope.highlightOnClick = vm.options && vm.options.highlightOnClick ? vm.options.highlightOnClick : true;

		var useExternalDataLoading = !!vm.loadData;
		var useExternalSorting = useExternalDataLoading && vm.options.useExternalSorting;

		var templates = loadTemplates();

		vm.gridOptions = {
			enableHorizontalScrollbar: vm.options && vm.options.enableHorizontalScrollbar !== undefined ? vm.options.enableHorizontalScrollbar : 1,
			selectionRowHeaderWidth: 66,
			headerRowHeight: 56,
			enableGridMenu: vm.options.enableGridMenu !== false,
			enablePaginationControls: false,
			enableCellEdit: enableCellEdit,
			enableExpandable: true,
			enableExpandableRowHeader: false,
			enableRowSelection: (vm.options && vm.options.enableRowSelection) !== false,
			enableRowHeaderSelection: (vm.options && vm.options.enableRowSelection) !== false
		};

		if (allowPaging) {
			angular.extend(vm.gridOptions, {
				enablePaginationControls: allowPaging,
				totalItems: totalItems,
				useExternalPagination: useExternalDataLoading,
				useExternalSorting: useExternalSorting,
				paginationTemplate: 'mx-grid/mx-grid-pager.html'
			});
		}

		if (vm.onItemClick) {
			$templateCache.put('ui-grid/ui-grid-row', $templateCache.get('ui-grid/ui-grid-row').replace(
				'ng-repeat=',
				' ng-click="grid.appScope.vm.onItemClick(row.entity)" aria-label="Click on row" ng-repeat='
			));
		}

		if (editMode > 1) {
			vm.gridOptions.rowTemplate = templates.row;
			vm.gridOptions.expandableRowTemplate = templates.editForm;
		}

		$scope.removeRow = removeRow;
		$scope.addRow = addRow;
		$scope.onEdit = vm.onEdit;
		$scope.hasEdit = editMode === 2;
		$scope.closeInlineForm = closeInlineForm;
		$scope.processObject = processObject;
		$scope.showAddButton = !!$attrs.onAdd && editMode > 0;
		$scope.title = vm.title;
		$scope.showRemoveButton = !!$attrs.onRemove && editMode > 0;

		$scope.pagerDescriptor = {
			page: loadOptions.pageNumber,
			pageSize: loadOptions.pageSize,
			pageSizes: vm.options ? vm.options.selectablePageSizes : null,
			disableNext: vm.options ? vm.options.cantPageForward : null,
			count: totalItems,
			callChanged: function () {
				setPaging($scope.pagerDescriptor.page, $scope.pagerDescriptor.pageSize);
				reloadData();
			}
		};


		setPaging(vm.options && vm.options.pageNumber || 0, vm.options && (vm.options.pageSize || (vm.options.pageSize === null ? undefined : 10)));

		// Define data for showing
		$scope.$watch('vm.data', function (newValue) {
			if (newValue) {
				setData();
			}
		});

		$scope.$watch('vm.options.data', function (newValue) {
			if (newValue) {
				setData();
			}
		});

		$scope.$watch('vm.columns', function (newValue) {
			if (newValue) {
				setColumns();
			}
		});

		$scope.$watch('vm.options.columns', function (newValue) {
			if (newValue) {
				setColumns();
			}
		});


		$scope.$watch('vm.selectedItems', function (newList) {
			if (Array.isArray(newList)) {
				$timeout(function () {
					var currentSelectedItems = vm.gridApi.selection.getSelectedRows();
					currentSelectedItems.forEach(function (oldItem) {
						// Unselect item if it is not in new selected list.
						if (newList.indexOf(oldItem) === -1) {
							vm.gridApi.selection.unSelectRow(oldItem);
						}
					});
					newList.forEach(function (newItem) {
						// Select item if it is not in current selected list.
						if (currentSelectedItems.indexOf(newItem) === -1) {
							vm.gridApi.selection.selectRow(newItem);
						}
					});
				});
			}
		}, true);

		$scope.$watch('vm.options.totalItems', function (newValue) {
			if (newValue) {
				vm.gridApi.grid.options.totalItems = vm.options.totalItems;
				$scope.pagerDescriptor.count = vm.options.totalItems;
			}
		});

		$scope.$watch('vm.options.cantPageForward', function () {
			$scope.pagerDescriptor.disableNext = vm.options.cantPageForward;
		});

		vm.gridOptions.onRegisterApi = function (gridApi) {
			vm.gridApi = gridApi;
			if (vm.options && vm.options.onRegisterApi) {
				vm.options.onRegisterApi(gridApi);
			}

			if (vm.options) {
				gridApi.grid.appScope.formFields = vm.options.editFormFields;
				gridApi.grid.appScope.template = vm.options.editFormTemplate || vm.$editFormTemplate;
			}

			if (gridApi && gridApi.selection) {
				gridApi.selection.on.rowSelectionChanged($scope, handleSelection);
				gridApi.selection.on.rowSelectionChangedBatch($scope, handleSelection);
			}

			gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
				if (sortColumns.length === 0) {
					loadOptions.sortDirection = null;
					loadOptions.name = null;
				} else {
					loadOptions.sortDirection = sortColumns[0].sort.direction;
					loadOptions.name = sortColumns[0].field;
				}

				setPaging(0);
				reloadData();
			});


			gridApi.core.on.columnVisibilityChanged($scope, function (column) {
				vm.onColumnVisibilityChanged({column: column});
			});

			gridApi.core.on.sortChanged($scope, function (grid, columns) {
				vm.onSortChanged({columns: columns});
			});

			gridApi.colResizable.on.columnSizeChanged($scope, function (column, columnWidthShift) {
				var absoluteWidth;
				gridApi.grid.columns.forEach(function (col) {
					if (col.name === column.name) {
						absoluteWidth = col.drawnWidth;
					}
				});
				vm.onColumnSizeChanged({
					column: column,
					columnWidthShift: columnWidthShift,
					absoluteWidth: absoluteWidth
				});
			});

			gridApi.colMovable.on.columnPositionChanged($scope, function (column, oldPosition, newPosition) {
				vm.onColumnPositionChanged({
					column: column,
					oldPosition: oldPosition,
					newPosition: newPosition,
					columns: gridApi.grid.columns
				});
			});
		};

		return vm;

		function processObject(data, col) {
			if (data && col && col.colDef.type === 'date' && typeof data === 'string') {
				return $filter('date')(new Date(data), col.colDef.dateFormat || 'medium');

			}
			return data;
		}

		function reloadData() {
			if (vm.loadData) {
				$scope.pagerDescriptor.disable = true;
				vm.loadData(loadOptions);
			}
		}

		function setPaging(pageNumber, pageSize) {
			loadOptions.pageNumber = pageNumber;
			$scope.pagerDescriptor.page = pageNumber;
			vm.options.pageNumber = pageNumber;
			vm.gridOptions.paginationCurrentPage = pageNumber + 1;

			if (pageSize) {
				loadOptions.pageSize = pageSize;
				$scope.pagerDescriptor.pageSize = pageSize;
				vm.options.pageSize = pageSize;
				vm.gridOptions.paginationPageSize = pageSize;
			}
		}

		function hideRow(save) {
			if (vm.expandedRow) {
				vm.expandedRow.isExpanded = false;
				if (vm.expandedRow.$$addFlag) {
					if (save) {
						vm.expandedRow.$$addFlag = undefined;
					}
					else {
						removeRow(vm.expandedRow.entity, true);
					}
				}
				vm.expandedRow = undefined;
			}
		}

		function removeRow(grid) {
			var remove = vm.onRemove();

			if (remove) {
				if (!remove(grid)) {
					return;
				}
			}

			var data = vm.data || vm.options.data;
			var selectedRows = grid.api.selection.getSelectedRows();

			selectedRows.forEach(function (entity) {
				var index = data.indexOf(entity);
				if (index > -1) {
					data.splice(index, 1);
				}
			});

		}

		function addRow() {
			var add = vm.onAdd();
			if (add) {
				add();
			}
		}

		function closeInlineForm(save) {

			if (save) {
				var added = vm.onAdded();

				if (added) {
					save = added(vm.expandedRow.entity);
				}
			}
			hideRow(save);
		}

		function setData() {
			vm.gridOptions.data = vm.data || vm.options && vm.options.data || [];

			$scope.pagerDescriptor.disable = false;


			return vm.gridOptions.data;
		}

		function handleSelection() {
			var selectedItems = vm.gridApi.selection.getSelectedRows();
			$scope.selectedItemsCount = selectedItems.length;
			vm.gridOptions.data.forEach(function (item) {
				item.__isSelected = selectedItems.indexOf(item) !== -1;
			});
			vm.selectionChanged({selectedItems: selectedItems});
		}

		function setColumns() {
			var columns = vm.columns || vm.options && vm.options.columns || [];
			vm.gridOptions.columnDefs = columns.map(function (item) {
				var alignClass = 'mx-grid-cell-' + (item.Alignment === 0 && 'left' || item.Alignment === 1 && 'center' || item.Alignment === 2 && 'right');
				var type = item.type || item.Type;

				var boolTemplate = type === 'boolean' ? editMode === 1 ? templates.editedBooleanCell : templates.readOnlyBooleanCell : undefined;
				var width = item.width || (item.Width === '0' ? undefined : item.Width);

				return {
					field: item.field || item.Name,
					displayName: item.Title || item.displayName,
					visible: item.IsDisplay === undefined ? item.visible : item.IsDisplay,
					enableColumnMenu: false,
					width: width === '' ? undefined : width,
					minWidth: 50 || Math.max(item.minWidth, 50),
					dateFormat: item.dateFormat,
					type: type,
					enableCellEdit: vm.gridOptions.enableCellEdit && type !== 'boolean',
					cellClass: alignClass,
					sort: {
						direction: item.Sorting === 1 && uiGridConstants.ASC || item.Sorting === 2 && uiGridConstants.DESC || undefined
					},
					//enableSorting: item.Sorting !== 0,
					cellTemplate: boolTemplate || item.Template || item.cellTemplate,
					headerCellTemplate: item.headerCellTemplate,
					cellFilter: item.cellFilter
				};
			});


		}

		function loadTemplates() {
			return {
				pager: $templateCache.get('mx-grid/mx-grid-pager.html'),
				editedBooleanCell: ' <div ng-disabled="false" ><md-checkbox ng-model="row.entity[col.field]" aria-disabled="true" aria-label="boolfield"></md-checkbox></div>',
				readOnlyBooleanCell: ' <md-icon> {{MODEL_COL_FIELD?"check_box":"check_box_outline_blank"}}</md-icon>',
				actionRow: '<div layout="row" class="mx-grid-cell-row-actions">' +
				'<md-button ng-if="grid.appScope.hasEdit" aria-label="Edit" ng-click="grid.appScope.onEdit({entity: row.entity})" ><md-icon aria-label="Edit" >edit</md-icon></md-button>' +
				'</div>',
				row: '<div ng-show="!row.isExpanded">' + $templateCache.get('ui-grid/ui-grid-row') + '</div>',
				editForm: '<mx-grid-edit-form row="row" inline-form-fields = "vm.options.inlineFormFields"> </mx-grid-edit-form>'
			};
		}
	}


	function MxGrid($templateCache) {

		var directive = {
			restrict: 'E',
			scope: {},
			bindToController: {
				options: '=',
				title: '@',
				data: '=',
				$columns: '=',
				$editFormTemplate: '@',
				selectionChanged: '&',
				onAdd: '&',
				onAdded: '&',
				onRemove: '&',
				onEdit: '&',
				onItemClick: '&',
				loadData: '=',
				selectedItems: '=',
				onColumnVisibilityChanged: '&',
				onSortChanged: '&',
				onColumnPositionChanged: '&',
				onColumnSizeChanged: '&'
			},
			controller: MxGridCtrl,
			controllerAs: 'vm',
			template: template,
			getTemplate: getTemplate

		};

		directive.compile = function (element, attributes) {
			if ($templateCache) {

				var originaMenuBtnTemplate = $templateCache.get('ui-grid/origin/ui-grid-menu-button');
				var originaUiGridTemplate = $templateCache.get('ui-grid/origin/ui-grid');
				if (attributes.skipheaderactions === undefined) {
					if (!originaMenuBtnTemplate) {
						$templateCache.put('ui-grid/origin/ui-grid-menu-button', $templateCache.get('ui-grid/ui-grid-menu-button'));
						$templateCache.put('ui-grid/origin/ui-grid', $templateCache.get('ui-grid/ui-grid'));
					}
					$templateCache.put('ui-grid/ui-grid-menu-button', $templateCache.get('mx-grid/mx-grid-menu-button.html'));
					$templateCache.put('ui-grid/ui-grid', $templateCache.get('mx-grid/mx-grid.html'));
				}
				else {
					if (originaMenuBtnTemplate) {
						$templateCache.put('ui-grid/ui-grid-menu-button', originaMenuBtnTemplate);
						$templateCache.put('ui-grid/ui-grid', originaUiGridTemplate);
					}
				}

				$templateCache.put('ui-grid/selectionSelectAllButtons',
					'<div class="" ><md-checkbox class="mx-grid-checkbox" ng-checked="grid.selection.selectAll" aria-label="Select all" ng-click="headerButtonClick($event)"></md-checkbox></div>'
				);
				$templateCache.put('ui-grid/selectionRowHeaderButtons',
					'<div class="" ><md-checkbox class="mx-grid-checkbox" ng-checked="row.isSelected" aria-label="Select row" ng-click="selectButtonClick(row, $event)"></md-checkbox></div>'
				);
				$templateCache.put('ui-grid/uiGridCell',
					'<div class="ui-grid-cell-contents" title="TOOLTIP" ng-bind-html="grid.appScope.processObject(COL_FIELD, col) CUSTOM_FILTERS" ></div>'
				);

				//Override default Angular UI grid Templates by custom ones
				var mxGridMenuTemplate = $templateCache.get('mx-grid/mx-grid-gridmenu.html');
				$templateCache.put('ui-grid/uiGridMenu', mxGridMenuTemplate);

				var mxGridViewPortTemplate = $templateCache.get('mx-grid/mx-grid-viewport.html');
				$templateCache.put('ui-grid/uiGridViewport', mxGridViewPortTemplate);

				var mxGridMenuItemTemplate = $templateCache.get('mx-grid/mx-grid-gridmenu-item.html');
				$templateCache.put('ui-grid/uiGridMenuItem', mxGridMenuItemTemplate);
			}
			return {
				post: function (/*$scope, element, attr*/) {

				},
				pre: function ($scope, element, attr, ctrl) {
					if (typeof directive.link === 'function') {
						directive.link($scope, element, attr, ctrl);
					}
				}
			};

		};

		return directive;

		function template(element, attr) {
			var editForm = element.find('edit-form');
			if (editForm.length > 0) {
				attr.$editFormTemplate = editForm[0].innerHTML;
			}

			var columns = element.find('columns');
			if (columns.length) {
				attr.$columns = columns[0].innerHTML;
			}

			return directive.getTemplate(element, attr);
		}


		function getTemplate() {
			return '<div' +
				'	ui-grid="vm.gridOptions"' +
				'	ui-grid-selection-hover' +
				'	ui-grid-resize-columns' +
				'	ui-grid-move-columns' +
				'	ui-grid-auto-resize' +
				'	ui-grid-pagination' +
				'	ui-grid-edit' +
				'   ui-grid-selection>' +
				'	<div class="mx-grid-no-data" ng-show="vm.gridOptions.data.length === 0">' +
				'		{{\'components.common.noData\' | mxi18n }}' +
				'	</div>' +
				'</div>';
		}
	}

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.Grid = MxGrid;
	angular.module('mx.components').directive('mxGrid', ['$templateCache', MxGrid]);

})(window);

(function () {
	'use strict';


	MxGridEditFormCtrl.$inject = ['$scope','$timeout','$injector','$element','$rootScope','$compile'];

	function MxGridEditFormCtrl($scope, $timeout,$injector,$element,$rootScope,$compile) {
		var vm = this;
		vm.save = save;
		vm.cancel = cancel;
		vm.formFields = vm.row.grid.appScope.formFields;

		vm.localScope = vm.formFields ? {} : $rootScope.$new();
		vm.localScope.entity = angular.copy(vm.row.entity);

		vm.localScope.click = function(){
			console.log(vm.localScope.entity);
		};

		if(!vm.formFields){
			if(vm.row.grid.appScope.template){
				vm.template = vm.row.grid.appScope.template.replace(/&apos;/g,'\'');
			}
			vm.localScope.row = vm.row;
			//var div = $element.find('.mx-grid-edit-form-inner---content');
			var div = angular.element($element[0].querySelector('.mx-grid-edit-form-inner---content'));
			var el = $compile(vm.template)(vm.localScope);
			div.append(el);
		}


		return vm;

		function save(){
			angular.extend(vm.row.entity,vm.localScope.entity);
			vm.row.grid.appScope.closeInlineForm(true);
		}

		function cancel(){
			vm.row.grid.appScope.closeInlineForm(false);
		}
	}

	angular.module('mx.components').directive('mxGridEditForm', function () {

		return {
			restrict: 'E',
			scope: {},
			bindToController: {
				row:'='
			},
			controller: MxGridEditFormCtrl,
			controllerAs: 'vm',
			templateUrl: 'mx-grid/mx-grid-edit-form.html'
		};
	});

})();

(function () {
	'use strict';

	MxGridEditFormFieldCtrl.$inject = [];
	function MxGridEditFormFieldCtrl() {
		var vm = this;
		vm.isString = isString;
		vm.isBool = isBool;
		vm.isReference = isReference;
		return vm;

		function isString() {
			return vm.field.type === 'string';
		}

		function isBool() {
			return vm.field.type === 'boolean';
		}

		function isReference() {
			return vm.field.type === 'reference';
		}

	}

	angular.module('mx.components').directive('mxGridEditFormField', function () {
		return {
			restrict: 'E',
			scope: {},
			bindToController: {
				field: '=',
				entity: '='
			},
			controller: MxGridEditFormFieldCtrl,
			controllerAs: 'vm',
			templateUrl: 'mx-grid/mx-grid-edit-form-field.html'
		};
	});

})();

(function () {
	'use strict';

	MxFormMessageCtrl.$inject = ['$scope', '$timeout'];

	function MxFormMessageCtrl($scope, $timeout) {
		var vm = this;
		var errorMessage = new mx.components.Forms.ErrorMessage(vm.message, vm.active, vm.type);

		$scope.$watch('vm.message', function (newValue, oldValue) {
			if (newValue && newValue !== oldValue) {
				errorMessage.message = vm.message;
			}
		});

		setActive(vm.active);

		Object.defineProperty(vm, 'active', {
			get: function () {
				return errorMessage.isActive;
			},
			set: setActive
		});

		function setActive(val) {
			errorMessage.isActive = val;
		}

		vm.initFormErrors = function (formController) {
			if (formController) {
				$timeout(function () {
					if (typeof formController.addFormErrorMessage === 'function') {
						formController.addFormErrorMessage(errorMessage);
					}
				});
			}
		};
	}

	angular.module('mx.components').directive('mxFormMessage', function () {
		return {
			restrict: 'E',
			replace: true,
			controller: MxFormMessageCtrl,
			controllerAs: 'vm',
			require: ['?^form'],
			scope: {},
			bindToController: {
				active: '=',
				message: '@',
				type: '@'
			},
			link: function (scope, element, attrs, ctrls) {
				scope.vm.initFormErrors(ctrls[0]);
			}
		};
	});
})();

(function (w) {
	'use strict';


	MxControlErrorsCtrl.$inject = ['$scope', 'mx.internationalization'];

	function MxControlErrorsCtrl($scope, internationalization) {
		var vm = this;
		vm.errorMessages = null;
		vm.internalController = null;
		vm.initialize = initialize;

		function initialize(formController, errorController, attrs) {
			vm.errorController = errorController;
			vm.formController = formController;

			if (vm.errorController && vm.errorController.$error) {
				$scope.$watch('vm.errorController.$error', vm.render, true);
			}

			if (formController && vm.errorController && attrs.trackInternal && attrs.trackInternal !== 'false') {
				vm.internalController = formController[$scope.$parent.vm.internalName];

				if (vm.internalController) {
					vm.internalController.label = vm.errorController.label;
					vm.internalController.isVisible = vm.errorController.isVisible;
					$scope.$watch('vm.internalController.$error', vm.render, true);
				}
			}
		}

		vm.render = function () {
			vm.errorController.mxInvalid = vm.errorController.$invalid || (vm.internalController !== null && vm.internalController.$invalid); // jshint ignore:line

			if (vm.errorController.mxInvalid) {
				var keys = Object.keys(vm.errorController.$error);

				if (keys.length === 0 && vm.internalController) {
					keys = Object.keys(vm.internalController.$error);
				}

				vm.errorMessages = localizeErrorMessages(keys[0], vm, internationalization);
			}
			else {
				vm.errorMessages = null;
			}

			if(vm.formController && angular.isFunction(vm.formController.update)) {
				vm.formController.update();
			}
		};
	}


	MxFormErrorsCtrl.$inject = ['$scope', 'mx.internationalization'];

	function MxFormErrorsCtrl($scope, internationalization) {
		var vm = this;
		var _clientErrors = [];
		vm.errorMessage = null;
		vm.initialize = initialize;
		vm.allErrors = [];
		vm.activeErrorIndex = -1;
		vm.nextExists = false;
		vm.prevExists = false;
		var _originErrors = null;
		var _errors = [];
		var _formMessages = [];

		Object.defineProperty(vm, 'errors', {
			get: function () {
				return _originErrors;
			},
			set: function (value) {
				_originErrors = value;

				if (Array.isArray(_originErrors) && _originErrors.length > 0) {
					_errors = _originErrors.map(getErrorMessage);
				} else {
					_errors = [];
				}

				vm.updateErrors();
			}
		});

		function initialize(formController) {
			vm.errorController = formController;

			if (vm.errorController) {
				vm.errorController.addFormErrorMessage = _addFormErrorMessage;

				 if (vm.errorController.$error) {
					 // Causes the control to redraw the regions within its client area.
					 vm.errorController.update = function () {
						 vm.render();
					 };

					 // TODO: Optimize the form's checking on invalidation.
					 $scope.$watch('vm.errorController.$invalid', vm.render, true);
				 }
			}
		}

		function getErrorMessage(message) {
			return new mx.components.Forms.ErrorMessage(message);
		}


		function _addFormErrorMessage(formMessage) {
			formMessage.onChange = _onErrorMessageChange;
			_formMessages.push(formMessage);
		}

		function _onErrorMessageChange() {
			vm.updateErrors();
		}

		vm.nextError = function () {
			if (vm.activeErrorIndex < vm.allErrors.length - 1) {
				vm.activeErrorIndex++;
				_showActiveError();
			}
		};

		vm.prevError = function () {
			if (vm.activeErrorIndex > 0) {
				vm.activeErrorIndex--;
				_showActiveError();
			}
		};

		vm.render = function () {
			_clientErrors = [];
			if (vm.errorController.$invalid) {
				vm.validationStatus({status: false});
				var keys = Object.keys(vm.errorController.$error);

				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					var message = localizeErrorMessages(key, vm, internationalization);
					var keyErrors = vm.errorController.$error[key];

					for (var j = 0; j < keyErrors.length; j++) {
						var item = keyErrors[j];
						if (item.label) {
							_clientErrors.push(getErrorMessage('<div flex layout="column" class="error-message_field-name">' + item.label + '</div><div flex layout="column" class="error-message_error-text">&nbsp;&#8212; ' + message + '</div>'));
						}
					}
				}
			} else {
				vm.validationStatus({status: true});
			}

			vm.updateErrors();
		};

		vm.updateErrors = function () {
			vm.allErrors = _formMessages.concat(_errors, _clientErrors).filter(function (err) {
				return err.isActive;
			});
			vm.activeErrorIndex = vm.allErrors.length > 0 ? 0 : -1;
			_showActiveError();
		};

		function _showActiveError() {
			vm.errorMessage = vm.allErrors[vm.activeErrorIndex];
			if (typeof vm.errorMessage !== 'undefined') {
				vm.nextExists = vm.activeErrorIndex < vm.allErrors.length - 1;
				vm.prevExists = vm.activeErrorIndex > 0;
			}

		}
	}

	function MxFormErrorMessage(message, active, type) {
		var _isActive = typeof active === 'undefined' || !!active;
		type = type ? type.toLowerCase() : '';

		if (type !== 'warning') {
			type = 'error';
		}


		Object.defineProperty(this, 'type', {writable: false, value: type});
		Object.defineProperty(this, 'message', {writable: true, value: message});
		Object.defineProperty(this, 'onChange', {writable: true, value: null});
		Object.defineProperty(this, 'isActive', {
			get: function () {
				return _isActive;
			},
			set: function (value) {
				_isActive = value;
				if (typeof this.onChange === 'function') {
					this.onChange(this);
				}
			}
		});

	}

	function localizeErrorMessages(errorCode, ctrl, internationalization) {
		var msg = ctrl.errorController['errorMessage_' + errorCode];
		if (!msg) {
			msg = internationalization.getFormatted('components.form-validation.' + errorCode);
		}
		return msg;
	}

	angular.module('mx.components')
		.directive('mxFormErrors', function () {
			return {
				restrict: 'E',
				controller: MxFormErrorsCtrl,
				controllerAs: 'vm',
				require: ['?^form'],
				scope: {},
				templateUrl: 'mx-form-errors/mx-form-errors.html',
				link: function (scope, element, attrs, ctrls) {
					scope.vm.initialize(ctrls[0], attrs);
				},
				bindToController: {
					errors: '=',
					validationStatus: '&'
				}
			};
		})
		.directive('mxControlErrors', function () {
			return {
				restrict: 'E',
				controller: MxControlErrorsCtrl,
				controllerAs: 'vm',
				require: ['?^form', '?^ngModel'],
				scope: {},
				template: '<div ng-show="vm.errorMessages" class="mx-form-validation" ng-bind-html="vm.errorMessages"></div>',
				link: function (scope, element, attrs, ctrls) {
					scope.vm.initialize(ctrls[0], ctrls[1], attrs);
				}
			};
		});

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.Forms = w.mx.components.Forms || {};
	w.mx.components.Forms.ErrorMessage = MxFormErrorMessage;
})(window);

(function () {
	'use strict';

	MxFormCtrl.$inject = [];

	function MxFormCtrl() {
	}

	angular.module('mx.components').directive('mxForm', function () {
		return {
			restrict: 'AE',
			replace: true,
			scope: {},
			bindToController: {
				objectId: '=',
				displayStrings: '=',
				disabled: '=',
				readOnly: '='
			},
			controller: MxFormCtrl,
			controllerAs: 'vm'
		};
	});
})();

(function (w) {
	'use strict';

	var mxFormControlBase = function (controller, templateUrl) {
		return {
			restrict: 'E',
			require: ['?ngModel','?^mxForm'],
			link: function (scope, element, attrs, ctrls) {
				var vm = scope.vm;
				vm.controlNgModel = ctrls[0];
				var form = ctrls[1] || {};


				Object.defineProperty(vm, '_readOnly', {
					get: function () {
						return vm.readOnly || form.readOnly;
					}
				});

				Object.defineProperty(vm, '_disabled', {
					get: function () {
						return vm.disabled || form.disabled;
					}
				});

				if (vm.controlNgModel) {
					vm.controlNgModel.label = vm.label;
				}
			},
			templateUrl: templateUrl,
			controller: controller,
			controllerAs: 'vm',
			scope:{

			},
			bindToController: {
				name: '@',
				label: '@',
				disabled: '=',
				readOnly: '=',
				model:'=ngModel',
				onChange: '&'
			}
		};
	};

	var mxFormControlControllerBase = function (internationalization, $timeout) {
		var vm = this;
		vm.name = vm.name || 'c' + mx.components.Utils.guid();
		vm.internalName = vm.name + '_int';
		setValue(vm.model, true);


		Object.defineProperty(vm, 'model', {
			get: function () {
				return vm._model;
			},
			set: setValue
		});

		function setValue(value, skipEvent) {
			if (value === vm._model) {
				return;
			}
			if (typeof vm.onValueChanging === 'function') {
				value = vm.onValueChanging(value);
			}
			var oldVal = vm._model;
			vm._model = value;

			if (!skipEvent && oldVal !== value && vm.onChange) {
				//We must wait next digest circle for get actual value in the onChange
				if($timeout){
					$timeout(function () {
						vm.onChange();
					});
				} else {
					vm.onChange();
				}

			}
		}
	};

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.FormControlBase = mxFormControlBase;
	w.mx.components.FormControlControllerBase = mxFormControlControllerBase;
})(window);

(function () {
	'use strict';

	angular.module('mx.components').directive('mxFileUploader', function () {

		MxFileUploaderCtrl.$inject = [];

		function MxFileUploaderCtrl() {
			var vm = this;

			vm.files = vm.files || [];

			vm.filesSelected = filesSelected;
			vm.removeFile = removeFile;

			return vm;

			function filesSelected(files) {
				if (!files || !files.length) {
					return;
				}
				for (var i = 0; i < files.length; i++) {
					vm.files.push(files[i]);
				}
			}

			function removeFile(file) {
				var index = vm.files.indexOf(file);
				if (index !== -1) {
					vm.files.splice(index, 1);
				}
			}

		}

		return {
			restrict: 'E',
			scope: {},
			bindToController: {
				files: '='
			},
			controller: MxFileUploaderCtrl,
			controllerAs: 'vm',
			templateUrl: 'mx-file-uploader/mx-file-uploader.html'
		};
	});
})();

(function () {
	'use strict';

	angular.module('mx.components').directive('mxFeedback', [
		'$http',
		'$templateCache',
		'$compile',
		'$q',
		'$timeout',
		'$mdToast',
		'$location',
		'$rootScope',
		'mx.internationalization',
		function (
			$http,
			$templateCache,
			$compile,
			$q,
			$timeout,
			$mdToast,
			$location,
			$rootScope,
			internationalization
		) {
			function MxFeedbackController() {
				var vm = this;
				vm.dialogActive = false;
				vm.showPreview = false;
				vm.toggleDialog = toggleDialog;
				vm.sendFeedback = sendFeedback;
				return vm;

				function toggleDialog(onComplete) {
					vm.dialogActive = !vm.dialogActive;
					$timeout(function () {
						if (!vm.dialogActive) {
							vm.feedback.AttachScreen = false;
						}
						if (onComplete) {
							onComplete();
						}
					}, 0);
				}

				function sendFeedback(feedback) {
					vm.errors.feedbackError = false;
					vm.validationError = '';
					var validation = validate(feedback);
					if (!validation.Result) {
						vm.errors.feedbackError = true;
						vm.validationError = validation.Errors.join('<br />');
						return;
					}
					vm.sendFeedbackSendBtnDisabled = true;
					sendData(feedback).then(function () {
						vm.sendFeedbackSendBtnDisabled = false;
					});
				}

				function validate(feedback) {
					return {
						Result: !!feedback.Description,
						Errors: [vm.internationalization.error1]
					};
				}

				function sendData(feedback) {
					var context = vm.context();
					if (typeof context === 'undefined') {
						context = null;
					}

					return $q.when(context).then(function (value) {
						feedback.Context = (value ? value + '\\' : '') + $location.absUrl();
						var result = vm.send({feedback: feedback});
						if (typeof result === 'undefined') {
							result = null;
						}
						return result;
					}).then(function (data) {
						complete(vm);
						return data;
					});
				}
			}

			function complete(vm) {
				vm.toggleDialog(function () {
					initFeedback(vm);
				});
			}

			function initFeedback(vm) {
				vm.feedback = {
					Application: vm.application || 'Pandora Web Client',
					Rating: '5',
					Description: '',
					Files: null,
					AttachScreen: null
				};
			}

			function link(scope, element, attr, vm) {
				var _unregisterLocationListener;
				element.addClass('feedback-control-container');
				initFeedback(vm);
				var isEnabled = vm.isEnabled();
				if (typeof isEnabled === 'undefined') {
					isEnabled = true;
				}
				if (!isEnabled) {
					return;
				}
				isEnabled = $q.when(isEnabled);
				isEnabled.then(function (value) {
					if (!value) {
						return;
					}
					$http.get('mx-feedback/mx-feedback.html', {cache: $templateCache}).then(function (response) {
						var template = $compile(response.data)(scope);
						element.append(template);
						load(scope);
					});
				});

				function isCanvasSupported() {
					var elem = document.createElement('canvas');
					return !!(elem.getContext && elem.getContext('2d'));
			}

				function load(scope) {
					vm.internationalization = internationalization.get('components.mx-feedback');
					vm.errors = {feedbackError: false};

					_unregisterLocationListener = $rootScope.$on('$locationChangeStart', function () {
						if (vm.dialogActive) {
							vm.toggleDialog();
						}
					});

					scope.$watch('vm.feedback.AttachScreen', function (value) {
						if (value !== true) {
							vm.feedback.Files = null;
							vm.showPreview = false;
							return;
						}
						if (!isCanvasSupported()) {
							var preset = $mdToast.simple()
								.content(vm.internationalization.warning)
								.hideDelay(2000);
							$mdToast.show(preset);
							vm.feedback.AttachScreen = false;
							return;
						}

						window.html2canvas(document.body, {
							onrendered: function (canvas) {
								var data = canvas.toDataURL();
								var previewImage = $('.feedback__attachment-preview img');
								previewImage.attr('src', data);
								var index = data.indexOf('base64,');
								index = index === -1 ? 0 : index + 7;
								vm.feedback.Files = [{Name: 'screenshot.png', Format: 1, Data: data.substring(index)}];
								vm.showPreview = true;
								scope.$apply();
							}
						});
					});

					element.on('$destroy', _unregisterLocationListener);
				}
			}

			return {
				restrict: 'E',
				scope: {
					isEnabled: '&',
					context: '&',
					send: '&',
					application: '@',
					topOffset: '@'
				},
				bindToController: true,
				controller: MxFeedbackController,
				controllerAs: 'vm',
				link: link
			};
		}]);
})();

(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxDropdown
	 * @module mx.components
	 * @restrict E
	 *
	 * @description
	 * Implement a button with dropdown menu for some actions
	 *
	 * The following example shows hot to use mxDropdown.
	 * mxDropdown expects 2 attributes:
	 *   1) icon - icon for button which opens dropdown menu.
	 *        Value should be the same as for 'md-svg-icon' attribute in 'md-icon' directive ( https://material.angularjs.org/latest/#/api/material.components.icon/directive/mdIcon )
	 *   2) items - an array of objects with keys: 'icon', 'label', 'onItemClick', 'htmlClass'
	 *        2.1) icon - an icon on item (not mandatory)
	 *        2.2) label - a text label on item (not mandatory)
	 *        2.3) onItemClick - a function, which will be executed when item is selected in dropdown menu
	 *        2.4) htmlClass - can be used if we need to identify dropdown-item in DOM-model (not mandatory)
	 *   3) expanded - if pass 'true' - then dropdown menu will be opened automatically. Also it's possible to read value to get know if dropdown menu is expanded.
	 *   4) hideButton - if 'true' - open-button will be hidden (for example if we want to trigger dropdown menu expanting by some other event)
	 *
	 * Example 1:
	 * Assume we have an array of items like this:
	 * ```js
	 * vm.menuItems = [{
	 *		icon: 'save',
	 *		label: 'Save',
	 *		onItemClick: function() {alert('saved!'); }
	 *	}, {
	 *		icon: 'social:android',
	 *		label: 'Load on phone',
	 *		onItemClick: function() {alert('Loaded!'); }
	 *	},
	 *    ...
	 * ];
	 *```
	 *
	 * Then html will be like this:
	 * ```html
	 * <mx-dropdown
	 *        icon="vertical-dots"
	 *        items="vm.menuItems"
	 *        context="vm">
	 * </mx-dropdown>
	 * ```
	 * If "context" attribute is passed, then "onItemClick" will be executed in this passed context.
	 *
	 * Example 2:
	 * ```html
	 * <button ng-click="vm.isOpen = !vm.isOpen">My Button</button>
	 * ...
	 * <mx-dropdown
	 *        icon="vertical-dots"
	 *        items="vm.menuItems"
	 *        hide-button="true"
	 *        expanded="vm.isOpen">
	 * </mx-dropdown>
	 * ```
	 *
	 *
	 **/

	angular.module('mx.components').directive('mxDropdown', function () {

		MxListCtrl.$inject = ['$q', '$document', '$scope', '$timeout', '$element'];

		function MxListCtrl($q, $document, $scope, $timeout, $element) {
			var vm = this;
			var _preventCurrentOutClickClosing;

			vm.expanded = false;
			vm.handleBtnClick = handleBtnClick;
			vm.hideButton = angular.lowercase(vm.hideButton);
			vm.handleClick = handleClick;

			var itemsLoaded = false;
			$scope.$watch('vm.expanded', function () {
				_preventCurrentOutClickClosing = true;
				if (vm.expanded) {
					var postponeOffsetVerification = false;
					if (!itemsLoaded) {
						itemsLoaded = true;
						var items = vm.loadItems({context: vm.context});
						if (items) {
							postponeOffsetVerification = true;
							$q.when(items).then(function (items) {
								vm.items = items;
								verifyOffset();
							});
						}
					}
					if (!postponeOffsetVerification) {
						verifyOffset();
					}
					$document.bind('click', clickOutside);
					$element.addClass('mx-dropdown-expanded');
				} else {
					$document.unbind('click', clickOutside);
					$element.removeClass('mx-dropdown-expanded');
				}
			});

			function verifyOffset() {
				$timeout(function () {
					var drop = $element.find('md-whiteframe');
					if (!mx.components.Utils.elementInViewport(drop[0])) {
						drop.addClass('mx-dropdown-list-wrap-up');
					}
					drop.css('visibility', 'visible');
				}, 10);
			}

			function handleBtnClick() {
				_preventCurrentOutClickClosing = true;
				vm.expanded = !vm.expanded;
			}

			function clickOutside() {
				if (_preventCurrentOutClickClosing) {
					_preventCurrentOutClickClosing = false;
				} else {
					$timeout(function () {
						vm.expanded = false;
					});
				}
			}

			function handleClick(event, item) {
				item.onItemClick.call(vm.context, event);
			}

			return vm;
		}

		return {
			restrict: 'E',
			scope: {},
			bindToController: {
				icon: '@',
				items: '=',
				expanded: '=',
				hideButton: '@',
				context: '=',
				loadItems: '&'
			},
			controller: MxListCtrl,
			controllerAs: 'vm',
			templateUrl: 'mx-dropdown/mx-dropdown.html'
		};
	});
})();

(function () {
	'use strict';

	angular.module('mx.components')
		.directive('mxDraggable', ['mx.components.DragNDropUtils', '$parse', function (dragNDropUtils, $parse) {
			return {
				restrict: 'A',
				link: function (scope, element, attr) {
					element.attr('draggable', true);
					element.on('dragstart', function (event) {
						var data = null;
						if (attr.mxDraggable) {
							data = $parse(attr.mxDraggable)(scope);
						}
						if (data) {
							dragNDropUtils.setDropData(event, data);
						}
					});
				}
			};

		}])
		.directive('mxDroppable', ['$parse', function ($parse) {
			return {
				restrict: 'A',
				link: function (scope, element, attr) {
					element.attr('allow-drop', true)
						.on('drop', function (event) {
							event.preventDefault();
							event.stopPropagation();
							element.removeClass('mx-drag-hover');
							if (attr.mxDroppable) {
								$parse(attr.mxDroppable)(scope, {$event: event});
							}
						})
						.on('dragover', function (event) {
							event.preventDefault();
							event.stopPropagation();
							element.addClass('mx-drag-hover');
						})
						.on('dragleave', function (event) {
							event.preventDefault();
							event.stopPropagation();
							element.removeClass('mx-drag-hover');
						});
				}
			};

		}])
		.factory('mx.components.DragNDropUtils', ['mx.internationalization', function (internationalization) {
			var service = {
				getDropData: getDropData,
				setDropData: setDropData
			};

			return service;

			function getDropData(event) {
				var dataTransfer = event.dataTransfer || event.originalEvent && event.originalEvent.dataTransfer;
				if (dataTransfer) {
					return JSON.parse(dataTransfer.getData('text'));
				} else {

					throw new Error(internationalization.get('components.errors.can_no_access_data_transfer_object'));
				}
			}

			function setDropData(event, value) {
				var dataTransfer = event.dataTransfer || event.originalEvent && event.originalEvent.dataTransfer;
				if (dataTransfer) {
					dataTransfer.setData('text', JSON.stringify(value));
				} else {
					throw new Error(internationalization.get('components.errors.can_no_access_data_transfer_object'));
				}
			}
		}]);
})();

(function (w) {
	'use strict';

	MxDateTimePickerCtrl.$inject = [
		'$scope',
		'$element',
		'$attrs',
		'$compile',
		'$timeout',
		'$window',
		'$mdUtil',
		'$$rAF',
		'mx.internationalization',
		'$filter'
	];
	function MxDateTimePickerCtrl(
		$scope,
		$element,
		$attrs,
		$compile,
		$timeout,
		$window,
		$mdUtil,
		$$rAF,
		internationalization,
		$filter
	) {

		this.$scope = $scope;
		this.$element = $element;
		this.$attrs = $attrs;
		this.$compile = $compile;
		this.$timeout = $timeout;
		this.$window = $window;
		this.$mdUtil = $mdUtil;
		this.$$rAF = $$rAF;
		this.$$rAF = $$rAF;
		this.$filter = $filter;

		/**
		 * The root document element. This is used for attaching a top-level click handler to
		 * close the calendar panel when a click outside said panel occurs. We use `documentElement`
		 * instead of body because, when scrolling is disabled, some browsers consider the body element
		 * to be completely off the screen and propagate events directly to the html element.
		 * @type {!angular.JQLite}
		 */
		this.documentElement = angular.element(document.documentElement);
		/** @type {HTMLInputElement} */
		this.inputElement = $element[0].querySelector('input');
		/** @final {!angular.JQLite} */
		this.ngInputElement = angular.element(this.inputElement);
		/** @type {HTMLElement} */
		this.inputContainer = $element[0].querySelector('.md-datepicker-input-container, .md-datetimepicker-input-container');
		/** @type {HTMLElement} Floating calendar pane. */
		this.calendarPane = $element[0].querySelector('.md-datepicker-calendar-pane');
		/** @type {HTMLElement} Calendar icon button. */
		this.calendarButton = $element[0].querySelector('.md-datepicker-button');
		/**
		 * Element covering everything but the input in the top of the floating calendar pane.
		 * @type {HTMLElement}
		 */
		//this.inputMask = $element[0].querySelector('.md-datepicker-input-mask-opaque');

		/** Pre-bound click handler is saved so that the event listener can be removed. */
		this.bodyClickHandler = angular.bind(this, this.handleBodyClick);

		this.windowResizeHandler = $mdUtil.debounce(angular.bind(this, this.closeCalendarPane), 100);

		// Unless the user specifies so, the datepicker should not be a tab stop.
		// This is necessary because ngAria might add a tabindex to anything with an ng-model
		// (based on whether or not the user has turned that particular feature on/off).
		if (!$attrs.tabindex) {
			$element.attr('tabindex', '-1');
		}

		var vm = this;
		$scope.$on('$destroy', function () {
			vm.detachCalendarPane();
		});

		$scope.$watch('vm.value', function (value) {
			vm._formatedValue = $filter('date')(value, 'short');
		});

		var _value = null;
		var internalSet = false;

		Object.defineProperty(vm, 'value', {
			get: function () {
				return _value;
			},
			set: function (value) {
				_value = value;
				internalSet = true;
				if (vm.isoString && value) {
					vm.model = value.toISOString();
				} else {
					vm.model = value;
				}
				internalSet = false;
			}
		});

		vm.isoString = vm.isoString && vm.isoString.toLowerCase() !== 'false';
		this.onValueChanging = function (value) {
			if (!internalSet) {
				_value = typeof value === 'string' && vm.isoString ? new Date(value) : value;
			}

			return value;
		};
		w.mx.components.FormControlControllerBase.call(this, internationalization);

		return vm;
	}

	MxDateTimePickerCtrl.prototype.onSave = function () {
		this.closeCalendarPane();
	};

	MxDateTimePickerCtrl.prototype.onCancel = function () {
		this.closeCalendarPane();
	};

	/** Position and attach the floating calendar to the document. */
	MxDateTimePickerCtrl.prototype.attachCalendarPane = function () {
		var calendarPane = this.calendarPane;
		calendarPane.style.transform = '';
		this.$element.addClass('md-datepicker-open');

		var elementRect = this.inputContainer.getBoundingClientRect();
		var bodyRect = document.body.getBoundingClientRect();

		// Check to see if the calendar pane would go off the screen. If so, adjust position
		// accordingly to keep it within the viewport.
		var paneTop = elementRect.top - bodyRect.top;
		var paneLeft = elementRect.left - bodyRect.left;

		// If ng-material has disabled body scrolling (for example, if a dialog is open),
		// then it's possible that the already-scrolled body has a negative top/left. In this case,
		// we want to treat the "real" top as (0 - bodyRect.top). In a normal scrolling situation,
		// though, the top of the viewport should just be the body's scroll position.
		var viewportTop = bodyRect.top < 0 && document.body.scrollTop === 0 ?
			-bodyRect.top :
			document.body.scrollTop;

		var viewportLeft = bodyRect.left < 0 && document.body.scrollLeft === 0 ?
			-bodyRect.left :
			document.body.scrollLeft;

		var viewportBottom = viewportTop + this.$window.innerHeight;
		var viewportRight = viewportLeft + this.$window.innerWidth;

		// If the right edge of the pane would be off the screen and shifting it left by the
		// difference would not go past the left edge of the screen. If the calendar pane is too
		// big to fit on the screen at all, move it to the left of the screen and scale the entire
		// element down to fit.
		if (paneLeft + CALENDAR_PANE_WIDTH > viewportRight) {
			if (viewportRight - CALENDAR_PANE_WIDTH > 0) {
				paneLeft = viewportRight - CALENDAR_PANE_WIDTH;
			} else {
				paneLeft = viewportLeft;
				var scale = this.$window.innerWidth / CALENDAR_PANE_WIDTH;
				calendarPane.style.transform = 'scale(' + scale + ')';
			}

			calendarPane.classList.add('md-datepicker-pos-adjusted');
		}

		// If the bottom edge of the pane would be off the screen and shifting it up by the
		// difference would not go past the top edge of the screen.
		if (paneTop + CALENDAR_PANE_HEIGHT > viewportBottom &&
			viewportBottom - CALENDAR_PANE_HEIGHT > viewportTop) {
			paneTop = viewportBottom - CALENDAR_PANE_HEIGHT;
			calendarPane.classList.add('md-datepicker-pos-adjusted');
		}

		calendarPane.style.left = paneLeft + 'px';
		calendarPane.style.top = paneTop + 'px';
		document.body.appendChild(calendarPane);

		// The top of the calendar pane is a transparent box that shows the text input underneath.
		// Since the pane is floating, though, the page underneath the pane *adjacent* to the input is
		// also shown unless we cover it up. The inputMask does this by filling up the remaining space
		// based on the width of the input.
		//this.inputMask.style.left = elementRect.width + 'px';

		// Add CSS class after one frame to trigger open animation.
		this.$$rAF(function () {
			calendarPane.classList.add('md-pane-open');
		});

	};


	/** Detach the floating calendar pane from the document. */
	MxDateTimePickerCtrl.prototype.detachCalendarPane = function () {
		this.$element.removeClass('md-datepicker-open');
		this.calendarPane.classList.remove('md-pane-open');
		this.calendarPane.classList.remove('md-datepicker-pos-adjusted');

		if (this.calendarPane.parentNode) {
			// Use native DOM removal because we do not want any of the angular state of this element
			// to be disposed.
			this.calendarPane.parentNode.removeChild(this.calendarPane);
		}
	};


	/**
	 * Open the floating calendar pane.
	 * @param {Event} event
	 */
	MxDateTimePickerCtrl.prototype.openCalendarPane = function (event) {
		if (!this.isCalendarOpen && !this.disabled) {
			this.isCalendarOpen = true;
			this.calendarPaneOpenedFrom = event.target;

			// Because the calendar pane is attached directly to the body, it is possible that the
			// rest of the component (input, etc) is in a different scrolling container, such as
			// an md-content. This means that, if the container is scrolled, the pane would remain
			// stationary. To remedy this, we disable scrolling while the calendar pane is open, which
			// also matches the native behavior for things like `<select>` on Mac and Windows.
			this.$mdUtil.disableScrollAround(this.calendarPane);

			this.attachCalendarPane();
			//this.focusCalendar();

			// Attach click listener inside of a timeout because, if this open call was triggered by a
			// click, we don't want it to be immediately propogated up to the body and handled.
			var vm = this;
			this.$mdUtil.nextTick(function () {
				// Use 'touchstart` in addition to click in order to work on iOS Safari, where click
				// events aren't propogated under most circumstances.
				// See http://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
				vm.documentElement.on('click touchstart', vm.bodyClickHandler);
			}, false);

			window.addEventListener('resize', this.windowResizeHandler);
		}
	};

	/** Close the floating calendar pane. */
	MxDateTimePickerCtrl.prototype.closeCalendarPane = function () {
		if (this.isCalendarOpen) {
			this.isCalendarOpen = false;
			this.detachCalendarPane();
			this.calendarPaneOpenedFrom.focus();
			this.calendarPaneOpenedFrom = null;
			this.$mdUtil.enableScrolling();

			//this.ngModelCtrl.$setTouched();

			this.documentElement.off('click touchstart', this.bodyClickHandler);
			window.removeEventListener('resize', this.windowResizeHandler);
		}
	};


	/** Focus the calendar in the floating pane. */
	MxDateTimePickerCtrl.prototype.focusCalendar = function () {
		// Use a timeout in order to allow the calendar to be rendered, as it is gated behind an ng-if.
		var self = this;
		this.$mdUtil.nextTick(function () {
			self.getCalendarCtrl().focus();
		}, false);
	};

	/** Gets the controller instance for the calendar in the floating pane. */
	MxDateTimePickerCtrl.prototype.getCalendarCtrl = function () {
		return angular.element(this.calendarPane.querySelector('md-calendar')).controller('mdCalendar');
	};


	/**
	 * Handles a click on the document body when the floating calendar pane is open.
	 * Closes the floating calendar pane if the click is not inside of it.
	 * @param {MouseEvent} event
	 */
	MxDateTimePickerCtrl.prototype.handleBodyClick = function (event) {
		if (this.isCalendarOpen) {
			var isInCalendar = this.$mdUtil.getClosest(event.target, 'mx-date-time-control');
			if (!isInCalendar) {
				this.closeCalendarPane();
			}
			this.$scope.$digest();
		}
	};


	/** Additional offset for the input's `size` attribute, which is updated based on its content. */
	//var EXTRA_INPUT_SIZE = 3;

	/** Class applied to the container if the date is invalid. */
	//var INVALID_CLASS = 'md-datepicker-invalid';

	/** Default time in ms to debounce input event by. */
	//var DEFAULT_DEBOUNCE_INTERVAL = 500;

	/**
	 * Height of the calendar pane used to check if the pane is going outside the boundary of
	 * the viewport. See calendar.scss for how $md-calendar-height is computed; an extra 20px is
	 * also added to space the pane away from the exact edge of the screen.
	 *
	 *  This is computed statically now, but can be changed to be measured if the circumstances
	 *  of calendar sizing are changed.
	 */
	var CALENDAR_PANE_HEIGHT = 368;

	/**
	 * Width of the calendar pane used to check if the pane is going outside the boundary of
	 * the viewport. See calendar.scss for how $md-calendar-width is computed; an extra 20px is
	 * also added to space the pane away from the exact edge of the screen.
	 *
	 *  This is computed statically now, but can be changed to be measured if the circumstances
	 *  of calendar sizing are changed.
	 */
	var CALENDAR_PANE_WIDTH = 360;


	angular.module('mx.components').directive('mxDateTimePicker', function () {
		var directive = new mx.components.FormControlBase(MxDateTimePickerCtrl, 'mx-date-picker/mx-date-time-picker.html');
		angular.extend(directive.bindToController,
			{
				minDate: '@',
				maxDate: '@',
				ngRequired: '=',
				isoString: '@',
				displayMode: '@'
			});
		return directive;
	}).directive('mxDateTimeControl', function () {

		MxDateTimeControlCtrl.$inject = ['mx.internationalization'];
		function MxDateTimeControlCtrl(internationalization) {
			var vm = this;
			w.mx.components.FormControlControllerBase.call(this, internationalization);

			return vm;
		}

		var directive = new mx.components.FormControlBase(MxDateTimeControlCtrl, 'mx-date-picker/mx-date-time-control.html');
		angular.extend(directive.bindToController,
			{
				minDate: '@',
				maxDate: '@',
				ngRequired: '=',
				onCancel: '&',
				onSave: '&',
				isoString: '@',
				displayMode: '@'
			});
		return directive;
	});
})(window);

(function () {
	'use strict';

	MxDatePickerCtrl.$inject = ['mx.internationalization','$element'];

	function MxDatePickerCtrl(internationalization,$element) {
		var vm = this;
		var internalSet = false;
		var _value = null;
		vm.isFocused = false;
		vm.isoString = vm.isoString && vm.isoString.toLowerCase() !== 'false';

		this.onValueChanging = function(value) {
			if (!internalSet) {
				_value = typeof value === 'string' &&  vm.isoString ? new Date(value) : value;
			}

			return value;
		};

		Object.defineProperty(vm, 'value', {
			get: function () {
				return _value;
			},
			set: function (value) {
				_value = value;
				internalSet = true;
				if(vm.isoString && value) {
					vm.model = value.toISOString();
				} else {
					vm.model = value;
				}
				internalSet = false;
			}
		});

		mx.components.FormControlControllerBase.call(this, internationalization);



		var dateInput = $element.find('input');
		dateInput.on('focus', function() {
			vm.isFocused = true;
		});

		dateInput.on('blur', function() {
			vm.isFocused = false;
		});

/*
		var oldValue = vm.model;
		var oldDate = getDate(vm.model);

		Object.defineProperty(vm, 'modelJs', {
			get:  function() {
				if(oldValue !== vm.model){
					oldValue = vm.model;
					oldDate = getDate(oldValue);
				}
				return oldDate;
			},
			set: function(value) {
				if(value !== oldDate){
					oldDate = value;
					oldValue = $filter('date')(oldDate,'yyyy-MM-ddTHH:mm:ss');
				}
				vm.model = oldValue;
			}
		});

		function getDate(date){
			return new Date($filter('date')(date));
		}*/


		return vm;
	}

	angular.module('mx.components').directive('mxDatePicker', function () {
		var directive =  new mx.components.FormControlBase(MxDatePickerCtrl, 'mx-date-picker/mx-date-picker.html');
		angular.extend(directive.bindToController,
			{
				minDate: '@',
				maxDate: '@',
				ngRequired: '=',
				isoString: '@'
			});
		return directive;
	});
})();


(function () {
	'use strict';

	var standardPageSizes = [10, 20, 50, 100];
	angular.module('mx.components')
		.directive('mxWorkspaceCommonPagingPanel', function () {
			MxWorkspaceCommonPagingPanelCtrl.$inject = ['$scope','mx.internationalization'];

			function MxWorkspaceCommonPagingPanelCtrl($scope, internationalization) {
				var vm = this;
				$scope.$watch('vm.preprocessor', function () {
					calculate();
				}, true);

				vm.prev = prev;
				vm.next = next;
				vm.pageSizes = standardPageSizes;
				vm.pagingLabel = '';
				vm.isNotNextPage = true;
				vm.isNotPrevPage = true;
				vm.isDisabled = false;

				Object.defineProperty(vm, 'pageSize', {
					get: function () {
						return vm.preprocessor.pageSize;
					},
					set: function(val) {
						if (val && vm.preprocessor.pageSize !== val) {
							vm.preprocessor.page = 0;
							vm.preprocessor.pageSize = val;
							vm.preprocessor.callChanged();
						}
					}
				});


				return vm;

				function prev() {
					if (vm.preprocessor.page > 0) {
						vm.preprocessor.page--;
						vm.preprocessor.callChanged();
					}
				}

				function next() {
					vm.preprocessor.page++;
					vm.preprocessor.callChanged();
				}

				function calculate() {
					var cnt = vm.preprocessor.count;
					var pageSize = vm.pageSize;
					if (vm.preprocessor.pageSizes) {
						vm.pageSizes = vm.preprocessor.pageSizes;
					}

					var pageNumber = vm.preprocessor.page;
					vm.isDisabled = vm.preprocessor.disable || false;

					if (vm.pageSizes.indexOf(pageSize) < 0) {
						var res = [];
						var prev = 0;
						vm.pageSizes.forEach(function (item) {
							if (pageSize < item && (!prev || prev < pageSize)) {
								res.push(pageSize);
							}
							res.push(item);
							prev = item;
						});
						vm.pageSizes = res;
					}

					vm.isNotPrevPage = pageNumber  === 0 || vm.isDisabled;

					if (cnt > 0) {
						var start = pageNumber * pageSize + 1;
						var end = start + pageSize - 1;
						if (end > cnt) {
							end = cnt;
						}

						vm.pagingLabel = start + ' - ' + end + ' ' + internationalization.get('components.mx-datasource-paging-panel.of', 'of') + ' ' + cnt;
						vm.isNotNextPage = end ===  cnt  || vm.isDisabled || vm.preprocessor.disableNext === true;

					} else {
						vm.pagingLabel = '';
						vm.isNotNextPage = true;
					}

				}
			}

			return {
				restrict: 'E',
				scope: {},
				bindToController: {
					preprocessor: '='
				},
				controller: MxWorkspaceCommonPagingPanelCtrl,
				controllerAs: 'vm',
				templateUrl: 'mx-datasource-paging-panel/mx-datasource-paging-panel.html'
			};
		});
})();


(function () {
	'use strict';

	MxCurrencyController.$inject = ['mx.internationalization'];

	function MxCurrencyController(internationalization) {
		var vm = this;
		mx.components.FormControlControllerBase.call(vm, internationalization);
		vm.validationPattern = /^(:?\d+)?\.?\d+?$/;
		return vm;
	}

	/**
	 * @ngdoc directive
	 * @name mx.components:mxCurrency
	 * @module mx.components
	 * @restrict 'E'
	 * @description
	 * The mx-currency control is used to display currency input field with currency code displayed.
	 *
	 * The control extends {@ref mx.components:FormControlBase FormControlBase} directive.
	 *
	 * @param {string} currencyCode@ - Currency code to be displayed.
	 * @usage <mx-currency ng-model="vm.currencyValue" data-label="Currency editor" currency-code="{{vm.currencyCode}}"></mx-currency>
	 */
	angular.module('mx.components').directive('mxCurrency', function () {
		var directive = new mx.components.FormControlBase(MxCurrencyController, 'mx-currency/mx-currency.html');
		angular.extend(directive.bindToController, {
			currencyCode: '@'
		});
		return directive;
	});
})();

(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxChoice
	 * @module mx.components
	 * @restrict 'E'
	 * @description
	 * The mx-choice control is used to create a form where the user can choose needed form and input required data.
	 *
	 * The example below demonstrates some of the attributes you may use with the mxChoice control:
	 * @param {object[]} panels= - Array of defined panels where each `item` contains following parameters:
	 *
	 *  - `id` - {string} - Unique identifier of panel template;
	 *  - `title` - {string} - The title of the panel. It will be rendered as radio button label;
	 *  - `name` - {string} - The name of the panel. This parameter is used to define selected panel;
	 *  - `position` - {int} - Index of panel position. Lower value defines higher position;
	 *  - `disabled` - {boolean} - N/A (currently is not supported).
	 * @param {string}    selectedPanelName= - Panel to be selected.
	 * @param {string}    parentControllerAs@  - This will init parent controller scope.
	 * @param {boolean}    showSwitchButtons= - This will show radio group for switching panels. Default: true
	 * @usage
	 *        <mx-choice
	 *            data-panels='[{id:"0", title:"Item 0", name:"panel0", disabled:"true", position: 0}, {id:"1", title:"Item 1", name:"panel1", disabled:"false", position: 1}]'
	 *            selected-panel-name='panel0'
	 *            show-switch-buttons='true'
	 *            >
	 *        </mx-choice>
	 *        <script type='text/ng-template'    id='0'>
	 *            <div>block0</div>
	 *            <mx-text-box ng-model="entity.text1" label="Label 0"></mx-text-box>
	 *        </script>
	 *        <script type='text/ng-template'    id='1'>
	 *            <div>block1</div>
	 *            <mx-checkbox ng-model="entity.text1" label="Label 1"></mx-checkbox>
	 *        </script>
	 */

	function mxChoice() {

		MxChoiceCtrl.$inject = ['$scope'];
		function MxChoiceCtrl($scope) {
			var vm = this;
			vm.showSwitchButtons = vm.showSwitchButtons !== false;

			vm.panels.sort(function(a, b) {
				if (a.position < b.position) {
					return -1;
				}
				if (a.position > b.position) {
					return 1;
				}
				return 0;
			});

			//TODO: should we display any default panel if `selectedPanelName` not set ?

			vm.initScope = function () {
				if (vm.parentControllerAs) {
					$scope[vm.parentControllerAs] = $scope.$parent[vm.parentControllerAs];
				} else {
					$scope.dataModel = $scope.$parent;
				}
			};

		}

		return {
			restrict: 'E',
			scope: {},
			bindToController: {
				panels: '=',
				selectedPanelName: '=',
				parentControllerAs: '@',
				showSwitchButtons: '='
			},
			templateUrl: 'mx-choice/mx-choice.html',
			controller: MxChoiceCtrl,
			controllerAs: '__$vm'
		};
	}

	angular.module('mx.components').directive('mxChoice', [mxChoice]);

})();

(function () {
	'use strict';

	MxCheckboxCtrl.$inject = ['mx.internationalization'];

	function MxCheckboxCtrl(internationalization) {
		mx.components.FormControlControllerBase.call(this, internationalization);
		var vm = this;

		return vm;
	}

	angular.module('mx.components').directive('mxCheckbox', function () {
		var directive = new mx.components.FormControlBase(MxCheckboxCtrl, 'mx-checkbox/mx-checkbox.html');
		return directive;
	});

})();


(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxCalendar
	 * @module mx.components
	 * @restrict E
	 *
	 * @description
	 * Visualizes data/event-items on calendar.
	 * mxCalendar expects `items` attribute as an array of objects with keys like:
	 * `title`, `start`, `end`, `allDay`.
	 * Full list of event options is the same as for `fullCalendar`
	 * and can be found here: http://fullcalendar.io/docs/event_data/Event_Object/
	 *
	 * @usage
	 * vm.items = [
	 * 		{title: 'Today event', start: new Date()},
	 * 		{title: 'First 2000 day', start: '2000-01-01'},
	 * 		...
	 * ]
	 * ```html
	 * <mx-calendar items="vm.items"></mx-calendar>
	 * ```
	 *
	 * An `on-item-click` attribute allows to set handler on event-item click.
	 * Handler function gets corresponding event-item-object as 'item' parameter
	 * and link to mouse click-event as 'event' parameter.
	 * ```html
	 * <mx-calendar
	 *		items="vm.items"
	 *		on-item-click="vm.itemClickHandler(item)">
	 *	</mx-calendar>
	 * ```
	 *
	 * An `on-range-select` attribute enable selection mode and
	 * allows to set handler for selection some date range on calendar.
	 * Handler function gets start-date, end-date and link to new just created event as parameters.
	 * ```html
	 * <mx-calendar
	 *		items="vm.items"
	 *		on-range-select="vm.dateRangeSelectionHanlder(start, end)">
	 *	</mx-calendar>
	 * ```
	 * `language` attribute allows to set localization (default: `en`).
	 *
	 *
	 * `mxCalendar` words via "load on demand" approach.
	 * To configure components Dir make like this:
	 * For config phase:
	 * ```js
	 * .config(['mx.components.LazyLoadCfgProvider', function (lazyLoadCfgProvider) {
	 * 		lazyLoadCfgProvider.setComponentsDir('my_components_root/');
	 * 	}])
	 * ```
	 * For executing phase:
	 * ```js
	 * .run('myCtrl', ['mx.components.LazyLoadCfg', function (lazyLoadCfg) {
	 * 		lazyLoadCfg.componentsDir = 'my_components_root/';
	 * 	}]);
	 * ```
	 *
	 **/

	 angular
	.module('mx.components')
	.directive('mxCalendar', [function () {

		MxCalendarCtrl.$inject = [
			'$scope',
			'$window',
			'$ocLazyLoad',
			'mx.components.LazyLoadCfg',
			'$element',
			'$attrs'
		];

		function MxCalendarCtrl(
			$scope,
			$window,
			$ocLazyLoad,
			lazyLoadCfg,
			$element,
			$attrs
		) {
			var vm = this;
			vm._items = [];

			$ocLazyLoad.setModuleConfig({
				name: 'ui.calendar',
				serie: true,
				files: [
					lazyLoadCfg.componentsDir + 'fullcalendar/dist/fullcalendar.css',
					lazyLoadCfg.componentsDir + 'fullcalendar/dist/fullcalendar.js',
					lazyLoadCfg.componentsDir + 'fullcalendar/dist/lang-all.js',
					lazyLoadCfg.componentsDir + 'angular-ui-calendar/src/calendar.js'
				]
			});

			// Calendar options
			vm.options = {
				header: {
					left: 'title',
					right: 'prev,today,next month,agendaWeek,agendaDay'
				},
				events: vm._items,
				eventLimit: true,
				defaultView: 'agendaWeek',
				height: 1200,
				eventClick: function(item, clickEvent) {
					vm.onItemClick({
						event: clickEvent,
						item: item,
						__context: item
					});
				}
			};

			if (vm.language) {
				vm.options.lang = vm.language;
			}

			$scope.$watch('vm.language', function (newLang) {
				if (newLang && newLang !== vm.options.lang) {
					vm.options.lang = newLang;
				}
			});

			// If attribute is set "on-range-select" then define handler
			if ($attrs.onRangeSelect) {
				vm.options.selectable = true;
				vm.options.select = function (start, end) {
					vm.onRangeSelect({
						start: window.moment(_convertToGlobalDate(start.toDate())),
						end: window.moment(_convertToGlobalDate(end.toDate()))
					});
				};
			}

			$scope.$watchCollection('vm.items', function (items) {
				if (Array.isArray(items) && items !== vm._items) {
					// Update vm._items instead of replacing
					vm._items.splice(0, vm._items.length);
					items.forEach(function (item) {
						if (typeof item.start === 'string' && !item.__startConvertedToLocal) {
							item.start = _convertToLocalDate(item.start).toISOString();
							item.__startConvertedToLocal = true;
						}
						if (typeof item.end === 'string' && !item.__endConvertedToLocal) {
							item.end = _convertToLocalDate(item.end).toISOString();
							item.__endConvertedToLocal = true;
						}
						return vm._items.push(item);
					});
				}
			});

			function _convertToLocalDate(date) {
				return _shiftDate(date, false);
			}

			function _convertToGlobalDate(date) {
				return _shiftDate(date, true);
			}

			function _shiftDate(date, forwart) {
				var inputDate = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
				var timeShift = new Date().getTimezoneOffset() * 60 * 1000;
				return new Date(inputDate.getTime() + (forwart ? 1 : -1) * timeShift);
			}

			// `require.js` workaround
			if (typeof $window.define === 'function' && $window.define.amd) {
				// There is a problem: `fullcalendar.js` is written with possiblity
				// to be loaded via `require.js` if it's included.
				// In out product it's included but not in used as it's expected.
				// Do we need `require.js` at all? That's another question.
				//
				//  Here is workaround: hide `require.js` for `fullcalendar.js` while it's loading.
				$window.__defineTmp = $window.define;
				$window.define = undefined;
				$scope.$on('ocLazyLoad.moduleLoaded', function(e, module) {
					if (module === 'ui.calendar') {
						$window.define = $window.__defineTmp;
						delete $window.__defineTmp;
					}
				});
				// Another wordaround can be like this:
				// load `fullcalendar.js` via `require.js`, so before
				// it's need to define needed modules and run initing process manually.
				//
				// Something like this:
				// ```
				//  	vm.readyToLoad = false;
				//		define('jquery', function () {return window.$});
				//		define('moment', function () {return window.moment});
				//		requirejs(['.../fullcalendar.js'], function () {
				//			$timeout(function() {vm.readyToLoad = true;});
				//		});
				//		......
				// 		<div ng-if="vm.readyToLoad">
				// 			<div oc-lazy-load="ui.calendar">
				//				<ui-calendar></ui-calendar>
				//			</div>
				//		</div>
				// ```
			}

			return vm;
		}

		return {
			restrict: 'E',
			scope: {},
			bindToController: {
				items: '=',
				onItemClick: '&',
				onRangeSelect: '&',
				language: '@'
			},
			controller: MxCalendarCtrl,
			controllerAs: 'vm',
			templateUrl: 'mx-calendar/mx-calendar.html'
		};
	}]);


})();

(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxButton
	 * @module mx.components
	 * @restrict 'E'
	 * @scope {}
	 * @description Custom button directive
	 * @param {string} label@ - Text to be displayed on button
	 * @param {string} icon@ - Name of Material Design icon to be displayed on button
	 * @param {string} styles@ - Styles to be applied to button <br /><i>Default: md-raised md-primary</i>
	 * @param {bool} focused@ - If true, a button should have input focus when the page loads <br /><i>Default: false</i>
	 * @param {function} click& - Button click handler
	 * @param {boolean} isDisabled= - Specifies if button is disabled
	 * @usage <mx-button click='clickFn' label='A button' icon='check' focused='false' styles='btn-style'></mx-button>
	 */
	angular.module('mx.components').directive('mxButton', function () {
		MxButtonCtrl.$inject = [];

		function MxButtonCtrl() {
		}

		return {
			restrict: 'E',
			scope: {},
			bindToController: {
				label: '@',
				icon: '@',
				styles: '@',
				click: '&',
				focused: '@',
				isDisabled: '='
			},
			controller: MxButtonCtrl,
			controllerAs: 'vm',
			templateUrl: 'mx-button/mx-button.html'
		};
	});
})();

(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxBottomSheet
	 * @module mx.components
	 * @restrict 'E'
	 * @scope {}
	 * @description Custom bottom sheet directive
	 * @usage <mx-bottom-sheet
	 *        top-offset='24px'
	 *        options='{
	 *			icon:'apps',
	 *			displayMode: 'grid',
	 *			controller: 'BottomSheetController'*
	 * 		}'>
	 * </mx-bottom-sheet>
	 * @param {string} top-offset= The offset regarding top position of his parent element:
	 * @param {object} options= An options object, with the following properties:
	 *   - `icon`        - `{string=}`: The icon to associate with button showing this bottom sheet.
	 *   - `displayMode`- `{string=}`: Represents one of two modes of displaying: 'grid' or 'list'.
	 *   - `controller` - `{string=}`: The controller to associate with this bottom sheet.
	 */
	angular.module('mx.components').directive('mxBottomSheet', [
		'$http',
		'$templateCache',
		'$compile',
		'$mdBottomSheet',
		'$q',
		'$window',
		'$mdUtil',
		'mx.internationalization',
		function ($http, $templateCache, $compile, $mdBottomSheet, $q, $window, $mdUtil, internationalization) {

			function MxBottomSheetCtrl() {
				var vm = this;
				vm.dialogActive = false;
				vm.toggleDialog = toggleDialog;
				vm.executeItem = executeItem;
				vm.focusItem = focusItem;
				vm.closeBottomSheet = closeBottomSheet;

				var window = angular.element($window);
				window.on('click', function ($event) {
					if (vm.dialogActive) {
						vm.closeBottomSheet();
						$event.stopPropagation();
					}
				});

				return vm;

				function closeBottomSheet() {
					if (vm.dialogActive) {
						// $mdBottomSheet.hide();
						$mdUtil.nextTick($mdBottomSheet.cancel, true);
						vm.dialogActive = false;
					}
				}

				function toggleDialog(options) {
					if (vm.dialogActive) {
						vm.closeBottomSheet();
					}
					else {
						var _templateUrl = 'mx-bottom-sheet/' + (options.displayMode === 'grid' ? 'mx-bottom-sheet-grid-template.html' : 'mx-bottom-sheet-list-template.html');

						$mdBottomSheet.show({
							templateUrl: _templateUrl,
							controller: options.controller,
							//disableBackdrop: true,
							disableParentScroll: false,
							parent: vm.parent,
							controllerAs: 'vm',
							bindToController: true,
							locals: {
								execute: vm.executeItem,
								focus: vm.focusItem,
								topOffset: vm.topOffset
							}
						});

						vm.dialogActive = true;
					}
				}

				function executeItem(item) {
					vm.closeBottomSheet();

					if (angular.isDefined(item) && angular.isFunction(item.execute)) {
						item.execute();
					}
				}

				function focusItem(item) {
					if (angular.isDefined(item) && angular.isDefined(item.isFocused)) {
						return item.isFocused;
					}

					return false;
				}
			}

			function link(scope, element, attr, vm) {
				element.addClass('bottom-sheet-control-container');

				var isEnabled = vm.isEnabled();
				if (angular.isUndefined(isEnabled)) {
					isEnabled = true;
				}
				if (!isEnabled) {
					return;
				}
				isEnabled = $q.when(isEnabled);
				isEnabled.then(function (value) {
					if (!value) {
						return;
					}
					$http.get('mx-bottom-sheet/mx-bottom-sheet.html', {cache: $templateCache}).then(function (response) {
						var template = $compile(response.data)(scope);
						element.append(template);
						load(scope);
					});
				});

				function load() {
					vm.internationalization = internationalization.get('components.mx-bottom-sheet');

					vm.parent = element[0];
				}
			}

			return {
				restrict: 'E',
				scope: {
					isEnabled: '&',
					topOffset: '@',
					options: '='
				},
				bindToController: true,
				controller: MxBottomSheetCtrl,
				controllerAs: 'vm',
				link: link
			};
		}]);
})();

(function () {
	'use strict';

	angular.module('mx.components').directive('mxAccordion', function () {

		MxAccordionCtrl.$inject = [];

		function MxAccordionCtrl() {
			var vm = this;
			vm.addItem = addItem;
			vm.onItemToggle = onItemToggle;


			var items = [];

			return vm;

			function addItem(item) {
				if (items.length === 0) {
					item.expanded = true;
				}
				items.push(item);
			}

			function onItemToggle(toggledItem) {
				if (!toggledItem.expanded || vm.toggleSeparate) {
					return;
				}
				angular.forEach(items, function (item) {
					if (item.expanded && item !== toggledItem) {
						item.expanded = false;
					}
				});
			}
		}

		return {
			restrict: 'E',
			transclude: true,
			scope: {},
			bindToController: {
				toggleSeparate: '='
			},
			controller: MxAccordionCtrl,
			controllerAs: 'vm',
			template: '<ul ng-transclude></ul>'
		};
	});
})();

(function () {
	'use strict';

	angular.module('mx.components').directive('mxAccordionItem', function () {

		MxAccordionItemCtrl.$inject = [];

		function MxAccordionItemCtrl() {
			var vm = this;
			vm.expanded = vm.isExpanded && vm.isExpanded.toLowerCase() === 'true';
			vm.toggle = toggle;
			return vm;

			function toggle() {
				vm.expanded = !vm.expanded;
				if (typeof vm.onToggle === 'function') {
					vm.onToggle(vm);
				}
			}
		}

		return {
			restrict: 'E',
			require: '^mxAccordion',
			transclude: true,
			replace: true,
			scope: {},
			bindToController: {
				label: '=',
				isExpanded: '@'
			},
			link: function (scope, element, attrs, accordionCtrl) {
				accordionCtrl.addItem(scope.vm);
				scope.vm.onToggle = accordionCtrl.onItemToggle;
			},
			controller: MxAccordionItemCtrl,
			controllerAs: 'vm',
			templateUrl: 'mx-accordion/mx-accordion-item.html'
		};
	});
})();

(function () {
	'use strict';

	angular.module('mx.components').directive('mxAccordionGroup', function () {

		MxAccordionGroupCtrl.$inject = [];

		function MxAccordionGroupCtrl() {
			var vm = this;
			return vm;
		}

		return {
			restrict: 'E',
			replace: true,
			scope: {},
			bindToController: {
				label: '='
			},
			controller: MxAccordionGroupCtrl,
			controllerAs: 'vm',
			templateUrl: 'mx-accordion/mx-accordion-group.html'
		};
	});
})();

(function (w) {
	'use strict';

	//angular.module('mx.components').factory('mxDropZone', ['$timeout', MxDropZone]);

	function MxDropZone($timeout, vm) {
		//var worker;
		//if(w.Worker){
		//	worker = new w.Worker('bower_components\\mx.components\\mx-attachments\\mx-drop-zone.lazy.js');
		//	worker.addEventListener('message', function(e) {
		//		console.log(e.data);
		//	}, false);
		//}
		var processingQueue = [];

		var formatUrl = function (url) {
			return vm.formatUrl({url: url});
		};
		var makeUploadUrl = function (file) {
			return vm.makeUploadUrl({file: file});
		};
		return {
			init: init,
			createThumbnail: createThumbnail,
			processSelectedFiles: processSelectedFiles
		};

		function init(container) {
			addEventHandler(container, 'dragover', cancel);
			addEventHandler(container, 'dragenter', cancel);
			addEventHandler(container, 'drop', dropEvent);
		}

		function processFile(file) {
			processingQueue.push(file);
			$timeout(function () {
				processQueue();
			}, 0);
		}

		function processQueue() {
			while (processingQueue.length > 0) {
				var file = processingQueue.shift();

				$timeout(function (e, _file) {// jshint ignore:line
					makeAsDataUrl(_file);
					createThumbnail(_file);
					uploadFile(_file);
				}.bindToEventHandler(file), 0);// jshint ignore:line
			}
		}

		function processSelectedFiles(files) {
			loadFiles(files);
		}

		function dropEvent(e) {
			vm.isInitMode = false;
			vm.scope.$apply();
			e = e || w.event;
			if (e.preventDefault) {
				e.preventDefault();
			}

			if (!vm.readOnly) {
				var dt = e.dataTransfer;
				var files = dt.files;
				loadFiles(files);
			}

			return false;
		}

		function loadFiles(files) {
			if (files === null) {
				return;
			}
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				loadFile(file);
			}
		}

///file status: 0 - start, 1 - made urldata, 2 - uploaded, 3 - error

		function loadFile(file) {

			var fileList = vm.files;

			if (fileList.some(function (f) {
					return f.name === file.name;
				})) {
				return;
			}

			var reader = new FileReader();
			reader.onloadend = function (e, reader, file, fileList) {
				if (reader.error === null) {
					file.data = this.result;
					file.status = 0;
					file.isNew = true;
					$timeout(function () {
						fileList.push(file);
						processFile(file);
						//console.log('onloadend');
					});
				}
			}.bindToEventHandler(reader, file, fileList);

			reader.readAsArrayBuffer(file);
		}

		function makeAsDataUrl(file) {
			file.url = 'data:' + file.type + ';base64,' + btoa([].reduce.call(new Uint8Array(file.data), function (p, c) {
					return p + String.fromCharCode(c);
				}, ''));

			file.status = 1;
			vm.scope.$apply();
		}

		function createThumbnail(file) {
			if (!file.type.match(/image.*/)) {
				return;
			}

			var img = document.createElement('img');
			img.crossOrigin = 'anonymous';
			img.onload = function (e, _file) {
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');
				var canvasSize = 160;
				canvas.width = canvasSize;
				canvas.height = canvasSize;
				var thumbSize = {width: canvasSize, height: canvasSize};

				if (img.width < img.height) {
					thumbSize.width = canvasSize;
					thumbSize.height = img.height * canvasSize / img.width;
				} else if (img.width > img.height) {
					thumbSize.height = canvasSize;
					thumbSize.width = img.width * canvasSize / img.height;
				}

				thumbSize.offsetX = (canvasSize - thumbSize.width) / 2;
				thumbSize.offsetY = (canvasSize - thumbSize.height) / 2;

				ctx.drawImage(img, thumbSize.offsetX, thumbSize.offsetY, thumbSize.width, thumbSize.height);
				var thumbnail = canvas.toDataURL('image/png');
				$timeout(function () {
					_file.thumbnail = thumbnail;
					_file.status = 2;
					vm.scope.$apply();
				});

				//console.log(thumbnail);
			}.bindToEventHandler(file);
			img.src = file.isNew ? file.url : formatUrl(file.url);
		}

		function uploadFile(file) {
			var url = makeUploadUrl(file);
			var xhr = new XMLHttpRequest();

			xhr.open('POST', url, true);
			if (vm.headers) {
				for (var header in vm.headers) {
					if (vm.headers.hasOwnProperty(header)) {
						xhr.setRequestHeader(header, vm.headers[header]);
					}
				}
			}

			xhr.setRequestHeader('Content-Type', 'application/octet-stream');

			xhr.upload.onprogress = updateProgress;
			xhr.upload.onload = function () {
				file.status = 2;
				vm.scope.$apply();
			};
			xhr.send(file.data);
		}

		function updateProgress() {
			vm.scope.$apply();
		}

		function cancel(e) {
			e = e || w.event;
			if (e.preventDefault) {
				e.preventDefault();
			}

			return false;
		}

		function addEventHandler(obj, evt, handler) {
			if (obj.addEventListener) {
				// W3C method
				obj.addEventListener(evt, handler, false);
			} else if (obj.attachEvent) {
				// IE method.
				obj.attachEvent('on' + evt, handler);
			} else {
				// Old school method.
				obj['on' + evt] = handler;
			}
		}


	}

	Function.prototype.bindToEventHandler = function bindToEventHandler() {// jshint ignore:line
		var handler = this;
		var boundParameters = Array.prototype.slice.call(arguments);
		//create closure
		return function (e) {
			e = e || window.event; // get window.event if e argument missing (in IE)
			var params = boundParameters.slice();
			params.unshift(e);
			handler.apply(this, params);
		};
	};
	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.DropZone = MxDropZone;
})(window);

(function () {
	'use strict';

	angular.module('mx.components').directive('mxAttachments', ['$timeout', function ($timeout) {

		MxAttachmentsCtrl.$inject = ['$element', '$scope'];

		function MxAttachmentsCtrl($element, $scope) {
			var vm = this;
			vm.scope = $scope;
			vm.isInitMode = (vm.lazyMode || '').toLowerCase() === 'true';
			vm.onClick = onClick;
			var types = loadTypes();
			vm.sortFields = loadSortFields();
			vm.sortBy = vm.sortFields[0].field;
			var container = $element.find('.mx-attachments-list');
			var dz = new mx.components.DropZone($timeout, vm);
			vm.filesSelected = dz.processSelectedFiles;
			vm._files = [];
			setFiles(vm.files);

			Object.defineProperty(vm, 'files', {
				get: function () {
					return vm._files;
				},
				set: function (value) {
					setFiles(value);
				}
			});


			dz.init(container[0]);

			return vm;

			function onClick() {
				vm.isInitMode = false;
			}

			function setFiles(files) {
				vm._files = (files || []).map(function (file) {
					file.status = 4;
					file.type = getType(file);
					//dz.createThumbnail(file);
					return file;
				});
			}

			function getType(file) {
				var extension = file.name.split('.').pop();
				extension = (extension || '').toUpperCase();
				return types[extension] || 'text';
			}

			function loadTypes() {
				var i, templates = {};
				//image
				var formats = ['JPEG', 'JPG', 'GIF', 'PNG', 'APNG', 'SVG', 'BMP', 'ICO'];
				for (i = 0; i < formats.length; i++) {
					templates[formats[i]] = 'image';
				}

				//video
				formats = ['MP4', 'WEBM', 'OGG'];
				for (i = 0; i < formats.length; i++) {
					templates[formats[i]] = 'video';
				}

				//PDF
				templates.PDF = 'pdf';
				return templates;
			}

			function loadSortFields() {
				return [
					{
						name: 'Name',
						field: 'name'
					},
					{
						name: 'Uploaded',
						field: 'uploaded'
					},
					//{
					//	name:'Name desc',
					//	field:'-name'
					//},
					{
						name: 'Size',
						field: 'size'
					}//,
					//{
					//	name:'Size desc',
					//	field: '-size'
					//}
				];
			}
		}

		return {
			restrict: 'E',
			scope: {},
			bindToController: {
				files: '=',
				headers: '=',
				makeUploadUrl: '&',
				formatUrl: '&',
				onDelete: '&',
				readOnly: '=',
				lazyMode: '@',
				enableSelection: '@'
			},
			controller: MxAttachmentsCtrl,
			controllerAs: 'vm',

			templateUrl: 'mx-attachments/mx-attachments.html'
		};
	}]);

})();

(function (w) {
	'use strict';

	angular.module('mx.components').directive('mxAttachment', [ 'mx.internationalization',
		function (internationalization){

			MxAttachmentCtrl.$inject = ['$scope','$sce'];
			function MxAttachmentCtrl($scope, $sce){
				var vm = this;

				vm.enableSelection = ($scope.$parent.$parent.vm.enableSelection|| '').toLowerCase() === 'true';

				vm.downloadLabel = internationalization.get('components.mx-attachments.download');
				vm.deleteLabel = internationalization.get('components.mx-attachments.delete');
				vm._type = (vm.file.type || 'text').split('/').shift();
				vm.getUrl = getUrl;
				vm.deleteFile = deleteFile;
				vm.downloadFile = downloadFile;
				vm.showDownload = showDownload;
				vm.showDelete = showDelete;
				vm.isImage = isImage;
				vm.isText = isText;
				vm.isPdf = isPdf;
				vm.isVideo = isVideo;
				vm.isNewBox = isNewBox;
				vm.showLoading = showLoading;

				vm.size = '';
				if (vm.file.size) {
					var sizeKb = Math.round(vm.file.size / 1024, 2);
					var sizeMb = Math.round(sizeKb / 1024, 2);
					var sizeGb = Math.round(sizeMb / 1024, 2);

					vm.size = sizeGb > 1 ? sizeGb + ' G' : sizeMb > 1 ? sizeMb + ' M' : sizeKb > 1 ? sizeKb + ' K' : vm.file.size + 'B';
				}

				return vm;

				function showLoading(){
					return vm.file.isNew && vm.file.status < 2;
				}

				function isNewBox(){
					return vm._type === 'new';
				}

				function isPdf(){
					return vm._type === 'pdf';
				}

				function isImage(){
					return vm._type === 'image';
				}

				function isText(){
					return !isImage() && !isPdf() && !isVideo() && !isNewBox();
					//return vm._type === 'text';
				}

				function isVideo(){
					return vm._type === 'video';
				}

				function showDownload(){
					return vm.file.status !== 6;
				}

				function showDelete(){
					return vm.file.status !== 6 && $scope.$parent.$parent.vm.readOnly !== true;
				}

				function getUrl(){
					return $sce.trustAsResourceUrl(vm.file.isNew ? vm.file.url : $scope.$parent.$parent.vm.formatUrl({url: vm.file.url || ''}) || vm.file.url);
				}

				function deleteFile() {
					$scope.$parent.$parent.vm.onDelete({file: vm.file});
				}

				function downloadFile() {
					w.open(getUrl());
				}
			}

			return {
				restrict: 'E',
				require: ['?^mxAttachments'],
				scope: {},
				bindToController: {
					file: '='
				},
				controller: MxAttachmentCtrl,
				controllerAs: 'vm',
				templateUrl: 'mx-attachments/mx-attachment.html'
			};
		}]);
})(window);

(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name mx.components:mxLiteral
	 * @module mx.components
	 * @restrict 'E'
	 * @scope {}
	 * @description Displays the value
	 * @param {string} label@ - Optional. Label of the control.
	 * @param {value} value= - Value to display.
	 * @param {string} type@ - Optional. Type of the value.
	 * @param {string} format@ - Optional. Data format to be displayed (example: short date: 5/20/16 10:32 AM)
	 * @param {boolean} singleLine@ - Optional. Text to be displayed in single or multi line
	 * @param {boolean} hideOnEmptyValue@ - Optional. Hide control if value is empty
	 * @param {string} icon@ - Optional. Icon to be displayed.
	 * @param {boolean} reserveIconSpace@ - Optional. Reserve empty space for icon.
	 * @param {boolean} designerMode@ - Optional.
	 * @param {boolean} labelPosition@ - Optional. Position of label to be displayed (example: top, bottom). Default: left
	 * @usage <mx-literal data-label="Text, single line, undefined , hide-on-empty-value" data-value="vm.text3" data-single-line="true" hide-on-empty-value="true"></mx-literal>
	 */
	angular.module('mx.components').directive('mxLiteral', ['$filter', 'mx.internationalization', function ($filter, internationalization) {

		var notSetLabel = internationalization.get('components.mx-literal.notSet', 'not set');

		function mxLiteralTpl(elem, attr) {

			var bindingTypeMark = attr.designerMode === undefined ? '::' : '';

			return '' +
				'<div layout="row"' +

				' class="mx-literal {{' + bindingTypeMark + 'formattedLabelPosition}}"' +
				' ng-if="show" ' +
				' ng-class="{' +
				'&quot;reserveSpace&quot;:(reserveIconSpace === &quot;true&quot; || icon), ' +
				'&quot;vertical&quot;:((position !== 0)), ' +
				'&quot;multi-line&quot;:((singleLine !== &quot;true&quot;)), ' +
				//'&quot;without-value&quot;:!hasValue' +
				'}"' +
				'>' +
				getIconTemplate(attr) +
				'<div class="label-value" layout = "{{' + bindingTypeMark + 'layout}}" >' +
				getLabelTemplate(attr) +
				getTemplateByType(attr) +
				'</div>' +
				'</div><div ng-if="!show" class="without-value"/>';
		}

		function getTemplateByType(attr) {
			var template;

			switch (attr.type) {
				case 'link':
					template = '<a ng-click="onClick()" ng-bind="value.text" class="literal-value" href="{{::value.href}}" ng-hide="showText" ##ngclass##></a>' +
						'<span class="literal-value" ng-bind="value.text" ng-show="showText" ##ngclass##></span>';
					break;

				case 'date':
				case 'datetime':
					template =
						'<time class="literal-value" title="{{value | amDateFormat: \'dddd, MMMM Do YYYY, hh:mm\'}}" ng-show="::(format === \'timeAgo\' && value !== null)" am-time-ago="formattedValue" ##ngclass##></time>' +
						'<time class="literal-value" title="{{value | amDateFormat: \'dddd, MMMM Do YYYY, hh:mm\'}}" ng-show="::(format !== \'timeAgo\' || value === null)" ##ngclass##>{{::formattedValue}}</time>';
					break;

				case 'html':
					template = '<div class="literal-value" ng-bind-html="::value" ##ngclass##></div>';
					break;

				case 'currency':
					template = '<span class="currency-value literal-value" ##ngclass##>{{::value}}&nbsp;{{::currencyCode}}</span>';
					break;

				default:
					var extraClass = attr.singleLine === 'true' ? 'single-line' : '';
					template = '<span ng-bind="formattedValue" class="literal-value ' + extraClass + '" ##ngclass##></span>';
					break;
			}

			return template.replace(/##ngclass##/g, 'ng-class="label ? \'with-label\': \'without-label\'"');
		}

		function getIconTemplate(attr) {
			if (attr.designerMode !== undefined) {
				return '<div ng-if="(icon || reserveIconSpace===&quot;true&quot;)" class="icon"><md-icon ng-if="icon">{{icon}}</md-icon></div>';
			}
			return '<div ng-if="::(icon || reserveIconSpace===&quot;true&quot;)" class="icon"><md-icon ng-if="::icon">{{::icon}}</md-icon></div>';
		}

		function getLabelTemplate(attr) {
			return attr.designerMode !== undefined ?
				'<label ng-if="label" ng-bind="label" ></label>' :
				'<label ng-if="::label" ng-bind="::label"></label>';
		}

		function mxLiteralLink(scope, element, attrs) {
			scope.hasValue = true;
			scope.show = true;
			scope.formattedLabel = scope.label;
			scope.formattedHideOnEmptyValue = (scope.hideOnEmptyValue || '').toLowerCase() === 'true';
			scope.formattedReserveIconSpace = (scope.reserveIconSpace || '').toLowerCase() === 'true';
			if (attrs.designerMode === undefined) {
				calcPositionLayout();
			} else {
				scope.$watch('labelPosition', function () {
					calcPositionLayout();
				});
			}

			var _value;
			var type = (scope.type || '').toLowerCase();
			var isDateType = (type === 'date' || type === 'datetime') && scope.format !== 'timeAgo';

			if (type === 'link') {
				if (scope.value) {
					if (scope.value.onClick) {
						scope.onClick = function () {
							{
								scope.value.onClick();
								event.stopPropagation();
								event.preventDefault();
							}
						};

						if (!scope.value.href) {
							scope.value.href = '#';
						}
					}

					scope.show = true;
					scope.showText = scope.value.isText;
					scope.value.text = scope.value.text === '' ? notSetLabel : scope.value.text;
					scope.hasValue = scope.value.text !== '';
				} else {
					scope.hasValue = false;
					scope.show = !scope.formattedHideOnEmptyValue;
					if (scope.show) {
						scope.showText = true;
						scope.value = {text: notSetLabel};
					}
				}

			} else {

				setValue(scope.value);
				Object.defineProperty(scope, 'value', {
					get: function () {
						return _value;
					},
					set: setValue
				});
			}

			function calcPositionLayout() {
				scope.position = scope.labelPosition === 'bottom' ? 2 : scope.labelPosition === 'top' ? 1 : 0;
				scope.layout = scope.position === 0 ? 'row' : 'column';
				scope.formattedLabelPosition = scope.labelPosition || 'left';
			}

			function setValue(value) {
				_value = value;
				if (_value) {

					var formattedDate = scope.format === 'timeAgo' || isDateType ? new Date(_value) : _value;

					scope.formattedValue = isDateType ? $filter('date')(formattedDate, scope.format) : formattedDate;
					scope.show = true;
				} else {
					scope.hasValue = false;
					scope.show = !scope.formattedHideOnEmptyValue;
					if (scope.show) {
						scope.formattedValue = notSetLabel;

					}
				}
			}
		}

		return {
			restrict: 'E',
			scope: {

				label: '@',
				value: '=',
				type: '@',
				format: '@',
				singleLine: '@',
				hideOnEmptyValue: '@',
				icon: '@',
				reserveIconSpace: '@',
				designerMode: '@',
				currencyCode: '@',
				labelPosition: '@'
			},
			template: mxLiteralTpl,
			link: mxLiteralLink

		};
	}]);
})();

(function (w) {
	'use strict';
	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.Icons = [{
		'id': 'action',
		'name': 'Action',
		'icons': [{
			'codepoint': 'E84D',
			'id': '3d_rotation',
			'keywords': ['action', '3d', 'rotation'],
			'name': '3d rotation'
		}, {
			'codepoint': 'E84E',
			'id': 'accessibility',
			'keywords': ['action', 'accessibility'],
			'name': 'accessibility'
		}, {
			'codepoint': 'E84F',
			'id': 'account_balance',
			'keywords': ['action', 'account', 'balance'],
			'name': 'account balance'
		}, {
			'codepoint': 'E850',
			'id': 'account_balance_wallet',
			'keywords': ['action', 'account', 'balance', 'wallet'],
			'name': 'account balance wallet'
		}, {
			'codepoint': 'E851',
			'id': 'account_box',
			'keywords': ['action', 'account', 'box'],
			'name': 'account box'
		}, {
			'codepoint': 'E853',
			'id': 'account_circle',
			'keywords': ['action', 'account', 'circle'],
			'name': 'account circle'
		}, {
			'codepoint': 'E854',
			'id': 'add_shopping_cart',
			'keywords': ['action', 'add', 'shopping', 'cart'],
			'name': 'add shopping cart'
		}, {'codepoint': 'E855', 'id': 'alarm', 'keywords': ['action', 'alarm'], 'name': 'alarm'}, {
			'codepoint': 'E856',
			'id': 'alarm_add',
			'keywords': ['action', 'alarm', 'add'],
			'name': 'alarm add'
		}, {
			'codepoint': 'E857',
			'id': 'alarm_off',
			'keywords': ['action', 'alarm', 'off'],
			'name': 'alarm off'
		}, {
			'codepoint': 'E858',
			'id': 'alarm_on',
			'keywords': ['action', 'alarm', 'on'],
			'name': 'alarm on'
		}, {
			'codepoint': 'E859',
			'id': 'android',
			'keywords': ['action', 'android'],
			'name': 'android'
		}, {
			'codepoint': 'E85A',
			'id': 'announcement',
			'keywords': ['action', 'announcement'],
			'name': 'announcement'
		}, {
			'codepoint': 'E85B',
			'id': 'aspect_ratio',
			'keywords': ['action', 'aspect', 'ratio'],
			'name': 'aspect ratio'
		}, {
			'codepoint': 'E85C',
			'id': 'assessment',
			'keywords': ['action', 'assessment'],
			'name': 'assessment'
		}, {
			'codepoint': 'E85D',
			'id': 'assignment',
			'keywords': ['action', 'assignment'],
			'name': 'assignment'
		}, {
			'codepoint': 'E85E',
			'id': 'assignment_ind',
			'keywords': ['action', 'assignment', 'ind'],
			'name': 'assignment ind'
		}, {
			'codepoint': 'E85F',
			'id': 'assignment_late',
			'keywords': ['action', 'assignment', 'late'],
			'name': 'assignment late'
		}, {
			'codepoint': 'E860',
			'id': 'assignment_return',
			'keywords': ['action', 'assignment', 'return'],
			'name': 'assignment return'
		}, {
			'codepoint': 'E861',
			'id': 'assignment_returned',
			'keywords': ['action', 'assignment', 'returned'],
			'name': 'assignment returned'
		}, {
			'codepoint': 'E862',
			'id': 'assignment_turned_in',
			'keywords': ['action', 'assignment', 'turned', 'in'],
			'name': 'assignment turned in'
		}, {
			'codepoint': 'E863',
			'id': 'autorenew',
			'keywords': ['action', 'autorenew'],
			'name': 'autorenew'
		}, {
			'codepoint': 'E864',
			'id': 'backup',
			'keywords': ['action', 'backup'],
			'name': 'backup'
		}, {'codepoint': 'E865', 'id': 'book', 'keywords': ['action', 'book'], 'name': 'book'}, {
			'codepoint': 'E866',
			'id': 'bookmark',
			'keywords': ['action', 'bookmark'],
			'name': 'bookmark'
		}, {
			'codepoint': 'E867',
			'id': 'bookmark_border',
			'keywords': ['action', 'bookmark', 'border'],
			'name': 'bookmark border'
		}, {
			'codepoint': 'E868',
			'id': 'bug_report',
			'keywords': ['action', 'bug', 'report'],
			'name': 'bug report'
		}, {'codepoint': 'E869', 'id': 'build', 'keywords': ['action', 'build'], 'name': 'build'}, {
			'codepoint': 'E86A',
			'id': 'cached',
			'keywords': ['action', 'cached'],
			'name': 'cached'
		}, {
			'codepoint': 'E8FC',
			'id': 'camera_enhance',
			'keywords': ['action', 'camera', 'enhance'],
			'name': 'camera enhance'
		}, {
			'codepoint': 'E8F6',
			'id': 'card_giftcard',
			'keywords': ['action', 'card', 'giftcard'],
			'name': 'card giftcard'
		}, {
			'codepoint': 'E8F7',
			'id': 'card_membership',
			'keywords': ['action', 'card', 'membership'],
			'name': 'card membership'
		}, {
			'codepoint': 'E8F8',
			'id': 'card_travel',
			'keywords': ['action', 'card', 'travel'],
			'name': 'card travel'
		}, {
			'codepoint': 'E86B',
			'id': 'change_history',
			'keywords': ['action', 'change', 'history'],
			'name': 'change history'
		}, {
			'codepoint': 'E86C',
			'id': 'check_circle',
			'keywords': ['action', 'check', 'circle'],
			'name': 'check circle'
		}, {
			'codepoint': 'E86D',
			'id': 'chrome_reader_mode',
			'keywords': ['action', 'chrome', 'reader', 'mode'],
			'name': 'chrome reader mode'
		}, {'codepoint': 'E86E', 'id': 'class', 'keywords': ['action', 'class'], 'name': 'class'}, {
			'codepoint': 'E86F',
			'id': 'code',
			'keywords': ['action', 'code'],
			'name': 'code'
		}, {
			'codepoint': 'E870',
			'id': 'credit_card',
			'keywords': ['action', 'credit', 'card'],
			'name': 'credit card'
		}, {
			'codepoint': 'E871',
			'id': 'dashboard',
			'keywords': ['action', 'dashboard'],
			'name': 'dashboard'
		}, {
			'codepoint': 'E872',
			'id': 'delete',
			'keywords': ['action', 'delete'],
			'name': 'delete'
		}, {
			'codepoint': 'E873',
			'id': 'description',
			'keywords': ['action', 'description'],
			'name': 'description'
		}, {'codepoint': 'E875', 'id': 'dns', 'keywords': ['action', 'dns'], 'name': 'dns'}, {
			'codepoint': 'E876',
			'id': 'done',
			'keywords': ['action', 'done'],
			'name': 'done'
		}, {
			'codepoint': 'E877',
			'id': 'done_all',
			'keywords': ['action', 'done', 'all'],
			'name': 'done all'
		}, {'codepoint': 'E8FB', 'id': 'eject', 'keywords': ['action', 'eject'], 'name': 'eject'}, {
			'codepoint': 'E878',
			'id': 'event',
			'keywords': ['action', 'event'],
			'name': 'event'
		}, {
			'codepoint': 'E903',
			'id': 'event_seat',
			'keywords': ['action', 'event', 'seat'],
			'name': 'event seat'
		}, {
			'codepoint': 'E879',
			'id': 'exit_to_app',
			'keywords': ['action', 'exit', 'to', 'app'],
			'name': 'exit to app'
		}, {
			'codepoint': 'E87A',
			'id': 'explore',
			'keywords': ['action', 'explore'],
			'name': 'explore'
		}, {
			'codepoint': 'E87B',
			'id': 'extension',
			'keywords': ['action', 'extension'],
			'name': 'extension'
		}, {'codepoint': 'E87C', 'id': 'face', 'keywords': ['action', 'face'], 'name': 'face'}, {
			'codepoint': 'E87D',
			'id': 'favorite',
			'keywords': ['action', 'favorite'],
			'name': 'favorite'
		}, {
			'codepoint': 'E87E',
			'id': 'favorite_border',
			'keywords': ['action', 'favorite', 'border'],
			'name': 'favorite border'
		}, {
			'codepoint': 'E87F',
			'id': 'feedback',
			'keywords': ['action', 'feedback'],
			'name': 'feedback'
		}, {
			'codepoint': 'E880',
			'id': 'find_in_page',
			'keywords': ['action', 'find', 'in', 'page'],
			'name': 'find in page'
		}, {
			'codepoint': 'E881',
			'id': 'find_replace',
			'keywords': ['action', 'find', 'replace'],
			'name': 'find replace'
		}, {
			'codepoint': 'E904',
			'id': 'flight_land',
			'keywords': ['action', 'flight', 'land'],
			'name': 'flight land'
		}, {
			'codepoint': 'E905',
			'id': 'flight_takeoff',
			'keywords': ['action', 'flight', 'takeoff'],
			'name': 'flight takeoff'
		}, {
			'codepoint': 'E882',
			'id': 'flip_to_back',
			'keywords': ['action', 'flip', 'to', 'back'],
			'name': 'flip to back'
		}, {
			'codepoint': 'E883',
			'id': 'flip_to_front',
			'keywords': ['action', 'flip', 'to', 'front'],
			'name': 'flip to front'
		}, {
			'codepoint': 'E884',
			'id': 'get_app',
			'keywords': ['action', 'get', 'app'],
			'name': 'get app'
		}, {'codepoint': 'E908', 'id': 'gif', 'keywords': ['action', 'gif'], 'name': 'gif'}, {
			'codepoint': 'E885',
			'id': 'grade',
			'keywords': ['action', 'grade'],
			'name': 'grade'
		}, {
			'codepoint': 'E886',
			'id': 'group_work',
			'keywords': ['action', 'group', 'work'],
			'name': 'group work'
		}, {'codepoint': 'E887', 'id': 'help', 'keywords': ['action', 'help'], 'name': 'help'}, {
			'codepoint': 'E8FD',
			'id': 'help_outline',
			'keywords': ['action', 'help', 'outline'],
			'name': 'help outline'
		}, {
			'codepoint': 'E888',
			'id': 'highlight_off',
			'keywords': ['action', 'highlight', 'off'],
			'name': 'highlight off'
		}, {
			'codepoint': 'E889',
			'id': 'history',
			'keywords': ['action', 'history'],
			'name': 'history'
		}, {'codepoint': 'E88A', 'id': 'home', 'keywords': ['action', 'home'], 'name': 'home'}, {
			'codepoint': 'E88B',
			'id': 'hourglass_empty',
			'keywords': ['action', 'hourglass', 'empty'],
			'name': 'hourglass empty'
		}, {
			'codepoint': 'E88C',
			'id': 'hourglass_full',
			'keywords': ['action', 'hourglass', 'full'],
			'name': 'hourglass full'
		}, {'codepoint': 'E902', 'id': 'http', 'keywords': ['action', 'http'], 'name': 'http'}, {
			'codepoint': 'E88D',
			'id': 'https',
			'keywords': ['action', 'https'],
			'name': 'https'
		}, {'codepoint': 'E88E', 'id': 'info', 'keywords': ['action', 'info'], 'name': 'info'}, {
			'codepoint': 'E88F',
			'id': 'info_outline',
			'keywords': ['action', 'info', 'outline'],
			'name': 'info outline'
		}, {'codepoint': 'E890', 'id': 'input', 'keywords': ['action', 'input'], 'name': 'input'}, {
			'codepoint': 'E891',
			'id': 'invert_colors',
			'keywords': ['action', 'invert', 'colors'],
			'name': 'invert colors'
		}, {'codepoint': 'E892', 'id': 'label', 'keywords': ['action', 'label'], 'name': 'label'}, {
			'codepoint': 'E893',
			'id': 'label_outline',
			'keywords': ['action', 'label', 'outline'],
			'name': 'label outline'
		}, {
			'codepoint': 'E894',
			'id': 'language',
			'keywords': ['action', 'language'],
			'name': 'language'
		}, {
			'codepoint': 'E895',
			'id': 'launch',
			'keywords': ['action', 'launch'],
			'name': 'launch'
		}, {'codepoint': 'E896', 'id': 'list', 'keywords': ['action', 'list'], 'name': 'list'}, {
			'codepoint': 'E897',
			'id': 'lock',
			'keywords': ['action', 'lock'],
			'name': 'lock'
		}, {
			'codepoint': 'E898',
			'id': 'lock_open',
			'keywords': ['action', 'lock', 'open'],
			'name': 'lock open'
		}, {
			'codepoint': 'E899',
			'id': 'lock_outline',
			'keywords': ['action', 'lock', 'outline'],
			'name': 'lock outline'
		}, {
			'codepoint': 'E89A',
			'id': 'loyalty',
			'keywords': ['action', 'loyalty'],
			'name': 'loyalty'
		}, {
			'codepoint': 'E89B',
			'id': 'markunread_mailbox',
			'keywords': ['action', 'markunread', 'mailbox'],
			'name': 'markunread mailbox'
		}, {
			'codepoint': 'E89C',
			'id': 'note_add',
			'keywords': ['action', 'note', 'add'],
			'name': 'note add'
		}, {
			'codepoint': 'E90A',
			'id': 'offline_pin',
			'keywords': ['action', 'offline', 'pin'],
			'name': 'offline pin'
		}, {
			'codepoint': 'E89D',
			'id': 'open_in_browser',
			'keywords': ['action', 'open', 'in', 'browser'],
			'name': 'open in browser'
		}, {
			'codepoint': 'E89E',
			'id': 'open_in_new',
			'keywords': ['action', 'open', 'in', 'new'],
			'name': 'open in new'
		}, {
			'codepoint': 'E89F',
			'id': 'open_with',
			'keywords': ['action', 'open', 'with'],
			'name': 'open with'
		}, {
			'codepoint': 'E8A0',
			'id': 'pageview',
			'keywords': ['action', 'pageview'],
			'name': 'pageview'
		}, {
			'codepoint': 'E8A1',
			'id': 'payment',
			'keywords': ['action', 'payment'],
			'name': 'payment'
		}, {
			'codepoint': 'E8A2',
			'id': 'perm_camera_mic',
			'keywords': ['action', 'perm', 'camera', 'mic'],
			'name': 'perm camera mic'
		}, {
			'codepoint': 'E8A3',
			'id': 'perm_contact_calendar',
			'keywords': ['action', 'perm', 'contact', 'calendar'],
			'name': 'perm contact calendar'
		}, {
			'codepoint': 'E8A4',
			'id': 'perm_data_setting',
			'keywords': ['action', 'perm', 'data', 'setting'],
			'name': 'perm data setting'
		}, {
			'codepoint': 'E8A5',
			'id': 'perm_device_information',
			'keywords': ['action', 'perm', 'device', 'information'],
			'name': 'perm device information'
		}, {
			'codepoint': 'E8A6',
			'id': 'perm_identity',
			'keywords': ['action', 'perm', 'identity'],
			'name': 'perm identity'
		}, {
			'codepoint': 'E8A7',
			'id': 'perm_media',
			'keywords': ['action', 'perm', 'media'],
			'name': 'perm media'
		}, {
			'codepoint': 'E8A8',
			'id': 'perm_phone_msg',
			'keywords': ['action', 'perm', 'phone', 'msg'],
			'name': 'perm phone msg'
		}, {
			'codepoint': 'E8A9',
			'id': 'perm_scan_wifi',
			'keywords': ['action', 'perm', 'scan', 'wifi'],
			'name': 'perm scan wifi'
		}, {
			'codepoint': 'E8AA',
			'id': 'picture_in_picture',
			'keywords': ['action', 'picture', 'in', 'picture'],
			'name': 'picture in picture'
		}, {
			'codepoint': 'E906',
			'id': 'play_for_work',
			'keywords': ['action', 'play', 'work'],
			'name': 'play for work'
		}, {
			'codepoint': 'E8AB',
			'id': 'polymer',
			'keywords': ['action', 'polymer'],
			'name': 'polymer'
		}, {
			'codepoint': 'E8AC',
			'id': 'power_settings_new',
			'keywords': ['action', 'power', 'settings', 'new'],
			'name': 'power settings new'
		}, {'codepoint': 'E8AD', 'id': 'print', 'keywords': ['action', 'print'], 'name': 'print'}, {
			'codepoint': 'E8AE',
			'id': 'query_builder',
			'keywords': ['action', 'query', 'builder'],
			'name': 'query builder'
		}, {
			'codepoint': 'E8AF',
			'id': 'question_answer',
			'keywords': ['action', 'question', 'answer'],
			'name': 'question answer'
		}, {
			'codepoint': 'E8B0',
			'id': 'receipt',
			'keywords': ['action', 'receipt'],
			'name': 'receipt'
		}, {
			'codepoint': 'E8B1',
			'id': 'redeem',
			'keywords': ['action', 'redeem'],
			'name': 'redeem'
		}, {
			'codepoint': 'E8FE',
			'id': 'reorder',
			'keywords': ['action', 'reorder'],
			'name': 'reorder'
		}, {
			'codepoint': 'E8B2',
			'id': 'report_problem',
			'keywords': ['action', 'report', 'problem'],
			'name': 'report problem'
		}, {
			'codepoint': 'E8B3',
			'id': 'restore',
			'keywords': ['action', 'restore'],
			'name': 'restore'
		}, {'codepoint': 'E8B4', 'id': 'room', 'keywords': ['action', 'room'], 'name': 'room'}, {
			'codepoint': 'E8B5',
			'id': 'schedule',
			'keywords': ['action', 'schedule'],
			'name': 'schedule'
		}, {
			'codepoint': 'E8B6',
			'id': 'search',
			'keywords': ['action', 'search'],
			'name': 'search'
		}, {
			'codepoint': 'E8B8',
			'id': 'settings',
			'keywords': ['action', 'settings'],
			'name': 'settings'
		}, {
			'codepoint': 'E8B9',
			'id': 'settings_applications',
			'keywords': ['action', 'settings', 'applications'],
			'name': 'settings applications'
		}, {
			'codepoint': 'E8BA',
			'id': 'settings_backup_restore',
			'keywords': ['action', 'settings', 'backup', 'restore'],
			'name': 'settings backup restore'
		}, {
			'codepoint': 'E8BB',
			'id': 'settings_bluetooth',
			'keywords': ['action', 'settings', 'bluetooth'],
			'name': 'settings bluetooth'
		}, {
			'codepoint': 'E8BD',
			'id': 'settings_brightness',
			'keywords': ['action', 'settings', 'brightness'],
			'name': 'settings brightness'
		}, {
			'codepoint': 'E8BC',
			'id': 'settings_cell',
			'keywords': ['action', 'settings', 'cell'],
			'name': 'settings cell'
		}, {
			'codepoint': 'E8BE',
			'id': 'settings_ethernet',
			'keywords': ['action', 'settings', 'ethernet'],
			'name': 'settings ethernet'
		}, {
			'codepoint': 'E8BF',
			'id': 'settings_input_antenna',
			'keywords': ['action', 'settings', 'input', 'antenna'],
			'name': 'settings input antenna'
		}, {
			'codepoint': 'E8C0',
			'id': 'settings_input_component',
			'keywords': ['action', 'settings', 'input', 'component'],
			'name': 'settings input component'
		}, {
			'codepoint': 'E8C1',
			'id': 'settings_input_composite',
			'keywords': ['action', 'settings', 'input', 'composite'],
			'name': 'settings input composite'
		}, {
			'codepoint': 'E8C2',
			'id': 'settings_input_hdmi',
			'keywords': ['action', 'settings', 'input', 'hdmi'],
			'name': 'settings input hdmi'
		}, {
			'codepoint': 'E8C3',
			'id': 'settings_input_svideo',
			'keywords': ['action', 'settings', 'input', 'svideo'],
			'name': 'settings input svideo'
		}, {
			'codepoint': 'E8C4',
			'id': 'settings_overscan',
			'keywords': ['action', 'settings', 'overscan'],
			'name': 'settings overscan'
		}, {
			'codepoint': 'E8C5',
			'id': 'settings_phone',
			'keywords': ['action', 'settings', 'phone'],
			'name': 'settings phone'
		}, {
			'codepoint': 'E8C6',
			'id': 'settings_power',
			'keywords': ['action', 'settings', 'power'],
			'name': 'settings power'
		}, {
			'codepoint': 'E8C7',
			'id': 'settings_remote',
			'keywords': ['action', 'settings', 'remote'],
			'name': 'settings remote'
		}, {
			'codepoint': 'E8C8',
			'id': 'settings_voice',
			'keywords': ['action', 'settings', 'voice'],
			'name': 'settings voice'
		}, {'codepoint': 'E8C9', 'id': 'shop', 'keywords': ['action', 'shop'], 'name': 'shop'}, {
			'codepoint': 'E8CA',
			'id': 'shop_two',
			'keywords': ['action', 'shop', 'two'],
			'name': 'shop two'
		}, {
			'codepoint': 'E8CB',
			'id': 'shopping_basket',
			'keywords': ['action', 'shopping', 'basket'],
			'name': 'shopping basket'
		}, {
			'codepoint': 'E8CC',
			'id': 'shopping_cart',
			'keywords': ['action', 'shopping', 'cart'],
			'name': 'shopping cart'
		}, {
			'codepoint': 'E8CD',
			'id': 'speaker_notes',
			'keywords': ['action', 'speaker', 'notes'],
			'name': 'speaker notes'
		}, {
			'codepoint': 'E8CE',
			'id': 'spellcheck',
			'keywords': ['action', 'spellcheck'],
			'name': 'spellcheck'
		}, {
			'codepoint': 'E8CF',
			'id': 'star_rate',
			'keywords': ['action', 'star', 'rate'],
			'name': 'star rate'
		}, {'codepoint': 'E8D0', 'id': 'stars', 'keywords': ['action', 'stars'], 'name': 'stars'}, {
			'codepoint': 'E8D1',
			'id': 'store',
			'keywords': ['action', 'store'],
			'name': 'store'
		}, {
			'codepoint': 'E8D2',
			'id': 'subject',
			'keywords': ['action', 'subject'],
			'name': 'subject'
		}, {
			'codepoint': 'E8D3',
			'id': 'supervisor_account',
			'keywords': ['action', 'supervisor', 'account'],
			'name': 'supervisor account'
		}, {
			'codepoint': 'E8D4',
			'id': 'swap_horiz',
			'keywords': ['action', 'swap', 'horiz'],
			'name': 'swap horiz'
		}, {
			'codepoint': 'E8D5',
			'id': 'swap_vert',
			'keywords': ['action', 'swap', 'vert'],
			'name': 'swap vert'
		}, {
			'codepoint': 'E8D6',
			'id': 'swap_vertical_circle',
			'keywords': ['action', 'swap', 'vertical', 'circle'],
			'name': 'swap vertical circle'
		}, {
			'codepoint': 'E8D7',
			'id': 'system_update_alt',
			'keywords': ['action', 'system', 'update', 'alt'],
			'name': 'system update alt'
		}, {'codepoint': 'E8D8', 'id': 'tab', 'keywords': ['action', 'tab'], 'name': 'tab'}, {
			'codepoint': 'E8D9',
			'id': 'tab_unselected',
			'keywords': ['action', 'tab', 'unselected'],
			'name': 'tab unselected'
		}, {
			'codepoint': 'E8DA',
			'id': 'theaters',
			'keywords': ['action', 'theaters'],
			'name': 'theaters'
		}, {
			'codepoint': 'E8DB',
			'id': 'thumb_down',
			'keywords': ['action', 'thumb', 'down'],
			'name': 'thumb down'
		}, {
			'codepoint': 'E8DC',
			'id': 'thumb_up',
			'keywords': ['action', 'thumb', 'up'],
			'name': 'thumb up'
		}, {
			'codepoint': 'E8DD',
			'id': 'thumbs_up_down',
			'keywords': ['action', 'thumbs', 'up', 'down'],
			'name': 'thumbs up down'
		}, {'codepoint': 'E8DE', 'id': 'toc', 'keywords': ['action', 'toc'], 'name': 'toc'}, {
			'codepoint': 'E8DF',
			'id': 'today',
			'keywords': ['action', 'today'],
			'name': 'today'
		}, {'codepoint': 'E8E0', 'id': 'toll', 'keywords': ['action', 'toll'], 'name': 'toll'}, {
			'codepoint': 'E8E1',
			'id': 'track_changes',
			'keywords': ['action', 'track', 'changes'],
			'name': 'track changes'
		}, {
			'codepoint': 'E8E2',
			'id': 'translate',
			'keywords': ['action', 'translate'],
			'name': 'translate'
		}, {
			'codepoint': 'E8E3',
			'id': 'trending_down',
			'keywords': ['action', 'trending', 'down'],
			'name': 'trending down'
		}, {
			'codepoint': 'E8E4',
			'id': 'trending_flat',
			'keywords': ['action', 'trending', 'flat'],
			'name': 'trending flat'
		}, {
			'codepoint': 'E8E5',
			'id': 'trending_up',
			'keywords': ['action', 'trending', 'up'],
			'name': 'trending up'
		}, {
			'codepoint': 'E8E6',
			'id': 'turned_in',
			'keywords': ['action', 'turned', 'in'],
			'name': 'turned in'
		}, {
			'codepoint': 'E8E7',
			'id': 'turned_in_not',
			'keywords': ['action', 'turned', 'in', 'not'],
			'name': 'turned in not'
		}, {
			'codepoint': 'E8E8',
			'id': 'verified_user',
			'keywords': ['action', 'verified', 'user'],
			'name': 'verified user'
		}, {
			'codepoint': 'E8E9',
			'id': 'view_agenda',
			'keywords': ['action', 'view', 'agenda'],
			'name': 'view agenda'
		}, {
			'codepoint': 'E8EA',
			'id': 'view_array',
			'keywords': ['action', 'view', 'array'],
			'name': 'view array'
		}, {
			'codepoint': 'E8EB',
			'id': 'view_carousel',
			'keywords': ['action', 'view', 'carousel'],
			'name': 'view carousel'
		}, {
			'codepoint': 'E8EC',
			'id': 'view_column',
			'keywords': ['action', 'view', 'column'],
			'name': 'view column'
		}, {
			'codepoint': 'E8ED',
			'id': 'view_day',
			'keywords': ['action', 'view', 'day'],
			'name': 'view day'
		}, {
			'codepoint': 'E8EE',
			'id': 'view_headline',
			'keywords': ['action', 'view', 'headline'],
			'name': 'view headline'
		}, {
			'codepoint': 'E8EF',
			'id': 'view_list',
			'keywords': ['action', 'view', 'list'],
			'name': 'view list'
		}, {
			'codepoint': 'E8F0',
			'id': 'view_module',
			'keywords': ['action', 'view', 'module'],
			'name': 'view module'
		}, {
			'codepoint': 'E8F1',
			'id': 'view_quilt',
			'keywords': ['action', 'view', 'quilt'],
			'name': 'view quilt'
		}, {
			'codepoint': 'E8F2',
			'id': 'view_stream',
			'keywords': ['action', 'view', 'stream'],
			'name': 'view stream'
		}, {
			'codepoint': 'E8F3',
			'id': 'view_week',
			'keywords': ['action', 'view', 'week'],
			'name': 'view week'
		}, {
			'codepoint': 'E8F4',
			'id': 'visibility',
			'keywords': ['action', 'visibility'],
			'name': 'visibility'
		}, {
			'codepoint': 'E8F5',
			'id': 'visibility_off',
			'keywords': ['action', 'visibility', 'off'],
			'name': 'visibility off'
		}, {'codepoint': 'E8F9', 'id': 'work', 'keywords': ['action', 'work'], 'name': 'work'}, {
			'codepoint': 'E8FA',
			'id': 'youtube_searched_for',
			'keywords': ['action', 'youtube', 'searched'],
			'name': 'youtube searched for'
		}, {
			'codepoint': 'E8FF',
			'id': 'zoom_in',
			'keywords': ['action', 'zoom', 'in'],
			'name': 'zoom in'
		}, {'codepoint': 'E900', 'id': 'zoom_out', 'keywords': ['action', 'zoom', 'out'], 'name': 'zoom out'}]
	}, {
		'id': 'alert',
		'name': 'Alert',
		'icons': [{
			'codepoint': 'E003',
			'id': 'add_alert',
			'keywords': ['alert', 'add', 'alert'],
			'name': 'add alert'
		}, {'codepoint': 'E000', 'id': 'error', 'keywords': ['alert', 'error'], 'name': 'error'}, {
			'codepoint': 'E001',
			'id': 'error_outline',
			'keywords': ['alert', 'error', 'outline'],
			'name': 'error outline'
		}, {'codepoint': 'E002', 'id': 'warning', 'keywords': ['alert', 'warning'], 'name': 'warning'}]
	}, {
		'id': 'av',
		'name': 'AV',
		'icons': [{
			'codepoint': 'E055',
			'id': 'airplay',
			'keywords': ['av', 'airplay'],
			'name': 'airplay'
		}, {'codepoint': 'E019', 'id': 'album', 'keywords': ['av', 'album'], 'name': 'album'}, {
			'codepoint': 'E01B',
			'id': 'av_timer',
			'keywords': ['av', 'av', 'timer'],
			'name': 'av timer'
		}, {
			'codepoint': 'E01C',
			'id': 'closed_caption',
			'keywords': ['av', 'closed', 'caption'],
			'name': 'closed caption'
		}, {
			'codepoint': 'E01D',
			'id': 'equalizer',
			'keywords': ['av', 'equalizer'],
			'name': 'equalizer'
		}, {
			'codepoint': 'E01E',
			'id': 'explicit',
			'keywords': ['av', 'explicit'],
			'name': 'explicit'
		}, {
			'codepoint': 'E01F',
			'id': 'fast_forward',
			'keywords': ['av', 'fast', 'forward'],
			'name': 'fast forward'
		}, {
			'codepoint': 'E020',
			'id': 'fast_rewind',
			'keywords': ['av', 'fast', 'rewind'],
			'name': 'fast rewind'
		}, {
			'codepoint': 'E056',
			'id': 'forward_10',
			'keywords': ['av', 'forward', '10'],
			'name': 'forward 10'
		}, {
			'codepoint': 'E057',
			'id': 'forward_30',
			'keywords': ['av', 'forward', '30'],
			'name': 'forward 30'
		}, {
			'codepoint': 'E058',
			'id': 'forward_5',
			'keywords': ['av', 'forward'],
			'name': 'forward 5'
		}, {'codepoint': 'E021', 'id': 'games', 'keywords': ['av', 'games'], 'name': 'games'}, {
			'codepoint': 'E052',
			'id': 'hd',
			'keywords': ['av', 'hd'],
			'name': 'hd'
		}, {
			'codepoint': 'E023',
			'id': 'hearing',
			'keywords': ['av', 'hearing'],
			'name': 'hearing'
		}, {
			'codepoint': 'E024',
			'id': 'high_quality',
			'keywords': ['av', 'high', 'quality'],
			'name': 'high quality'
		}, {
			'codepoint': 'E02E',
			'id': 'library_add',
			'keywords': ['av', 'library', 'add'],
			'name': 'library add'
		}, {
			'codepoint': 'E02F',
			'id': 'library_books',
			'keywords': ['av', 'library', 'books'],
			'name': 'library books'
		}, {
			'codepoint': 'E030',
			'id': 'library_music',
			'keywords': ['av', 'library', 'music'],
			'name': 'library music'
		}, {'codepoint': 'E028', 'id': 'loop', 'keywords': ['av', 'loop'], 'name': 'loop'}, {
			'codepoint': 'E029',
			'id': 'mic',
			'keywords': ['av', 'mic'],
			'name': 'mic'
		}, {
			'codepoint': 'E02A',
			'id': 'mic_none',
			'keywords': ['av', 'mic', 'none'],
			'name': 'mic none'
		}, {
			'codepoint': 'E02B',
			'id': 'mic_off',
			'keywords': ['av', 'mic', 'off'],
			'name': 'mic off'
		}, {'codepoint': 'E02C', 'id': 'movie', 'keywords': ['av', 'movie'], 'name': 'movie'}, {
			'codepoint': 'E031',
			'id': 'new_releases',
			'keywords': ['av', 'new', 'releases'],
			'name': 'new releases'
		}, {
			'codepoint': 'E033',
			'id': 'not_interested',
			'keywords': ['av', 'not', 'interested'],
			'name': 'not interested'
		}, {'codepoint': 'E034', 'id': 'pause', 'keywords': ['av', 'pause'], 'name': 'pause'}, {
			'codepoint': 'E035',
			'id': 'pause_circle_filled',
			'keywords': ['av', 'pause', 'circle', 'filled'],
			'name': 'pause circle filled'
		}, {
			'codepoint': 'E036',
			'id': 'pause_circle_outline',
			'keywords': ['av', 'pause', 'circle', 'outline'],
			'name': 'pause circle outline'
		}, {
			'codepoint': 'E037',
			'id': 'play_arrow',
			'keywords': ['av', 'play', 'arrow'],
			'name': 'play arrow'
		}, {
			'codepoint': 'E038',
			'id': 'play_circle_filled',
			'keywords': ['av', 'play', 'circle', 'filled'],
			'name': 'play circle filled'
		}, {
			'codepoint': 'E039',
			'id': 'play_circle_outline',
			'keywords': ['av', 'play', 'circle', 'outline'],
			'name': 'play circle outline'
		}, {
			'codepoint': 'E03B',
			'id': 'playlist_add',
			'keywords': ['av', 'playlist', 'add'],
			'name': 'playlist add'
		}, {'codepoint': 'E03C', 'id': 'queue', 'keywords': ['av', 'queue'], 'name': 'queue'}, {
			'codepoint': 'E03D',
			'id': 'queue_music',
			'keywords': ['av', 'queue', 'music'],
			'name': 'queue music'
		}, {'codepoint': 'E03E', 'id': 'radio', 'keywords': ['av', 'radio'], 'name': 'radio'}, {
			'codepoint': 'E03F',
			'id': 'recent_actors',
			'keywords': ['av', 'recent', 'actors'],
			'name': 'recent actors'
		}, {'codepoint': 'E040', 'id': 'repeat', 'keywords': ['av', 'repeat'], 'name': 'repeat'}, {
			'codepoint': 'E041',
			'id': 'repeat_one',
			'keywords': ['av', 'repeat', 'one'],
			'name': 'repeat one'
		}, {'codepoint': 'E042', 'id': 'replay', 'keywords': ['av', 'replay'], 'name': 'replay'}, {
			'codepoint': 'E059',
			'id': 'replay_10',
			'keywords': ['av', 'replay', '10'],
			'name': 'replay 10'
		}, {
			'codepoint': 'E05A',
			'id': 'replay_30',
			'keywords': ['av', 'replay', '30'],
			'name': 'replay 30'
		}, {
			'codepoint': 'E05B',
			'id': 'replay_5',
			'keywords': ['av', 'replay'],
			'name': 'replay 5'
		}, {
			'codepoint': 'E043',
			'id': 'shuffle',
			'keywords': ['av', 'shuffle'],
			'name': 'shuffle'
		}, {
			'codepoint': 'E044',
			'id': 'skip_next',
			'keywords': ['av', 'skip', 'next'],
			'name': 'skip next'
		}, {
			'codepoint': 'E045',
			'id': 'skip_previous',
			'keywords': ['av', 'skip', 'previous'],
			'name': 'skip previous'
		}, {'codepoint': 'E046', 'id': 'snooze', 'keywords': ['av', 'snooze'], 'name': 'snooze'}, {
			'codepoint': 'E053',
			'id': 'sort_by_alpha',
			'keywords': ['av', 'sort', 'by', 'alpha'],
			'name': 'sort by alpha'
		}, {'codepoint': 'E047', 'id': 'stop', 'keywords': ['av', 'stop'], 'name': 'stop'}, {
			'codepoint': 'E048',
			'id': 'subtitles',
			'keywords': ['av', 'subtitles'],
			'name': 'subtitles'
		}, {
			'codepoint': 'E049',
			'id': 'surround_sound',
			'keywords': ['av', 'surround', 'sound'],
			'name': 'surround sound'
		}, {
			'codepoint': 'E04A',
			'id': 'video_library',
			'keywords': ['av', 'video', 'library'],
			'name': 'video library'
		}, {
			'codepoint': 'E04B',
			'id': 'videocam',
			'keywords': ['av', 'videocam'],
			'name': 'videocam'
		}, {
			'codepoint': 'E04C',
			'id': 'videocam_off',
			'keywords': ['av', 'videocam', 'off'],
			'name': 'videocam off'
		}, {
			'codepoint': 'E04D',
			'id': 'volume_down',
			'keywords': ['av', 'volume', 'down'],
			'name': 'volume down'
		}, {
			'codepoint': 'E04E',
			'id': 'volume_mute',
			'keywords': ['av', 'volume', 'mute'],
			'name': 'volume mute'
		}, {
			'codepoint': 'E04F',
			'id': 'volume_off',
			'keywords': ['av', 'volume', 'off'],
			'name': 'volume off'
		}, {
			'codepoint': 'E050',
			'id': 'volume_up',
			'keywords': ['av', 'volume', 'up'],
			'name': 'volume up'
		}, {'codepoint': 'E051', 'id': 'web', 'keywords': ['av', 'web'], 'name': 'web'}]
	}, {
		'id': 'communication',
		'name': 'Communication',
		'icons': [{
			'codepoint': 'E0AF',
			'id': 'business',
			'keywords': ['communication', 'business'],
			'name': 'business'
		}, {
			'codepoint': 'E0B0',
			'id': 'call',
			'keywords': ['communication', 'call'],
			'name': 'call'
		}, {
			'codepoint': 'E0B1',
			'id': 'call_end',
			'keywords': ['communication', 'call', 'end'],
			'name': 'call end'
		}, {
			'codepoint': 'E0B2',
			'id': 'call_made',
			'keywords': ['communication', 'call', 'made'],
			'name': 'call made'
		}, {
			'codepoint': 'E0B3',
			'id': 'call_merge',
			'keywords': ['communication', 'call', 'merge'],
			'name': 'call merge'
		}, {
			'codepoint': 'E0B4',
			'id': 'call_missed',
			'keywords': ['communication', 'call', 'missed'],
			'name': 'call missed'
		}, {
			'codepoint': 'E0B5',
			'id': 'call_received',
			'keywords': ['communication', 'call', 'received'],
			'name': 'call received'
		}, {
			'codepoint': 'E0B6',
			'id': 'call_split',
			'keywords': ['communication', 'call', 'split'],
			'name': 'call split'
		}, {
			'codepoint': 'E0B7',
			'id': 'chat',
			'keywords': ['communication', 'chat'],
			'name': 'chat'
		}, {
			'codepoint': 'E0CA',
			'id': 'chat_bubble',
			'keywords': ['communication', 'chat', 'bubble'],
			'name': 'chat bubble'
		}, {
			'codepoint': 'E0CB',
			'id': 'chat_bubble_outline',
			'keywords': ['communication', 'chat', 'bubble', 'outline'],
			'name': 'chat bubble outline'
		}, {
			'codepoint': 'E0B8',
			'id': 'clear_all',
			'keywords': ['communication', 'clear', 'all'],
			'name': 'clear all'
		}, {
			'codepoint': 'E0B9',
			'id': 'comment',
			'keywords': ['communication', 'comment'],
			'name': 'comment'
		}, {
			'codepoint': 'E0CF',
			'id': 'contact_phone',
			'keywords': ['communication', 'contact', 'phone'],
			'name': 'contact phone'
		}, {
			'codepoint': 'E0BA',
			'id': 'contacts',
			'keywords': ['communication', 'contacts'],
			'name': 'contacts'
		}, {
			'codepoint': 'E0BB',
			'id': 'dialer_sip',
			'keywords': ['communication', 'dialer', 'sip'],
			'name': 'dialer sip'
		}, {
			'codepoint': 'E0BC',
			'id': 'dialpad',
			'keywords': ['communication', 'dialpad'],
			'name': 'dialpad'
		}, {
			'codepoint': 'E0BE',
			'id': 'email',
			'keywords': ['communication', 'email'],
			'name': 'email'
		}, {
			'codepoint': 'E0BF',
			'id': 'forum',
			'keywords': ['communication', 'forum'],
			'name': 'forum'
		}, {
			'codepoint': 'E0C3',
			'id': 'import_export',
			'keywords': ['communication', 'import', 'export'],
			'name': 'import export'
		}, {
			'codepoint': 'E0C4',
			'id': 'invert_colors_off',
			'keywords': ['communication', 'invert', 'colors', 'off'],
			'name': 'invert colors off'
		}, {
			'codepoint': 'E0C6',
			'id': 'live_help',
			'keywords': ['communication', 'live', 'help'],
			'name': 'live help'
		}, {
			'codepoint': 'E0C7',
			'id': 'location_off',
			'keywords': ['communication', 'location', 'off'],
			'name': 'location off'
		}, {
			'codepoint': 'E0C8',
			'id': 'location_on',
			'keywords': ['communication', 'location', 'on'],
			'name': 'location on'
		}, {
			'codepoint': 'E0C9',
			'id': 'message',
			'keywords': ['communication', 'message'],
			'name': 'message'
		}, {
			'codepoint': 'E0CC',
			'id': 'no_sim',
			'keywords': ['communication', 'no', 'sim'],
			'name': 'no sim'
		}, {
			'codepoint': 'E0CD',
			'id': 'phone',
			'keywords': ['communication', 'phone'],
			'name': 'phone'
		}, {
			'codepoint': 'E0DB',
			'id': 'phonelink_erase',
			'keywords': ['communication', 'phonelink', 'erase'],
			'name': 'phonelink erase'
		}, {
			'codepoint': 'E0DC',
			'id': 'phonelink_lock',
			'keywords': ['communication', 'phonelink', 'lock'],
			'name': 'phonelink lock'
		}, {
			'codepoint': 'E0DD',
			'id': 'phonelink_ring',
			'keywords': ['communication', 'phonelink', 'ring'],
			'name': 'phonelink ring'
		}, {
			'codepoint': 'E0DE',
			'id': 'phonelink_setup',
			'keywords': ['communication', 'phonelink', 'setup'],
			'name': 'phonelink setup'
		}, {
			'codepoint': 'E0CE',
			'id': 'portable_wifi_off',
			'keywords': ['communication', 'portable', 'wifi', 'off'],
			'name': 'portable wifi off'
		}, {
			'codepoint': 'E0DF',
			'id': 'present_to_all',
			'keywords': ['communication', 'present', 'to', 'all'],
			'name': 'present to all'
		}, {
			'codepoint': 'E0D1',
			'id': 'ring_volume',
			'keywords': ['communication', 'ring', 'volume'],
			'name': 'ring volume'
		}, {
			'codepoint': 'E0D2',
			'id': 'speaker_phone',
			'keywords': ['communication', 'speaker', 'phone'],
			'name': 'speaker phone'
		}, {
			'codepoint': 'E0D3',
			'id': 'stay_current_landscape',
			'keywords': ['communication', 'stay', 'current', 'landscape'],
			'name': 'stay current landscape'
		}, {
			'codepoint': 'E0D4',
			'id': 'stay_current_portrait',
			'keywords': ['communication', 'stay', 'current', 'portrait'],
			'name': 'stay current portrait'
		}, {
			'codepoint': 'E0D5',
			'id': 'stay_primary_landscape',
			'keywords': ['communication', 'stay', 'primary', 'landscape'],
			'name': 'stay primary landscape'
		}, {
			'codepoint': 'E0D6',
			'id': 'stay_primary_portrait',
			'keywords': ['communication', 'stay', 'primary', 'portrait'],
			'name': 'stay primary portrait'
		}, {
			'codepoint': 'E0D7',
			'id': 'swap_calls',
			'keywords': ['communication', 'swap', 'calls'],
			'name': 'swap calls'
		}, {
			'codepoint': 'E0D8',
			'id': 'textsms',
			'keywords': ['communication', 'textsms'],
			'name': 'textsms'
		}, {
			'codepoint': 'E0D9',
			'id': 'voicemail',
			'keywords': ['communication', 'voicemail'],
			'name': 'voicemail'
		}, {'codepoint': 'E0DA', 'id': 'vpn_key', 'keywords': ['communication', 'vpn', 'key'], 'name': 'vpn key'}]
	}, {
		'id': 'content',
		'name': 'Content',
		'icons': [{
			'codepoint': 'E145',
			'id': 'add',
			'keywords': ['content', 'add'],
			'name': 'add'
		}, {
			'codepoint': 'E146',
			'id': 'add_box',
			'keywords': ['content', 'add', 'box'],
			'name': 'add box'
		}, {
			'codepoint': 'E147',
			'id': 'add_circle',
			'keywords': ['content', 'add', 'circle'],
			'name': 'add circle'
		}, {
			'codepoint': 'E148',
			'id': 'add_circle_outline',
			'keywords': ['content', 'add', 'circle', 'outline'],
			'name': 'add circle outline'
		}, {
			'codepoint': 'E149',
			'id': 'archive',
			'keywords': ['content', 'archive'],
			'name': 'archive'
		}, {
			'codepoint': 'E14A',
			'id': 'backspace',
			'keywords': ['content', 'backspace'],
			'name': 'backspace'
		}, {
			'codepoint': 'E14B',
			'id': 'block',
			'keywords': ['content', 'block'],
			'name': 'block'
		}, {
			'codepoint': 'E14C',
			'id': 'clear',
			'keywords': ['content', 'clear'],
			'name': 'clear'
		}, {
			'codepoint': 'E14D',
			'id': 'content_copy',
			'keywords': ['content', 'content', 'copy'],
			'name': 'content copy'
		}, {
			'codepoint': 'E14E',
			'id': 'content_cut',
			'keywords': ['content', 'content', 'cut'],
			'name': 'content cut'
		}, {
			'codepoint': 'E14F',
			'id': 'content_paste',
			'keywords': ['content', 'content', 'paste'],
			'name': 'content paste'
		}, {
			'codepoint': 'E150',
			'id': 'create',
			'keywords': ['content', 'create'],
			'name': 'create'
		}, {
			'codepoint': 'E151',
			'id': 'drafts',
			'keywords': ['content', 'drafts'],
			'name': 'drafts'
		}, {
			'codepoint': 'E152',
			'id': 'filter_list',
			'keywords': ['content', 'filter', 'list'],
			'name': 'filter list'
		}, {'codepoint': 'E153', 'id': 'flag', 'keywords': ['content', 'flag'], 'name': 'flag'}, {
			'codepoint': 'E167',
			'id': 'font_download',
			'keywords': ['content', 'font', 'download'],
			'name': 'font download'
		}, {
			'codepoint': 'E154',
			'id': 'forward',
			'keywords': ['content', 'forward'],
			'name': 'forward'
		}, {
			'codepoint': 'E155',
			'id': 'gesture',
			'keywords': ['content', 'gesture'],
			'name': 'gesture'
		}, {
			'codepoint': 'E156',
			'id': 'inbox',
			'keywords': ['content', 'inbox'],
			'name': 'inbox'
		}, {'codepoint': 'E157', 'id': 'link', 'keywords': ['content', 'link'], 'name': 'link'}, {
			'codepoint': 'E158',
			'id': 'mail',
			'keywords': ['content', 'mail'],
			'name': 'mail'
		}, {
			'codepoint': 'E159',
			'id': 'markunread',
			'keywords': ['content', 'markunread'],
			'name': 'markunread'
		}, {'codepoint': 'E15A', 'id': 'redo', 'keywords': ['content', 'redo'], 'name': 'redo'}, {
			'codepoint': 'E15B',
			'id': 'remove',
			'keywords': ['content', 'remove'],
			'name': 'remove'
		}, {
			'codepoint': 'E15C',
			'id': 'remove_circle',
			'keywords': ['content', 'remove', 'circle'],
			'name': 'remove circle'
		}, {
			'codepoint': 'E15D',
			'id': 'remove_circle_outline',
			'keywords': ['content', 'remove', 'circle', 'outline'],
			'name': 'remove circle outline'
		}, {
			'codepoint': 'E15E',
			'id': 'reply',
			'keywords': ['content', 'reply'],
			'name': 'reply'
		}, {
			'codepoint': 'E15F',
			'id': 'reply_all',
			'keywords': ['content', 'reply', 'all'],
			'name': 'reply all'
		}, {
			'codepoint': 'E160',
			'id': 'report',
			'keywords': ['content', 'report'],
			'name': 'report'
		}, {'codepoint': 'E161', 'id': 'save', 'keywords': ['content', 'save'], 'name': 'save'}, {
			'codepoint': 'E162',
			'id': 'select_all',
			'keywords': ['content', 'select', 'all'],
			'name': 'select all'
		}, {'codepoint': 'E163', 'id': 'send', 'keywords': ['content', 'send'], 'name': 'send'}, {
			'codepoint': 'E164',
			'id': 'sort',
			'keywords': ['content', 'sort'],
			'name': 'sort'
		}, {
			'codepoint': 'E165',
			'id': 'text_format',
			'keywords': ['content', 'text', 'format'],
			'name': 'text format'
		}, {'codepoint': 'E166', 'id': 'undo', 'keywords': ['content', 'undo'], 'name': 'undo'}]
	}, {
		'id': 'device',
		'name': 'Device',
		'icons': [{
			'codepoint': 'E190',
			'id': 'access_alarm',
			'keywords': ['device', 'access', 'alarm'],
			'name': 'access alarm'
		}, {
			'codepoint': 'E191',
			'id': 'access_alarms',
			'keywords': ['device', 'access', 'alarms'],
			'name': 'access alarms'
		}, {
			'codepoint': 'E192',
			'id': 'access_time',
			'keywords': ['device', 'access', 'time'],
			'name': 'access time'
		}, {
			'codepoint': 'E193',
			'id': 'add_alarm',
			'keywords': ['device', 'add', 'alarm'],
			'name': 'add alarm'
		}, {
			'codepoint': 'E195',
			'id': 'airplanemode_active',
			'keywords': ['device', 'airplanemode', 'active'],
			'name': 'airplanemode active'
		}, {
			'codepoint': 'E194',
			'id': 'airplanemode_inactive',
			'keywords': ['device', 'airplanemode', 'inactive'],
			'name': 'airplanemode inactive'
		}, {
			'codepoint': 'E19C',
			'id': 'battery_alert',
			'keywords': ['device', 'battery', 'alert'],
			'name': 'battery alert'
		}, {
			'codepoint': 'E1A3',
			'id': 'battery_charging_full',
			'keywords': ['device', 'battery', 'charging', 'full'],
			'name': 'battery charging full'
		}, {
			'codepoint': 'E1A4',
			'id': 'battery_full',
			'keywords': ['device', 'battery', 'full'],
			'name': 'battery full'
		}, {
			'codepoint': 'E1A5',
			'id': 'battery_std',
			'keywords': ['device', 'battery', 'std'],
			'name': 'battery std'
		}, {
			'codepoint': 'E1A6',
			'id': 'battery_unknown',
			'keywords': ['device', 'battery', 'unknown'],
			'name': 'battery unknown'
		}, {
			'codepoint': 'E1A7',
			'id': 'bluetooth',
			'keywords': ['device', 'bluetooth'],
			'name': 'bluetooth'
		}, {
			'codepoint': 'E1A8',
			'id': 'bluetooth_connected',
			'keywords': ['device', 'bluetooth', 'connected'],
			'name': 'bluetooth connected'
		}, {
			'codepoint': 'E1A9',
			'id': 'bluetooth_disabled',
			'keywords': ['device', 'bluetooth', 'disabled'],
			'name': 'bluetooth disabled'
		}, {
			'codepoint': 'E1AA',
			'id': 'bluetooth_searching',
			'keywords': ['device', 'bluetooth', 'searching'],
			'name': 'bluetooth searching'
		}, {
			'codepoint': 'E1AB',
			'id': 'brightness_auto',
			'keywords': ['device', 'brightness', 'auto'],
			'name': 'brightness auto'
		}, {
			'codepoint': 'E1AC',
			'id': 'brightness_high',
			'keywords': ['device', 'brightness', 'high'],
			'name': 'brightness high'
		}, {
			'codepoint': 'E1AD',
			'id': 'brightness_low',
			'keywords': ['device', 'brightness', 'low'],
			'name': 'brightness low'
		}, {
			'codepoint': 'E1AE',
			'id': 'brightness_medium',
			'keywords': ['device', 'brightness', 'medium'],
			'name': 'brightness medium'
		}, {
			'codepoint': 'E1AF',
			'id': 'data_usage',
			'keywords': ['device', 'data', 'usage'],
			'name': 'data usage'
		}, {
			'codepoint': 'E1B0',
			'id': 'developer_mode',
			'keywords': ['device', 'developer', 'mode'],
			'name': 'developer mode'
		}, {
			'codepoint': 'E1B1',
			'id': 'devices',
			'keywords': ['device', 'devices'],
			'name': 'devices'
		}, {'codepoint': 'E1B2', 'id': 'dvr', 'keywords': ['device', 'dvr'], 'name': 'dvr'}, {
			'codepoint': 'E1B3',
			'id': 'gps_fixed',
			'keywords': ['device', 'gps', 'fixed'],
			'name': 'gps fixed'
		}, {
			'codepoint': 'E1B4',
			'id': 'gps_not_fixed',
			'keywords': ['device', 'gps', 'not', 'fixed'],
			'name': 'gps not fixed'
		}, {
			'codepoint': 'E1B5',
			'id': 'gps_off',
			'keywords': ['device', 'gps', 'off'],
			'name': 'gps off'
		}, {
			'codepoint': 'E1B8',
			'id': 'graphic_eq',
			'keywords': ['device', 'graphic', 'eq'],
			'name': 'graphic eq'
		}, {
			'codepoint': 'E1B6',
			'id': 'location_disabled',
			'keywords': ['device', 'location', 'disabled'],
			'name': 'location disabled'
		}, {
			'codepoint': 'E1B7',
			'id': 'location_searching',
			'keywords': ['device', 'location', 'searching'],
			'name': 'location searching'
		}, {
			'codepoint': 'E1B9',
			'id': 'network_cell',
			'keywords': ['device', 'network', 'cell'],
			'name': 'network cell'
		}, {
			'codepoint': 'E1BA',
			'id': 'network_wifi',
			'keywords': ['device', 'network', 'wifi'],
			'name': 'network wifi'
		}, {'codepoint': 'E1BB', 'id': 'nfc', 'keywords': ['device', 'nfc'], 'name': 'nfc'}, {
			'codepoint': 'E1BE',
			'id': 'screen_lock_landscape',
			'keywords': ['device', 'screen', 'lock', 'landscape'],
			'name': 'screen lock landscape'
		}, {
			'codepoint': 'E1BF',
			'id': 'screen_lock_portrait',
			'keywords': ['device', 'screen', 'lock', 'portrait'],
			'name': 'screen lock portrait'
		}, {
			'codepoint': 'E1C0',
			'id': 'screen_lock_rotation',
			'keywords': ['device', 'screen', 'lock', 'rotation'],
			'name': 'screen lock rotation'
		}, {
			'codepoint': 'E1C1',
			'id': 'screen_rotation',
			'keywords': ['device', 'screen', 'rotation'],
			'name': 'screen rotation'
		}, {
			'codepoint': 'E1C2',
			'id': 'sd_storage',
			'keywords': ['device', 'sd', 'storage'],
			'name': 'sd storage'
		}, {
			'codepoint': 'E1C3',
			'id': 'settings_system_daydream',
			'keywords': ['device', 'settings', 'system', 'daydream'],
			'name': 'settings system daydream'
		}, {
			'codepoint': 'E1C8',
			'id': 'signal_cellular_4_bar',
			'keywords': ['device', 'signal', 'cellular', 'bar'],
			'name': 'signal cellular 4 bar'
		}, {
			'codepoint': 'E1CD',
			'id': 'signal_cellular_connected_no_internet_4_bar',
			'keywords': ['device', 'signal', 'cellular', 'connected', 'no', 'internet', 'bar'],
			'name': 'signal cellular connected no internet 4 bar'
		}, {
			'codepoint': 'E1CE',
			'id': 'signal_cellular_no_sim',
			'keywords': ['device', 'signal', 'cellular', 'no', 'sim'],
			'name': 'signal cellular no sim'
		}, {
			'codepoint': 'E1CF',
			'id': 'signal_cellular_null',
			'keywords': ['device', 'signal', 'cellular', 'null'],
			'name': 'signal cellular null'
		}, {
			'codepoint': 'E1D0',
			'id': 'signal_cellular_off',
			'keywords': ['device', 'signal', 'cellular', 'off'],
			'name': 'signal cellular off'
		}, {
			'codepoint': 'E1D8',
			'id': 'signal_wifi_4_bar',
			'keywords': ['device', 'signal', 'wifi', 'bar'],
			'name': 'signal wifi 4 bar'
		}, {
			'codepoint': 'E1D9',
			'id': 'signal_wifi_4_bar_lock',
			'keywords': ['device', 'signal', 'wifi', 'bar', 'lock'],
			'name': 'signal wifi 4 bar lock'
		}, {
			'codepoint': 'E1DA',
			'id': 'signal_wifi_off',
			'keywords': ['device', 'signal', 'wifi', 'off'],
			'name': 'signal wifi off'
		}, {
			'codepoint': 'E1DB',
			'id': 'storage',
			'keywords': ['device', 'storage'],
			'name': 'storage'
		}, {'codepoint': 'E1E0', 'id': 'usb', 'keywords': ['device', 'usb'], 'name': 'usb'}, {
			'codepoint': 'E1BC',
			'id': 'wallpaper',
			'keywords': ['device', 'wallpaper'],
			'name': 'wallpaper'
		}, {
			'codepoint': 'E1BD',
			'id': 'widgets',
			'keywords': ['device', 'widgets'],
			'name': 'widgets'
		}, {
			'codepoint': 'E1E1',
			'id': 'wifi_lock',
			'keywords': ['device', 'wifi', 'lock'],
			'name': 'wifi lock'
		}, {
			'codepoint': 'E1E2',
			'id': 'wifi_tethering',
			'keywords': ['device', 'wifi', 'tethering'],
			'name': 'wifi tethering'
		}]
	}, {
		'id': 'editor',
		'name': 'Editor',
		'icons': [{
			'codepoint': 'E226',
			'id': 'attach_file',
			'keywords': ['editor', 'attach', 'file'],
			'name': 'attach file'
		}, {
			'codepoint': 'E227',
			'id': 'attach_money',
			'keywords': ['editor', 'attach', 'money'],
			'name': 'attach money'
		}, {
			'codepoint': 'E228',
			'id': 'border_all',
			'keywords': ['editor', 'border', 'all'],
			'name': 'border all'
		}, {
			'codepoint': 'E229',
			'id': 'border_bottom',
			'keywords': ['editor', 'border', 'bottom'],
			'name': 'border bottom'
		}, {
			'codepoint': 'E22A',
			'id': 'border_clear',
			'keywords': ['editor', 'border', 'clear'],
			'name': 'border clear'
		}, {
			'codepoint': 'E22B',
			'id': 'border_color',
			'keywords': ['editor', 'border', 'color'],
			'name': 'border color'
		}, {
			'codepoint': 'E22C',
			'id': 'border_horizontal',
			'keywords': ['editor', 'border', 'horizontal'],
			'name': 'border horizontal'
		}, {
			'codepoint': 'E22D',
			'id': 'border_inner',
			'keywords': ['editor', 'border', 'inner'],
			'name': 'border inner'
		}, {
			'codepoint': 'E22E',
			'id': 'border_left',
			'keywords': ['editor', 'border', 'left'],
			'name': 'border left'
		}, {
			'codepoint': 'E22F',
			'id': 'border_outer',
			'keywords': ['editor', 'border', 'outer'],
			'name': 'border outer'
		}, {
			'codepoint': 'E230',
			'id': 'border_right',
			'keywords': ['editor', 'border', 'right'],
			'name': 'border right'
		}, {
			'codepoint': 'E231',
			'id': 'border_style',
			'keywords': ['editor', 'border', 'style'],
			'name': 'border style'
		}, {
			'codepoint': 'E232',
			'id': 'border_top',
			'keywords': ['editor', 'border', 'top'],
			'name': 'border top'
		}, {
			'codepoint': 'E233',
			'id': 'border_vertical',
			'keywords': ['editor', 'border', 'vertical'],
			'name': 'border vertical'
		}, {
			'codepoint': 'E234',
			'id': 'format_align_center',
			'keywords': ['editor', 'format', 'align', 'center'],
			'name': 'format align center'
		}, {
			'codepoint': 'E235',
			'id': 'format_align_justify',
			'keywords': ['editor', 'format', 'align', 'justify'],
			'name': 'format align justify'
		}, {
			'codepoint': 'E236',
			'id': 'format_align_left',
			'keywords': ['editor', 'format', 'align', 'left'],
			'name': 'format align left'
		}, {
			'codepoint': 'E237',
			'id': 'format_align_right',
			'keywords': ['editor', 'format', 'align', 'right'],
			'name': 'format align right'
		}, {
			'codepoint': 'E238',
			'id': 'format_bold',
			'keywords': ['editor', 'format', 'bold'],
			'name': 'format bold'
		}, {
			'codepoint': 'E239',
			'id': 'format_clear',
			'keywords': ['editor', 'format', 'clear'],
			'name': 'format clear'
		}, {
			'codepoint': 'E23A',
			'id': 'format_color_fill',
			'keywords': ['editor', 'format', 'color', 'fill'],
			'name': 'format color fill'
		}, {
			'codepoint': 'E23B',
			'id': 'format_color_reset',
			'keywords': ['editor', 'format', 'color', 'reset'],
			'name': 'format color reset'
		}, {
			'codepoint': 'E23C',
			'id': 'format_color_text',
			'keywords': ['editor', 'format', 'color', 'text'],
			'name': 'format color text'
		}, {
			'codepoint': 'E23D',
			'id': 'format_indent_decrease',
			'keywords': ['editor', 'format', 'indent', 'decrease'],
			'name': 'format indent decrease'
		}, {
			'codepoint': 'E23E',
			'id': 'format_indent_increase',
			'keywords': ['editor', 'format', 'indent', 'increase'],
			'name': 'format indent increase'
		}, {
			'codepoint': 'E23F',
			'id': 'format_italic',
			'keywords': ['editor', 'format', 'italic'],
			'name': 'format italic'
		}, {
			'codepoint': 'E240',
			'id': 'format_line_spacing',
			'keywords': ['editor', 'format', 'line', 'spacing'],
			'name': 'format line spacing'
		}, {
			'codepoint': 'E241',
			'id': 'format_list_bulleted',
			'keywords': ['editor', 'format', 'list', 'bulleted'],
			'name': 'format list bulleted'
		}, {
			'codepoint': 'E242',
			'id': 'format_list_numbered',
			'keywords': ['editor', 'format', 'list', 'numbered'],
			'name': 'format list numbered'
		}, {
			'codepoint': 'E243',
			'id': 'format_paint',
			'keywords': ['editor', 'format', 'paint'],
			'name': 'format paint'
		}, {
			'codepoint': 'E244',
			'id': 'format_quote',
			'keywords': ['editor', 'format', 'quote'],
			'name': 'format quote'
		}, {
			'codepoint': 'E245',
			'id': 'format_size',
			'keywords': ['editor', 'format', 'size'],
			'name': 'format size'
		}, {
			'codepoint': 'E246',
			'id': 'format_strikethrough',
			'keywords': ['editor', 'format', 'strikethrough'],
			'name': 'format strikethrough'
		}, {
			'codepoint': 'E247',
			'id': 'format_textdirection_l_to_r',
			'keywords': ['editor', 'format', 'textdirection', 'to'],
			'name': 'format textdirection l to r'
		}, {
			'codepoint': 'E248',
			'id': 'format_textdirection_r_to_l',
			'keywords': ['editor', 'format', 'textdirection', 'to'],
			'name': 'format textdirection r to l'
		}, {
			'codepoint': 'E249',
			'id': 'format_underlined',
			'keywords': ['editor', 'format', 'underlined'],
			'name': 'format underlined'
		}, {
			'codepoint': 'E24A',
			'id': 'functions',
			'keywords': ['editor', 'functions'],
			'name': 'functions'
		}, {
			'codepoint': 'E24B',
			'id': 'insert_chart',
			'keywords': ['editor', 'insert', 'chart'],
			'name': 'insert chart'
		}, {
			'codepoint': 'E24C',
			'id': 'insert_comment',
			'keywords': ['editor', 'insert', 'comment'],
			'name': 'insert comment'
		}, {
			'codepoint': 'E24D',
			'id': 'insert_drive_file',
			'keywords': ['editor', 'insert', 'drive', 'file'],
			'name': 'insert drive file'
		}, {
			'codepoint': 'E24E',
			'id': 'insert_emoticon',
			'keywords': ['editor', 'insert', 'emoticon'],
			'name': 'insert emoticon'
		}, {
			'codepoint': 'E24F',
			'id': 'insert_invitation',
			'keywords': ['editor', 'insert', 'invitation'],
			'name': 'insert invitation'
		}, {
			'codepoint': 'E250',
			'id': 'insert_link',
			'keywords': ['editor', 'insert', 'link'],
			'name': 'insert link'
		}, {
			'codepoint': 'E251',
			'id': 'insert_photo',
			'keywords': ['editor', 'insert', 'photo'],
			'name': 'insert photo'
		}, {
			'codepoint': 'E252',
			'id': 'merge_type',
			'keywords': ['editor', 'merge', 'type'],
			'name': 'merge type'
		}, {
			'codepoint': 'E253',
			'id': 'mode_comment',
			'keywords': ['editor', 'mode', 'comment'],
			'name': 'mode comment'
		}, {
			'codepoint': 'E254',
			'id': 'mode_edit',
			'keywords': ['editor', 'mode', 'edit'],
			'name': 'mode edit'
		}, {
			'codepoint': 'E25C',
			'id': 'money_off',
			'keywords': ['editor', 'money', 'off'],
			'name': 'money off'
		}, {
			'codepoint': 'E255',
			'id': 'publish',
			'keywords': ['editor', 'publish'],
			'name': 'publish'
		}, {
			'codepoint': 'E256',
			'id': 'space_bar',
			'keywords': ['editor', 'space', 'bar'],
			'name': 'space bar'
		}, {
			'codepoint': 'E257',
			'id': 'strikethrough_s',
			'keywords': ['editor', 'strikethrough'],
			'name': 'strikethrough s'
		}, {
			'codepoint': 'E258',
			'id': 'vertical_align_bottom',
			'keywords': ['editor', 'vertical', 'align', 'bottom'],
			'name': 'vertical align bottom'
		}, {
			'codepoint': 'E259',
			'id': 'vertical_align_center',
			'keywords': ['editor', 'vertical', 'align', 'center'],
			'name': 'vertical align center'
		}, {
			'codepoint': 'E25A',
			'id': 'vertical_align_top',
			'keywords': ['editor', 'vertical', 'align', 'top'],
			'name': 'vertical align top'
		}, {'codepoint': 'E25B', 'id': 'wrap_text', 'keywords': ['editor', 'wrap', 'text'], 'name': 'wrap text'}]
	}, {
		'id': 'file',
		'name': 'File',
		'icons': [{
			'codepoint': 'E2BC',
			'id': 'attachment',
			'keywords': ['file', 'attachment'],
			'name': 'attachment'
		}, {'codepoint': 'E2BD', 'id': 'cloud', 'keywords': ['file', 'cloud'], 'name': 'cloud'}, {
			'codepoint': 'E2BE',
			'id': 'cloud_circle',
			'keywords': ['file', 'cloud', 'circle'],
			'name': 'cloud circle'
		}, {
			'codepoint': 'E2BF',
			'id': 'cloud_done',
			'keywords': ['file', 'cloud', 'done'],
			'name': 'cloud done'
		}, {
			'codepoint': 'E2C0',
			'id': 'cloud_download',
			'keywords': ['file', 'cloud', 'download'],
			'name': 'cloud download'
		}, {
			'codepoint': 'E2C1',
			'id': 'cloud_off',
			'keywords': ['file', 'cloud', 'off'],
			'name': 'cloud off'
		}, {
			'codepoint': 'E2C2',
			'id': 'cloud_queue',
			'keywords': ['file', 'cloud', 'queue'],
			'name': 'cloud queue'
		}, {
			'codepoint': 'E2C3',
			'id': 'cloud_upload',
			'keywords': ['file', 'cloud', 'upload'],
			'name': 'cloud upload'
		}, {
			'codepoint': 'E2C4',
			'id': 'file_download',
			'keywords': ['file', 'file', 'download'],
			'name': 'file download'
		}, {
			'codepoint': 'E2C6',
			'id': 'file_upload',
			'keywords': ['file', 'file', 'upload'],
			'name': 'file upload'
		}, {
			'codepoint': 'E2C7',
			'id': 'folder',
			'keywords': ['file', 'folder'],
			'name': 'folder'
		}, {
			'codepoint': 'E2C8',
			'id': 'folder_open',
			'keywords': ['file', 'folder', 'open'],
			'name': 'folder open'
		}, {
			'codepoint': 'E2C9',
			'id': 'folder_shared',
			'keywords': ['file', 'folder', 'shared'],
			'name': 'folder shared'
		}]
	}, {
		'id': 'hardware',
		'name': 'Hardware',
		'icons': [{
			'codepoint': 'E307',
			'id': 'cast',
			'keywords': ['hardware', 'cast'],
			'name': 'cast'
		}, {
			'codepoint': 'E308',
			'id': 'cast_connected',
			'keywords': ['hardware', 'cast', 'connected'],
			'name': 'cast connected'
		}, {
			'codepoint': 'E30A',
			'id': 'computer',
			'keywords': ['hardware', 'computer'],
			'name': 'computer'
		}, {
			'codepoint': 'E30B',
			'id': 'desktop_mac',
			'keywords': ['hardware', 'desktop', 'mac'],
			'name': 'desktop mac'
		}, {
			'codepoint': 'E30C',
			'id': 'desktop_windows',
			'keywords': ['hardware', 'desktop', 'windows'],
			'name': 'desktop windows'
		}, {
			'codepoint': 'E30D',
			'id': 'developer_board',
			'keywords': ['hardware', 'developer', 'board'],
			'name': 'developer board'
		}, {
			'codepoint': 'E335',
			'id': 'device_hub',
			'keywords': ['hardware', 'device', 'hub'],
			'name': 'device hub'
		}, {'codepoint': 'E30E', 'id': 'dock', 'keywords': ['hardware', 'dock'], 'name': 'dock'}, {
			'codepoint': 'E30F',
			'id': 'gamepad',
			'keywords': ['hardware', 'gamepad'],
			'name': 'gamepad'
		}, {
			'codepoint': 'E310',
			'id': 'headset',
			'keywords': ['hardware', 'headset'],
			'name': 'headset'
		}, {
			'codepoint': 'E311',
			'id': 'headset_mic',
			'keywords': ['hardware', 'headset', 'mic'],
			'name': 'headset mic'
		}, {
			'codepoint': 'E312',
			'id': 'keyboard',
			'keywords': ['hardware', 'keyboard'],
			'name': 'keyboard'
		}, {
			'codepoint': 'E313',
			'id': 'keyboard_arrow_down',
			'keywords': ['hardware', 'keyboard', 'arrow', 'down'],
			'name': 'keyboard arrow down'
		}, {
			'codepoint': 'E314',
			'id': 'keyboard_arrow_left',
			'keywords': ['hardware', 'keyboard', 'arrow', 'left'],
			'name': 'keyboard arrow left'
		}, {
			'codepoint': 'E315',
			'id': 'keyboard_arrow_right',
			'keywords': ['hardware', 'keyboard', 'arrow', 'right'],
			'name': 'keyboard arrow right'
		}, {
			'codepoint': 'E316',
			'id': 'keyboard_arrow_up',
			'keywords': ['hardware', 'keyboard', 'arrow', 'up'],
			'name': 'keyboard arrow up'
		}, {
			'codepoint': 'E317',
			'id': 'keyboard_backspace',
			'keywords': ['hardware', 'keyboard', 'backspace'],
			'name': 'keyboard backspace'
		}, {
			'codepoint': 'E318',
			'id': 'keyboard_capslock',
			'keywords': ['hardware', 'keyboard', 'capslock'],
			'name': 'keyboard capslock'
		}, {
			'codepoint': 'E31A',
			'id': 'keyboard_hide',
			'keywords': ['hardware', 'keyboard', 'hide'],
			'name': 'keyboard hide'
		}, {
			'codepoint': 'E31B',
			'id': 'keyboard_return',
			'keywords': ['hardware', 'keyboard', 'return'],
			'name': 'keyboard return'
		}, {
			'codepoint': 'E31C',
			'id': 'keyboard_tab',
			'keywords': ['hardware', 'keyboard', 'tab'],
			'name': 'keyboard tab'
		}, {
			'codepoint': 'E31D',
			'id': 'keyboard_voice',
			'keywords': ['hardware', 'keyboard', 'voice'],
			'name': 'keyboard voice'
		}, {
			'codepoint': 'E31E',
			'id': 'laptop',
			'keywords': ['hardware', 'laptop'],
			'name': 'laptop'
		}, {
			'codepoint': 'E31F',
			'id': 'laptop_chromebook',
			'keywords': ['hardware', 'laptop', 'chromebook'],
			'name': 'laptop chromebook'
		}, {
			'codepoint': 'E320',
			'id': 'laptop_mac',
			'keywords': ['hardware', 'laptop', 'mac'],
			'name': 'laptop mac'
		}, {
			'codepoint': 'E321',
			'id': 'laptop_windows',
			'keywords': ['hardware', 'laptop', 'windows'],
			'name': 'laptop windows'
		}, {
			'codepoint': 'E322',
			'id': 'memory',
			'keywords': ['hardware', 'memory'],
			'name': 'memory'
		}, {
			'codepoint': 'E323',
			'id': 'mouse',
			'keywords': ['hardware', 'mouse'],
			'name': 'mouse'
		}, {
			'codepoint': 'E324',
			'id': 'phone_android',
			'keywords': ['hardware', 'phone', 'android'],
			'name': 'phone android'
		}, {
			'codepoint': 'E325',
			'id': 'phone_iphone',
			'keywords': ['hardware', 'phone', 'iphone'],
			'name': 'phone iphone'
		}, {
			'codepoint': 'E326',
			'id': 'phonelink',
			'keywords': ['hardware', 'phonelink'],
			'name': 'phonelink'
		}, {
			'codepoint': 'E327',
			'id': 'phonelink_off',
			'keywords': ['hardware', 'phonelink', 'off'],
			'name': 'phonelink off'
		}, {
			'codepoint': 'E336',
			'id': 'power_input',
			'keywords': ['hardware', 'power', 'input'],
			'name': 'power input'
		}, {
			'codepoint': 'E328',
			'id': 'router',
			'keywords': ['hardware', 'router'],
			'name': 'router'
		}, {
			'codepoint': 'E329',
			'id': 'scanner',
			'keywords': ['hardware', 'scanner'],
			'name': 'scanner'
		}, {
			'codepoint': 'E32A',
			'id': 'security',
			'keywords': ['hardware', 'security'],
			'name': 'security'
		}, {
			'codepoint': 'E32B',
			'id': 'sim_card',
			'keywords': ['hardware', 'sim', 'card'],
			'name': 'sim card'
		}, {
			'codepoint': 'E32C',
			'id': 'smartphone',
			'keywords': ['hardware', 'smartphone'],
			'name': 'smartphone'
		}, {
			'codepoint': 'E32D',
			'id': 'speaker',
			'keywords': ['hardware', 'speaker'],
			'name': 'speaker'
		}, {
			'codepoint': 'E32E',
			'id': 'speaker_group',
			'keywords': ['hardware', 'speaker', 'group'],
			'name': 'speaker group'
		}, {
			'codepoint': 'E32F',
			'id': 'tablet',
			'keywords': ['hardware', 'tablet'],
			'name': 'tablet'
		}, {
			'codepoint': 'E330',
			'id': 'tablet_android',
			'keywords': ['hardware', 'tablet', 'android'],
			'name': 'tablet android'
		}, {
			'codepoint': 'E331',
			'id': 'tablet_mac',
			'keywords': ['hardware', 'tablet', 'mac'],
			'name': 'tablet mac'
		}, {'codepoint': 'E332', 'id': 'toys', 'keywords': ['hardware', 'toys'], 'name': 'toys'}, {
			'codepoint': 'E333',
			'id': 'tv',
			'keywords': ['hardware', 'tv'],
			'name': 'tv'
		}, {'codepoint': 'E334', 'id': 'watch', 'keywords': ['hardware', 'watch'], 'name': 'watch'}]
	}, {
		'id': 'image',
		'name': 'Image',
		'icons': [{
			'codepoint': 'E39D',
			'id': 'add_to_photos',
			'keywords': ['image', 'add', 'to', 'photos'],
			'name': 'add to photos'
		}, {
			'codepoint': 'E39E',
			'id': 'adjust',
			'keywords': ['image', 'adjust'],
			'name': 'adjust'
		}, {
			'codepoint': 'E39F',
			'id': 'assistant',
			'keywords': ['image', 'assistant'],
			'name': 'assistant'
		}, {
			'codepoint': 'E3A0',
			'id': 'assistant_photo',
			'keywords': ['image', 'assistant', 'photo'],
			'name': 'assistant photo'
		}, {
			'codepoint': 'E3A1',
			'id': 'audiotrack',
			'keywords': ['image', 'audiotrack'],
			'name': 'audiotrack'
		}, {
			'codepoint': 'E3A2',
			'id': 'blur_circular',
			'keywords': ['image', 'blur', 'circular'],
			'name': 'blur circular'
		}, {
			'codepoint': 'E3A3',
			'id': 'blur_linear',
			'keywords': ['image', 'blur', 'linear'],
			'name': 'blur linear'
		}, {
			'codepoint': 'E3A4',
			'id': 'blur_off',
			'keywords': ['image', 'blur', 'off'],
			'name': 'blur off'
		}, {
			'codepoint': 'E3A5',
			'id': 'blur_on',
			'keywords': ['image', 'blur', 'on'],
			'name': 'blur on'
		}, {
			'codepoint': 'E3A6',
			'id': 'brightness_1',
			'keywords': ['image', 'brightness'],
			'name': 'brightness 1'
		}, {
			'codepoint': 'E3A7',
			'id': 'brightness_2',
			'keywords': ['image', 'brightness'],
			'name': 'brightness 2'
		}, {
			'codepoint': 'E3A8',
			'id': 'brightness_3',
			'keywords': ['image', 'brightness'],
			'name': 'brightness 3'
		}, {
			'codepoint': 'E3A9',
			'id': 'brightness_4',
			'keywords': ['image', 'brightness'],
			'name': 'brightness 4'
		}, {
			'codepoint': 'E3AA',
			'id': 'brightness_5',
			'keywords': ['image', 'brightness'],
			'name': 'brightness 5'
		}, {
			'codepoint': 'E3AB',
			'id': 'brightness_6',
			'keywords': ['image', 'brightness'],
			'name': 'brightness 6'
		}, {
			'codepoint': 'E3AC',
			'id': 'brightness_7',
			'keywords': ['image', 'brightness'],
			'name': 'brightness 7'
		}, {
			'codepoint': 'E3AD',
			'id': 'broken_image',
			'keywords': ['image', 'broken', 'image'],
			'name': 'broken image'
		}, {'codepoint': 'E3AE', 'id': 'brush', 'keywords': ['image', 'brush'], 'name': 'brush'}, {
			'codepoint': 'E3AF',
			'id': 'camera',
			'keywords': ['image', 'camera'],
			'name': 'camera'
		}, {
			'codepoint': 'E3B0',
			'id': 'camera_alt',
			'keywords': ['image', 'camera', 'alt'],
			'name': 'camera alt'
		}, {
			'codepoint': 'E3B1',
			'id': 'camera_front',
			'keywords': ['image', 'camera', 'front'],
			'name': 'camera front'
		}, {
			'codepoint': 'E3B2',
			'id': 'camera_rear',
			'keywords': ['image', 'camera', 'rear'],
			'name': 'camera rear'
		}, {
			'codepoint': 'E3B3',
			'id': 'camera_roll',
			'keywords': ['image', 'camera', 'roll'],
			'name': 'camera roll'
		}, {
			'codepoint': 'E3B4',
			'id': 'center_focus_strong',
			'keywords': ['image', 'center', 'focus', 'strong'],
			'name': 'center focus strong'
		}, {
			'codepoint': 'E3B5',
			'id': 'center_focus_weak',
			'keywords': ['image', 'center', 'focus', 'weak'],
			'name': 'center focus weak'
		}, {
			'codepoint': 'E3B6',
			'id': 'collections',
			'keywords': ['image', 'collections'],
			'name': 'collections'
		}, {
			'codepoint': 'E431',
			'id': 'collections_bookmark',
			'keywords': ['image', 'collections', 'bookmark'],
			'name': 'collections bookmark'
		}, {
			'codepoint': 'E3B7',
			'id': 'color_lens',
			'keywords': ['image', 'color', 'lens'],
			'name': 'color lens'
		}, {
			'codepoint': 'E3B8',
			'id': 'colorize',
			'keywords': ['image', 'colorize'],
			'name': 'colorize'
		}, {
			'codepoint': 'E3B9',
			'id': 'compare',
			'keywords': ['image', 'compare'],
			'name': 'compare'
		}, {
			'codepoint': 'E3BA',
			'id': 'control_point',
			'keywords': ['image', 'control', 'point'],
			'name': 'control point'
		}, {
			'codepoint': 'E3BB',
			'id': 'control_point_duplicate',
			'keywords': ['image', 'control', 'point', 'duplicate'],
			'name': 'control point duplicate'
		}, {'codepoint': 'E3BE', 'id': 'crop', 'keywords': ['image', 'crop'], 'name': 'crop'}, {
			'codepoint': 'E3BC',
			'id': 'crop_16_9',
			'keywords': ['image', 'crop', '16'],
			'name': 'crop 16 9'
		}, {
			'codepoint': 'E3BD',
			'id': 'crop_3_2',
			'keywords': ['image', 'crop'],
			'name': 'crop 3 2'
		}, {
			'codepoint': 'E3BF',
			'id': 'crop_5_4',
			'keywords': ['image', 'crop'],
			'name': 'crop 5 4'
		}, {
			'codepoint': 'E3C0',
			'id': 'crop_7_5',
			'keywords': ['image', 'crop'],
			'name': 'crop 7 5'
		}, {
			'codepoint': 'E3C1',
			'id': 'crop_din',
			'keywords': ['image', 'crop', 'din'],
			'name': 'crop din'
		}, {
			'codepoint': 'E3C2',
			'id': 'crop_free',
			'keywords': ['image', 'crop', 'free'],
			'name': 'crop free'
		}, {
			'codepoint': 'E3C3',
			'id': 'crop_landscape',
			'keywords': ['image', 'crop', 'landscape'],
			'name': 'crop landscape'
		}, {
			'codepoint': 'E3C4',
			'id': 'crop_original',
			'keywords': ['image', 'crop', 'original'],
			'name': 'crop original'
		}, {
			'codepoint': 'E3C5',
			'id': 'crop_portrait',
			'keywords': ['image', 'crop', 'portrait'],
			'name': 'crop portrait'
		}, {
			'codepoint': 'E3C6',
			'id': 'crop_square',
			'keywords': ['image', 'crop', 'square'],
			'name': 'crop square'
		}, {
			'codepoint': 'E3C7',
			'id': 'dehaze',
			'keywords': ['image', 'dehaze'],
			'name': 'dehaze'
		}, {
			'codepoint': 'E3C8',
			'id': 'details',
			'keywords': ['image', 'details'],
			'name': 'details'
		}, {'codepoint': 'E3C9', 'id': 'edit', 'keywords': ['image', 'edit'], 'name': 'edit'}, {
			'codepoint': 'E3CA',
			'id': 'exposure',
			'keywords': ['image', 'exposure'],
			'name': 'exposure'
		}, {
			'codepoint': 'E3CB',
			'id': 'exposure_neg_1',
			'keywords': ['image', 'exposure', 'neg'],
			'name': 'exposure neg 1'
		}, {
			'codepoint': 'E3CC',
			'id': 'exposure_neg_2',
			'keywords': ['image', 'exposure', 'neg'],
			'name': 'exposure neg 2'
		}, {
			'codepoint': 'E3CD',
			'id': 'exposure_plus_1',
			'keywords': ['image', 'exposure', 'plus'],
			'name': 'exposure plus 1'
		}, {
			'codepoint': 'E3CE',
			'id': 'exposure_plus_2',
			'keywords': ['image', 'exposure', 'plus'],
			'name': 'exposure plus 2'
		}, {
			'codepoint': 'E3CF',
			'id': 'exposure_zero',
			'keywords': ['image', 'exposure', 'zero'],
			'name': 'exposure zero'
		}, {
			'codepoint': 'E3D3',
			'id': 'filter',
			'keywords': ['image', 'filter'],
			'name': 'filter'
		}, {
			'codepoint': 'E3D0',
			'id': 'filter_1',
			'keywords': ['image', 'filter'],
			'name': 'filter 1'
		}, {
			'codepoint': 'E3D1',
			'id': 'filter_2',
			'keywords': ['image', 'filter'],
			'name': 'filter 2'
		}, {
			'codepoint': 'E3D2',
			'id': 'filter_3',
			'keywords': ['image', 'filter'],
			'name': 'filter 3'
		}, {
			'codepoint': 'E3D4',
			'id': 'filter_4',
			'keywords': ['image', 'filter'],
			'name': 'filter 4'
		}, {
			'codepoint': 'E3D5',
			'id': 'filter_5',
			'keywords': ['image', 'filter'],
			'name': 'filter 5'
		}, {
			'codepoint': 'E3D6',
			'id': 'filter_6',
			'keywords': ['image', 'filter'],
			'name': 'filter 6'
		}, {
			'codepoint': 'E3D7',
			'id': 'filter_7',
			'keywords': ['image', 'filter'],
			'name': 'filter 7'
		}, {
			'codepoint': 'E3D8',
			'id': 'filter_8',
			'keywords': ['image', 'filter'],
			'name': 'filter 8'
		}, {
			'codepoint': 'E3D9',
			'id': 'filter_9',
			'keywords': ['image', 'filter'],
			'name': 'filter 9'
		}, {
			'codepoint': 'E3DA',
			'id': 'filter_9_plus',
			'keywords': ['image', 'filter', 'plus'],
			'name': 'filter 9 plus'
		}, {
			'codepoint': 'E3DB',
			'id': 'filter_b_and_w',
			'keywords': ['image', 'filter'],
			'name': 'filter b and w'
		}, {
			'codepoint': 'E3DC',
			'id': 'filter_center_focus',
			'keywords': ['image', 'filter', 'center', 'focus'],
			'name': 'filter center focus'
		}, {
			'codepoint': 'E3DD',
			'id': 'filter_drama',
			'keywords': ['image', 'filter', 'drama'],
			'name': 'filter drama'
		}, {
			'codepoint': 'E3DE',
			'id': 'filter_frames',
			'keywords': ['image', 'filter', 'frames'],
			'name': 'filter frames'
		}, {
			'codepoint': 'E3DF',
			'id': 'filter_hdr',
			'keywords': ['image', 'filter', 'hdr'],
			'name': 'filter hdr'
		}, {
			'codepoint': 'E3E0',
			'id': 'filter_none',
			'keywords': ['image', 'filter', 'none'],
			'name': 'filter none'
		}, {
			'codepoint': 'E3E2',
			'id': 'filter_tilt_shift',
			'keywords': ['image', 'filter', 'tilt', 'shift'],
			'name': 'filter tilt shift'
		}, {
			'codepoint': 'E3E3',
			'id': 'filter_vintage',
			'keywords': ['image', 'filter', 'vintage'],
			'name': 'filter vintage'
		}, {'codepoint': 'E3E4', 'id': 'flare', 'keywords': ['image', 'flare'], 'name': 'flare'}, {
			'codepoint': 'E3E5',
			'id': 'flash_auto',
			'keywords': ['image', 'flash', 'auto'],
			'name': 'flash auto'
		}, {
			'codepoint': 'E3E6',
			'id': 'flash_off',
			'keywords': ['image', 'flash', 'off'],
			'name': 'flash off'
		}, {
			'codepoint': 'E3E7',
			'id': 'flash_on',
			'keywords': ['image', 'flash', 'on'],
			'name': 'flash on'
		}, {'codepoint': 'E3E8', 'id': 'flip', 'keywords': ['image', 'flip'], 'name': 'flip'}, {
			'codepoint': 'E3E9',
			'id': 'gradient',
			'keywords': ['image', 'gradient'],
			'name': 'gradient'
		}, {'codepoint': 'E3EA', 'id': 'grain', 'keywords': ['image', 'grain'], 'name': 'grain'}, {
			'codepoint': 'E3EB',
			'id': 'grid_off',
			'keywords': ['image', 'grid', 'off'],
			'name': 'grid off'
		}, {
			'codepoint': 'E3EC',
			'id': 'grid_on',
			'keywords': ['image', 'grid', 'on'],
			'name': 'grid on'
		}, {
			'codepoint': 'E3ED',
			'id': 'hdr_off',
			'keywords': ['image', 'hdr', 'off'],
			'name': 'hdr off'
		}, {
			'codepoint': 'E3EE',
			'id': 'hdr_on',
			'keywords': ['image', 'hdr', 'on'],
			'name': 'hdr on'
		}, {
			'codepoint': 'E3F1',
			'id': 'hdr_strong',
			'keywords': ['image', 'hdr', 'strong'],
			'name': 'hdr strong'
		}, {
			'codepoint': 'E3F2',
			'id': 'hdr_weak',
			'keywords': ['image', 'hdr', 'weak'],
			'name': 'hdr weak'
		}, {
			'codepoint': 'E3F3',
			'id': 'healing',
			'keywords': ['image', 'healing'],
			'name': 'healing'
		}, {'codepoint': 'E3F4', 'id': 'image', 'keywords': ['image', 'image'], 'name': 'image'}, {
			'codepoint': 'E3F5',
			'id': 'image_aspect_ratio',
			'keywords': ['image', 'image', 'aspect', 'ratio'],
			'name': 'image aspect ratio'
		}, {'codepoint': 'E3F6', 'id': 'iso', 'keywords': ['image', 'iso'], 'name': 'iso'}, {
			'codepoint': 'E3F7',
			'id': 'landscape',
			'keywords': ['image', 'landscape'],
			'name': 'landscape'
		}, {
			'codepoint': 'E3F8',
			'id': 'leak_add',
			'keywords': ['image', 'leak', 'add'],
			'name': 'leak add'
		}, {
			'codepoint': 'E3F9',
			'id': 'leak_remove',
			'keywords': ['image', 'leak', 'remove'],
			'name': 'leak remove'
		}, {'codepoint': 'E3FA', 'id': 'lens', 'keywords': ['image', 'lens'], 'name': 'lens'}, {
			'codepoint': 'E3FC',
			'id': 'looks',
			'keywords': ['image', 'looks'],
			'name': 'looks'
		}, {
			'codepoint': 'E3FB',
			'id': 'looks_3',
			'keywords': ['image', 'looks'],
			'name': 'looks 3'
		}, {
			'codepoint': 'E3FD',
			'id': 'looks_4',
			'keywords': ['image', 'looks'],
			'name': 'looks 4'
		}, {
			'codepoint': 'E3FE',
			'id': 'looks_5',
			'keywords': ['image', 'looks'],
			'name': 'looks 5'
		}, {
			'codepoint': 'E3FF',
			'id': 'looks_6',
			'keywords': ['image', 'looks'],
			'name': 'looks 6'
		}, {
			'codepoint': 'E400',
			'id': 'looks_one',
			'keywords': ['image', 'looks', 'one'],
			'name': 'looks one'
		}, {
			'codepoint': 'E401',
			'id': 'looks_two',
			'keywords': ['image', 'looks', 'two'],
			'name': 'looks two'
		}, {'codepoint': 'E402', 'id': 'loupe', 'keywords': ['image', 'loupe'], 'name': 'loupe'}, {
			'codepoint': 'E403',
			'id': 'monochrome_photos',
			'keywords': ['image', 'monochrome', 'photos'],
			'name': 'monochrome photos'
		}, {
			'codepoint': 'E404',
			'id': 'movie_creation',
			'keywords': ['image', 'movie', 'creation'],
			'name': 'movie creation'
		}, {
			'codepoint': 'E405',
			'id': 'music_note',
			'keywords': ['image', 'music', 'note'],
			'name': 'music note'
		}, {
			'codepoint': 'E406',
			'id': 'nature',
			'keywords': ['image', 'nature'],
			'name': 'nature'
		}, {
			'codepoint': 'E407',
			'id': 'nature_people',
			'keywords': ['image', 'nature', 'people'],
			'name': 'nature people'
		}, {
			'codepoint': 'E408',
			'id': 'navigate_before',
			'keywords': ['image', 'navigate', 'before'],
			'name': 'navigate before'
		}, {
			'codepoint': 'E409',
			'id': 'navigate_next',
			'keywords': ['image', 'navigate', 'next'],
			'name': 'navigate next'
		}, {
			'codepoint': 'E40A',
			'id': 'palette',
			'keywords': ['image', 'palette'],
			'name': 'palette'
		}, {
			'codepoint': 'E40B',
			'id': 'panorama',
			'keywords': ['image', 'panorama'],
			'name': 'panorama'
		}, {
			'codepoint': 'E40C',
			'id': 'panorama_fish_eye',
			'keywords': ['image', 'panorama', 'fish', 'eye'],
			'name': 'panorama fish eye'
		}, {
			'codepoint': 'E40D',
			'id': 'panorama_horizontal',
			'keywords': ['image', 'panorama', 'horizontal'],
			'name': 'panorama horizontal'
		}, {
			'codepoint': 'E40E',
			'id': 'panorama_vertical',
			'keywords': ['image', 'panorama', 'vertical'],
			'name': 'panorama vertical'
		}, {
			'codepoint': 'E40F',
			'id': 'panorama_wide_angle',
			'keywords': ['image', 'panorama', 'wide', 'angle'],
			'name': 'panorama wide angle'
		}, {'codepoint': 'E410', 'id': 'photo', 'keywords': ['image', 'photo'], 'name': 'photo'}, {
			'codepoint': 'E411',
			'id': 'photo_album',
			'keywords': ['image', 'photo', 'album'],
			'name': 'photo album'
		}, {
			'codepoint': 'E412',
			'id': 'photo_camera',
			'keywords': ['image', 'photo', 'camera'],
			'name': 'photo camera'
		}, {
			'codepoint': 'E413',
			'id': 'photo_library',
			'keywords': ['image', 'photo', 'library'],
			'name': 'photo library'
		}, {
			'codepoint': 'E432',
			'id': 'photo_size_select_actual',
			'keywords': ['image', 'photo', 'size', 'select', 'actual'],
			'name': 'photo size select actual'
		}, {
			'codepoint': 'E433',
			'id': 'photo_size_select_large',
			'keywords': ['image', 'photo', 'size', 'select', 'large'],
			'name': 'photo size select large'
		}, {
			'codepoint': 'E434',
			'id': 'photo_size_select_small',
			'keywords': ['image', 'photo', 'size', 'select', 'small'],
			'name': 'photo size select small'
		}, {
			'codepoint': 'E415',
			'id': 'picture_as_pdf',
			'keywords': ['image', 'picture', 'as', 'pdf'],
			'name': 'picture as pdf'
		}, {
			'codepoint': 'E416',
			'id': 'portrait',
			'keywords': ['image', 'portrait'],
			'name': 'portrait'
		}, {
			'codepoint': 'E417',
			'id': 'remove_red_eye',
			'keywords': ['image', 'remove', 'red', 'eye'],
			'name': 'remove red eye'
		}, {
			'codepoint': 'E418',
			'id': 'rotate_90_degrees_ccw',
			'keywords': ['image', 'rotate', '90', 'degrees', 'ccw'],
			'name': 'rotate 90 degrees ccw'
		}, {
			'codepoint': 'E419',
			'id': 'rotate_left',
			'keywords': ['image', 'rotate', 'left'],
			'name': 'rotate left'
		}, {
			'codepoint': 'E41A',
			'id': 'rotate_right',
			'keywords': ['image', 'rotate', 'right'],
			'name': 'rotate right'
		}, {
			'codepoint': 'E41B',
			'id': 'slideshow',
			'keywords': ['image', 'slideshow'],
			'name': 'slideshow'
		}, {
			'codepoint': 'E41C',
			'id': 'straighten',
			'keywords': ['image', 'straighten'],
			'name': 'straighten'
		}, {'codepoint': 'E41D', 'id': 'style', 'keywords': ['image', 'style'], 'name': 'style'}, {
			'codepoint': 'E41E',
			'id': 'switch_camera',
			'keywords': ['image', 'switch', 'camera'],
			'name': 'switch camera'
		}, {
			'codepoint': 'E41F',
			'id': 'switch_video',
			'keywords': ['image', 'switch', 'video'],
			'name': 'switch video'
		}, {
			'codepoint': 'E420',
			'id': 'tag_faces',
			'keywords': ['image', 'tag', 'faces'],
			'name': 'tag faces'
		}, {
			'codepoint': 'E421',
			'id': 'texture',
			'keywords': ['image', 'texture'],
			'name': 'texture'
		}, {
			'codepoint': 'E422',
			'id': 'timelapse',
			'keywords': ['image', 'timelapse'],
			'name': 'timelapse'
		}, {'codepoint': 'E425', 'id': 'timer', 'keywords': ['image', 'timer'], 'name': 'timer'}, {
			'codepoint': 'E423',
			'id': 'timer_10',
			'keywords': ['image', 'timer', '10'],
			'name': 'timer 10'
		}, {
			'codepoint': 'E424',
			'id': 'timer_3',
			'keywords': ['image', 'timer'],
			'name': 'timer 3'
		}, {
			'codepoint': 'E426',
			'id': 'timer_off',
			'keywords': ['image', 'timer', 'off'],
			'name': 'timer off'
		}, {
			'codepoint': 'E427',
			'id': 'tonality',
			'keywords': ['image', 'tonality'],
			'name': 'tonality'
		}, {
			'codepoint': 'E428',
			'id': 'transform',
			'keywords': ['image', 'transform'],
			'name': 'transform'
		}, {'codepoint': 'E429', 'id': 'tune', 'keywords': ['image', 'tune'], 'name': 'tune'}, {
			'codepoint': 'E42A',
			'id': 'view_comfy',
			'keywords': ['image', 'view', 'comfy'],
			'name': 'view comfy'
		}, {
			'codepoint': 'E42B',
			'id': 'view_compact',
			'keywords': ['image', 'view', 'compact'],
			'name': 'view compact'
		}, {
			'codepoint': 'E435',
			'id': 'vignette',
			'keywords': ['image', 'vignette'],
			'name': 'vignette'
		}, {
			'codepoint': 'E42C',
			'id': 'wb_auto',
			'keywords': ['image', 'wb', 'auto'],
			'name': 'wb auto'
		}, {
			'codepoint': 'E42D',
			'id': 'wb_cloudy',
			'keywords': ['image', 'wb', 'cloudy'],
			'name': 'wb cloudy'
		}, {
			'codepoint': 'E42E',
			'id': 'wb_incandescent',
			'keywords': ['image', 'wb', 'incandescent'],
			'name': 'wb incandescent'
		}, {
			'codepoint': 'E436',
			'id': 'wb_iridescent',
			'keywords': ['image', 'wb', 'iridescent'],
			'name': 'wb iridescent'
		}, {'codepoint': 'E430', 'id': 'wb_sunny', 'keywords': ['image', 'wb', 'sunny'], 'name': 'wb sunny'}]
	}, {
		'id': 'maps',
		'name': 'Maps',
		'icons': [{
			'codepoint': 'E52D',
			'id': 'beenhere',
			'keywords': ['maps', 'beenhere'],
			'name': 'beenhere'
		}, {
			'codepoint': 'E52E',
			'id': 'directions',
			'keywords': ['maps', 'directions'],
			'name': 'directions'
		}, {
			'codepoint': 'E52F',
			'id': 'directions_bike',
			'keywords': ['maps', 'directions', 'bike'],
			'name': 'directions bike'
		}, {
			'codepoint': 'E532',
			'id': 'directions_boat',
			'keywords': ['maps', 'directions', 'boat'],
			'name': 'directions boat'
		}, {
			'codepoint': 'E530',
			'id': 'directions_bus',
			'keywords': ['maps', 'directions', 'bus'],
			'name': 'directions bus'
		}, {
			'codepoint': 'E531',
			'id': 'directions_car',
			'keywords': ['maps', 'directions', 'car'],
			'name': 'directions car'
		}, {
			'codepoint': 'E534',
			'id': 'directions_railway',
			'keywords': ['maps', 'directions', 'railway'],
			'name': 'directions railway'
		}, {
			'codepoint': 'E566',
			'id': 'directions_run',
			'keywords': ['maps', 'directions', 'run'],
			'name': 'directions run'
		}, {
			'codepoint': 'E533',
			'id': 'directions_subway',
			'keywords': ['maps', 'directions', 'subway'],
			'name': 'directions subway'
		}, {
			'codepoint': 'E535',
			'id': 'directions_transit',
			'keywords': ['maps', 'directions', 'transit'],
			'name': 'directions transit'
		}, {
			'codepoint': 'E536',
			'id': 'directions_walk',
			'keywords': ['maps', 'directions', 'walk'],
			'name': 'directions walk'
		}, {
			'codepoint': 'E539',
			'id': 'flight',
			'keywords': ['maps', 'flight'],
			'name': 'flight'
		}, {'codepoint': 'E53A', 'id': 'hotel', 'keywords': ['maps', 'hotel'], 'name': 'hotel'}, {
			'codepoint': 'E53B',
			'id': 'layers',
			'keywords': ['maps', 'layers'],
			'name': 'layers'
		}, {
			'codepoint': 'E53C',
			'id': 'layers_clear',
			'keywords': ['maps', 'layers', 'clear'],
			'name': 'layers clear'
		}, {
			'codepoint': 'E53F',
			'id': 'local_activity',
			'keywords': ['maps', 'local', 'activity'],
			'name': 'local activity'
		}, {
			'codepoint': 'E53D',
			'id': 'local_airport',
			'keywords': ['maps', 'local', 'airport'],
			'name': 'local airport'
		}, {
			'codepoint': 'E53E',
			'id': 'local_atm',
			'keywords': ['maps', 'local', 'atm'],
			'name': 'local atm'
		}, {
			'codepoint': 'E540',
			'id': 'local_bar',
			'keywords': ['maps', 'local', 'bar'],
			'name': 'local bar'
		}, {
			'codepoint': 'E541',
			'id': 'local_cafe',
			'keywords': ['maps', 'local', 'cafe'],
			'name': 'local cafe'
		}, {
			'codepoint': 'E542',
			'id': 'local_car_wash',
			'keywords': ['maps', 'local', 'car', 'wash'],
			'name': 'local car wash'
		}, {
			'codepoint': 'E543',
			'id': 'local_convenience_store',
			'keywords': ['maps', 'local', 'convenience', 'store'],
			'name': 'local convenience store'
		}, {
			'codepoint': 'E556',
			'id': 'local_dining',
			'keywords': ['maps', 'local', 'dining'],
			'name': 'local dining'
		}, {
			'codepoint': 'E544',
			'id': 'local_drink',
			'keywords': ['maps', 'local', 'drink'],
			'name': 'local drink'
		}, {
			'codepoint': 'E545',
			'id': 'local_florist',
			'keywords': ['maps', 'local', 'florist'],
			'name': 'local florist'
		}, {
			'codepoint': 'E546',
			'id': 'local_gas_station',
			'keywords': ['maps', 'local', 'gas', 'station'],
			'name': 'local gas station'
		}, {
			'codepoint': 'E547',
			'id': 'local_grocery_store',
			'keywords': ['maps', 'local', 'grocery', 'store'],
			'name': 'local grocery store'
		}, {
			'codepoint': 'E548',
			'id': 'local_hospital',
			'keywords': ['maps', 'local', 'hospital'],
			'name': 'local hospital'
		}, {
			'codepoint': 'E549',
			'id': 'local_hotel',
			'keywords': ['maps', 'local', 'hotel'],
			'name': 'local hotel'
		}, {
			'codepoint': 'E54A',
			'id': 'local_laundry_service',
			'keywords': ['maps', 'local', 'laundry', 'service'],
			'name': 'local laundry service'
		}, {
			'codepoint': 'E54B',
			'id': 'local_library',
			'keywords': ['maps', 'local', 'library'],
			'name': 'local library'
		}, {
			'codepoint': 'E54C',
			'id': 'local_mall',
			'keywords': ['maps', 'local', 'mall'],
			'name': 'local mall'
		}, {
			'codepoint': 'E54D',
			'id': 'local_movies',
			'keywords': ['maps', 'local', 'movies'],
			'name': 'local movies'
		}, {
			'codepoint': 'E54E',
			'id': 'local_offer',
			'keywords': ['maps', 'local', 'offer'],
			'name': 'local offer'
		}, {
			'codepoint': 'E54F',
			'id': 'local_parking',
			'keywords': ['maps', 'local', 'parking'],
			'name': 'local parking'
		}, {
			'codepoint': 'E550',
			'id': 'local_pharmacy',
			'keywords': ['maps', 'local', 'pharmacy'],
			'name': 'local pharmacy'
		}, {
			'codepoint': 'E551',
			'id': 'local_phone',
			'keywords': ['maps', 'local', 'phone'],
			'name': 'local phone'
		}, {
			'codepoint': 'E552',
			'id': 'local_pizza',
			'keywords': ['maps', 'local', 'pizza'],
			'name': 'local pizza'
		}, {
			'codepoint': 'E553',
			'id': 'local_play',
			'keywords': ['maps', 'local', 'play'],
			'name': 'local play'
		}, {
			'codepoint': 'E554',
			'id': 'local_post_office',
			'keywords': ['maps', 'local', 'post', 'office'],
			'name': 'local post office'
		}, {
			'codepoint': 'E555',
			'id': 'local_printshop',
			'keywords': ['maps', 'local', 'printshop'],
			'name': 'local printshop'
		}, {
			'codepoint': 'E557',
			'id': 'local_see',
			'keywords': ['maps', 'local', 'see'],
			'name': 'local see'
		}, {
			'codepoint': 'E558',
			'id': 'local_shipping',
			'keywords': ['maps', 'local', 'shipping'],
			'name': 'local shipping'
		}, {
			'codepoint': 'E559',
			'id': 'local_taxi',
			'keywords': ['maps', 'local', 'taxi'],
			'name': 'local taxi'
		}, {'codepoint': 'E55B', 'id': 'map', 'keywords': ['maps', 'map'], 'name': 'map'}, {
			'codepoint': 'E55C',
			'id': 'my_location',
			'keywords': ['maps', 'my', 'location'],
			'name': 'my location'
		}, {
			'codepoint': 'E55D',
			'id': 'navigation',
			'keywords': ['maps', 'navigation'],
			'name': 'navigation'
		}, {
			'codepoint': 'E55A',
			'id': 'person_pin',
			'keywords': ['maps', 'person', 'pin'],
			'name': 'person pin'
		}, {
			'codepoint': 'E55E',
			'id': 'pin_drop',
			'keywords': ['maps', 'pin', 'drop'],
			'name': 'pin drop'
		}, {'codepoint': 'E55F', 'id': 'place', 'keywords': ['maps', 'place'], 'name': 'place'}, {
			'codepoint': 'E560',
			'id': 'rate_review',
			'keywords': ['maps', 'rate', 'review'],
			'name': 'rate review'
		}, {
			'codepoint': 'E561',
			'id': 'restaurant_menu',
			'keywords': ['maps', 'restaurant', 'menu'],
			'name': 'restaurant menu'
		}, {
			'codepoint': 'E562',
			'id': 'satellite',
			'keywords': ['maps', 'satellite'],
			'name': 'satellite'
		}, {
			'codepoint': 'E563',
			'id': 'store_mall_directory',
			'keywords': ['maps', 'store', 'mall', 'directory'],
			'name': 'store mall directory'
		}, {
			'codepoint': 'E564',
			'id': 'terrain',
			'keywords': ['maps', 'terrain'],
			'name': 'terrain'
		}, {'codepoint': 'E565', 'id': 'traffic', 'keywords': ['maps', 'traffic'], 'name': 'traffic'}]
	}, {
		'id': 'navigation',
		'name': 'Navigation',
		'icons': [{
			'codepoint': 'E5C3',
			'id': 'apps',
			'keywords': ['navigation', 'apps'],
			'name': 'apps'
		}, {
			'codepoint': 'E5C4',
			'id': 'arrow_back',
			'keywords': ['navigation', 'arrow', 'back'],
			'name': 'arrow back'
		}, {
			'codepoint': 'E5C5',
			'id': 'arrow_drop_down',
			'keywords': ['navigation', 'arrow', 'drop', 'down'],
			'name': 'arrow drop down'
		}, {
			'codepoint': 'E5C6',
			'id': 'arrow_drop_down_circle',
			'keywords': ['navigation', 'arrow', 'drop', 'down', 'circle'],
			'name': 'arrow drop down circle'
		}, {
			'codepoint': 'E5C7',
			'id': 'arrow_drop_up',
			'keywords': ['navigation', 'arrow', 'drop', 'up'],
			'name': 'arrow drop up'
		}, {
			'codepoint': 'E5C8',
			'id': 'arrow_forward',
			'keywords': ['navigation', 'arrow', 'forward'],
			'name': 'arrow forward'
		}, {
			'codepoint': 'E5C9',
			'id': 'cancel',
			'keywords': ['navigation', 'cancel'],
			'name': 'cancel'
		}, {
			'codepoint': 'E5CA',
			'id': 'check',
			'keywords': ['navigation', 'check'],
			'name': 'check'
		}, {
			'codepoint': 'E5CB',
			'id': 'chevron_left',
			'keywords': ['navigation', 'chevron', 'left'],
			'name': 'chevron left'
		}, {
			'codepoint': 'E5CC',
			'id': 'chevron_right',
			'keywords': ['navigation', 'chevron', 'right'],
			'name': 'chevron right'
		}, {
			'codepoint': 'E5CD',
			'id': 'close',
			'keywords': ['navigation', 'close'],
			'name': 'close'
		}, {
			'codepoint': 'E5CE',
			'id': 'expand_less',
			'keywords': ['navigation', 'expand', 'less'],
			'name': 'expand less'
		}, {
			'codepoint': 'E5CF',
			'id': 'expand_more',
			'keywords': ['navigation', 'expand', 'more'],
			'name': 'expand more'
		}, {
			'codepoint': 'E5D0',
			'id': 'fullscreen',
			'keywords': ['navigation', 'fullscreen'],
			'name': 'fullscreen'
		}, {
			'codepoint': 'E5D1',
			'id': 'fullscreen_exit',
			'keywords': ['navigation', 'fullscreen', 'exit'],
			'name': 'fullscreen exit'
		}, {
			'codepoint': 'E5D2',
			'id': 'menu',
			'keywords': ['navigation', 'menu'],
			'name': 'menu'
		}, {
			'codepoint': 'E5D3',
			'id': 'more_horiz',
			'keywords': ['navigation', 'more', 'horiz'],
			'name': 'more horiz'
		}, {
			'codepoint': 'E5D4',
			'id': 'more_vert',
			'keywords': ['navigation', 'more', 'vert'],
			'name': 'more vert'
		}, {'codepoint': 'E5D5', 'id': 'refresh', 'keywords': ['navigation', 'refresh'], 'name': 'refresh'}]
	}, {
		'id': 'notification',
		'name': 'Notification',
		'icons': [{
			'codepoint': 'E60E',
			'id': 'adb',
			'keywords': ['notification', 'adb'],
			'name': 'adb'
		}, {
			'codepoint': 'E630',
			'id': 'airline_seat_flat',
			'keywords': ['notification', 'airline', 'seat', 'flat'],
			'name': 'airline seat flat'
		}, {
			'codepoint': 'E631',
			'id': 'airline_seat_flat_angled',
			'keywords': ['notification', 'airline', 'seat', 'flat', 'angled'],
			'name': 'airline seat flat angled'
		}, {
			'codepoint': 'E632',
			'id': 'airline_seat_individual_suite',
			'keywords': ['notification', 'airline', 'seat', 'individual', 'suite'],
			'name': 'airline seat individual suite'
		}, {
			'codepoint': 'E633',
			'id': 'airline_seat_legroom_extra',
			'keywords': ['notification', 'airline', 'seat', 'legroom', 'extra'],
			'name': 'airline seat legroom extra'
		}, {
			'codepoint': 'E634',
			'id': 'airline_seat_legroom_normal',
			'keywords': ['notification', 'airline', 'seat', 'legroom', 'normal'],
			'name': 'airline seat legroom normal'
		}, {
			'codepoint': 'E635',
			'id': 'airline_seat_legroom_reduced',
			'keywords': ['notification', 'airline', 'seat', 'legroom', 'reduced'],
			'name': 'airline seat legroom reduced'
		}, {
			'codepoint': 'E636',
			'id': 'airline_seat_recline_extra',
			'keywords': ['notification', 'airline', 'seat', 'recline', 'extra'],
			'name': 'airline seat recline extra'
		}, {
			'codepoint': 'E637',
			'id': 'airline_seat_recline_normal',
			'keywords': ['notification', 'airline', 'seat', 'recline', 'normal'],
			'name': 'airline seat recline normal'
		}, {
			'codepoint': 'E60F',
			'id': 'bluetooth_audio',
			'keywords': ['notification', 'bluetooth', 'audio'],
			'name': 'bluetooth audio'
		}, {
			'codepoint': 'E638',
			'id': 'confirmation_number',
			'keywords': ['notification', 'confirmation', 'number'],
			'name': 'confirmation number'
		}, {
			'codepoint': 'E610',
			'id': 'disc_full',
			'keywords': ['notification', 'disc', 'full'],
			'name': 'disc full'
		}, {
			'codepoint': 'E612',
			'id': 'do_not_disturb',
			'keywords': ['notification', 'do', 'not', 'disturb'],
			'name': 'do not disturb'
		}, {
			'codepoint': 'E611',
			'id': 'do_not_disturb_alt',
			'keywords': ['notification', 'do', 'not', 'disturb', 'alt'],
			'name': 'do not disturb alt'
		}, {
			'codepoint': 'E613',
			'id': 'drive_eta',
			'keywords': ['notification', 'drive', 'eta'],
			'name': 'drive eta'
		}, {
			'codepoint': 'E614',
			'id': 'event_available',
			'keywords': ['notification', 'event', 'available'],
			'name': 'event available'
		}, {
			'codepoint': 'E615',
			'id': 'event_busy',
			'keywords': ['notification', 'event', 'busy'],
			'name': 'event busy'
		}, {
			'codepoint': 'E616',
			'id': 'event_note',
			'keywords': ['notification', 'event', 'note'],
			'name': 'event note'
		}, {
			'codepoint': 'E617',
			'id': 'folder_special',
			'keywords': ['notification', 'folder', 'special'],
			'name': 'folder special'
		}, {
			'codepoint': 'E639',
			'id': 'live_tv',
			'keywords': ['notification', 'live', 'tv'],
			'name': 'live tv'
		}, {'codepoint': 'E618', 'id': 'mms', 'keywords': ['notification', 'mms'], 'name': 'mms'}, {
			'codepoint': 'E619',
			'id': 'more',
			'keywords': ['notification', 'more'],
			'name': 'more'
		}, {
			'codepoint': 'E61A',
			'id': 'network_locked',
			'keywords': ['notification', 'network', 'locked'],
			'name': 'network locked'
		}, {
			'codepoint': 'E63A',
			'id': 'ondemand_video',
			'keywords': ['notification', 'ondemand', 'video'],
			'name': 'ondemand video'
		}, {
			'codepoint': 'E63B',
			'id': 'personal_video',
			'keywords': ['notification', 'personal', 'video'],
			'name': 'personal video'
		}, {
			'codepoint': 'E61B',
			'id': 'phone_bluetooth_speaker',
			'keywords': ['notification', 'phone', 'bluetooth', 'speaker'],
			'name': 'phone bluetooth speaker'
		}, {
			'codepoint': 'E61C',
			'id': 'phone_forwarded',
			'keywords': ['notification', 'phone', 'forwarded'],
			'name': 'phone forwarded'
		}, {
			'codepoint': 'E61D',
			'id': 'phone_in_talk',
			'keywords': ['notification', 'phone', 'in', 'talk'],
			'name': 'phone in talk'
		}, {
			'codepoint': 'E61E',
			'id': 'phone_locked',
			'keywords': ['notification', 'phone', 'locked'],
			'name': 'phone locked'
		}, {
			'codepoint': 'E61F',
			'id': 'phone_missed',
			'keywords': ['notification', 'phone', 'missed'],
			'name': 'phone missed'
		}, {
			'codepoint': 'E620',
			'id': 'phone_paused',
			'keywords': ['notification', 'phone', 'paused'],
			'name': 'phone paused'
		}, {
			'codepoint': 'E63C',
			'id': 'power',
			'keywords': ['notification', 'power'],
			'name': 'power'
		}, {
			'codepoint': 'E623',
			'id': 'sd_card',
			'keywords': ['notification', 'sd', 'card'],
			'name': 'sd card'
		}, {
			'codepoint': 'E624',
			'id': 'sim_card_alert',
			'keywords': ['notification', 'sim', 'card', 'alert'],
			'name': 'sim card alert'
		}, {'codepoint': 'E625', 'id': 'sms', 'keywords': ['notification', 'sms'], 'name': 'sms'}, {
			'codepoint': 'E626',
			'id': 'sms_failed',
			'keywords': ['notification', 'sms', 'failed'],
			'name': 'sms failed'
		}, {
			'codepoint': 'E627',
			'id': 'sync',
			'keywords': ['notification', 'sync'],
			'name': 'sync'
		}, {
			'codepoint': 'E628',
			'id': 'sync_disabled',
			'keywords': ['notification', 'sync', 'disabled'],
			'name': 'sync disabled'
		}, {
			'codepoint': 'E629',
			'id': 'sync_problem',
			'keywords': ['notification', 'sync', 'problem'],
			'name': 'sync problem'
		}, {
			'codepoint': 'E62A',
			'id': 'system_update',
			'keywords': ['notification', 'system', 'update'],
			'name': 'system update'
		}, {
			'codepoint': 'E62B',
			'id': 'tap_and_play',
			'keywords': ['notification', 'tap', 'play'],
			'name': 'tap and play'
		}, {
			'codepoint': 'E62C',
			'id': 'time_to_leave',
			'keywords': ['notification', 'time', 'to', 'leave'],
			'name': 'time to leave'
		}, {
			'codepoint': 'E62D',
			'id': 'vibration',
			'keywords': ['notification', 'vibration'],
			'name': 'vibration'
		}, {
			'codepoint': 'E62E',
			'id': 'voice_chat',
			'keywords': ['notification', 'voice', 'chat'],
			'name': 'voice chat'
		}, {
			'codepoint': 'E62F',
			'id': 'vpn_lock',
			'keywords': ['notification', 'vpn', 'lock'],
			'name': 'vpn lock'
		}, {'codepoint': 'E63D', 'id': 'wc', 'keywords': ['notification', 'wc'], 'name': 'wc'}, {
			'codepoint': 'E63E',
			'id': 'wifi',
			'keywords': ['notification', 'wifi'],
			'name': 'wifi'
		}]
	}, {
		'id': 'social',
		'name': 'Social',
		'icons': [{
			'codepoint': 'E7E9',
			'id': 'cake',
			'keywords': ['social', 'cake'],
			'name': 'cake'
		}, {
			'codepoint': 'E7EE',
			'id': 'domain',
			'keywords': ['social', 'domain'],
			'name': 'domain'
		}, {'codepoint': 'E7EF', 'id': 'group', 'keywords': ['social', 'group'], 'name': 'group'}, {
			'codepoint': 'E7F0',
			'id': 'group_add',
			'keywords': ['social', 'group', 'add'],
			'name': 'group add'
		}, {
			'codepoint': 'E7F1',
			'id': 'location_city',
			'keywords': ['social', 'location', 'city'],
			'name': 'location city'
		}, {'codepoint': 'E7F2', 'id': 'mood', 'keywords': ['social', 'mood'], 'name': 'mood'}, {
			'codepoint': 'E7F3',
			'id': 'mood_bad',
			'keywords': ['social', 'mood', 'bad'],
			'name': 'mood bad'
		}, {
			'codepoint': 'E7F4',
			'id': 'notifications',
			'keywords': ['social', 'notifications'],
			'name': 'notifications'
		}, {
			'codepoint': 'E7F7',
			'id': 'notifications_active',
			'keywords': ['social', 'notifications', 'active'],
			'name': 'notifications active'
		}, {
			'codepoint': 'E7F5',
			'id': 'notifications_none',
			'keywords': ['social', 'notifications', 'none'],
			'name': 'notifications none'
		}, {
			'codepoint': 'E7F6',
			'id': 'notifications_off',
			'keywords': ['social', 'notifications', 'off'],
			'name': 'notifications off'
		}, {
			'codepoint': 'E7F8',
			'id': 'notifications_paused',
			'keywords': ['social', 'notifications', 'paused'],
			'name': 'notifications paused'
		}, {'codepoint': 'E7F9', 'id': 'pages', 'keywords': ['social', 'pages'], 'name': 'pages'}, {
			'codepoint': 'E7FA',
			'id': 'party_mode',
			'keywords': ['social', 'party', 'mode'],
			'name': 'party mode'
		}, {
			'codepoint': 'E7FB',
			'id': 'people',
			'keywords': ['social', 'people'],
			'name': 'people'
		}, {
			'codepoint': 'E7FC',
			'id': 'people_outline',
			'keywords': ['social', 'people', 'outline'],
			'name': 'people outline'
		}, {
			'codepoint': 'E7FD',
			'id': 'person',
			'keywords': ['social', 'person'],
			'name': 'person'
		}, {
			'codepoint': 'E7FE',
			'id': 'person_add',
			'keywords': ['social', 'person', 'add'],
			'name': 'person add'
		}, {
			'codepoint': 'E7FF',
			'id': 'person_outline',
			'keywords': ['social', 'person', 'outline'],
			'name': 'person outline'
		}, {
			'codepoint': 'E800',
			'id': 'plus_one',
			'keywords': ['social', 'plus', 'one'],
			'name': 'plus one'
		}, {'codepoint': 'E801', 'id': 'poll', 'keywords': ['social', 'poll'], 'name': 'poll'}, {
			'codepoint': 'E80B',
			'id': 'public',
			'keywords': ['social', 'public'],
			'name': 'public'
		}, {
			'codepoint': 'E80C',
			'id': 'school',
			'keywords': ['social', 'school'],
			'name': 'school'
		}, {'codepoint': 'E80D', 'id': 'share', 'keywords': ['social', 'share'], 'name': 'share'}, {
			'codepoint': 'E80E',
			'id': 'whatshot',
			'keywords': ['social', 'whatshot'],
			'name': 'whatshot'
		}]
	}, {
		'id': 'toggle',
		'name': 'Toggle',
		'icons': [{
			'codepoint': 'E834',
			'id': 'check_box',
			'keywords': ['toggle', 'check', 'box'],
			'name': 'check box'
		}, {
			'codepoint': 'E835',
			'id': 'check_box_outline_blank',
			'keywords': ['toggle', 'check', 'box', 'outline', 'blank'],
			'name': 'check box outline blank'
		}, {
			'codepoint': 'E909',
			'id': 'indeterminate_check_box',
			'keywords': ['toggle', 'indeterminate', 'check', 'box'],
			'name': 'indeterminate check box'
		}, {
			'codepoint': 'E837',
			'id': 'radio_button_checked',
			'keywords': ['toggle', 'radio', 'button', 'checked'],
			'name': 'radio button checked'
		}, {
			'codepoint': 'E836',
			'id': 'radio_button_unchecked',
			'keywords': ['toggle', 'radio', 'button', 'unchecked'],
			'name': 'radio button unchecked'
		}, {'codepoint': 'E838', 'id': 'star', 'keywords': ['toggle', 'star'], 'name': 'star'}, {
			'codepoint': 'E83A',
			'id': 'star_border',
			'keywords': ['toggle', 'star', 'border'],
			'name': 'star border'
		}, {'codepoint': 'E839', 'id': 'star_half', 'keywords': ['toggle', 'star', 'half'], 'name': 'star half'}]
	}];
})(window);

angular.module("mx.components").run(["$templateCache", function($templateCache) {$templateCache.put("mx-accordion/mx-accordion-group.html","<li class=\"mx-accordion-group\"><h2>{{::vm.label}}</h2><hr></li>");
$templateCache.put("mx-accordion/mx-accordion-item.html","<li class=\"mx-accordion-item\" ng-class=\"{\'mx-accordion-item-expanded\': vm.expanded}\"><md-button class=\"md-primary\" ng-click=\"vm.toggle()\">{{::vm.label}}<md-icon class=\"feedback__icon\" md-svg-src=\"mxComponents:chevron-down\"></md-icon></md-button><ng-transclude ng-show=\"vm.expanded\" class=\"mx-accordion-item__content\"></ng-transclude></li>");
$templateCache.put("mx-attachments/mx-attachment.html","<md-button ng-click=\"vm.downloadFile()\" class=\"md-fab md-mini mx-attachments--download\" aria-label=\"download\" ng-if=\"vm.showDownload()\"><md-tooltip>{{vm.downloadLabel}}</md-tooltip><md-icon>get_app</md-icon></md-button><md-button ng-click=\"vm.deleteFile(vm.file)\" class=\"md-fab md-mini mx-attachments--close\" aria-label=\"delete\" ng-if=\"vm.showDelete()\"><md-tooltip>{{vm.deleteLabel}}</md-tooltip><md-icon>clear</md-icon></md-button><span class=\"mx-attachment__file-loading\" ng-if=\"vm.showLoading()\"><md-progress-circular md-mode=\"indeterminate\"></md-progress-circular></span><div ng-show=\"!vm.showLoading()\"><div ng-if=\"vm.isImage()\"><md-icon md-svg-src=\"mxComponents:file-image\" class=\"mx-attachments--ico\" ng-if=\"vm.file.thumbnail === undefined\"></md-icon><img src=\"{{vm.file.thumbnail}}\" class=\"mx-attachment__image\" ng-attr-alt=\"{{vm.file.name}}\" ng-if=\"vm.file.thumbnail !== undefined\"></div><div ng-if=\"vm.isPdf()\"><md-icon md-svg-src=\"mxComponents:file-pdf-box\" class=\"mx-attachments--ico\"></md-icon></div><video controls=\"\" class=\"mx-attachment__video\" ng-if=\"vm.isVideo()\"><source ng-src=\"{{::vm.getUrl()}}\" type=\"video/mp4\"><source ng-src=\"{{::vm.getUrl()}}\" type=\"video/ogg\"><source ng-src=\"{{::vm.getUrl()}}\" type=\"video/WebM\"><span class=\"mx-attachment__video-warning\">{{ \'components.mx-attachments.videoWarning\' | mxi18n }}</span></video><div ng-if=\"vm.isText()\"><md-icon md-svg-src=\"mxComponents:file\" class=\"mx-attachments--ico\"></md-icon></div></div><span class=\"mx-attachment__file-description\" ng-show=\"::!vm.isNewBox()\"><md-checkbox ng-model=\"vm.file.selected\" aria-label=\"select\" class=\"mx-attachment__file--select\" ng-if=\"vm.enableSelection\"></md-checkbox><span class=\"mx-attachment__file-name\" ng-class=\"{\'mx-attachment__file-name--select\': vm.enableSelection}\">{{::vm.file.name}}</span><div layout=\"row\" layout-align=\"space-between center\"><span class=\"mx-attachment__file-size\">{{::((vm.size || \'123 K\')) }}</span> <span class=\"mx-attachment__file-date\">{{::vm.file.uploaded ? (vm.file.uploaded | date : format : \'medium\') : \'New\'}}</span></div></span> <span class=\"mx-attachment__drop-area\" ng-show=\"::vm.isNewBox()\" layout=\"row\" layout-align=\"center center\"><span>{{\'components.mx-attachments.drop_here\' | mxi18n}}</span></span>");
$templateCache.put("mx-attachments/mx-attachments.html","<div class=\"swiper-container mx-attachments-list md-whiteframe-2dp\"><div class=\"mx-attachments-list__search\" layout=\"row\" ng-show=\"!vm.isInitMode\"><div><md-input-container class=\"\"><label><md-icon>search</md-icon>{{\'components.mx-attachments.filter\' | mxi18n}}</label> <input type=\"text\" autocomplete=\"off\" ng-model=\"vm.searchText\" flex=\"\" aria-label=\"search\"></md-input-container></div><div class=\"mx-attachments-list__search--label\">Sort by:</div><div><md-select ng-model=\"vm.sortBy\" placeholder=\"Sort by\"><md-option ng-value=\"opt.field\" ng-repeat=\"opt in vm.sortFields\">{{ opt.name }}</md-option></md-select></div></div><div ng-if=\"!vm.isInitMode\"><mx-attachment ng-repeat=\"file in vm.files | filter: vm.searchText | orderBy: vm.sortBy\" data-file=\"file\" class=\"swiper-slide\" ng-attr-title=\"{{file.name}}\"></mx-attachment><mx-attachment data-file=\"{type:\'new\',status:6}\" class=\"swiper-slide\" ng-attr-title=\"New file/-s\" ngf-select=\"\" ngf-change=\"vm.filesSelected($files, $event)\" ngf-multiple=\"true\" ng-if=\"!vm.readOnly\"></mx-attachment></div><div ng-if=\"vm.isInitMode\" style=\"text-align: center; width: 100%\"><a ng-click=\"vm.onClick(event)\">{{\'components.mx-attachments.drop_attachments\' | mxi18n}}</a></div></div>");
$templateCache.put("mx-bottom-sheet/mx-bottom-sheet-grid-template.html","<md-bottom-sheet class=\"md-grid md-whiteframe-z5\" layout=\"column\" ng-cloak=\"\" ng-style=\"{\'top\': vm.topOffset}\"><div class=\"mx-bottom-shell-grid-arrow\"></div><div><md-list flex=\"\" layout=\"row\" layout-align=\"center center\"><md-list-item ng-repeat=\"item in items\"><md-button class=\"md-grid-item-content\" md-autofocus=\"vm.focus(item)\" ng-click=\"vm.execute(item)\" ng-class=\"item.isFocused ? \'active\' : \'inactive\'\" ng-disabled=\"item.isFocused\"><md-icon md-svg-src=\"{{::item.icon}}\"></md-icon><div class=\"mx-bottom-sheet-grid-label\">{{::item.name}}</div></md-button></md-list-item></md-list></div></md-bottom-sheet>");
$templateCache.put("mx-bottom-sheet/mx-bottom-sheet-list-template.html","<md-bottom-sheet class=\"md-list md-has-header md-whiteframe-z5\" ng-cloak=\"\" ng-style=\"{\'top\': vm.topOffset}\"><md-list><md-list-item ng-repeat=\"item in items\"><md-button class=\"md-list-item-content\" md-autofocus=\"vm.focus(item)\" ng-class=\"item.isFocused ? \'active\' : \'inactive\'\" ng-disabled=\"item.isFocused\" ng-click=\"vm.execute(item)\"><md-icon>done</md-icon><span class=\"md-inline-list-icon-label\">{{::item.name}}</span></md-button></md-list-item></md-list></md-bottom-sheet>");
$templateCache.put("mx-bottom-sheet/mx-bottom-sheet.html","<div class=\"md-btn bottom-sheet-btn\" ng-attr-tooltip=\"{{::vm.internationalization.iconAlt}}\" tooltip-append-to-body=\"true\" tooltip-placement=\"bottom\" tooltip-html=\"true\" ng-click=\"vm.toggleDialog(vm.options); $event.stopPropagation();\"><span><md-icon ng-if=\"vm.options.icon\">{{vm.options.icon || \'apps\'}}</md-icon></span></div>");
$templateCache.put("mx-button/mx-button.html","<md-button ng-attr-md-autofocus=\"{{vm.focused || false}}\" ng-disabled=\"vm.isDisabled\" aria-label=\"vm.label\" ng-class=\"[vm.styles ? vm.styles : \'md-raised md-accent md-hue-2\']\" ng-click=\"vm.click()\"><md-icon ng-if=\"vm.icon\">{{vm.icon}}</md-icon>{{vm.label}}</md-button>");
$templateCache.put("mx-calendar/mx-calendar.html","<div oc-lazy-load=\"ui.calendar\"><div ui-calendar=\"vm.options\" ng-model=\"vm._items\"></div></div>");
$templateCache.put("mx-checkbox/mx-checkbox.html","<md-input-container><md-checkbox name=\"{{::vm.internalName}}\" ng-model=\"vm.model\" ng-disabled=\"vm._disabled || vm._readOnly\" ng-true-value=\"true\" ng-false-value=\"false\" aria-label=\"vm.label\"><span ng-bind-html=\"vm.label\"></span></md-checkbox></md-input-container>");
$templateCache.put("mx-choice/mx-choice.html","<div class=\"mx-choice flex\"><md-radio-group ng-model=\"__$vm.selectedPanelName\" ng-if=\"__$vm.showSwitchButtons\"><div class=\"flex\" ng-repeat=\"__$panel in __$vm.panels | orderBy: \'position\'\"><md-radio-button value=\"{{__$panel.name}}\" class=\"mx-choice__choice-button\"><span class=\"mx-choice__panel-title\">{{__$panel.title}}</span></md-radio-button><div class=\"mx-choice__panel-description\">{{__$panel.description}}</div></div></md-radio-group><div class=\"mx-choice__panel flex\" ng-repeat=\"__$panel in __$vm.panels track by __$panel.id\" ng-if=\"__$panel.name === (__$vm.selectedPanelName || __$vm.panels[0].name)\" ng-include=\"\" src=\"__$panel.id\" data-onload=\"__$vm.initScope()\"></div></div>");
$templateCache.put("mx-currency/mx-currency.html","<md-input-container class=\"mx-currency\"><span class=\"mx-currency--code\">{{vm.currencyCode}}</span><mx-text-box class=\"mx-currency--value\" data-label=\"{{vm.label}}\" data-read-only=\"vm._readOnly\" data-disabled=\"vm._disabled\" ng-model=\"vm.model\" ng-pattern=\"vm.validationPattern\"></mx-text-box></md-input-container>");
$templateCache.put("mx-datasource-paging-panel/mx-datasource-paging-panel.html","<div class=\"mx-workspace-common-paging-panel--container\" layout=\"row\" layout-align=\"center center\"><div class=\"mx-workspace-common-paging-panel--pagenumber\">{{\'components.mx-datasource-paging-panel.pageSize\' | mxi18n}}:</div><div><md-select aria-label=\"Rows count selector\" class=\"ui-grid-pager-row-count-selector\" md-container-class=\"ui-grid-pager-row-count-dropdown\" ng-disabled=\"vm.isDisabled\" ng-model=\"vm.pageSize\"><md-option ng-repeat=\"size in vm.pageSizes\" ng-value=\"size\">{{ size }}</md-option></md-select></div><p class=\"mx-workspace-common-paging-panel--pages\" ng-bind=\"vm.pagingLabel\"></p><md-button class=\"mx-workspace-common-paging-panel--prev\" ng-disabled=\"vm.isNotPrevPage\" aria-label=\"Prev\" ng-click=\"vm.prev()\"><md-icon>chevron_left</md-icon></md-button><div class=\"mx-workspace-common-paging-panel--pagenumber\">{{vm.preprocessor.page + 1}}</div><md-button class=\"mx-workspace-common-paging-panel--next\" ng-disabled=\"vm.isNotNextPage\" aria-label=\"Prev\" ng-click=\"vm.next()\"><md-icon>chevron_right</md-icon></md-button></div>");
$templateCache.put("mx-date-picker/mx-date-picker.html","<div><md-input-container class=\"md-input-has-value\" ng-class=\"{\'md-input-focused\': vm.isFocused}\" ng-show=\"vm.model || vm.isFocused\"><label><span ng-bind-html=\"vm.label\"></span></label></md-input-container></div><md-datepicker name=\"{{::vm.internalName}}\" ng-model=\"vm.value\" ng-disabled=\"vm._disabled || vm._readOnly\" md-max-date=\"vm.maxDate\" md-min-date=\"vm.minDate\" ng-required=\"vm.ngRequired\" md-placeholder=\"{{::vm.label}}\"></md-datepicker><mx-control-errors></mx-control-errors>");
$templateCache.put("mx-date-picker/mx-date-time-control.html","<time-date-picker ng-model=\"vm.model\" on-cancel=\"vm.onCancel()\" on-save=\"vm.onSave()\" display-twentyfour=\"true\" mindate=\"{{vm.minDate}}\" maxdate=\"{{vm.maxDate}}\" orientation=\"{{:: vm.displayMode !== \'full\'}}\" display-mode=\"{{:: vm.displayMode}}\"></time-date-picker>");
$templateCache.put("mx-date-picker/mx-date-time-picker.html","<div type=\"button\" class=\"md-datetimepicker-input-container\" ng-click=\"vm.openCalendarPane($event)\" flex=\"\" layout=\"row\" ng-disabled=\"vm._disabled\" aria-label=\"{{::vm.dateLocale.msgOpenCalendar}}\" ng-class=\"{\'mx-datetimepicker-disabled\': vm._disabled }\"><md-input-container flex=\"\"><label>{{:: vm.label}}</label><md-icon md-svg-icon=\"md-calendar\"></md-icon><input ng-model=\"vm._formatedValue\" readonly=\"true\" ng-disabled=\"vm._disabled\" ng-required=\"vm.ngRequired\"></md-input-container><mx-control-errors track-internal=\"{{::vm.trackInternal}}\"></mx-control-errors><div class=\"md-datepicker-expand-triangle-wrap\"><div class=\"md-datepicker-expand-triangle\"></div></div></div><div class=\"md-datepicker-calendar-pane md-whiteframe-z1\"><div class=\"md-datepicker-calendar\"><mx-date-time-control ng-model=\"vm.value\" min-date=\"{{vm.minDate}}\" max-date=\"{{vm.maxDate}}\" md-date-filter=\"vm.dateFilter\" on-cancel=\"vm.onCancel()\" on-save=\"vm.onSave()\" display-mode=\"{{vm.displayMode}}\"></mx-date-time-control></div></div>");
$templateCache.put("mx-dropdown/mx-dropdown.html","<md-button ng-if=\"vm.hideButton !== \'true\'\" class=\"md-icon-button mx-dropdown-action-list-open-button\" ng-click=\"vm.handleBtnClick($event)\"><md-icon>{{::vm.icon}}</md-icon></md-button><md-whiteframe ng-if=\"vm.expanded\" class=\"md-whiteframe-z3 mx-dropdown-list-wrap\" ng-class=\"{\'mx-dropdown-expanded\': vm.expanded}\"><md-list class=\"mx-dropdown-list\"><md-list-item class=\"mx-dropdown-item {{::item.htmlClass}}\" ng-repeat=\"item in vm.items\" ng-click=\"vm.handleClick($event, item)\"><md-icon ng-if=\"item.icon\" class=\"mx-dropdown-item-icon\">{{::item.icon}}</md-icon><p class=\"mx-dropdown-item-label\">{{::item.label}}</p></md-list-item></md-list></md-whiteframe>");
$templateCache.put("mx-feedback/mx-feedback-tag.html","<svg version=\"1.1\" id=\"feedbackIcon\" class=\"feedbackIcon\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"30px\" height=\"30px\" viewbox=\"0 0 30 30\" enable-background=\"new 0 0 30 30\" xml:space=\"preserve\"><g><path class=\"svg-m42-orange\" d=\"M26,13.9c0.2-0.2,0.5-0.2,0.7,0l0.3,0.3V0.5C27,0.2,26.8,0,26.5,0h-26C0.2,0,0,0.2,0,0.5v18 C0,18.8,0.2,19,0.5,19H5v4c0,0.2,0.1,0.4,0.3,0.4c0.1,0,0.1,0.1,0.2,0.1c0.1,0,0.2,0,0.3-0.1l5.9-4.4h9.2L26,13.9z\"></path><path class=\"svg-m42-orange\" d=\"M29.9,18.4L27,15.6v0l-0.7-0.7l-2.5,2.5l3.9,3.9l2.2-2.2c0.1-0.1,0.1-0.2,0.1-0.4S29.9,18.5,29.9,18.4z\"></path><path class=\"svg-m42-orange\" d=\"M15.1,29.4c-0.1,0.2,0,0.4,0.1,0.5c0.1,0.1,0.2,0.1,0.4,0.1c0,0,0.1,0,0.1,0l4.1-1.2l-3.6-3.6L15.1,29.4z\"></path><polygon class=\"svg-m42-orange\" points=\"22.3,19 22.3,19 16.9,24.4 20.7,28.2 27,22 23.1,18.2\"></polygon></g><rect x=\"6\" y=\"8\" class=\"svg-m42-petrol\" width=\"3\" height=\"3\"></rect><rect x=\"12\" y=\"8\" class=\"svg-m42-petrol\" width=\"3\" height=\"3\"></rect><rect x=\"18\" y=\"8\" class=\"svg-m42-petrol\" width=\"3\" height=\"3\"></rect></svg>");
$templateCache.put("mx-feedback/mx-feedback.html","<div class=\"panel-btn feedback-btn\" ng-attr-tooltip=\"{{::vm.internationalization.iconAlt}}\" tooltip-append-to-body=\"true\" tooltip-placement=\"bottom\" tooltip-html=\"true\" ng-click=\"vm.toggleDialog(); $event.stopPropagation();\"><span class=\"feedback-menu__title\"><md-icon class=\"feedback__icon\" md-svg-src=\"mx-feedback/mx-feedback-tag.html\"></md-icon></span></div><md-whiteframe ng-if=\"vm.dialogActive\" class=\"feedback__dialog md-whiteframe-z5\" layout=\"\" layout-align=\"center center\" data-html2canvas-ignore=\"\" ng-style=\"{\'top\': vm.topOffset}\"><div class=\"dialog__tag-back\"></div><div class=\"dialog__tag-front\"></div><div class=\"dialog__content\"><div class=\"dialog-header\"><h2>{{::vm.internationalization.dialogTitle}}</h2><div class=\"description\">{{::vm.internationalization.titleDescription}} <a target=\"_blank\" ng-href=\"{{::vm.internationalization.policyLink}}\">{{::vm.internationalization.policy}}</a> {{::vm.internationalization.titleDescription2}}</div><small class=\"dialog-header__hint\">{{::vm.internationalization.hintNoTicketCreated}}</small></div><div class=\"dialog-container\"><label class=\"rating-title\">{{::vm.internationalization.rating}}</label><md-slider id=\"feedback-rating-slider\" flex=\"\" class=\"feedback__md-rating\" md-discrete=\"\" ng-model=\"vm.feedback.Rating\" step=\"1\" min=\"1\" max=\"5\" aria-label=\"rating\"></md-slider><div class=\"feedback__md-rating__left\">{{::vm.internationalization.awful }}</div><div class=\"feedback__md-rating__right\">{{::vm.internationalization.excellent }}</div><md-input-container flex=\"\" md-is-error=\"vm.errors.feedbackError\" class=\"feedback__description\"><label class=\"feedback__description--placeholder\">{{::vm.internationalization.comment }}</label> <textarea ng-model=\"vm.feedback.Description\" rows=\"5\"></textarea><div ng-messages=\"vm.errors\"><div ng-message=\"feedbackError\">{{vm.validationError}}</div></div></md-input-container><div class=\"feedback__attachment hide-xs hide-sm\"><div class=\"feedback__attachment-switcher\"><md-checkbox ng-model=\"vm.feedback.AttachScreen\" class=\"material-checkbox\" aria-label=\"{{::vm.internationalization.screen }}\">{{ ::vm.internationalization.screen }}</md-checkbox></div><div class=\"feedback__attachment-preview\" ng-show=\"vm.showPreview\"><img mx-image-preview=\"\"></div></div><div class=\"dialog__footer\" layout=\"row\" layout-align=\"end center\"><md-button class=\"md-raised md-primary mx-close-button\" ng-click=\"vm.toggleDialog()\">{{::vm.internationalization.close }}</md-button><md-button class=\"md-raised md-primary\" ng-click=\"vm.sendFeedback(vm.feedback)\" ng-disabled=\"vm.sendFeedbackSendBtnDisabled\">{{::vm.internationalization.button}}</md-button></div></div></div></md-whiteframe>");
$templateCache.put("mx-file-uploader/mx-file-uploader.html","<div class=\"file-selector__container\"><ul><li ng-repeat=\"file in vm.files\"><p>&nbsp;{{file.name}}</p><p class=\"file-selector__remove-btn\" ng-click=\"vm.removeFile(file)\">X</p></li></ul><md-button class=\"md-fab md-mini\" aria-label=\"Attach a file\" ngf-select=\"\" ngf-change=\"vm.filesSelected($files, $event)\" ngf-multiple=\"true\"><md-tooltip>{{\'components.mx-file-uploader.attachFileHint\' | mxi18n}}</md-tooltip><md-icon md-svg-src=\"mxComponents:attachment\"></md-icon></md-button></div>");
$templateCache.put("mx-form/mx-form.html","<ng-form name=\"{{::vm.name}}\" ng-transclude=\"\"></ng-form>");
$templateCache.put("mx-form-errors/mx-form-errors.html","<div layout=\"row\" ng-class=\"{\'noerrors\': !vm.errorMessage}\" class=\"mx-form-errors\"><div layout=\"column\"><i class=\"material-icons\" style=\"color: white;\">{{vm.errorMessage.type}}</i></div><div layout=\"row\" flex=\"\" class=\"errorMessage\" ng-bind-html=\"vm.errorMessage.message\"></div><div layout=\"column\"><div><i class=\"material-icons iconButton\" ng-show=\"vm.prevExists\" ng-click=\"vm.prevError()\" title=\"Previous\">keyboard_arrow_left</i> <i class=\"material-icons iconButton\" ng-show=\"vm.nextExists\" ng-click=\"vm.nextError()\" title=\"Next\">keyboard_arrow_right</i></div></div></div>");
$templateCache.put("mx-grid/mx-grid-edit-form-field.html","<mx-text-box ng-if=\"vm.isString()\" data-value=\"vm.entity[vm.field.name]\" aria-label=\"{{vm.field.title}}\" data-label=\"{{vm.field.title}}\"></mx-text-box><md-checkbox ng-if=\"vm.isBool()\" ng-model=\"vm.entity[vm.field.name]\" aria-disabled=\"true\"><label>{{vm.field.title}}</label></md-checkbox><mx-picker ng-if=\"vm.isReference()\" item-title-field=\"\'DisplayValue\'\" item-id-field=\"\'Value\'\" items-provider=\"EntityGetDialogTransform\" value=\"vm.entity[vm.field.name]\" items-provider-parameters=\'{entity:\"SPSContentPickupGridAlign\"}\' label=\"{{vm.field.title}}\" view=\"select\"></mx-picker>");
$templateCache.put("mx-grid/mx-grid-edit-form.html","<div flex=\"100\" class=\"mx-grid-edit-form\"><div class=\"md-whiteframe-7dp mx-grid-edit-form-inner\"><div layout=\"row\" ng-repeat=\"row in vm.formFields\" ng-if=\"vm.formFields\"><div flex=\"{{100/(row.fields.length)}}\" ng-repeat=\"field in row.fields\"><mx-grid-edit-form-field field=\"field\" entity=\"vm.localScope.entity\"></mx-grid-edit-form-field></div></div><div class=\"mx-grid-edit-form-inner---content\" ng-show=\"!vm.formFields\"></div><div layout=\"row\"><div flex=\"\"></div><mx-button aria-label=\"cancel\" ng-click=\"vm.cancel()\" data-label=\"Cancel\"></mx-button><mx-button aria-label=\"save\" ng-click=\"vm.save()\" data-label=\"Save\"></mx-button></div></div></div>");
$templateCache.put("mx-grid/mx-grid-gridmenu-item.html","<button type=\"button\" class=\"ui-grid-menu-item\" ng-click=\"itemAction($event,title)\" ng-show=\"itemShown()\" ng-class=\"{ \'ui-grid-menu-item-active\': active(), \'ui-grid-sr-only\': (!focus && screenReaderOnly) }\" aria-pressed=\"{{active()}}\" tabindex=\"\" ng-focus=\"focus=true\" ng-blur=\"focus=false\"><md-checkbox class=\"mx-grid-gridmenu-checkbox\" ng-show=\"(context.gridCol !== undefined)\" ng-checked=\"(icon === \'ui-grid-icon-ok\' )\" aria-label=\"Check\"></md-checkbox>{{ name }}</button>");
$templateCache.put("mx-grid/mx-grid-gridmenu.html","<div class=\"ui-grid-menu\" ng-if=\"shown\"><style ui-grid-style=\"\">\r\n		{{dynamicStyles}}\r\n	</style><div class=\"ui-grid-menu-mid\" ng-show=\"shownMid\"><div class=\"ui-grid-menu-inner\"><button type=\"button\" ng-focus=\"focus=true\" ng-blur=\"focus=false\" class=\"ui-grid-menu-close-button\" ng-class=\"{\'ui-grid-sr-only\': (!focus)}\"><i class=\"ui-grid-icon-cancel\" ui-grid-one-bind-aria-label=\"i18n.close\"></i></button><ul role=\"menu\" class=\"ui-grid-menu-items\"><li ng-repeat=\"item in menuItems\" role=\"menuitem\" ui-grid-menu-item=\"\" ui-grid-one-bind-id=\"\'menuitem-\'+$index\" action=\"item.action\" name=\"item.title\" active=\"item.active\" icon=\"item.icon\" shown=\"item.shown\" context=\"item.context\" template-url=\"item.templateUrl\" leave-open=\"item.leaveOpen\" screen-reader-only=\"item.screenReaderOnly\"></li></ul></div></div></div>");
$templateCache.put("mx-grid/mx-grid-menu-button.html","<div class=\"ui-grid-menu-button\" style=\"width: 100%\"><div role=\"button\" class=\"ui-grid-icon-container mx-grid-header-title\" ng-show=\"grid.appScope.title\" aria-haspopup=\"false\">{{grid.appScope.title}}</div><div role=\"button\" class=\"ui-grid-icon-container mx-grid-actions-item-active\" ng-show=\"grid.appScope.showAddButton && !grid.appScope.title\" ng-click=\"grid.appScope.addRow(grid)\" aria-haspopup=\"false\">{{\'components.grid.add\' | mxi18n}}</div><div role=\"button\" ng-class=\"[grid.appScope.selectedItemsCount > 0 ? \'ui-grid-icon-container mx-grid-actions-item-active\': \'ui-grid-icon-container mx-grid-actions-item-disabled\']\" ng-show=\"grid.appScope.showRemoveButton && !grid.appScope.title\" ng-click=\"grid.appScope.removeRow(grid)\" aria-haspopup=\"false\">{{\'components.grid.remove\' | mxi18n}}</div><div role=\"button\" ui-grid-one-bind-id-grid=\"\'grid-menu\'\" class=\"ui-grid-icon-container mx-grid-top-right-icons\" ng-click=\"toggleMenu()\" aria-haspopup=\"true\"><i class=\"ui-grid-icon-menu\" ui-grid-one-bind-aria-label=\"i18n.aria.buttonLabel\"></i></div><div role=\"button\" class=\"ui-grid-icon-container mx-grid-top-right-icons\" ng-show=\"grid.appScope.showRemoveButton && grid.appScope.title\" ng-click=\"grid.appScope.removeRow(grid)\" aria-haspopup=\"false\"><md-icon aria-label=\"Remove\" ng-class=\"[grid.appScope.selectedItemsCount > 0 ? \'mx-grid-actions-icon-active\': \'mx-grid-actions-icon-disabled\']\">delete</md-icon></div><div role=\"button\" class=\"ui-grid-icon-container mx-grid-top-right-icons\" ng-show=\"grid.appScope.showAddButton && grid.appScope.title\" ng-click=\"grid.appScope.addRow(grid)\" aria-haspopup=\"false\"><md-icon aria-label=\"{{\'components.grid.add\' | mxi18n}}\">add</md-icon></div><div ui-grid-menu=\"\" menu-items=\"menuItems\"></div></div>");
$templateCache.put("mx-grid/mx-grid-pager.html","<div role=\"contentinfo\" class=\"ui-grid-pager-panel\" ui-grid-pager=\"\" ng-show=\"grid.options.enablePaginationControls\" layout=\"column\"><mx-workspace-common-paging-panel class=\"ui-grid-pager\" preprocessor=\"grid.appScope.pagerDescriptor\"></mx-workspace-common-paging-panel></div>");
$templateCache.put("mx-grid/mx-grid-viewport.html","<div role=\"rowgroup\" class=\"ui-grid-viewport\" ng-style=\"colContainer.getViewportStyle()\"><div class=\"ui-grid-canvas\"><div data-element-index=\"{{$index}}\" ng-mouseenter=\"grid.appScope.uiGirdSelectionHoverOnMouseEnter($event)\" ng-mouseleave=\"grid.appScope.uiGirdSelectionHoverOnMouseLeave($event)\" ng-click=\"grid.appScope.uiGridHandleItemClick(row)\" ng-class=\"{\'grid-row_active\' : row.__highlighted}\" ng-repeat=\"(rowRenderIndex, row) in rowContainer.renderedRows track by $index\" class=\"ui-grid-row\" ng-style=\"Viewport.rowStyle(rowRenderIndex)\"><div role=\"row\" ui-grid-row=\"row\" row-render-index=\"rowRenderIndex\"></div></div></div></div>");
$templateCache.put("mx-grid/mx-grid.html","<div><div ng-if=\"grid.options.enableGridMenu\" role=\"rowgroup\" class=\"mx-grid-header-actions\"><div ui-grid-menu-button=\"\" ng-if=\"grid.options.enableGridMenu\"></div></div><div ui-i18n=\"en\" class=\"ui-grid\" ng-attr-highlightonclick=\"{{grid.appScope.highlightOnClick ? \'true\' : \'false\'}}\"><style ui-grid-style=\"\">\r\n		.grid{{ grid.id }} {\r\n		/* Styles for the grid */\r\n		}\r\n\r\n		.grid{{ grid.id }} .ui-grid-row, .grid{{ grid.id }} .ui-grid-cell, .grid{{ grid.id }} .ui-grid-cell .ui-grid-vertical-bar {\r\n		height: {{ grid.options.rowHeight }}px;\r\n		}\r\n\r\n		.grid{{ grid.id }} .ui-grid-row:last-child .ui-grid-cell {\r\n		border-bottom-width: {{ ((grid.getTotalRowHeight() < grid.getViewportHeight()) && \'1\') || \'0\' }}px;\r\n		}\r\n\r\n		{{ grid.verticalScrollbarStyles }}\r\n\r\n		{{ grid.horizontalScrollbarStyles }}\r\n\r\n/*\r\n        .ui-grid[dir=rtl] .ui-grid-viewport {\r\n          padding-left: {{ grid.verticalScrollbarWidth }}px;\r\n        }\r\n\r\n*/\r\n		{{ grid.customStyles }}\r\n	</style><div class=\"ui-grid-contents-wrapper\"><div ng-if=\"grid.hasLeftContainer()\" style=\"width: 0\" ui-grid-pinned-container=\"\'left\'\"></div><div ui-grid-render-container=\"\" container-id=\"\'body\'\" col-container-name=\"\'body\'\" row-container-name=\"\'body\'\" bind-scroll-horizontal=\"true\" bind-scroll-vertical=\"true\" enable-horizontal-scrollbar=\"grid.options.enableHorizontalScrollbar\" enable-vertical-scrollbar=\"grid.options.enableVerticalScrollbar\"></div><div ng-if=\"grid.hasRightContainer()\" style=\"width: 0\" ui-grid-pinned-container=\"\'right\'\"></div><div ui-grid-grid-footer=\"\" ng-if=\"grid.options.showGridFooter\"></div><div ui-grid-column-menu=\"\" ng-if=\"grid.options.enableColumnMenus\"></div><div ng-transclude=\"\"></div></div></div></div>");
$templateCache.put("mx-icon-picker/mx-icon-picker.html","<div class=\"mx-icon-picker\" ng-class=\"{\'mx-icon-picker--empty\': !vm.model}\" ng-click=\"vm.innerClick($event)\"><md-input-container md-is-error=\"vm.controlNgModel.mxInvalid\"><label><span ng-bind-html=\"::vm.label\"></span></label> <span class=\"mx-icon-picker--icon-border\" ng-click=\"vm.activate($event)\"><md-icon ng-show=\"vm.icon\" class=\"mx-icon-picker--icon\">{{vm.icon}}</md-icon></span><md-icon ng-show=\"!vm._readOnly && !vm._disabled && vm.model\" class=\"mx-icon-picker--clear\" ng-click=\"vm.clear($event)\">clear</md-icon><input name=\"{{::vm.internalName}}\" ng-model=\"vm.text\" ng-disabled=\"vm._disabled\" class=\"mx-icon-picker--input\" ng-focus=\"vm.activate()\" ng-readonly=\"vm._readOnly\" ng-pattern=\"vm.pattern\"><mx-control-errors track-internal=\"{{::vm.trackInternal}}\"></mx-control-errors></md-input-container><div class=\"mx-icon-picker--library md-whiteframe-1dp\" ng-class=\"{\'mx-icon-picker--library__active\': vm.active}\"><div ng-show=\"!vm.itemsFound\" class=\"layout-column mx-icon-picker--library__empty-search\"><md-icon>block</md-icon><h4 flex=\"\">{{\'components.common.noData\' | mxi18n}}</h4></div><div ng-repeat=\"category in vm.library\" class=\"mx-icon-picker--library-category\" ng-show=\"category.visible\"><h3>{{::category.name}}</h3><div ng-repeat=\"item in category.icons track by item.icon.id\" title=\"{{::item.icon.name}}\" ng-click=\"vm.apply($event, item.icon)\" class=\"mx-icon-picker--library-icon\" ng-show=\"item.visible\"><md-icon>{{::item.icon.id}}</md-icon><span>{{::item.icon.name}}</span></div></div></div></div>");
$templateCache.put("mx-image-preview/mx-image-preview.html","<md-dialog aria-label=\"Image preview\" style=\"max-width: inherit;max-height: inherit;\"><md-content class=\"sticky-container\"><md-subheader class=\"md-sticky-no-effect\">{{\'components.mx-image-preview.title\' | mxi18n : \'Image preview\'}}</md-subheader><div class=\"dialog-content\"><img mx-lightbox-src=\"{{Lightbox.imageUrl}}\" alt=\"\"></div></md-content><div class=\"md-actions\" layout=\"row\"><md-button class=\"md-raised md-primary\" ng-click=\"Lightbox.cancel()\">{{\'components.mx-image-preview.close\' | mxi18n : \'Close\'}}</md-button></div></md-dialog>");
$templateCache.put("mx-journal/mx-journal.html","<div class=\"journal-container\"><div class=\"journal-container--items\"><div ng-repeat=\"item in vm.items\" class=\"journal-item\" layout=\"column\" ng-class=\"{ \'journal-item--my\':item.__my, \'journal-item--first\':item.__first }\"><div><div class=\"journal-item__user\"><div layout=\"row\"><div ng-init=\"userPhoto = item.photo\"><img ng-show=\"userPhoto\" ng-src=\"{{::userPhoto}}\" class=\"journal-item__photo\"> <span ng-show=\"!userPhoto\" class=\"journal-item__photo-letter journal-item__photo\">{{::item.userName | limitTo:1}}</span></div><div class=\"journal-item__user-name\" flex=\"\">{{::item.userName}}</div></div></div><div class=\"journal-item__date\">{{::item.__created | date:\'medium\'}}</div></div><div class=\"journal-item__content\"><p ng-bind-html=\"item.text\"></p></div></div><div class=\"journal-container--load-more\" ng-show=\"vm.canLoadMore && !vm.processingItems\"><md-button ng-click=\"vm.loadMoreItems()\">{{\'components.journal.load_more_items\' | mxi18n}}</md-button></div><div class=\"journal-container--load-more\" ng-show=\"vm.processingItems\">{{\'components.journal.loading\' | mxi18n}}</div></div><div class=\"journal-item--new journal-item\" ng-if=\"!vm.readOnly\"><div ng-init=\"myPhoto = vm.currentUserPhoto\" class=\"journal-item__photo-wrapper\"><img ng-show=\"myPhoto\" ng-src=\"{{::myPhoto}}\" class=\"journal-item__photo\"> <span ng-show=\"!myPhoto\" class=\"journal-item__photo-letter journal-item__photo\">Y</span></div><div ng-if=\"vm._showRichEditor\"><mx-rich-text-box class=\"journal-item--new-textarea\" ng-model=\"vm.newComment\" advanced-mode=\"false\" set-focus=\"true\" on-blur=\"vm._handleRichTextBoxBlur()\"></mx-rich-text-box><md-button class=\"journal-item--new__content-button\" ng-click=\"vm.addComment();\" title=\"{{\'components.journal.send_button_label\' | mxi18n}}\" ng-disabled=\"vm.adding || vm.newComment===\'\' && vm.attachments.length === 0\" aria-label=\"{{\'components.journal.send_button_label\' | mxi18n}}\">{{\'components.journal.send_button_label\' | mxi18n}}</md-button><md-button ng-show=\":: vm._useFileAttachments\" class=\"md-icon-button journal-item--new__attach-button\" ng-click=\"vm.attachFiles()\" aria-label=\"{{\'components.journal.attach_files_button_label\' | mxi18n}}\"><md-icon>attachment</md-icon></md-button></div><div ng-show=\"!vm._showRichEditor\" class=\"journal-item--new-textarea-placeholder\" ng-click=\"vm._showRichEditor = true;\"><md-button ng-show=\":: vm._useFileAttachments\" class=\"md-icon-button journal-item--new__preview-attach-button\" ng-click=\"vm.attachFiles()\" aria-label=\"{{\'components.journal.attach_files_button_label\' | mxi18n}}\"><md-icon>attachment</md-icon></md-button>{{\'components.journal.write_your_comment\' | mxi18n}}</div><ul class=\"journal-item--new-attachments-list\"><li ng-repeat=\"file in vm.attachments\"><md-icon>insert_drive_file</md-icon>{{::file.DisplayString}}</li></ul></div></div>");
$templateCache.put("mx-numeric-edit/mx-numeric-edit.html","<md-input-container md-is-error=\"vm.controlNgModel.mxInvalid\"><label>{{vm.label}}</label> <input name=\"{{::vm.name}}\" mx-mask=\"{{::vm.format}}\" ng-model=\"vm.model\" ng-disabled=\"vm._disabled\" ng-readonly=\"vm._readOnly\"><mx-control-errors></mx-control-errors></md-input-container>");
$templateCache.put("mx-picker/mx-autocomplete.html","<md-autocomplete md-items=\"item in vm.autoCompleteSearch()\" md-search-text=\"vm.autoCompleteSearchText\" md-selected-item=\"vm.selectedItem\" md-selected-item-change=\"vm.autoCompleteSelectedItemChange(item)\" md-search-text-change=\"vm.autoCompleteSearchTextChange()\" md-item-text=\"vm.getTitle(item)\" md-no-cache=\"true\" md-floating-label=\"{{vm.label}}\" ng-disabled=\"vm._disabled || vm._readOnly\" md-min-length=\"0\" md-menu-class=\"{{::vm.dropdownHtmlClass}}\"><md-item-template><span md-highlight-text=\"vm.autoCompleteSearchText\">{{$parent.vm.getTitle(item)}}</span></md-item-template><md-not-found><span>{{vm.notFoundMessage}}</span></md-not-found><mx-control-errors></mx-control-errors></md-autocomplete>");
$templateCache.put("mx-picker/mx-multi-picker.html","<div class=\"mx-multipicker--container\"><md-input-container ng-class=\"{\'md-input-focused\': vm._disabled || vm._readOnly}\"><label><span ng-bind-html=\"vm.controlLabel\"></span></label><md-chips ng-model=\"vm.selectedItems\" md-autocomplete-snap=\"\" md-require-match=\"true\" md-on-add=\"vm.onSelectionChange()\" md-on-remove=\"vm.onSelectionChange()\" readonly=\"(vm._disabled || vm._readOnly) && vm.selectedItems.length > 0\"><md-autocomplete ng-hide=\"vm.single && vm.selectedItems.length > 0\" md-is-error=\"vm.controlNgModel.mxInvalid\" md-items=\"item in vm.autoCompleteSearch()\" placeholder=\"{{vm.autoPlaceholder}}\" md-search-text=\"vm.autoCompleteSearchText\" md-selected-item=\"vm.selectedItem\" md-selected-item-change=\"vm.autoCompleteSelectedItemChange(item)\" md-search-text-change=\"vm.autoCompleteSearchTextChange()\" md-item-text=\"vm.getTitle(item)\" md-delay=\"vm.loadDelay\" md-no-cache=\"true\" ng-disabled=\"vm._disabled || vm._readOnly\" md-min-length=\"1\" input-name=\"{{::vm.internalName}}\" md-menu-class=\"mx-picker-item-template {{::vm.dropdownHtmlClass}}\"><md-item-template><span class=\"item-title\"><span md-highlight-text=\"vm.autoCompleteSearchText\">{{$parent.vm.getTitle(item)}}</span></span> <span class=\"item-details\" ng-if=\"vm.itemDetailsField\">{{item[vm.itemDetailsField]}}</span></md-item-template><md-not-found><span>{{vm.notFoundMessage}}<a ng-if=\"vm.availableNotFoundButton\" href=\"\" ng-click=\"vm.notFoundClick()\">{{vm.notFound.buttonText}}</a></span></md-not-found></md-autocomplete><md-chip-template><a ng-dblclick=\"vm.onNavigateItem($chip)\"><span ng-if=\"vm.itemDetailsField\" class=\"item-details\" ng-bind=\"$chip[vm.itemDetailsField]\"></span><span class=\"item-title\">{{$parent.vm.getTitle($chip)}}</span></a></md-chip-template></md-chips><md-icon ng-if=\"vm.browseLookup && !(vm._disabled || vm._readOnly)\" ng-click=\"vm.onBrowseLookup()\" class=\"mx-multipicker--icon\">search</md-icon><mx-control-errors></mx-control-errors></md-input-container></div>");
$templateCache.put("mx-picker/mx-select.html","<md-input-container><label>{{vm.label}}</label><md-select ng-model-options=\"{ trackBy: \'vm.getTrackingValue($value)\' }\" ng-model=\"vm.selectModel\" ng-disabled=\"vm._disabled || vm._readOnly\" ng-readonly=\"vm._readOnly\"><md-option ng-value=\"vm.getId(item)\" ng-repeat=\"item in vm.items\">{{vm.getTitle(item)}}</md-option></md-select><mx-control-errors></mx-control-errors></md-input-container>");
$templateCache.put("mx-rating/mx-rating.html","<label>{{vm.label}}</label><div class=\"mx-rating\" ng-class=\"[vm._disabled ? \'mx-rating--disabled\' : \'\']\"><md-icon class=\"mx-rating--star\" ng-repeat=\"star in vm.stars\" ng-class=\"{\'mx-rating--star-filled\': star.filled }\" ng-click=\"vm.toggle($index)\">star</md-icon></div>");
$templateCache.put("mx-repeater/mx-repeater.html","<div class=\"mx-repeater\" flex=\"\"><div flex=\"\" class=\"mx-repeater--row\" ng-repeat=\"item in __$vm.entities\"><div class=\"mx-repeater--panel\" flex=\"\" ng-include=\"\" src=\"__$vm.templateId\" data-onload=\"__$vm.initScope()\"></div></div></div>");
$templateCache.put("mx-rich-text-box/mx-rich-text-box.html","<md-input-container class=\"md-input-has-value\"><label><span ng-bind-html=\"::vm.label\"></span></label><div class=\"mx-tinymce-container\"><div ng-model=\"vm.model\" ui-tinymce=\"vm.tinymceOptions\"></div><mx-control-errors></mx-control-errors></div></md-input-container>");
$templateCache.put("mx-tabs/mx-tabs.html","<md-tabs md-dynamic-height=\"\" md-border-bottom=\"\"><md-tab layout=\"row\" class=\"flex\" ng-repeat=\"__$tab in __$vm.tabs | orderBy: \'position\'\" label=\"{{__$tab.title}}\"><div ng-include=\"\" src=\"__$tab.id\" data-onload=\"__$vm.initScope()\"></div></md-tab></md-tabs>");
$templateCache.put("mx-text-area/mx-text-area.html","<md-input-container md-is-error=\"vm.controlNgModel.mxInvalid\"><label><span ng-bind-html=\"::vm.label\"></span></label> <textarea name=\"{{::vm.internalName}}\" ng-model=\"vm.model\" ng-attr-rows=\"{{::vm.rows}}\" ng-disabled=\"vm._disabled\" ng-readonly=\"vm._readOnly\"></textarea><mx-control-errors></mx-control-errors></md-input-container>");
$templateCache.put("mx-text-box/mx-text-box.html","<md-input-container md-is-error=\"vm.controlNgModel.mxInvalid\"><label><span ng-bind-html=\"::vm.label\"></span></label> <input name=\"{{::vm.internalName}}\" type=\"{{::vm.type}}\" ng-model=\"vm.model\" ng-disabled=\"vm._disabled\" ng-readonly=\"vm._readOnly\" ng-pattern=\"vm.pattern\"><mx-control-errors track-internal=\"{{::vm.trackInternal}}\"></mx-control-errors></md-input-container>");
$templateCache.put("mx-components-icons.svg","<svg><defs><g id=\"close\"><path d=\"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z\"></path></g><g id=\"attachment\"><path d=\"M7.5,18A5.5,5.5 0 0,1 2,12.5A5.5,5.5 0 0,1 7.5,7H18A4,4 0 0,1 22,11A4,4 0 0,1 18,15H9.5A2.5,2.5 0 0,1 7,12.5A2.5,2.5 0 0,1 9.5,10H17V11.5H9.5A1,1 0 0,0 8.5,12.5A1,1 0 0,0 9.5,13.5H18A2.5,2.5 0 0,0 20.5,11A2.5,2.5 0 0,0 18,8.5H7.5A4,4 0 0,0 3.5,12.5A4,4 0 0,0 7.5,16.5H17V18H7.5Z\"></path></g><g id=\"chevron-down\"><path d=\"M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z\"></path></g><g id=\"send\"><path d=\"M2.01 21L23 12 2.01 3 2 10l15 2-15 2z\"></path><path d=\"M0 0h24v24H0z\" fill=\"none\"></path></g><g id=\"file\"><path d=\"M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z\"></path></g><g id=\"file-pdf-box\"><path d=\"M11.43,10.94C11.2,11.68 10.87,12.47 10.42,13.34C10.22,13.72 10,14.08 9.92,14.38L10.03,14.34V14.34C11.3,13.85 12.5,13.57 13.37,13.41C13.22,13.31 13.08,13.2 12.96,13.09C12.36,12.58 11.84,11.84 11.43,10.94M17.91,14.75C17.74,14.94 17.44,15.05 17,15.05C16.24,15.05 15,14.82 14,14.31C12.28,14.5 11,14.73 9.97,15.06C9.92,15.08 9.86,15.1 9.79,15.13C8.55,17.25 7.63,18.2 6.82,18.2C6.66,18.2 6.5,18.16 6.38,18.09L5.9,17.78L5.87,17.73C5.8,17.55 5.78,17.38 5.82,17.19C5.93,16.66 6.5,15.82 7.7,15.07C7.89,14.93 8.19,14.77 8.59,14.58C8.89,14.06 9.21,13.45 9.55,12.78C10.06,11.75 10.38,10.73 10.63,9.85V9.84C10.26,8.63 10.04,7.9 10.41,6.57C10.5,6.19 10.83,5.8 11.2,5.8H11.44C11.67,5.8 11.89,5.88 12.05,6.04C12.71,6.7 12.4,8.31 12.07,9.64C12.05,9.7 12.04,9.75 12.03,9.78C12.43,10.91 13,11.82 13.63,12.34C13.89,12.54 14.18,12.74 14.5,12.92C14.95,12.87 15.38,12.85 15.79,12.85C17.03,12.85 17.78,13.07 18.07,13.54C18.17,13.7 18.22,13.89 18.19,14.09C18.18,14.34 18.09,14.57 17.91,14.75M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M17.5,14.04C17.4,13.94 17,13.69 15.6,13.69C15.53,13.69 15.46,13.69 15.37,13.79C16.1,14.11 16.81,14.3 17.27,14.3C17.34,14.3 17.4,14.29 17.46,14.28H17.5C17.55,14.26 17.58,14.25 17.59,14.15C17.57,14.12 17.55,14.08 17.5,14.04M8.33,15.5C8.12,15.62 7.95,15.73 7.85,15.81C7.14,16.46 6.69,17.12 6.64,17.5C7.09,17.35 7.68,16.69 8.33,15.5M11.35,8.59L11.4,8.55C11.47,8.23 11.5,7.95 11.56,7.73L11.59,7.57C11.69,7 11.67,6.71 11.5,6.47L11.35,6.42C11.33,6.45 11.3,6.5 11.28,6.54C11.11,6.96 11.12,7.69 11.35,8.59Z\"></path></g><g id=\"download\"><path d=\"M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z\"></path></g><g id=\"file-image\"><path d=\"M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M6,20H15L18,20V12L14,16L12,14L6,20M8,9A2,2 0 0,0 6,11A2,2 0 0,0 8,13A2,2 0 0,0 10,11A2,2 0 0,0 8,9Z\"></path></g><g id=\"app-placeholder\"><circle fill=\"none\" stroke=\"#687172\" stroke-width=\"0.5\" stroke-miterlimit=\"10\" cx=\"12\" cy=\"12.1\" r=\"7.4\"></circle><g><path fill=\"#687172\" d=\"M10.2,13.6l-0.5-1.2H8.2l-0.5,1.2H7.2l1.5-3.9h0.4l1.5,3.9H10.2z M9.6,11.9l-0.5-1.2 C9.1,10.6,9,10.4,9,10.2c0,0.2-0.1,0.4-0.2,0.6l-0.5,1.2H9.6z\"></path><path fill=\"#687172\" d=\"M12.5,13.6c-0.2,0-0.4,0-0.5-0.1c-0.2-0.1-0.3-0.2-0.4-0.3h0c0,0.2,0,0.3,0,0.5v1.2h-0.4v-4.2h0.4l0.1,0.4 h0c0.1-0.2,0.2-0.3,0.4-0.3c0.2-0.1,0.3-0.1,0.5-0.1c0.4,0,0.7,0.1,0.9,0.4c0.2,0.3,0.3,0.6,0.3,1.1c0,0.5-0.1,0.9-0.3,1.1 S12.9,13.6,12.5,13.6z M12.5,11c-0.3,0-0.5,0.1-0.6,0.2c-0.1,0.2-0.2,0.4-0.2,0.8v0.1c0,0.4,0.1,0.7,0.2,0.9 c0.1,0.2,0.4,0.3,0.7,0.3c0.3,0,0.5-0.1,0.6-0.3c0.1-0.2,0.2-0.5,0.2-0.8c0-0.4-0.1-0.6-0.2-0.8C12.9,11.1,12.7,11,12.5,11z\"></path><path fill=\"#687172\" d=\"M15.9,13.6c-0.2,0-0.4,0-0.5-0.1c-0.2-0.1-0.3-0.2-0.4-0.3h0c0,0.2,0,0.3,0,0.5v1.2h-0.4v-4.2h0.4l0.1,0.4 h0c0.1-0.2,0.2-0.3,0.4-0.3c0.2-0.1,0.3-0.1,0.5-0.1c0.4,0,0.7,0.1,0.9,0.4c0.2,0.3,0.3,0.6,0.3,1.1c0,0.5-0.1,0.9-0.3,1.1 S16.2,13.6,15.9,13.6z M15.8,11c-0.3,0-0.5,0.1-0.6,0.2c-0.1,0.2-0.2,0.4-0.2,0.8v0.1c0,0.4,0.1,0.7,0.2,0.9 c0.1,0.2,0.4,0.3,0.7,0.3c0.3,0,0.5-0.1,0.6-0.3c0.1-0.2,0.2-0.5,0.2-0.8c0-0.4-0.1-0.6-0.2-0.8C16.3,11.1,16.1,11,15.8,11z\"></path></g></g></defs></svg>");}]);
(function(w) {
	'use strict';

	var internationalization;

	w.mx = w.mx || {};
	w.mx.components = w.mx.components || {};
	w.mx.components.internationalization = w.mx.components.internationalization || {};

	internationalization = {
  "form-validation": {
    "required": "Das Feld ist obligatorisch",
    "maxlength": "Das Feld Wert überschritten die maximale Länge",
    "minlength": "Der Feldwert ist zu kurz",
    "email": "Falshe E-mail Format",
	"pattern": "Falshe Format"
  },
  "mx-picker": {
    "defaultLabel": "Pick a value",
    "defaultNotFoundMessage": "Keine Daten gefunden"
  },
  "mx-feedback": {
    "title": "Matrix42 Produkt Feedback",
    "good": "Gut",
    "bad": "Schlecht",
    "comment": "Geben Sie Ihr Feedback ein",
    "screen": "Screenshot einschließen",
    "button": "Absenden",
    "rating": "Wie zufrieden sind Sie mit dem Produkt?",
    "warning": "Ihr Browser unterstützt keine Screenshots",
    "success": "Ihr Feedback wurde gesendet",
    "error1": "Das Feedback kann nicht leer sein",
    "iconAlt": "Senden Sie ein Feedback zu Matrix42",
    "titleDescription": "Wir schätzen Ihr Feedback und werden es benutzen, um Änderungen zu bewerten und um Verbesserungen in unseren Produkten vorzunehmen. Das Feedback ist vollkommen anonym und Matrix42 garantiert",
    "policy": "die Geheimhaltung",
    "policyLink": "https://www.matrix42.com/de/privacy-policy/",
    "titleDescription2": "Ihrer Mitteilung.",
    "hintNoTicketCreated": "Falls Sie ein Problem melden möchten, wenden Sie sich an den Systemadministrator.",
    "dialogTitle": "Matrix42 Produkt Feedback",
    "awful": "Sehr schlecht",
    "excellent": "Sehr gut",
    "close": "Schließen"
  },
  "mx-file-uploader": {
    "attachFileHint": "Datei anfügen"
  },
  "mx-form-control-base": {
    "isEmptySuffix": " ist leer"
  },
  "mx-image-preview": {
    "title": "Vorschau",
    "close": "Schließen"
  },
  "mx-attachments": {
    "videoWarning": "Ihr Browser unterstützt dieses Video nicht.",
    "download": "Download",
    "delete": "Löschen",
    "drop_attachments": "Hier klicken or Dateien hierher ziehen, um Anhänge hinzuzufügen",
    "drop_here": "HIER ABLEGEN",
    "filter": "Filter"
  },
  "mx-rich-text-box": {
    "html": {
      "tooltip": "Toggle html / Rich Text"
    },
    "heading": {
      "tooltip": "Heading "
    },
    "p": {
      "tooltip": "Paragraph"
    },
    "pre": {
      "tooltip": "Preformatted text"
    },
    "ul": {
      "tooltip": "Unordered List"
    },
    "ol": {
      "tooltip": "Ordered List"
    },
    "quote": {
      "tooltip": "Quote/unquote selection or paragraph"
    },
    "undo": {
      "tooltip": "Undo"
    },
    "redo": {
      "tooltip": "Redo"
    },
    "bold": {
      "tooltip": "Bold"
    },
    "italic": {
      "tooltip": "Italic"
    },
    "underline": {
      "tooltip": "Underline"
    },
    "strikeThrough": {
      "tooltip": "Strikethrough"
    },
    "justifyLeft": {
      "tooltip": "Align text left"
    },
    "justifyRight": {
      "tooltip": "Align text right"
    },
    "justifyFull": {
      "tooltip": "Justify text"
    },
    "justifyCenter": {
      "tooltip": "Center"
    },
    "indent": {
      "tooltip": "Increase indent"
    },
    "outdent": {
      "tooltip": "Decrease indent"
    },
    "clear": {
      "tooltip": "Clear formatting"
    },
    "insertImage": {
      "dialogPrompt": "Please enter an image URL to insert",
      "tooltip": "Insert image",
      "hotkey": "the - possibly language dependent hotkey ... for some future implementation",
      "reset": "Reset"
    },
    "insertVideo": {
      "tooltip": "Insert video",
      "dialogPrompt": "Please enter a youtube URL to embed"
    },
    "insertLink": {
      "tooltip": "Insert / edit link",
      "dialogPrompt": "Please enter a URL to insert"
    },
    "editLink": {
      "reLinkButton": {
        "tooltip": "Relink"
      },
      "unLinkButton": {
        "tooltip": "Unlink"
      },
      "targetToggle": {
        "buttontext": "Open in New Window"
      }
    },
    "wordcount": {
      "tooltip": "Display words Count"
    },
    "charcount": {
      "tooltip": "Display characters Count"
    }
  },
  "common": {
    "noData": "Keine Daten"
  },
  "errors": {
    "can_no_access_data_transfer_object": "Auf Datentransferobjekt kann nicht zugegriffen werden",
    "failed_to_load_image": "Bild konnte nicht geladen werden",
    "invalid_image": "Ungültiges Bild.",
    "method_is_not_implemented": "Funktion ist nicht implementiert",
    "mx_mask_without_ng_model": "Die mx-mask Direktive kann nicht ohne ng-model verwendet werden"
  },
  "grid": {
    "add": "Hinzufügen",
    "delete": "Löschen",
    "remove": "Entfernen"
  },
  "journal": {
    "load_more_items": "Mehr Einträge laden",
    "loading": " Laden…"
  },
  "mx-literal": {
    "notSet": "Nicht gesetzt"
  }
}
;
w.mx.components.internationalization['de'] = internationalization;
internationalization = {
	"common": {
		"noData": "No Data"
	},
	"form-validation": {
		"required": "The field is mandatory",
		"unique": "The field value has to be unique",
		"maxlength": "The field value exceeded the maximum length",
		"minlength": "The field value is too short",
		"email": "Wrong email format",
		"pattern": "Invalid format"
	},
	"mx-datasource-paging-panel": {
		"of": "of",
		"pageSize": "Page size"
	},
	"mx-literal":{
		"notSet": "not set"
	},
	"grid": {
		"add": "Add",
		"remove": "Remove",
		"delete": "Delete"
	},
	"journal": {
		"load_more_items": "Load more items",
		"loading": " Loading...",
		"send_button_label": "Add",
		"attach_files_button_label": "Attach files",
		"write_your_comment": "Write your comment...",
		"adding_error": "Adding error"
	},
	"mx-picker": {
		"defaultLabel": "Pick a value",
		"defaultNotFoundMessage": "No record found"
	},
	"mx-feedback": {
		"title": "Matrix42 Product Feedback",
		"good": "Good",
		"bad": "Bad",
		"comment": "Provide your feedback here",
		"screen": "Include screen-shot",
		"button": "Submit",
		"rating": "How satisfied are you with the product?",
		"warning": "Your browser does not support taking screen-shots.",
		"success": "Your feedback has been sent.",
		"error1": "Feedback can't be empty",
		"iconAlt": "Send feedback to Matrix42",
		"titleDescription": "We appreciate your feedback and will use it to evaluate changes and make improvements in our products. It is completely anonymous and Matrix42 guarantees",
		"policy": "privacy",
		"policyLink": "https://www.matrix42.com/en/privacy-policy/",
		"titleDescription2": "for data you share.",
		"hintNoTicketCreated": "If you wish to report an issue, please contact your system administrator.",
		"dialogTitle": "Matrix42 Product Feedback",
		"awful": "Very bad",
		"excellent": "Very good",
		"close": "Close"
	},
	"mx-bottom-sheet": {
		"iconAlt": "Applications Button being applied to given element"
	},
	"mx-file-uploader": {
		"attachFileHint": "Attach a file"
	},
	"mx-form-control-base": {
		"isEmptySuffix": " is empty"
	},
	"mx-image-preview": {
		"title": "Image preview",
		"close": "Close"
	},
	"mx-attachments": {
		"videoWarning": "Your browser does not support this video.",
		"download": "Download",
		"delete": "Delete",
		"drop_here": "DROP HERE",
		"drop_attachments": "Click here or drop for load attachments",
		"filter": "Filter"
	},
	"mx-rich-text-box": {
		"html": {
			"tooltip": "Toggle html / Rich Text"
		},
		"heading": {
			"tooltip": "Heading "
		},
		"p": {
			"tooltip": "Paragraph"
		},
		"pre": {
			"tooltip": "Preformatted text"
		},
		"ul": {
			"tooltip": "Unordered List"
		},
		"ol": {
			"tooltip": "Ordered List"
		},
		"quote": {
			"tooltip": "Quote/unquote selection or paragraph"
		},
		"undo": {
			"tooltip": "Undo"
		},
		"redo": {
			"tooltip": "Redo"
		},
		"bold": {
			"tooltip": "Bold"
		},
		"italic": {
			"tooltip": "Italic"
		},
		"underline": {
			"tooltip": "Underline"
		},
		"strikeThrough": {
			"tooltip": "Strikethrough"
		},
		"justifyLeft": {
			"tooltip": "Align text left"
		},
		"justifyRight": {
			"tooltip": "Align text right"
		},
		"justifyFull": {
			"tooltip": "Justify text"
		},
		"justifyCenter": {
			"tooltip": "Center"
		},
		"indent": {
			"tooltip": "Increase indent"
		},
		"outdent": {
			"tooltip": "Decrease indent"
		},
		"clear": {
			"tooltip": "Clear formatting"
		},
		"insertImage": {
			"dialogPrompt": "Please enter an image URL to insert",
			"tooltip": "Insert image",
			"hotkey": "the - possibly language dependent hotkey ... for some future implementation",
			"reset": "Reset"
		},
		"insertVideo": {
			"tooltip": "Insert video",
			"dialogPrompt": "Please enter a youtube URL to embed"
		},
		"insertLink": {
			"tooltip": "Insert / edit link",
			"dialogPrompt": "Please enter a URL to insert"
		},
		"editLink": {
			"reLinkButton": {
				"tooltip": "Relink"
			},
			"unLinkButton": {
				"tooltip": "Unlink"
			},
			"targetToggle": {
				"buttontext": "Open in New Window"
			}
		},
		"wordcount": {
			"tooltip": "Display words Count"
		},
		"charcount": {
			"tooltip": "Display characters Count"
		}
	},
	"errors": {
		"can_no_access_data_transfer_object": "Can not access data transfer object",
		"invalid_image": "Invalid image.",
		"failed_to_load_image": "Failed to load image",
		"mx_mask_without_ng_model": "The mx-mask directive cannot be used without ng-model",
		"method_is_not_implemented": "method is not implemented",
		"not_found_applications": "Not found any application in current context to associate with given current navigation items"
	}
}
;
w.mx.components.internationalization['en'] = internationalization;
internationalization = {
  "mx-feedback": {
    "title": "Matrix42 Product Feedback",
    "good": "Bueno",
    "bad": "Malo",
    "comment": "Escriba sus comentarios",
    "screen": "Incluya una captura de pantalla",
    "button": "Enviar",
    "rating": "How satisfied are you with the product?",
    "warning": "Su buscador no admite tomar capturas de pantalla.",
    "success": "Sus comentarios han sido enviados.",
    "error1": "La descripción está vacía.",
    "iconAlt": "Send feedback to Matrix42",
    "titleDescription": "We appreciate your feedback and will use it to evaluate changes and make improvements in our products. It is completely anonymous and Matrix42 guarantees",
    "policy": "privacy",
    "policyLink": "https://www.matrix42.com/es/privacy-policy/",
    "titleDescription2": "for data you share.",
    "hintNoTicketCreated": "If you wish to report an issue, please contact your system administrator.",
    "dialogTitle": "Matrix42 Product Feedback",
    "awful": "Very bad",
    "excellent": "Very good",
    "close": "Cerrar"
  },
  "mx-file-uploader": {
    "attachFileHint": "Attach a file"
  },
  "mx-form-control-base": {
    "isEmptySuffix": " is empty"
  },
  "mx-image-preview": {
    "title": "Image preview",
    "close": "Close"
  },
  "mx-attachments": {
    "videoWarning": "Your browser does not support this video.",
    "download": "Download",
    "delete": "Delete",
    "drop_attachments": "Haga clic aquí o suelte para cargar archivos adjuntos",
    "drop_here": "SOLTAR AQUÍ",
    "filter": "Filtro"
  },
  "mx-rich-text-box": {
    "html": {
      "tooltip": "Toggle html / Rich Text"
    },
    "heading": {
      "tooltip": "Heading "
    },
    "p": {
      "tooltip": "Paragraph"
    },
    "pre": {
      "tooltip": "Preformatted text"
    },
    "ul": {
      "tooltip": "Unordered List"
    },
    "ol": {
      "tooltip": "Ordered List"
    },
    "quote": {
      "tooltip": "Quote/unquote selection or paragraph"
    },
    "undo": {
      "tooltip": "Undo"
    },
    "redo": {
      "tooltip": "Redo"
    },
    "bold": {
      "tooltip": "Bold"
    },
    "italic": {
      "tooltip": "Italic"
    },
    "underline": {
      "tooltip": "Underline"
    },
    "strikeThrough": {
      "tooltip": "Strikethrough"
    },
    "justifyLeft": {
      "tooltip": "Align text left"
    },
    "justifyRight": {
      "tooltip": "Align text right"
    },
    "justifyFull": {
      "tooltip": "Justify text"
    },
    "justifyCenter": {
      "tooltip": "Center"
    },
    "indent": {
      "tooltip": "Increase indent"
    },
    "outdent": {
      "tooltip": "Decrease indent"
    },
    "clear": {
      "tooltip": "Clear formatting"
    },
    "insertImage": {
      "dialogPrompt": "Please enter an image URL to insert",
      "tooltip": "Insert image",
      "hotkey": "the - possibly language dependent hotkey ... for some future implementation",
      "reset": "Reset"
    },
    "insertVideo": {
      "tooltip": "Insert video",
      "dialogPrompt": "Please enter a youtube URL to embed"
    },
    "insertLink": {
      "tooltip": "Insert / edit link",
      "dialogPrompt": "Please enter a URL to insert"
    },
    "editLink": {
      "reLinkButton": {
        "tooltip": "Relink"
      },
      "unLinkButton": {
        "tooltip": "Unlink"
      },
      "targetToggle": {
        "buttontext": "Open in New Window"
      }
    },
    "wordcount": {
      "tooltip": "Display words Count"
    },
    "charcount": {
      "tooltip": "Display characters Count"
    }
  },
  "common": {
    "noData": "Sin datos"
  },
  "errors": {
    "can_no_access_data_transfer_object": "No se puede acceder al objeto de la transferencia de datos",
    "failed_to_load_image": "No se pudo cargar la imagen",
    "invalid_image": "Imagen no válida.",
    "method_is_not_implemented": "el método no está implementado",
    "mx_mask_without_ng_model": "La directiva mx-mask no se puede usar sin ng-model"
  },
  "form-validation": {
    "email": "Formato incorrecto de correo electrónico",
    "maxlength": "El valor del campo supera la longitud máxima",
    "minlength": "El valor del campo es demasiado corto",
    "required": "El campo es obligatorio"
  },
  "grid": {
    "add": "Añadir",
    "delete": "Eliminar",
    "remove": "Eliminar"
  },
  "journal": {
    "load_more_items": "Cargar más elementos",
    "loading": " Cargando..."
  },
  "mx-literal": {
    "notSet": "No configurado"
  },
  "mx-picker": {
    "defaultLabel": "Seleccionar un valor",
    "defaultNotFoundMessage": "No se ha encontrado ningún registro"
  }
}
;
w.mx.components.internationalization['es'] = internationalization;
internationalization = {
  "mx-feedback": {
    "title": "Avis",
    "good": "Favorable",
    "bad": "Défavorable",
    "comment": "Saisissez votre avis",
    "screen": "Envoyer une copie d'écran",
    "button": "Envoyer",
    "rating": "How satisfied are you with the product?",
    "warning": "Votre navigateur ne prend pas en charge les copies d'écran.",
    "success": "Votre avis a bien été envoyé.",
    "error1": "La description doit être renseignée.",
    "iconAlt": "Donnez votre avis",
    "titleDescription": "Vous avez une suggestion ou avez détecté un bug ? Remplissez le formulaire ci-après pour que nous réglions le problème !",
    "policy": "privacy",
    "policyLink": "https://www.matrix42.com/fr/privacy-policy/",
    "titleDescription2": "for data you share.",
    "hintNoTicketCreated": "If you wish to report an issue, please contact your system administrator",
    "dialogTitle": "Dites-nous ce que vous en pensez !",
    "awful": "Very bad",
    "excellent": "Very good",
    "close": "Fermer"
  },
  "mx-file-uploader": {
    "attachFileHint": "Attach a file"
  },
  "mx-form-control-base": {
    "isEmptySuffix": " is empty"
  },
  "mx-image-preview": {
    "title": "Image preview",
    "close": "Close"
  },
  "mx-attachments": {
    "videoWarning": "Your browser does not support this video.",
    "download": "Download",
    "delete": "Delete",
    "drop_attachments": "Cliquez ici ou déposez ici les pièces jointes à charger",
    "drop_here": "DÉPOSER ICI",
    "filter": "Filtre"
  },
  "mx-rich-text-box": {
    "html": {
      "tooltip": "Toggle html / Rich Text"
    },
    "heading": {
      "tooltip": "Heading "
    },
    "p": {
      "tooltip": "Paragraph"
    },
    "pre": {
      "tooltip": "Preformatted text"
    },
    "ul": {
      "tooltip": "Unordered List"
    },
    "ol": {
      "tooltip": "Ordered List"
    },
    "quote": {
      "tooltip": "Quote/unquote selection or paragraph"
    },
    "undo": {
      "tooltip": "Undo"
    },
    "redo": {
      "tooltip": "Redo"
    },
    "bold": {
      "tooltip": "Bold"
    },
    "italic": {
      "tooltip": "Italic"
    },
    "underline": {
      "tooltip": "Underline"
    },
    "strikeThrough": {
      "tooltip": "Strikethrough"
    },
    "justifyLeft": {
      "tooltip": "Align text left"
    },
    "justifyRight": {
      "tooltip": "Align text right"
    },
    "justifyFull": {
      "tooltip": "Justify text"
    },
    "justifyCenter": {
      "tooltip": "Center"
    },
    "indent": {
      "tooltip": "Increase indent"
    },
    "outdent": {
      "tooltip": "Decrease indent"
    },
    "clear": {
      "tooltip": "Clear formatting"
    },
    "insertImage": {
      "dialogPrompt": "Please enter an image URL to insert",
      "tooltip": "Insert image",
      "hotkey": "the - possibly language dependent hotkey ... for some future implementation",
      "reset": "Reset"
    },
    "insertVideo": {
      "tooltip": "Insert video",
      "dialogPrompt": "Please enter a youtube URL to embed"
    },
    "insertLink": {
      "tooltip": "Insert / edit link",
      "dialogPrompt": "Please enter a URL to insert"
    },
    "editLink": {
      "reLinkButton": {
        "tooltip": "Relink"
      },
      "unLinkButton": {
        "tooltip": "Unlink"
      },
      "targetToggle": {
        "buttontext": "Open in New Window"
      }
    },
    "wordcount": {
      "tooltip": "Display words Count"
    },
    "charcount": {
      "tooltip": "Display characters Count"
    }
  },
  "common": {
    "noData": "Aucune donnée"
  },
  "errors": {
    "can_no_access_data_transfer_object": "Impossible d'accéder à l'objet de transfert de données",
    "failed_to_load_image": "Échec du chargement de l'image",
    "invalid_image": "Image non valide.",
    "method_is_not_implemented": "méthode non mise en œuvre",
    "mx_mask_without_ng_model": "Impossible d'utiliser la directive mx-mask sans ng-model"
  },
  "form-validation": {
    "email": "Format d'e-mail incorrect",
    "maxlength": "La valeur du champ a dépassé la longueur maximale",
    "minlength": "La valeur du champ est trop courte",
    "required": "Le champ doit être renseigné"
  },
  "grid": {
    "add": "Ajouter",
    "delete": "Supprimer",
    "remove": "Supprimer"
  },
  "journal": {
    "load_more_items": "Charger plus d'éléments",
    "loading": " Chargement en cours..."
  },
  "mx-literal": {
    "notSet": "Non définie"
  },
  "mx-picker": {
    "defaultLabel": "Choisir une valeur",
    "defaultNotFoundMessage": "Aucun enregistrement trouvé"
  }
}
;
w.mx.components.internationalization['fr'] = internationalization;
internationalization = {
  "mx-feedback": {
    "title": "Feedback",
    "good": "Goed",
    "bad": "Slecht",
    "comment": "Vul uw feedback in",
    "screen": "Voeg schermafbeelding toe",
    "button": "Verzenden",
    "rating": "How satisfied are you with the product?",
    "warning": "U kunt met uw browser geen schermafbeeldingen maken.",
    "success": "Uw feedback is verzonden.",
    "error1": "Beschrijving is leeg.",
    "iconAlt": "Laat uw feedback achter",
    "titleDescription": "Hebt u een suggestie of hebt u een bug gevonden? Vul het onderstaande formulier in en we bekijken het!",
    "policy": "privacy",
    "policyLink": "https://www.matrix42.com/nl/privacy-policy/",
    "titleDescription2": "for data you share.",
    "hintNoTicketCreated": "If you wish to report an issue, please contact your system administrator",
    "dialogTitle": "Stuur ons uw feedback!",
    "awful": "Very bad",
    "excellent": "Very good",
    "close": "Sluiten"
  },
  "mx-file-uploader": {
    "attachFileHint": "Attach a file"
  },
  "mx-form-control-base": {
    "isEmptySuffix": " is empty"
  },
  "mx-image-preview": {
    "title": "Image preview",
    "close": "Close"
  },
  "mx-attachments": {
    "videoWarning": "Your browser does not support this video.",
    "download": "Download",
    "delete": "Delete",
    "drop_attachments": "Als u een bijlage wilt laden, klikt u hier of zet u de bijlage hier neer",
    "drop_here": "HIER NEERZETTEN",
    "filter": "Filteren"
  },
  "mx-rich-text-box": {
    "html": {
      "tooltip": "Toggle html / Rich Text"
    },
    "heading": {
      "tooltip": "Heading "
    },
    "p": {
      "tooltip": "Paragraph"
    },
    "pre": {
      "tooltip": "Preformatted text"
    },
    "ul": {
      "tooltip": "Unordered List"
    },
    "ol": {
      "tooltip": "Ordered List"
    },
    "quote": {
      "tooltip": "Quote/unquote selection or paragraph"
    },
    "undo": {
      "tooltip": "Undo"
    },
    "redo": {
      "tooltip": "Redo"
    },
    "bold": {
      "tooltip": "Bold"
    },
    "italic": {
      "tooltip": "Italic"
    },
    "underline": {
      "tooltip": "Underline"
    },
    "strikeThrough": {
      "tooltip": "Strikethrough"
    },
    "justifyLeft": {
      "tooltip": "Align text left"
    },
    "justifyRight": {
      "tooltip": "Align text right"
    },
    "justifyFull": {
      "tooltip": "Justify text"
    },
    "justifyCenter": {
      "tooltip": "Center"
    },
    "indent": {
      "tooltip": "Increase indent"
    },
    "outdent": {
      "tooltip": "Decrease indent"
    },
    "clear": {
      "tooltip": "Clear formatting"
    },
    "insertImage": {
      "dialogPrompt": "Please enter an image URL to insert",
      "tooltip": "Insert image",
      "hotkey": "the - possibly language dependent hotkey ... for some future implementation",
      "reset": "Reset"
    },
    "insertVideo": {
      "tooltip": "Insert video",
      "dialogPrompt": "Please enter a youtube URL to embed"
    },
    "insertLink": {
      "tooltip": "Insert / edit link",
      "dialogPrompt": "Please enter a URL to insert"
    },
    "editLink": {
      "reLinkButton": {
        "tooltip": "Relink"
      },
      "unLinkButton": {
        "tooltip": "Unlink"
      },
      "targetToggle": {
        "buttontext": "Open in New Window"
      }
    },
    "wordcount": {
      "tooltip": "Display words Count"
    },
    "charcount": {
      "tooltip": "Display characters Count"
    }
  },
  "common": {
    "noData": "Geen gegevens"
  },
  "errors": {
    "can_no_access_data_transfer_object": "Kan geen toegang krijgen tot het gegevensoverdrachtsobject",
    "failed_to_load_image": "Kan afbeelding niet laden",
    "invalid_image": "Ongeldige afbeelding.",
    "method_is_not_implemented": "methode is niet geïmplementeerd",
    "mx_mask_without_ng_model": "De mx-mask-instructie kan niet worden gebruikt zonder ng-model"
  },
  "form-validation": {
    "email": "Verkeerde e-mailindeling",
    "maxlength": "De veldwaarde heeft de maximumlengte overschreden",
    "minlength": "De veldwaarde is te kort",
    "required": "Het veld is verplicht"
  },
  "grid": {
    "add": "Toevoegen",
    "delete": "Verwijderen",
    "remove": "Verwijderen"
  },
  "journal": {
    "load_more_items": "Meer items laden",
    "loading": " Laden..."
  },
  "mx-literal": {
    "notSet": "Niet ingesteld"
  },
  "mx-picker": {
    "defaultLabel": "Kies een waarde",
    "defaultNotFoundMessage": "Geen record gevonden"
  }
}
;
w.mx.components.internationalization['nl'] = internationalization;
internationalization = {
  "mx-feedback": {
    "title": "Matrix42 Product Feedback",
    "good": "Dobry",
    "bad": "Z³y",
    "comment": "Provide your feedback here",
    "screen": "Za³¹cz zrzut ekranu",
    "button": "Wyœlij",
    "rating": "How satisfied are you with the product?",
    "warning": "Your browser does not support taking screenshots.",
    "success": "Your feedback has been sent.",
    "error1": "Feedback can't be empty",
    "iconAlt": "Send feedback to Matrix42",
    "titleDescription": "We appreciate your feedback and will use it to evaluate changes and make improvements in our products. It is completely anonymous and Matrix42 guarantees",
    "policy": "privacy",
    "policyLink": "https://www.matrix42.com/pl/privacy-policy/",
    "titleDescription2": "for data you share.",
    "hintNoTicketCreated": "If you wish to report an issue, please contact your system administrator.",
    "dialogTitle": "Matrix42 Product Feedback",
    "awful": "Very bad",
    "excellent": "Very good",
    "close": "Zamknij"
  },
  "mx-file-uploader": {
    "attachFileHint": "Attach a file"
  },
  "mx-form-control-base": {
    "isEmptySuffix": " is empty"
  },
  "mx-image-preview": {
    "title": "Image preview",
    "close": "Close"
  },
  "mx-attachments": {
    "videoWarning": "Your browser does not support this video.",
    "download": "Download",
    "delete": "Delete",
    "drop_attachments": "Kliknij tutaj lub upuść w celu wgrania załączników",
    "drop_here": "UPUŚĆ TUTAJ",
    "filter": "Filtruj"
  },
  "mx-rich-text-box": {
    "html": {
      "tooltip": "Toggle html / Rich Text"
    },
    "heading": {
      "tooltip": "Heading "
    },
    "p": {
      "tooltip": "Paragraph"
    },
    "pre": {
      "tooltip": "Preformatted text"
    },
    "ul": {
      "tooltip": "Unordered List"
    },
    "ol": {
      "tooltip": "Ordered List"
    },
    "quote": {
      "tooltip": "Quote/unquote selection or paragraph"
    },
    "undo": {
      "tooltip": "Undo"
    },
    "redo": {
      "tooltip": "Redo"
    },
    "bold": {
      "tooltip": "Bold"
    },
    "italic": {
      "tooltip": "Italic"
    },
    "underline": {
      "tooltip": "Underline"
    },
    "strikeThrough": {
      "tooltip": "Strikethrough"
    },
    "justifyLeft": {
      "tooltip": "Align text left"
    },
    "justifyRight": {
      "tooltip": "Align text right"
    },
    "justifyFull": {
      "tooltip": "Justify text"
    },
    "justifyCenter": {
      "tooltip": "Center"
    },
    "indent": {
      "tooltip": "Increase indent"
    },
    "outdent": {
      "tooltip": "Decrease indent"
    },
    "clear": {
      "tooltip": "Clear formatting"
    },
    "insertImage": {
      "dialogPrompt": "Please enter an image URL to insert",
      "tooltip": "Insert image",
      "hotkey": "the - possibly language dependent hotkey ... for some future implementation",
      "reset": "Reset"
    },
    "insertVideo": {
      "tooltip": "Insert video",
      "dialogPrompt": "Please enter a youtube URL to embed"
    },
    "insertLink": {
      "tooltip": "Insert / edit link",
      "dialogPrompt": "Please enter a URL to insert"
    },
    "editLink": {
      "reLinkButton": {
        "tooltip": "Relink"
      },
      "unLinkButton": {
        "tooltip": "Unlink"
      },
      "targetToggle": {
        "buttontext": "Open in New Window"
      }
    },
    "wordcount": {
      "tooltip": "Display words Count"
    },
    "charcount": {
      "tooltip": "Display characters Count"
    }
  },
  "common": {
    "noData": "Brak danych"
  },
  "errors": {
    "can_no_access_data_transfer_object": "Nie można uzyskać dostępu do obiektu przesyłania danych",
    "failed_to_load_image": "Nie można załadować obrazu",
    "invalid_image": "Nieprawidłowy obraz.",
    "method_is_not_implemented": "metoda nie jest wdrożona",
    "mx_mask_without_ng_model": "Nie można używać dyrektywy maski mx bez modelu ng"
  },
  "form-validation": {
    "email": "Niewłaściwy format wiadomości e-mail",
    "maxlength": "Wartość pola przekracza maksymalną długość",
    "minlength": "Wartość pola jest zbyt krótka",
    "required": "Pole jest obowiązkowe"
  },
  "grid": {
    "add": "Dodaj",
    "delete": "Usuń",
    "remove": "Usuń"
  },
  "journal": {
    "load_more_items": "Wgraj więcej elementów",
    "loading": " Wgrywanie..."
  },
  "mx-literal": {
    "notSet": "Nieustawiony"
  },
  "mx-picker": {
    "defaultLabel": "Wybierz wartość",
    "defaultNotFoundMessage": "Nie znaleziono rekordu"
  }
}
;
w.mx.components.internationalization['pl'] = internationalization;
internationalization = {
  "mx-feedback": {
    "title": "Matrix42 Product Feedback",
    "good": "Bom",
    "bad": "Ruim",
    "comment": "Insira seu feedback",
    "screen": "Incluir captura de tela",
    "button": "Enviar",
    "rating": "How satisfied are you with the product?",
    "warning": "Seu navegador não é compatível com captura de telas.",
    "success": "Seu feedback foi enviado.",
    "error1": "A feedback está em branco.",
    "iconAlt": "Deixe seu feedback",
    "titleDescription": "We appreciate your feedback and will use it to evaluate changes and make improvements in our products. It is completely anonymous and Matrix42 guarantees",
    "policy": "privacy",
    "policyLink": "https://www.matrix42.com/pt/privacy-policy/",
    "titleDescription2": "for data you share.",
    "hintNoTicketCreated": "If you wish to report an issue, please contact your system administrator.",
    "dialogTitle": "Matrix42 Product Feedback",
    "awful": "Very bad",
    "excellent": "Very good",
    "close": "Fechar"
  },
  "mx-file-uploader": {
    "attachFileHint": "Attach a file"
  },
  "mx-form-control-base": {
    "isEmptySuffix": " is empty"
  },
  "mx-image-preview": {
    "title": "Image preview",
    "close": "Close"
  },
  "mx-attachments": {
    "videoWarning": "Your browser does not support this video.",
    "download": "Download",
    "delete": "Delete",
    "drop_attachments": "Clique aqui ou arraste os anexos para cá para carregá-los",
    "drop_here": "ARRASTE PARA CÁ",
    "filter": "Filtro"
  },
  "mx-rich-text-box": {
    "html": {
      "tooltip": "Toggle html / Rich Text"
    },
    "heading": {
      "tooltip": "Heading "
    },
    "p": {
      "tooltip": "Paragraph"
    },
    "pre": {
      "tooltip": "Preformatted text"
    },
    "ul": {
      "tooltip": "Unordered List"
    },
    "ol": {
      "tooltip": "Ordered List"
    },
    "quote": {
      "tooltip": "Quote/unquote selection or paragraph"
    },
    "undo": {
      "tooltip": "Undo"
    },
    "redo": {
      "tooltip": "Redo"
    },
    "bold": {
      "tooltip": "Bold"
    },
    "italic": {
      "tooltip": "Italic"
    },
    "underline": {
      "tooltip": "Underline"
    },
    "strikeThrough": {
      "tooltip": "Strikethrough"
    },
    "justifyLeft": {
      "tooltip": "Align text left"
    },
    "justifyRight": {
      "tooltip": "Align text right"
    },
    "justifyFull": {
      "tooltip": "Justify text"
    },
    "justifyCenter": {
      "tooltip": "Center"
    },
    "indent": {
      "tooltip": "Increase indent"
    },
    "outdent": {
      "tooltip": "Decrease indent"
    },
    "clear": {
      "tooltip": "Clear formatting"
    },
    "insertImage": {
      "dialogPrompt": "Please enter an image URL to insert",
      "tooltip": "Insert image",
      "hotkey": "the - possibly language dependent hotkey ... for some future implementation",
      "reset": "Reset"
    },
    "insertVideo": {
      "tooltip": "Insert video",
      "dialogPrompt": "Please enter a youtube URL to embed"
    },
    "insertLink": {
      "tooltip": "Insert / edit link",
      "dialogPrompt": "Please enter a URL to insert"
    },
    "editLink": {
      "reLinkButton": {
        "tooltip": "Relink"
      },
      "unLinkButton": {
        "tooltip": "Unlink"
      },
      "targetToggle": {
        "buttontext": "Open in New Window"
      }
    },
    "wordcount": {
      "tooltip": "Display words Count"
    },
    "charcount": {
      "tooltip": "Display characters Count"
    }
  },
  "common": {
    "noData": "Nenhum dado"
  },
  "errors": {
    "can_no_access_data_transfer_object": "Não é possível acessar o objeto de transferência de dados",
    "failed_to_load_image": "Falha ao carregar imagem",
    "invalid_image": "Imagem inválida.",
    "method_is_not_implemented": "método não implementado",
    "mx_mask_without_ng_model": "A diretiva mx-mask não pode ser usada sem ng-model"
  },
  "form-validation": {
    "email": "Formato de e-mail incorreto",
    "maxlength": "O valor do campo excedeu o tamanho máximo",
    "minlength": "O valor do campo é muito curto",
    "required": "O campo é obrigatório"
  },
  "grid": {
    "add": "Adicionar",
    "delete": "Excluir",
    "remove": "Remover"
  },
  "journal": {
    "load_more_items": "Carregar mais itens",
    "loading": " Carregando..."
  },
  "mx-literal": {
    "notSet": "Não configurado"
  },
  "mx-picker": {
    "defaultLabel": "Selecione um valor",
    "defaultNotFoundMessage": "Nenhum registro encontrado"
  }
}
;
w.mx.components.internationalization['pt'] = internationalization;

})(window);