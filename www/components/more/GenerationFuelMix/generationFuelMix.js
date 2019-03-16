if (window.DeviceOrientationEvent) {
    window.addEventListener("resize", function () {
        if (device.platform == 'android' || device.platform == 'Android') {
            $("#generationFuelMixWhite").css("display", "none");
            setTimeout(function () {
                showGenerationFuelMixEnergy();
                $("#generationFuelMixWhite").show();
                $("#generationFuelMixWhite").show('slide', {
                    direction: 'right'
                }, 100);
            }, 1);
        } else {
            if (runningPage == 21) {
                showGenerationFuelMixEnergy();
            }
        }
    }, false);
}
var energyType = "All Fuels";

function generationFuelMixInit(){
    $('.km-leftitem').css('margin-left', '0%');
    showGenerationFuelMixEnergy();
}

function pullToRefreshForGenerationFuelMix(){
    if (isOnline()) {
        generationalFuelMixData();
    } else {
        networkConnectionCheckingWhileUpdating();
    }
}

function initPullToRefreshScrollerForGenerationFuelMix(e) {
    var scroller = e.view.scroller;
    scroller.setOptions({
        pullToRefresh: true,
        messages: {
            pullTemplate: "",
            releaseTemplate: function () {
                $(".km-scroller-pull").remove();
                $("#updateGenerationFuelMix").css("display", "block");
                $("#rotatingImgGenerationFuelMix").addClass("imgSpan");
            },
            refreshTemplate: function () {
                $(".km-scroller-pull").remove();
                $("#updateGenerationFuelMix").css("display", "block");
                $("#rotatingImgGenerationFuelMix").addClass("imgSpan");
            }
        },
        pull: function () {
            if ((isiPadPro(device.model) || kendo.support.mobileOS.tablet) && ($(window).width() > $(window).height()) ? 90 : 0 == 90) {
                e.preventDefault();
            } else {
                pullToRefreshForGenerationFuelMix();
                $(".km-scroller-pull").remove();
                setTimeout(function () {
                    scroller.pullHandled();
                    $("#updateGenerationFuelMix").css("display", "none");
                }, 800);
            }
        },
    })
    scroller.bind("scroll", function (e) {
        if (e.scrollTop < 0) {
            if ((isiPadPro(device.model) || kendo.support.mobileOS.tablet) && ($(window).width() > $(window).height()) ? 90 : 0 == 90) {
                scroller.reset();
                e.preventDefault();
            } else {
                $(".km-scroller-pull").remove();
            }
        } else if (e.scrollTop == 0) {
            $("#updateGenerationFuelMix").css("display", "none");
        } else if (e.scrollTop > 0) {
            scroller.reset();
        }
    });
}

