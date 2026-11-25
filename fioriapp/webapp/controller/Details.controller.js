sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("fioriapp.controller.Details", {
      onInit() {
      },

      onSelectionChange: function (oEvent) {

        const oItem = oEvent.getParameter("listItem");
        const aCells = oItem.getCells();

        const sStart = aCells[0].getText();
        const sEnd = aCells[1].getText();
        const sContainer = aCells[2].getText();

        let sStatus = "";

        const sIcon = aCells[3].getSrc();

        if (sIcon === "sap-icon://sys-enter") {
            sStatus = "Angekommen";
        } else if (sIcon === "sap-icon://warning") {
            sStatus = "Verspätet";
        } else if (sIcon === "sap-icon://accelerated") {
            sStatus = "Unterwegs";
        }

        this.byId("detailStart")
            .setText("Tour-Start: " + sStart);

        this.byId("detailEnd")
            .setText("Tour-End: " + sEnd);

        this.byId("detailContainer")
            .setText("Container: " + sContainer);

        this.byId("detailStatus")
            .setText("Status: " + sStatus);
      }
  });


});