var appRunnerFactory = require('../be-src/appRunnerFactory');
var TeambuildrClient = require('../be-test/teambuildrClient');

var CreatePersonPage = function() {
  this.name = element(by.css('.name input'));
  this.nameError = element(by.css('.name p'));

  this.position = element(by.css('.position input'));
  this.positionError = element(by.css('.position p'));

  this.city = element(by.css('.city input'));
  this.cityError = element(by.css('.city p'));

  this.state = element(by.css('.state input'));
  this.stateError = element(by.css('.state p'));

  this.phone = element(by.css('.phone input'));
  this.phoneError = element(by.css('.phone p'));

  this.email = element(by.css('.email input'));
  this.emailError = element(by.css('.email p'));

  this.newMembershipName = element(by.css('#new-membership-name'));
  this.newMembershipDropdown = element(by.css('ul.dropdown-menu'));
  this.newMembershipRole = element(by.css('#new-membership-role'));
  this.addMembership = element(by.css('#add-membership-button'));

  var self = this;
  this.newMembershipDropdownItem = function(index) {
    return self.newMembershipDropdown.all(by.css('li')).get(index);
  };

  this.create = element(by.css('#submit-person-button'));
};

describe('CreatePersonPage', function() {
  var appRunner;
  beforeEach(function(done) {
    appRunnerFactory().then(function(runner) {
      appRunner = runner;
      return runner.start().then(function() {
        return runner.reset();
      });
    }).finally(done);
  });

  afterEach(function(done) {
    appRunner.stop().finally(done);
    appRunner = null;
  });

  var createPersonPage;
  var client;
  beforeEach(function() {
    createPersonPage = new CreatePersonPage();
    client = new TeambuildrClient('http://localhost:3000/api/');
  });

  // TODO: there should be a default avatar image
  // TODO: there should be a randomize avatar button
  // TODO: the randomize avatar button should work
  // TODO: describe "team memberships" editor

  it('should have all fields empty', function() {
    browser.get('/people/create');
    expect(createPersonPage.name.getText()).toBe('');
    expect(createPersonPage.position.getText()).toBe('');
    expect(createPersonPage.city.getText()).toBe('');
    expect(createPersonPage.state.getText()).toBe('');
    expect(createPersonPage.phone.getText()).toBe('');
    expect(createPersonPage.email.getText()).toBe('');
  });

  it('should have "Create" button', function() {
    browser.get('/people/create');
    expect(createPersonPage.create.isPresent()).toBe(true);
  });

  it('should have validation errors when submitting the empty form', function() {
    browser.get('/people/create');
    createPersonPage.create.click();
    expect(createPersonPage.nameError.isPresent()).toBe(true);
    expect(createPersonPage.positionError.isPresent()).toBe(true);
    expect(createPersonPage.cityError.isPresent()).toBe(true);
    expect(createPersonPage.stateError.isPresent()).toBe(true);
    expect(createPersonPage.phoneError.isPresent()).toBe(true);
    expect(createPersonPage.emailError.isPresent()).toBe(true);
  });

  it('should create a person when all fields are OK', function() {
    protractor.promise.controlFlow().execute(function() {
      return client.createTeam({
        name: 'team A',
        url: 'http://example.org',
        slogan: 'team A slogan'
      });
    });

    protractor.promise.controlFlow().execute(function() {
      return client.createTeam({
        name: 'team B',
        url: 'http://example.org',
        slogan: 'team B slogan'
      });
    });

    var personDescription = {
      name: 'John',
      position: 'Developer',
      city: 'New York',
      state: 'NY',
      phone: '+123456789',
      email: 'john@john.com'
    };

    browser.get('/people/create');
    createPersonPage.name.sendKeys(personDescription.name);
    createPersonPage.position.sendKeys(personDescription.position);
    createPersonPage.city.sendKeys(personDescription.city);
    createPersonPage.state.sendKeys(personDescription.state);
    createPersonPage.phone.sendKeys(personDescription.phone);
    createPersonPage.email.sendKeys(personDescription.email);
    
    createPersonPage.newMembershipName.sendKeys('a');
    createPersonPage.newMembershipDropdownItem(0).click();
    createPersonPage.newMembershipRole.sendKeys('developer');
    createPersonPage.addMembership.click();

    createPersonPage.create.click();

    expect(browser.getLocationAbsUrl()).toBe('/people/1');

    protractor.promise.controlFlow().execute(function() {
      return client.getPeople().then(function(response) {
        var people = response.body;
        expect(people.length).toBe(1);

        var person = people[0];
        expect(person.name).toBe(personDescription.name);
        expect(person.position).toBe(personDescription.position);
        expect(person.city).toBe(personDescription.city);
        expect(person.state).toBe(personDescription.state);
        expect(person.phone).toBe(personDescription.phone);
        expect(person.email).toBe(personDescription.email);
        expect(person.memberships.length).toBe(1);
      });
    });
  });
});
