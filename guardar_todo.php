<?php
header('Content-Type: application/json');

// Datos de conexión
$host = "localhost";
$user = "root";
$pass = "";
$db = "cine_estelar";

// Conexión
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Error de conexión: " . $conn->connect_error]);
    exit;
}

// Leer JSON recibido
$data = json_decode(file_get_contents("php://input"), true);

// Validar datos mínimos
if (
    !isset($data['nombre'], $data['correo'], $data['pelicula'], $data['horario'], 
            $data['asientos'], $data['total'])
) {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios"]);
    exit;
}

// Asignar variables
$nombre = $conn->real_escape_string($data['nombre']);
$correo = $conn->real_escape_string($data['correo']);
$pelicula = $conn->real_escape_string($data['pelicula']);
$horario = $conn->real_escape_string($data['horario']);
$asientos = $conn->real_escape_string(implode(", ", $data['asientos']));
$snacks = isset($data['snacks']) ? $conn->real_escape_string(json_encode($data['snacks'])) : null;
$total = floatval($data['total']);
$descuento = isset($data['descuento']) ? $conn->real_escape_string($data['descuento']) : null;
$codigoQR = isset($data['codigoQR']) ? $conn->real_escape_string($data['codigoQR']) : null;

// Preparar y ejecutar inserción
$sql = "INSERT INTO boletos (nombre, correo, pelicula, horario, asientos, snacks, total, descuento, codigo_qr) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssssssdss",
    $nombre,
    $correo,
    $pelicula,
    $horario,
    $asientos,
    $snacks,
    $total,
    $descuento,
    $codigoQR
);

if ($stmt->execute()) {
    echo json_encode(["status" => "ok", "message" => "Compra guardada con éxito"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al guardar: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>