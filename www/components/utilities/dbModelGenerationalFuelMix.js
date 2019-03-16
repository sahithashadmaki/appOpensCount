console.log("dbModelGenerationalFuelMix");
var dbapp = dbapp || {};
dbapp.generationalFuelMixData = {};
dbapp.dropTableGenerationalFuelMix = function () {
    var db = dbapp.db;
    db.transaction(function (tx) {
        tx.executeSql("DROP TABLE IF EXISTS generationalFuelMix", []);
    });
}
dbapp.createTableGenerationalFuelMix = function (fuelMixData) {
    var db = dbapp.db;
    db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE generationalFuelMix(fuelMixData TEXT)", [],dbapp.insertDataGenerationalFuelMix(fuelMixData),dbapp.onError);
    });
}
function generationalFuelMixDataForService() {
     new servicesModel.getFuelMixData("generationalFuelMix");
}

dbapp.insertDataGenerationalFuelMix = function (fuelMixData) {
    if(!jQuery.isEmptyObject( fuelMixData)) {  
        var db = dbapp.db;
        fuelMixData = JSON.stringify(fuelMixData);
        db.transaction(function (tx) {
            tx.executeSql("INSERT INTO generationalFuelMix(fuelMixData) VALUES (?)", [fuelMixData],
                dbapp.onSuccess,
                dbapp.onError);
        });
    }else  { 
        var db = dbapp.db;
        setTimeout(function() {
            fuelMixData = JSON.stringify(dbapp.generationalFuelMixData);
            db.transaction(function (tx) {
                tx.executeSql("INSERT INTO generationalFuelMix(fuelMixData) VALUES (?)", [fuelMixData],
                    dbapp.onSuccess,
                    dbapp.onError);
            });
       },1000);
    }

}

dbapp.updateDataGenerationalFuelMix = function (fuelMixData) { 
    if(!jQuery.isEmptyObject( fuelMixData)) {
        var db = dbapp.db;
        fuelMixData = JSON.stringify(fuelMixData);
        db.transaction(function (tx) {
            tx.executeSql("update generationalFuelMix set fuelMixData =? ", [fuelMixData],
                dbapp.retrieveGenerationalFuelMix,
                dbapp.onError);
        });
    }
}

dbapp.retrieveGenerationalFuelMix = function () {
    var db = dbapp.db;
    var render = function (tx, rs) {
        dbapp.generationalFuelMixData = JSON.parse(rs.rows.item(0).fuelMixData);
    }
    db.transaction(function (tx) {
        tx.executeSql("SELECT fuelMixData FROM generationalFuelMix", null,
            render,
            dbapp.onError);
    });
}