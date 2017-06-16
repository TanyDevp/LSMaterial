(function (window, $) {
    //获取订单
    var para = location.hash.replace('#/', '');
    para = para.substring(para.indexOf('?'));
    //----------------------------------------------------------
    var pno = getQuery('pno', para);
    var st = getQuery('st', para);
    $.ajax({
        type: 'POST',
        url: posturl + 'SellerCenter/ShowSentDetailByPurchaseNO',
        data: {
            SessionKey: localStorage.lsid,
            PurchaseNo: pno,
        },
        success: function (data) {
            var ApiResult = CheckApi(data);
            if (!ApiResult) {
                return;
            }
            //----------------------------------
            if (!data.IsErr) {
                if (data.Level == 0) {
                    return;
                }
                var titledom = '<div class="am-u-sm-12 am-u-md-8 am-u-lg-8">\
                                <p class="new-tit new-p-re">\
                                <span class="new-txt">'+ data.BuyerAddress.Person + '</span>\
                                <span class="new-txt-rd2">'+ data.BuyerAddress.TelPhone + '</span>\
                                </p>\
                                <div class="new-mu_l2a new-p-re">\
                                    <p class="new-mu_l2cw">\
                                    <span class="title">收货地址：</span>\
                                    <span class="street">'+ data.BuyerAddress.Address + '</span></p>\
                                 </div>\
                            </div>';


                if (data.Level == 2 && data.Stage < 3) {
                    var mtd = Math.random().toString().substring(2);
                    // titledom += '<div class="am-u-sm-12 am-u-md-4 am-u-lg-4 am-text-right">\
                    //             <button class="am-btn am-btn-sm am-btn-danger am-margin-top-lg" mtd="'+ mtd + '">确认全部收货</button>\
                    //         </div>';
                    $('.order-address').html(titledom);
                    $('button[mtd="' + mtd + '"]').click(function () {
                        $('#confirm_order').modal({
                            closeViaDimmer: false,
                            onConfirm: function (options) {
                                ConmifrmFull(data.data[0].PurchaseNO);
                            },
                        });
                    });
                }
                else if (data.Level == 1 && data.Stage < 3) {
                    titledom += ' <div class="am-u-sm-12 am-u-md-4 am-u-lg-4 am-text-right">\
                                <p class="am-text-danger am-margin-top-lg" style="color:#f00">未全部确认收货</p>\
                            </div>';
                    $('.order-address').html(titledom);
                }
                else if (data.Stage == 3) {
                    titledom += ' <div class="am-u-sm-12 am-u-md-4 am-u-lg-4 am-text-right">\
                                <p class="am-text-danger am-margin-top-lg" style="color:#f00">已全部确认收货</p>\
                            </div>';
                    $('.order-address').html(titledom);
                }
                else if (data.Stage >= 10) {
                    titledom += ' <div class="am-u-sm-12 am-u-md-4 am-u-lg-4 am-text-right">\
                                <p class="am-text-danger am-margin-top-lg" style="color:#f00">'+ (data.Stage == 10 ? '买家取消' : data.Stage == 11 ? '卖家取消' : '双方取消') + '</p>\
                            </div>';
                    $('.order-address').html(titledom);
                }

                if (data.data.length > 0) {
                    data.data.map(function (x) {
                        var totalp = 0;
                        var tbtn = Math.random().toString().substring(2);
                        var domdata = '<div class="order-main">\
                        <div class="order-status3">\
                            <div class="order-title">\
                                <div class="dd-num">订单编号：<a>'+ x.PurchaseNO + '</a></div>\
                                <div class="dd-num">发货批次：'+ x.OutSendNO + '</div>\
                                <span>发货时间：'+ ChangeDateFormat(x.SendDate) + '</span>\
                            </div>\
                            <div class="order-content">\
                                <div class="order-left">\
                                    '+ (x.data.map(function (k, index) {
                                totalp += k.SendQty;
                                return ' <ul class="item-list">\
                                        <li class="td td-item">\
                                            <div class="item-pic">\
                                                <img src="'+ k.SkuPic + '" class="itempic J_ItemImg">\
                                            </div>\
                                            <div class="item-info">\
                                                <div class="item-basic-info">\
                                                    <p>'+ k.ItemName + '</p>\
                                                    <p class="info-little">物料：'+ k.SkuCode + '\
                                                    <br/>规格：'+ k.SkuName + ' </p>\
                                                </div>\
                                            </div>\
                                        </li>\
                                        <li class="td td-price">\
                                            <div class="item-price">\
                                                '+ k.Price + '\
                                            </div>\
                                        </li>\
                                        <li class="td td-price">\
                                            <div class="item-price">\
                                                <span>×</span>'+ k.Qty + '\
                                            </div>\
                                        </li>\
                                        <li class="td td-price">\
                                            <div class="item-price">\
                                                <span>×</span>'+ k.SendQty + '\
                                            </div>\
                                        </li>\
                                        <li class="td td-price">\
                                            <div class="item-price">\
                                                <span>×</span>'+ k.ReceiveQty + '\
                                            </div>\
                                        </li>\
                                        <li class="td td-price">\
                                            <div class="item-price">\
                                               \
                                            </div>\
                                        </li>\
                                        <li class="td td-price">\
                                            <div class="item-price">\
                                               '+ (function () {
                                        if (data.Level == 2 && data.Stage <= 3) {
                                            return (k.HasDone == 0 ? '<a href="javascript:void(0);" m="2" grep="' + tbtn + '" idx="' + index + '">售后处理中</a>' : k.HasDone == 1 ? '<a href="javascript:void(0);" grep="' + tbtn + '" idx="' + index + '">已完结售后</a>' : '<a href="javascript:void(0);" grep="' + tbtn + '" idx="' + index + '">申请售后</a>');
                                        }
                                        else if (data.Level == 1 && data.Stage <= 3) {
                                            return (k.HasDone == 0 ? '<a href="javascript:void(0);" grep="' + tbtn + '" idx="' + index + '">买家发起售后</a>' : k.HasDone == 1 ? '<a href="javascript:void(0);" grep="' + tbtn + '" idx="' + index + '">已完结售后</a>' : '-');
                                        }
                                        else {
                                            return '-';
                                        }
                                    })() + '\
                                            </div>\
                                        </li>\
                                    </ul>';
                            }).join('')) + '\
                                    '+ (x.ErrDesc && '<p class="am_thisRemark">异常：' + x.ErrDesc + '</p>' || '') + '\
                                </div>\
                                <div class="order-right" style="width: 10%;right:10%;>\
                                    <div class="move-right">\
                                        <li class="td td-change" style="width:100%;">\
                                            #sendtype#\
                                        </li>\
                                        <li class="td td-status">\
                                            <div class="item-status">\
                                               \
                                            </div>\
                                        </li>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>';

                        if (data.Stage < 10) {
                            switch (data.Level) {
                                case 1:
                                    if (x.HasDone) {
                                        domdata = domdata.replace('#sendtype#', '<span style="color:#f00">已确认收货</span>');
                                        // $('#order_info').append(domdata);
                                        // return;
                                    }
                                    else {
                                        domdata = domdata.replace('#sendtype#', '未确认收货');
                                        // $('#order_info').append(domdata);
                                        // return;
                                    }
                                    $('#order_info').append(domdata);
                                    break;
                                case 2:
                                    debugger;
                                    if (x.HasDone) {
                                        domdata = domdata.replace('#sendtype#', '<span style="color:#f00">已确认收货</span>');
                                        $('#order_info').append(domdata);
                                    }
                                    else {
                                        domdata = domdata.replace('#sendtype#', '<button class="am-btn am-btn-sm am-btn-danger anniu" mtd="' + tbtn + '">\
                                                    确认收货\
                                                 </button>');
                                        $('#order_info').append(domdata);
                                        $('button[mtd="' + tbtn + '"]').click(function () {
                                            confirm_Modal(x);
                                        });
                                    }

                                    break;
                                default:
                                    return '';
                                    break;
                            }
                        }
                        else {
                            domdata = domdata.replace('#sendtype#', '取消订单');
                            $('#order_info').append(domdata);
                        }
                        $('a[grep="' + tbtn + '"]').click(function () {
                            var index = $(this).attr('idx');
                            var m = $(this).attr('m');
                            var tData = x.data[index];
                            if (tData.HasDone == 0) {
                                if (m == 2) {
                                    window.open(('http://119.145.166.182:8806/bsprt/html-Supplier/CustomerService.html?sgn=' + localStorage.lsid + '&no=' + x.PurchaseNO + '&sendguid=' + x.SendGuid + '&skucode=' + tData.SkuCode + '&sendno=' + x.OutSendNO + '&itemname=' + tData.ItemName));
                                } else {
                                    window.open(('http://119.145.166.182:8806/bsprt/html-Supplier/CustomerService.html?sgn=' + localStorage.lsid + '&no=' + x.PurchaseNO + '&sendguid=' + x.SendGuid + '&skucode=' + tData.SkuCode + '&sendno=' + x.OutSendNO + '&itemname=' + tData.ItemName + '&m=1'));
                                }
                            } else {
                                window.open(('http://119.145.166.182:8806/bsprt/html-Supplier/CustomerService.html?sgn=' + localStorage.lsid + '&no=' + x.PurchaseNO + '&sendguid=' + x.SendGuid + '&skucode=' + tData.SkuCode + '&sendno=' + x.OutSendNO + '&itemname=' + tData.ItemName));
                            }
                        });
                    });
                }
                else {
                    $('#order_info').append('<p class="am-text-center am-margin-top-lg">无历史发货记录。</p>');
                }
            }
            else {
                alertModal('服务器出了点小问题，请骚后尝试操作！');
            }
        }
    });

    function confirm_Modal(x) {
        var $modal = $('#confirm_rev');
        var order = $modal.find('.order-status');
        order.html(('<div class="dd-num">订单编号：<a>' + x.PurchaseNO + '</a></div>\
                                <div class="dd-num">发货批次：'+ x.OutSendNO + '</div>\
                                <span>发货时间：'+ ChangeDateFormat(x.SendDate) + '</span>'));

        var postdata = [];
        x.data.map(function (t, index) {
            postdata.push({ Guid: t.Guid, Qty: t.SendQty });
            var mtd = Math.random().toString().substring(2);
            var bsdom = '<div class="order-status">\
                                <div class="order-content">\
                                    <div class="order-left">\
                                        <ul class="item-list">\
                                            <li class="td td-item">\
                                                <div class="item-pic">\
                                                    <a class="J_MakePoint">\
                                                        <img src="'+ t.SkuPic + '" class="itempic J_ItemImg">\
                                                    </a>\
                                                </div>\
                                                <div class="item-info">\
                                                    <div class="item-basic-info">\
                                                        <a>\
                                                         <p>'+ t.ItemName + '</p>\
                                                         <p class="info-little">物料：'+ t.SkuCode + '\
                                                         <br/>规格：'+ t.SkuName + ' </p>\
                                                        </a>\
                                                    </div>\
                                                </div>\
                                            </li>\
                                            <li class="td td-price">\
                                                <div class="item-price">\
                                                    '+ t.Price + '\
                                                </div>\
                                            </li>\
                                            <li class="td td-operation">\
                                                <div class="item-number">\
                                                    <span>×</span>'+ t.SendQty + '\
                                                </div>\
                                            </li>\
                                            <li class="td td-operation">\
                                                <div class="item-operation">\
                                                <div class="sl" mtd="'+ mtd + '">\
                                                    <button class="min am-btn am-btn-default">\
                                                        <i class="am-icon-minus"></i>\
                                                    </button>\
                                                        <input class="text_box am-text-center" type="tel" value="'+ t.SendQty + '" style="width:50px;">\
                                                    <button class="add am-btn am-btn-default">\
                                                        <i class="am-icon-plus"></i>\
                                                    </button>\
                                                </div>\
                                            </li>\
                                        </ul>\
                                    </div>\
                                </div>\
                            </div>';

            order.append(bsdom);
            $('.sl[mtd="' + mtd + '"] .text_box').keyup(function () {
                var val = $(this).val();
                var reg = /^-?\d+$/;
                if (!reg.test(val)) {
                    val = t.SendQty;
                }
                else if (val > t.SendQty) {
                    val = t.SendQty;
                }
                $(this).val(val);
                postdata[index].Qty = val;
            });

            $('.sl[mtd="' + mtd + '"] .am-btn').click(function () {
                var $input = $(this).siblings('.text_box');
                var val = $input.val();
                if ($(this).hasClass('add')) {
                    if (val < t.SendQty) {
                        val++;
                    }
                }
                else {
                    if (val > 0) {
                        val--;
                    }
                }
                $input.val(val);
                postdata[index].Qty = val;
            });
        })

        $modal.modal({
            closeViaDimmer: false,
        });

        $('#sure_revbtn').unbind('click').click(function () {
            var Isq = false;
            x.data.map(function (x, index) {
                if (x.SendQty > postdata[index].Qty) {
                    Isq = true;
                }
            });
            var reson = $('#Shortage_reason').val();
            if (Isq && reson == '') {
                $('#Shortage_reason').addClass('input-err');
                return;
            }
            confirmRev(x.SendGuid, reson, postdata);
        });
    }

    function confirmRev(SendGuid, Reason, Guidlist) {
        $.ajax({
            type: 'POST',
            url: posturl + 'BuyerCenter/ComfirmReceive',
            data: {
                SessionKey: localStorage.lsid,
                SendGuid: SendGuid,
                Guids: Guidlist,
                Reason: Reason,
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
                }
            }
        });
    }

    function ConmifrmFull(PurchaseNo) {
        $.ajax({
            type: 'POST',
            url: posturl + 'BuyerCenter/FinishOrder',
            data: {
                SessionKey: localStorage.lsid,
                PurchaseNo: PurchaseNo,
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
                }
            }
        });
    }

    $('#Shortage_reason').change(function () {
        $(this).removeClass('input-err');
    });
})(window, $)