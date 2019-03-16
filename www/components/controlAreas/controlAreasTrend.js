function controlAreaTrendPopupGeneration(controlAreaName) {
    console.log("controlAreaName...."+controlAreaName);
    if (jQuery.isEmptyObject(dbapp.controlAreaTrendData)) {
        getAreaWiseTieFlowValues();
    }
    var controlAreasDetailsData = dbapp.controlAreaTrendData;
    var areaDetailsData = filterControlAreaDataByArea(controlAreaName, controlAreasDetailsData);
    //console.log("...."+controlAreaName+"....data is..."+JSON.stringify(areaDetailsData));
    $("#eachAreaLastUpdatedDate").html("As of " + controlAreasDetailsData.tieFlowsLastUpdatedDate.replace("EDT", "EPT").replace("AM", "a.m.").replace("EST", "EPT"));
    controlAreaGraphConstruction(areaDetailsData);
    var controlAreaTrendPopupDiv = $("#controlAreaTrendPopup");
    if (!controlAreaTrendPopupDiv.data("kendoWindow")) {
        controlAreaTrendPopupDiv.kendoWindow({
            title: false,
            draggable: false,
            modal: true,
            resizable: false,
            scrollable: false,
            pinned: false,
            animation: false,
            autoFocus: false,
            iframe: true,
            position: 'fixed'
        });
    } 
    var controlAreaTrendWindow = controlAreaTrendPopupDiv.data("kendoWindow");
    graphPopupDivGlobal = controlAreaTrendWindow;
    controlAreaTrendWindow.setOptions({
            width: '88%',
            height: 'auto'
    });
    controlAreaTrendWindow.center().open();
    try {
        var screenOrientation = ($(window).width() > $(window).height()) ? 90 : 0;
        if (screenOrientation == 0 && screen.orientation == "portrait-primary") {
            window.screen.lockOrientation('portrait');
        } else if (screenOrientation == 90) {
            window.screen.lockOrientation("landscape");
        } else {
            window.screen.lockOrientation('portrait');
        }
    } catch (error) {}
    $(".close-button").click(function () {
        $(this).closest("[data-role=window]").kendoWindow("close");
        window.screen.unlockOrientation();
    });
}

