<?php
$secretKey = 'live_aqVk0DV3uZJB-93qWKSrexuvbTBj_gVD37tCcCTCzBs'; // тот же, что выше


$payload = file_get_contents('php://input');
$data = json_decode($payload, true);

// Проверяем, что это уведомление об успешной оплате
if ($data['event'] === 'payment.succeeded') {
    $metadata = $data['object']['metadata'];
    $userId = $metadata['user_id'];
    $keyId = $metadata['key_id'];
    
    // Сохраняем оплату в файл (для теста, вместо базы данных)
    $logEntry = date('Y-m-d H:i:s') . " - User $userId bought $keyId\n";
    file_put_contents('payments.log', $logEntry, FILE_APPEND);
    
    // ОПЦИОНАЛЬНО: сохранить в JSON-файл для быстрого доступа
    $purchases = [];
    if (file_exists('purchases.json')) {
        $purchases = json_decode(file_get_contents('purchases.json'), true);
    }
    if (!isset($purchases[$userId])) {
        $purchases[$userId] = [];
    }
    if (!in_array($keyId, $purchases[$userId])) {
        $purchases[$userId][] = $keyId;
        file_put_contents('purchases.json', json_encode($purchases));
    }
    
    // (Дополнительно) отправить сообщение в Telegram-бот
    $botToken = 'ВАШ_ТОКЕН_TELEGRAM_BOT';
    $message = "✅ Оплата прошла! Ключ $keyId открыт для пользователя $userId.";
    file_get_contents("https://api.telegram.org/bot{$botToken}/sendMessage?chat_id={$userId}&text=" . urlencode($message));
}

// Всегда отвечаем 200 OK, чтобы ЮKassa не повторял запрос
http_response_code(200);
echo 'OK';
?>
