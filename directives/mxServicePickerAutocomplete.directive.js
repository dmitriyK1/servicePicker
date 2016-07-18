(function(w) {
  'use strict';

  angular
    .module('app')
    .directive('mxServicePickerAutocomplete', mxServicePickerAutocomplete)
    .directive('mxServicePickerAutocomplete', mxServicePickerAutocompletePatch)
    .directive('addVirtualRepeatContainerCtrl', addVirtualRepeatContainerCtrl)

  function addVirtualRepeatContainerCtrl() {
    var ddo = {
      require: 'mdVirtualRepeatContainer',
      link: link
    };

    return ddo;

    function link(scope, element, attrs, ctrl) {
      scope.$mdVirtualRepeatContainer = ctrl;
    }

  }

  mxServicePickerAutocomplete.$inject = ['$mdConstant'];

  function mxServicePickerAutocomplete($mdConstant) {

    return {
      controller   : 'MdAutocompleteCtrl',
      controllerAs : '$mdAutocompleteCtrl',
      scope: {
        inputName      : '@mdInputName',
        inputMinlength : '@mdInputMinlength',
        inputMaxlength : '@mdInputMaxlength',
        searchText     : '=?mdSearchText',
        selectedItem   : '=?mdSelectedItem',
        itemsExpr      : '@mdItems',
        itemText       : '&mdItemText',
        placeholder    : '@placeholder',
        noCache        : '=?mdNoCache',
        selectOnMatch  : '=?mdSelectOnMatch',
        itemChange     : '&?mdSelectedItemChange',
        textChange     : '&?mdSearchTextChange',
        minLength      : '=?mdMinLength',
        delay          : '=?mdDelay',
        autofocus      : '=?mdAutofocus',
        floatingLabel  : '@?mdFloatingLabel',
        autoselect     : '=?mdAutoselect',
        menuClass      : '@?mdMenuClass',
        inputId        : '@?mdInputId',
      },
      bindToController: {
        mode: '=?'
      },

      link: function(scope, element, attrs, controller) {
          controller.hasNotFound = element.hasNotFoundTemplate;
          delete element.hasNotFoundTemplate;

          controller.customKeydown = function(e) {
              var selectedElement = document.querySelector('md-virtual-repeat-container:not(.ng-hide) .selected');
              var keyCode = e.keyCode;

              // prevent selecting title list item on <enter> (hosts/services/operations)
              if (keyCode === $mdConstant.KEY_CODE.ENTER && selectedElement.classList.contains('title')) {
                  return;
              }

              // ================================================================================
              // scroll to top of dropdown if upper edge reached, but do not select a title
              if (keyCode === $mdConstant.KEY_CODE.UP_ARROW) {
                  e.preventDefault();

                  if (1 === controller.index) {
                      return;
                  }

                  if (2 === controller.index) {
                      scope.$mdVirtualRepeatContainer.scrollToIndex(0);
                  }

              }
              // ================================================================================
              if (keyCode === $mdConstant.KEY_CODE.DOWN_ARROW) {
                  e.preventDefault();

                  if (selectedElement) {
                      var nextListElement = selectedElement.nextElementSibling;

                      if (nextListElement) {
                          if (nextListElement.classList.contains('title')) {
                              controller.index += 1;
                          }
                      }

                  }

              }

              if (keyCode === $mdConstant.KEY_CODE.UP_ARROW) {
                  if (selectedElement) {
                      var previousListElement = selectedElement.previousElementSibling;

                      if (previousListElement && previousListElement.previousElementSibling) {

                          // if title selected on arrow up - go to next element above it
                          if (previousListElement.classList.contains('title')) {
                              controller.index -= 2;
                              scope.$mdVirtualRepeatContainer.scrollToIndex(controller.index - 2);

                              return;
                          }

                          // if scrolled on arrow up to a title shift focus so title section is visible
                          if (previousListElement.previousElementSibling.classList.contains('title')) {

                              controller.index -= 1;
                              scope.$mdVirtualRepeatContainer.scrollToIndex(controller.index - 1);

                              return;
                          }
                      }
                  }
              }

              controller.keydown(e);
          };

      },

      template: function(element, attr) {
        var noItemsTemplate = getNoItemsTemplate(),
          itemTemplate = getItemTemplate(),
          leftover = element.html(),
          tabindex = attr.tabindex;

        // Set our variable for the link function above which runs later
        element.hasNotFoundTemplate = !!noItemsTemplate;

        if (!attr.hasOwnProperty('tabindex')) element.attr('tabindex', '-1');

        return '\
        <md-autocomplete-wrap\
            layout="row"\
            ng-class="{ \'md-whiteframe-z1\': !floatingLabel, \'md-menu-showing\': !$mdAutocompleteCtrl.hidden }"\
            role="listbox">\
          ' + getInputElement() + '\
          <md-progress-linear\
              class="' + (attr.mdFloatingLabel ? 'md-inline' : '') + '"\
              ng-if   = "$mdAutocompleteCtrl.loadingIsVisible()"\
              md-mode = "indeterminate"\
              ></md-progress-linear>\
          <md-virtual-repeat-container\
              add-virtual-repeat-container-ctrl\
              md-auto-shrink\
              md-auto-shrink-min = "1"\
              ng-mouseenter      = "$mdAutocompleteCtrl.listEnter()"\
              ng-mouseleave      = "$mdAutocompleteCtrl.listLeave()"\
              ng-mouseup         = "$mdAutocompleteCtrl.mouseUp()"\
              ng-hide            = "$mdAutocompleteCtrl.hidden"\
              class              = "md-autocomplete-suggestions-container md-whiteframe-z1 mx-service-picker-suggestions"\
              ng-class           = "{ \'md-not-found\': $mdAutocompleteCtrl.notFoundVisible() }"\
              role               = "presentation"\
              >\
            <ul class="md-autocomplete-suggestions"\
                ng-class = "::menuClass"\
                id       = "ul-{{$mdAutocompleteCtrl.id}}"\
            >\
              <li md-virtual-repeat="item in $mdAutocompleteCtrl.matches"\
                  ng-class      = "{ selected: $index === $mdAutocompleteCtrl.index, title: item.type === \'title\' }"\
                  ng-click      = "$mdAutocompleteCtrl.select($index)"\
                  md-extra-name = "$mdAutocompleteCtrl.itemName"\
              >\
                  ' + itemTemplate + '\
                  </li>' + noItemsTemplate + '\
            </ul>\
          </md-virtual-repeat-container>\
        </md-autocomplete-wrap>\
        <aria-status\
            class     = "md-visually-hidden"\
            role      = "status"\
            aria-live = "assertive"\
        >\
          <p ng-repeat="message in $mdAutocompleteCtrl.messages track by $index" ng-if="message">{{message}}</p>\
        </aria-status>';

        function getItemTemplate() {
          var templateTag = element.find('md-item-template').detach(),
            html = templateTag.length ? templateTag.html() : element.html();
          if (!templateTag.length) element.empty();
          return '<md-autocomplete-parent-scope md-autocomplete-replace>' + html + '</md-autocomplete-parent-scope>';
        }

        function getNoItemsTemplate() {
          var templateTag = element.find('md-not-found').detach(),
            template = templateTag.length ? templateTag.html() : '';
          return template ?
            '<li ng-if="$mdAutocompleteCtrl.notFoundVisible()"\
                         md-autocomplete-parent-scope>' + template + '</li>' :
            '';
        }

        function getInputElement() {
          return '\
        <md-input-container flex ng-if="floatingLabel">\
              <label>{{floatingLabel}}</label>\
              <input type="search"\
        ' + (tabindex != null ? 'tabindex="' + tabindex + '"' : '') + '\
                  id                    = "{{ inputId || \'fl-input-\' + $mdAutocompleteCtrl.id }}"\
                  name                  = "{{inputName}}"\
                  autocomplete          = "off"\
                  ng-required           = "$mdAutocompleteCtrl.isRequired"\
                  ng-minlength          = "inputMinlength"\
                  ng-maxlength          = "inputMaxlength"\
                  ng-disabled           = "$mdAutocompleteCtrl.isDisabled"\
                  ng-model              = "$mdAutocompleteCtrl.scope.searchText"\
                  ng-keydown            = "$mdAutocompleteCtrl.customKeydown($event)"\
                  ng-blur               = "$mdAutocompleteCtrl.blur()"\
                  ng-focus              = "$mdAutocompleteCtrl.focus()"\
                  aria-owns             = "ul-{{$mdAutocompleteCtrl.id}}"\
                  aria-label            = "{{floatingLabel}}"\
                  aria-autocomplete     = "list"\
                  aria-haspopup         = "true"\
                  aria-activedescendant = ""\
                  aria-expanded         = "{{!$mdAutocompleteCtrl.hidden}}"/>\
              <div md-autocomplete-parent-scope md-autocomplete-replace>' + leftover + '</div>\
            </md-input-container>';

        }
      }
    };
  }

  function mxServicePickerAutocompletePatch($mdConstant) {
    var ddo = {
      link: link
    };

    return ddo;

    function link(scope, element, attrs, ctrl) {
      var DOT_CHARCODE = 190;

      element.on('keydown', onKeyDown);

      scope.$on('$destroy', function cleanUp() {
        element.off('keydown');
      });

      function onKeyDown(e) {
        var mode = scope.vm.mode;
        var keyCode = e.keyCode;
        var maxNesting;

        if (mode === 'services') maxNesting = 1;
        if (mode === 'operations') maxNesting = 2;

        var inputValue = e.target.value;

        if (validateInput(keyCode, inputValue)) {
          e.preventDefault();
          return;
        }

        if (keyCode !== DOT_CHARCODE) return;

        if (!inputValue) {
          e.preventDefault();
          return;
        }

        var count = (inputValue.match(/\./g) || []).length;
        var isLastCharDot = inputValue[inputValue.length - 1] === '.';

        if (count === maxNesting || isLastCharDot) {
          e.preventDefault();
          return;
        }

        function validateInput(keyCode, inputValue) {
          return keyCode === $mdConstant.KEY_CODE.SPACE || keyCode === DOT_CHARCODE && !inputValue;
        }

      }

    }
  }


})(window);
