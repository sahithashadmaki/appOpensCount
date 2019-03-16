if (window.DeviceOrientationEvent) {
    window.addEventListener("resize", function () {
        if (device.platform == 'android' || device.platform == 'Android') {
            $("#demandWhite").css("display", "none");
            setTimeout(function () {
                refreshDemandGraphData();
                $("#demandWhite").show();
                $("#demandWhite").show('slide', {
                    direction: 'right'
                }, 100);
            }, 1);
        } else {
            if (runningPage == 3) {
                refreshDemandGraphData();
            }
        }
    }, false);
}
var tooltip_status = 0;
var regionIDs = [];
var regionId;
var demandDayType;
var toolTipCategeries = [];
var demandSeriesArr = [];
var isDropDownClicked = false;

function clickRegionId(id) {
    try{
        var text = id;
        if ("PJM RTO Total" == id) {
            text = "PJM-RTO";
        }
        if(isDropDownClicked){
            isDropDownClicked = false;
            isTooltipEnabled = false;
        }
        crosshairsDisable();
        regionId = text;
        $('#dropDownButton span:first').text(text);
        $('#myDropdown a').each(function (index) {
            if ($(this).text() == $('#dropDownButton span:first').text()) {
                $(this).css('background-color', "#428DC1");
                $(this).css('background-clip', "border-box");
                $(this).css('color', "#FFFFFF");
            } else {
                $(this).css('color', "black");
                $(".dropdown-content a").css('background-color', "#F8F8F8");
            }
        });
        $("#myDropdown").css("display", "none");
        $("#dropDownButton").css("border-radius", "5px 5px 5px 5px");
        demandSeriesArr = [];
        var graphData = dbapp.allRegionsDemand;
        var returnValues;
        for (index = 0; index < graphData.regionWiseDemandGraphsList.length; index++) {
            var regionOrZoneName = graphData.regionWiseDemandGraphsList[index].regionOrZoneName;
            var demandGraphList = graphData.regionWiseDemandGraphsList[index].demandGraphList.demandGraphList;
            if (regionOrZoneName == id) {
                var newestUpdatedDate = graphData.regionWiseDemandGraphsList[index].demandGraphLastUpdatedDate;
                $("#lastupdatedGraph").html("As of " + newestUpdatedDate.replace("EDT", "EPT").replace("AM", "a.m.").replace("EST", "EPT").replace("PM", "p.m."));
                var latestTimestamp = newestUpdatedDate.replace("AM", "a.m.").replace("PM", "p.m.").split(" ");
                var hourMinutes = latestTimestamp[3].split(":");
                if (hourMinutes[1] == '00') {
                    latestTimestamp[3] = hourMinutes[0];
                }
                returnValues = getDemandGraphList(demandGraphList);
                break;
            }
        }
        updateChartSeries(true);
        var currentLoadText = '<div><span>Current: </span>' + '<span style="color:#3598DB;">' + currentLoad + '</span></div>';
        $("#chart1").highcharts().customText.attr({
            text:currentLoadText
        });
    }catch(e){
    }  
}
function clickDropDownDate(id) {

    try{
        var zoneOrRegionName = $('#dropDownButton span:first').text();
        if ("PJM-RTO" == zoneOrRegionName) {
            zoneOrRegionName = "PJM RTO Total";
        }
        demandDayType = id;
        if(isDropDownClicked){
            isDropDownClicked = false;
            isTooltipEnabled = false;
        }
        crosshairsDisable();
        var graphData = dbapp.allRegionsDemand;
        $('#dropDownDateButton span:first').text(getDemandDateByDayType(graphData));
        $('#myDropdownDate a').each(function (index) {
            if ($(this).text() == $('#dropDownDateButton span:first').text()) {
                $(this).css('background-color', "#428DC1");
                $(this).css('background-clip', "border-box");
                $(this).css('color', "#FFFFFF");
            } else {
                $(this).css('color', "black");
                $(".dropdown-date a").css('background-color', "#F8F8F8");
            }
        });
        $("#myDropdownDate").css("display", "none");
        $("#dropDownDateButton").css("border-radius", "5px 5px 5px 5px");
        demandSeriesArr = [];
        var returnValues;
        for (index = 0; index < graphData.regionWiseDemandGraphsList.length; index++) {
            var regionOrZoneName = graphData.regionWiseDemandGraphsList[index].regionOrZoneName;
            var demandGraphList = graphData.regionWiseDemandGraphsList[index].demandGraphList.demandGraphList;
            if (regionOrZoneName == zoneOrRegionName) {
                var newestUpdatedDate = graphData.regionWiseDemandGraphsList[index].demandGraphLastUpdatedDate;
                $("#lastupdatedGraph").html("As of " + newestUpdatedDate.replace("EDT", "EPT").replace("AM", "a.m.").replace("EST", "EPT").replace("PM", "p.m."));
                var latestTimestamp = newestUpdatedDate.replace("AM", "a.m.").replace("PM", "p.m.").split(" ");
                var hourMinutes = latestTimestamp[3].split(":");
                if (hourMinutes[1] == '00') {
                    latestTimestamp[3] = hourMinutes[0];
                }
                returnValues = getDemandGraphList(demandGraphList);
                break;
            }
        }
        updateChartSeries(false);
    }catch(e){
    }
}
function formatterMethodUpdate(){
    var chart1 = $("#chart1").highcharts();
    chart1.update({
        xAxis: {
            visible: true,
        },
        yAxis: {
            visible: true,
        },
    });
    chart1.series[0].update({
        tooltip: {
            formatter: function () {
                return false;
            }
        }
    });
}
var initialChart = '';
var xCross = '';
var yCross = '';
function crosshairsDisable(){
    if (!isTooltipEnabled) {
        // initialChart.xAxis[0].crosshair = yCross;
        initialChart.update({
            xAxis: {
                crosshair: false,
            }
        });
    }else{
        //initialChart.xAxis[0].crosshair = xCross;
        initialChart.update({
            xAxis: {
                crosshair:{
                    color: '#BCC1C6',
                    dashStyle: 'LongDash',
                    width: 1,
                }
            }
        });       
    } 
}
function dropDownClick() {
    
    if ($("#myDropdown").css("display") == "none") {
        dropDownOpen = 1;
        isDropDownClicked = true;
        isTooltipEnabled = false; 
        crosshairsDisable();
        $("#dropDownButton").css("border-radius", "5px 5px 0px 0px");
        $("#myDropdown").css("display", "block");
        $("#myDropdown").css("z-index", "10");
        $("#myDropdown .km-vertical-scrollbar").css("display", "block");
        $("#myDropdown .km-vertical-scrollbar").css("height", "221px");
        $("#myDropdown .km-horizontal-scrollbar").css("display", "None");
        if (device.platform == 'Android' || device.platform == 'android'){
            $("#myDropdown .km-vertical-scrollbar").css("height", "200px");
        }
        var screenOrientation = ($(window).width() > $(window).height()) ? 90 : 0;
        if (screenOrientation == 90) {
            if (device.platform == 'Android' || device.platform == 'android' || device.platform == 'iOS') {
                $("#myDropdown .km-vertical-scrollbar").css("height", "35px");
            }
        }
        $('#myDropdown a').each(function (index) {
            if ($(this).text() == $('#dropDownButton span:first').text()) {
                $(this).css('background-color', "#428DC1");
                $(this).css('background-clip', "border-box");
                $(this).css('color', "#FFFFFF");
                $('#dropDownButton span:first').text($(this).text());
            }
        });
        $("#myDropdown a").on("touchstart", function (event) {
            if ($(this).text() != $('#dropDownButton span:first').text()){
                $(this).css('color', "#FFFFFF");
                $(this).css("background-color", "#428DC1");
                $(this).css("background-clip", "border-box");
            }
        });
        $("#myDropdown a").on("click touchend", function (event) {
            if ($(this).text() != $('#dropDownButton span:first').text()){
                $(this).css('color', "#000");
                $(this).css("background-color", "#F8F8F8");
                $(this).css("background-clip", "border-box");
            }
        });
        $("#myDropdownDate").css("display", "none");
        $("#dropDownDateButton").css("border-radius", "5px 5px 5px 5px");
    } else {
        dropDownOpen = 0;
        isTooltipEnabled = true; 
        crosshairsDisable();
        $("#myDropdown").css("display", "none");
        $("#dropDownButton").css("border-radius", "5px 5px 5px 5px");
    }
}
function dropDownDateClick() {
    
    if ($("#myDropdownDate").css("display") == "none") {
        dateDropDownOpen = 1;
        isDropDownClicked = true;
        isTooltipEnabled = false;
        crosshairsDisable();
        $("#dropDownDateButton").css("border-radius", "5px 5px 0px 0px");
        $("#myDropdownDate").css("display", "block");
        $("#myDropdownDate").css("z-index", "10");
        $("#myDropdownDate .km-vertical-scrollbar").css("display", "None");
        $("#myDropdownDate .km-horizontal-scrollbar").css("display", "None");
        
        $('#myDropdownDate a').each(function (index) {
            if ($(this).text() == $('#dropDownDateButton span:first').text()) {
                $(this).css('background-color', "#428DC1");
                $(this).css('background-clip', "border-box");
                $(this).css('color', "#FFFFFF");
                $('#dropDownDateButton span:first').text($(this).text());
            }
        });
        $("#myDropdownDate a").on("touchstart", function (event) {
            if ($(this).text() != $('#dropDownDateButton span:first').text()){
                $(this).css('color', "#FFFFFF");
                $(this).css("background-color", "#428DC1");
                $(this).css("background-clip", "border-box");
            }
        });
        $("#myDropdownDate a").on("click touchend", function (event) {
            if ($(this).text() != $('#dropDownDateButton span:first').text()){
                $(this).css('color', "#000");
                $(this).css("background-color", "#F8F8F8");
                $(this).css("background-clip", "border-box");
            }
        });
        $("#myDropdown").css("display","none");
        $("#dropDownButton").css("border-radius","5px 5px 5px 5px");
    } else {
        dateDropDownOpen = 0;
        isTooltipEnabled = true;
        crosshairsDisable();
        $("#myDropdownDate").css("display", "none");
        $("#dropDownDateButton").css("border-radius", "5px 5px 5px 5px");
    }
}
var dropDownOverStatus = 0;
var dropDownTouchStatus = 0;
var dateDropDownTouchStatus = 0;
var dropDownOpen = 0;
var dateDropDownOpen = 0;
var currentLoad = 0;
var isTooltipEnabled = true;
function dropDownOver() {
    isTooltipEnabled = false;
}
function dropDownDateOver() {
    isTooltipEnabled = false;
}
function regionsDemandGraphOrientationDeviceCSschanges(inputRegionOrZoneName) {
    try{
        demandPageLoaded = 1;
        var size = {
            width: window.innerWidth || document.body.clientWidth,
            height: window.innerHeight || document.body.clientHeight
        };
        getDemandGraphPointsForAllRegions(dbapp.allRegionsDemand);
        var graphData = dbapp.allRegionsDemand;
        var chartInnerObj = $('#chart1').highcharts();
        var returnValues;
        $("#chart1").css("width", size.width - 10);
        if (chartInnerObj == undefined) {
            demandSeriesArr = [];
            for (index = 0; index < graphData.regionWiseDemandGraphsList.length; index++) {
                var regionOrZoneName = graphData.regionWiseDemandGraphsList[index].regionOrZoneName;
                var demandGraphList = graphData.regionWiseDemandGraphsList[index].demandGraphList.demandGraphList;
                if (regionOrZoneName == inputRegionOrZoneName) {
                    var newestUpdatedDate = graphData.regionWiseDemandGraphsList[index].demandGraphLastUpdatedDate;
                    $("#lastupdatedGraph").html("As of " + newestUpdatedDate.replace("EDT", "EPT").replace("AM", "a.m.").replace("EST", "EPT").replace("PM", "p.m."));
                    var latestTimestamp = newestUpdatedDate.replace("AM", "a.m.").replace("PM", "p.m.").split(" ");
                    var hourMinutes = latestTimestamp[3].split(":");
                    if (hourMinutes[1] == '00') {
                        latestTimestamp[3] = hourMinutes[0];
                    }
                    returnValues = getDemandGraphList(demandGraphList);
                    break;
                }
            }
            Highcharts.Axis.prototype.init = (function (func) {
                return function (chart, userOptions) {
                    func.apply(this, arguments);
                    if (this.categories) {
                        this.userCategories = this.categories;
                        this.categories = undefined;
                        this.labelFormatter = function () {
                            this.axis.options.labels.align = (this.value == this.axis.min) ? "center" : ((this.value == this.axis.max) ? "center" : "center");
                            return this.axis.userCategories[this.value];
                        }
                    }
                };
            } (Highcharts.Axis.prototype.init));
            var dropDownText = '<div id="dropDownButton" onclick="dropDownClick()" style="border:1px solid #BCC1C6;background-color: #f8f8f8;color: black;padding: 2px 0px 2px 1px;' +
                'border-radius:5px 5px 5px 5px;cursor: pointer;width: 149px;background-clip: padding-box;">' +
                '<span style="text-align: left;padding-left: 4px;">' + regionId + '</span>' +
                '<span style="text-align: right;float: right;padding: 0px 3px 0px 0px;">&#9660;</span>' +
                '</div>' +
                '<div id="myDropdown" onmouseover="dropDownOver()" data-role="scroller" data-visible-scroll-hints="true" class="dropdown-content" style="border:1px solid #BCC1C6;  overflow-y: scroll;">';

            for(index = 0; index < graphData.demandDropdownZonesAndRegions.length; index++){
                var title = graphData.demandDropdownZonesAndRegions[index];
                 if ("PJM RTO Total" == title) {
                    title = "PJM-RTO";
                }
                dropDownText= dropDownText +
                '<a id="'+graphData.demandDropdownZonesAndRegions[index]+'" href="javascript:;" onclick="clickRegionId(this.id);">'+title+'</a>';
            }
            dropDownText=dropDownText+'</div>';
            var dropDownDateText = getDropDownDateText(graphData);
            var screenOrientation = ($(window).width() > $(window).height()) ? 90 : 0;
            $("#chart1").css("width", size.width - 10);
            if (screenOrientation == 90) {
                $("#chart1").css("height", size.height - 110);
                $("#lastupdatedGraph").css("text-align", "right");
                $("#lastupdatedGraph").css("padding-right", "8px");
                chartDisplay(returnValues,dropDownText,dropDownDateText);
                landscapeChartUpdate(size);
                $(".highcharts-tooltip text").attr('y', '20');
                checkDevicePlatformForLandscape();
                onChart();
            } else {
                $("#chart1").css("height", size.height - 130);
                $(".highcharts-tooltip text").attr('y', '20');
                chartDisplay(returnValues,dropDownText,dropDownDateText);
                portraitChartUpdate(size);
                checkDevicePlatformForportrait();
                onChart();
            }
        }
        else {
            var screenOrientation = ($(window).width() > $(window).height()) ? 90 : 0;
            if (screenOrientation == 90) {
                $("#chart1").css("height", size.height - 125);
                $("#lastupdatedGraph").css("text-align", "right");
                $("#lastupdatedGraph").css("padding-right", "8px");
                checkDevicePlatformForLandscape();
                landscapeChartUpdate(size);
            } else {
                checkDevicePlatformForportrait();
                portraitChartUpdate(size);
                $(".highcharts-tooltip text").attr('y', '20'); 
            }
            var graphData = dbapp.allRegionsDemand;
            $('#dropDownDateButton span:first').text(getDemandDateByDayType(graphData));
            $("#myDropdownDate").on("touchend", function (event) {
                dateDropDownTouchStatus = 1;
            });
            $("#dropDownDateButton").on("touchend", function (event) {
                dateDropDownTouchStatus = 1;
            });
        }
        $(".highcharts-title").css("margin-top", "3px");
        $("#chart1").find("span.highcharts-title").attr('left', '2% !important');
        var reqHeight = size.height;
        $('#demandWhite').css('height', reqHeight);
    }catch(e){
    }
}
function getDropDownDateText(graphData){
    var demandDate = getDemandDateByDayType(graphData);
    var dateText = '<div id="dropDownDateButton" onclick="dropDownDateClick()" '+
                                    'style="border:1px solid #BCC1C6;background-color: #f8f8f8;color: black;padding: 2px 0px 2px 1px;' +
                                        'border-radius:5px 5px 5px 5px;cursor: pointer;width: 105px;background-clip: padding-box;">' +
                                    '<span style="text-align: left;padding-left: 10px;">'+
                                        demandDate+
                                    '</span>'+
                                    '<span style="text-align: right;float: right;padding: 0px 3px 0px 0px;">'+
                                        '&#9660;'+
                                    '</span>' +
                                '</div>' +
                                '<div id="myDropdownDate" onmouseover="dropDownDateOver()" data-role="scroller" '+
                                        'data-visible-scroll-hints="true" class="dropdown-date" '+
                                        'style="border:1px solid #BCC1C6;  overflow-y: scroll;">';

    for(index = 0; index < graphData.demandDateDropdownList.length; index++){
        var date = graphData.demandDateDropdownList[index].date;
            dateText= dateText +
            '<a id="'+graphData.demandDateDropdownList[index].dayType+'" href="javascript:;" onclick="clickDropDownDate(this.id);">'+date+'</a>';
    }
    dateText=dateText+'</div>';
    return dateText;
}
function getDemandGraphPointsForAllRegions(graphData){
    if (jQuery.isEmptyObject(graphData) || jQuery.isEmptyObject(graphData.demandDateDropdownList)) {
        var deviceuuid = localStorage.getItem("deviceuuId");
        try {
            SpinnerDialog.show();
        } catch (error) { }
        $.ajax({
            type: "POST",
            async: false,
            url: serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAllRegionsDemandGraphPointsWithFiveMinuteInterval',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            headers: {
                'Origin': 'file:///'
            },
            data: JSON.stringify({
                "udid": deviceuuid,
                "dayWiseDataUser":"dayWiseDataUser"
            }),
            success: function (data) {
                dbapp.allRegionsDemand = data;
                graphData = dbapp.allRegionsDemand;
                dbapp.updateTableRegionsDemand(data);
                try {
                    SpinnerDialog.hide();
                } catch (error) { }
            },
            error: function (r, t, e) {
                if (t === "timeout") {
                    SpinnerDialog.hide();
                    navigator.notification.alert(networkTimeoutMessage, null, "PJM Now", "OK");
                } else {
                    SpinnerDialog.hide();
                    navigator.notification.alert(networkProblemMessage, null, "PJM Now", "OK");
                }
                app.navigate("components/zoneLMPMap/zoneLMPMap.html", "slide:right");
                return;
            }
        });
    }
}
$(document).ready(function () {
    regionId = "PJM-RTO";
    demandDayType = 3;
    regionsDemandGraphOrientationDeviceCSschanges("PJM RTO Total");
});
function getDemandDateByDayType(graphData){
    for (index = 0; index < graphData.demandDateDropdownList.length; index++) {
        if(graphData.demandDateDropdownList[index].dayType == demandDayType){
            return graphData.demandDateDropdownList[index].date;
        }
    }
}
function pullToRefreshDemand() {
    if (isOnline()) {
        demandData();
    } else {
        networkConnectionCheckingWhileUpdating();
    }
}
$(document).ready(function () {
    $('#Okbtn_demand').click(function () {
        try {
            window.screen.unlockOrientation();
        } catch (error) { }
        var demandScreenName = "Demand";
        if (device.platform == 'Android' || device.platform == 'android') {
            Base64.fileCreationInAndroidAndSendMail(demandScreenName);
        } else if (device.platform == "iOS") {
            var encodedDeviceData = Base64.get_encoded_device_data();
            var filePath = 'base64:device_info.txt//' + encodedDeviceData + '/...';
            Base64.sendAMail(filePath, demandScreenName);
        }
        $(this).closest("[data-role=window]").kendoWindow("close");
    });
    $('#Laterbtn_demand').click(function () {
        try {
            window.screen.unlockOrientation();
        } catch (error) { }
        localStorage.setItem("DemandClicks", 0);
        $(this).closest("[data-role=window]").kendoWindow("close");
    });
})

