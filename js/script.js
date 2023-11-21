$(document).ready(function () {

    var checkboxNames = [];
    var checkboxNames2 = [];


    $(document).on('change', '.file-input', function() {
        var filesCount = $(this)[0].files.length;
        var textbox = $(this).prev();
      
        if (filesCount === 1) {
          var fileName = $(this).val().split('\\').pop();
          textbox.text(fileName);
        } else {
          textbox.text('Please select only one file');
        }
      });

      
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


});
