<?php
header("Access-Control-Allow-Origin: *");
ini_set('upload_max_filesize', '1M');

function is_numeric_dataset($file_path)
{
    $handle = fopen($file_path, 'r');

    $header = fgetcsv($handle, 1000, ';');

    while (($row = fgetcsv($handle, 1000, ';')) !== false) {
        foreach ($row as $value) {
            if (!is_numeric($value)) {
                fclose($handle);
                return false;
            }
        }
    }

    fclose($handle);
    return true;
}

if (isset($_FILES['file']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploadDir = 'uploads/';

    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $originalFilename = basename($_FILES['file']['name']);
    $uploadFile = $uploadDir . $originalFilename;

    move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile);

    if (is_numeric_dataset($uploadFile)) {
        header('Content-Type: application/json');
        echo json_encode($originalFilename, JSON_PRETTY_PRINT);
    } else {
        unlink($uploadFile);
        header('HTTP/1.1 400 Bad Request');
        echo 'Invalid dataset. The file must contain only numeric values.';
    }
} else {
    header('HTTP/1.1 400 Bad Request');
    echo 'Invalid request method or no file uploaded.';
}
?>
