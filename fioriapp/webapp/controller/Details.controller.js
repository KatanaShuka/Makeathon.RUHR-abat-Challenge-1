sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], (BaseController, MessageBox, JSONModel) => {
  "use strict";

  return BaseController.extend("fioriapp.controller.Details", {
      onInit() {
        this.getView().setModel(new JSONModel({ tours: [] }), "tours");
        this._loadTours();
      },

      async _loadTours() {
        const oTable = this.byId("details-table");
        oTable.setBusy(true);

        try {
          const oDatabaseModel = this.getOwnerComponent().getModel("db");
          const aTours = await this._readAll(oDatabaseModel, "/Tour", {
            $expand: "source_port,dest_port"
          });
          const aContainers = await this._readAll(oDatabaseModel, "/Container");
          const mContainersByTour = new Map();

          aContainers.forEach((oContainer) => {
            const sTourId = oContainer.tour_id_tour_id;
            if (!sTourId) {
              return;
            }

            const aTourContainers = mContainersByTour.get(sTourId) || [];
            aTourContainers.push(oContainer.bezeichnung);
            mContainersByTour.set(sTourId, aTourContainers);
          });

          const aTourRows = aTours.map((oTour) => ({
            id: oTour.tour_id,
            start: this._getPortLabel(oTour.source_port, oTour.source_port_location),
            end: this._getPortLabel(oTour.dest_port, oTour.dest_port_location),
            container: (mContainersByTour.get(oTour.tour_id) || []).join(", ") || "-",
            status: "Nicht hinterlegt"
          }));

          this.getView().getModel("tours").setProperty("/tours", aTourRows);
        } catch (oError) {
          MessageBox.error(`Die Touren konnten nicht geladen werden: ${oError.message}`);
        } finally {
          oTable.setBusy(false);
        }
      },

      async _readAll(oModel, sPath, mParameters) {
        const oBinding = oModel.bindList(sPath, undefined, undefined, undefined, mParameters);
        const aResults = [];
        const iPageSize = 100;
        let iStart = 0;

        try {
          while (true) {
            const aContexts = await oBinding.requestContexts(iStart, iPageSize);
            aResults.push(...aContexts.map((oContext) => oContext.getObject()));
            iStart += aContexts.length;

            if (aContexts.length < iPageSize) {
              return aResults;
            }
          }
        } finally {
          oBinding.destroy();
        }
      },

      _getPortLabel(oPort, sLocation) {
        if (oPort) {
          return oPort.city || oPort.name || oPort.location;
        }
        return sLocation || "-";
      },

      onSelectionChange(oEvent) {
        const oItem = oEvent.getParameter("listItem") || this.byId("details-table").getSelectedItem();
        const oContext = oItem && oItem.getBindingContext("tours");
        if (!oContext) {
          return;
        }

        const oTour = oContext.getObject();
        this.byId("details-card").setTitle(oTour.id);
        this.byId("details-card").setIntro("Tourdetails");
        this.byId("detailStart").setText(`Tour-Start: ${oTour.start}`);
        this.byId("detailEnd").setText(`Tour-End: ${oTour.end}`);
        this.byId("detailContainer").setText(`Container: ${oTour.container}`);
        this.byId("detailStatus").setText(`Status: ${oTour.status}`);
      }
  });


});