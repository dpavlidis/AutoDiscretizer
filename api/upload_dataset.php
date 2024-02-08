<?php
header("Access-Control-Allow-Origin: *");
ini_set('upload_max_filesize', '1M');

if (isset($_FILES['file']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploadDir = '../datasets/';

    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $originalFilename = basename($_FILES['file']['name']);
    $uploadedFile = $uploadDir . basename($_FILES['file']['name']);
    $fileType = strtolower(pathinfo($uploadedFile, PATHINFO_EXTENSION));

    $allowedExtensions = ['csv'];

    if (!in_array($fileType, $allowedExtensions)) {
        echo 'Invalid file format. Please upload a valid CSV file.';
        exit;
    }

    if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadedFile)) {
        $hasNumericColumn = checkForNumericColumn($uploadedFile);

        if ($hasNumericColumn) {
            header('Content-Type: application/json');
            echo json_encode($originalFilename, JSON_PRETTY_PRINT);
        } else {
            unlink($uploadedFile);
            echo 'no numeric';
            
        }
    } else {
        echo 'Error uploading file.';
    }
} else {
    header("HTTP/1.1 403 Forbidden");
    echo 'Invalid request method.';
}

function checkForNumericColumn($filePath) {
 
    if (($handle = fopen($filePath, "r")) !== FALSE) {

        $firstLine = fgets($handle);
        $commaCount = substr_count($firstLine, ',');
        $semicolonCount = substr_count($firstLine, ';');
        $delimiter = $commaCount >= $semicolonCount ? ',' : ';';

        rewind($handle);

        $numericColumns = [];
        $headerRead = false;

        while (($data = fgetcsv($handle, 1000, $delimiter)) !== FALSE) {
            if (!$headerRead) {
                foreach ($data as $index => $column) {
                    $numericColumns[$index] = true;
                }
                $headerRead = true;
                continue;
            }

            foreach ($data as $index => $value) {
                if (!is_numeric(trim($value))) {
                    $numericColumns[$index] = false;
                }
            }
        }

        fclose($handle);
        foreach ($numericColumns as $isNumeric) {
            if ($isNumeric) {
                return true; 
            }
        }
    }
    return false;
}

?>
