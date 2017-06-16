(function (window, $) {
    var para = location.hash.replace('#/', '');
    para = para.substring(para.indexOf('?'));
    //----------------------------------------------------------
    var sid = getQuery('sid', para);
    var type = getQuery('type', para);
    var page = Number(getQuery('page', para)) || 1;
    page = typeof (page) == 'number' ? page : 1;
    $('.main_search').val(sid);
    $.get(posturl + "mtpmaterial/Search", {
        sid: sid,
        type: type,
        page: page,
        SessionKey: localStorage.lsid,
    }, function (result) {
        if (!result.IsErr) {
            var data = result.data;
            if (data && data.length > 0) {
                var head = type && ('<div class="am-g am-container main_itemlist">\
        <div class="am-u-sm-12 am-u-md-12 am-u-lg-12 am-center">\
            <div data-am-widget="titlebar" class="am-titlebar am-titlebar-default">\
                <h2 class="am-titlebar-title main_titlebar-1">\
                    '+ type + '\
                </h2>\
            </div>\
        </div>\
        <div class="am-u-sm-12 am-u-md-12 am-u-lg-12 am-center">') || '';
                $('#item_list').html(head + data.map(function (k, index) {
                    return '\<div class="am-u-sm-12 am-u-md-6 am-u-lg-3">\
                <div class="main_itemmodal">\
                    <div class="am-u-sm-3 am-vertical-align" style="height: 100%;">\
                        <img class="main_itemimg am-vertical-align-middle" src="'+ k.SkuPic + '">\
                    </div>\
                    <div class="am-u-sm-9">\
                        <p class="main_itemtitle am-text-truncate" title="' + k.ItemName + '">' + k.ItemName + '</p>\
                                                <p class="main_itemremark am-text-truncate" title="'+ k.SkuCode + ',' + k.SkuName + '">' + k.SkuCode + (k.SkuName && ('，' + k.SkuName) || '') + '</p>\
                        <p class="main_itemremark am-text-truncate" title="'+ k.Supplier + '">' + k.Supplier + '</p>\
                        <p class="main_itemtitle"><i class="am-icon-jpy" title="含税价"></i><em class=" am-margin-xs am-text-danger am-text-hs">'+ k.PriceN + '</em><i class="am-icon-jpy am-margin-left" title="单价"></i><em class="am-text-danger"> ' + k.Price + '</em>\
                          <button class="am-btn am-btn-success am-btn-xs am-round am-fr add_tocar"  index="' + index + '">\
                             <i class="am-icon-cart-plus am-padding-right-xs" ></i>\
                          </button>\
                        </p>\
                    </div >\
                </div>\
            </div>';
                }).join('')) + '</div>';





                $('.add_tocar').click(function (event) {
                    $(".add_tocar").attr("disabled", true);
                    var pindex = $(this).attr('index');
                    var tData = data[pindex];
                    var flyer = $('<button class="am-btn am-btn-success am-btn-xs am-round" style="z-index:9999"><i class="am-icon-cart-plus am-padding-right-xs"></i></button>');
                    //console.log(tData);    
                    var offset = $(".main_usercart ").offset();
                    if ($("#turn_nav").css('display') != 'none') {
                        offset = $("#turn_nav ").offset();
                    }
                    $.ajax({
                        type: 'POST',
                        url: posturl + 'Purchase/AddPurchase',
                        data: {
                            SessionKey: localStorage.lsid,
                            Seller: tData.Supplier,
                            SkuCode: tData.SkuCode,
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
                                        $(".add_tocar").attr("disabled", false);
                                    }
                                });
                            }
                        },
                        dataType: 'json'
                    });
                });

                var pagination = new Pagination({
                    wrap: $('.am-pagination'),
                    count: result.PageCount,
                    current: page,
                    callback: function (page) {
                        var url = location.href;
                        if (url.indexOf('&page') > -1) {
                            url = url.substring(0, url.indexOf('&page'));
                        };
                        trunUrl(url + '&page=' + page);
                    }
                });
            }
            else {
                $('#item_list').html('<p class="am-text-center">未找到该材料</p>');
            }
        }
        else {
            $('#item_list').html('<p class="am-text-center">哎呀，服务器出了点小故障~~</p>');
        }
    });

    $('#fl_list .fl a').unbind('click').click(function () {
        var val = $(this).html();
        sm.getItem(null, val);
        $('#fl_modal').dropdown('close');
        $('#collapse-head').collapse('close');
        return false;
    });


})(window, $)