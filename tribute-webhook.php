<?php
// tribute-webhook.php
$payload = file_get_contents('php://input');
$data = json_decode($payload, true);

// Логируем все входящие запросы (для отладки)
file_put_contents('tribute_log.txt', date('Y-m-d H:i:s') . ' - ' . $payload . PHP_EOL, FILE_APPEND);

// Проверяем, что это уведомление о новом цифровом товаре
if ($data && $data['name'] === 'new_digital_product') {
    $telegramUserId = $data['payload']['telegram_user_id'];
    $productId = $data['payload']['product_id'];
    
    // Маппинг product_id на ключ
    $productKeyMap = [
        'pub9' => 'key2',   // КЛЮЧ 2 — Золотое сияние
        'pubx' => 'key3',   // КЛЮЧ 3 — Искусство быть
        'puby' => 'key4',   // КЛЮЧ 4 — Субстрат жизненности
        'pubz' => 'all'     // Полный доступ (все ключи)
    ];
    
    $keyId = $productKeyMap[$productId] ?? null;
    
    if ($keyId) {
        // Сохраняем покупку
        $purchases = [];
        if (file_exists('purchases.json')) {
            $purchases = json_decode(file_get_contents('purchases.json'), true);
        }
        if (!isset($purchases[$telegramUserId])) {
            $purchases[$telegramUserId] = [];
        }
        if (!in_array($keyId, $purchases[$telegramUserId])) {
            $purchases[$telegramUserId][] = $keyId;
            file_put_contents('purchases.json', json_encode($purchases));
        }
        
        // (Опционально) Отправляем пользователю сообщение об успехе
        $botToken = 'ВАШ_ТОКЕН_TELEGRAM_БОТА'; // замените
        $message = "✅ Спасибо за покупку! Ключ " . strtoupper($keyId) . " открыт. Зайдите в приложение, чтобы продолжить.";
        file_get_contents("https://api.telegram.org/bot$botToken/sendMessage?chat_id=$telegramUserId&text=" . urlencode($message));
    }
}

http_response_code(200);
echo 'OK';
?>