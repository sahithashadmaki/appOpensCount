function initPullToRefreshForControl(e) {
    scrollerOptions = e;
    var scroller = e.view.scroller;
    scroller.setOptions({
        pullToRefresh: true,
        endlessScroll: true,
        messages: {
            pullTemplate: "",
            releaseTemplate: function () {
                $(".km-scroller-pull").remove();
                $("#updateImg_Areas").css("display", "block");
                $("#rotatingImg_Areas").addClass("imgSpan");
            },
            refreshTemplate: function () {
                $(".km-scroller-pull").remove();
                $("#updateImg_Areas").css("display", "block");
                $("#rotatingImg_Areas").addClass("imgSpan");
            },
        },
        pull: function () {
            if ((isiPadPro(device.model) || kendo.support.mobileOS.tablet) && ($(window).width() > $(window).height()) ? 90 : 0 == 90 || sorting == true) {
                e.preventDefault();
            } else {
                refreshControlAreasDb();
                $(".km-scroller-pull").remove();
                setTimeout(function () {
                    scroller.pullHandled();
                    $("#updateImg_Areas").css("display", "none");
                }, 800);
            }
        }
    })
    scroller.bind("scroll", function (e) {
        if (e.scrollTop > 0) {
            scroller.reset();
        } else if (e.scrollTop < 0) {
            $(".km-scroller-pull").remove();
            if ((isiPadPro(device.model) || kendo.support.mobileOS.tablet) && ($(window).width() > $(window).height()) ? 90 : 0 == 90 || sorting == true) {
                scroller.reset();
                e.preventDefault();
            } else {
                $(".km-scroller-pull").remove();
            }
        } else if (e.scrollTop == 0) {
            $("#updateImg_Areas").css("display", "none");
        }
    });
}
function refreshControlAreasDb() {
    if (isOnline()) {
        try {
            tieflowsAndDemandUpdate();
        } catch (error) {}
        try {
            loadtieFlowsData();
        } catch (ex) {}
        try {
            controlAreaTrendUpdate();
        } catch (error) {}
        try {
            loadControlAreas();
        } catch (error) {}
        try {
            loadControlAreas_landscape();
        } catch (error) {}
    } else {
        networkConnectionCheckingWhileUpdating();
    }
}

function controlAreasLock() {
    try {
        if (isiPadPro(device.model) || kendo.support.mobileOS.tablet) {
            window.screen.unlockOrientation();
        }
    } catch (error) {}
    try {
        runningPageChange(4);
    } catch (error) {}

}