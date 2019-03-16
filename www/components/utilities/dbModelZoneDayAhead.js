var dbapp = dbapp || {};
dbapp.zoneDayAheadTrendData = {};
console.log("dbModelZoneDayAhead.js");
dbapp.createzoneDayAheadTrendDetails = function (zoneDayAheadDetails) {
    var db = dbapp.db;
    db.transaction(function (tx) {
        try {
            tx.executeSql("CREATE TABLE tbl_zoneDayAheadTrend(zoneDayAheadTrend_details TEXT)", [], dbapp.insertZoneDayAheadTrendDetails(zoneDayAheadDetails), dbapp.onError);
        } catch (error) {}
    });
}

dbapp.dropZoneDayAheadTrendDetails = function () {
    var db = dbapp.db;
    db.transaction(function (tx) {
        tx.executeSql("DROP TABLE IF EXISTS tbl_zoneDayAheadTrend", []);
    });
}

dbapp.insertZoneDayAheadTrendDetails = function (zoneDayAheadDetails) {
    var dataZonesDayAheadValues = JSON.stringify(zoneDayAheadDetails);
    var db = dbapp.db;
    db.transaction(function (tx) {
        tx.executeSql("INSERT INTO tbl_zoneDayAheadTrend(zoneDayAheadTrend_details) VALUES (?)", [dataZonesDayAheadValues],
            dbapp.onSuccess,
            dbapp.onError);
    });
}
dbapp.updateZoneDayAheadTrend = function (zoneDayAheadTrend_details) { 
    if(!jQuery.isEmptyObject( zoneDayAheadTrend_details)) {
        var db = dbapp.db;
        zoneDayAheadTrend_details = JSON.stringify(zoneDayAheadTrend_details);
        db.transaction(function (tx) {
            tx.executeSql("update tbl_zoneDayAheadTrend set zoneDayAheadTrend_details =? ", [zoneDayAheadTrend_details],
                dbapp.retrieveZoneDayAheadTrendDetails,
                dbapp.onError);
        });
    }
}
dbapp.retrieveZoneDayAheadTrendDetails = function () {
    var db = dbapp.db;
    var render = function (tx, rs) {
        dbapp.zoneDayAheadTrendData = JSON.parse(rs.rows.item(0).zoneDayAheadTrend_details);
    }
    db.transaction(function (tx) {
        tx.executeSql("SELECT zoneDayAheadTrend_details FROM tbl_zoneDayAheadTrend", null,
            render,
            dbapp.onError);
    });
}