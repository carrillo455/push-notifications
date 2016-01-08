<?php
    $pdo = new PDO("mysql:host=localhost;dbname=push;charset=utf8",
        "root", "");

    $accion = isset($_POST["accion"]) ? $_POST["accion"] : $_GET["accion"];

    switch ($accion) {
        case "guardar-reg-id":
            $endpoint = $_POST["endpoint"];
            $partes_endpoint = preg_split("/\//", $endpoint, -1);
            $registration_id = $partes_endpoint[count($partes_endpoint) - 1];

            // Siempre sera por GCM (Google Cloud Messaging).
            $query = $pdo->query("SELECT count(*) FROM registration_ids
                WHERE value LIKE '%$registration_id%'");
            $existe = $query->fetchColumn();

            if (!$existe) {
                $insert = $pdo->exec("INSERT INTO registration_ids
                    (value) VALUES ('$registration_id')");

                if ($insert) {
                    echo json_encode(array("status" => "OK",
                        "msg" => "Fue nuevo."));
                } else {
                    echo json_encode(array("status" => "ERROR INSERT REG_ID",
                        "msg" => "Error al insertar reg_id."));
                }
            } else {
                echo json_encode(array("status" => "OK",
                    "msg" => "Ya Existe."));
            }
        break;

        case "obtener-ultimo-mensaje":
            $query = $pdo->query("SELECT id, title, body,
                icon_src, timestamp FROM messages WHERE was_read = 0");
            $mensaje = $query->fetch(PDO::FETCH_ASSOC);

            if ($mensaje) {
                $update = $pdo->query("UPDATE messages SET was_read = 1");

                if ($update) {
                    echo json_encode(array("status" => "OK",
                        "resultado" => array("mensaje" => $mensaje)));
                } else {
                    echo json_encode(array("status" => "ERROR UPDATE",
                        "msg" => "Algo paso, favor de recargar la pagina."));
                }
            } else {
                echo json_encode(array("status" => "ERROR MESSAGES",
                        "msg" => "Algo paso, favor de recargar la pagina."));
            }
        break;

        case "mandar-mensaje":
            $query = $pdo->query("SELECT value FROM registration_ids");
            $registration_ids = $query->fetchAll(PDO::FETCH_COLUMN);

            $ch = curl_init();
            $params = array(
                "registration_ids" => $registration_ids
            );

            // Configurar URL y otras opciones apropiadas
            curl_setopt($ch, CURLOPT_URL, "https://android.googleapis.com/gcm/send");
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                "Authorization: key=AIzaSyD5_CRSXXE9pZci33kCD0tVRJDbYVutfrg",
                "Content-Type: application/json")
            );
            curl_setopt($ch, CURLOPT_POST, TRUE);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

            // Capturar la respuesta del servidor GCM
            $output = curl_exec($ch);

            if ($output) {
                echo json_encode(array("status" => "OK",
                        "resultado" => array("output" => $output)));
            } else {
                echo json_encode(array("status" => "ERROR CURL EXEC"));
            }

            // Cerrar el recurso cURL y liberar recursos del sistema
            curl_close($ch);
        break;
    }
?>