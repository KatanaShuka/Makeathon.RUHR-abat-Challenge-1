sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function(Controller) {
  "use strict";

  return Controller.extend("fioriapp.controller.Dashboard", {
    navTo: function(route) {
      this.getOwnerComponent().getRouter().navTo(route);
    },

    onShowCurrentEvents: function() {
      this.navTo("RouteCurrentEvents");
    },

    onShowDetails: function() {
      this.navTo("RouteDetails")
    }
  });
});