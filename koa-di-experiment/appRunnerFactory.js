var hinoki = require('hinoki');

module.exports = function(settings) {
  var container = makeContainer(settings);
  return hinoki.get(container, 'appRunner');

  function makeContainer(settings) {
    var container = {
      values: {
        Q: require('q'),
        serverDestroy: require('server-destroy'),
        Sequelize: require('sequelize'),
        koa: require('koa'),
        koaCompose: require('koa-compose'),
        koaBodyParser: require('koa-body-parser'),
        koaMount: require('koa-mount'),
        koaSend: require('koa-send'),
        KoaRouter: require('koa-router'),
        path: require('path'),
        connectionString: 'sqlite://my.db',
        port: (settings && settings.port) || 3000,
        something: (settings && settings.something) || 'hello there'
      },
      factories: {
        // DAL STUFF
        sequelize: require('./dao.js'),
        Note: function(sequelize) {
          return sequelize.models.Note;
        },
        Category: function(sequelize) {
          return sequelize.models.Category;
        },

        // STATIC STUFF
        staticMiddleware: function(KoaRouter, indexHtmlRoute) {
          var router = new KoaRouter();
          indexHtmlRoute(router);
          return router.middleware();
        },
        indexHtmlRoute: require('./indexHtmlRoute.js'),

        // API STUFF
        apiMiddleware: function(koaCompose, KoaRouter, koaBodyParser, routeA, routeB) {
          var router = new KoaRouter();
          routeA(router);
          routeB(router);

          return koaCompose([
            koaBodyParser(),
            router.middleware()
          ]);
        },
        routeA: require('./routeA.js'),
        routeB: require('./routeB.js'),

        // THE WHOLE WEBAPP
        app: function(koa, koaMount, staticMiddleware, apiMiddleware) {
          var app = koa();
          app.use(koaMount('/', staticMiddleware));
          app.use(koaMount('/api', apiMiddleware));
          return app;
        },

        appRunner: require('./appRunner.js')
      }
    };

    return container;
  };
};