function generationFuelMixPieChartDisplay(type){
    energyType = type;
    fuelMixSeriesArr = [];
    var totalFuels = 0;
    var totalRenewables = 0;
        try{
            if(jQuery.isEmptyObject(dbapp.generationalFuelMixData)){
                servicesModel.getFuelMixData("generationalFuelMix");
            }
            var generationalFuelMixData = [];
            if (type == "All Fuels") {
                dbapp.generationalFuelMixData.items.forEach(function (item) {
                    var tempObj = {
                        "name": item.fuelType,
                        "color": item.color,
                        "y": item.mw,
                        "legendIndex": item.legendIndex
                    }
                    if(item.renewable){
                        totalRenewables = totalRenewables + item.mw;
                    }
                    totalFuels = totalFuels+item.mw;
                    generationalFuelMixData.push(tempObj);
                });
            } else if (type == "Renewables") {
                dbapp.generationalFuelMixData.items.forEach(function (item) {
                    if(item.renewable){
                        var tempObj = {
                            "name": item.fuelType,
                            "color": item.color,
                            "y": item.mw,
                            "legendIndex": item.legendIndex
                        }
                        totalRenewables = totalRenewables + item.mw;
                        generationalFuelMixData.push(tempObj);
                    }
                });
            }
            totalFuels = Math.round(totalFuels);
            totalRenewables = Math.round(totalRenewables);
            var newestUpdatedDate = dbapp.generationalFuelMixData.updatedTimestamp;
            $("#lastGenerationFuelMixUpdatedDate").html("As of " + newestUpdatedDate.replace("EDT", "EPT").replace("AM", "a.m.").replace("EST", "EPT").replace("PM", "p.m.")); 
            var generationalFuelMixObj = {
                "name": type,
                "colorByPoint": true,
                "data": generationalFuelMixData
            }
            fuelMixSeriesArr.push(generationalFuelMixObj);
            var fuels = '<div style="padding-left:2% !important;">'+
                            '<span style="font-size:14px;font-family:HelveticaNeue">'+
                                'Total'+
                            '</span>'+
                            '<br/>'+
                            '<span style="font-size:14px;font-family:HelveticaNeue;font-weight: bold">'+
                                totalFuels.toLocaleString('en')+
                                ' MW'+
                            '</span>'+
                        '</div>';
            var renewables='<div style="float:right">'+
                                '<span style="font-size:14px;font-family:HelveticaNeue">'+
                                    'Renewables'+
                                '</span>'+
                                '<br/>'+
                                '<span style="font-size:14px;font-family:HelveticaNeue;font-weight: bold">'+
                                    totalRenewables.toLocaleString('en')+
                                    ' MW'+
                                '</span>'+
                            '</div>';
        }catch(e){
        }
        Highcharts.Axis.prototype.init = (function (func) {
            return function (chart, userOptions) {
                func.apply(this, arguments);
                if (this.categories) {
                    this.userCategories = this.categories;
                    this.categories = undefined;
                    this.labelFormatter = function () {
                        this.axis.options.labels.align = (this.value == 0) ? "left" : ((this.value == this.axis.max) ? "center" : "center");
                        return this.axis.userCategories[this.value];
                    }
                }
            };
        } (Highcharts.Axis.prototype.init));
        var size = {
                width: window.innerWidth || document.body.clientWidth,
                height: window.innerHeight || document.body.clientHeight
            }
        $("#generationFuelMixPieChart").css("width", size.width-10);
        var screenOrientation = ($(window).width() > $(window).height()) ? 90 : 0;
        if (screenOrientation == 90) {
            $("#generationFuelMixPieChart").css("height", size.height - 20);
            constructGenerationFuelMixPieChart(type, 'landscape', fuels, renewables, size.width-10);
        } else {
            $("#generationFuelMixPieChart").css("height", size.height - 120);
            constructGenerationFuelMixPieChart(type, 'portrait', fuels, renewables, size.width-10);
        }
        $('.highcharts-tooltip').on({
            'touchstart': function(evt){
                evt.preventDefault();
            }
        });
        $("div#generationFuelMixPieChart").find("div.highcharts-container").find("svg.highcharts-root")
            .find("g.highcharts-legend").find("g").find("g").find("g")
                .each(function(i, obj) {
                    var x = $(obj).find("text").attr("x");
                    var y = $(obj).find("text").attr("y");
                    $(obj).find("text").attr("y",(Number(y)-2));
        });
        
        if(type == 'Renewables'){
            $('tspan#allFuelsEnergy').css('background-color', "#f8f8f8");
            $('tspan#allFuelsEnergy').css('color', "#000");
            $('tspan#renewablesEnergy').css('background-color', "#418CC0");
            $('tspan#renewablesEnergy').css('color', "#FFF");
            $("div#generationFuelMixPieChart").find("div.highcharts-container").find("svg.highcharts-root")
                .find("g.highcharts-label").find("text").find("tspan:nth-child(2)").attr("x",77);
            $("div#generationFuelMixPieChart").find("div.highcharts-container").find("svg.highcharts-root")
                .find("g.highcharts-label").find("text").find("tspan:nth-child(2)").attr("text-anchor","end");
        }else{
            $('tspan#renewablesEnergy').css('background-color', "#f8f8f8");
            $('tspan#renewablesEnergy').css('color', "#000");
            $('tspan#allFuelsEnergy').css('background-color', "#418CC0");
            $('tspan#allFuelsEnergy').css('color', "#FFF");
            $("div#generationFuelMixPieChart").find("div.highcharts-container").find("svg.highcharts-root")
                .find("g.highcharts-label")
                    .each(function(i, obj) {
                        if(i==1){
                            $(obj).find("text").find("tspan:nth-child(2)").attr("x",77);
                            $(obj).find("text").find("tspan:nth-child(2)").attr("text-anchor","end");
                        }
            });
        }
}

