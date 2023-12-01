<?php
header("Access-Control-Allow-Origin: *");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $dataset_name = $_POST['dataset_name'];
    $bins = $_POST['bins'];
    $target_dir = "uploads/";

    $pythonScript = "../python/naive_bayes.py";
    $output = array();

    $target_file = $target_dir . basename($dataset_name);
    
    $checkboxNames2 = json_decode($_POST['checkboxNames2'], true);
    
    $escapedArguments = array_map('escapeshellarg', $checkboxNames2);
    $checkboxNamesString = implode(' ', $escapedArguments);
    
    $command = "python $pythonScript $target_file $bins $checkboxNamesString 2>&1";
    exec($command, $output);

    header('Content-Type: application/json');

    $pythonOutput = json_decode($output[0], true);

    echo json_encode($pythonOutput, JSON_UNESCAPED_UNICODE);

} else {
    
    echo "Invalid request method";
}

?>
