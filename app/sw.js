/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

// Version 0.1

'use strict';

var API_ENDPOINT = 'php/api.php?accion=obtener-ultimo-mensaje';

function showNotification(title, body, icon) {
    console.log('showNotification');
    // Firefox has an issue with showing a notification with the icon from
    // the Yaho API
    // (i.e. http://l.yimg.com/a/i/brand/purplelogo//uh/us/news-wea.gif)
    // HTTP, CORs or Size issue.
    var notificationOptions = {
        body: body,
        icon: icon ? icon : '/images/alert.png',
        tag: 'simple-push-demo-notification'
    };
    return self.registration.showNotification(title, notificationOptions);
}

console.log('Started', self);

self.addEventListener('install', function(event) {
    self.skipWaiting();
    console.log('Installed', event);
});

self.addEventListener('activate', function(event) {
    console.log('Activated', event);
});

self.addEventListener('push', function(event) {
    event.waitUntil(
        fetch(API_ENDPOINT)
            .then(function(response) {
                if (response.status !== 200) {
                  // Throw an error so the promise is rejected and catch() is executed
                  throw new Error('Error: ' +
                    response.status);
                }

                // Examine the text in the response
                return response.json();
            })
            .then(function(data) {
                var resultado = data.resultado,
                    mensaje = resultado.mensaje;

                var id = mensaje.id,
                    title = mensaje.title,
                    body = mensaje.body,
                    icon = mensaje.icon_src;


                // Add this to the data of the notification
                var urlToOpen = "google.com";

                var notificationFilter = {
                    tag: 'simple-push-demo-notification'+id
                };

                var notificationData = {
                    url: urlToOpen
                };

                if (!self.registration.getNotifications) {
                    return showNotification(title, body, icon);
                }

                // Check if a notification is already displayed
                return self.registration.getNotifications(notificationFilter)
                    .then(function(notifications) {
                        if (notifications && notifications.length > 0) {
                        // Start with one to account for the new notification
                        // we are adding
                        var notificationCount = 1;
                        for (var i = 0; i < notifications.length; i++) {
                            var existingNotification = notifications[i];
                            if (existingNotification.data &&
                            existingNotification.data.notificationCount) {
                            notificationCount +=
                                existingNotification.data.notificationCount;
                            } else {
                                notificationCount++;
                            }
                            existingNotification.close();
                        }
                        body = 'You have ' + notificationCount +
                            ' weather updates.';
                        notificationData.notificationCount = notificationCount;
                    }

                    return showNotification(title, body, icon, notificationData);
                });
            })
            .catch(function(err) {
                // console.error('A Problem occured with handling the push msg', err);
                console.log("Ocurrió un problema al intentar obtener el mensaje.", err);

                var title = "¡Oops algo paso!";
                var body = "No se pudo obtener el mensaje, hubo falló en su conexión a Internet.";

                return showNotification(title, body);
            })

        /*self.registration.showNotification(window.mensaje.title, {
            body: window.mensaje.body,
            icon: window.mensaje.icon,
            tag: 'push-notification'
        })*/
    );
    // console.log('Push message received', event);
    /*var req = new XMLHttpRequest();
    req.open("POST", "php/api.php");
    req.send({accion: "obtener-ultimo-mensaje"});
    if (req.status == 200) {
        var respuesta = req.responseText,
            data = JSON.parse(respuesta);

        if (data.status === "OK") {
            var resultado = data.resultado,
                mensaje = resultado.mensaje,
                id = mensaje.id,
                title = mensaje.title,
                body = mensaje.body,
                icon = mensaje.icon_src;

            event.waitUntil(
                self.registration.showNotification(title, {
                body: body,
                icon: icon,
                tag: 'my-tag'+id
            }));
        }
    }*/

    /*$.post("php/api.php", {
        accion: "obtener-ultimo-mensaje"
    }, function (data) {
        var resultado = data.resultado,
            mensaje = resultado.mensaje,
            id = mensaje.id,
            title = mensaje.title,
            body = mensaje.body,
            icon = mensaje.icon_src;

        event.waitUntil(
            self.registration.showNotification(title, {
            body: body,
            icon: icon,
            tag: 'my-tag'+id
        }));
    }, "json");*/
});