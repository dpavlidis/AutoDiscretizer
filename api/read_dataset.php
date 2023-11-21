<?php
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    if (isset($_GET['dataset'])) {
        $dataset_path = 'uploads/';
        $originalFilename = $_GET['dataset'];

        $file_path = $dataset_path . $originalFilename;

        if (file_exists($file_path)) {
            $file = fopen($file_path, 'r');
            $rowCount = 0;
            $data = array();

            while (($line = fgets($file)) !== false && $rowCount < 7) {
                $data[] = explode(';', $line); // need to change here to handle csv or excel
                $rowCount++;
            }

            fclose($file);

            header('Content-Type: application/json');
            echo json_encode($data, JSON_PRETTY_PRINT);
        } else {
            
            header('HTTP/1.1 404 Not Found');
            echo 'Error: Dataset file not found';
        }
    } else {
        
        header('HTTP/1.1 400 Bad Request');
        echo 'Error: No dataset specified in the URL';
    }
} else {
    
    header('HTTP/1.1 400 Bad Request');
    echo 'Invalid request method';
}
?>
