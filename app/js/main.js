'use strict';

// TODO
if ('serviceWorker' in navigator) {
    console.log('Service Worker is supported');
    navigator.serviceWorker.register('sw.js').then(function() {
        return navigator.serviceWorker.ready;
    }).then(function(reg) {
        console.log('Service Worker is ready :^)', reg);
        reg.pushManager.subscribe({userVisibleOnly: true}).then(function(sub) {
            console.log('endpoint:', sub.endpoint);

            $.post("php/api.php", {
                accion: "guardar-reg-id",
                endpoint: sub.endpoint
            }, function (data) {
                console.log(data);
            }, "json");
        });
    }).catch(function(error) {
        console.log('Service Worker error :^(', error);
    });
}

$("#mandar-mensaje").on("click", function() {
    $.post("php/api.php", {
        accion: "mandar-mensaje"
    }, function (data) {
        console.log(data);
    }, "json");
});