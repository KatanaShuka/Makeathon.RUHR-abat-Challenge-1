sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], (BaseController, MessageBox, JSONModel) => {
  "use strict";

  return BaseController.extend("fioriapp.controller.Details", {
    onInit() {
      this.getView().setModel(new JSONModel({
        routes: [],
        selectedRouteId: ""
      }), "routes");
      this.getView().setModel(new JSONModel({
        all: [],
        visible: []
      }), "tours");
      this._loadTours();
    },

    async _loadTours() {
      const oRoutePanel = this.byId("routeSelectorPanel");
      const oTable = this.byId("details-table");
      oRoutePanel.setBusy(true);
      oTable.setBusy(true);

      try {
        const oDatabaseModel = this.getOwnerComponent().getModel("db");
        const aRouteRecords = await this._readAll(oDatabaseModel, "/Route");
        const aTours = await this._readAll(oDatabaseModel, "/Tour", {
          $expand: "routen_id,source_port,dest_port"
        });
        const aContainers = await this._readAll(oDatabaseModel, "/Container");
        const aEvents = await this._readAll(oDatabaseModel, "/Event", {
          $expand: "betroffene_lokation,warnstufe,event_bezeichnung"
        });
        const aEventLinks = await this._readAll(oDatabaseModel, "/betrifft");
        const mContainersByTour = new Map();
        const mEventIdsByTour = new Map();

        aContainers.forEach((oContainer) => {
          const sTourId = oContainer.tour_id_tour_id;
          if (!sTourId) {
            return;
          }

          const aTourContainers = mContainersByTour.get(sTourId) || [];
          aTourContainers.push(oContainer.bezeichnung);
          mContainersByTour.set(sTourId, aTourContainers);
        });

        aEventLinks.forEach((oLink) => {
          const sTourId = this._getAssociationKey(oLink, "tour_id", "tour_id_tour_id", "tour_id");
          const sEventId = this._getAssociationKey(oLink, "event_id", "event_id_event_id", "event_id");
          if (!sTourId || !sEventId) {
            return;
          }

          const aEventIds = mEventIdsByTour.get(sTourId) || [];
          aEventIds.push(sEventId);
          mEventIdsByTour.set(sTourId, aEventIds);
        });

        const aNormalizedEvents = aEvents.map((oEvent) => {
          const oWarning = oEvent.warnstufe || {};
          const oEventCode = oEvent.event_bezeichnung || {};
          const oLocation = oEvent.betroffene_lokation || {};

          return {
            id: oEvent.event_id,
            locationId: oLocation.location || oEvent.betroffene_lokation_location,
            location: this._getPortLabel(oLocation, oEvent.betroffene_lokation_location),
            title: this._cleanDisplayText(
              oEventCode.ereignis || oEvent.event_bezeichnung_bezeichnung || "Äußeres Ereignis"
            ),
            level: Number(oWarning.warnstufe || oEvent.warnstufe_warnstufe || 0),
            impact: this._cleanDisplayText(oWarning.auswirkung || ""),
            period: [oEvent.zeitraum_von, oEvent.zeitraum_bis].filter(Boolean).join(" bis ")
          };
        });

        const aTourRows = aTours.map((oTour) => {
          const sTourId = oTour.tour_id;
          const sSourceId = this._getAssociationKey(
            oTour,
            "source_port",
            "source_port_location",
            "location"
          );
          const sDestinationId = this._getAssociationKey(
            oTour,
            "dest_port",
            "dest_port_location",
            "location"
          );
          const aLinkedEventIds = mEventIdsByTour.get(sTourId) || [];
          const aTourEvents = aNormalizedEvents.filter((oEvent) =>
            aLinkedEventIds.includes(oEvent.id)
          );
          const iWarningLevel = aTourEvents.reduce(
            (iHighest, oEvent) => Math.max(iHighest, oEvent.level),
            0
          );
          const oStatus = this._getStatus(iWarningLevel);
          const sRouteId = this._getAssociationKey(
            oTour,
            "routen_id",
            "routen_id_routen_id",
            "routen_id"
          );

          return {
            id: sTourId,
            shortId: sTourId.slice(0, 8).toUpperCase(),
            routeId: sRouteId || "-",
            routeLabel: sRouteId || "-",
            start: this._getPortLabel(oTour.source_port, sSourceId),
            end: this._getPortLabel(oTour.dest_port, sDestinationId),
            container: (mContainersByTour.get(sTourId) || []).join(", ") || "-",
            status: oStatus.text,
            statusState: oStatus.state,
            reason: aTourEvents.length
              ? aTourEvents.map((oEvent) => this._formatEventReason(oEvent)).join("; ")
              : "Keine zugeordneten Störungen."
          };
        });

        const mRouteCounts = new Map();
        aTourRows.forEach((oTour) => {
          mRouteCounts.set(oTour.routeId, (mRouteCounts.get(oTour.routeId) || 0) + 1);
        });

        const aRoutes = aRouteRecords.slice().sort((oFirst, oSecond) =>
          oFirst.routen_id.localeCompare(oSecond.routen_id)
        ).map((oRoute, iIndex) => {
          const sRouteId = oRoute.routen_id;
          const iTourCount = mRouteCounts.get(sRouteId) || 0;
          const sRouteLabel = `Route ${String(iIndex + 1).padStart(2, "0")}`;
          return {
            id: sRouteId,
            label: `${sRouteLabel} - ${iTourCount} ${iTourCount === 1 ? "Tour" : "Touren"}`,
            shortLabel: sRouteLabel
          };
        });
        const mRouteLabels = new Map(aRoutes.map((oRoute) => [oRoute.id, oRoute.shortLabel]));
        aTourRows.forEach((oTour) => {
          oTour.routeLabel = mRouteLabels.get(oTour.routeId) || oTour.routeId;
        });
        const sSelectedRouteId = aRoutes.length ? aRoutes[0].id : "";

        this.getView().getModel("tours").setProperty("/all", aTourRows);
        this.getView().getModel("routes").setData({
          routes: aRoutes,
          selectedRouteId: sSelectedRouteId,
          selectedTourCount: 0
        });
        this.byId("routeSelect").setSelectedKey(sSelectedRouteId);
        this._applyRouteFilter(sSelectedRouteId);
      } catch (oError) {
        MessageBox.error(`Routen und Touren konnten nicht geladen werden: ${oError.message}`);
      } finally {
        oRoutePanel.setBusy(false);
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

    _getAssociationKey(oRecord, sAssociation, sForeignKey, sTargetKey) {
      const oAssociation = oRecord[sAssociation];
      return (oAssociation && oAssociation[sTargetKey]) || oRecord[sForeignKey];
    },

    _getPortLabel(oPort, sLocation) {
      if (oPort) {
        return this._cleanDisplayText(oPort.city || oPort.name || oPort.location);
      }
      return sLocation || "-";
    },

    _cleanDisplayText(sText) {
      return typeof sText === "string" ? sText.replace(/^"(.*)"$/, "$1") : sText;
    },

    _getStatus(iWarningLevel) {
      if (iWarningLevel >= 3) {
        return { text: "Kritisch", state: "Error" };
      }
      if (iWarningLevel === 2) {
        return { text: "Verzögert", state: "Warning" };
      }
      if (iWarningLevel === 1) {
        return { text: "Vorwarnung", state: "Information" };
      }
      return { text: "Keine Störung", state: "Success" };
    },

    _formatEventReason(oEvent) {
      const aDetails = [oEvent.title];
      if (oEvent.location && oEvent.location !== "-") {
        aDetails.push(oEvent.location);
      }
      if (oEvent.period) {
        aDetails.push(oEvent.period);
      }
      if (oEvent.impact) {
        aDetails.push(oEvent.impact);
      }
      return aDetails.join(" - ");
    },

    _applyRouteFilter(sRouteId) {
      const aTours = this.getView().getModel("tours").getProperty("/all");
      const aVisibleTours = aTours.filter((oTour) => oTour.routeId === sRouteId);
      this.getView().getModel("tours").setProperty("/visible", aVisibleTours);
      this.getView().getModel("routes").setProperty("/selectedTourCount", aVisibleTours.length);
      this._resetTourDetails();
    },

    onRouteChange(oEvent) {
      const sRouteId = oEvent.getSource().getSelectedKey();
      this.getView().getModel("routes").setProperty("/selectedRouteId", sRouteId);
      this.byId("details-table").removeSelections(true);
      this._applyRouteFilter(sRouteId);
    },

    _resetTourDetails() {
      this.byId("details-card").setTitle("Tour auswählen");
      this.byId("details-card").setIntro("Bitte eine Tour aus der Tabelle auswählen");
      this.byId("detailTourId").setText("Tour-ID: -");
      this.byId("detailStart").setText("Tour-Start: -");
      this.byId("detailEnd").setText("Tour-Ende: -");
      this.byId("detailContainer").setText("Container: -");
      this.byId("detailStatus").setText("Keine Störung");
      this.byId("detailStatus").setState("None");
      this.byId("detailReason").setText("Bitte eine Tour auswählen.");
    },

    onSelectionChange(oEvent) {
      const oItem = oEvent.getParameter("listItem") || this.byId("details-table").getSelectedItem();
      const oContext = oItem && oItem.getBindingContext("tours");
      if (!oContext) {
        return;
      }

      const oTour = oContext.getObject();
      this.byId("details-card").setTitle(`Tour ${oTour.shortId}`);
      this.byId("details-card").setIntro(oTour.routeLabel);
      this.byId("detailTourId").setText(`Tour-ID: ${oTour.id}`);
      this.byId("detailStart").setText(`Tour-Start: ${oTour.start}`);
      this.byId("detailEnd").setText(`Tour-Ende: ${oTour.end}`);
      this.byId("detailContainer").setText(`Container: ${oTour.container}`);
      this.byId("detailStatus").setText(oTour.status);
      this.byId("detailStatus").setState(oTour.statusState);
      this.byId("detailReason").setText(oTour.reason.replace(/; /g, "\n"));
    }
  });
});
