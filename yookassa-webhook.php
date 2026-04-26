<?php
$secretKey = 'ВАШ_secretKey_ИЗ_ЮKASSA'; // тот же, что выше

$payload = file_get_contents('php://input');
$data = json_decode($payload, true);

if ($data['event'] === 'payment.succeeded') {
    $metadata = $data['object']['metadata'];
    $userId = $metadata['user_id'];
    $keyId = $metadata['key_id'];
    
    // Здесь вы можете:
    // 1) Сохранить в базу данных, что $userId купил $keyId
    // 2) Вызвать ваш Telegram-бот, чтобы он обновил статус
    
    // Пример: сохраняем в файл (временно, для теста)
    $log = date('Y-m-d H:i:s') . " - User $userId bought $keyId\n";
    file_put_contents('payments.log', $log, FILE_APPEND);
    
    // Если у вашего бота есть API для обновления покупок, отправьте запрос
    // $botToken = 'ТОКЕН_ВАШЕГО_БОТА';
    // file_get_contents("https://api.telegram.org/bot{$botToken}/sendMessage?chat_id={$userId}&text=✅ Ключ {$keyId} оплачен! Доступ открыт.");
}

http_response_code(200);
echo 'OK';
?>