function constructGenerationFuelMixPieChart(type, orientationType, fuels, renewables, deviceWidth){
    Highcharts.setOptions({
        lang: {
          thousandsSep: ','
        }
    });
    $('#generationFuelMixPieChart').highcharts({
        chart: {
            events: {
                click: function(event){
                },
                redraw: function(){
                    try{
                        closeAreaTrendPopup();
                    }catch(e){}
                },
                load: function () {
                    try{
                        closeAreaTrendPopup();
                    }catch(e){}
                    //this.myTooltip = new Highcharts.Tooltip(this, this.options.tooltip);
                    $("path.highcharts-tick").attr('stroke-width', 0);
                    if(orientationType == "portrait"){
                        var fuelsPlotX = 10,
                            renewablesPlotX = deviceWidth-80,
                            plotY = 60;
                    }else if(orientationType == "landscape"){
                        var fuelsPlotX = deviceWidth/10,
                            renewablesPlotX = 31*deviceWidth/50,
                            plotY = 85;
                    }
                    if (type == "All Fuels") {
                        var label = this.renderer.label(fuels, fuelsPlotX, plotY)
                            .attr({
                                padding: 1,
                                fill: 'white'
                            })
                            .css({
                                color: 'black'
                            })
                            .add();
                    }
                    var label = this.renderer.label(renewables, renewablesPlotX, plotY)
                        .attr({
                            padding: 1,
                            fill: 'white'
                        })
                        .css({
                            color: 'black'
                        })
                        .add();
                },
            },
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            spacingRight: 1,
            spacingTop: 15,
            marginTop: 60,
            marginBottom:140,
            marginLeft:10,
            type: 'pie'
        },
        legend: {
            symbolHeight: 16,
            symbolWidth: 28,
            symbolRadius: 2,
            itemMarginTop: 0,
            symbolPadding: 0,
            itemMarginBottom: orientationType == "portrait"?6:12,
            itemWidth: orientationType == "portrait"?(deviceWidth/3+8):deviceWidth/5,
            itemStyle: {
                color: '#419DD6',
                fontSize: "12px",
            },
            layout: orientationType == "portrait"?(type == "All Fuels"?'horizontal':'vertical'):'vertical',
            align: orientationType == "portrait"?'center':'right',
            verticalAlign: orientationType == "portrait"?'bottom':'middle',
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        title: {
            text: '<div id="container">'+
                        '<tspan id="allFuelsEnergy" onclick="clickGenerationFuelMixEnergy(this.id);" style="margin-right:5px;border:1px solid #BCC1C6;background-color:#418CC0;color: black;padding: 3px 18px 3px 18px;' +
                            'border-radius:3px 3px 3px 3px;cursor: pointer;width: 75px;background-clip: padding-box;text-align:center;color:#FFF;">'+
                            '<span style="font-size:13px">All Fuels</span>' +
                        '</tspan>'+
                        '<tspan id="renewablesEnergy" onclick="clickGenerationFuelMixEnergy(this.id);" style="margin-right:5px;border:1px solid #BCC1C6;background-color: #f8f8f8;color: black;padding: 3px 5px 3px 5px;' +
                            'border-radius:3px 3px 3px 3px;cursor: pointer;width: 72px;background-clip: padding-box;text-align:center;color:#000;">'+
                            '<span style="font-size:13px">Renewables</span>' +
                        '</tspan>'+
                '</div>',
            useHTML: true,
            style: {
                padding:0,
                margin:0,
                color: '#000000',
                fontFamily: 'HelveticaNeue,sans-serif,Roboto regular',
                fontSize: '13px',
            },
        },
        tooltip: {
            borderColor: '#BCC1C6',
            backgroundColor: '#FFF',
            borderWidth: 1,
            borderRadius: 12,
            enabled: false,
            shadow: false,
          //   formatter: function () {
          //       var pointValue = Math.round(this.point.y);
          //       var s = '<span style="font-size:12px !important;display:block;font-family:HelveticaNeue,sans-serif,Roboto regular !important;text-align:center;font-weight:bold;">'+
          //                   this.point.name+
          //                   ': '+
          //                   '<span style="display:block;line-height:1;font-family:HelveticaNeue !important;font-size:12px !important;">'+
          //                       pointValue.toLocaleString('en')+
          //                       ' MW'+
          //                   '</span>'+
          //               '</span>';
          //     return '<div style="border-radius:12px;background-color:#F7F7F7;padding:5px;" class="tooltip">'+
          //               s+
          //            '</div>';
          // },
        },
        xAxis: {
        },
        subtitle: {
        },
        drilldown: {
            
        },
        yAxis:{
            visible:false,
        },
        plotOptions: {
            pie: {
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true,
                borderWidth: 1
            },
            series: {
                allowPointSelect: false,
                animation: false,
                states: {hover: {enabled: false}},
                events: {
                    click: function(event) {
                        console.log("clientX: "+event.clientX+"clientY: "+event.clientY);
                        var pointValue = Math.round(event.point.y);
                        $("#viewAreaTrendPopup").html("");
                        $("#viewAreaTrendPopup").html('<span style="padding:3px;padding-bottom:0px;font-size:12px !important;display:block;font-family:HelveticaNeue,sans-serif,Roboto regular !important;text-align:center;font-weight:bold;color:black;">' +event.point.name+ "</span>"
                                +'<span style="padding:3px;padding-top:0px;padding-bottom:8px;display:block;line-height:1;font-family:HelveticaNeue !important;font-size:15px !important;color:black;">'+
                                    pointValue.toLocaleString('en')+
                                    ' MW'+
                                '</span>'
                                +"<div style='border-top: 1px solid #DCDFE1;'></div>"
                                +"<div style='padding-top:5px;padding-bottom:5px;font-family:HelveticaNeue !important;font-size:15px !important;color:#2984B3'>"
                                        +"<a class='button' onclick=closeAreaTrendPopup()>Close</a>"
                                +"</div>");
                        showViewAreaTrendPopup(event.clientX,event.clientY)
                        //this.chart.myTooltip.refresh(event.point, event);
                        // this.chart.myTooltip.hide();
                    }                      
                }
            }
        },
        series: fuelMixSeriesArr
    });
}
function showViewAreaTrendPopup(xCoordinate, yCoordinate) {
    var xCor = xCoordinate;
    var yCor = yCoordinate;
    var leftArranging = xCor - 75;
    if (leftArranging < 0) {
        xCor = 85
    }
    var size = {
        width: window.innerWidth || document.body.clientWidth,
        height: window.innerHeight || document.body.clientHeight
    };
    // if (xCor + 75 > $("#zoneLMPMapScroller").width()) {
    //     xCor = $("#zoneLMPMapScroller").width() - 85
    // }

    var viewAreaTrendPopupDiv = $("#viewAreaTrendPopup");

    $("#viewAreaTrendPopup").css("overflow-y", "hidden");
    $("#viewAreaTrendPopup").css("overflow-x", "hidden");

    viewAreaTrendPopupDiv.kendoWindow({
        width: "120px",
        height: "75px",
        borderColor: '#BCC1C6',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderRadius: 12,
        title: false,
        draggable: false,
        resizable: false,
        open: function (e) {
            this.wrapper.css({
                top: yCor - 47.5,
                left: xCor - 75
            });

        },
    });
    var viewAreaTrendPopup = viewAreaTrendPopupDiv.data("kendoWindow");

    viewAreaTrendPopup.open();

}
function closeAreaTrendPopup(){
    try {
        var viewTrendPopupDiv = $("#viewAreaTrendPopup");
        viewTrendPopupDiv.data("kendoWindow").close();
        // $(this).closest("[data-role=window]").kendoWindow("close");
    } catch (exception) {}
}
function disableToolTip(){
    console.log("disableToolTip");
    var pieChart = $('#generationFuelMixPieChart').highcharts();
    pieChart.myTooltip.hide();
}

var generationFuelMixEnergyId = 'allFuelsEnergy';
function clickGenerationFuelMixEnergy(id) {
    try{
        if(generationFuelMixEnergyId != id){
            generationFuelMixEnergyId = id;
            if(id == 'renewablesEnergy'){
                energyType="Renewables";
            }else{
                energyType="All Fuels";
            }
            showGenerationFuelMixEnergy();
        }
    }catch(e){
    }
}

function showGenerationFuelMixEnergy() {
    try{
        generationFuelMixPieChartDisplay(energyType);
    }catch(e){
    }
}
function backToMoreFromGenerationFuelMix(){
    //  if(!isMoreClicked){
    //      isMoreReserves = true;
    //  }else{
    //      isMoreReserves = false;
    //  }
     try{
        closeAreaTrendPopup();
     }catch(e){}
     isMoreClicked = true;
     isAlertsClicked = false;
     runningPageChange(6);
     defaultMorePrevPageInPortrait=6;
}