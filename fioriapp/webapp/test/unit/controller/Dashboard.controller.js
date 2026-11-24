/*global QUnit*/

sap.ui.define([
	"fioriapp/controller/Dashboard.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Dashboard Controller");

	QUnit.test("I should test the Dashboard controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

	QUnit.test("Navigates to the details route when the dashboard button is pressed", function (assert) {
		var oAppController = new Controller();
		var oRouter = {
			navTo: function (sRoute) {
				assert.strictEqual(sRoute, "RouteDetails", "The details route is opened");
			}
		};
		oAppController.getOwnerComponent = function () {
			return {
				getRouter: function () {
					return oRouter;
				}
			};
		};

		oAppController.onPressNavigateToDetails();
	});

});