function callback(e) {
    navigator.notification.alert(JSON.stringify(msg), null, 'EmailComposer callback', 'Close');
}

function checkSimulator() {
    if (window.navigator.simulator === true) {
        alert('This plugin is not available in the simulator.');
        return true;
    } else if (window.plugin === undefined) {
        alert('Plugin not found. Maybe you are running in AppBuilder Companion app which currently does not support this plugin.');
        return true;
    } else {
        return false;
    }
}

function initPullToRefreshScrollerForDemand(e) {
    try {
        var scroller1 = $("#myDropdown").data("kendoMobileScroller");
        scroller1.bind("scroll", function (event) {
            if (event.scrollTop > 0) {
                if (event.scrollTop > 170) {
                }
            } else if (event.scrollTop <= 0) {
                this.reset();
                e.preventDefault();
            }
        });
        scroller1.bind("scrollstart", function (event) {
        });
        $("#myDropdown").on("touchend", function (event) {
            dropDownTouchStatus = 1;
        });
        $("#dropDownButton").on("touchend", function (event) {
            dropDownTouchStatus = 1;
        });
        $("#myDropdownDate").on("touchend", function (event) {
            dateDropDownTouchStatus = 1;
        });
        $("#dropDownDateButton").on("touchend", function (event) {
            dateDropDownTouchStatus = 1;
        });

        initialChart = $("#chart1").highcharts();
        xCross = initialChart.xAxis[0].crosshair,
        yCross = initialChart.yAxis[0].crosshair;
        var scroller = e.view.scroller;
        scroller.bind("scroll", function (e) {
            if (e.scrollTop > 0) {
                scroller.reset();
            } else if (e.scrollTop < 0) {
                if ((isiPadPro(device.model) || kendo.support.mobileOS.tablet) && ($(window).width() > $(window).height()) ? 90 : 0 == 90) {
                    scroller.reset();
                    e.preventDefault();
                } else {
                    $(".km-scroller-pull").remove();
                }
            } else if (e.scrollTop == 0) {
                $("#updateDemand").css("display", "none");
            }
        });
        scroller.setOptions({
            pullToRefresh: true,
            messages: {
                pullTemplate: "",
                releaseTemplate: function () {
                    $(".km-scroller-pull").remove();
                    $("#rotatingImgDemand").addClass("imgSpan");
                    $("#updateDemand").css("display", "block");
                },
                refreshTemplate: function () {
                    $(".km-scroller-pull").remove();
                    $("#rotatingImgDemand").addClass("imgSpan");
                    $("#updateDemand").css("display", "block");
                }
            },
            pull: function () {
                if ((isiPadPro(device.model) || kendo.support.mobileOS.tablet) && ($(window).width() > $(window).height()) ? 90 : 0 == 90) {
                    e.preventDefault();
                } else {
                    pullToRefreshDemand();
                    $(".km-scroller-pull").remove();
                    setTimeout(function () {
                        scroller.pullHandled();
                        $("#updateDemand").css("display", "none");
                    }, 800);
                }
            },
        });
    } catch (e) {
     }
}

