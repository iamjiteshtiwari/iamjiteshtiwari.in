<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /contact/');
    exit;
}

if (!empty($_POST['website'] ?? '')) {
    header('Location: /contact/?status=success');
    exit;
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || $subject === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: /contact/?status=error');
    exit;
}

$name = str_replace(["", "
"], ' ', $name);
$subject = str_replace(["", "
"], ' ', $subject);

$to = 'contact@iamjiteshtiwari.in';
$mailSubject = '[Website Contact] ' . $subject;
$mailBody = "Name: {$name}
Email: {$email}

Message:
{$message}
";
$headers = [
    'From: Website Contact <contact@iamjiteshtiwari.in>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];

$sent = mail($to, $mailSubject, $mailBody, implode("
", $headers));

header('Location: /contact/?status=' . ($sent ? 'success' : 'error'));
exit;
