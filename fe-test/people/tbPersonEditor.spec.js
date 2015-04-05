describe('tbPersonEditor', function() {
  beforeEach(module('tbPersonEditor', 'tbTemplates'));

  var $scope;
  var $compile;
  var $q;
  beforeEach(inject(function($rootScope, _$compile_, _$q_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $q = _$q_;
  }));

  it('should throw if submitTitle is not set', function() {
    $compile(
      '<tb-person-editor ' +
      '  busy="busy"' +
      '  person-template="{}">' +
      '</tb-person-editor>')($scope);
    expect(function() {
      $scope.$digest();
    }).toThrow();
  });

  it('should throw if personTemplate is not set', function() {
    $compile(
      '<tb-person-editor ' +
      '  busy="busy"' +
      '  submit-title="Submit">' +
      '</tb-person-editor>')($scope);
    expect(function() {
      $scope.$digest();
    }).toThrow();
  });

  it('should not throw if everything is set', function() {
    $compile(
      '<tb-person-editor ' +
      '  busy="busy"' +
      '  submit-title="Submit"' +
      '  person-template="{}">' +
      '</tb-person-editor>')($scope);
    expect(function() {
      $scope.$digest();
    }).not.toThrow();
  });

  it('should set up the submit button text based on submitTitle', function() {
    var element = $compile(
      '<tb-person-editor ' +
      '  busy="busy"' +
      '  submit-title="Hello World"' +
      '  person-template="{}">' +
      '</tb-person-editor>')($scope);

    $scope.$digest();

    var ui = new UiMap(element);
    expect(ui.submitButtonElement().text()).toBe('Hello World');
  });

  it('should prepopulate the fields based on personTemplate', function() {
    $scope.person = { name: 'john smith' };
    var element = $compile(
      '<tb-person-editor ' +
      '  busy="busy"' +
      '  submit-title="Hello World"' +
      '  person-template="person">' +
      '</tb-person-editor>')($scope);

    $scope.$digest();

    var ui = new UiMap(element);
    expect(ui.nameInputElement().val()).toBe('john smith');
  });

  describe('busy handling', function() {
    var ui;
    beforeEach(inject(function() {
      var element = $compile(
        '<tb-person-editor ' +
        '  busy="busy"' +
        '  submit-title="Hello World"' +
        '  person-template="{}"' +
        '</tb-person-editor>')($scope);
      $scope.$digest();

      ui = new UiMap(element);
    }));

    it('should enable the form contents as long as "busy" is false', function() {
      $scope.$apply(function() {
        $scope.busy = false;
      });

      expect(ui.fieldsetElement().attr('disabled')).toBeUndefined();
    });

    it('should disable the form contents as long as "busy" is true', function() {
      $scope.$apply(function() {
        $scope.busy = true;
      });

      expect(ui.fieldsetElement().attr('disabled')).toBe('disabled');
    });
  });

  describe('submission', function() {
    var handlePersonDeferred;
    var ui;
    beforeEach(inject(function() {
      handlePersonDeferred = $q.defer();
      $scope.person = { name: 'john' };
      $scope.handlePerson = jasmine.createSpy('handlePerson').and.callFake(function() {
        return handlePersonDeferred.promise;
      });
      var element = $compile(
        '<tb-person-editor ' +
        '  submit-title="Hello World"' +
        '  person-template="person"' +
        '  on-submit="handlePerson(person)">' +
        '</tb-person-editor>')($scope);
      $scope.$digest();

      ui = new UiMap(element);
      ui.formElement().submit();
    }));

    it('should call onSubmit when the form is submitted', function() {
      expect($scope.handlePerson).toHaveBeenCalledWith({ name: 'john' });
    });

    it('should display validation errors when onSubmit returns a rejection', function() {
      $scope.$apply(function() {
        handlePersonDeferred.reject({ name: 'ugly' });
      });

      expect(ui.nameFormGroupElement().hasClass('has-error')).toBe(true);
      expect(ui.nameInputElement().val()).toBe('john');
      expect(ui.nameHelpBlockElement().text()).toBe('ugly');
    });

    it('should do nothing when onSubmit succeeds', function() {
      $scope.$apply(function() {
        handlePersonDeferred.resolve();
      });

      expect(ui.nameFormGroupElement().hasClass('has-error')).toBe(false);
      expect(ui.nameInputElement().val()).toBe('john');
    });

    it('should eliminate the validation errors once the form is touched', function() {
      $scope.$apply(function() {
        handlePersonDeferred.reject({ name: 'ugly' });
      });

      ui.nameInputElement().val('john1');
      ui.nameInputElement().change();

      expect(ui.nameFormGroupElement().hasClass('has-error')).toBe(false);
    });

    it('should eliminate the validation errors when the form is submitted again after the previous rejection', function() {
      $scope.$apply(function() {
        handlePersonDeferred.reject({ name: 'ugly' });
      });

      handlePersonDeferred = $q.defer();
      ui.formElement().submit();

      expect(ui.nameFormGroupElement().hasClass('has-error')).toBe(false);
      $scope.$apply(function() {
        handlePersonDeferred.reject({ name: 'ugly' });
      });
      expect(ui.nameFormGroupElement().hasClass('has-error')).toBe(true);
    });
  });

  function UiMap(element) {
    this.formElement = function() {
      return element.find('form');
    };

    this.fieldsetElement = function() {
      return element.find('fieldset');
    };

    this.nameFormGroupElement = function() {
      return element.find('.form-group.name');
    };

    this.nameInputElement = function() {
      return element.find('.form-group.name input');
    };

    this.nameHelpBlockElement = function() {
      return element.find('.form-group.name .help-block');
    };

    this.submitButtonElement = function() {
      return element.find('button[type="submit"]');
    };
  };
});
