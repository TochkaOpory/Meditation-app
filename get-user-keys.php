<?php
header('Content-Type: application/json');
$userId = $_GET['user_id'] ?? null;
if (!$userId) {
    echo json_encode(['purchased' => []]);
    exit;
}
// загружаем покупки из базы или из файла
$purchases = [];
if (file_exists('purchases.json')) {
    $all = json_decode(file_get_contents('purchases.json'), true);
    $purchases = $all[$userId] ?? [];
}
// по умолчанию key1 открыт всем
$default = ['key1' => true, 'key2' => false, 'key3' => false, 'key4' => false];
foreach ($purchases as $key) {
    $default[$key] = true;
}
echo json_encode(['purchased' => $default]);
?>