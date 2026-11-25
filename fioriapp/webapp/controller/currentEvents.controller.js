sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/vbm/Spot",
    "sap/ui/vbm/Route",
    "sap/ui/vbm/Spots",
    "sap/ui/vbm/Routes"
], (Controller, JSONModel, Spot, Route, Spots, Routes) => {
    "use strict";

    return Controller.extend("fioriapp.controller.currentEvents", {
        onInit() {
            const oViewModel = new JSONModel({
                mapCenter: "8.1;53.5;0",
                routes: [],
                events: []
            });
            this.getView().setModel(oViewModel, "map");

            this._portCoordinates = {
                PT_DEHAM: { longitude: 9.97, latitude: 53.54, name: "Hamburg" },
                PT_NLRTM: { longitude: 4.13, latitude: 51.95, name: "Rotterdam" },
                PT_BEANR: { longitude: 4.30, latitude: 51.32, name: "Antwerpen" },
                PT_DEBRV: { longitude: 8.58, latitude: 53.55, name: "Bremerhaven" },
                PT_GBFXT: { longitude: 1.33, latitude: 51.96, name: "Felixstowe" },
                PT_CNSHA: { longitude: 121.488, latitude: 31.239, name: "Shanghai" },
                PT_CNTAO: { longitude: 120.382, latitude: 36.066, name: "Qingdao" },
                PT_SGSIN: { longitude: 103.8198, latitude: 1.3521, name: "Singapore" },
                PT_ARBUE: { longitude: -58.3816, latitude: -34.6037, name: "Buenos Aires" },
                PT_COCTG: { longitude: -75.5144, latitude: 10.391, name: "Cartagena" },
                PT_UYMVD: { longitude: -56.1645, latitude: -34.9011, name: "Montevideo" },
                PT_VEPBL: { longitude: -68.003, latitude: 10.472, name: "Puerto Cabello" }
            };

            this._seaWaypointsToHamburg = {
                PT_BEANR: [
                    { longitude: 4.16, latitude: 51.36 },
                    { longitude: 3.75, latitude: 51.45 },
                    { longitude: 3.35, latitude: 51.55 },
                    { longitude: 3.15, latitude: 51.85 },
                    { longitude: 3.55, latitude: 52.15 },
                    { longitude: 4.00, latitude: 52.65 },
                    { longitude: 5.00, latitude: 53.25 },
                    { longitude: 6.30, latitude: 53.75 },
                    { longitude: 7.30, latitude: 54.05 },
                    { longitude: 7.80, latitude: 54.05 },
                    { longitude: 8.20, latitude: 53.95 },
                    { longitude: 8.70, latitude: 53.85 },
                    { longitude: 9.20, latitude: 53.70 }
                ],
                PT_NLRTM: [
                    { longitude: 3.95, latitude: 51.98 },
                    { longitude: 3.45, latitude: 52.05 },
                    { longitude: 3.45, latitude: 52.30 },
                    { longitude: 4.10, latitude: 52.75 },
                    { longitude: 5.00, latitude: 53.30 },
                    { longitude: 6.20, latitude: 53.75 },
                    { longitude: 7.30, latitude: 54.05 },
                    { longitude: 7.80, latitude: 54.05 },
                    { longitude: 8.20, latitude: 53.95 },
                    { longitude: 8.70, latitude: 53.85 },
                    { longitude: 9.20, latitude: 53.70 }
                ],
                PT_DEBRV: [
                    { longitude: 8.45, latitude: 53.65 },
                    { longitude: 8.25, latitude: 53.82 },
                    { longitude: 8.05, latitude: 53.92 },
                    { longitude: 8.25, latitude: 54.02 },
                    { longitude: 8.55, latitude: 54.04 },
                    { longitude: 8.75, latitude: 53.95 },
                    { longitude: 9.10, latitude: 53.82 },
                    { longitude: 9.45, latitude: 53.68 }
                ],
                PT_GBFXT: [
                    { longitude: 1.55, latitude: 51.95 },
                    { longitude: 1.80, latitude: 52.10 },
                    { longitude: 2.20, latitude: 52.25 },
                    { longitude: 2.90, latitude: 52.50 },
                    { longitude: 3.70, latitude: 52.85 },
                    { longitude: 4.80, latitude: 53.35 },
                    { longitude: 6.20, latitude: 53.80 },
                    { longitude: 7.30, latitude: 54.05 },
                    { longitude: 7.80, latitude: 54.05 },
                    { longitude: 8.20, latitude: 53.95 },
                    { longitude: 8.70, latitude: 53.85 },
                    { longitude: 9.30, latitude: 53.68 }
                ]
            };
        },

        onAfterRendering() {
            if (this._initialMapDataRendered) {
                return;
            }

            this._initialMapDataRendered = true;
            this._initialRenderTimer = setTimeout(() => {
                const oMap = this.byId("map");
                if (oMap && oMap.isRendered()) {
                    oMap.zoomToGeoPosition(9.97, 53.54, 4);
                }

                this.renderToursAndEvents([
                    { source: "PT_BEANR", destination: "PT_DEHAM", tourId: "Tour ANT-001" },
                    { source: "PT_NLRTM", destination: "PT_DEHAM", tourId: "Tour RTM-002" },
                    { source: "PT_DEBRV", destination: "PT_DEHAM", tourId: "Tour BRV-003" },
                    { source: "PT_GBFXT", destination: "PT_DEHAM", tourId: "Tour FXT-004" }
                ], [
                    { location: "PT_BEANR", title: "NAT", level: "3" },
                    { location: "PT_NLRTM", title: "WEA", level: "2" },
                    { location: "PT_GBFXT", title: "OPS", level: "1" },
                    { location: "PT_DEHAM", title: "WAR", level: "2" }
                ]);
            }, 0);
        },

        onExit() {
            if (this._initialRenderTimer) {
                clearTimeout(this._initialRenderTimer);
            }
        },

        /**
         * Draws tour routes and events on the map.
         * @param {Array} aTours Tour objects with source/destination port IDs
         * @param {Array} aEvents Event objects with location, title and level
         */
        renderToursAndEvents(aTours, aEvents) {
            const oMap = this.byId("map");
            if (!oMap) {
                return;
            }

            oMap.removeAllVos();

            const aRouteItems = [];
            const aPortItems = [];

            (aTours || []).forEach((oTour, iIndex) => {
                const oSource = this._getPort(oTour.sourcePort || oTour.source || oTour.source_port_location);
                const oDestination = this._getPort(oTour.destinationPort || oTour.destination || oTour.dest_port_location);
                if (!oSource || !oDestination) {
                    return;
                }

                const sSourceId = oTour.sourcePort || oTour.source || oTour.source_port_location;
                const sDestinationId = oTour.destinationPort || oTour.destination || oTour.dest_port_location;
                const aWaypoints = oTour.seaWaypoints || (
                    sDestinationId === "PT_DEHAM" ? this._seaWaypointsToHamburg[sSourceId] : null
                );
                if (!aWaypoints || !aWaypoints.length) {
                    return;
                }

                aPortItems.push(new Spot({
                    position: `${oSource.longitude};${oSource.latitude};0`,
                    text: oSource.name,
                    tooltip: `Start: ${oSource.name}`,
                    type: "Default",
                    alignment: "5"
                }));

                aRouteItems.push(new Route({
                    position: [
                        oSource,
                        ...aWaypoints,
                        oDestination
                    ].map((oPoint) => `${oPoint.longitude};${oPoint.latitude};0`).join(";"),
                    color: iIndex % 2 === 0 ? "RGB(0;112;192)" : "RGB(38;166;91)",
                    tooltip: `${oTour.tourId || "Tour"}: ${oSource.name} → ${oDestination.name}`,
                    linewidth: "5",
                    routetype: "Straight",
                    directionIndicator: true,
                    dotwidth: "8",
                    dotcolor: iIndex % 2 === 0 ? "RGB(0;112;192)" : "RGB(38;166;91)"
                }));
            });

            const oHamburg = this._getPort("PT_DEHAM");
            if (oHamburg) {
                aPortItems.push(new Spot({
                    position: `${oHamburg.longitude};${oHamburg.latitude};0`,
                    text: oHamburg.name,
                    tooltip: "Ziel: Hamburg",
                    type: "Default",
                    alignment: "5"
                }));
            }

            if (aRouteItems.length) {
                const oRoutes = new Routes();
                aRouteItems.forEach((oRoute) => oRoutes.addItem(oRoute));
                oMap.addVo(oRoutes);
            }

            const aEventItems = [];
            (aEvents || []).forEach((oEvent) => {
                const oPort = this._getPort(oEvent.location || oEvent.betroffene_Lokation_location);
                if (!oPort) {
                    return;
                }

                aEventItems.push(new Spot({
                    position: `${oPort.longitude};${oPort.latitude};0`,
                    text: oEvent.title || oEvent.ereignis || "Event",
                    tooltip: `${oEvent.title || oEvent.ereignis || "Event"} (${oPort.name}, Warnstufe ${oEvent.level || oEvent.warnstufe || "-"})`,
                    type: this._getEventType(oEvent.level || oEvent.warnstufe)
                }));
            });

            if (aPortItems.length) {
                const oPorts = new Spots();
                aPortItems.forEach((oSpot) => oPorts.addItem(oSpot));
                oMap.addVo(oPorts);
            }

            if (aEventItems.length) {
                const oEvents = new Spots();
                aEventItems.forEach((oSpot) => oEvents.addItem(oSpot));
                oMap.addVo(oEvents);
            }
        },

        _getPort(sLocation) {
            return sLocation ? this._portCoordinates[sLocation] : null;
        },

        _getEventType(vLevel) {
            const iLevel = Number(vLevel);
            if (iLevel === 3) {
                return "Error";
            }
            if (iLevel === 2) {
                return "Warning";
            }
            return "Success";
        }
    });
});