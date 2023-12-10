$(document).ready(function () {

    $(".table-outer-container, .checkbox-container, .method-container, .bins-container, .table-outer-container2, .display-div, .down-but, .spinner-cst1").hide();

    var currentPath = window.location.pathname;

    currentPath = currentPath.slice(1);

    $('.navbar-nav a').each(function () {
        var linkPath = $(this).attr('href');
        if (linkPath === currentPath) {
            $(this).addClass('active');
        }
    });

    function toggleDisplayDiv(selectedValue, isChecked) {
        if (isChecked || selectedValue === 'Auto') {
            $('.display-div').show();
        } else {
            $('.display-div').hide();
        }
    }

    $('.cst-class').click(function (event) {
        event.preventDefault();
        var selectedValue = $(this).text();
        $('.btn-class').text(selectedValue);
    });

    $('.cst-strategy').click(function (event) {
        event.preventDefault();
        var selectedValue = $(this).text();
        var isChecked = $('#autoCheck').is(':checked');
        $('.btn-method').text(selectedValue);
        toggleDisplayDiv(selectedValue, isChecked);
    });

    $('#autoCheck').change(function () {
        var selectedValue = $('.btn-method').text();
        var isChecked = $(this).is(':checked');
        var enterBinsInput = $("#InputBins");
        enterBinsInput.prop("disabled", isChecked);
        $('.btn-method').text(selectedValue);
        toggleDisplayDiv(selectedValue, isChecked);
    });

    $('#questionIcon').hover(
        function () { $('#displayText').show(); },
        function () { $('#displayText').hide(); }
    );

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

    $('.file-input').on('change', function () {
        $(".table-outer-container, .checkbox-container, .method-container, .bins-container, .table-outer-container2, .display-div, .down-but, .spinner-cst1").hide();
    });

    $('.navbar-nav a').on('click', function () {
        $('.navbar-nav a').removeClass('active');
        $(this).addClass('active');
    });

    //--------------------------------------------------------------------- API:

    $('#uploadBtn').on('click', function () {

        $('.spinner-cst1').show();


        var fileInput = $('.file-input');

        var file = $('.file-input')[0].files[0];
        console.log(file);


        if (!file) {

            $(".file-message").text("Please upload a dataset.");
            $(".table-outer-container, .checkbox-container, .method-container, .bins-container, .table-outer-container2, .display-div, .down-but, .spinner-cst1").hide();
            return;
        }

        var fileType = file.name.split('.').pop().toLowerCase();

        if ($.inArray(fileType, ['csv', 'xlsx', 'xls']) === -1) {
            $(".file-message").text("Please upload a valid CSV, XLSX, or XLS file.");
            $(".table-outer-container, .checkbox-container, .method-container, .bins-container, .table-outer-container2, .display-div, .down-but, .spinner-cst1").hide();
            return;
        }

        if (file) {

         //   $('#uploadBtn').prop('disabled', true);
            $('#uploadBtn').addClass('disabled');
            // fileInput.prop('disabled', true);
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
                        $(".table-outer-container, .checkbox-container, .method-container, .bins-container, .table-outer-container2, .display-div, .down-but, .spinner-cst1").hide();
                        $('#uploadBtn').prop('disabled', false);
                   //     fileInput.prop('disabled', false);
                        //       $('#uploadBtn').prop('disabled', false);
                        return;
                    }

                    var flag = false;
                    getDatasetContent(response, flag);
                    $('#uploadBtn').removeClass('disabled')
                    $('.table-outer-container2').hide();
                    $('.down-but').hide();
                  

                },
                error: function () {
                    $('.spinner-cst1').hide();
                    $('#uploadBtn').prop('disabled', false);
                    $('#table-container').text('Error uploading file.');
                }
            });
        } else {
            $('.spinner-cst1').hide();
            $('#uploadBtn').prop('disabled', false);
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
                //   console.log("Dataset:", response.data);
                //   console.log("Numeric Columns:", response.numericColumns);

                if (flag === false) {
                    displayTable(response.dataset, flag);
                    displayCheckboxes(response.numericColumns);
                    updateDropdown(response.categoricalIntegerColumns);
                } else if (flag === true) {
                    displayTable(response.dataset, flag);
                } else {
                    console.log("error flag");
                }
                $('.spinner-cst1').hide();
            },
            error: function (error) {
                $('.spinner-cst1').hide();
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
            for (var i = 1; i < 20; i++) {
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
            for (var i = 1; i < 20; i++) {
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
            var checkboxIndex = checkboxId.split('_')[1];
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
        var dropdownMenu = $(".cst-class-dropdown");

        dropdownMenu.empty();

        data.forEach(function (item, index) {
            var listItem = $("<li>");
            var link = $("<a>", {
                class: "dropdown-item cst-class",
                href: "#",
                text: item
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

        var isValid = true;

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

        if ($('.display-div').is(':visible')) {
            if (!target_class || target_class === 'Pick Class') {
                isValid = false;
                alert("Please select a target class!");
            }
        }


        if (isValid && autoCheck === false && strategy != 'Auto') {
            console.log("All checks passed. Proceeding with further actions.");
            $('.spinner-cst2').show();

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
                    // target_clas: target_clas, 
                }),
                contentType: 'application/json',
                dataType: 'json',
                success: function (response) {

                    console.log("data from KBinsDiscretizer.php: " + response);
                    //   $('#spinner-border').show();
                    var flag = true;
                    getDatasetContent(dataset, flag);
                    $('.spinner-cst2').hide();


                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $('.spinner-cst2').hide();
                    console.log("Error during discretize:", textStatus, errorThrown);
                    // $('#spinner-border').hide();
                    $('.cst-Disc').prop('disabled', false);
                }
            });



        } else if (isValid && (autoCheck === true || strategy === 'Auto')) {
            $('.spinner-cst2').show();
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
                    $('.spinner-cst2').hide();


                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $('.spinner-cst2').hide();
                    console.log("Error during discretize:", textStatus, errorThrown);
                    // $('#spinner-border').hide();
                    $('.cst-Disc').prop('disabled', false);
                }
            });

        }

        else {
            $('.spinner-cst2').hide();
            console.log("Some checks failed. Please address the issues.");
        }

    });


    $('.down-but').on('click', function () {

        var file = $('.file-input')[0].files[0];
        var dataset = file.name;

        var link = document.createElement('a');
        link.href = './api/download_dataset.php?dataset=' + encodeURIComponent(dataset);

        link.click();

    });



});
