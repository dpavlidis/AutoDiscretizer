<?php
header("Access-Control-Allow-Origin: *");

if ($_SERVER["REQUEST_METHOD"] === "POST") {


    // Validate and sanitize dataset_name
    // Retrieve JSON data from the request body
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

// Validate and sanitize dataset_name
$dataset_name = isset($data['dataset']) ? filter_var($data['dataset'], FILTER_SANITIZE_STRING) : null;
if (!$dataset_name) {
    log_error('Invalid dataset name');
    echo json_encode(['error' => "Invalid dataset name"]);
    exit;
} else {
    // Debugging: Output the received dataset name
    error_log("Received dataset name: $dataset_name");
}

// Continue debugging: Output the entire data
error_log("Received JSON data: " . print_r($data, true));

// Validate JSON data structure
if (!isset($data['dataset'], $data['checkedCheckboxes'], $data['strategy'], $data['bins'], $data['target_class'], $data['autoCheck'])) {
    log_error('Invalid JSON structure');
    echo json_encode(['error' => 'Invalid JSON structure']);
    exit;
}


    $dataset_name = $data['dataset']; // dataset name
    $columns = $data['checkedCheckboxes']; // this is an array of column names
    $strategy = strtolower($data['strategy']); // convert to lowercase
    $bins = $data['bins'];
    $target_class = $data['target_class'];
    $autoCheck = $data['autoCheck'];

    $target_dir = "../datasets/";
    $target_file = $target_dir . basename($dataset_name); //file path and dataset name

    // Validate and sanitize target_file path
    if (!file_exists($target_file) || !is_readable($target_file)) {
        log_error('Invalid target file path');
        echo json_encode(['error' => 'Invalid target file path']);
        exit;
    }

    if ($strategy === 'auto' && $autoCheck) {
        $pythonScript = "../python/auto_all.py";
        $command = "python $pythonScript " . escapeshellarg($target_file) . " " . escapeshellarg($target_class) . " " . implode(' ', array_map('escapeshellarg', $columns)) . " 2>&1";
       exec($command, $output, $return_var);

    }elseif ($strategy === 'auto' && !$autoCheck) {
        $pythonScript = "../python/auto_strategy.py";

        $command = "python $pythonScript " . escapeshellarg($target_file) . " " . escapeshellarg($bins) . " " . escapeshellarg($target_class) . " " . implode(' ', array_map('escapeshellarg', $columns)) . " 2>&1";
        exec($command, $output, $return_var);

    } elseif ($strategy !== 'auto' && $autoCheck) {
        $pythonScript = "../python/auto_bins.py";

        $command = "python $pythonScript " . escapeshellarg($target_file) . " " . escapeshellarg($strategy) . " " . escapeshellarg($target_class) . " " . implode(' ', array_map('escapeshellarg', $columns)) . " 2>&1";
        exec($command, $output, $return_var);
    }


    // Check if the command was successful
    if ($return_var !== 0) {
        log_error('Error executing Python script', $output);
        echo json_encode(['error' => 'Error executing Python script']);
        exit;
    }

    // Set Content-Type header
    header('Content-Type: application/json');

    // Include success message in the JSON response
    echo json_encode(['success' => true, 'output' => $output]);
} else {
    log_error('Invalid request method');
    // Add this line to log the received request method

    echo json_encode(['error' => 'Invalid request method']);
}

// Function to log errors
function log_error($message, $data = null) {
    error_log("Error: $message" . ($data ? "\nDetails: " . print_r($data, true) : ''));
}
?>
