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
    });

    $('.am-tabs-d2').tabs('open', Number(stage || -1) + 1);
    $('.am-tabs-d2').find('a').on('open.tabs.amui', function (e) {
        var tstage = $(this).attr('data-tab');
        if (tstage >= 0) {
            trunUrl('#/person?stage=' + tstage);
        }
        else {
            trunUrl('#/person');
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
                url: posturl + 'BuyerCenter/ShowStageOrder',
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
                        $('.am-nav-tabs li a').map(function (x) {
                            var tab = $(this).attr('data-tab');
                            if (tab >= 0 && tab < 3) {
                                if (data.StageQty[tab].Qty > 0) {
                                    $(this).find('.am-badge').html(data.StageQty[tab].Qty);
                                }
                            }
                        });


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
                                            <span style="padding-right:30px;"><a href="javascript:void(0);" mail="'+ math + '">配送方式：' + (x.ShippingMethod == 0 ? '送货' : '自提') + '</a></span>\
                                            <span>材料商：'+ x.Seller + '</span>\
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
                                                               <p>'+ k.ItemName + '<a href="javascript:void(0)" SkuCode="' + k.SkuCode + '" title="加入购物车" class="am-badge am-badge-primary add_scar"><i class="am-icon-cart-plus"></i></a></p>\
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
                                                        合计：'+ x.TotalFee.toFixed(3) + '\
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
                                                    <li class="td td-operation" style="'+ (x.data.length == 1 ? 'margin-top:-9%;' : 'margin-top:-5%;') + '">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">等待卖家确认</p>\
                                                            <p class="Mystatus">交货日期<br\>'+ ChangeDate(x.DeliveryDate) + '</p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="'+ (x.data.length == 1 ? 'margin-top:-8%;' : 'margin-top:-5%;') + '">\
                                                        <button class="am-btn am-btn-danger anniu" name="'+ math + '" idx="' + index + '">取消订单</button>\
                                                        <p class="Mystatus"><a math="'+ math + '" href="javascript:void(0);">修改数量</a></p>\
                                                    </li>\
                                                </div>');
                                        $('#order_noconfirm').append(dom);
                                        // $('#order_all').append(dom);
                                        $('button[name="' + math + '"]').click(function () {
                                            ReAudit(x.PurchaseNO)
                                        });

                                        $('a[math="' + math + '"]').click(function () {
                                            edit_order(x);
                                        });


                                        break;
                                    case '1':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation" style="' + ((x.IsBuyerDelay == 1) ? 'margin-top:-15%;' : x.data.length == 1 ? 'margin-top:-9%;' : '') + '">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">卖家已确认</p>\
                                                            <p class="am-text-warning">发货时间<br\>'+ ChangeDate(x.PreSendDate) + '</p>\
                                                            '+ (x.IsBuyerDelay == 1 ? '<p class="Mystatus" style="color: #dd514c;">延期发货<br\>' + ChangeDate(x.DelaySendDate) + '</p>' : '') + '\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="margin-top:-5%;">\
                                                        '+ (x.IsBuyerDelay > 0 ? '<p class="Mystatus">待卖家确认日期</p>' : '<button class="am-btn am-btn-danger anniu" name="' + math + '" idx="' + index + '">确认可收货</button>\
                                                        <p class="Mystatus"><a href="javascript:void(0);" grep="'+ math + '">延期发货</a></p>') + '\
                                                    </li>\
                                                </div>');
                                        $('#order_isconfirm').append(dom);
                                        // $('#order_all').append(dom);
                                        $('button[name="' + math + '"]').click(function () {
                                            //var id = $(this).attr('idx');
                                            sureReceipt(x.PurchaseNO)
                                        });
                                        $('a[grep="' + math + '"]').click(function () {
                                            //var id = $(this).attr('idx');
                                            $('#datepick_modal').modal({
                                                relatedTarget: this,
                                                closeViaDimmer: false,
                                                closeOnConfirm: false,
                                                onConfirm: function (e) {
                                                    if (!e.data) {
                                                        $('#datepick').addClass('input-err');
                                                    }
                                                    DelaySend(x.PurchaseNO, e.data);
                                                },
                                            });
                                        });
                                        break;
                                    case '2':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation" style="' + ((1 == 1) ? 'margin-top:-13%;' : '') + '">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">'+ (x.HasSent > 0 ? '<span style="color:#f40;">卖家已发货</span>' : '卖家未发货') + '</p>\
                                                              '+ (x.IsBuyerDelay == 1 ? (x.IsSellerAgreeDelay == 1 ? ('<p class="Mystatus" style="color: #00af8d">同意延期发货<br\>' + ChangeDate(x.DelaySendDate) + '</p>')
                                                : x.IsSellerAgreeDelay == 2 ? ('<p class="Mystatus" style="color: #dd514c;">不同意延期发货<br\>按原发货时间<br\>' + ChangeDate(x.PreSendDate) + '</p>') : '<p class="Mystatus" style="color: #00af8d">申请延期发货<br\>' + ChangeDate(x.DelaySendDate) + '</p>') :
                                                '<p class="Mystatus">发货日期<br\>' + ChangeDate(x.PreSendDate) + '</p>') + '\
                                                            <p class="Mystatus"><a href="javascript:void(0);"  grep="'+ math + '"  style="color: #dd514c">发货详情</a></p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="margin-top:-5%;">\
                                                        <button class="am-btn am-btn-danger anniu" name="'+ math + '" idx="' + index + '">确认收货</button>\
                                                        <p class="Mystatus">'+ (x.IsBuyerRequestClosed == 1 ? '<a href="javascript:void(0);" rkclose="' + math + '">撤销申请</a>' : '<a href="javascript:void(0);" close="' + math + '">取消订单</a>') + '</p>\
                                                    </li>\
                                                </div>');
                                        $('#order_bereceived').append(dom);
                                        // $('#order_all').append(dom);
                                        $('button[name="' + math + '"]').click(function () {
                                            //var id = $(this).attr('idx');
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO);
                                        });
                                        $('a[grep="' + math + '"]').click(function () {
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO);
                                        });
                                        $('a[close="' + math + '"]').click(function () {
                                            ReClose(x.PurchaseNO, 1);
                                        });
                                        $('a[rkclose="' + math + '"]').click(function () {
                                            ReClose(x.PurchaseNO, 2);
                                        });
                                        break;
                                    case '3':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation" style="margin-top:-5%;">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">已收货</p>\
                                                            <p class="Mystatus"><a href="javascript:void(0);" name="'+ math + '" style="color: #dd514c">发货详情</a></p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="margin-top:-3%;">\
                                                        <p class="Mystatus">交易完成</p>\
                                                    </li>\
                                                </div>');
                                        /* '+ (x.HasAfterDone && (x.HasAfterDone.HasDone == 0 ? '<p class="Mystatus"><a href="javascript:void(0);"  mat="' + math + '" style="color: #dd514c">已申请售后</a></p>' :
                                                '<p class="Mystatus"><a href="javascript:void(0);" mat="' + math + '" style="color: #dd514c">售后完结</a></p>') || '<a href="javascript:void(0);" class="am-btn am-btn-danger anniu" grep="' + math + '" idx="' + index + '">申请售后</a>') + '*/
                                        $('#order_close').append(dom);
                                        // $('#order_all').append(dom);
                                        $('a[name="' + math + '"]').click(function () {
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO);
                                        });
                                        // $('a[grep="' + math + '"]').click(function () {
                                        //     window.open('http://192.168.1.190:8806/bsprt/html-Supplier/CustomerService.html?sgn=' + localStorage.lsid + '&no=' + x.PurchaseNO);
                                        // });
                                        // $('a[mat="' + math + '"]').click(function () {
                                        //     window.open('http://192.168.1.190:8806/bsprt/html-Supplier/CustomerService.html?sgn=' + localStorage.lsid + '&no=' + x.PurchaseNO + '&m=1');
                                        // });
                                        break;
                                    default:
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation" style="margin-top:-5%;">\
                                                        <div class="item-status">\
                                                             <p class="Mystatus">'+ (x.Stage == 10 ? '买家取消' : x.Stage == 11 ? '卖家取消' : '双方取消') + '</p>\
                                                             <p class="Mystatus"><a href="javascript:void(0);" name="'+ math + '" style="color: #dd514c">订单详情</a></p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="margin-top:-3%;">\
                                                        <p class="Mystatus">交易关闭</p>\
                                                    </li>\
                                                </div>');
                                        $('#order_close').append(dom);
                                        // $('#order_all').append(dom);
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
                            $('.add_scar').click(function (event) {
                                $(".add_scar").attr("disabled", true);
                                var flyer = $('<button class="am-btn am-btn-success am-btn-xs am-round" style="z-index:9999"><i class="am-icon-cart-plus am-padding-right-xs"></i></button>');
                                //console.log(tData);    
                                var SkuCode = $(this).attr('SkuCode');
                                var offset = $(".main_usercart ").offset();
                                if ($("#turn_nav").css('display') != 'none') {
                                    offset = $("#turn_nav").offset();
                                }
                                $.ajax({
                                    type: 'POST',
                                    url: posturl + 'Purchase/AddPurchase',
                                    data: {
                                        SessionKey: localStorage.lsid,
                                        Seller: data.data[0].Seller,
                                        SkuCode: SkuCode,
                                        HasTax: 0,
                                        Qty: 1
                                    },
                                    success: function (data) {
                                        var ApiResult = CheckApi(data);
                                        if (!ApiResult) {
                                            return;
                                        }
                                        //----------------------------------
                                        if (!data.IsErr) {
                                            localStorage.carqty = data.Qty;
                                            flyer.fly({
                                                start: {
                                                    left: event.clientX,
                                                    top: event.clientY
                                                },
                                                end: {
                                                    left: offset.left,
                                                    top: 8,
                                                    width: 0,
                                                    height: 0
                                                },
                                                speed: 2, //越大越快，默认1.2
                                                vertex_Rtop: 0, //运动轨迹最高点top值，默认20
                                                onEnd: function () {
                                                    this.destory();
                                                    $('#carqty').html(localStorage.carqty);
                                                    $(".add_scar").attr("disabled", false);
                                                }
                                            });
                                        }
                                    },
                                    dataType: 'json'
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
                            $('.sellorder div[id^="sell"]').html('<p class="am-text-center">未找到相关订单</p>');
                            $('.am-pagination').empty();
                        }
                    }
                    else {
                        alertModal('服务器出了点小问题，请骚后尝试操作！');
                    }
                }
            });
        }
        else {
            $.ajax({
                type: 'POST',
                url: posturl + 'BuyerCenter/ShowAllOrder',
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

                        $('.am-nav-tabs li a').map(function (x) {
                            var tab = $(this).attr('data-tab');
                            if (tab >= 0 && tab < 3) {
                                if (data.StageQty[tab].Qty > 0) {
                                    $(this).find('.am-badge').html(data.StageQty[tab].Qty);
                                }
                            }
                        });

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
                                            <span style="padding-right:30px;"><a href="javascript:void(0);" mail="'+ math + '">配送方式：' + (x.ShippingMethod == 0 ? '送货' : '自提') + '</a></span>\
                                            <span>材料商：'+ x.Seller + '</span>\
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
                                                                <p>'+ k.ItemName + '<a href="javascript:void(0)" SkuCode="' + k.SkuCode + '" title="加入购物车" class="am-badge am-badge-primary add_scar"><i class="am-icon-cart-plus"></i></a></p>\
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
                                                        合计：'+ x.TotalFee.toFixed(3) + '\
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
                                                    <li class="td td-operation" style="'+ (x.data.length == 1 ? 'margin-top:-9%;' : 'margin-top:-5%;') + '">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">等待卖家确认</p>\
                                                            <p class="Mystatus">交货日期<br\>'+ ChangeDate(x.DeliveryDate) + '</p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="'+ (x.data.length == 1 ? 'margin-top:-8%;' : 'margin-top:-5%;') + '">\
                                                        <button class="am-btn am-btn-danger anniu" name="'+ math + '" idx="' + index + '">取消订单</button>\
                                                        <p class="Mystatus"><a math="'+ math + '" href="javascript:void(0);">修改数量</a></p>\
                                                    </li>\
                                                </div>');
                                        // $('#order_noconfirm').append(dom);
                                        $('#order_all').append(dom);
                                        $('button[name="' + math + '"]').click(function () {
                                            ReAudit(x.PurchaseNO)
                                        });

                                        $('a[math="' + math + '"]').click(function () {
                                            edit_order(x);
                                        });
                                        break;
                                    case '1':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation" style="' + ((x.IsBuyerDelay == 1) ? 'margin-top:-15%;' : x.data.length == 1 ? 'margin-top:-9%;' : '') + '">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">卖家已确认</p>\
                                                            <p class="am-text-warning">发货时间<br\>'+ ChangeDate(x.PreSendDate) + '</p>\
                                                            '+ (x.IsBuyerDelay == 1 ? '<p class="Mystatus" style="color: #dd514c;">延期发货<br\>' + ChangeDate(x.DelaySendDate) + '</p>' : '') + '\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="margin-top:-5%;">\
                                                        '+ (x.IsBuyerDelay > 0 ? '<p class="Mystatus">待卖家确认日期</p>' : '<button class="am-btn am-btn-danger anniu" name="' + math + '" idx="' + index + '">确认可收货</button>\
                                                        <p class="Mystatus"><a href="javascript:void(0);" grep="'+ math + '">延期发货</a></p>') + '\
                                                    </li>\
                                                </div>');
                                        // $('#order_isconfirm').append(dom);
                                        $('#order_all').append(dom);
                                        $('button[name="' + math + '"]').click(function () {
                                            //var id = $(this).attr('idx');
                                            sureReceipt(x.PurchaseNO)
                                        });
                                        $('a[grep="' + math + '"]').click(function () {
                                            //var id = $(this).attr('idx');
                                            $('#datepick_modal').modal({
                                                relatedTarget: this,
                                                closeViaDimmer: false,
                                                closeOnConfirm: false,
                                                onConfirm: function (e) {
                                                    if (!e.data) {
                                                        $('#datepick').addClass('input-err');
                                                    }
                                                    DelaySend(x.PurchaseNO, e.data);
                                                },
                                            });
                                        });
                                        break;
                                    case '2':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation" style="' + ((1 == 1) ? 'margin-top:-13%;' : '') + '">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">卖家发货</p>\
                                                              '+ (x.IsBuyerDelay == 1 ? (x.IsSellerAgreeDelay == 1 ? ('<p class="Mystatus" style="color: #00af8d">同意延期发货<br\>' + ChangeDate(x.DelaySendDate) + '</p>')
                                                : x.IsSellerAgreeDelay == 2 ? ('<p class="Mystatus" style="color: #dd514c;">不同意延期发货<br\>按原发货时间<br\>' + ChangeDate(x.PreSendDate) + '</p>') : '<p class="Mystatus" style="color: #00af8d">申请延期发货<br\>' + ChangeDate(x.DelaySendDate) + '</p>') :
                                                '<p class="Mystatus">发货日期<br\>' + ChangeDate(x.PreSendDate) + '</p>') + '\
                                                            <p class="Mystatus"><a href="javascript:void(0);"  grep="'+ math + '"  style="color: #dd514c">发货详情</a></p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="margin-top:-5%;">\
                                                        <button class="am-btn am-btn-danger anniu" name="'+ math + '" idx="' + index + '">确认收货</button>\
                                                        <p class="Mystatus">'+ (x.IsBuyerRequestClosed == 1 ? '<a href="javascript:void(0);" rkclose="' + math + '">撤销申请</a>' : '<a href="javascript:void(0);" close="' + math + '">取消订单</a>') + '</p>\
                                                    </li>\
                                                </div>');
                                        // $('#order_bereceived').append(dom);
                                        $('#order_all').append(dom);
                                        $('button[name="' + math + '"]').click(function () {
                                            //var id = $(this).attr('idx');
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO);
                                        });
                                        $('a[grep="' + math + '"]').click(function () {
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO);
                                        });

                                        $('a[close="' + math + '"]').click(function () {
                                            ReClose(x.PurchaseNO, 1);
                                        });
                                        $('a[rkclose="' + math + '"]').click(function () {
                                            ReClose(x.PurchaseNO, 2);
                                        });
                                        break;
                                    case '3':
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation" style="margin-top:-5%;">\
                                                        <div class="item-status">\
                                                            <p class="Mystatus">已收货</p>\
                                                            <p class="Mystatus"><a href="javascript:void(0);" name="'+ math + '" style="color: #dd514c">发货详情</a></p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="margin-top:-3%;">\
                                                        <p class="Mystatus">交易完成</p>\
                                                    </li>\
                                                </div>');
                                        /*'+ (x.HasAfterDone && (x.HasAfterDone.HasDone == 0 ? '<p class="Mystatus"><a href="javascript:void(0);"  mat="' + math + '" style="color: #dd514c">已申请售后</a></p>' :
                                                '<p class="Mystatus"><a href="javascript:void(0);" mat="' + math + '" style="color: #dd514c">售后完结</a></p>') || '<a href="javascript:void(0);" class="am-btn am-btn-danger anniu" grep="' + math + '" idx="' + index + '">申请售后</a>') + '*/
                                        // $('#order_close').append(dom);
                                        $('#order_all').append(dom);
                                        $('a[name="' + math + '"]').click(function () {
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO);
                                        });
                                        // $('a[grep="' + math + '"]').click(function () {
                                        //     window.open('http://192.168.1.190:8806/bsprt/html-Supplier/CustomerService.html?sgn=' + localStorage.lsid + '&no=' + x.PurchaseNO);
                                        // });
                                        // $('a[mat="' + math + '"]').click(function () {
                                        //     window.open('http://192.168.1.190:8806/bsprt/html-Supplier/CustomerService.html?sgn=' + localStorage.lsid + '&no=' + x.PurchaseNO + '&m=1');
                                        // });
                                        break;
                                    default:
                                        dom = dom.replace('#orderType#', '<div class="move-right">\
                                                    <li class="td td-operation" style="margin-top:-5%;">\
                                                        <div class="item-status">\
                                                             <p class="Mystatus">'+ (x.Stage == 10 ? '买家取消' : x.Stage == 11 ? '卖家取消' : '双方取消') + '</p>\
                                                             <p class="Mystatus"><a href="javascript:void(0);" name="'+ math + '" style="color: #dd514c">订单详情</a></p>\
                                                        </div>\
                                                    </li>\
                                                    <li class="td td-operation" style="margin-top:-3%;">\
                                                        <p class="Mystatus">交易关闭</p>\
                                                    </li>\
                                                </div>');
                                        // $('#order_close').append(dom);
                                        $('#order_all').append(dom);
                                        $('a[name="' + math + '"]').click(function () {
                                            window.open('#/sendinfo?pno=' + x.PurchaseNO);
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

                            $('.add_scar').click(function (event) {
                                $(".add_scar").attr("disabled", true);
                                var flyer = $('<button class="am-btn am-btn-success am-btn-xs am-round" style="z-index:9999"><i class="am-icon-cart-plus am-padding-right-xs"></i></button>');
                                //console.log(tData);    
                                var SkuCode = $(this).attr('SkuCode');
                                var offset = $(".main_usercart ").offset();
                                if ($("#turn_nav").css('display') != 'none') {
                                    offset = $("#turn_nav").offset();
                                }
                                $.ajax({
                                    type: 'POST',
                                    url: posturl + 'Purchase/AddPurchase',
                                    data: {
                                        SessionKey: localStorage.lsid,
                                        Seller: data.data[0].Seller,
                                        SkuCode: SkuCode,
                                        HasTax: 0,
                                        Qty: 1
                                    },
                                    success: function (data) {
                                        var ApiResult = CheckApi(data);
                                        if (!ApiResult) {
                                            return;
                                        }
                                        //----------------------------------
                                        if (!data.IsErr) {
                                            localStorage.carqty = data.Qty;
                                            flyer.fly({
                                                start: {
                                                    left: event.clientX,
                                                    top: event.clientY
                                                },
                                                end: {
                                                    left: offset.left,
                                                    top: 8,
                                                    width: 0,
                                                    height: 0
                                                },
                                                speed: 2, //越大越快，默认1.2
                                                vertex_Rtop: 0, //运动轨迹最高点top值，默认20
                                                onEnd: function () {
                                                    this.destory();
                                                    $('#carqty').html(localStorage.carqty);
                                                    $(".add_scar").attr("disabled", false);
                                                }
                                            });
                                        }
                                    },
                                    dataType: 'json'
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
                            $('.sellorder div[id^="sell"]').html('<p class="am-text-center">未找到相关订单</p>');
                            $('.am-pagination').empty();
                        }
                    }
                    else {
                        alertModal('服务器出了点小问题，请骚后尝试操作！');
                    }
                }
            });
        }
    }

    $('#searchorder_btn').keydown(function (event) {
        if (event.keyCode == 13) {
            trunUrl('#/person?sid=' + $(this).val() + (stage && ('&stage=' + stage) || '') + (t_month > 0 && ('&month=' + t_month) || ''));
        }
    });

    $('#searchorder_month').change(function () {
        trunUrl('#/person?month=' + $(this).val() + (stage && ('&stage=' + stage) || '') + (t_sid && ('&sid=' + t_sid) || ''));
    });


    function sureReceipt(PurchaseNo) {
        $.ajax({
            type: 'POST',
            url: posturl + 'BuyerCenter/RequestSend',
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

    function DelaySend(PurchaseNo, Date) {
        $.ajax({
            type: 'POST',
            url: posturl + 'BuyerCenter/DelaySend',
            data: {
                SessionKey: localStorage.lsid,
                PurchaseNo: PurchaseNo,
                PreSendDate: Date
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
                    url: posturl + 'BuyerCenter/ReAudit',
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

    function ReClose(PurchaseNo, state) {
        if (state == 1) {
            $('#ReClose_modal').modal({
                relatedTarget: this,
                closeViaDimmer: false,
                closeOnConfirm: false,
                onConfirm: function (e) {
                    $.ajax({
                        type: 'POST',
                        url: posturl + 'BuyerCenter/RequestClosed',
                        data: {
                            SessionKey: localStorage.lsid,
                            PurchaseNo: PurchaseNo,
                            IsBuyerRequestClosed: 1,
                            RequestClosedReason: $('#reclose_Reson').val(),
                            RequestClosedType: $('#reclose_Type').val()
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
        else if (state == 2) {
            $('#RevokeClose').modal({
                relatedTarget: this,
                closeViaDimmer: false,
                closeOnConfirm: false,
                onConfirm: function (e) {
                    $.ajax({
                        type: 'POST',
                        url: posturl + 'BuyerCenter/RequestClosed',
                        data: {
                            SessionKey: localStorage.lsid,
                            PurchaseNo: PurchaseNo,
                            IsBuyerRequestClosed: 2,
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
    }

    function getQuType() {
        $.ajax({
            type: 'POST',
            url: posturl + 'ComplaintType/ShowList',
            data: {
                SessionKey: localStorage.lsid,
                Stage: 10,
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

        $.ajax({
            type: 'POST',
            url: posturl + 'ComplaintType/ShowList',
            data: {
                SessionKey: localStorage.lsid,
                Stage: 12,
            },
            success: function (data) {
                var ApiResult = CheckApi(data);
                if (!ApiResult) {
                    return;
                }
                //----------------------------------
                if (!data.IsErr) {
                    $('#reclose_Type').html(data.data.map(function (x) {
                        return '<option value="' + x.CategoryName + '">' + x.CategoryName + '</option>';
                    }));
                }
                else {
                    alertModal('服务器出了点小问题，请骚后尝试操作！');
                }
            }
        });
    }
    // $('#datepick').datepicker();


    function edit_order(x) {
        var $modal = $('#edit_orderNum');
        var order = $modal.find('.order-status');
        order.empty();
        var postdata = [];
        x.data.map(function (t, index) {
            postdata.push({ Guid: t.Guid, Qty: t.Qty });
            var mtd = Math.random().toString().substring(2);
            var tPrice = t.HasTax == 1 ? t.PriceN : t.Price;
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
                                            <li class="td td-operation">\
                                                <div class="item-price">\
                                                    '+ tPrice + '\
                                                </div>\
                                            </li>\
                                            <li class="td td-operation">\
                                                <div class="item-number">\
                                                    <span>×</span>'+ t.Qty + '\
                                                </div>\
                                            </li>\
                                            <li class="td td-operation">\
                                                <div class="item-operation">\
                                                <div class="sl" mtd="'+ mtd + '">\
                                                    <button class="min am-btn am-btn-default">\
                                                        <i class="am-icon-minus"></i>\
                                                    </button>\
                                                        <input class="text_box am-text-center" type="tel" value="'+ t.Qty + '" style="width:50px;">\
                                                    <button class="add am-btn am-btn-default">\
                                                        <i class="am-icon-plus"></i>\
                                                    </button>\
                                                </div>\
                                            </li>\
                                            <li class="td td-operation">\
                                                <div class="item-number">\
                                                    ￥'+ t.Qty * tPrice + '\
                                                </div>\
                                            </li>\
                                        </ul>\
                                    </div>\
                                </div>\
                            </div>';

            order.append(bsdom);

            $('.sl[mtd="' + mtd + '"] .text_box').keyup(function () {
                var val = $(this).val();
                var reg = /^((\d+)|([0-9]+\.[0-9]{0,4}))$/;
                if (!reg.test(val)) {
                    val = t.Qty;
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
                $(this).val(val);
                postdata[index].Qty = val;
            }).change(function () {
                var val = $(this).val();
                if (val <= 0) {
                    val = 1;
                };
                postdata[index].Qty = val;
                $(this).val(val);

                var $total = $(this).parents('.td-operation').next().find('.item-number');
                $total.html('￥' + val * tPrice);
            });;

            $('.sl[mtd="' + mtd + '"] .am-btn').click(function () {
                var $input = $(this).siblings('.text_box');
                var val = $input.val();
                if ($(this).hasClass('add')) {
                    if (val < 999999) {
                        val = Number(val) + 1;
                        if (val.toString().substr(val.toString().indexOf('.') + 1).length > 4) {
                            val = Math.round(val * 10000) / 10000;
                        }
                    }
                }
                else {
                    if (val - 1 > 0) {
                        val--;
                        if (val.toString().substr(val.toString().indexOf('.') + 1).length > 4) {
                            val = Math.round(val * 10000) / 10000;
                        }
                    }
                }
                $input.val(val);
                postdata[index].Qty = val;

                var $total = $(this).parents('.td-operation').next().find('.item-number');
                $total.html('￥' + val * tPrice);
            });
        });

        $modal.modal({
            relatedTarget: this,
            closeViaDimmer: false,
            closeOnConfirm: false,
            onConfirm: function (e) {
                if(postdata.map(function(x){return x.Qty}).indexOf(0)>-1){
                    return false;
                }
                $.ajax({
                    type: 'POST',
                    url: posturl + 'BuyerCenter/UpdatePurchaseQty',
                    data: {
                        SessionKey: localStorage.lsid,
                        PurchaseNo: x.PurchaseNO,
                        Guids: postdata,
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
                            location.reload();
                        }
                    }
                });
            },
        });
    }
})(window, $)