function getAreaWiseTieFlowValues(){
    var deviceuuid = localStorage.getItem("deviceuuId");
    try{
        SpinnerDialog.show();
    }catch(e){}
    $.ajax({
        type: "POST",
        async: true,
        url: serviceIpAddress_PJM + '/pjm/rest/services/edatafeed/getAreaWiseTieFlowValues',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        headers: {
            'Origin': 'file:///'
        },
        data: JSON.stringify({
            "udid": deviceuuid
        }),
        success: function (data) {
            //console.log("getAreaWiseTieFlowValues............"+JSON.stringify(data));
            dbapp.controlAreaTrendData = data;
            dbapp.updateControlAreaTrendDetails(data);
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

function controlAreaGraphConstruction(areaDetailsData) {
    var actualTieFlowValues = areaDetailsData.actualTieFlowValuesList;
    var scheduledTieFlowValues = areaDetailsData.scheduledTieFlowValuesList;
    var titleName = areaDetailsData.abbreviatedAreaName;
    var screenOrientation = ($(window).width() > $(window).height()) ? 90 : 0;
    var xaxisArray = [];
    var xaxisForTooltip = [];
    if (screenOrientation == 90) {
        if (isiPadPro(device.model) == false && !kendo.support.mobileOS.tablet) {
            $("#controlAreaGraph").css("height", '55%');
        }
    } else {
        if (isiPadPro(device.model) == false && !kendo.support.mobileOS.tablet) {
            $("#controlAreaGraph").css("height", 'auto');
        }
    }
    $("#controlAreaGraph").css("width", '88%');

    var seriesArr = [];
    var actualPointsArr = [];
    var scheduledPointsArr = [];
    var currentFlowValue;
    var thickIntervalPosition;
    var maxInterval;
   
    for (var i = 0; i < actualTieFlowValues.length; i++) {
        var splitingTime = actualTieFlowValues[i].areaTieFlowHour.split(" ");
        xaxisArray.push(splitingTime[0] + "<br>" + splitingTime[1]);
        xaxisForTooltip.push(actualTieFlowValues[i].areaTieFlowHour);
        if (actualTieFlowValues[i].areaTieFlowValue == null) {
            actualPointsArr.push(null);
        } else {
            currentFlowValue = parseFloat(actualTieFlowValues[i].areaTieFlowValue).toFixed(0);
            actualPointsArr.push(Number(actualTieFlowValues[i].areaTieFlowValue));
        }
    }
    maxInterval=24*12;
    thickIntervalPosition = 4*12;
    var actualObj = {
        "name": "Actual",
        "data": actualPointsArr,
        "color": "#448ABE",
        "showInLegend": true
    };
    seriesArr.push(actualObj);

    for (var i = 0; i < scheduledTieFlowValues.length; i++) {
        if (scheduledTieFlowValues[i].areaTieFlowValue == null) {
            scheduledPointsArr.push(null);
        } else {
            scheduledPointsArr.push(Number(scheduledTieFlowValues[i].areaTieFlowValue));
        }
    }

    var scheduledObj = {
        "name": "Scheduled",
        "data": scheduledPointsArr,
        "color": "#000",
        "showInLegend": true
    };
    seriesArr.push(scheduledObj);

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
    }(Highcharts.Axis.prototype.init));
    $('#controlAreaGraph').highcharts({
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
            spacingBottom: 1,
            spacingLeft: 1,
            spacingRight: 1,
            spacingTop: 1,
            marginRight: 20,
            marginLeft:40,
            type: 'spline',
            zoomType: 'x'
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        title: {
            text: titleName,
            style: {
                color: '#000000',
                fontFamily: 'HelveticaNeue,sans-serif,roboto ',
                fontSize: '18px',
            },
        },
        subtitle: {
            text: '<div><span style="font-family:HelveticaNeue,sans-serif,Roboto regular !important;font-size:13px;color:#000;">Current Load: </span>' + '<span style="color:#3598DB;">' + currentFlowValue + '</span></div>',
            align: 'right',
            x: -17,
        },
        xAxis: {
            categories: xaxisArray,
            title: {
                text: 'Hour',
                style: {
                    color: '#000000',
                    fontFamily: 'HelveticaNeue,sans-serif,Roboto regular',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    marginTop: '20px'
                },
            },
            allowDecimals: true,
            min: 0,
            max: maxInterval,
            gridLineWidth: 1,
            tickInterval: thickIntervalPosition,
            linewidth: 1,
            tickColor: 'transparent',
            lineColor: '#000000',
            plotLines: [{
                color: '#000000',
                width: 1,
                value: '0',
                zIndex: 1,
                 }],
            labels: {
                rotation: 0,
                style: {
                    width: '4px',
                    color: '#000000',
                    fontFamily: 'HelveticaNeue,sans-serif,Roboto regular',
                    fontSize: '12px',
                },
                step: 1
            }
        },
        yAxis: {
            title: {
                text: 'MW',
                align: 'high',
                offset: 1,
                x: -18.5,
                y: -15,
                rotation: 0,
                style: {
                    color: '#000000',
                    fontFamily: 'HelveticaNeue,sans-serif,Roboto regular !important',
                    fontSize: '13px !important',
                },
            },
            gridLineWidth: 1,
            lineColor: '#000000',
            linewidth: 1,
            offset: -12,
            labels: {
                style: {
                    color: '#000000',
                    fontFamily: 'HelveticaNeue,sans-serif,Roboto regular',
                    fontSize: '12px',
                },
            },
            allowDecimals: false,
            showFirstLabel: false,
            tickInterval: 500,
        },
        tooltip: {
            shared: true,
            crosshairs: [true, false],
            crosshairs: {
                color: '#BCC1C6',
                dashStyle: 'LongDash',
                width: 1,
            },
            borderColor: '#BCC1C6',
            borderWidth: 1,
            borderRadius: 12,
            formatter: function () {
                tooltip_status = 1;
                var symbol = '■';
                var timetoGraph;
                var finalHeader;
                var temp = xaxisForTooltip[this.x];
                if (this.x % 12 == 0) {
                    timetoGraph = temp.split(" ");
                    finalHeader = timetoGraph[0] + ":00 " + timetoGraph[1];
                } else {
                    timetoGraph = temp;
                    finalHeader = timetoGraph;
                }
                var s = '<span style="font-size:12px !important;display:block;font-family:HelveticaNeue,sans-serif,Roboto regular !important;text-align:center;">At '
                        + finalHeader + "</span>";
                for (var i = 0; i < seriesArr.length; i++) {
                    if (seriesArr[i].data[this.x] != null) {
                         var arearTrendTooltipValue = parseFloat(seriesArr[i].data[this.x].toFixed(1));
                        s += '<span style="display:block;line-height:1;font-family:HelveticaNeue !important;font-size:18px !important;padding-top:5px;"><span style="color:'
                            + seriesArr[i].color
                            + ';padding-right:5px;">' + symbol + '</span>' + arearTrendTooltipValue 
                            +' MW</span>';
                    }
                }
                return '<div style="border-radius:12px;background-color:#F7F7F7;" class="tooltip"> ' + s +
                                '</div>';
            },
            useHTML: true,
            hideDelay: 0,
            shadow: true
        },
        rangeSelector: {
            selected: 1
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: false
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
                    legendItemClick: function () {
                            return false;
                    }
                }
            }
        },
        series: seriesArr
    });
    $('.highcharts-tooltip').on({
        'touchstart': function(evt){
            evt.preventDefault();
        }
    });
}
function filterControlAreaDataByArea(controlAreaName, controlAreasDetailsData) {
    try{
        var areaDetailsData = [];
        var areaWiseTieFlowData = controlAreasDetailsData.areaWiseTieFlowValues;
        
        for (var areaIndex = 0; areaIndex < areaWiseTieFlowData.length; areaIndex++) {
            var particularAreaDetailsData = areaWiseTieFlowData[areaIndex];
            if (particularAreaDetailsData.abbreviatedAreaName.trim() == controlAreaName.trim()) {
                areaDetailsData = particularAreaDetailsData;
                break;
            }
        }
        return areaDetailsData;
    }catch(e){}
}