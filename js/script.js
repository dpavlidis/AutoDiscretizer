$(document).ready(function () {


    $(".table-container, .checkbox-container, .method-container, .bins-container, .table-container2, .display-div").hide();

    // Function to show/hide the display-div
    function toggleDisplayDiv(selectedValue, isChecked) {
        if (isChecked || selectedValue === 'Auto') {
            $('.display-div').show();
        } else {
            $('.display-div').hide();
        }
    }

    // Event handler for cst-class click
    $('.cst-class').click(function (event) {
        event.preventDefault();
        var selectedValue = $(this).text();
        $('.btn-class').text(selectedValue);
    });

    // Event handler for cst-strategy click
    $('.cst-strategy').click(function (event) {
        event.preventDefault();
        var selectedValue = $(this).text();
        var isChecked = $('#autoCheck').is(':checked');
        $('.btn-method').text(selectedValue);
        toggleDisplayDiv(selectedValue, isChecked);
    });

    // Event handler for autoCheck change
    $('#autoCheck').change(function () {
        var selectedValue = $('.btn-method').text();
        var isChecked = $(this).is(':checked');
        var enterBinsInput = $("#InputBins");
        enterBinsInput.prop("disabled", isChecked);
        $('.btn-method').text(selectedValue);
        toggleDisplayDiv(selectedValue, isChecked);
    });

    // Event handlers for questionIcon mouseover and mouseout
    $('#questionIcon').hover(
        function () { $('#displayText').show(); },
        function () { $('#displayText').hide(); }
    );

    // Event handler for file-input change
    $(document).on('change', '.file-input', function () {
        var filesCount = this.files.length;
        var textbox = $(this).prev();

        if (filesCount === 1) {
            var fileName = this.value.split('\\').pop();
            textbox.text(fileName);
        } else {
            textbox.text('Please select only one file');
        }
    });

//--------------------------------------------------------------------- API:

    $('#uploadBtn').on('click', function () {

        var fileInput = $('.file-input');
        var file = $('.file-input')[0].files[0];

        console.log(file);

        if (!file) {
            
            $(".file-message").text("Please upload a dataset.");
            return;
        }

        var fileType = file.name.split('.').pop().toLowerCase();

        if ($.inArray(fileType, ['csv', 'xlsx', 'xls']) === -1) {
            $(".file-message").text("Please upload a valid CSV, XLSX, or XLS file.");
           
            return;
        }


        if (file) {
            fileInput.prop('disabled', true);
            var formData = new FormData();
            formData.append('file', file);

            $.ajax({
                url: './api/upload_dataset.php',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (response) {
                    console.log("data from upload_dataset.php: " + response);

                    getDatasetContent(response);
                 //   $('#uploadBtn').prop('disabled', true);
            
                    if (response === 'no numeric'){
                        $(".file-message").text("The file must contain at least one numeric column.");
                        fileInput.prop('disabled', false);
                 //       $('#uploadBtn').prop('disabled', false);
                    }

                },
                error: function () {
                    $('#table-container').text('Error uploading file.');
                }
            });
        } else {
         
            $('.file-message').text('Please select a file.');
        }
    });

    var checkboxNames = [];

    function getDatasetContent(dataset_name) {
        console.log(dataset_name);
        $.ajax({
            type: "GET",
            url: "./api/read_dataset.php?dataset=" + dataset_name,
            dataType: "json",
            success: function (response) {

            //    console.log("data from read_dataset.php?: " + response);
                displayTable(response);
                displayCheckboxes(response[0]);
                updateDropdown(response[0]);
           


            },
            error: function (error) {

                console.error("Error getting dataset content:", error);
            }
        });
    }
    
    function displayTable(data) {
        $('.table-container').show();

        var tableHtml = '<table class="table table-bordered table-striped">';


        tableHtml += '<thead><tr>';
        $.each(data[0], function (index, header) {
            tableHtml += '<th>' + header + '</th>';
        });
        tableHtml += '</tr></thead>';


        tableHtml += '<tbody>';
        for (var i = 1; i < data.length; i++) {
            tableHtml += '<tr>';
            $.each(data[i], function (index, cell) {
                tableHtml += '<td class="py-2">' + cell + '</td>';
            });
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody>';

        tableHtml += '</table>';
        $('.table-container').html(tableHtml);
    }

    
    function displayCheckboxes(headers) {
        $('.checkbox-container').show();
        var checkboxHtml = '<form>';
        checkboxNames = [];
        $.each(headers, function (index, header) {
            checkboxHtml += '<div class="form-check form-check-inline">';
            checkboxHtml += '<input class="form-check-input" type="checkbox" id="chk_' + index + '">';
            checkboxHtml += '<label class="form-check-label" for="chk_' + index + '">' + header + '</label>';
            checkboxHtml += '</div>';
            checkboxNames.push(header);

        });
        checkboxHtml += '</form>';

        $('.checkbox-container').html(checkboxHtml);


        $('.form-check-input').on('change', function () {
            var columnIndex = $(this).attr('id').split('_')[1];
            toggleColumn(columnIndex);
        });
    }

    function toggleColumn(columnIndex) {
        $('#previewTable td:nth-child(' + (parseInt(columnIndex) + 1) + '), #previewTable th:nth-child(' + (parseInt(columnIndex) + 1) + ')').toggle();
    }

    function getCheckboxNames() {
        return checkboxNames.filter(function (name, index) {
            return $('#chk_' + index).prop('checked');
        });
    }

    function checkCheckboxStates() {

        var checkedNames = getCheckboxNames();


        return checkedNames;
    }

    function updateDropdown(data) {

        $('.method-container').show();
        $('.bins-container').show();
        // Assuming data is an array of items for the dropdown
        var dropdownMenu = $(".cst-class-dropdown");
    
        // Clear existing dropdown items
        dropdownMenu.empty();
    
        // Iterate through the data and append new items to the dropdown
        data.forEach(function (item, index) {
            var listItem = $("<li>");
            var link = $("<a>", {
                class: "dropdown-item cst-class",
                href: "#",
                text: item
            });
    
            // Add click event to handle item selection
            link.click(function () {
                // Handle item selection here if needed
                console.log("Selected item: " + item);
            });
    
            listItem.append(link);
            dropdownMenu.append(listItem);
        });

        $('.cst-class').click(function (event) {
            event.preventDefault();
            var selectedValue = $(this).text();
            $('.btn-class').text(selectedValue);
        });
    }




































// -----------------------------------------------------------------------------------------------------------------------------

/*

    var checkboxNames = [];
    var checkboxNames2 = [];


    $('#submitBtn').on('click', function () {

        $('#message').show();
        $('#submitBtn').prop('disabled', true);
        $('#spinner-border').show();
        var fileInput = $('#formFile')[0].files[0];
        var bins = $('#numberInput').val();
        console.log(bins);

        if (bins < 2) {
            $('#message').text('Please add number of bins greater than or equal to 2.');
            $('#spinner-border').hide();
            $('#submitBtn').prop('disabled', false);
        } else {


            if (fileInput) {
                var formData = new FormData();
                var dataset_name = fileInput.name;

                checkboxNames2 = checkCheckboxStates();

                console.log(checkboxNames2);

                formData.append('file', fileInput);
                formData.append('dataset_name', dataset_name);
                formData.append('checkboxNames2', JSON.stringify(checkboxNames2));
                formData.append('bins', bins);

                $.ajax({
                    url: './api/naive_bayes.php',
                    type: 'POST',
                    data: formData,
                    contentType: false,
                    processData: false,
                    dataType: 'json',
                    success: function (response) {

                        console.log("data from naive_bayes.php: " + response);

                        $('#spinner-border').show();
                        $('#resultTableHead').empty();
                        $('#resultTableBody').empty();

                        Object.keys(response).forEach((key) => {
                            $('#resultTableHead').append(`<th>${key}</th>`);
                        });


                        $('#resultTableBody').append('<tr>');
                        Object.values(response).forEach((value) => {
                            $('#resultTableBody').append(`<td>${value}</td>`);
                        });
                        $('#resultTableBody').append('</tr>');
                        $('#spinner-border').hide();
                        $('#submitBtn').prop('disabled', false);

                    },
                    error: function () {
                        console.log("Error discretize");
                        $('#spinner-border').hide();
                        $('#submitBtn').prop('disabled', false);
                    }
                });
            } else {
                console.log("Error discretize: No file selected");
                $('#message').text('Error discretize: No file selected');
                $('#table-container').hide();
                $('.form-check').hide();
                $('#resultTable').hide();
                $('.container').hide();
                $('#spinner-border').hide();
                $('#submitBtn').prop('disabled', false);
            }
        }
    });


    $('#uploadBtn').on('click', function () {

        var fileInput = $('#formFile')[0].files[0];

        if (fileInput) {
            var formData = new FormData();
            formData.append('file', fileInput);

            $.ajax({
                url: './api/upload_dataset.php',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (response) {
                    console.log("data from upload_dataset.php: " + response);

                    getDatasetContent(response);
                    $('.container').show();

                },
                error: function () {
                    $('.form-check').hide();
                    $('#resultTable').hide();
                    $('.container').hide();
                    $('#message').text('');
                    $('#table-container').text('Error uploading file. The file must contain only numeric values.');
                }
            });
        } else {
            $('.form-check').hide();
            $('#resultTable').hide();
            $('.container').hide();
            $('#spinner-border').hide();
            $('#message').text('');
            $('#table-container').text('Please select a file.');
        }
    });

    function displayTable(data) {
        var tableHtml = '<table class="table table-bordered table-striped custom-table">';


        tableHtml += '<thead><tr>';
        $.each(data[0], function (index, header) {
            tableHtml += '<th>' + header + '</th>';
        });
        tableHtml += '</tr></thead>';


        tableHtml += '<tbody>';
        for (var i = 1; i < data.length; i++) {
            tableHtml += '<tr>';
            $.each(data[i], function (index, cell) {
                tableHtml += '<td class="py-2">' + cell + '</td>';
            });
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody>';

        tableHtml += '</table>';
        $('#table-container').html(tableHtml);
        $('#message').text('Dataset successfully uploaded!');
    }


    var checkboxNames = [];

    function displayCheckboxes(headers) {
        var checkboxHtml = '<form>';
        checkboxNames = [];
        $.each(headers, function (index, header) {
            checkboxHtml += '<div class="form-check form-check-inline">';
            checkboxHtml += '<input class="form-check-input" type="checkbox" id="chk_' + index + '">';
            checkboxHtml += '<label class="form-check-label" for="chk_' + index + '">' + header + '</label>';
            checkboxHtml += '</div>';
            checkboxNames.push(header);

        });
        checkboxHtml += '</form>';

        $('#checkbox-container').html(checkboxHtml);


        $('.form-check-input').on('change', function () {
            var columnIndex = $(this).attr('id').split('_')[1];
            toggleColumn(columnIndex);
        });
    }

    function toggleColumn(columnIndex) {
        $('#previewTable td:nth-child(' + (parseInt(columnIndex) + 1) + '), #previewTable th:nth-child(' + (parseInt(columnIndex) + 1) + ')').toggle();
    }

    function getCheckboxNames() {
        return checkboxNames.filter(function (name, index) {
            return $('#chk_' + index).prop('checked');
        });
    }


    function checkCheckboxStates() {

        var checkedNames = getCheckboxNames();


        return checkedNames;
    }


    function getDatasetContent(dataset_name) {
        $.ajax({
            type: "GET",
            url: "./api/read_dataset.php?dataset=" + dataset_name,
            dataType: "json",
            success: function (response) {

                console.log("data from read_dataset.php?: " + response);
                displayTable(response);
                displayCheckboxes(response[0]);
                $('#submitBtn').show();


            },
            error: function (error) {

                console.error("Error getting dataset content:", error.responseText);
            }
        });
    }
    */


});
