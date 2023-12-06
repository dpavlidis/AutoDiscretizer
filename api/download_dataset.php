<?php

$filename = $_GET['dataset'];

$filename = basename($filename);
$filename = preg_replace('/[^a-zA-Z0-9_.-]/', '', $filename);

header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$folder = '../binned_datasets/';

$filepath = $folder . $filename;

if (file_exists($filepath)) {
    readfile($filepath);
} else {
    echo "File not found!";
}
?>
