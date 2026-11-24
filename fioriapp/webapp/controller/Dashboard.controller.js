sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], function(Controller, History) {
  "use strict";

  return Controller.extend("fioriapp.controller.Dashboard", {
    navTo: function(route) {
      this.getOwnerComponent().getRouter().navTo(route);
    },

    onShowCurrentEvents: function() {
      this.navTo("RouteCurrentEvents");
    },

    onShowDetails: function() {
      this.navTo("RouteDetails");
    }
  });
});