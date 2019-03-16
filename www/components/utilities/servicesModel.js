var Network_Error = 0;
var Update_Error_Check = false;
var isZoneLMPFiveMinuteIntervalDataReceived = null;
var isDemandFiveMinuteIntervalDataReceived = null;
var isRegionsDemandFiveMinuteIntervalDataReceived = null;
var isOperationalReservesDataReceived = null;
var isDispatchedReservesDataReceived = null;
var isControlAreasFiveMinuteIntervalDataReceived = null;
var isGenerationalFuelMixDataReceived = null;

var servicesModel = {
    zoneData: {},
    serviceUrls: [],
    serviceUpdateURL: [],
    epServiceURLs: [],
    getServiceData: function (type) {
        servicesModel.serviceUrls['zone'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAllZoneLMPs';
        servicesModel.serviceUrls['tie'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAllTieFlows';
        servicesModel.serviceUrls['aggregateZones'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getZoneWiseAggregateLMPs';
        servicesModel.serviceUrls['analytics'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/addAnalyticData';
        servicesModel.serviceUrls['updateSendingCheck'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getNewestUpdatedDates';
        servicesModel.serviceUrls['allRegionsDemandGraph'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAllRegionsDemandGraphPointsWithFiveMinuteInterval';
        var deviceuuid = localStorage.getItem("deviceuuId");
        $.ajax({
            type: "POST",
            async: true,
            url: servicesModel.serviceUrls[type],
            dataType: 'json',
            // timeout: 15000,
            contentType: "application/json; charset=utf-8",
            headers: {
                'Origin': 'file:///'
            },
            data: JSON.stringify({
                "udid": deviceuuid,
                "dayWiseDataUser": "dayWiseDataUser"
            }),
            success: function (data) {
                if (type == "zone") {
                    if (!jQuery.isEmptyObject(data) && (localStorage.getItem("isZoneLMPFiveMinuteIntervalDataReceived") == null ||
                        data.Zone_LMP_Last_Updated_Date != dbapp.zoneData.Zone_LMP_Last_Updated_Date)) {
                        try {
                            SpinnerDialog.show();
                        } catch (e) { }
                        // dbapp.zoneData = data;
                        updatingZoneLMPAndZoneTrendAndZoneLists(data);
                    }
                } else if (type == "allRegionsDemandGraph") {
                    if (!jQuery.isEmptyObject(data) && (localStorage.getItem("isRegionsDemandFiveMinuteIntervalDataReceived") == null ||
                        (localStorage.getItem("isRegionsDemandFiveMinuteIntervalDataReceived") == "true" &&
                            !jQuery.isEmptyObject(dbapp.allRegionsDemand.allRegionsDemandGraphLastUpdatedDate)
                            && (data.allRegionsDemandGraphLastUpdatedDate != dbapp.allRegionsDemand.allRegionsDemandGraphLastUpdatedDate
                                || data.allZonesDemandGraphLastUpdatedDate != dbapp.allRegionsDemand.allZonesDemandGraphLastUpdatedDate)))) {
                        try {
                            SpinnerDialog.show();
                        } catch (e) { }
                        dbapp.allRegionsDemand = data;
                        updatingRegionsDemandGraphdata(data);
                    }
                } else if (type = "tie") {
                    if (!jQuery.isEmptyObject(data) &&
                        data.Tie_Flow_Last_Updated_Date != dbapp.tieData.Tie_Flow_Last_Updated_Date) {
                        try {
                            SpinnerDialog.show();
                        } catch (e) { }
                        // dbapp.tieData = data;
                        updatingTieData(data);
                    }
                }
                try {
                    SpinnerDialog.hide();
                } catch (e) { }
            },
            error: function (r, t, e) {
                try {
                    if (t === 'timeout') {
                        if (type == "zone")
                            navigator.notification.alert("Zone LMP is not updated due to network timeout.", null, "PJM Now", "OK");
                        if (type == "allRegionsDemandGraph")
                            navigator.notification.alert("Demand is not updated due to network timeout.", null, "PJM Now", "OK");
                        if (type == "tie")
                            navigator.notification.alert("Tie Flows is not updated due to network timeout.", null, "PJM Now", "OK");
                    } else {
                        if (!isOnline()) {
                            navigator.notification.alert("The Internet connection appears to be offline.", null, "PJM Now", "OK");
                        } else {
                            navigator.notification.alert(networkProblemMessage, null, "PJM Now", "OK");
                        }
                    }
                } catch (error) { }
            },
            beforeSend: function (xhr, settings) { }
        });
    },

    getEPUpdates: function (type, dateToUpdate) {
        servicesModel.epServiceURLs['regions'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAllRegions';
        servicesModel.epServiceURLs['states'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAllStates';
        servicesModel.epServiceURLs['messageTypes'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAllEPTypes';

        var deviceuuid = localStorage.getItem("deviceuuId");
        $.ajax({
            type: "POST",
            async: true,
            url: servicesModel.epServiceURLs[type],
            dataType: 'json',
            timeout: 15000,
            contentType: "application/json; charset=utf-8",
            headers: {
                'Origin': 'file:///'
            },
            data: JSON.stringify({
                "udid": deviceuuid
            }),
            success: function (data) {
                if (!jQuery.isEmptyObject(data)) {
                    var landScapeMode = false;
                    if (isiPadPro(device.model) || kendo.support.mobileOS.tablet) {
                        var screenOrientation = ($(window).width() > $(window).height()) ? 90 : 0;
                        if (screenOrientation == 90) {
                            landScapeMode = true;
                        }
                    }
                    if (type == "regions") {
                        localStorage.setItem("AllRegionsData", JSON.stringify(data));
                        localStorage.setItem("NEWEST_EP_ZONES_UPDATED_DATE", dateToUpdate);
                        if (runningPage == 17 && localStorage.getItem("AreaSelected") == "region") {
                            try {
                                if (landScapeMode == true) {
                                    populateRegionsDataTab(data);
                                } else {
                                    populateRegionsData(data);
                                }
                            } catch (error) { }
                        }
                    } else if (type == "states") {
                        localStorage.setItem("AllStatesData", JSON.stringify(data));
                        localStorage.setItem("NEWEST_EP_STATES_UPDATED_DATE", dateToUpdate);
                        if (runningPage == 17 && localStorage.getItem("AreaSelected") == "state") {
                            try {
                                if (landScapeMode == true) {
                                    populateStatesDataTab(data);
                                } else {
                                    populateStatesData(data);
                                }
                            } catch (error) { }
                        }
                    } else if (type == "messageTypes") {
                        localStorage.setItem("AllEPTypesOnly", JSON.stringify(data));
                        allEPTypesOnly = JSON.parse(localStorage.getItem("AllEPTypesOnly"));
                        updateEmergencyMessageTypesCountDetails(dateToUpdate);
                        if (runningPage == 18) {
                            try {
                                var pahTypesOnlyEnabledFlagTemp = localStorage.getItem("PAHTypesOnlyEnabledFlag");
                                if (landScapeMode == true) {
                                    populateEPTypesDataTab(data);
                                    displayCheckedForAllMessageTypesBasedOnPAHFlag_Tab(pahTypesOnlyEnabledFlag, null);
                                } else {
                                    populateEPTypesData(data);
                                    displayCheckedForAllMessageTypesBasedOnPAHFlag(pahTypesOnlyEnabledFlagTemp, null);
                                }
                            } catch (error) { }
                        }
                    }
                }
                try {
                    SpinnerDialog.hide();
                } catch (e) { }
            },
            error: function (r, t, e) {
                Update_Error_Check = true;
            },
            beforeSend: function (xhr, settings) { }
        });
    },

    getUpdateDataFiveMinutesInterval: function (type) {
        servicesModel.serviceUpdateURL['zone'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAllZoneLMPs';
        servicesModel.serviceUpdateURL['tie'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAllTieFlows';
        servicesModel.serviceUpdateURL['aggregateZones'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getZoneWiseAggregateLMPs';
        servicesModel.serviceUpdateURL['analytics'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/addAnalyticData';
        servicesModel.serviceUpdateURL['updateSendingCheck'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getNewestUpdatedDates';
        servicesModel.serviceUpdateURL['ep'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/viewDeviceLatestAlerts';
        servicesModel.serviceUpdateURL['allRegionsDemandGraph'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAllRegionsDemandGraphPointsWithFiveMinuteInterval';
        servicesModel.serviceUpdateURL['zoneWiseAggregateLMPs'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getZoneWiseAggregateLMPsLatest';
        servicesModel.serviceUpdateURL['areaWiseTieFlowValues'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAreaWiseTieFlowValues';
        var deviceuuid = localStorage.getItem("deviceuuId");
        $.ajax({
            type: "POST",
            async: true,
            url: servicesModel.serviceUpdateURL[type],
            dataType: 'json',
            // timeout: 15000,
            contentType: "application/json; charset=utf-8",
            headers: {
                'Origin': 'file:///'
            },
            data: JSON.stringify({
                "udid": deviceuuid,
                "dayWiseDataUser": "dayWiseDataUser"
            }),
            success: function (data) {
                if (type == "zone") {
                    if (!jQuery.isEmptyObject(data) &&
                        (localStorage.getItem("isZoneLMPFiveMinuteIntervalDataReceived") == null ||
                            data.Zone_LMP_Last_Updated_Date != dbapp.zoneData.Zone_LMP_Last_Updated_Date)) {
                        try {
                            SpinnerDialog.show();
                        } catch (e) { }
                        // dbapp.zoneData = data;
                        updatingZoneLMPAndZoneTrendAndZoneLists(data);
                        deviceModel.getZoneLMPDataAndUpdate();
                    }
                } else if (type == "graph") {
                    if (!jQuery.isEmptyObject(data) &&
                        (localStorage.getItem("isDemandFiveMinuteIntervalDataReceived") == null ||
                            data.Demand_Graph_Last_Updated_Date != dbapp.demandData.Demand_Graph_Last_Updated_Date)) {
                        try {
                            SpinnerDialog.show();
                        } catch (e) { }
                        dbapp.demandData = data;
                        updatingGraphdata(data);
                    }
                } else if (type == "allRegionsDemandGraph") {
                    try {
                        if (!jQuery.isEmptyObject(data) && (localStorage.getItem("isRegionsDemandFiveMinuteIntervalDataReceived") == null ||
                            (localStorage.getItem("isRegionsDemandFiveMinuteIntervalDataReceived") == "true" &&
                                !jQuery.isEmptyObject(dbapp.allRegionsDemand.allRegionsDemandGraphLastUpdatedDate)
                                && (data.allRegionsDemandGraphLastUpdatedDate != dbapp.allRegionsDemand.allRegionsDemandGraphLastUpdatedDate
                                    || data.allZonesDemandGraphLastUpdatedDate != dbapp.allRegionsDemand.allZonesDemandGraphLastUpdatedDate)))) {
                            try {
                                SpinnerDialog.show();
                            } catch (e) { }
                            dbapp.allRegionsDemand = data;
                            updatingRegionsDemandGraphdata(data);
                        }
                    } catch (e) { }
                } else if (type == "tie") {
                    if (!jQuery.isEmptyObject(data) &&
                        data.Tie_Flow_Last_Updated_Date != dbapp.tieData.Tie_Flow_Last_Updated_Date) {
                        try {
                            SpinnerDialog.show();
                        } catch (e) { }
                        //  dbapp.tieData = data;
                        updatingTieData(data);
                    }
                } else if (type == "ep") {
                    try {
                        if (
                            (dbapp.emergencyProcedureData == undefined
                                || data.Emergency_Procedure_Last_Updated_Date != dbapp.emergencyProcedureData.Emergency_Procedure_Last_Updated_Date)
                            && !jQuery.isEmptyObject(data)) {
                            try {
                                SpinnerDialog.show();
                            } catch (e) {
                            }
                            dbapp.emergencyProcedureData = data;
                            setTimeout(function () {
                                updatingEPData(data);
                            }, 200);
                        }
                    } catch (e) {
                    }
                } else if (type == "zoneWiseAggregateLMPs") {
                    var zoneName = localStorage.getItem("zoneToBeDisplayedOnNotification");
                    dbapp.zoneTrendData = data;
                    dbapp.dropZoneTrendDetails();
                    dbapp.createzoneTrendDetails(dbapp.zoneTrendData);
                    localStorage.setItem("isZoneLMPFiveMinuteIntervalDataReceived", true);
                    servicesModel.getZoneWiseDayAheadData();
                    // isZoneDayAheadTrendDataReceived = localStorage.getItem("isZoneDayAheadTrendDataReceived");
                    // if(isZoneDayAheadTrendDataReceived == null || isZoneDayAheadTrendDataReceived == false){
                    //     servicesModel.getZoneWiseDayAheadData();
                    // }else if(isZoneDayAheadTrendDataReceived){
                    //     var latestTimestamp = dbapp.zoneTrendData.aggregate_LMP_last_updated_date.replace("AM", "a.m.").replace("PM", "p.m.").split(" ");
                    //     var hourMinutes = latestTimestamp[3].split(":");
                    //     if (hourMinutes[1] == '00') {
                    //         servicesModel.getZoneWiseDayAheadData();
                    //     }
                    // }

                    if (!jQuery.isEmptyObject(zoneName) && zoneName != "null") {
                        try {
                            setTimeout(function () {
                                ZoneMapModule.displayZoneTrend(zoneName);
                            }, 100);
                        } catch (e) { }
                        setTimeout(function () {
                            localStorage.setItem("zoneToBeDisplayedOnNotification", "null");
                        }, 150);
                    }
                } else if (type == "areaWiseTieFlowValues") {
                    dbapp.controlAreaTrendData = data;
                    dbapp.dropControlAreaTrendDetails();
                    dbapp.createControlAreaTrendDetails(dbapp.controlAreaTrendData);
                    localStorage.setItem("isControlAreasFiveMinuteIntervalDataReceived", true);
                }
                try {
                    SpinnerDialog.hide();
                } catch (e) { }
            },
            error: function (r, t, e) {
                Update_Error_Check = true;
            },
            beforeSend: function (xhr, settings) { }
        });
    },

    checkIftheStartUpFiveMinuteIntervalDataIsReceived: function () {
        isControlAreasFiveMinuteIntervalDataReceived = localStorage.getItem("isControlAreasFiveMinuteIntervalDataReceived");
        if (isControlAreasFiveMinuteIntervalDataReceived == null || isControlAreasFiveMinuteIntervalDataReceived == false) {
            servicesModel.getUpdateDataFiveMinutesInterval("areaWiseTieFlowValues");
        }

        isZoneLMPFiveMinuteIntervalDataReceived = localStorage.getItem("isZoneLMPFiveMinuteIntervalDataReceived");
        if (isZoneLMPFiveMinuteIntervalDataReceived == null || isZoneLMPFiveMinuteIntervalDataReceived == false) {
            servicesModel.getUpdateDataFiveMinutesInterval("zone");
        }

        isRegionsDemandFiveMinuteIntervalDataReceived = localStorage.getItem("isRegionsDemandFiveMinuteIntervalDataReceived");
        if (isRegionsDemandFiveMinuteIntervalDataReceived == null || isRegionsDemandFiveMinuteIntervalDataReceived == false) {
            servicesModel.getUpdateDataFiveMinutesInterval("allRegionsDemandGraph");
        }
    },


    updateCheckForEveryTwoMinutes: function () {
        var deviceuuid = localStorage.getItem("deviceuuId");
        isAutomaticUpdate = true;
        var appUpdatedTime = new Date().getTime() / 1000;
        localStorage.setItem("appUpdatedTime", appUpdatedTime);
        try {
            servicesModel.checkIftheStartUpFiveMinuteIntervalDataIsReceived();
        } catch (e) { }

        $.ajax({
            type: "POST",
            async: true,
            url: serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getNewestUpdatedDates',
            contentType: "application/json; charset=utf-8",
            timeout: 15000,
            data: JSON.stringify({
                "udid": deviceuuid
            }),
            headers: {
                'Origin': 'file:///'
            },
            success: function (data) {
                /*if ("NEWEST_EMERGENCY_PROCEDURE_DATE" == data[3][0]){
                    try{
                        setTimeout(function(){
                            if (dbapp.emergencyProcedureData == undefined 
                                || dbapp.emergencyProcedureData.Emergency_Procedure_Last_Updated_Date != data[3][1] ) {
                                badgeService.updateBadgeOnAlertsIcon(Number(data[9][1]));
                                servicesModel.getUpdateDataFiveMinutesInterval("ep");
                            }
                        },50);
                        
                    }catch (error) {}
                }*/
                if ("NEWEST_AGGREGATE_LMP_DATE" == data[0][0]) {
                    try {
                        if (dbapp.zoneData.Zone_LMP_Last_Updated_Date != data[0][1]) {
                            servicesModel.getUpdateDataFiveMinutesInterval("zone");
                        }
                    } catch (error) { }
                }
                /*if ("NEWEST_DEMAND_GRAPH_DATE" == data[1][0]) {
                    try {
                        if (dbapp.demandData.Demand_Graph_Last_Updated_Date != data[1][1]) {
                            servicesModel.getUpdateDataFiveMinutesInterval("graph");
                        }
                    } catch (error) {}
                }*/
                if ("NEWEST_TIE_FLOW_DATE" == data[2][0]) {
                    try {
                        if (dbapp.tieData.Tie_Flow_Last_Updated_Date != data[2][1]) {
                            servicesModel.getUpdateDataFiveMinutesInterval("tie");
                        }
                    } catch (error) { }
                }
                if ("NEWEST_EP_ZONES_UPDATED_DATE" == data[4][0]) {
                    try {
                        if (!jQuery.isEmptyObject(data[4][1]) && localStorage.getItem("NEWEST_EP_ZONES_UPDATED_DATE") != data[4][1]) {
                            servicesModel.getEPUpdates("regions", data[4][1]);
                        }
                    } catch (error) { }
                }
                if ("NEWEST_EP_STATES_UPDATED_DATE" == data[5][0]) {
                    try {
                        if (!jQuery.isEmptyObject(data[5][1]) && localStorage.getItem("NEWEST_EP_STATES_UPDATED_DATE") != data[5][1]) {
                            servicesModel.getEPUpdates("states", data[5][1]);
                        }
                    } catch (error) { }
                }
                if ("NEWEST_EP_MESSAGE_TYPES_UPDATED_DATE" == data[6][0]) {
                    try {
                        if (!jQuery.isEmptyObject(data[6][1]) && localStorage.getItem("NEWEST_EP_MESSAGE_TYPES_UPDATED_DATE") != data[6][1]) {
                            servicesModel.getEPUpdates("messageTypes", data[6][1]);
                        }
                    } catch (error) { }
                }
                if ("NEWEST_ALL_ZONES_DEMAND_GRAPH_DATE" == data[7][0]
                    || "NEWEST_ALL_REGIONS_DEMAND_GRAPH_DATE" == data[8][0]) {
                    try {
                        if (!jQuery.isEmptyObject(data[7][1]) && !jQuery.isEmptyObject(data[8][1])
                            && (localStorage.getItem("NEWEST_ALL_ZONES_DEMAND_GRAPH_DATE") != data[7][1]
                                || localStorage.getItem("NEWEST_ALL_REGIONS_DEMAND_GRAPH_DATE") != data[8][1])) {
                            servicesModel.getUpdateDataFiveMinutesInterval("allRegionsDemandGraph");
                        }
                    } catch (error) { }
                }
                if ("NEWEST_OPERATIONAL_RESERVES_DATE" == data[10][0]) {
                    try {
                        setTimeout(function () {
                            if (dbapp.operationalReservesData == undefined
                                || dbapp.operationalReservesData.updatedTimestamp != data[10][1]) {
                                servicesModel.getReservesData("operational");
                            }
                        }, 50);

                    } catch (error) { }
                }
                if ("NEWEST_DISPATCHED_RESERVES_DATE" == data[11][0]) {
                    try {
                        setTimeout(function () {
                            if (dbapp.dispatchedReservesData == undefined
                                || dbapp.dispatchedReservesData.updatedTimestamp != data[11][1]) {
                                servicesModel.getReservesData("dispatched");
                            }
                        }, 50);

                    } catch (error) { }
                }
                if ("NEWEST_APPLICATION_PROPS_DATE" == data[12][0]) {
                    try {
                        if (localStorage.getItem("NEWEST_APPLICATION_PROPS_DATE") == null
                            || localStorage.getItem("NEWEST_APPLICATION_PROPS_DATE") == undefined
                            || (!jQuery.isEmptyObject(data[12][1]) &&
                                localStorage.getItem("NEWEST_APPLICATION_PROPS_DATE") != data[12][1])) {
                            localStorage.setItem("NEWEST_APPLICATION_PROPS_DATE", data[12][1]);
                            servicesModel.getApplicationPropData("applicationProps");
                        }
                    } catch (error) { }
                }
                if ("NEWEST_GENERATIONAL_FUEL_MIX_DATE" == data[13][0]) {
                    try {
                        if (localStorage.getItem("NEWEST_GENERATIONAL_FUEL_MIX_DATE") == null || (!jQuery.isEmptyObject(data[13][1]) &&
                            localStorage.getItem("NEWEST_GENERATIONAL_FUEL_MIX_DATE") != data[13][1])) {
                            console.log("inside if");
                            localStorage.setItem("NEWEST_GENERATIONAL_FUEL_MIX_DATE", data[13][1]);
                            servicesModel.getFuelMixData("generationalFuelMix");
                        }
                    } catch (error) { }
                }
                setTimeout(function () {
                    if (Update_Error_Check) {
                        Network_Error++;
                        if (Network_Error >= 3) {
                            Network_Error = 0;
                            if (!isOnline()) {
                                navigator.notification.alert("The Internet connection appears to be offline.", null, "PJM Now", "OK");
                            } else {
                                navigator.notification.alert("App is not updated due to network timeout.", null, "PJM Now", "OK");
                            }
                        }
                        Update_Error_Check = false;
                    } else {
                        Network_Error = 0;
                    }
                }, 30000);
            },
            error: function (r, s, e) {
                Network_Error++;
                if (Network_Error >= 3) {
                    Network_Error = 0;
                    Update_Error_Check = false;
                    try {
                        if (s === 'timeout') {
                            navigator.notification.alert("App is not updated due to network timeout.", null, "PJM Now", "OK");
                        } else {
                            if (!isOnline()) {
                                navigator.notification.alert("The Internet connection appears to be offline.", null, "PJM Now", "OK");
                            } else {
                                navigator.notification.alert("App is not updated due to network problem.", null, "PJM Now", "OK");
                            }
                        }
                    } catch (error) { }
                }
            },
            beforeSend: function () { },
            complete: function (data) { }
        });
    },
    updateCheckForEveryOneMinute: function () {
        var deviceuuid = localStorage.getItem("deviceuuId");
        isAutomaticUpdate = true;
        var appUpdatedTime = new Date().getTime() / 1000;
        localStorage.setItem("appUpdatedTime", appUpdatedTime);
        try {
            servicesModel.checkIftheStartUpFiveMinuteIntervalDataIsReceived();
        } catch (e) { }

        $.ajax({
            type: "POST",
            async: true,
            url: serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getNewestUpdatedDatesForLatestAlerts',
            contentType: "application/json; charset=utf-8",
            timeout: 15000,
            data: JSON.stringify({
                "udid": deviceuuid
            }),
            headers: {
                'Origin': 'file:///'
            },
            success: function (data) {
                if ("NEWEST_EMERGENCY_PROCEDURE_DATE" == data[0][0]) {
                    try {
                        setTimeout(function () {
                            if (dbapp.emergencyProcedureData == undefined
                                || dbapp.emergencyProcedureData.Emergency_Procedure_Last_Updated_Date != data[0][1]) {
                                badgeService.updateBadgeOnAlertsIcon(Number(data[1][1]));
                                servicesModel.getUpdateDataFiveMinutesInterval("ep");
                            }
                        }, 50);

                    } catch (error) {
                    }
                }
                setTimeout(function () {
                    if (Update_Error_Check) {
                        Network_Error++;
                        if (Network_Error >= 3) {
                            Network_Error = 0;
                            if (!isOnline()) {
                                navigator.notification.alert("The Internet connection appears to be offline.", null, "PJM Now", "OK");
                            } else {
                                navigator.notification.alert("App is not updated due to network timeout.", null, "PJM Now", "OK");
                            }
                        }
                        Update_Error_Check = false;
                    } else {
                        Network_Error = 0;
                    }
                }, 30000);
            },
            error: function (r, s, e) {
                Network_Error++;
                if (Network_Error >= 3) {
                    Network_Error = 0;
                    Update_Error_Check = false;
                    try {
                        if (s === 'timeout') {
                            navigator.notification.alert("App is not updated due to network timeout.", null, "PJM Now", "OK");
                        } else {
                            if (!isOnline()) {
                                navigator.notification.alert("The Internet connection appears to be offline.", null, "PJM Now", "OK");
                            } else {
                                navigator.notification.alert("App is not updated due to network problem.", null, "PJM Now", "OK");
                            }
                        }
                    } catch (error) { }
                }
            },
            beforeSend: function () { },
            complete: function (data) { }
        });
    },
    getReservesData: function (type) {
        servicesModel.serviceUpdateURL['operational'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getOperationalReservesValues';
        servicesModel.serviceUpdateURL['dispatched'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getDispatchedReservesValues';
        var deviceuuid = localStorage.getItem('deviceuuId');
        $.ajax({
            type: "GET",
            async: true,
            url: servicesModel.serviceUpdateURL[type],
            contentType: "application/json; charset=utf-8",
            headers: {
                'Origin': 'file:///'
            },
            success: function (data) {
                if (!jQuery.isEmptyObject(data)) {
                    if (type == "operational") {
                        updateOperationalData(data);
                    } else if (type == "dispatched") {
                        updateDispatchedData(data);
                    }
                }
            },
            error: function (r, s, e) { },
            beforeSend: function (jqXHR, settings) { },
            complete: function (data) { }
        });
    },
    getApplicationPropData: function (type) {
        servicesModel.serviceUpdateURL['applicationProps'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getApplicationPropValues';
        $.ajax({
            type: "GET",
            async: true,
            url: servicesModel.serviceUpdateURL[type],
            contentType: "application/json; charset=utf-8",
            headers: {
                'Origin': 'file:///'
            },
            success: function (data) {
                try {
                    if (!jQuery.isEmptyObject(data)) {
                        if (type == "applicationProps") {
                            localStorage.setItem("applicationPropsData", JSON.stringify(data));
                        }
                    }
                } catch (e) {
                }
            },
            error: function (r, s, e) { },
            beforeSend: function (jqXHR, settings) { },
            complete: function (data) { }
        });
    },
    getFuelMixData: function (type) {
        servicesModel.serviceUpdateURL['generationalFuelMix'] = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getGenerationalFuelMixData';
        var deviceuuid = localStorage.getItem('deviceuuId');
        $.ajax({
            type: "GET",
            async: true,
            url: servicesModel.serviceUpdateURL[type],
            contentType: "application/json; charset=utf-8",
            headers: {
                'Origin': 'file:///'
            },
            success: function (data) {
                if (!jQuery.isEmptyObject(data)) {
                    updateFuelMixData(data);
                }
            },
            error: function (r, s, e) { },
            beforeSend: function (jqXHR, settings) { },
            complete: function (data) { }
        });
    },
    getZoneWiseDayAheadData: function () {
        $.ajax({
            type: "GET",
            async: true,
            timeout: 15000,
            url: serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getZoneLMPDayAheadValues',
            contentType: "application/json; charset=utf-8",
            headers: {
                'Origin': 'file:///'
            },
            success: function (data) {
                if (!jQuery.isEmptyObject(data)) {
                    updateZoneDayAheadData(data);
                }
            },
            error: function (r, s, e) { },
            beforeSend: function (jqXHR, settings) { },
            complete: function (data) { }
        });
    }
}
function updateZoneDayAheadData(data) {
    dbapp.zoneDayAheadTrendData = data;
    isZoneDayAheadTrendDataReceived = localStorage.getItem("isZoneDayAheadTrendDataReceived");
    if (isZoneDayAheadTrendDataReceived == null || isZoneDayAheadTrendDataReceived == false) {
        dbapp.dropZoneDayAheadTrendDetails();
        dbapp.createzoneDayAheadTrendDetails(dbapp.zoneDayAheadTrendData);
        dbapp.retrieveZoneDayAheadTrendDetails();
        localStorage.setItem("isZoneDayAheadTrendDataReceived", true);
    } else if (isZoneDayAheadTrendDataReceived) {
        dbapp.updateZoneDayAheadTrend(dbapp.zoneDayAheadTrendData);
    }
}
function updateFuelMixData(data) {
    dbapp.generationalFuelMixData = data;
    isGenerationalFuelMixDataReceived = localStorage.getItem("isGenerationalFuelMixDataReceived");
    if (isGenerationalFuelMixDataReceived == null || isGenerationalFuelMixDataReceived == false) {
        dbapp.dropTableGenerationalFuelMix();
        dbapp.createTableGenerationalFuelMix(dbapp.generationalFuelMixData);
        dbapp.retrieveGenerationalFuelMix();
        localStorage.setItem("isGenerationalFuelMixDataReceived", true);
    } else if (isGenerationalFuelMixDataReceived) {
        dbapp.updateDataGenerationalFuelMix(dbapp.generationalFuelMixData);
        try {
            if (runningPage == 21) {
                showGenerationFuelMixEnergy();
            }
        } catch (e) {
        }
    }
}
function updateOperationalData(data) {
    dbapp.operationalReservesData = data;
    isOperationalReservesDataReceived = localStorage.getItem("isOperationalReservesDataReceived");
    if (isOperationalReservesDataReceived == null || isOperationalReservesDataReceived == false) {
        dbapp.dropTableOperationalReserves();
        dbapp.createTableOperationalReserves(dbapp.operationalReservesData);
        dbapp.retrieveOperationalReserves();
        localStorage.setItem("isOperationalReservesDataReceived", true);
    } else if (isOperationalReservesDataReceived) {
        dbapp.updateDataOperationalReserves(dbapp.operationalReservesData);
        try {
            if (runningPage == 19) {
                var screenOrientation = ($(window).width() > $(window).height()) ? 90 : 0;
                if (screenOrientation == 90) {
                    showOperationalReserves_landscape();
                } else {
                    showOperationalReserves();
                }
            }
        } catch (e) {
        }
    }
}
function updateDispatchedData(data) {
    dbapp.dispatchedReservesData = data;
    isDispatchedReservesDataReceived = localStorage.getItem("isDispatchedReservesDataReceived");
    if (isDispatchedReservesDataReceived == null || isDispatchedReservesDataReceived == false) {
        dbapp.dropTableDispatchedReserves();
        dbapp.createTableDispatchedReserves(dbapp.dispatchedReservesData);
        dbapp.retrieveDispatchedReserves();
        localStorage.setItem("isDispatchedReservesDataReceived", true);
    } else if (isDispatchedReservesDataReceived == true) {
        dbapp.updateDataDispatchedReserves(dbapp.dispatchedReservesData);
        if (runningPage == 19) {
            var screenOrientation = ($(window).width() > $(window).height()) ? 90 : 0;
            if (screenOrientation == 90) {
                showDispatchedReserves_landscape();
            } else {
                showDispatchedReserves();
            }
        }
    }
}

function updatingZoneLMPAndZoneTrendAndZoneLists(data) {
    if (!jQuery.isEmptyObject(data) && data.zoneLMPList.length > 0) {
        dbapp.zoneData = data;
        dbapp.dropTable();
        dbapp.createTable(dbapp.zoneData);
        try {
            ZoneMapModule.zones.remove();
            ZoneMapModule.init();
            ZoneMapModule.createZones();
        } catch (error) { }
        try {
            renderZoneLMPList();
        } catch (ex) { }
        try {
            setTimeout(() => {
                zoneTrendUpdate();
            }, 100);
        } catch (ex) { }
        if (isiPadPro(device.model) || kendo.support.mobileOS.tablet) {
            try {
                renderZoneLMPListTablate();
            } catch (error) { }
        }
        //localStorage.setItem("isZoneLMPFiveMinuteIntervalDataReceived",true);
    }
}

function updatingGraphdata(data) {
    dbapp.demandData = data;
    dbapp.dropTableDemand();
    dbapp.createTableDemand(dbapp.demandData);
    try {
        regionsDemandGraphOrientationDeviceCSschanges();
    } catch (error) { }
    localStorage.setItem("isDemandFiveMinuteIntervalDataReceived", true);
}

function updatingRegionsDemandGraphdata(data) {
    dbapp.allRegionsDemand = data;
    localStorage.setItem("NEWEST_ALL_ZONES_DEMAND_GRAPH_DATE", data.allZonesDemandGraphLastUpdatedDate);
    localStorage.setItem("NEWEST_ALL_REGIONS_DEMAND_GRAPH_DATE", data.allRegionsDemandGraphLastUpdatedDate);
    dbapp.updateTableRegionsDemand(data);
    var response = (function () {
        var regionId = $('#dropDownButton span:first').text();
        if ("PJM-RTO" == regionId) {
            regionId = "PJM RTO Total";
            return regionId;
        } else {
            return regionId;
        }
    })();
    try {
        clickRegionId(response);
        updateSubtitleText();
    } catch (e) { }
    localStorage.setItem("isRegionsDemandFiveMinuteIntervalDataReceived", true);
}

function updatingTieData(data) {
    if (!jQuery.isEmptyObject(data) && data.tieFlowList.length > 0) {
        dbapp.tieData = data;
        dbapp.dropTableTie();
        dbapp.createTableTie(dbapp.tieData);
        try {
            loadTieFlowsData();
        } catch (error) { }
        try {
            setTimeout(() => {
                controlAreaTrendUpdate();
            }, 100);
        } catch (error) { }
        try {
            loadControlAreas();
        } catch (error) { }
        if (isiPadPro(device.model) || kendo.support.mobileOS.tablet) {
            try {
                loadControlAreas_tab();
            } catch (error) { }
        }
    }
}
function updatingEPData(data) {
    try {
        dbapp.updateDataEmergencyProcedure(data);
        localStorage.setItem("EPBadge", data.badgeCount);
        setTimeout(function () {
            badgeService.updateBadgeOnAlertsIcon(data.badgeCount);
            badgeService.updateBadgeOnAppIcon(data.badgeCount);
        }, 5);
        JSON.stringify(dbapp.emergencyProcedureData);
        if (runningPage == 9) {
            setTimeout(function () {
                alertsService.checkBadgeAndShow();
            }, 50);
            var landscapeView = false;
            if (isiPadPro(device.model) || kendo.support.mobileOS.tablet) {
                if (($(window).width() > $(window).height()) ? 90 : 0 == 90) {
                    landscapeView = true;
                    updateBadgeInLandScapeMode();
                }
            }
            if (landscapeView == false) {
                navigateFromLatestAlertsToAlerts();
            }
        } else if (runningPage == 10) {
            try {
                setTimeout(function () {
                    var landScapeMode = ($(window).width() > $(window).height()) ? true : false;
                    if (landScapeMode) {
                        loadViewLatestAlertsTab(dbapp.emergencyProcedureData);
                    } else {
                        loadViewLatestAlerts(dbapp.emergencyProcedureData);
                    }
                }, 200);
            } catch (error) { }
        }
        try {
            setTimeout(() => {
                SpinnerDialog.hide();
            }, 50);
        } catch (error) { }
    } catch (e) {
    }

    //TODO service call to get the badge count;
}
function getBadgeCount() {
    try {
        SpinnerDialog.show();
    } catch (error) { }
    var deviceuuid = localStorage.getItem("deviceuuId");

    var notificationStatus_URL = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getBadgeCount';
    $.ajax({
        type: "POST",
        async: true,
        url: notificationStatus_URL,
        dataType: 'json',
        timeout: 15000,
        contentType: "application/json; charset=utf-8",
        headers: {
            'Origin': 'file:///'
        },
        Accept: 'application/json',
        data: JSON.stringify({
            "udid": deviceuuid
        }),
        success: function (data) {
            localStorage.setItem("EPBadge", data.badgeCount);
            SpinnerDialog.hide();
        },
        error: function (r, s, e) {
            if (!isOnline()) {
                navigator.notification.alert("The Internet connection appears to be offline.", null, "PJM Now", "OK");
            } else if (s === 'timeout') {
                SpinnerDialog.hide();
                navigator.notification.alert(networkTimeoutMessage, null, "PJM Now", "OK");
            } else {
                SpinnerDialog.hide();
                navigator.notification.alert(networkProblemMessage, null, "PJM Now", "OK");
            }
            SpinnerDialog.hide();
        },
        beforeSend: function () { },
        complete: function (data) { }
    });
}

function updateEmergencyMessageTypesCountDetails(dateToUpdate) {
    try {
        SpinnerDialog.show();
    } catch (error) { }
    var deviceuuid = localStorage.getItem("deviceuuId");

    var EPTypesCount_URL = serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getEmergencyMessageTypesCountDetails';
    $.ajax({
        type: "POST",
        async: true,
        url: EPTypesCount_URL,
        dataType: 'json',
        timeout: 15000,
        contentType: "application/json; charset=utf-8",
        headers: {
            'Origin': 'file:///'
        },
        Accept: 'application/json',
        data: JSON.stringify({
            "udid": deviceuuid
        }),
        success: function (data) {
            localStorage.setItem("MessageTypesSelectedCountToUpdate", data.messageTypesSelectedCount);
            if (localStorage.getItem("TypesSelectedCount") > 0) {
                if (localStorage.getItem("TypesSelectedCount") != Number(data.messageTypesSelectedCount)) {
                    localStorage.setItem("TypesSelectedCount", Number(data.messageTypesSelectedCount));
                    if (runningPage == 16) {
                        try {
                            var landScapeMode = false;
                            if (isiPadPro(device.model) || kendo.support.mobileOS.tablet) {
                                var screenOrientation = ($(window).width() > $(window).height()) ? 90 : 0;
                                if (screenOrientation == 90) {
                                    landScapeMode = true;
                                }
                            }
                            if (landScapeMode == true) {
                                populateEPTypeSelectedStatus();
                            } else {
                                $('#typeSelectedDiv').show();
                                $('#typesCountDivId').hide();
                                $('#typeSelectedText').text(localStorage.getItem("TypesSelectedCount"));
                            }
                        } catch (error) { }
                    }
                }
            }
            localStorage.setItem("PAHCount", data.countOfPAH);
            if (jQuery.isEmptyObject(dateToUpdate) == false) {
                localStorage.setItem("NEWEST_EP_MESSAGE_TYPES_UPDATED_DATE", dateToUpdate);
            }
            SpinnerDialog.hide();
        },
        error: function (r, s, e) {
            if (!isOnline()) {
                navigator.notification.alert("The Internet connection appears to be offline.", null, "PJM Now", "OK");
            } else if (s === 'timeout') {
                SpinnerDialog.hide();
                navigator.notification.alert(networkTimeoutMessage, null, "PJM Now", "OK");
            } else {
                SpinnerDialog.hide();
                navigator.notification.alert(networkProblemMessage, null, "PJM Now", "OK");
            }
            SpinnerDialog.hide();
        },
        beforeSend: function () { },
        complete: function (data) { }
    });
}