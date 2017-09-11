

(function (window, $) {

    $(function () {
        $('#city-picker').citypicker();
        $('.city-picker .am-close').click(function () {
            $(this).siblings('.form-control').citypicker('reset');
        });
        load();
    });

    function load() {
        $.ajax({
            type: 'POST',
            url: posturl + 'PurchaseContact/Show',
            data: {
                SessionKey: localStorage.lsid,
            },
            success: function (data) {
                var ApiResult = CheckApi(data);
                if (!ApiResult) {
                    return;
                }
                //----------------------------------
                if (!data.IsErr) {
                    $('.am-thumbnails').html(data.data.map(function (k) {
                        return '<li class="user-addresslist ' + (k.IsDefault == 0 ? 'defaultOhter' : 'defaultAddr') + '">\
                            <span class="new-option-r" guid="'+ k.Guid + '"><i class="am-icon-check-circle"></i>默认地址</span>\
                            <p class="new-tit new-p-re">\
                                <span class="new-txt">'+ k.PersonName + '</span>\
                                <span class="new-txt-rd2">'+ k.TelPhone + '</span>\
                            </p>\
                            <div class="new-mu_l2a new-p-re">\
                                <p class="new-mu_l2cw">\
                                    <span class="title">地址：</span>\
                                    '+ k.PostalAddress + '\
                            </div>\
                            <div class="new-addr-btn">\
                                <a href="javascript:void(0);"  name="edit_adress"  guid="'+ k.Guid + '"><i class="am-icon-edit"></i>修改</a>\
                                <span>|</span>\
                                <a href="javascript:void(0);" name="del_adress"  guid="'+ k.Guid + '"><i class="am-icon-trash"></i>删除</a>\
                            </div>\
                        </li>';
                    }));

                    $('.defaultOhter .new-option-r').click(function () {
                        var guid = $(this).attr('guid');
                        $.ajax({
                            type: 'POST',
                            url: posturl + 'PurchaseContact/Update',
                            data: {
                                SessionKey: localStorage.lsid,
                                IsDefault: 1,
                                Guid: guid,
                            },
                            success: function (data) {
                                var ApiResult = CheckApi(data);
                                if (!ApiResult) {
                                    return;
                                }
                                //----------------------------------
                                if (!data.IsErr) {
                                    location.reload();
                                }
                                else {
                                    alertModal('服务器出了点小问题，请骚后尝试操作！');
                                    return;
                                }
                            }
                        });
                    });

                    $('a[name="del_adress"]').popover({
                        content: '<table class="suretable"><tr><td colspan="2">确认是否删除？</td></tr><tr><td><button status="close" class="am-btn am-btn-xs">取消</button></td><td><button class="am-btn am-btn-xs" onclick="deladdress(this)">确定</button></td></tr></table>',
                    }).on('open.popover.amui', function (e) {
                        delguid = $(e.target).attr('guid');
                    }).on('close.popover.amui', function (e) {
                        delguid = '';
                    });

                    $('a[name="edit_adress"]').click(function () {
                        var guid = $(this).attr('guid');
                        var tData = data.data.filter(x => x.Guid == guid)[0];
                        $('#edit-name').val(tData.PersonName);
                        $('#edit-phone').val(tData.TelPhone);
                        var cityFb = tData.PostalAddress.split(' ');
                        if (cityFb.length > 2) {
                            $('#edit-picker').citypicker('reset').citypicker('destroy');
                            $('#edit-picker').citypicker({
                                province: cityFb[0],
                                city: cityFb[1],
                                district: (cityFb.length > 3 ? cityFb[2] : '')
                            });
                            $('#edit-intro').val(cityFb[cityFb.length - 1]);
                        }
                        else {
                            $('#edit-picker').citypicker('reset');
                            $('#edit-intro').val(tData.PostalAddress);
                        }
                        $('#address_modal').modal({
                            closeViaDimmer: false,
                            closeOnConfirm: false,
                            onConfirm: function (e) {
                                var city = $('#edit-picker').val();
                                var iserr = false;
                                $('#address_modal .am-form-horizontal .am-input').each(function () {
                                    if (!$(this).val()) {
                                        $(this).addClass('input-err');
                                        iserr = true;
                                    }
                                });
                                if (!city) {
                                    $('#address_modal .city-picker-span').addClass('input-err');
                                    iserr = true;
                                }
                                if (iserr) {
                                    return;
                                }
                                var user = $('#edit-name').val();
                                var phone = $('#edit-phone').val();
                                var intro = $('#edit-intro').val();
                                $.ajax({
                                    type: 'POST',
                                    url: posturl + 'PurchaseContact/Update',
                                    data: {
                                        SessionKey: localStorage.lsid,
                                        PostalAddress: city + ' ' + intro,
                                        PersonName: user,
                                        TelPhone: phone,
                                        Guid: tData.Guid
                                    },
                                    success: function (data) {
                                        var ApiResult = CheckApi(data);
                                        if (!ApiResult) {
                                            return;
                                        }
                                        //----------------------------------
                                        if (!data.IsErr) {
                                            location.reload();
                                        }
                                        else {
                                            alertModal('服务器出了点小问题，请骚后尝试操作！');
                                            return;
                                        }
                                    }
                                });
                            },
                            onCancel: function () {
                            }
                        });


                    })
                }
                else {
                    alertModal('服务器出了点小问题，请骚后尝试操作！');
                    return;
                }
            },
            dataType: 'json'
        });

    }

    $('#reset_from').click(function () {
        $('.am-form-horizontal .am-input').removeClass('border-red').val(null);
        $('.city-picker-span').removeClass('border-red');
        $('#city-picker').citypicker('reset');
    });

    $('.am-form-horizontal .am-input').change(function () {
        $(this).removeClass('border-red');
    });
    $('.city-picker-span').click(function () {
        $(this).removeClass('border-red');
    });

    $('#save_from').click(function () {
        var city = $('#city-picker').val();
        var iserr = false;
        $('.am-form-horizontal .am-input').each(function () {
            if (!$(this).val()) {
                $(this).addClass('border-red');
                iserr = true;
            }
        });
        if (!city) {
            $('.city-picker-span').addClass('border-red');
            iserr = true;
        }
        if (iserr) {
            return;
        }
        var user = $('#user-name').val();
        var phone = $('#user-phone').val();
        var intro = $('#user-intro').val();
        $.ajax({
            type: 'POST',
            url: posturl + 'PurchaseContact/Add',
            data: {
                SessionKey: localStorage.lsid,
                PostalAddress: city + ' ' + intro,
                PersonName: user,
                TelPhone: phone
            },
            success: function (data) {
                var ApiResult = CheckApi(data);
                if (!ApiResult) {
                    return;
                }
                //----------------------------------
                if (!data.IsErr) {
                    location.reload();
                }
                else {
                    alertModal('服务器出了点小问题，请骚后尝试操作！');
                    return;
                }
            }
        });
    });

    $('body').click(function (e) {
        var $target = $(e.target);
        if ($target.attr('name') == 'del_adress') {
            return false;
        }
        if ($target.parents('.am-popover').length > 0 && $target.attr('status') != 'close') {
            return false;
        }
        $('a[name="del_adress"]').popover('close');
    });
})(window, $)

var delguid = '';
function deladdress(o) {
    $.ajax({
        type: 'POST',
        url: posturl + 'PurchaseContact/Cdelete',
        data: {
            SessionKey: localStorage.lsid,
            Guid: delguid,
        },
        success: function (data) {
            var ApiResult = CheckApi(data);
            if (!ApiResult) {
                return;
            }
            //----------------------------------
            if (!data.IsErr) {
                location.reload();
            }
            else {
                alertModal('服务器出了点小问题，请骚后尝试操作！');
                return;
            }
        }
    });
}