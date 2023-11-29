<?php
header("Access-Control-Allow-Origin: *");
ini_set('upload_max_filesize', '1M');

require '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

if (isset($_FILES['file']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploadDir = '../datasets/';

    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $originalFilename = basename($_FILES['file']['name']);
    $uploadedFile = $uploadDir . basename($_FILES['file']['name']);
    $fileType = strtolower(pathinfo($uploadedFile, PATHINFO_EXTENSION));

    $allowedExtensions = ['csv', 'xlsx', 'xls'];

    if (!in_array($fileType, $allowedExtensions)) {
        echo 'Invalid file format. Please upload a valid CSV, XLSX, or XLS file.';
        exit;
    }

    if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadedFile)) {
        // Check for at least one numeric column
        $hasNumericColumn = checkForNumericColumn($uploadedFile);

        if ($hasNumericColumn) {
            header('Content-Type: application/json');
            echo json_encode($originalFilename, JSON_PRETTY_PRINT);
        } else {
            // Delete the uploaded file if it doesn't meet the criteria
            unlink($uploadedFile);
            echo 'no numeric';
            
        }
    } else {
        echo 'Error uploading file.';
    }
} else {
    header('HTTP/1.1 400 Bad Request');
    echo 'Invalid request method.';
}


function checkForNumericColumn($filePath)
{
    // Use PhpSpreadsheet to check for at least one numeric column
    try {
        $spreadsheet = IOFactory::load($filePath);
        $sheet = $spreadsheet->getActiveSheet();

        foreach ($sheet->getRowIterator() as $row) {
            foreach ($row->getCellIterator() as $cell) {
                $value = $cell->getValue();
                // Check if the cell value is numeric
                if (is_numeric($value)) {
                    return true;
                }
            }
        }

        return false;
    } catch (Exception $e) {
        // Handle exceptions, e.g., if the file is not a valid spreadsheet
        return false;
    }
}
?>
