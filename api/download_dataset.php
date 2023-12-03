<?php
// Get the filename from the query string
$filename = $_GET['dataset'];

// Validate and sanitize the filename
$filename = basename($filename); // Get the basename to remove any path information
$filename = preg_replace('/[^a-zA-Z0-9_.-]/', '', $filename); // Remove any characters not allowed

// Set headers for file download
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');

// Path to the folder containing datasets
$folder = '../binned_datasets/';

// Full path to the file
$filepath = $folder . $filename;

// Check if the file exists before outputting its content
if (file_exists($filepath)) {
    // Output the file content
    readfile($filepath);
} else {
    // Handle the case when the file doesn't exist
    echo "File not found!";
}
?>
