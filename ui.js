    $(function() {
        $('#toggle-cases').click(function() {
            $(this).parent().toggleClass('active');
        });
    });


    $('#submit').click(function onClick(e) {


        var keyword = $('#keyword').val();
        var hostId = $('#hostId').val();
        var serviceId = $('#serviceId').val();
        var mode = $('input[name="mode"]:checked').val();

        if (mode === 'services') {
            var result = search({
                hostId: hostId,
                keyword: keyword,
                mode: mode
            });
        }

        if (mode === 'operations') {
            var result = search({
                hostId: hostId,
                serviceId: serviceId,
                keyword: keyword,
                mode: mode
            });
        }

        $('#output').html(JSON.stringify(result));

    });
