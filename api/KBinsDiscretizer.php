<?php
header("Access-Control-Allow-Origin: *");

if ($_SERVER["REQUEST_METHOD"] === "POST") {

$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

$dataset_name = isset($data['dataset']) ? filter_var($data['dataset'], FILTER_SANITIZE_STRING) : null;
if (!$dataset_name) {
    log_error('Invalid dataset name');
    echo json_encode(['error' => "Invalid dataset name"]);
    exit;
} else {
    error_log("Received dataset name: $dataset_name");
}

error_log("Received JSON data: " . print_r($data, true));

if (!isset($data['dataset'], $data['checkedCheckboxes'], $data['strategy'], $data['bins'])) {
    log_error('Invalid JSON structure');
    echo json_encode(['error' => 'Invalid JSON structure']);
    exit;
}

    $dataset_name = $data['dataset']; 
    $columns = $data['checkedCheckboxes']; 
    $strategy = strtolower($data['strategy']); 
    $bins = $data['bins'];

    $target_dir = "../datasets/";
    $target_file = $target_dir . basename($dataset_name);

    if (!file_exists($target_file) || !is_readable($target_file)) {
        log_error('Invalid target file path');
        echo json_encode(['error' => 'Invalid target file path']);
        exit;
    }

    $pythonScript = "../python/KBinsDiscretizer.py";

    $command = "python $pythonScript " . escapeshellarg($target_file) . " " . escapeshellarg($strategy) . " " . escapeshellarg($bins) . " " . implode(' ', array_map('escapeshellarg', $columns)) . " 2>&1";
    exec($command, $output, $return_var);

    if ($return_var !== 0) {
        log_error('Error executing Python script', $output);
        echo json_encode(['error' => 'Error executing Python script']);
        exit;
    }

    header('Content-Type: application/json');

    echo json_encode(['message' => $output]);
} else {
    log_error('Invalid request method');
    echo json_encode(['error' => 'Invalid request method']);
}

function log_error($message, $data = null) {
    error_log("Error: $message" . ($data ? "\nDetails: " . print_r($data, true) : ''));
}
?>
