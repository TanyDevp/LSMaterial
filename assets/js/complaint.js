(function (window, $) {
    $.ajax({
        type: 'POST',
        url: posturl + 'Complaint/ShowSurvey',
        data: { SessionKey: localStorage.lsid },
        success: function (data) {
            var ApiResult = CheckApi(data);
            if (!ApiResult) {
                return;
            }
            if (data.IsErr) {
                alertModal('服务器出了点小问题，请骚后尝试操作！');
            }
            else {
                if (data.data.length > 0) {
                    $('#complist').html(data.data.map(function (k) {
                        return '<li><a class="compli" Guid="' + k.Guid + '" type="' + k.SubType + '" title="' + k.Title + '" href="javascript:void(0)" target="_blank" ><span>[' + k.SubType + ']</span>&nbsp;<span class="new_title">' + (k.Title || '') + '</span><span class="new_date am-fr">[' + ChangeDate(k.LastDate) + ']</span></a></li>';
                    }).join(''));

                    $('.compli').click(function () {
                        var guid = $(this).attr('Guid');
                        var type = $(this).attr('type');
                        var title = $(this).attr('title');
                        window.open('http://119.145.166.182:8806/bsprt/html-Supplier/Complaint.html?sgn=' + localStorage.lsid + '&type=' + type + '&title=' + title + '&Guid=' + guid);
                    });
                }
                else {
                    $('#complist').html('<li><a><span class="new_title">...</span></a></li>');
                }
            }
        },
        dataType: 'json'
    });

    $('#fq_complaint').click(function () {
        window.open('http://119.145.166.182:8806/bsprt/html-Supplier/Complaint.html?sgn=' + localStorage.lsid + '');
    });
})(window, $)