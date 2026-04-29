<?php
// tribute-webhook.php

// ⚠️ СЮДА ВСТАВЬТЕ ВАШ API-КЛЮЧ ИЗ ПАНЕЛИ TRIBUTE
$apiKey = 'eb07b51c-4208-4413-b63c-e242cf61';

// Получаем тело запроса от Tribute
$payload = file_get_contents('php://input');
$data = json_decode($payload, true);

// 1. ЛОГИРУЕМ ПОЛУЧЕННЫЙ ЗАПРОС ДЛЯ ОТЛАДКИ
file_put_contents('tribute_log.txt', date('Y-m-d H:i:s') . ' - Получен вебхук: ' . $payload . PHP_EOL, FILE_APPEND);

// 2. ПРОВЕРЯЕМ ПОДПИСЬ ВЕБХУКА (БЕЗОПАСНОСТЬ)
// Tribute может отправлять заголовок X-Signature для проверки, что запрос пришёл именно от них
$headers = getallheaders();
$signature = $headers['X-Signature'] ?? '';

// Простейший способ проверки: сравниваем значение заголовка с нашим API-ключом
// (В реальном проекте используется более сложный механизм, но для начала хватит и этого)
if (!empty($apiKey) && $signature !== $apiKey) {
    file_put_contents('tribute_log.txt', '⚠️ Неверная подпись! Запрос отброшен.' . PHP_EOL, FILE_APPEND);
    http_response_code(401);
    echo 'Invalid Signature';
    exit;
}

// 3. ОБРАБАТЫВАЕМ СОБЫТИЕ new_digital_product (новая покупка)
if ($data && ($data['name'] === 'new_digital_product' || $data['event'] === 'new_digital_product')) {
    // Определяем, где лежат данные о покупке
    $payloadData = $data['payload'] ?? $data['data'] ?? null;
    
    if ($payloadData) {
        $telegramUserId = $payloadData['telegram_user_id'] ?? null;
        $productId = $payloadData['product_id'] ?? $payloadData['custom_product_id'] ?? null;
        
        file_put_contents('tribute_log.txt', '✅ Покупка! User ID: ' . $telegramUserId . ', Product: ' . $productId . PHP_EOL, FILE_APPEND);
        
        // ЗДЕСЬ БУДЕТ ВАША ЛОГИКА ОТКРЫТИЯ КЛЮЧА
        // Например, запись в файл purchases.json или отправка запроса в Telegram боту
        // ...
    } else {
        file_put_contents('tribute_log.txt', '⚠️ Не удалось распарсить данные покупки.' . PHP_EOL, FILE_APPEND);
    }
} else {
    file_put_contents('tribute_log.txt', 'ℹ️ Получено другое событие или данные: ' . $payload . PHP_EOL, FILE_APPEND);
}

// Всегда возвращаем 200 OK, иначе Tribute будет повторять запрос
http_response_code(200);
echo 'OK';
?>
