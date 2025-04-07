//
//     Angular directive for KeyLines v3.5.6-3446
//
//     Copyright © 2011-2017 Cambridge Intelligence Limited.
//     All rights reserved.
//

angular.module('ngKeylines', [])

.factory('klComponentsFactory', ['$q', function($q) {
  function klPaths(base, images) {
    var paths = {
      assets: base + 'assets/',
      images: base // default if not separately defined
    };
    if (angular.isDefined(images)) {
      paths.images = images;
    }
    return paths;
  }

  // Define the factory
  var factory = {};

  factory.create = function(klComponents, klBasePath, klImagesPath) {
    // KeyLines paths configuration
    var paths = klPaths(klBasePath || '', klImagesPath);
    KeyLines.paths(paths);

    // KeyLines create components
    return $q(function(resolve, reject){
        KeyLines.create(klComponents, function(error, components) {
        if (error) {
          reject(error);
        } else {
          resolve(components);
        }
      });
    });
  };

  return factory;
}])

.controller('klComponentsController', ['klComponentsFactory', function(klComponentsFactory) {
  var that = this,
      listToCreate = [],
      klComponentCtrls = {};

  // Declare a new component to create
  that.declareComponent = function(component, controller) {
    // Save the component to create
    listToCreate.push(component);
    // Save the controller of the component
    klComponentCtrls[component.id] = controller;
  };

  // Create the KeyLines components using the factory
  that.createComponents = function() {
    // Call the service only if there is something to create
    if (listToCreate.length > 0) {
      // Call the service to create all the kl components
      klComponentsFactory
        .create(listToCreate, that.klBasePath, that.klImagesPath)
        .then(function(klComponents) {
          // Notify all the component controllers
          notifyControllers(klComponents);

          // Call the callback and attach the components
          if (that.klReady) {
            that.klReady()(klComponents);
          }
        })
        .catch(function(error) {
          throw new Error(error);
        });
    }
  };

  // Notify controllers of components
  function notifyControllers(components) {
    if (angular.isArray(components)) {
      angular.forEach(components, function(component) {
        notifyController(component);
      });
    } else {
      notifyController(components);
    }
  }

  // Notify a controller of component
  function notifyController(component) {
    var controller = klComponentCtrls[component.id()];
    if (controller) {
      controller.onComponentCreated(component);
    }
  }
}])

.controller('klComponentController', ['$parse', '$timeout', 'klComponentsFactory', function($parse, $timeout, klComponentsFactory) {
  var that = this,
      klComponent = false,
      klParentContext = false,
      klEvents = {};

  // Init the component
  that.initComponent = function(attributes, parentContext) {
    // Save the parent context
    klParentContext = parentContext;
    // Register events based on attributes
    registerEvents(attributes);
  };

  // Create the KeyLines component using the factory
  that.createComponent = function(toCreate) {
    // Call the service to create the kl component
    klComponentsFactory
      .create(toCreate, that.klBasePath, that.klImagesPath)
      .then(function(klComponent) {
        // Notify that the component is created
        that.onComponentCreated(klComponent);

        // Call the callback and attach the component
        if (that.klReady) {
          that.klReady()(klComponent);
        }
      })
      .catch(function(error) {
        throw new Error(error);
      });
  };

  // Once the component is created
  that.onComponentCreated = function(component) {
    // Save the component
    klComponent = component;
    // Bind events
    bindEvents();
  };

  // Unbind registered events for the component
  that.unbindEvents = function() {
    if (klComponent) {
      // unbind the KeyLines events asked to the component
      angular.forEach(klEvents, function(eventFn, eventName) {
        klComponent.unbind(eventName);
      });
    }
  };

  // Register the events found on attributes
  function registerEvents(attributes) {
    angular.forEach(attributes, function(expression, eventName) {
      // Determine if it's a kl events
      if (!that[eventName] && eventName.search(/kl/i) !== -1) {
        // https://docs.google.com/presentation/d/15XgHRI8Ng2MXKZqglzP3PugWFZmIDKOnlAXDGZW2Djg/edit#slide=id.g2a0ec7d53_00
        // parse one time the events and save the functions
        eventName = eventName.replace('kl', ''); // remove kl prefix
        klEvents[eventName.toLowerCase()] = $parse(expression);
      }
    });
  }

  // Bind the events to the component
  function bindEvents() {
    if (klComponent && klParentContext) {
      // bind the KeyLines events asked to the component
      angular.forEach(klEvents, function(eventFn, eventName) {
        klComponent.bind(eventName, function() {
          // Force to trigger a new digest cycle
          // Ensure that the parent scope will be refreshed
          // It's necessary to update the variables attached to the scope of the controller used in the view
          // Otherwise the values will not change in the view
          $timeout();
          // Evaluate the functions parsed before
          // Gives KeyLines event arguments
          return eventFn(klParentContext).apply(null, arguments);
        });
      });
    }
  }
}])

.directive('klComponents', function() {
  return {
    // Restriction on elements and attributes
    restrict: 'AE',
    // Isolated scope
    scope: {
      klBasePath: '@?', // optional
      klImagesPath: '@?', // optional
      klReady: '&?' // optional
    },
    // ControllerAs 'syntax'
    controllerAs: 'componentsCtrl',
    // Bind scope properties to the controller
    bindToController: true,
    // Controller to register components
    controller: 'klComponentsController',
    // Create the HTML component
    link: function(scope, element, attrs, klComponentsController) {
      // Create the components
      klComponentsController.createComponents();
    }
  };
})

.directive('klComponent', function() {
  return {
    // Require the klComponents directive
    require: '^?klComponents', // optional
    // Restriction on elements and attributes
    restrict: 'AE',
    // Isolated scope
    scope: {
      klType: '@?', // optional
      // Note: if Angular >= 1.5 then it's better to use single binding '<?'
      klOptions: '=?', // optional
      klBasePath: '@?', // optional
      klImagesPath: '@?', // optional
      klReady: '&?' // optional
    },
    // Use transclusion on our element
    // to preserve other directive's attributes
    transclude: 'element',
    replace: true,
    // Wrap the klComponents under the directive element
    template: "<div ng-transclude></div>",
    // ControllerAs 'syntax'
    controllerAs: 'componentCtrl',
    // Bind scope properties to the controller
    bindToController: true,
    // Controller to expose the API of the component
    controller: 'klComponentController',
    // Register the HTML component
    link: function(scope, element, attrs, klComponentsController) {
      var id = attrs.id,
          klComponentController = scope.componentCtrl;
      // Define the component to create
      var toCreate = {
        id: id,
        type: klComponentController.klType || 'chart',
        options: klComponentController.klOptions || {}
      };

      // Remove KL id to the parent
      // Use the transclude element instead
      element.removeAttr('id');
      element.removeAttr('style');

      // Init the component
      klComponentController.initComponent(attrs, scope.$parent);

      // Test wether multiple components are defined or only one
      if (klComponentsController) {
        // Declare a new component to create
        klComponentsController.declareComponent(toCreate, klComponentController);
      } else {
        // Simply create a new component
        klComponentController.createComponent(toCreate);
      }

      // Unbind all events
      scope.$on('$destroy', function() {
        klComponentController.unbindEvents();
      });
    }
  };
});