function chartDisplay(returnValues,dropDownText,dropDownDateText){
    $('#chart1').highcharts({
        chart: {
            events: {
                load: function () {
                    $(".highcharts-legend-item path").attr('stroke-width', 16);
                    $(".highcharts-legend-item path").attr('stroke-height', 16);
                },
                redraw: function () {
                    $(".highcharts-legend-item path").attr('stroke-width', 16);
                    $(".highcharts-legend-item path").attr('stroke-height', 16);
                },
                click: function(event){
                },  
            },
            type: 'spline',
            marginLeft: 41,
            marginTop:65,
            zoomType: 'x'
        }, 
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        title: {
            text: dropDownText,
            align: 'left',
            x: 0,
            useHTML: true,
            margin: -15,
            padding: 0,
            style: {
                color: '#000000',
                fontFamily: 'HelveticaNeue,sans-serif,Roboto regular',
                fontSize: '14px',
            },
        },
        xAxis: {
            categories: returnValues.categeries,
            title: {
                text: 'Hour beginning',
                style: {
                    color: '#000000',
                    fontFamily: 'HelveticaNeue-Medium,sans-serif-medium,Roboto-Medium',
                    fontSize: '13px'
                },
            },
            gridLineWidth: 1,
            tickInterval: 12 * 4,
            min: 0,
            max: 12 * 24,
            lineColor: '#000000',
            tickColor: 'transparent',
            lineWidth: 1,
            labels: {
                rotation: 0,
                step: 1,
                style: {
                    width: '2px',
                    color: '#000000',
                    paddingLeft: '12px',
                    fontFamily: 'HelveticaNeue-Medium,sans-serif-medium,Roboto-Medium',
                    fontSize: '12px',
                },
            },
            plotLines: [{
                color: '#000000',
                width: 1,
                value: 0,
                zIndex: 1
            }],
            minPadding: 0,
            maxPadding: 0,
        },
        subtitle: {
            text: dropDownDateText,
            y: 13,
            align: 'right',
            margin: -15,
            padding: 0,
            useHTML: true,
            style: {
                color: '#000000',
                fontFamily: 'HelveticaNeue,sans-serif,Roboto regular',
                fontSize: '14px',
                marginLeft:'10px'
            },
        },
        yAxis: {
            title: {
                text: 'GW',
                margin: 0,
                style: {
                    color: '#000000',
                    fontFamily: 'HelveticaNeue-Medium,sans-serif-medium,Roboto-Medium',
                    fontSize: '13px'
                },
            },
            gridLineWidth: 1,
            labels: {
                style: {
                    color: '#000000',
                    fontFamily: 'HelveticaNeue-Medium,sans-serif-medium,Roboto-Medium',
                    fontSize: '12px'
                },
            },
            offset: -10,
            allowDecimals: false,
            showFirstLabel: false,
            tickInterval: 5,
        },
        tooltip: {
            shape: "callout",
            crosshairs: [true, false],
            shared: true,
            crosshairs: {
                color: '#BCC1C6',
                dashStyle: 'LongDash',
                width: 1,
            },
            followPointer: false,
            borderColor: '#BCC1C6',
            borderWidth: 1,
            borderRadius: 12,
            useHTML: true,
            backgroundColor: '#F7F7F7',
            shadow: false,
            hideDelay: 0,
               formatter: function () {
                        if(!isTooltipEnabled) {
                            return false;
                        }else{
                            tooltip_status = 1;
                            var symbol = '■';
                            var timetoGraph;
                            var finalHeader;
                            var temp = toolTipCategeries[this.x];
                            if (this.x % 12 == 0 && temp != undefined) {
                                timetoGraph = temp.split(" ");
                                finalHeader = timetoGraph[0] + ":00 " + timetoGraph[1];
                            } else if(temp != undefined) {
                                timetoGraph = temp;
                                finalHeader = timetoGraph;
                            }
                            var s = '<span style="font-size:12px !important;display:block;font-family:HelveticaNeue,sans-serif,Roboto regular !important;text-align:center;">At '
                                + finalHeader + "</span>";
                            for (var i = 0; i < demandSeriesArr.length; i++) {
                                if (demandSeriesArr[i].data[this.x] != null) {
                                    s += '<span style="display:block;line-height:1;font-family:HelveticaNeue !important;font-size:18px !important;"><span style="color:'
                                        + demandSeriesArr[i].color
                                        + ';padding-right:5px;">' + symbol + '</span>' + demandSeriesArr[i].data[this.x].toFixed(1) + '</span>';
                                }
                            }
                            return '<div style="border-radius:12px;background-color:#F7F7F7;" class="tooltip"> ' + s +
                                '</div>';
                    
                        }
            },
            style: {
                fontFamily: 'HelveticaNeue',
                fontSize: '18px'
            },
        },
        rangeSelector: {
            selected: 1
        },
        plotOptions: {
            spline: {
                lineWidth: 2,
                marker: {
                    enabled: false
                },
                events: {
                    legendItemClick: function () {
                        return false;
                    },
                }
            },
            series: {
                enableMouseTracking: true,
                connectNulls: true,
                states: {
                    hover: {
                        enabled: false
                    }
                },
                events: {      
                }
            },
            lineWidth: 1,
        },
        series: demandSeriesArr,
    },
    function (chart) { 
        var currentLoadText = '<div><span>Current: </span>' + '<span style="color:#3598DB;">' + currentLoad + '</span></div>';
        chart.customText = chart.renderer.label(currentLoadText)
            .attr({
                align:'right', 
            })
            .css({
                color: '#000',
                fontSize: '15px',
                fontFamily: 'HelveticaNeue-Medium,sans-serif-medium,Roboto-Medium',
                fontWeight: '400'
            })
            .add();
        chart.noDataText = chart.renderer.label('')
            .css({
                fontFamily: 'HelveticaNeue ,sans-serif,roboto regular !important',
                fontWeight: 'normal',
                fontSize: '14px !important',
                color: '#666666'
            })
            .add();
    }); 
}

