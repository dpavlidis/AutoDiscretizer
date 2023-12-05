$(document).ready(function () {


    $(".table-outer-container, .checkbox-container, .method-container, .bins-container, .table-outer-container2, .display-div").hide();


    var currentPath = window.location.pathname;

    // Remove the leading slash
    currentPath = currentPath.slice(1);

    // Add the active class to the corresponding nav link
    $('.navbar-nav a').each(function() {
      var linkPath = $(this).attr('href');
      if (linkPath === currentPath) {
        $(this).addClass('active');
      }
    });

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
                    console.log("data response from upload_dataset.php: " + response);

                    if (response === 'no numeric') {
                        $(".file-message").text("The file must contain at least one numeric column.");
                        fileInput.prop('disabled', false);
                        //       $('#uploadBtn').prop('disabled', false);
                        return;
                    }
                    
                    var flag = false;
                    getDatasetContent(response, flag);
                    //   $('#uploadBtn').prop('disabled', true);

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

    function getDatasetContent(dataset_name, flag) {
        console.log("dataset name : " + dataset_name);
        $.ajax({
            type: "GET",
            url: "./api/read_dataset.php?dataset=" + dataset_name + "&binned=" + flag,
            dataType: "json",
            success: function (response) {
                console.log(response);

                // Log the dataset and numeric columns to the console
                //   console.log("Dataset:", response.data);
                //   console.log("Numeric Columns:", response.numericColumns);

                // Display the table, checkboxes, and update the dropdown
                if (flag === false) {
                    displayTable(response.dataset, flag);
                    displayCheckboxes(response.numericColumns);
                    updateDropdown(response.dataset[0]);
                } else if (flag === true) {
                    displayTable(response.dataset, flag);
                } else {
                    console.log("error flag");
                }
            },
            error: function (error) {
                console.error("Error getting dataset content:", error);
            }
        });
    }



    function displayTable(data, flag) {

        if (flag === false) {
            $('.table-outer-container').show();

            var tableHtml = '<table class="table table-bordered table-striped">';

            tableHtml += '<thead><tr>';
            $.each(data[0], function (index, header) {
                tableHtml += '<th>' + header + '</th>';
            });
            tableHtml += '</tr></thead>';

            tableHtml += '<tbody>';
            for (var i = 1; i < 30; i++) {
                tableHtml += '<tr>';
                $.each(data[i], function (index, cell) {
                    tableHtml += '<td class="py-2">' + cell + '</td>';
                });
                tableHtml += '</tr>';
            }
            tableHtml += '</tbody>';

            tableHtml += '</table>';
            $('.table-container').html(tableHtml);

        } else if (flag === true) {
            $('.table-outer-container2').show();

            var tableHtml = '<table class="table table-bordered table-striped">';

            tableHtml += '<thead><tr>';
            $.each(data[0], function (index, header) {
                tableHtml += '<th>' + header + '</th>';
            });
            tableHtml += '</tr></thead>';

            tableHtml += '<tbody>';
            for (var i = 1; i < 30; i++) {
                tableHtml += '<tr>';
                $.each(data[i], function (index, cell) {
                    tableHtml += '<td class="py-2">' + cell + '</td>';
                });
                tableHtml += '</tr>';
            }
            tableHtml += '</tbody>';

            tableHtml += '</table>';
            $('.table-container2').html(tableHtml);
            $('.down-but').show();

        } else {
            console.log("error flag");
        }
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


    }


    function getCheckedCheckboxes() {
        var checkedCheckboxes = [];

        $('.checkbox-container input[type="checkbox"]:checked').each(function () {
            var checkboxId = $(this).attr('id');
            var checkboxIndex = checkboxId.split('_')[1]; // Extract index from checkbox ID
            var checkboxName = checkboxNames[checkboxIndex];
            checkedCheckboxes.push(checkboxName);
        });

        return checkedCheckboxes;
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

            /*
            // Add click event to handle item selection
            link.click(function () {
                // Handle item selection here if needed
                console.log("Selected item: " + item);
            });
            */

            listItem.append(link);
            dropdownMenu.append(listItem);
        });

        $('.cst-class').click(function (event) {
            event.preventDefault();
            var selectedValue = $(this).text();
            $('.btn-class').text(selectedValue);
        });
    }


    $('.cst-Disc').on('click', function () {

        var file = $('.file-input')[0].files[0];
        console.log("file-input: " + file.name);

        var bins = $('#InputBins').val();
        console.log("bins: " + bins);

        var strategy = $('.btn-method').text().trim();
        console.log("strategy: " + strategy);

        var target_class = $('.btn-class').text().trim();
        console.log("class: " + target_class);

        var checkedCheckboxes = getCheckedCheckboxes();
        console.log(checkedCheckboxes);

        var checkBox = $("#autoCheck");
        var autoCheck = false;

        if (checkBox.prop("checked")) {
            console.log("Checkbox is checked");
            autoCheck = true;
        } else {
            console.log("Checkbox is not checked");
            autoCheck = false;
        }

        var isValid = true; // Assume everything is valid initially

        if (!file) {
            isValid = false;
            alert("Please select a file!");
        }

        if (checkedCheckboxes.length === 0) {
            isValid = false;
            alert("Please check columns for discretization!");
        }

        if (!strategy || strategy === 'Method') {
            isValid = false;
            alert("Please select a strategy!");
        }

        if ((!bins || bins < 2 || bins > 20) && autoCheck === false) {
            isValid = false;
            alert("Please enter a value for bins between 2-20!");
        }

        if (!target_class || target_class === 'Pick one') {
            isValid = false;
            alert("Please select a target class!");
        }
        



        if (isValid && autoCheck === false && strategy!= 'Auto') {
            console.log("All checks passed. Proceeding with further actions.");

            //  $('#spinner-border').hide();
            $('.cst-Disc').prop('disabled', false);

            var dataset = file.name;
            console.log(dataset);

            $.ajax({
                url: './api/KBinsDiscretizer.php',
                type: 'POST',
                data: JSON.stringify({
                    dataset: dataset,
                    checkedCheckboxes: checkedCheckboxes,
                    strategy: strategy,
                    bins: bins,
                    // target_clas: target_clas, // uncomment this line if needed
                }),
                contentType: 'application/json',
                dataType: 'json',
                success: function (response) {

                    console.log("data from KBinsDiscretizer.php: " + response);
                    //   $('#spinner-border').show();
                    var flag = true;
                    getDatasetContent(dataset, flag);


                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("Error during discretize:", textStatus, errorThrown);
                    // Uncomment the following line if you want to hide a spinner in case of an error
                    // $('#spinner-border').hide();
                    $('.cst-Disc').prop('disabled', false);
                }
            });



        } else if (isValid && (autoCheck === true || strategy === 'Auto')) {
            console.log("All checks passed. Proceeding with further actions.");

            //  $('#spinner-border').hide();
            $('.cst-Disc').prop('disabled', false);

            var dataset = file.name;
            console.log(dataset);

            $.ajax({
                url: './api/auto_methods.php',
                type: 'POST',
                data: JSON.stringify({
                    dataset: dataset,
                    checkedCheckboxes: checkedCheckboxes,
                    strategy: strategy,
                    bins: bins,
                    target_class: target_class,
                    autoCheck: autoCheck,
                }),
                contentType: 'application/json',
                dataType: 'json',
                success: function (response) {

                    console.log("data from auto_bins.php: " + response);
                    //   $('#spinner-border').show();
                    var flag = true;
                    getDatasetContent(dataset, flag);


                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("Error during discretize:", textStatus, errorThrown);
                    // Uncomment the following line if you want to hide a spinner in case of an error
                    // $('#spinner-border').hide();
                    $('.cst-Disc').prop('disabled', false);
                }
            });



        }
        
        
        
        else {
            console.log("Some checks failed. Please address the issues.");
        }




    });



    $('.down-but').on('click', function () {

        var file = $('.file-input')[0].files[0];
        var dataset = file.name;

        var link = document.createElement('a');
        link.href = './api/download_dataset.php?dataset=' + encodeURIComponent(dataset);
       // link.target = '_blank'; // Open in a new tab/window

        // Trigger a click on the anchor element
        link.click();


    });




});
