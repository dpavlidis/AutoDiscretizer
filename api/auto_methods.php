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

if (!isset($data['dataset'], $data['checkedCheckboxes'], $data['strategy'], $data['bins'], $data['target_class'], $data['autoCheck'])) {
    log_error('Invalid JSON structure');
    echo json_encode(['error' => 'Invalid JSON structure']);
    exit;
}

    $dataset_name = $data['dataset'];
    $columns = $data['checkedCheckboxes']; 
    $strategy = strtolower($data['strategy']);
    $bins = $data['bins'];
    $target_class = $data['target_class'];
    $autoCheck = $data['autoCheck'];

    if (in_array($target_class, $columns)) {
        log_error('Target class found in columns');
        echo json_encode(['error' => 'Target class cannot be discretized! Please remove from columns the target class.']);
        exit;
    }

    $target_dir = "../datasets/";
    $target_file = $target_dir . basename($dataset_name);

    if (!file_exists($target_file) || !is_readable($target_file)) {
        log_error('Invalid target file path');
        echo json_encode(['error' => 'Invalid target file path']);
        exit;
    }

    if ($strategy === 'auto' && $autoCheck === 1) {
        $pythonScript = "../python/auto_all.py";
        $command = "python $pythonScript " . escapeshellarg($target_file) . " " . escapeshellarg($target_class) . " " . implode(' ', array_map('escapeshellarg', $columns)) . " 2>&1";
       exec($command, $output, $return_var);

    } elseif ($strategy === 'auto' && $autoCheck === 0) {
        $pythonScript = "../python/auto_strategy.py";

        $command = "python $pythonScript " . escapeshellarg($target_file) . " " . escapeshellarg($bins) . " " . escapeshellarg($target_class) . " " . implode(' ', array_map('escapeshellarg', $columns)) . " 2>&1";
        exec($command, $output, $return_var);

    } elseif ($strategy !== 'auto' && $autoCheck === 1) {
        $pythonScript = "../python/auto_bins.py";

        $command = "python $pythonScript " . escapeshellarg($target_file) . " " . escapeshellarg($strategy) . " " . escapeshellarg($target_class) . " " . implode(' ', array_map('escapeshellarg', $columns)) . " 2>&1";
        exec($command, $output, $return_var);
    } else {
        echo json_encode(['error' => 'Unsupported combination of strategy and autoCheck']);
        exit;
    }

    if ($return_var !== 0) {
        log_error('Error executing Python script', $output);
        echo json_encode(['error' => 'Error executing Python script']);
        exit;
    }

    header('Content-Type: application/json');
    echo json_encode(['output' => $output], JSON_PRETTY_PRINT);
} else {
    log_error('Invalid request method');
    echo json_encode(['error' => 'Invalid request method']);
}

function log_error($message, $data = null) {
    error_log("Error: $message" . ($data ? "\nDetails: " . print_r($data, true) : ''));
}
?>
