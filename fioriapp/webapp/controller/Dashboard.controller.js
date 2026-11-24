sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], function(Controller, History) {
  "use strict";

<<<<<<< HEAD
    return Controller.extend("fioriapp.controller.Dashboard", {
        onInit() {
        },

        onShowCurrentEvents() {
            this.getOwnerComponent().getRouter().navTo("RouteCurrentEvents");
        }
    });
=======
  return Controller.extend("fioriapp.controller.Dashboard", {
    navTo: function(route) {
      this.getOwnerComponent().getRouter().navTo(route);
    }
  });
>>>>>>> 9016abb72fe71a9f90a4d65038b33d729b056712
});