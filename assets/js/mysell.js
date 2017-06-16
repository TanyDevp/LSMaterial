(function (window, $) {

    var para = location.hash.replace('#/', '');
    para = para.substring(para.indexOf('?'));
    //----------------------------------------------------------
    var stage = getQuery('stage', para);
    var t_month = getQuery('month', para);
    if (t_month > 0) {
        $('#searchorder_month').val(t_month);
    }
    var t_sid = getQuery('sid', para);
    if (t_sid) {
        $('#searchorder_btn').val(t_sid);
    }
    var page = Number(getQuery('page', para)) || 1;
    page = typeof (page) == 'number' ? page : 1;

    $(function () {
        getPage(stage);
        getQuType();

        var nowTemp = new Date();
        var nowDay = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0).valueOf();
        var nowMoth = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), 1, 0, 0, 0, 0).valueOf();
        var nowYear = new Date(nowTemp.getFullYear(), 0, 1, 0, 0, 0, 0).valueOf();
        var $myStart2 = $('#datepick');
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
        }).data('amui.datepicker');
        var $myStart3 = $('#send_picker');
        var checkin = $myStart3.datepicker({
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
        }).data('amui.datepicker');
    });

    $('.am-tabs-d2').tabs('open', Number(stage || -1) + 1);
    $('.am-tabs-d2').find('a').on('open.tabs.amui', function (e) {
        var tstage = $(this).attr('data-tab');
        if (tstage >= 0) {
            trunUrl('#/mysell?stage=' + tstage);
        }
        else {
            trunUrl('#/mysell');
        }

    })
    function getPage(stage, newpage) {
        stage = stage || -1;
        var sid = t_sid;
        var month = t_month || 0;
        $('.sellorder div[id^="sell"]').empty();
        //获取订单
        if (stage >= 0) {
            $.ajax({
                type: 'POST',
                url: posturl + 'SellerCenter/ShowStageOrder',
                data: {
                    SessionKey: localStorage.lsid,
                    sid: sid,
                    month: month,
                    page: newpage || page,
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
                            var order = data.data.map(function (x, index) {
                                var stage = x.Stage;
                                var math = Math.random().toString().substring(2);
                                var dom = '<div class="order-main">\
                                        <div class="order-list">\
                                            <div class="order-status1">\
                                                <div class="order-title">\
                                                    <div class="dd-num">订单编号：<a>'+ x.PurchaseNO + '</a></div>\
                                                    <span class="dd-num">成交时间：'+ ChangeDateFormat(x.CreateDate) + '</span>\
                                                    <span style="padding-right:30px;">配送方式：'+ (x.ShippingMethod == 0 ? '送货' : '自提') + '</span>\
                                                    <span>买家：<a href="javascript:void(0)" class="show_mail" mail="'+ math + '">' + x.Buyer + '</a></span>\
                                                </div>\
                                                <div class="order-content">\
                                                    <div class="order-left">\
                                                    '+ (x.data.map(function (k, index) {
                                        return '<ul class="item-list ' + (index > 2 ? 'hideorder' : '') + '" odr="' + math + '">\
                                                            <li class="td td-item">\
                                                                <div class="item-pic">\
                                                                    <img src="'+ k.SkuPic + '" class="itempic J_ItemImg">\
                                                                </div>\
                                                                <div class="item-info">\
                                                                    <div class="item-basic-info">\
                                                                        <p>'+ k.ItemName + '</p>\
                                                                        <p class="info-little">物料：'+ k.SkuCode + '\
                                                                        <br/>规格：'+ k.SkuName + '</p>\
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
                                                        </ul>'
                                    }).join('')) + '\
                                            '+ (x.Note && ('<p class="sellRemark">买家备注：' + x.Note + '</p>') || '') + '\
                                                    </div>\
                                                    <div class="order-right">\
                                                        <li class="td td-amount">\
                                                            <div class="item-amount">\
                                                                合计：'+ x.TotalFee.toFixed(2) + '\
                                                            </div>\
                                                        </li>\
                                                        #orderType#\
                                                    </div>\
                                                </div>\
                                                '+ (x.data.length > 3 ? '<button class="am-btn moreoder" odrbtn="' + math + '">查看更多</button>' : '') + '\
                                            </div>\
                                        </div>\
                                    </div>';

                                switch (stage.toString()) {
                                    case '0':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                            <li class="td td-operation" style="'+ (x.data.length == 1 ? 'margin-top:-9%;' : '') + '">\
                                                                <div class="item-status">\
                                                                    <p class="Mystatus">等待确认</p>\
                                                                    <p class="Mystatus">交货日期<br\>'+ ChangeDate(x.DeliveryDate) + '</p>\
                                                                </div>\
                                                            </li>\
                                                            <li class="td td-operation" style="'+ (x.data.length == 1 ? 'margin-top:-5%;' : '') + '">\
                                                                <button class="am-btn am-btn-danger anniu" name="'+ math + '" idx="' + index + '" >确认订单</button>\
                                                                <p class="Mystatus"><a href="javascript:void(0)" grep="'+ math + '">取消订单</a></p>\
                                                            </li>\
                                                        </div>');
                                        $('#sell_confirm').append(dom);

                                        $('button[name="' + math + '"]').click(function () {
                                            $('#datepick_modal').modal({
                                                relatedTarget: this,
                                                closeViaDimmer: false,
                                                closeOnConfirm: false,
                                                onConfirm: function (e) {
                                                    if (!e.data) {
                                                        $('#datepick').addClass('input-err')
                                                    }
                                                    var id = $(this.relatedTarget).attr('idx');
                                                    var tdata = data.data[id];
                                                    sureorder(tdata.PurchaseNO, e.data);
                                                },
                                            });
                                        });
                                        $('a[grep="' + math + '"]').click(function () {
                                            ReAudit(x.PurchaseNO);
                                        });
                                        break;
                                    case '1':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                            <li class="td td-operation" style="' + ((x.IsBuyerDelay == 1) ? 'margin-top:-15%;' : x.data.length == 1 ? 'margin-top:-9%;' : '') + '">\
                                                                <div class="item-status">\
                                                                    <p class="Mystatus">买家已确认</p>\
                                                                    <p class="am-text-warning">发货时间<br\>'+ ChangeDate(x.PreSendDate) + '</p>\
                                                                     '+ (x.IsBuyerDelay == 1 ? '<p class="Mystatus" style="color: #dd514c;">延期发货<br\>' + ChangeDate(x.DelaySendDate) + '</p>' : '') + '\
                                                                </div>\
                                                            </li>\
                                                            <li class="td td-operation" style="'+ (x.data.length == 1 ? 'margin-top:-5%;' : '') + '">\
                                                            '+ (x.IsBuyerDelay == 1 ? '<button class="am-btn am-btn-danger anniu" name="' + math + '" idx="' + index + '">确认日期</button>' : '<p class="Mystatus">等待确认日期</p>') + '\
                                                                '+ (x.IsBuyerDelay == 1 ? ' <p class="Mystatus"><a href="javascript:void(0)" grep="' + math + '">取消订单</a></p>' : '') + '\
                                                            </li>\
                                                        </div>');
                                        $('#sell_nosend').append(dom);
                                        $('button[name="' + math + '"]').click(function () {
                                            $('#suer_senddatemodal .am-modal-bd').html('是否同意买家延期至<span style="color: #dd514c;">[' + ChangeDate(x.DelaySendDate) + ']</span>发货？<br>若不同意则将按照原来指定的发货时间发货。');
                                            $('#suer_senddatemodal').modal({
                                                relatedTarget: this,
                                                closeViaDimmer: false,
                                                closeOnConfirm: false,
                                                onConfirm: function (e) {
                                                    suredate(x.PurchaseNO, 1);
                                                },
                                                onCancel: function () {
                                                    // suredate(x.PurchaseNO, 2);
                                                }
                                            });
                                        });
                                        $('a[grep="' + math + '"]').click(function () {
                                            ReAudit(x.PurchaseNO);
                                        });
                                        break;
                                    case '2':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                            <li class="td td-operation" style="' + ((x.IsBuyerDelay == 1) ? 'margin-top:-13%;' : x.data.length < 3 ? 'margin-top:-12%;' : '') + '">\
                                                                <div class="item-status">\
                                                                    <p class="Mystatus">可发货</p>\
                                                                     '+ (x.IsBuyerDelay == 1 ? x.IsSellerAgreeDelay == 1 ? ('<p class="Mystatus" style="color: #00af8d">同意延期发货<br\>' + ChangeDate(x.DelaySendDate) + '</p>')
                                                : ('<p class="Mystatus" style="color: #dd514c;' + (x.data.length == 1 ? 'margin-bottom:-18px;' : '') + '">不同意延期发货<br\>按原发货时间<br\>' + ChangeDate(x.PreSendDate) + '</p>') :
                                                '<p class="Mystatus">发货日期<br\>' + ChangeDate(x.PreSendDate) + '</p>') + '\
                                                                    <p class="Mystatus"><a href="javascript:void(0)" grep="'+ math + '" style="color: #dd514c">发货详情</a></p>\
                                                                </div>\
                                                            </li>\
                                                            <li class="td td-operation" style="margin-top:-5%;">\
                                                                 <button class="am-btn am-btn-danger anniu" name="'+ math + '" idx="' + index + '">' + (x.HasSent == 0 ? '确认发货' : '卖家已发货') + '</button>\
                                                                  <p class="Mystatus">'+ (x.IsBuyerRequestClosed == 1 ? '<a href="javascript:void(0);"  rkclose="' + math + '" style="font-size:13px;">买家申请取消订单</a>' : x.IsBuyerRequestClosed == 0 ? '' : '已撤销申请') + '</p>\
                                                            </li>\
                                                        </div>');
                                        $('#sell_issend').append(dom);

                                        $('button[name="' + math + '"]').click(function () {
                                            getwillsend(x.PurchaseNO);
                                            // generateSend(x.PurchaseNO, '2017-06-01', '666666666666', sendlist);
                                        });
                                        $('a[grep="' + math + '"]').click(function () {
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO);
                                        });
                                        $('a[rkclose="' + math + '"]').click(function () {
                                            $('#suer_senddatemodal .am-modal-bd').html('<p class="am-text-center">问题类型：' + x.RequestClosedType + '</p><p class="am-text-center">问题描述：' + x.RequestClosedReason + '</p>');
                                            $('#suer_senddatemodal').modal({
                                                relatedTarget: this,
                                                closeViaDimmer: false,
                                                closeOnConfirm: false,
                                                onConfirm: function (e) {
                                                    agreeClose(x.PurchaseNO);
                                                },
                                            });
                                        });
                                        break;
                                    case '3':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                            <li class="td td-operation">\
                                                                <div class="item-status">\
                                                                    <p class="Mystatus">已收货</p>\
                                                                    <p class="Mystatus"><a href="javascript:void(0);" name="'+ math + '" style="color: #dd514c">发货详情</a></p>\
                                                                </div>\
                                                            </li>\
                                                            <li class="td td-operation">\
                                                             '+ (x.HasAfterDone && (x.HasAfterDone.HasDone == 0 ? '<p class="Mystatus"><a href="javascript:void(0);" grep="' + math + '" style="color: #dd514c">已申请售后</a></p>'
                                                : '<p class="Mystatus"><a href="javascript:void(0);" grep="' + math + '" style="color: #dd514c">售后完结</a></p>') || '') + '\
                                                                <p class="Mystatus">交易完成</p>\
                                                            </li>\
                                                        </div>');
                                        $('#sell_close').append(dom);
                                        $('a[name="' + math + '"]').click(function () {
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO);
                                        });
                                        $('a[grep="' + math + '"]').click(function () {
                                            window.open('http://192.168.1.190:8806/bsprt/html-Supplier/CustomerService.html?sgn=' + localStorage.lsid + '&no=' + x.PurchaseNO);
                                        });
                                        break;
                                    default:
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                            <li class="td td-operation">\
                                                                <div class="item-status">\
                                                                    <p class="Mystatus">'+ (x.Stage == 10 ? '买家取消' : x.Stage == 11 ? '卖家取消' : '双方取消') + '</p>\
                                                                     <p class="Mystatus"><a href="javascript:void(0);" name="'+ math + '" style="color: #dd514c">订单详情</a></p>\
                                                                </div>\
                                                            </li>\
                                                            <li class="td td-operation">\
                                                                <p class="Mystatus">交易关闭</p>\
                                                            </li>\
                                                        </div>');
                                        $('#sell_close').append(dom);
                                        $('a[name="' + math + '"]').click(function () {
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO + '&st=' + x.Stage);
                                        });
                                        break;
                                }
                                $('.moreoder[odrbtn="' + math + '"]').click(function () {
                                    $('ul[odr="' + math + '"]').removeClass('hideorder');
                                    $(this).remove();
                                });

                                $('a[mail="' + math + '"]').click(function () {
                                    alertModal('<div class="am-text-left">\
                                                <p>买家名称：' + x.Buyer + '</p>\
                                                <p>联系人：' + (x.BuyerAddress.Person || '') + '</p>\
                                                <p>联系电话：' + (x.BuyerAddress.TelPhone || '') + '</p>\
                                                <p>收货地址：' + (x.BuyerAddress.Address || '') + '</p>\
                                              </div>');
                                });
                            });
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
                        else {
                            $('.sellorder div[id^="sell"]').html('<p class="am-text-center">未找到相关订单</p>');
                            $('.am-pagination').empty();
                        }
                    }
                    else {
                        $('.am-pagination').empty();
                        alertModal('服务器出了点小问题，请骚后尝试操作！');
                    }
                }
            });
        }
        else {
            $.ajax({
                type: 'POST',
                url: posturl + 'SellerCenter/ShowAllOrder',
                data: {
                    SessionKey: localStorage.lsid,
                    sid: sid,
                    month: month,
                    page: newpage || page,
                },
                success: function (data) {
                    var ApiResult = CheckApi(data);
                    if (!ApiResult) {
                        return;
                    }
                    //----------------------------------
                    if (!data.IsErr) {
                        if (data.data.length > 0) {
                            var order = data.data.map(function (x, index) {
                                var stage = x.Stage;
                                var math = Math.random().toString().substring(2);
                                var dom = '<div class="order-main">\
                                <div class="order-list">\
                                    <div class="order-status1">\
                                        <div class="order-title">\
                                            <div class="dd-num">订单编号：<a>'+ x.PurchaseNO + '</a></div>\
                                            <span class="dd-num">成交时间：'+ ChangeDateFormat(x.CreateDate) + '</span>\
                                            <span style="padding-right:30px;">配送方式：'+ (x.ShippingMethod == 0 ? '送货' : '自提') + '</span>\
                                            <span>买家：<a href="javascript:void(0)" class="show_mail" mail="'+ math + '">' + x.Buyer + '</a></span>\
                                        </div>\
                                        <div class="order-content">\
                                            <div class="order-left">\
                                            '+ (x.data.map(function (k, index) {
                                        return '<ul class="item-list ' + (index > 2 ? 'hideorder' : '') + '" odr="' + math + '">\
                                                    <li class="td td-item">\
                                                        <div class="item-pic">\
                                                            <img src="'+ k.SkuPic + '" class="itempic J_ItemImg">\
                                                        </div>\
                                                        <div class="item-info">\
                                                            <div class="item-basic-info">\
                                                                <p>'+ k.ItemName + '</p>\
                                                                <p class="info-little">物料：'+ k.SkuCode + '\
                                                                <br/>规格：'+ k.SkuName + '</p>\
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
                                                </ul>'
                                    }).join('')) + '\
                                            '+ (x.Note && ('<p style="padding-left: 15px;">买家备注：' + x.Note + '</p>') || '') + '\
                                            </div>\
                                            <div class="order-right">\
                                                <li class="td td-amount">\
                                                    <div class="item-amount">\
                                                        合计：'+ x.TotalFee.toFixed(2) + '\
                                                    </div>\
                                                </li>\
                                                #orderType#\
                                            </div>\
                                        </div>\
                                         '+ (x.data.length > 3 ? '<button class="am-btn moreoder" odrbtn="' + math + '">查看更多</button>' : '') + '\
                                    </div>\
                                </div>\
                            </div>';

                                switch (stage.toString()) {
                                    case '0':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation" style="'+ (x.data.length == 1 ? 'margin-top:-9%;' : '') + '">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">等待确认</p>\
                                                            <p class="Mystatus">交货日期<br\>'+ ChangeDate(x.DeliveryDate) + '</p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="'+ (x.data.length == 1 ? 'margin-top:-5%;' : '') + '">\
                                                        <button class="am-btn am-btn-danger anniu" name="'+ math + '" idx="' + index + '" >确认订单</button>\
                                                        <p class="Mystatus"><a href="javascript:void(0)" grep="'+ math + '">取消订单</a></p>\
                                                    </li>\
                                                </div>');
                                        // $('#sell_confirm').append(dom);
                                        $('#sell_all').append(dom);

                                        $('button[name="' + math + '"]').click(function () {
                                            $('#datepick_modal').modal({
                                                relatedTarget: this,
                                                closeViaDimmer: false,
                                                closeOnConfirm: false,
                                                onConfirm: function (e) {
                                                    if (!e.data) {
                                                        $('#datepick').addClass('input-err')
                                                    }
                                                    var id = $(this.relatedTarget).attr('idx');
                                                    var tdata = data.data[id];
                                                    sureorder(tdata.PurchaseNO, e.data);
                                                },
                                            });
                                        });
                                        $('a[grep="' + math + '"]').click(function () {
                                            ReAudit(x.PurchaseNO);
                                        });
                                        break;
                                    case '1':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation" style="' + ((x.IsBuyerDelay == 1) ? 'margin-top:-15%;' : x.data.length == 1 ? 'margin-top:-9%;' : '') + '">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">买家已确认</p>\
                                                            <p class="am-text-warning">发货时间<br\>'+ ChangeDate(x.PreSendDate) + '</p>\
                                                             '+ (x.IsBuyerDelay == 1 ? '<p class="Mystatus" style="color: #dd514c;">延期发货<br\>' + ChangeDate(x.DelaySendDate) + '</p>' : '') + '\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="'+ (x.data.length == 1 ? 'margin-top:-5%;' : '') + '">\
                                                    '+ (x.IsBuyerDelay == 1 ? '<button class="am-btn am-btn-danger anniu" name="' + math + '" idx="' + index + '">确认日期</button>' : '<p class="Mystatus">等待确认日期</p>') + '\
                                                       '+ (x.IsBuyerDelay == 1 ? '<p class="Mystatus"><a href="javascript:void(0)" grep="' + math + '">取消订单</a></p>' : '') + '\
                                                    </li>\
                                                </div>');
                                        //<p class="Mystatus"><a href="javascript:void(0)" grep="'+ math + '">取消订单</a></p>
                                        // $('#sell_nosend').append(dom);
                                        $('#sell_all').append(dom);
                                        $('button[name="' + math + '"]').click(function () {
                                            $('#suer_senddatemodal .am-modal-bd').html('是否同意买家延期至<span style="color: #dd514c;">[' + ChangeDate(x.DelaySendDate) + ']</span>发货？<br>若不同意则将按照原来指定的发货时间发货。');
                                            $('#suer_senddatemodal').modal({
                                                relatedTarget: this,
                                                closeViaDimmer: false,
                                                closeOnConfirm: false,
                                                onConfirm: function (e) {
                                                    suredate(x.PurchaseNO, 1);
                                                },
                                                onCancel: function () {
                                                    // suredate(x.PurchaseNO, 2);
                                                }
                                            });
                                        })
                                        $('a[grep="' + math + '"]').click(function () {
                                            ReAudit(x.PurchaseNO);
                                        });
                                        break;
                                    case '2':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation" style="' + ((x.IsBuyerDelay == 1) ? 'margin-top:-13%;' : x.data.length < 3 ? 'margin-top:-12%;' : '') + '">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">可发货</p>\
                                                             '+ (x.IsBuyerDelay == 1 ? x.IsSellerAgreeDelay == 1 ? ('<p class="Mystatus" style="color: #00af8d">同意延期发货<br\>' + ChangeDate(x.DelaySendDate) + '</p>')
                                                : ('<p class="Mystatus" style="color: #dd514c;' + (x.data.length == 1 ? 'margin-bottom:-18px;' : '') + '">不同意延期发货<br\>按原发货时间<br\>' + ChangeDate(x.PreSendDate) + '</p>') :
                                                '<p class="Mystatus">发货日期<br\>' + ChangeDate(x.PreSendDate) + '</p>') + '\
                                                            <p class="Mystatus"><a href="javascript:void(0)" grep="'+ math + '" style="color: #dd514c">发货详情</a></p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="margin-top:-5%;">\
                                                        <button class="am-btn am-btn-danger anniu" name="'+ math + '" idx="' + index + '">' + (x.HasSent == 0 ? '确认发货' : '卖家已发货') + '</button>\
                                                        <p class="Mystatus">'+ (x.IsBuyerRequestClosed == 1 ? '<a href="javascript:void(0);"  rkclose="' + math + '" style="font-size:13px;">买家申请取消订单</a>' : x.IsBuyerRequestClosed == 0 ? '' : '已撤销申请') + '</p>\
                                                    </li>\
                                                </div>');
                                        // $('#sell_issend').append(dom);
                                        $('#sell_all').append(dom);

                                        $('button[name="' + math + '"]').click(function () {
                                            getwillsend(x.PurchaseNO);
                                            // generateSend(x.PurchaseNO, '2017-06-01', '666666666666', sendlist);
                                        });
                                        $('a[grep="' + math + '"]').click(function () {
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO);
                                        });
                                        $('a[rkclose="' + math + '"]').click(function () {
                                            $('#suer_senddatemodal .am-modal-bd').html('<p class="am-text-center">问题类型：' + x.RequestClosedType + '</p><p class="am-text-center">问题描述：' + x.RequestClosedReason + '</p>');
                                            $('#suer_senddatemodal').modal({
                                                relatedTarget: this,
                                                closeViaDimmer: false,
                                                closeOnConfirm: false,
                                                onConfirm: function (e) {
                                                    agreeClose(x.PurchaseNO);
                                                },
                                            });
                                        });
                                        break;
                                    case '3':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">已收货</p>\
                                                            <p class="Mystatus"><a href="javascript:void(0);" name="'+ math + '" style="color: #dd514c">发货详情</a></p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation">\
                                                     '+ (x.HasAfterDone && (x.HasAfterDone.HasDone == 0 ? '<p class="Mystatus"><a href="javascript:void(0);" grep="' + math + '" style="color: #dd514c">已申请售后</a></p>'
                                                : '<p class="Mystatus"><a href="javascript:void(0);" grep="' + math + '" style="color: #dd514c">售后完结</a></p>') || '') + '\
                                                        <p class="Mystatus">交易完成</p>\
                                                    </li>\
                                                </div>');
                                        // $('#sell_close').append(dom);
                                        $('#sell_all').append(dom);
                                        $('a[name="' + math + '"]').click(function () {
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO);
                                        });
                                        $('a[grep="' + math + '"]').click(function () {
                                            window.open('http://192.168.1.190:8806/bsprt/html-Supplier/CustomerService.html?sgn=' + localStorage.lsid + '&no=' + x.PurchaseNO);
                                        });
                                        break;
                                    default:
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">'+ (x.Stage == 10 ? '买家取消' : x.Stage == 11 ? '卖家取消' : '双方取消') + '</p>\
                                                            <p class="Mystatus"><a href="javascript:void(0);" name="'+ math + '" style="color: #dd514c">订单详情</a></p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation">\
                                                        <p class="Mystatus">交易关闭</p>\
                                                    </li>\
                                                </div>');
                                        // $('#sell_close').append(dom);
                                        $('#sell_all').append(dom);
                                        $('a[name="' + math + '"]').click(function () {
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO + '&st=' + x.Stage);
                                        });
                                        break;
                                }
                                $('.moreoder[odrbtn="' + math + '"]').click(function () {
                                    $('ul[odr="' + math + '"]').removeClass('hideorder');
                                    $(this).remove();
                                });

                                $('a[mail="' + math + '"]').click(function () {
                                    alertModal('<div class="am-text-left">\
                                                <p>买家名称：' + x.Buyer + '</p>\
                                                <p>联系人：' + (x.BuyerAddress.Person || '') + '</p>\
                                                <p>联系电话：' + (x.BuyerAddress.TelPhone || '') + '</p>\
                                                <p>收货地址：' + (x.BuyerAddress.Address || '') + '</p>\
                                              </div>');
                                });

                            });
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
                        else {
                            $('.sellorder div[id^="sell"]').html('<p class="am-text-center">未找到相关订单</p>');
                            $('.am-pagination').empty();
                        }
                    }
                    else {
                        $('.am-pagination').empty();
                        alertModal('服务器出了点小问题，请骚后尝试操作！');
                    }
                }
            });
        }
    }

    $('#searchorder_btn').keydown(function (event) {
        if (event.keyCode == 13) {
            trunUrl('#/mysell?sid=' + $(this).val() + (stage && ('&stage=' + stage) || '') + (t_month > 0 && ('&month=' + t_month) || ''));
        }
    });

    $('#searchorder_month').change(function () {
        trunUrl('#/mysell?month=' + $(this).val() + (stage && ('&stage=' + stage) || '') + (t_sid && ('&sid=' + t_sid) || ''));
    });

    function sureorder(PurchaseNo, PreSendDate) {
        $.ajax({
            type: 'POST',
            url: posturl + 'SellerCenter/Audit',
            data: {
                SessionKey: localStorage.lsid,
                PurchaseNo: PurchaseNo,
                PreSendDate: PreSendDate,
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

    function confirmSend(PurchaseNo) {
        $.ajax({
            type: 'POST',
            url: posturl + 'SellerCenter/RequestSend',
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

    function generateSend(PurchaseNo, SendDate, OutSendNo, Goods) {
        $.ajax({
            type: 'POST',
            url: posturl + 'SellerCenter/GenerateSend',
            data: {
                SessionKey: localStorage.lsid,
                PurchaseNo: PurchaseNo,
                SendDate: SendDate,
                OutSendNo: OutSendNo,
                Goods: Goods,
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

    function getwillsend(PurchaseNo) {
        $.ajax({
            type: 'POST',
            url: posturl + 'SellerCenter/ShowToSentDetail',
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
                    var $modal = $('#confirm_deliver');
                    var order = $modal.find('.order-status');
                    order.empty();

                    var postdata = [];
                    if (data.data.length > 0) {
                        $('#sure_render').attr('disabled', false);
                        data.data.map(function (t, index) {
                            postdata.push({ Guid: t.Guid, Qty: t.ToBeSent });
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
                                            <li class="td td-price">\
                                                <div class="item-number">\
                                                    <span>×</span>'+ t.Qty + '\
                                                </div>\
                                            </li>\
                                             <li class="td td-price">\
                                                <div class="item-number">\
                                                    <span>×</span>'+ t.HasSentQty + '\
                                                </div>\
                                            </li>\
                                            <li class="td td-operation">\
                                                <div class="item-number">\
                                                    <span>×</span>'+ t.HasReceiveQty + '\
                                                </div>\
                                            </li>\
                                            <li class="td td-operation">\
                                                <div class="item-operation">\
                                                <div class="sl" mtd="'+ mtd + '">\
                                                    <button class="min am-btn am-btn-default">\
                                                        <i class="am-icon-minus"></i>\
                                                    </button>\
                                                        <input class="text_box am-text-center" type="tel" value="'+ t.ToBeSent + '" style="width:50px;">\
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
                                    val = t.ToBeSent;
                                }
                                else if (val > t.ToBeSent) {
                                    val = t.ToBeSent;
                                }
                                $(this).val(val);
                                postdata[index].Qty = val;
                            });

                            $('.sl[mtd="' + mtd + '"] .am-btn').click(function () {
                                var $input = $(this).siblings('.text_box');
                                var val = $input.val();
                                if ($(this).hasClass('add')) {
                                    if (val < t.ToBeSent) {
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
                    }
                    else {
                        order.html('<p class="am-text-center am-margin-top-lg">您的货物已经发完了 亲！</p>');
                        $('#sure_render').attr('disabled', true);
                    }

                    $('#confirm_deliver').modal({
                        relatedTarget: this,
                        closeViaDimmer: false,
                        closeOnConfirm: false,
                        onConfirm: function (e) {
                            var $bill = $('#send_billno');
                            var $picker = $('#send_picker');
                            var err = false;
                            if ($bill.val().trim() == '') {
                                err = true;
                                $bill.addClass('input-err');
                            }
                            if ($picker.val().trim() == '') {
                                err = true;
                                $picker.addClass('input-err');
                            }
                            if (err) {
                                return false;
                            }
                            $('#sure_render').attr('disabled', true);
                            generateSend(PurchaseNo, $picker.val(), $bill.val(), postdata);
                        },
                    });
                }
                else {
                    alertModal('服务器出了点小问题，请骚后尝试操作！');
                }
            }
        });
    }

    function suredate(PurchaseNo, isAgree) {
        $.ajax({
            type: 'POST',
            url: posturl + 'SellerCenter/AgreeDelay',
            data: {
                SessionKey: localStorage.lsid,
                PurchaseNo: PurchaseNo,
                IsSellerAgreeDelay: isAgree,
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

    function ReAudit(PurchaseNo) {
        $('#ReAudit_modal').modal({
            relatedTarget: this,
            closeViaDimmer: false,
            closeOnConfirm: false,
            onConfirm: function (e) {
                $.ajax({
                    type: 'POST',
                    url: posturl + 'SellerCenter/ReAudit',
                    data: {
                        SessionKey: localStorage.lsid,
                        PurchaseNo: PurchaseNo,
                        Reason: $('#reauit_Reson').val(),
                        Type: $('#reauit_Type').val()
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
    }

    function agreeClose(PurchaseNo) {
        $.ajax({
            type: 'POST',
            url: posturl + 'SellerCenter/AgreeClosed',
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

    function getQuType() {
        $.ajax({
            type: 'POST',
            url: posturl + 'ComplaintType/ShowList',
            data: {
                SessionKey: localStorage.lsid,
                Stage: 11,
            },
            success: function (data) {
                var ApiResult = CheckApi(data);
                if (!ApiResult) {
                    return;
                }
                //----------------------------------
                if (!data.IsErr) {
                    $('#reauit_Type').html(data.data.map(function (x) {
                        return '<option value="' + x.CategoryName + '">' + x.CategoryName + '</option>';
                    }));
                }
                else {
                    alertModal('服务器出了点小问题，请骚后尝试操作！');
                }
            }
        });
    }

    $('#send_billno').change(function () {
        $(this).removeClass('input-err');
    });
    $('#send_picker').change(function () {
        $(this).removeClass('input-err');
    })

    // $('#datepick').datepicker();
    // $('#send_picker').datepicker();
})(window, $)