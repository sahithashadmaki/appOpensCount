var dbapp = dbapp || {};
dbapp.controlAreaTrendData = {};
console.log("dbModelControlAreasTrend.js");
dbapp.createControlAreaTrendDetails = function (controlAreaTrendDetails) {
    var db = dbapp.db;
    db.transaction(function (tx) {
        try {
            tx.executeSql("CREATE TABLE tbl_controlAreaTrend(controlareatrend_details TEXT)", [], dbapp.insertControlAreaTrendDetails(controlAreaTrendDetails), dbapp.onError);
        } catch (error) {}
    });
}

dbapp.dropControlAreaTrendDetails = function () {
    var db = dbapp.db;
    db.transaction(function (tx) {
        tx.executeSql("DROP TABLE IF EXISTS tbl_controlAreaTrend", []);
    });
}

dbapp.insertControlAreaTrendDetails = function (controlAreaTrendDetails) {
    var dataAreas = JSON.stringify(controlAreaTrendDetails);
    var db = dbapp.db;
    db.transaction(function (tx) {
        tx.executeSql("INSERT INTO tbl_controlAreaTrend(controlareatrend_details) VALUES (?)", [dataAreas],
            dbapp.onSuccess,
            dbapp.onError);
    });
}

dbapp.updateControlAreaTrendDetails = function (controlAreaTrendDetails) { 
    if(!jQuery.isEmptyObject(controlAreaTrendDetails)) {
        var db = dbapp.db;
        controlAreaTrendDetails = JSON.stringify(controlAreaTrendDetails);
        db.transaction(function (tx) {
            tx.executeSql("update tbl_controlAreaTrend set controlareatrend_details =? ", [controlAreaTrendDetails],
                dbapp.retrieveControlAreaTrendDetails,
                dbapp.onError);
        });
    }
}

dbapp.retrieveControlAreaTrendDetails = function () {
    var db = dbapp.db;
    var render = function (tx, rs) {
        dbapp.controlAreaTrendData = JSON.parse(rs.rows.item(0).controlareatrend_details);
    }
    db.transaction(function (tx) {
        tx.executeSql("SELECT controlareatrend_details FROM tbl_controlAreaTrend", null,
            render,
            dbapp.onError);
    });
}