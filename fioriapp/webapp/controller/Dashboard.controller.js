sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("fioriapp.controller.Dashboard", {
        onInit() {
        },

        onShowCurrentEvents() {
            this.getOwnerComponent().getRouter().navTo("RouteCurrentEvents");
        }
    });
});