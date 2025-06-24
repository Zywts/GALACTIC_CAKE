<?php
session_start();
include '../config/db_connect.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['customer_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    exit();
}

// Get the POST data from the JavaScript fetch
$data = json_decode(file_get_contents('php://input'), true);

$cartItems = $data['cartItems'] ?? [];
$deliveryDetails = $data['deliveryDetails'] ?? [];

// --- Basic Validation ---
if (empty($cartItems) || empty($deliveryDetails)) {
    echo json_encode(['success' => false, 'message' => 'Missing order or delivery details.']);
    exit();
}

$customerId = $_SESSION['customer_id'];
$deliveryDate = date('Y-m-d', strtotime('+3 days')); // Example: delivery in 3 days
$deliveryType = $deliveryDetails['deliveryType'] ?? 'lunar';
$paymentMethod = $deliveryDetails['paymentMethod'] ?? 'credits';
$feedback = $deliveryDetails['feedback'] ?? '';
$promoCode = $deliveryDetails['promoCode'] ?? '';
$promotionIds = null;

// --- Handle Promotion Code ---
if (!empty($promoCode)) {
    $promoCodes = explode(',', $promoCode);
    $foundPromotionIds = [];

    // Prepare a statement to be reused
    $sql_promo = "SELECT promotion_id FROM promotion WHERE promotion_name = ? LIMIT 1";
    $stmt_promo = $conn->prepare($sql_promo);

    if ($stmt_promo) {
        foreach ($promoCodes as $code) {
            $stmt_promo->bind_param("s", $code);
            $stmt_promo->execute();
            $result_promo = $stmt_promo->get_result();
            if ($row = $result_promo->fetch_assoc()) {
                $foundPromotionIds[] = $row['promotion_id'];
            }
        }
        $stmt_promo->close();
    }

    if (!empty($foundPromotionIds)) {
        $promotionIds = implode(',', $foundPromotionIds);
    }
}


// --- Prepare the main INSERT statement for the orders table ---
$sql = "INSERT INTO orders (customer_id, cake_id, promotion_id, delivery_date, delivery_type, payment, feedback) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database prepare failed: ' . $conn->error]);
    exit();
}

// --- Loop through each cake in the cart and insert it as an order ---
try {
    foreach ($cartItems as $item) {
        $cakeId = $item['cakeId'];
        
        $stmt->bind_param(
            "iisssss",
            $customerId,
            $cakeId,
            $promotionIds,
            $deliveryDate,
            $deliveryType,
            $paymentMethod,
            $feedback
        );
        
        if (!$stmt->execute()) {
            // If any order fails, stop and report error
            throw new Exception('Failed to save order for cake ID ' . $cakeId . ': ' . $stmt->error);
        }
    }

    // If all orders were saved successfully
    echo json_encode(['success' => true, 'message' => 'Order placed successfully!']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?> 