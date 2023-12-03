<?php
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    if (isset($_GET['dataset']) && isset($_GET['binned'])) {
  
        $originalFilename = $_GET['dataset'];
        $binned = $_GET['binned'];

        if ($binned === 'false') {
            $dataset_path = '../datasets/';
        } elseif ($binned === 'true') {
            $dataset_path = '../binned_datasets/';
        } else {
            header('HTTP/1.1 400 Bad Request');
            echo 'Error: Unsupported binned value';
            exit;
        }

        $file_path = $dataset_path . $originalFilename;

        if (file_exists($file_path)) {
            $file_extension = pathinfo($file_path, PATHINFO_EXTENSION);
            $data = array();

            if ($file_extension === 'csv') {
                // Handle CSV file
                $file = fopen($file_path, 'r');

                while (($line = fgets($file)) !== false) {
                    // Trim the line to remove any leading or trailing whitespace
                    $line = trim($line);

                    // Check for both semicolon and comma as delimiters
                    $values = preg_split('/[;,]/', $line);

                    // Remove double quotes from each value
                    $cleanedValues = array_map(function ($value) {
                        return trim($value, '"');
                    }, $values);

                    $data[] = $cleanedValues;
                }

                fclose($file);
            } elseif ($file_extension === 'xlsx' || $file_extension === 'xls') {
                // Handle Excel file
                require 'vendor/autoload.php'; // Include PhpSpreadsheet library

                $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReaderForFile($file_path);
                $spreadsheet = $reader->load($file_path);
                $worksheet = $spreadsheet->getActiveSheet();

                foreach ($worksheet->getRowIterator() as $row) {
                    // Check for both semicolon and comma as delimiters
                    $data[] = preg_split('/[;,]/', implode('', $row->toArray()));
                }
            } else {
                header('HTTP/1.1 400 Bad Request');
                echo 'Error: Unsupported file format';
                exit;
            }

            // Identify columns with numeric values
            $numericColumns = array();
            foreach ($data[0] as $index => $columnName) {
                $isNumeric = true;
                for ($i = 1; $i < count($data); $i++) {
                    if (!is_numeric($data[$i][$index])) {
                        $isNumeric = false;
                        break;
                    }
                }
                if ($isNumeric) {
                    $numericColumns[] = $columnName;
                }
            }

            $response = array(
                'numericColumns' => $numericColumns,
                'dataset' => $data  // Include the dataset in the response
            );

            header('Content-Type: application/json');
            echo json_encode($response, JSON_PRETTY_PRINT);
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
