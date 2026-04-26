<?php
header('Content-Type: application/json');

$shopId = 'ВАШ_shopId_ИЗ_ЮKASSA';
$secretKey = 'ВАШ_secretKey_ИЗ_ЮKASSA';

$input = json_decode(file_get_contents('php://input'), true);
$keyId = $input['keyId'];
$amount = $input['amount'];
$userId = $input['userId'] ?? null;

$idempotenceKey = uniqid();

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.yookassa.ru/v3/payments');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, $shopId . ':' . $secretKey);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'amount' => ['value' => $amount, 'currency' => 'RUB'],
    'confirmation' => [
        'type' => 'redirect',
        'return_url' => 'https://tochkaopory.github.io/Meditation-app/'
    ],
    'metadata' => [
        'user_id' => $userId,
        'key_id' => $keyId
    ],
    'capture' => true,
    'description' => 'Доступ к ключу ' . $keyId
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Idempotence-Key: ' . $idempotenceKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (isset($data['confirmation']['confirmation_url'])) {
    echo json_encode(['confirmation_url' => $data['confirmation']['confirmation_url']]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Payment creation failed']);
}
?>