function oniOSNotification(event) {
    try {
        if (event.sound != undefined || event.sound != null) {
            var snd = new Media(event.sound);
            snd.play();
        }
        if (event.count && event.additionalData.foreground == 0) {
            try {
                localStorage.setItem('messageId', event.additionalData.messageId);
                localStorage.setItem('NotificationHasComeNow', true);
                appService.checkAndClosePopupIfAny();

                alertsService.getDeviceLatestAlertsAndUpdate();
            } catch (e) { }
        } else if (event.additionalData.zoneName && event.additionalData.foreground == 0) {
            alert("ios get and display");
            try {
                localStorage.setItem('zoneToBeDisplayedOnNotification', event.additionalData.zoneName);
                localStorage.setItem('NotificationHasComeNow', true);
                setTimeout(function () {
                    appService.checkAndClosePopupIfAny();
                    ZoneMapModule.getAndDisplayZoneTrend();
                }, 1000);
            } catch (e) { alert(JSON.stringify(e)); }
        }
        if(event.additionalData.coldstart){
            alert("cold start is true");
        }else{
            alert("coldstart is false");
        }
        if (event.additionalData.foreground == 0) {
            alert("ios status notification is true");
            isAlertsClicked = false;
            // statusNotification = true;
        }
        if (event.additionalData.foreground == 1 && event.count) {
            try {
                localStorage.setItem('NotificationHasComeNow', true);
                alertsService.getDeviceLatestAlertsAndShowAlert(event, "ios");
            } catch (e) { }
        } else if (event.additionalData.foreground == 1 && event.additionalData.zoneName != null) {
            setTimeout(function () {
                navigator.notification.alert(event.message, null, appTitle, "OK");
            }, 100);
        }
    } catch (e) {
        alert(JSON.stringify(e)); 
    }
}


function onAndroidNotification(event) {
    isAlertsClicked = false;
    if (event.sound != undefined || event.sound != null) {
        var soundfile = event.sound;
        var my_media = new Media("/android_asset/www/" + soundfile);
        my_media.play();
    }
if(event.additionalData.foreground == true){
    alert("forground is true");
}else{
    alert("foreground is false");
}
    if (event.additionalData.foreground == true) {
        if (event.additionalData.messageId != null && Number(event.count) >= 0) {
            try {
                localStorage.setItem('NotificationHasComeNow', true);
                alertsService.getDeviceLatestAlertsAndShowAlert(event, "android");
            } catch (e) { }
        } else if (event.message != null && event.additionalData.zoneName != null) {
            setTimeout(function () {
                navigator.notification.alert(event.message, null, appTitle, "OK");
            }, 100);
        }
    } else if (event.additionalData.foreground == false) {
        updateAppOpensCountTriggeredByPushes();
        // statusNotification = true;
        try {
            if (event.additionalData.messageId != null && Number(event.count) >= 0) {
                alert("1234");
                localStorage.setItem('messageId', event.additionalData.messageId);
                localStorage.setItem('NotificationHasComeNow', true);
                appService.checkAndClosePopupIfAny();
                alertsService.getDeviceLatestAlertsAndUpdate();
            }
            else if (event.additionalData.messageId == null && event.additionalData.zoneName != null) {
                alert("android get and display");
                try {
                localStorage.setItem('zoneToBeDisplayedOnNotification', event.additionalData.zoneName);
                localStorage.setItem('NotificationHasComeNow', true);
                setTimeout(function () {
                    appService.checkAndClosePopupIfAny();
                        ZoneMapModule.getAndDisplayZoneTrend();
                }, 1000);
            } catch (e) {alert(JSON.stringify(e));  }
            }
            //     if (event.additionalData.coldstart) {
            //         alert("android status notification is true");
            //         statusNotification = true;
            //     }else{
            //         alert("coldstart is false");
            //     }
        } catch (e) { }
    }
}

var pushNotificationService = {
    registerForPushNotifications: function () {
        try {
            var push = PushNotification.init({
                "android": {
                   // "senderID": "913356377129", //Google Developer Account ID present for enterprise app - Rajesh account
                    // "senderID": "1083964992510",  //Google Developer Account ID present for app store - droid.ggktech@gmail.com
                    "icon": "notify",
                    "iconColor": "#399ACA",
                    "sound": true,
                    "vibration": true
                },
                "browser": {},
                "ios": {
                    "sound": true,
                    "vibration": true,
                    "badge": true
                },
                "windows": {}
            });

            push.on('registration', function (data) {
                var isAlreadyGetToken = localStorage.getItem("tokenValue");
                if (jQuery.isEmptyObject(isAlreadyGetToken) || isAlreadyGetToken == null) {
                    deviceModel.doRegisterDevice(data.registrationId);
                } else {
                    if (isAlreadyGetToken != data.registrationId) {
                        deviceModel.updateDeviceToken(data.registrationId);
                    }
                }
            });

            push.on('notification', function (data) {
               
                if (device.platform == "iOS") {
                    oniOSNotification(data);
                } else if (device.platform == 'android' || device.platform == 'Android') {
                    onAndroidNotification(data);
                }
            });

            push.on('error', (e) => {
            });
            PushNotification.createChannel(
                () => {
                    console.log('success');
                },
                () => {
                    console.log('error');
                },
                {
                    id: 'PJM_Notifications',
                    description: 'PJM Notifications',
                    importance: 3,
                    vibration: true
                }
            );
        } catch (err) { }
    },
}
