"use strict";

angular
  .module("app", [
    "tmh.dynamicLocale",
    "jm.i18next",
    "720kb.datepicker",
    "angular-click-outside",
    "angular-clipboard",
    "angular-loading-bar",
    "angular-google-analytics",
    "angular-sortable-view",
    "tandibar/ng-rollbar",
    "perfect_scrollbar",
    "colorpicker.module",
    "currencyMask",
    "ngAnimate",
    "ngDialog",
    "ngFileUpload",
    "ngSanitize",
    "ngStorage",
    "restangular",
    "toaster",
    "ui.bootstrap",
    "ui.paging",
    "ui.directives",
    "ui.gravatar",
    "ui.router",
    "ui.select",
    "ui.load",
    "app.localService",
    "app.localeService",
    "app.historyService",
    "app.authService",
    "app.notificationService",
    "app.uploadService",
    "app.topupService",
    "app.bankService",
    "app.addressService",
    "app.countryService",
    "app.timezoneService",
    "app.roleService",
    "app.urlService",
    "app.refunds",
    "app.settlementService",
    "app.amplitudeService",
    "app.dateService",
    "app.preferencesService",
    "app.onboarding3Service",
    "app.apiFactories",
    "app.utilities",
    "app.access",
    "app.home",
    "app.onboarding",
    "app.transactions",
    "app.transaction-splits",
    "app.charges",
    "app.customers",
    "app.pages",
    "app.products",
    "app.orders",
    "app.plans",
    "app.storefronts",
    "app.subscriptions",
    "app.subscribers",
    "app.payouts",
    "app.transfers",
    "app.transfer-recipients",
    "app.invoices",
    "app.audit-logs",
    "app.search",
    "app.settings",
    "app.compliance",
    "app.setup",
    "app.sessions",
    "app.subaccounts",
    "app.customer-insights",
    "app.balance-history",
    "app.disputes",
    "app.direct-debit",
    "app.terminals",
    "app.zendeskService",
    "modal.controllers",
    "app.support",
    "app.file-view",
    "app.fileService",
    "app.consent",
    "app.campaignService",
    "app.mandates",
    "app.corporateCards",
    "onboardingv3",
    "app.compliancev3",
    "app.personCompliance",
    "app.preauthorizations",
  ])
  .constant("DEFAULTS", {
    baseURL: settings.baseApiUrl,
    liveURL: settings.liveApiUrl,
    mockURL: settings.mockApiUrl,
    legacyURL: settings.coreAPIUrl,
    inlineURL: settings.inlineURL,
    environment: settings.environment,
    landingPage: settings.landingPage,
    baseStorefrontURL: settings.baseStorefrontURL,
    pusherKey: settings.pusherKey,
    externalLinks: settings.externalLinks || {},
    goLiveTimeInHours: settings.goLiveTimeInHours,
    rollbarAccessToken: settings.rollbarAccessToken,
    datadog: settings.datadog,
    minimumPayment: {
      NGN: 100,
      GHS: 2,
      USD: 1,
      ZAR: 1,
    },
    minimumTransfer: {
      NGN: 100,
      GHS: 1,
    },
  })
  .config([
    "tmhDynamicLocaleProvider",
    "$urlRouterProvider",
    "$httpProvider",
    "RestangularProvider",
    "$locationProvider",
    "$stateProvider",
    "ngDialogProvider",
    "gravatarServiceProvider",
    "$provide",
    "AnalyticsProvider",
    "RollbarProvider",
    "DEFAULTS",
    function (
      tmhDynamicLocaleProvider,
      $urlRouterProvider,
      $httpProvider,
      RestangularProvider,
      $locationProvider,
      $stateProvider,
      ngDialogProvider,
      gravatarServiceProvider,
      $provide,
      AnalyticsProvider,
      RollbarProvider,
      DEFAULTS
    ) {
      tmhDynamicLocaleProvider.localeLocationPattern(
        "/assets/angular-locales/{{locale}}.js"
      );

      const defaultPath = /^\/$|^$/; // matches both '/' and '' paths.
      $urlRouterProvider
        .when(defaultPath, [
          "$state",
          ($state) => {
            $state.go("access.login");
          },
        ])
        .when("/balance-history", [
          "$state",
          ($state) => {
            $state.go("balance-history.list");
          },
        ])
        .when("/terminals", [
          "$state",
          ($state) => {
            $state.go("virtual-terminals.list");
          },
        ])
        .when("/settings/request-go-live", [
          "$state",
          ($state) => {
            $state.go("app.settings.activate");
          },
        ])
        .when("/income", [
          "$state",
          ($state) => {
            $state.go("payouts.list");
          },
        ])
        .when("/income/:id", [
          "$state",
          "$match",
          ($state, $match) => {
            $state.go("payouts.one", $match);
          },
        ])
        .when("/settings/developer", [
          "$state",
          ($state) => {
            $state.go("app.settings.developers");
          },
        ])
        .otherwise(($injector) => {
          const $state = $injector.get("$state");
          $state.go("app.404");
        });

      ngDialogProvider.setDefaults({
        className: "ngdialog-theme-plain",
        showClose: false,
      });

      gravatarServiceProvider.defaults = {
        size: 100,
        default: "404",
        secure: true,
      };

      $httpProvider.defaults.useXDomain = true;
      delete $httpProvider.defaults.headers.common["X-Requested-With"];

      RestangularProvider.addResponseInterceptor(function (
        data,
        operation,
        what,
        url,
        response,
        deferred
      ) {
        if (data && data.response) {
          var returnedData = data.response.data;
          if (data.response.meta) returnedData.meta = data.response.meta;
          return returnedData;
        } else {
          return data;
        }
      });

      $stateProvider
        .state("app", {
          abstract: true,
          templateUrl: "components/layout/base.html",
          data: {
            authenticable: true,
          },
        })
        .state("app.downloads", {
          title: "Downloads",
          url: "/downloads/*path",
          pageTrack: "/downloads",
          resolve: {
            downloadPath: [
              "$state",
              "$stateParams",
              "API",
              "Notification",
              function ($state, $stateParams, $API, Notification) {
                return $API
                  .all("download_url")
                  .post({ storage_key: $stateParams.path })
                  .then((response) => response.data && response.data.path)
                  .catch((error) => {
                    Notification.error("Could not download file", error);
                    $state.go("app.404");
                  });
              },
            ],
          },
          controller: [
            "$state",
            "downloadPath",
            ($state, downloadPath) => {
              const link = document.createElement("a");
              link.download = window.name;
              link.href = downloadPath;
              link.click();
              $state.go("app.home", {}, { location: "replace" });
            },
          ],
        })
        .state("app.permissions", {
          title: "Your Permissions",
          url: "/permissions?denied",
          pageTrack: "/permissions",
          templateUrl: "/modules/access/permissions.html",
          controller: "PermissionsCtrl",
        })
        .state("app.404", {
          title: "404",
          url: "/404",
          templateUrl: "/modules/access/404.html",
        });

      // Cache busting
      var cacheBuster = Date.now().toString();

      function templateFactoryDecorator($delegate) {
        var fromUrl = angular.bind($delegate, $delegate.fromUrl);
        $delegate.fromUrl = function (url, params) {
          if (url !== null && angular.isDefined(url) && angular.isString(url)) {
            url += url.indexOf("?") === -1 ? "?" : "&";
            url += "v=" + cacheBuster;
          }

          return fromUrl(url, params);
        };

        return $delegate;
      }

      $provide.decorator("$templateFactory", [
        "$delegate",
        templateFactoryDecorator,
      ]);

      $provide.factory("setTimezone", [
        () =>
          function setTimezone(timezone = "UTC") {
            return $provide.decorator("dateFilter", [
              "$delegate",
              ($delegate) =>
                function dateFilter(date, format, timezoneFromFilter) {
                  if (timezoneFromFilter) {
                    return $delegate(date, format, timezoneFromFilter);
                  }

                  return $delegate(date, format, timezone);
                },
            ]);
          },
      ]);

      // Google Analytics
      AnalyticsProvider.setAccount(settings.trackingID)
        .ignoreFirstPageLoad(true)
        .setPageEvent("$stateChangeSuccess")
        .trackPages(settings.liveDeployment);

      const isProduction = DEFAULTS.environment === "production";
      const isLocalhost = ["localhost", "127.0.0.1"].includes(
        window.location.hostname
      );

      if (isProduction) {
        RollbarProvider.init({
          accessToken: DEFAULTS.rollbarAccessToken,
          captureUncaught: false,
          captureUnhandledRejections: false,
          scrubTelemetryInputs: true,
          payload: {
            environment: DEFAULTS.environment,
            javascript: {
              source_map_enabled: true,
            },
          },
        });
      }

      if (!isLocalhost) {
        DD_RUM.onReady(() => {
          DD_RUM.init({
            clientToken: DEFAULTS.datadog.clientToken,
            applicationId: DEFAULTS.datadog.applicationId,
            site: "datadoghq.eu",
            env: DEFAULTS.datadog.env,
            service: "merchant-dashboard",
            trackInteractions: true,
            sampleRate: isProduction ? 2 : 100,
            resourceSampleRate: isProduction ? 2 : 100,
            beforeSend: (event) => {
              event.view.url = event.view.url.replace("#/", "");
            },
          });
        });
      }
    },
  ])
  .run([
    "$rootScope",
    "$location",
    "$state",
    "$timeout",
    "$stateParams",
    "DEFAULTS",
    "toaster",
    "Auth",
    "Session",
    "ngDialog",
    "Analytics",
    "PendingDisputes",
    "SettlementAccountData",
    "LocalService",
    "AmplitudeService",
    function (
      $rootScope,
      $location,
      $state,
      $timeout,
      $stateParams,
      DEFAULTS,
      toaster,
      Auth,
      Session,
      ngDialog,
      Analytics,
      PendingDisputes,
      SettlementAccountData,
      LocalService,
      AmplitudeService
    ) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      $rootScope.Date = Date;
      $rootScope.DEFAULTS = DEFAULTS;
      $rootScope.moment = moment;
      const { setActiveUser, logEvent } = AmplitudeService;

      function requiresAuthentication(state) {
        return state.data && state.data.authenticable;
      }

      function getParameters(params, previousState) {
        if (!(previousState || {}).name && _.isEmpty(params)) {
          return _.extend(params, $location.search());
        } else {
          return params;
        }
      }

      const getFilters = (key) => {
        const filter = LocalService.get(key, { parse: false });
        return filter ? `(${filter})` : "";
      };

      // Users can save a default filter on the Transfers and Transactions pages
      // This checks for a default filter and uses it to build the URL
      // It falls back to the default transaction filter when there's no saved filter
      const fallbackTransactionFilter = "({ status: 'success' })";

      $rootScope.routes = {
        transactions: `transactions.list${
          getFilters("default_transaction_filters") || fallbackTransactionFilter
        }`,
        transfers: `transfers.list${getFilters("default_transfer_filters")}`,
        preauthorizations: "preauthorizations.list",
      };

      $rootScope.openHelpDesk = (params = {}) => {
        $rootScope.$broadcast("helpdesk:open", params);
      };

      $rootScope.closeHelpDesk = (params = {}) => {
        $rootScope.$broadcast("helpdesk:close", params);
      };

      $rootScope.$on(
        "$stateChangeStart",
        function (event, toState, toParams, fromState, fromParams) {
          $rootScope.showLoadingIcon = true;
          $rootScope.sidebarVisible = false;
          $rootScope.closeHelpDesk();
          logEvent("page_load", {
            pageName: $state.current.name,
            state: "started",
          });

          if (toState.redirectTo) {
            event.preventDefault();
            $state.go(toState.redirectTo, getParameters(toParams, fromState), {
              reload: true,
              inherit: true,
              notify: true,
            });
            return;
          }

          if (requiresAuthentication(toState)) {
            Session.validate(toState, event)
              .then(function (session) {
                if (!session.account) {
                  if (toState.name === "setup.new") return;

                  event.preventDefault();
                  $state.go("setup.new");
                  return;
                }
              })
              .catch(function (error) {
                if (error == "Token Expired") {
                  return Auth.refreshToken().then(function () {
                    $state.go(toState, toParams);
                  });
                } else if (
                  error === "No User Information" ||
                  error === "No Account Information"
                ) {
                  return Auth.refreshSession().then(function () {
                    const integration = Session.get("account");
                    const user = Session.get("user");
                    setActiveUser(user, integration);
                    $state.go(toState, toParams);
                  });
                } else if (error === "No Businesses Available") {
                  event.preventDefault();
                  $state.go("setup.new");
                  return;
                } else if (error === "Session Timed Out") {
                  return Auth.reauthenticate().then(function () {
                    $state.go(toState, toParams);
                  });
                } else if (error === "Permission Denied") {
                  event.preventDefault();
                  $state.go(toState.fallback || "app.permissions", {
                    denied: toState.title,
                  });
                  return;
                } else {
                  return Promise.reject();
                }
              })
              .catch(function (error) {
                Session.end();
                LocalService.set("redirectParams", getParameters(toParams));
                $state.go("access.login", {
                  next: toState.name,
                });
              });
            return;
          }

          const previousState = fromState.name;
          const regexForStatesThatTriggerLeaveAccountModalInfinitely =
            /^(access|terminal|transfer-recipients|transactions|disputes|transfers|refunds|mandates|corporate-cards|app\.settings)/;

          if (
            toState.requiresLogout &&
            Session.isActive() &&
            previousState &&
            !previousState.match(
              regexForStatesThatTriggerLeaveAccountModalInfinitely
            )
          ) {
            event.preventDefault();
            ngDialog
              .openConfirm({
                template: "/modules/access/modals/leave-account.html",
              })
              .then(() => {
                Session.end();
                if (toState.name === "access.mfa") {
                  $state.go("access.login", toParams);
                } else {
                  $state.go(toState, toParams);
                }
              });
          }
        }
      );

      $rootScope.$on(
        "$stateChangeSuccess",
        function (event, toState, toParams, fromState, fromParams) {
          $rootScope.showLoadingIcon = false;
          var params = _.omit($stateParams, "page");
          $rootScope.$state.activeParams = _.some(_.values(params));

          if ($rootScope.onSuccess) {
            $rootScope.onSuccess();
            $rootScope.onSuccess = null;
          }

          if (fromState.name !== toState.name) {
            logEvent("Page load complete");
          }
        }
      );

      $rootScope.$on(
        "$stateChangeError",
        function (event, toState, toParams, fromState, fromParams, error) {
          const errorMessage = navigator.onLine
            ? error.data && error.data.message
            : "Your computer seems to be offline, please reconnect and try again.";

          toaster.error({
            title: "An error occurred",
            body: errorMessage,
          });

          logEvent("Page load failed", { Error: errorMessage });
        }
      );

      $rootScope.$on("ngDialog.templateLoading", function () {
        $rootScope.showDialogLoader = true;
      });

      $rootScope.$on("ngDialog.templateLoaded", function () {
        $rootScope.showDialogLoader = false;
      });

      $rootScope.listenWithPusher = function (channel) {
        var pusher = new Pusher(DEFAULTS.pusherKey, {
          cluster: "eu",
        });

        var channel = pusher.subscribe(channel);

        channel.bind("pusher:subscription_succeeded", function (response) {
          console.log("listening to pusher"); // eslint-disable-line no-console
        });
      };
    },
  ])
  .controller("AppCtrl", [
    "$scope",
    "tmhDynamicLocale",
    "$location",
    "$state",
    "$stateParams",
    "$rootScope",
    "Auth",
    "Session",
    "API",
    "Notification",
    "AmplitudeService",
    "$timeout",
    "OrderFactory",
    "setTimezone",
    "TimezoneService",
    "MicroFrontendService",
    "CampaignService",
    function (
      $scope,
      tmhDynamicLocale,
      $location,
      $state,
      $stateParams,
      $rootScope,
      Auth,
      Session,
      $API,
      Notification,
      AmplitudeService,
      $timeout,
      OrderFactory,
      setTimezone,
      TimezoneService,
      MicroFrontendService,
      CampaignService
    ) {
      const { marketingCampaigns } = CampaignService;
      $scope.getMarketingCampaign = () => marketingCampaigns[$stateParams.ref];

      window.addEventListener("message", ({ data }) => {
        if (data.message === "MFA_NON_COMPLIANT_USER") {
          $state.go("access.access-denied", {
            reason: "no-mfa",
          });
        } else if (data.message === "MFE_RECORD_COUNT") {
          $timeout(() => {
            $rootScope.pageRecordCount = data.value;
          }, 0);
        }
      });

      $scope.integrationSearch = {};
      $scope.clearSearch = () => {
        $scope.integrationSearch.business_name = "";
      };

      const { setActiveUser, logEvent } = AmplitudeService;

      $scope.logEvent = (eventName, eventProperties) => {
        logEvent(eventName, eventProperties);
      };

      window.isMfeRoot = true;
      MicroFrontendService.load()
        .then(() => {
          $timeout(() => {
            $scope.mfeServiceReady = true;
          });
        })
        .catch((error) => {
          console.error(error); // eslint-disable-line no-console
          $timeout(() => {
            $scope.mfeServiceReady = false;
          });
        });

      const recognizedOrganizationSlugs = ["studio", "dashboard", "localhost"];
      const organizationSlug = window.location.hostname.split(".")[0];
      $scope.isAggregator =
        !recognizedOrganizationSlugs.includes(organizationSlug);

      $rootScope.$on("sessionUpdated", () => {
        window.postMessage(
          {
            message: "MFE_ROOT_SESSION_UPDATED",
          },
          "*"
        );
        if ($rootScope.User) {
          const timezonePreference =
            $rootScope.User.dashboard_preferences &&
            $rootScope.User.dashboard_preferences.timezone;
          setTimezone(timezonePreference);

          TimezoneService.getTimezones().then(() => {
            const browserTimezone =
              Intl.DateTimeFormat().resolvedOptions().timeZone;
            const browserTimezoneDetails =
              TimezoneService.getTimezoneDetailsByRegion(browserTimezone) || {
                abbreviation: null,
              };
            const isBrowserThePreferredTimezone =
              timezonePreference === "browser";

            $scope.currentTimezone = isBrowserThePreferredTimezone
              ? browserTimezoneDetails.abbreviation
              : timezonePreference;
          });
        }
      });

      window.zE(() => {
        // Hide the default zendesk widget
        window.zE.hide();
      });
      $scope.isLoggedIn = () => Session.isActive();

      if ($scope.isAggregator) {
        let organizationData;

        if (!organizationData) {
          $API
            .one("organization", organizationSlug)
            .get()
            .then((response) => {
              organizationData = response.data;
              $scope.organizationData = response.data;
            })
            .catch(() => {
              // do nothing
            });
        }
      }

      // Config
      $scope.app = {
        name: "Paystack Dashboard",
        version: "1.0.0",
        slogan: "Paylater Dashboard",
      };

      if (window.i18next) {
        /* setting language to undefined enables language detection to take
          effect hence setting the language to the broswer language
        */
        const language = settings.I18N_ENABLED
          ? undefined
          : settings.I18N_DEFAULT_LOCALE || "en";

        window.i18next
          .use(window.i18nextXHRBackend)
          .use(window.i18nextBrowserLanguageDetector)
          .init(
            {
              lng: language,
              fallbackLng: [settings.I18N_DEFAULT_LOCALE],
              load: "languageOnly",
              nsSeparator: "|",
              detection: {
                order: ["navigator", "localStorage"],
                caches: ["localStorage"],
              },
              interpolation: {
                format: function (value, format, lng) {
                  if (
                    (value instanceof Date || moment(value).isValid()) &&
                    format !== "number"
                  ) {
                    return moment(value).format(format);
                  }
                  if (format === "number") {
                    return new Intl.NumberFormat(lng).format(value);
                  }
                  return value;
                },
              },
              backend: {
                // lng(language): Language to use
                loadPath: "api/locales/{{lng}}/translations.json",
              },
            },
            function (err, t) {
              console.log("resources loaded"); // eslint-disable-line no-console
            }
          );

        $scope.i18nextReady = false;
        window.i18next.on("languageChanged", function (lng) {
          const languageIsEnglish = lng.startsWith("en");
          const defaultLanguage = languageIsEnglish ? "en" : lng;

          tmhDynamicLocale.set(defaultLanguage);
          moment.locale(defaultLanguage);
          $scope.i18nextReady = true;
        });
      }

      // Notifications
      $scope.Notification = Notification;

      // Underscore
      $scope._ = _;

      // Filter function
      $scope.clearFilters = function () {
        $state.go(
          $state.current,
          {},
          {
            reload: true,
            inherit: false,
          }
        );
      };

      $scope.filter = function (attribute, value, options) {
        var options = options || {};
        var params = _.clone($stateParams) || {};
        if (attribute && value) {
          if (options.date) {
            value = new Date(value).toISOString();
          }
          params[attribute] = value;
        }
        if (attribute && !value) params[attribute] = undefined;
        params.page = null;
        $state.go($state.current, params, {
          reload: true,
          inherit: true,
          notify: true,
        });
      };

      $scope.filterSearch = function (params) {
        $state.go("app.search", params || {});
        logEvent("Used search", { params });
      };

      $scope.reloadWithParams = function (params) {
        const newParams = {
          ...$state.params,
          ...params,
          next: null,
          previous: null,
        };
        $state.go($state.current, newParams, {
          reload: true,
          inherit: false,
          notify: true,
        });
        logEvent("Used filter", { params: newParams });
      };

      $scope.goToPage = function (page) {
        var params = _.clone($stateParams) || {};
        params.page = page;
        $state.go($state.current, params, {
          reload: true,
          inherit: true,
          notify: true,
        });
        logEvent("Used pagination", { params });
      };

      $scope.queryActiveFilters = function (parameters) {
        var formattedParameters = _.map(parameters, function (parameter) {
          if (typeof parameter === "object") {
            return parameter.key;
          } else {
            return parameter;
          }
        });

        var availableParameters = _.pick($stateParams, formattedParameters);
        var activeParameters = _.pick(availableParameters, _.identity);
        var activeFilters = _.keys(activeParameters);

        // Check if there's an overriding name for the filter
        activeFilters = _.map(activeFilters, function (filter) {
          var parameterObject = _.find(parameters, function (parameter) {
            return typeof parameter === "object" && parameter.key === filter;
          });
          return parameterObject ? parameterObject.name : filter;
        });

        var activeFilterValues = Object.keys(activeParameters).map(function (
          key
        ) {
          return {
            key,
            value: activeParameters[key],
          };
        });

        $rootScope.$state.activeFilters = activeFilters;
        $rootScope.$state.activeFilterValues = activeFilterValues;
      };

      $scope.queryProductFilters = function (parameters) {
        if ($stateParams.active === "true") {
          $stateParams.active = undefined;
        }

        var formattedParameters = _.map(parameters, function (parameter) {
          if (typeof parameter === "object") {
            return parameter.key;
          } else {
            return parameter;
          }
        });

        var availableParameters = _.pick($stateParams, formattedParameters);
        var activeParameters = _.pick(availableParameters, _.identity);
        var activeFilters = _.keys(activeParameters);

        // Check if there's an overriding name for the filter
        activeFilters = _.map(activeFilters, function (filter) {
          var parameterObject = _.find(parameters, function (parameter) {
            return typeof parameter === "object" && parameter.key === filter;
          });
          return parameterObject ? parameterObject.name : filter;
        });

        var activeFilterValues = Object.keys(activeParameters).map(function (
          key
        ) {
          return {
            key,
            value: activeParameters[key],
          };
        });

        $rootScope.$state.activeFilters = activeFilters;
        $rootScope.$state.activeFilterValues = activeFilterValues;
      };

      $rootScope.queryActiveFilters = $scope.queryActiveFilters;
      $rootScope.queryProductFilters = $scope.queryProductFilters;

      $scope.supportsCurrency = function (currency) {
        return _.contains($rootScope.Business.allowed_currencies, currency);
      };

      //Logout
      $rootScope.logout = function () {
        $rootScope.history = [];
        Session.end();
        $state.go("access.login");

        // log logout even to amplitude
        logEvent("Logged out");
      };

      // Go to parent state
      function goToParentState() {
        var path = $location.path().split("/");
        var parent = "/" + path[1];
        if ($location.path() === parent || parent === "/terminals") {
          $state.reload();
        } else {
          $location.path(parent);
        }
      }

      /**
       * Switch State
       * redirect {Object} - Specifies the next page
       * reload {Boolean} - Specifies if the app should reload
       */
      $rootScope.switchState = function switchState(redirect, reload = false) {
        const current_state = $rootScope.User.display_state;
        const to_state = current_state == "live" ? "test" : "live";
        return Auth.switchState(current_state, to_state).then(function () {
          window.postMessage(
            {
              message: "MFE_ROOT_RESET_ALL_QUERIES",
            },
            "*"
          );
          Notification.success(
            "Switched Integration",
            "You're now working in the " + to_state + " state"
          );
          if (redirect) {
            $state.go(redirect.state, redirect.params, { reload });
          } else {
            goToParentState();
          }
        });
      };

      $rootScope.switchIntegration = function (account) {
        Auth.switchIntegration(account).then(function () {
          Notification.success(
            "Accounts Switched",
            "You are now using the " + account.business_name + " account"
          );
          $rootScope.switchingAccount = null;
          $rootScope.showLoadingIcon = false;
          const integration = Session.get("account");
          const user = Session.get("user");

          // Amplitude functions
          logEvent("Switched integration");
          setActiveUser(user, integration);

          goToParentState();
        });
      };

      $rootScope.getPendingOrdersCount = () => {
        if (
          !$rootScope.User ||
          !$rootScope.User.hasPermission("product-view")
        ) {
          return;
        }

        OrderFactory.fetchPendingOrdersCount().then((pendingOrdersCount) => {
          $rootScope.pendingOrdersCount = pendingOrdersCount;
        });
      };
    },
  ])
  .controller("PermissionsCtrl", [
    "LocalAPI",
    "Session",
    "$scope",
    "$i18next",
    function (LocalAPI, Session, $scope, $i18next) {
      $scope.articleLink = settings.externalLinks
        ? settings.externalLinks.newPermissions
        : "";
      LocalAPI.all("permissions")
        .getList()
        .then(function (permissionGroups) {
          $scope.availablePermissions = [];
          $scope.unavailablePermissions = [];

          _.each(permissionGroups, function (group) {
            _.each(group.permissions, function (permission) {
              const translatedPermission = i18next.t(
                `permissions.${permission.key}`
              );

              if (Session.hasPermission(permission.key)) {
                $scope.availablePermissions.push(translatedPermission);
              } else {
                $scope.unavailablePermissions.push(translatedPermission);
              }
            });
          });
        });
    },
  ]);
