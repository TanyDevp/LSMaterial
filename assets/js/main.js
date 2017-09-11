(function (window, $) {

    //获取物料列表
    $.get(posturl + "mtpmaterial/Home?SessionKey=" + localStorage.lsid, function (result) {
        if (result.IsPass == false) {
            trunUrl('/login.html');
            return;
        }
        
        var loginuser = localStorage.user;
        if (!result.IsErr) {
            var data = result.data;
            var catData = result.catData;
            if (data && data.length > 0) {
                $('.main').html(data.map(function (x, x_index) {
                    return ' <div class="am-g am-container main_itemlist">\
        <div class="am-u-sm-12 am-u-md-12 am-u-lg-12 am-center">\
            <div data-am-widget="titlebar" class="am-titlebar am-titlebar-default">\
                <h2 class="am-titlebar-title main_titlebar-1">\
                    '+ x.SkuType + '\
                </h2>\
                <nav class="am-titlebar-nav">\
                    <a href="#/item?type='+ x.SkuType + '" class="">更多 &raquo;</a>\
                </nav>\
            </div>\
        </div>\
        <div class="am-u-sm-12 am-u-md-12 am-u-lg-12 am-center">\
        '+ (x.data.map(function (k, k_index) {
                            return '\<div class="am-u-sm-12 am-u-md-6 am-u-lg-3">\
                <div class="main_itemmodal">\
                    <div class="am-u-sm-3 am-vertical-align" style="height: 100%;">\
                        <img class="main_itemimg am-vertical-align-middle" src="'+ k.SkuPic + '">\
                    </div>\
                    <div class="am-u-sm-9">\
                        <p class="main_itemtitle am-text-truncate" title="' + k.ItemName + '">' + k.ItemName + '</p>\
                        <p class="main_itemremark am-text-truncate" title="'+ k.SkuCode + ',' + k.SkuName + '">' + k.SkuCode + (k.SkuName && ('，' + k.SkuName) || '') + '</p>\
                        <p class="main_itemremark am-text-truncate" title="'+ k.Supplier + '">' + k.Supplier + '</p>\
                        '+ (loginuser == k.Seller ? ' <p class="main_itemremark am-text-truncate" title="' + k.Buyer + '">对应加工厂:' + k.Buyer + '</p>\
                        <p class="main_itemtitle">' + (k.PriceN > 0 ? '<i class="am-icon-jpy" title="单价"></i><em class="am-text-danger"> ' + k.Price + '</em><i class="am-icon-jpy am-margin-left" title="含税价"></i><em class=" am-margin-xs am-text-danger am-text-hs">' + k.PriceN + '</em>' : '<i class="am-icon-jpy" title="单价"></i><em class="am-text-danger"> ' + k.Price + '</em>')+'</p>' :
                                    '<p class="main_itemtitle">' + (k.PriceN > 0 ? '<i class="am-icon-jpy" title="单价"></i><em class="am-text-danger"> ' + k.Price + '</em><i class="am-icon-jpy am-margin-left" title="含税价"></i><em class=" am-margin-xs am-text-danger am-text-hs">' + k.PriceN + '</em>' : '<i class="am-icon-jpy" title="单价"></i><em class="am-text-danger"> ' + k.Price + '</em>') + '\
                          <button class="am-btn am-btn-success am-btn-xs am-round am-fr add_tocar" index="'+ x_index + '_' + k_index + '" title="加入购物车">\
                             <i class="am-icon-cart-plus am-padding-right-xs" ></i>\
                          </button>\
                        </p>') + '\
                    </div >\
                </div>\
            </div>';
                        }).join('')) + '\
                        </div>\
            </div>';
                }).join(''));


                var offset = $(".main_usercart ").offset();
                if ($("#turn_nav").css('display') != 'none') {
                    offset = $("#turn_nav ").offset();
                }
                $('.add_tocar').click(function (event) {
                    $(".add_tocar").attr("disabled", true);
                    var pindex = $(this).attr('index').split('_');
                    var tData = data[pindex[0]].data[pindex[1]];
                    var flyer = $('<button class="am-btn am-btn-success am-btn-xs am-round" style="z-index:9999"><i class="am-icon-cart-plus am-padding-right-xs"></i></button>');
                    //console.log(tData);                    
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


            } else {
                $('#item_list').html('<p class="am-text-center">哎呀，服务器出了点小故障~~</p>');
            }

            if (catData && catData.length > 0) {
                $('#fl_list').html(' <li class="am-dropdown-header">材料分类</li>' +
                    catData.map(function (x, index) { return ' <li class="fl"><a href="#">' + x + '</a></li>' }).join(''));

                $('#fl_list .fl a').unbind('click').click(function () {
                    var val = $(this).html();
                    sm.getItem(null, val);
                    $('#fl_modal').dropdown('close');
                    $('#collapse-head').collapse('close');
                    return false;
                });
            }
            else {
                $('#fl_list').html(' <li class="am-dropdown-header">材料分类</li>');
            }

        } else {
            $('#item_list').html('<p class="am-text-center">哎呀，服务器出了点小故障~~</p>');
        }
    });

})(window, $)