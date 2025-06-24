<?php
include '../config/db_connect.php';

header('Content-Type: application/json');

$sql = "SELECT artist_id, artist_name FROM artist ORDER BY artist_name ASC";
$result = $conn->query($sql);

$artists = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $artists[] = $row;
    }
}

echo json_encode(['success' => true, 'artists' => $artists]);

$conn->close();
?> 