function onChart() {
    $('#chart1').on({ 
        'touchend': function(evt){
            if(dateDropDownOpen == 1 && dateDropDownTouchStatus == 0){
                dateDropDownOpen =0;
                console.log("close date drop down");
                setTimeout(()=>{
                    if($(".dropdown-date").css("display")=='block'){
                        $(".dropdown-date").css("display", "none");
                        $("#dropDownDateButton").css("border-radius", "5px 5px 5px 5px");
                    }
                    isTooltipEnabled = true;
                    crosshairsDisable();
                },100);
            }
            if(dropDownOpen == 1 && dropDownTouchStatus == 0){
                dropDownOpen = 0;
                isTooltipEnabled = true;
                crosshairsDisable();
                $("#myDropdown").css("display","none");
                $("#dropDownButton").css("border-radius","5px 5px 5px 5px");
            }
            setTimeout(function(){
                if(tooltip_status==1 && dropDownOverStatus == 0 && dropDownTouchStatus == 0) {
                    tooltip_status=0;
                    var prevClicks = localStorage.getItem('DemandClicks');
                    localStorage.setItem("DemandClicks", parseInt(prevClicks) + 1);
                }else if(dropDownOverStatus ==1 || dropDownTouchStatus == 1 || dateDropDownTouchStatus == 1){
                    dropDownOverStatus = 0;
                    dropDownTouchStatus = 0;
                    dateDropDownTouchStatus = 0;
                }
            },25)
        },
        'touchmove':function (evt){
            if(dropDownOpen == 1 && dropDownTouchStatus == 0 && !isDropDownClicked){
                dropDownOpen = 0;
                isTooltipEnabled = true;
                crosshairsDisable();
                $("#myDropdown").css("display","none");
                $("#dropDownButton").css("border-radius","5px 5px 5px 5px");
                //$("#myDropdownDate").css("display", "none");
                //$("#dropDownDateButton").css("border-radius", "4px 4px 0px 0px");
            }
            if(dateDropDownOpen == 1 && dateDropDownTouchStatus == 0 && !isDropDownClicked){
                dateDropDownOpen =0;
                console.log("close date drop down");
                setTimeout(()=>{
                    if($(".dropdown-date").css("display")=='block'){
                        $(".dropdown-date").css("display", "none");
                        $("#dropDownDateButton").css("border-radius", "5px 5px 5px 5px");
                    }
                    isTooltipEnabled = true;
                    crosshairsDisable();
                },100);
            }
        }
    });
}
function landscapeChartUpdate(size){
    try{
        var chart = $('#chart1').highcharts();
        chart.update({
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0,
                itemMarginTop: 6,
                itemWidth:90,
                padding: 15,
                itemStyle: {
                    font: 'HelveticaNeue,sans-serif,Roboto regular',
                    fontSize: '13px'
                },
            },
            subtitle: {
                y: 15,
                x: -132,
                margin: -15,
            },
            chart: {
                marginLeft: 45,
                spacingBottom: 30,
                height: size.height - 110,
                width: size.width - 10,
            },
        });
        var currentLoadText = '<div><span>Current: </span>' + '<span style="color:#3598DB;">' + currentLoad + '</span></div>';
            chart.customText.attr({
                text:currentLoadText
            });

        $("div#chart1").find("div.highcharts-container").
            find("svg.highcharts-root").find("g.highcharts-label")
                .each(function(i, obj) {
                    if(i==0){
                        $(obj).find("text").attr("text-anchor","end");
                        $(obj).find("text").attr("transform","translate("+Number(size.width-154)+","+Number(40)+")");
                    }else{
                        var x = $(obj).find("text").attr("x");
                        var y = $(obj).find("text").attr("y");
                        $(obj).attr("transform","translate("+Number(((size.width-102)/2)-(2*x))+","+Number(size.height*2/5)+")");
                    }
        });
        // $("div#chart1").find("div.highcharts-container")
        //                 .find("svg.highcharts-root")
        //                 .find("g.highcharts-label")
        //                 .find("text")
        //                 .attr("text-anchor","end");
        // $("div#chart1").find("div.highcharts-container")
        //                 .find("svg.highcharts-root")
        //                 .find("g.highcharts-label")
        //                 .attr("transform","translate("+Number(size.width-154)+","+Number(40)+")");
    }catch(e){}
}
function portraitChartUpdate(size){
    try{
        var chart = $('#chart1').highcharts();
        chart.update({
            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                itemMarginTop: 12,
                padding: 1,
            },
            subtitle: {
                y: 11,
                x: 0,
                margin: 0,
            },
            chart: {
                marginLeft: 41,
                spacingBottom: 20,
                height: size.height - 130,
                width: size.width - 10,
            },
            yAxis:{
                y:30
            }
        });
        var currentLoadText = '<div><span>Current: </span>' + '<span style="color:#3598DB;">' + currentLoad + '</span></div>';
        chart.customText.attr({
                text:currentLoadText,
            });
        $("div#chart1").find("div.highcharts-container").
            find("svg.highcharts-root").find("g.highcharts-label")
                .each(function(i, obj) {
                    if(i==0){
                        $(obj).find("text").attr("text-anchor","end");
                        $(obj).find("text").attr("transform","translate("+Number(size.width-22)+","+Number(40)+")");
                    }else{
                        var x = $(obj).find("text").attr("x");
                        var y = $(obj).find("text").attr("y");
                        $(obj).attr("transform","translate("+Number(((size.width-102)/2)-(2*x))+","+Number(size.height*2/5)+")");
                    }
        });
        // $("div#chart1").find("div.highcharts-container")
        //                 .find("svg.highcharts-root")
        //                 .find("g.highcharts-label")
        //                 .find("text")
        //                 .attr("text-anchor","end");
        // $("div#chart1").find("div.highcharts-container")
        //                 .find("svg.highcharts-root")
        //                 .find("g.highcharts-label")
        //                 .attr("transform","translate("+Number(size.width-22)+","+Number(40)+")");
    }catch(e){}
}
function getDemandGraphList(demandGraphList){
    var tempCurrentLoad;
    var categeries = [];
    var tempToolTipCategeries = [];
    var returnedObject = {};
    demandGraphList.forEach(function (graphItem) {
        var pointsArr = [];
        try{
            for (index = 0; index < graphItem.dayWiseDemandPointsList.length; index++) {
                if(graphItem.dayWiseDemandPointsList[index].dayType == demandDayType){
                     for (var i = 0; i < graphItem.dayWiseDemandPointsList[index].dayPoints.length; i++) {
                        if (graphItem.Graph_Name == "Actual" || (demandDayType == 4 && graphItem.Graph_Name == "ForeCast")) {
                            var xaxisItemLabel = graphItem.dayWiseDemandPointsList[index].dayPoints[i][0].split(" ");
                            categeries.push(xaxisItemLabel[0] + "<br>" + xaxisItemLabel[1]);
                            tempToolTipCategeries.push(graphItem.dayWiseDemandPointsList[index].dayPoints[i][0]);
                        }
                        pointsArr.push(graphItem.dayWiseDemandPointsList[index].dayPoints[i][1]);
                    }
                    break;
                }
            }
            getCurrentLoad(graphItem);
        }catch(e){}
        toolTipCategeries = tempToolTipCategeries ;
        var colr;
        var enableMouseTrackingfortooltip;
        var graph_Name = "";
        if (graphItem.Graph_Name == "Actual") {
            colr = "#448ABE";
            graph_Name = graphItem.Graph_Name;
            enableMouseTrackingfortooltip = true;
        } else if (graphItem.Graph_Name == "ForeCast") {
            colr = "#F8C037";
            graph_Name = "Forecast";
            enableMouseTrackingfortooltip = true;
        } else if (graphItem.Graph_Name == "Day Ahead") {
            colr = "#000";
            graph_Name ="Day-Ahead";
            enableMouseTrackingfortooltip = false;
        } else {
            colr = "#FA6A2D";
            graph_Name = graphItem.Graph_Name;
            enableMouseTrackingfortooltip = true;
        }
        var obj = {
            "name": graph_Name,
            "data": pointsArr,
            "color": colr,
            "enableMouseTracking": enableMouseTrackingfortooltip
        };
        demandSeriesArr.push(obj);
    });
    returnedObject["currentLoad"] = currentLoad;
    returnedObject["categeries"] = categeries;
    return returnedObject;
}
function getCurrentLoad(graphItem){
    for (index = 0; index < graphItem.dayWiseDemandPointsList.length; index++) {
        if(graphItem.dayWiseDemandPointsList[index].dayType == 3 && graphItem.Graph_Name == "Actual"){
            for (var i = 0; i < graphItem.dayWiseDemandPointsList[index].dayPoints.length; i++) {
                if (graphItem.dayWiseDemandPointsList[index].dayPoints[i][1] != null) {
                    currentLoad = graphItem.dayWiseDemandPointsList[index].dayPoints[i][1].toFixed(1);
                }
            }
            return currentLoad;
        }
    }
}
function updateChartSeries(isRegionChange){
    var chart = $('#chart1').highcharts();
    chart.noDataText.attr({
        text:""
    });
    //chart.hideNoData();
    if (demandSeriesArr.length == 3) {
        if(chart.series.length == 0){
            for (var i = 0, len = demandSeriesArr.length; i < len; i++) {
                chart.addSeries(demandSeriesArr[i], false);
            }
        }else if (chart.series.length == 1) {
            for (var i = 0, len = demandSeriesArr.length; i < len; i++) {
                if (i == 0 && chart.series[i].name == "Actual") {
                    chart.series[i].setData(demandSeriesArr[i].data, false);
                } else {
                    chart.addSeries(demandSeriesArr[i], false);
                }
            }
        } else if (chart.series.length == 3) {
            for (var i = 0, len = demandSeriesArr.length; i < len; i++) {
                chart.series[i].setData(demandSeriesArr[i].data, false);
                chart.series[i].name = demandSeriesArr[i].name;
                chart.series[i].color = demandSeriesArr[i].color;
                chart.series[i].enableMouseTrackingfortooltip = demandSeriesArr[i].enableMouseTrackingfortooltip;
            }
        }
        formatterMethodUpdate();
    } else {
        if(chart.series.length == 0 && isRegionChange == false){
               chart.addSeries(demandSeriesArr[0], false);
               formatterMethodUpdate();
        }else{
            for (var i = 0, len = chart.series.length; i < len; i++) {
                if (chart.series[i].name == "Actual" && demandSeriesArr[0].data.length > 0) {
                    chart.series[i].setData(demandSeriesArr[i].data, false);
                } else {
                    try{
                        chart.series[i].remove();
                    }catch(e){} 
                    len--; i--;
                }
            }
            if(demandSeriesArr[0].data.length == 0){
                $('#chart1').highcharts().update({
                    xAxis: {
                        visible: false
                    },
                    yAxis: {
                        visible: false
                    }
                });
                chart.noDataText.attr({
                    text:"No data to display"
                });
               //chart.showNoData("No data to display");
            }else{
                formatterMethodUpdate();
            }
        }      
    }
}
function checkDevicePlatformForLandscape(){
    if (isiPadPro(device.model) || kendo.support.mobileOS.tablet) {
        $("#lastupdatedGraph").css("text-align", "left");
        $("#tableRefreshForDemand").show();
        $("#lastupdatedGraph").show();
        $(".km-widget.km-navbar").css("height", '55px');
        if(device.platform == "iOS"){
            $("#myDropdown").css("height","348px");
        }else if (device.platform == 'android' || device.platform == 'Android') {
            $("#myDropdown").css("height","318px");
        }
    }else if(device.platform == "iOS"){
        $("#myDropdown").css("height","139px");
    }else if (device.platform == 'android' || device.platform == 'Android') {
        $("#myDropdown").css("height","129px");
    }
}
function checkDevicePlatformForportrait(){
    if (isiPadPro(device.model) || kendo.support.mobileOS.tablet) {
        $("#tableRefreshForDemand").hide();
        $("#lastupdatedGraph").show();
        $("#tablateUpdatedDateForDemand").hide();
        setTimeout(function () {
            $(".km-ios7 .km-tabstrip .km-button").css("display", "table-cell");
            $(".km-ios7 .km-tabstrip .km-button").css("padding-left", "0px");
            $(".km-ios7 .km-view-title").css("line-height", "2.5em");
            $(".km-widget.km-navbar").css("height", 'auto');
        }, 100);
    }
    $("#lastupdatedGraph").css("text-align", "left");
    $("#lastupdatedGraph").css("padding-right", "0px");
    if(device.platform == "iOS"){
        $("#myDropdown").css("height","348px");
    }else if (device.platform == 'android' || device.platform == 'Android') {
        $("#myDropdown").css("height","318px");
    }
}
function closeDropDown(){
    isTooltipEnabled = false;
    crosshairsDisable();
    if($("#myDropdown").css("display") == "block"){
        $("#myDropdown").css("display", "none");
        $("#dropDownButton").css("border-radius", "5px");
    }else if($("#myDropdownDate").css("display") == "block"){
        $("#myDropdownDate").css("display", "none");
        $("#dropDownDateButton").css("border-radius", "5px");
    }
    dropDownOpen=1;
}
document.addEventListener("pause", closeDropDown, false);

function refreshDemandGraphData(){
    try{
        var response = (function() {
            var regionId = $('#dropDownButton span:first').text();
            if("PJM-RTO" == regionId){
                regionId = "PJM RTO Total";
                return regionId;
            }else{
                return regionId;
            }
        })();

        regionsDemandGraphOrientationDeviceCSschanges(response);
        closeDropDown();
    }catch(e){}
}
function updateSubtitleText(){
    var graphData = dbapp.allRegionsDemand;
    var dropDownDateText = getDropDownDateText(graphData);
    var chart = $('#chart1').highcharts();
    chart.setSubtitle({text:dropDownDateText});
    isTooltipEnabled = false;
    dropDownOpen=1;
}