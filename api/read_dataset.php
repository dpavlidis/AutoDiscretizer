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
                $file = fopen($file_path, 'r');

                while (($line = fgets($file)) !== false) {
                    $line = trim($line);

                    $values = preg_split('/[;,]/', $line);

                    $cleanedValues = array_map(function ($value) {
                        return trim($value, '"');
                    }, $values);

                    $data[] = $cleanedValues;
                }

                fclose($file);
            } else {
                header('HTTP/1.1 400 Bad Request');
                echo 'Error: Unsupported file format';
                exit;
            }

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

            $categoricalIntegerColumns = array();
            foreach ($data[0] as $index => $columnName) {
                $isInteger = true;
                $hasCategorical = false;
                for ($i = 1; $i < count($data); $i++) {
                    $value = $data[$i][$index];
                    if (!is_numeric($value) || strpos($value, '.') !== false) {
                        $isInteger = false;
                    }
                    if (!is_numeric($value)) {
                        $hasCategorical = true;
                    }
                    if (!$isInteger || $hasCategorical) {
                        break;
                    }
                }

                if ($isInteger || $hasCategorical) {
                    $categoricalIntegerColumns[] = $columnName;
                }
            }

            if ($binned === 'false') {
                $response = array(
                    'numericColumns' => $numericColumns,
                    'categoricalIntegerColumns' => $categoricalIntegerColumns,
                    'dataset' => array_slice($data, 0, 21)
                );
            } elseif ($binned === 'true') {
                $response = array(
                    'dataset' => array_slice($data, 0, 21)
                );
            } else {
                header('HTTP/1.1 400 Bad Request');
                echo 'Error: Unsupported binned value';
                exit;
            }

            header('Content-Type: application/json');
            echo json_encode($response, JSON_PRETTY_PRINT);
        } else {
            header('HTTP/1.1 404 Not Found');
            echo 'Error: Dataset file not found';
        }
    } else {
        header('HTTP/1.1 400 Bad Request');
        echo 'Error: Required parameters have not been specified.';
    }
} else {
    header("HTTP/1.1 403 Forbidden");
    echo 'Invalid request method';
}
?>
