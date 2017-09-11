(function (window, $) {
    //获取订单
    var para = location.hash.replace('#/', '');
    para = para.substring(para.indexOf('?'));
    //----------------------------------------------------------
    var pno = getQuery('pno', para);
    var pc = getQuery('pc', para);


    $('#search_rePurchaseNO').val(pno);
    $('#search_reSendNO').val(pc);

    var stage = getQuery('stage', para);
    var t_month = getQuery('month', para);
    if (t_month > 0) {
        $('#searchre_month').val(t_month);
    }

    var page = Number(getQuery('page', para)) || 1;
    page = typeof (page) == 'number' ? page : 1;
    //----------------------------------------------------------


    $.ajax({
        type: 'POST',
        url: posturl + 'BuyerCenter/ShowAllReturn',
        data: {
            SessionKey: localStorage.lsid,
            PurchaseNo: $('#search_rePurchaseNO').val(),
            OutSendNO: $('#search_reSendNO').val(),
            month: t_month,
            page: page,
            Stage: Number(stage)
        },
        success: function (data) {
            var ApiResult = CheckApi(data);
            if (!ApiResult) {
                return;
            }
            //----------------------------------
            if (!data.IsErr) {
                if (data.data.length > 0) {
                    data.data.map(function (x, index) {
                        var totalp = 0;
                        var tbtn = Math.random().toString().substring(2);
                        var domdata = '<div class="order-main">\
                        <div class="order-status3">\
                            <div class="order-title">\
                                <div class="dd-num">材料商：'+ x.Seller + '</div>\
                                <div class="dd-num">订单编号：<a>'+ x.PurchaseNO + '</a></div>\
                                <div class="dd-num">发货批次：'+ x.OutSendNO + '</div>\
                                <span>申请时间：'+ ChangeDateFormat(x.RequestTime) + '</span>\
                            </div>\
                            <div class="order-content">\
                                <div class="order-left">\
                                    '+ (x.data.map(function (k, index) {
                                totalp += k.SendQty;
                                return ' <ul class="item-list ' + (index > 2 ? 'hideorder' : '') + '" odr="' + tbtn + '">\
                                        <li class="td td-item" style="width: 50%;">\
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
                                    </ul>';
                            }).join('')) + '\
                                    '+ ('<p class="am_thisRemark">【' + x.ReturnType + '】' + x.ReturnReason + '</p>' || '') + '\
                                </div>\
                                <div class="order-right" style="width: 30%;">\
                                    <div class="move-right">\
                                        <li class="td td-change">\
                                            ￥'+ Number(x.TotalCash).toFixed(3) + '\
                                        </li>\
                                        <li class="td td-change">\
                                            '+ (x.IsSellerAgreeReturn == 1 ? '<span style="color:#0e90d2">退货完成<span>' : x.IsRequestReturn == 1 ? '<span style="color:#dd514c;">退货中</span>' : '<span>取消退货</span>') + '\
                                        </li>\
                                        <li class="td td-change">\
                                            '+ ((x.IsSellerAgreeReturn == 0 && x.IsRequestReturn == 1) ? '<span><button class="am-btn am-btn-sm am-btn-danger anniu" math="' + tbtn + '">取消退货</button></span>' : '已关闭') + '\
                                        </li>\
                                    </div>\
                                </div>\
                                '+ (x.data.length > 3 ? '<button class="am-btn moreoder" odrbtn="' + tbtn + '">查看更多</button>' : '') + '\
                            </div>\
                        </div>\
                    </div>';
                        $('#order_info').append(domdata);
                        $('button[math="' + tbtn + '"]').click(function () {
                            $('#sure_quRegoods').modal({
                                closeViaDimmer: false,
                                closeOnConfirm: false,
                                onConfirm: function (e) {
                                    $.ajax({
                                        type: 'POST',
                                        url: posturl + 'BuyerCenter/AbortReturn',
                                        data: {
                                            SessionKey: localStorage.lsid,
                                            ReturnGuid: x.Guid,
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
                                },
                            });
                        });

                        $('.moreoder[odrbtn="' + tbtn + '"]').click(function () {
                            $('ul[odr="' + tbtn + '"]').removeClass('hideorder');
                            $(this).remove();
                        });
                    });

                    if (data.PageCount > 1) {
                        var pagination = new Pagination({
                            wrap: $('.am-pagination'),
                            count: data.PageCount,
                            current: data.CurrentPage,
                            callback: function (page) {
                                var url = location.href;
                                if (url.indexOf('page') > -1) {
                                    if (url.indexOf('&') > -1) {
                                        url = url.substring(0, url.indexOf('&page'));
                                    }
                                    else {
                                        url = url.substring(0, url.indexOf('?'));
                                    }
                                };
                                if (url.indexOf('?') > -1) {
                                    trunUrl(url + '&page=' + page);
                                } else {
                                    trunUrl(url + '?page=' + page);
                                }

                            }
                        });
                    }

                }
                else {
                    $('#order_info').append('<p class="am-text-center am-margin-top-lg">无历史退货记录。</p>');
                }
            }
            else {
                alertModal('服务器出了点小问题，请骚后尝试操作！');
            }
        }
    });

    $('#cx_repc').click(function () {
        var url = '';
        var month = $('#searchre_month').val();
        var PurchaseNO = $('#search_rePurchaseNO').val();
        var SendNO = $('#search_reSendNO').val();
        if (month != 0) {
            url += 'month=' + month + '&';
        }
        if (PurchaseNO) {
            url += 'pno=' + PurchaseNO + '&';
        }
        if (SendNO) {
            url += 'pc=' + SendNO + '&';
        }
        if (url) {
            url = url.substring(0, url.length - 1);
        }
        trunUrl('#/regoods?' + url);
    });

    $('.order-address input').keydown(function (e) {
        if (event.keyCode == 13) {
            $('#cx_repc').click();
        }
    });
})(window, $)