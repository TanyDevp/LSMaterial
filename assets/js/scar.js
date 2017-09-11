(function (window, $) {

    var rData = [];

    var sureData = [];

    $(function () {
        load();
        $('#city-picker').citypicker();

        $('.city-picker .am-close').click(function () {
            $('#city-picker').citypicker('reset');
        });
    });

    var checklist = [];
    //绑定事件
    function bindbase(data) {
        $('.text_box').keyup(function () {
            var val = $(this).val();
            var index = $(this).parents('.item-content').attr('index');
            var tdata = data.data[index];
            var reg = /^((\d+)|([0-9]+\.[0-9]{0,4}))$/;
            var _this = this;
            if (!reg.test(val)) {
                val = tdata.Qty;
                $(_this).val(val);
                return;
            }
            if (val > 999999) {
                val = 999999;
            }
            else if (val == 0) {
                return;
            }
            else if (val < 0) {
                val = 1;
                return;
            }
            updateNum(tdata.Guid, val, function () {
                tdata.Qty = val;
                $(_this).val(val);
                totalPrice(data);
                var pirce = tdata.HasTax == 1 ? tdata.PriceN : tdata.Price;
                $('.car_price_' + tdata.ID + ' em').html('￥' + (pirce * val).toFixed(3));
            });

        });
        $('.text_box').change(function () {
            var _this = this;
            var index = $(this).parents('.item-content').attr('index');
            var tdata = data.data[index];
            var val = $(this).val();
            if (val <= 0) {
                val = 1;
            }
            updateNum(tdata.Guid, val, function () {
                tdata.Qty = val;
                $(_this).val(val);
                totalPrice(data);
                var pirce = tdata.HasTax == 1 ? tdata.PriceN : tdata.Price;
                $('.car_price_' + tdata.ID + ' em').html('￥' + (pirce * val).toFixed(3));
            });
        });
        $('.sl .am-btn').click(function () {
            var $input = $(this).siblings('.text_box');
            var val = $input.val();
            var index = $(this).parents('.item-content').attr('index');
            var tdata = data.data[index];
            if ($(this).hasClass('add')) {
                if (val < 999999) {
                    val = Number(val) + 1;
                    if (val.toString().substr(val.toString().indexOf('.') + 1).length > 4) {
                        val = Math.round(val * 10000) / 10000;
                    }
                }
            }
            else {
                if (val > 1) {
                    val = Number(val) - 1;
                    if (val.toString().substr(val.toString().indexOf('.') + 1).length > 4) {
                        val = Math.round(val * 10000) / 10000;
                    }
                }
            }
            updateNum(tdata.Guid, val, function () {
                tdata.Qty = val;
                $input.val(val);
                totalPrice(data);
                var pirce = tdata.HasTax == 1 ? tdata.PriceN : tdata.Price;
                $('.car_price_' + tdata.ID + ' em').html('￥' + (pirce * val).toFixed(3));
            });
        });

        $('.supplier-checkbox .check').change(function () {
            var tid = $(this).attr('tid');
            $('input[tid="car_item_' + tid + '"]').prop("checked", $(this).is(':checked'));
        });

        $('.check').change(function () {
            totalPrice(data);
            var checklen = $('.cart-checkbox .check:checked').length;
            $('.item_num').html(checklen);
        });

        $('.delete').click(function () {
            var index = $(this).parents('.item-content').attr('index');
            var tdata = data.data[index];
            updateNum(tdata.Guid, 0, function (rdata) {
                localStorage.carqty = rdata.Qty;
                $('#carqty').html(localStorage.carqty);
                load(function (data) {
                    totalPrice(data);
                });
            });
        });

        $('.sc_hs').change(function () {
            var _thisp = $(this).parents('.item-content');
            var index = _thisp.attr('index');
            var tdata = data.data[index];
            var val = $(this).is(':checked') == true ? 2 : 1;
            $.ajax({
                type: 'POST',
                url: posturl + 'Purchase/UpdatePurchase',
                data: {
                    SessionKey: localStorage.lsid,
                    GUID: tdata.Guid,
                    HasTax: val,
                },
                success: function (ndata) {
                    var ApiResult = CheckApi(ndata);
                    if (!ApiResult) {
                        return;
                    }
                    if (ndata.IsErr) {
                        alertModal('服务器出了点小问题，请骚后尝试操作！');
                        return;
                    } else {
                        tdata.HasTax = val == 2 ? 1 : 0;
                        totalPrice(data);
                        _thisp.find('.sl .text_box').trigger('keyup');
                        _thisp.find('.J_Price').html('￥' + (val == 2 ? tdata.PriceN : tdata.Price));
                    }
                }
            });
        });
    }

    function load(call) {
        //获取列表
        $.ajax({
            type: 'POST',
            url: posturl + 'Purchase/ShowPurchase',
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
                    var sp = '';
                    var tid = '';
                    rData = data.data;
                    $('.car_iteminfo').html(data.data.map(function (x, index) {
                        // car.push({
                        //     m: x.Guid,
                        //     n: x.Qty,
                        //     p: x.PriceN
                        // });
                        var title = '';
                        if (index == 0 || sp != x.Seller) {
                            tid = Math.random().toString().substring(2);
                            title = '<div class="bundle bundle-last ">\
                    <div class="bundle-hd">\
                        <div class="supplier-checkbox">\
                          <input class="check" tid="'+ tid + '" type="checkbox">\
                        </div>\
                        <div class="bd-promos">\
                            <div class="bd-has-promo">'+ x.Seller + '</div>\
                        </div>\
                    </div>\
                    </div>';
                        }
                        sp = x.Seller;
                        return title + '<div class="bundle-main">\
                        <ul class="item-content clearfix"  index="' + index + '">\
                            <li class="td td-chk">\
                                <div class="cart-checkbox ">\
                                    <input class="check" tid="car_item_'+ tid + '"  type="checkbox" ' + (checklist.indexOf(x.Guid) > -1 ? 'checked="checked"' : '') + '>\
                                </div>\
                            </li>\
                            <li class="td td-item">\
                                <div class="item-pic">\
                                    <img src="assets/images/item.png" class="itempic J_ItemImg">\
                                </div>\
                                <div class="item-info">\
                                    <div class="item-basic-info">\
                                        <p>物料：'+ x.SkuCode + '</p>\
                                        <p>名称：'+ x.ItemName + '</p>\
                                    </div>\
                                </div>\
                            </li>\
                            <li class="td td-info">\
                                <div class="item-props item-props-can">\
                                    '+ x.SkuName + '\
                                </div>\
                            </li>\
                            <li class="td td-price">\
                                <div class="item-price price-promo-promo">\
                                    <div class="price-content">\
                                        <div class="price-line">\
                                            <em class="J_Price price-now" tabindex="0">￥'+ (x.HasTax == 1 ? x.PriceN : x.Price) + '</em>\
                                            <span>/'+ x.Unit + '</span>\
                                            '+ (x.PriceN > 0 ? '<div class="hs_view">\
                                                <lable>含税</lable>\
                                                <input type="checkbox" class="sc_hs" '+ (x.HasTax == 1 ? 'checked' : '') + '>\
                                            </div>' : '') + '\
                                        </div>\
                                    </div>\
                                </div>\
                            </li>\
                            <li class="td td-amount">\
                                <div class="amount-wrapper ">\
                                    <div class="item-amount ">\
                                        <div class="sl">\
                                            <button class="min am-btn am-btn-default">\
                                            <i class="am-icon-minus"></i>\
                                            </button>\
                                            <input class="text_box am-text-center" type="tel" value="'+ x.Qty + '" style="width:50px;">\
                                            <button class="add am-btn am-btn-default">\
                                            <i class="am-icon-plus"></i>\
                                        </button>\
                                        </div>\
                                    </div>\
                                </div>\
                            </li>\
                            <li class="td td-sum">\
                                <div class="td-inner car_price_'+ x.ID + '">\
                                    <em tabindex="0" class="J_ItemSum number">￥'+ (x.Qty * (x.HasTax == 1 ? x.PriceN : x.Price)).toFixed(3) + '</em>\
                                </div>\
                            </li>\
                            <li class="td td-op">\
                                <div class="td-inner">\
                                    <a href="javascript:;" data-point-url="#" class="delete">删除</a>\
                                </div>\
                            </li>\
                        </ul>\
                    </div>\
                </div>';
                    }));
                    localStorage.carqty = data.data.length;
                    $('#carqty').html(localStorage.carqty);
                    bindbase(data);
                    if (call) {
                        call(data);
                    }
                }
                else {
                    alertModal('服务器出了点小问题，请骚后尝试操作！');
                    return;
                }
            },
            dataType: 'json'
        });

    }

    function updateNum(Guid, num, func) {
        var url = num == 0 ? 'Purchase/CDeletePurchase' : 'Purchase/UpdatePurchase';
        $.ajax({
            type: 'POST',
            url: posturl + url,
            data: {
                SessionKey: localStorage.lsid,
                GUID: Guid,
                Qty: num,
            },
            success: function (data) {
                var ApiResult = CheckApi(data);
                if (!ApiResult) {
                    return;
                }
                if (data.IsErr) {
                    alertModal('服务器出了点小问题，请骚后尝试操作！');
                    return;
                }
                else {
                    func(data);
                }
            }
        });
    }

    function totalPrice(data) {
        var total = 0;
        checklist = [];
        $('.cart-checkbox .check:checked').each(function () {
            var index = $(this).parents('.item-content').attr('index');
            var tdata = data.data[index];
            checklist.push(tdata.Guid);
            total += (tdata.Qty * (tdata.HasTax == 1 ? tdata.PriceN : tdata.Price));
        });
        $('.total_num').html(total.toFixed(3));
    }

    function getadress(fn) {
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
                    $('#per_rev').html(data.data.map(function (k) {
                        return '<label class="am-radio needsclick">\
                        <input type="radio" name="pre_address" gid="'+ k.Guid + '" class="am-ucheck-radio" ' + (k.IsDefault == 1 ? 'checked' : '') + '>\
                        <span class="am-ucheck-icons"><i class="am-icon-unchecked"></i>\
                        <i class="am-icon-checked"></i></span>                     \
                        <span class="pr_adress"> \
                        <span class="am-text-danger">'+ (k.IsDefault == 1 ? '<span style="color:#dd514c">(默认地址)</span>' : '') + '</span>\
                        '+ k.PostalAddress + '\
                        （'+ k.PersonName + '\
                        '+ k.TelPhone + '）\
                        </span>\
                    </label>';
                    }));

                    if (fn) {
                        fn();
                    }
                }
                else {
                    alertModal('服务器出了点小问题，请骚后尝试操作！');
                }
            }
        });
    }

    $('#confirm_btn').click(function () {
        getadress(function () {
            var tData = rData.filter(function (x) {
                if (checklist.indexOf(x.Guid) > -1) {
                    return x;
                }
            });
            if (tData.length == 0) {
                alertModal('请将产品勾选后结算！');
                return;
            }
            sureData = tData;
            var sup = '';
            var conf = 0;
            var mtd = Math.random().toString().substring(2);
            $('#confirm_Order tbody').html(tData.map(function (k, index) {
                var title = '';
                var price = k.HasTax == 1 ? k.PriceN : k.Price;
                if (sup != k.Seller) {
                    title = (index > 0 ? '<tr>\
                                        <td colspan="10"><input type="text" class="am-form-field am-input-sm" rmkd="'+ mtd + '" placeholder="请填写买家备注"/></td>\
                                        </tr>': '');
                    mtd = Math.random().toString().substring(2);
                    title += '<tr><td colspan="10" style="color: #8e8e8e;font-style: italic;">\
                                        <span>'+ k.Seller + '</span>\
                                        <span class="am-padding-left-lg">联系人：'+ (k.ContactPerson || '无') + '</span>\
                                        <span class="am-padding-left-lg">联系号码：'+ (k.ContactPhone || '无') + '</span>\
                                        <span class="am-fr"><input type="text" class="am-form-field dateinput" placeholder="交货日期" data-am-datepicker readonly required  mtd="'+ mtd + '"></span>\
                                        <label class="am-switch am-fr am-margin-right-lg" style="padding-top: 3px;">\
                                            <input type="checkbox"  sendd="'+ mtd + '" checked>\
                                            <span class="am-switch-checkbox am-switch-text"></span>\
                                        </label>\
                                    </td><tr>';
                }
                k.mtd = mtd;
                sup = k.Seller;
                conf += (k.Qty * price);
                return title +
                    '<tr>\
                        <td>'+ (index + 1) + '</td>\
                        <td>'+ k.SkuType + '</td>\
                        <td>'+ k.SkuCode + '</td>\
                        <td>'+ k.ItemName + '</td>\
                        <td>'+ k.SkuName + '</td>\
                        <td>'+ price + '</td>\
                        <td>'+ k.Unit + '</td>\
                        <td>'+ k.Qty + '</td>\
                        <td>'+ (k.Qty * price).toFixed(3) + '</td>\
                       </tr>'+
                    (index == tData.length - 1 ? '<tr>\
                                        <td colspan="10"><input type="text" class="am-form-field am-input-sm" placeholder="请填写买家备注" rmkd="'+ mtd + '"/></td>\
                                        </tr>' : '')
            }));



            var nowTemp = new Date();
            var nowDay = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0).valueOf();
            var nowMoth = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), 1, 0, 0, 0, 0).valueOf();
            var nowYear = new Date(nowTemp.getFullYear(), 0, 1, 0, 0, 0, 0).valueOf();
            var $myStart2 = $('.dateinput');
            var checkin = $myStart2.datepicker({
                onRender: function (date, viewMode) {
                    var viewDate = nowDay;
                    switch (viewMode) {
                        case 1:
                            viewDate = nowMoth;
                            break;
                        case 2:
                            viewDate = nowYear;
                            break;
                    }
                    return date.valueOf() < viewDate ? 'am-disabled' : '';
                }
            }).on('changeDate.datepicker.amui', function (ev) {
                if (ev.date.valueOf() > checkout.date.valueOf()) {
                    var newDate = new Date(ev.date)
                    newDate.setDate(newDate.getDate() + 1);
                    checkout.setValue(newDate);
                }
                checkin.close();
                $('#my-end-2')[0].focus();
            }).data('amui.datepicker');
            // $('.dateinput').datepicker();

            $('#confirm_Pr').html('￥' + conf.toFixed(3));

            $('input[name="pre_address"]').change(function () {
                var $collapse = $('#collapse');
                $('.am-form-horizontal .am-input').val(null);
                $('#city-picker').citypicker('reset');
                if ($(this).hasClass('new_add')) {
                    $('#address_modal').modal({
                        closeViaDimmer: false,
                        closeOnConfirm: false,
                        onConfirm: function (e) {
                            var city = $('#city-picker').val();
                            var iserr = false;
                            $('.am-form-horizontal .am-input').each(function () {
                                if (!$(this).val()) {
                                    $(this).addClass('input-err');
                                    iserr = true;
                                }
                            });
                            if (!city) {
                                $('.city-picker-span').addClass('input-err');
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
                                        getadress(function () {
                                            $('#address_modal').modal(close);
                                        });
                                    }
                                    else {
                                        alertModal('服务器出了点小问题，请骚后尝试操作！');
                                        return;
                                    }
                                }
                            });
                        },
                        onCancel: function () {
                            $('input[name="pre_address"]').prop("checked", false);
                        }
                    });
                }
            });

            $('#confirm_car').modal({
                closeViaDimmer: false,
            });

        });
    });

    $('#sure_order').click(function () {
        var address = $('input[name="pre_address"]:checked').attr('gid');
        var err = false;
        if (address == null || address == '') {
            err = true;
            $('#pre_addlist').addClass('inputerr');
        }
        var $table = $('#confirm_Order');
        var gidlis = sureData.map(function (x) {
            var $tdom = $table.find('input[mtd="' + x.mtd + '"]');
            var tdate = $tdom.val();
            if (tdate == '') {
                err = true;
                $tdom.addClass('inputerr');
            }
            var tsend = $table.find('input[sendd="' + x.mtd + '"]').is(':checked');
            var trmk = $table.find('input[rmkd="' + x.mtd + '"]').val();
            return { Seller: x.Seller, PurchaseGuid: x.Guid, DeliverDate: tdate, Note: trmk, ShippingMethod: Number(!tsend) }
        });
        if (err) {
            $('.inputerr').unbind('change').change(function () {
                $(this).removeClass('inputerr');
            });
            return false;
        }
        $(this).attr('disabled', true);
        $.ajax({
            type: 'POST',
            url: posturl + 'Purchase/AddOrder',
            data: {
                SessionKey: localStorage.lsid,
                ContactGuid: address,
                PurchaseGuids: gidlis,
            },
            success: function (data) {
                var ApiResult = CheckApi(data);
                if (!ApiResult) {
                    return;
                }
                //----------------------------------
                if (!data.IsErr) {
                    trunUrl('../pages/person.html');
                }
                else {
                    if (data.ErrDesc.indexOf('物料被禁用') > -1) {
                        alertModal('购物车中部分物料被禁用，请刷新页面后尝试重新操作！');
                        return;
                    }
                    alertModal('服务器出了点小问题，请骚后尝试操作！');
                    return;
                }
            }
        });
    });

    $('.am-form-horizontal .am-input').change(function () {
        $(this).removeClass('input-err');
    });
    $('.city-picker-span').click(function () {
        $(this).removeClass('input-err');
    });
})(window, $)