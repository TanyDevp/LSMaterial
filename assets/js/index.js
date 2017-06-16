/* 2017-05-15 --Tany*/

$('#loadmodal').modal('open');
var pjax = CoffcePJAX;
var posturl = 'http://119.145.166.182:8806/lsmaterial/';
// var pathname = location.hash;
// if (pathname.indexOf('#/') > -1) {
//     pjax.turn(pathname.replace('#/', 'pages/') + '.html');
// }
// else {
//     pjax.turn('pages/main.html');
// }
//首页加载
pjax.turn(location.href);

pjax.init({
    container: document.getElementById("detail"),
    hash: true,
    filter: {
        content: function (title, html) {
            if (html.indexOf('<html lang="zh">') > -1) {
                return false;
            }
            else {

            }
            return true;
        }
    },
    events: {
        // init: function () {
        //     $.AMUI.progress.start();
        // },
        // end: function () {
        //     $.AMUI.progress.done();
        // },
        ajaxBegin: function () {
            $.AMUI.progress.start();
        },
        ajaxSuccess: function () {
            $.AMUI.progress.done();
        },
        ajaxError: function () {
            $.AMUI.progress.done();
        }
    }
});


//验证登录
if (localStorage.lsid) {
    $('#login_usertag').height(40).html('<button class="am-btn am-topbar-btn am-btn-sm main_userinfo"><i class="am-icon-user"></i></button>\
    <span class="main_username am-text-truncate" title="'+ localStorage.user + '">Hi!~' + localStorage.user + '</span>');
    $('#carqty').html(localStorage.carqty);
    $('#login_btn').remove();
}

$('#loadmodal').modal('close');
//----------------------------------------------------
var sm = {
    getItem: function (name, type) {
        var baseSearch = '';
        var baseurl = 'pages/item.html';
        if (name) {
            baseSearch = 'sid=' + name;
        }
        if (type) {
            baseSearch = 'type=' + type;
        }
        if (baseSearch) {
            baseurl += '?' + baseSearch;
        }
        pjax.turn(baseurl);
    }
};

$('body').click(function (event) {
    if (!$(event.target).hasClass('am-dropdown-toggle') && $('#turn_nav').css('display') != 'none' && $('#collapse-head').css('display') != 'none') {
        $('#collapse-head').collapse('close');
    }
});

$('.main_search').keydown(function (event) {
    if (event.keyCode == 13) {
        var val = $(this).val();
        sm.getItem(val);
    }
});

$('#main_searchbtn').click(function () {
    var val = $('#main_searchgo').val();
    sm.getItem(val);
});

$('#login_btn').click(function () {
    $('#user_login').modal({
        closeViaDimmer: false,
    });
});

$('#ls_loginbtn').click(function () {
    $.ajax({
        type: 'POST',
        url: posturl + 'Login/ToLogin',
        data: {
            username: $('#ls_username').val(),
            pwd: $('#ls_userpsd').val(),
        },
        success: function (data) {
            if (data.IsPass) {
                localStorage.lsid = data.content.SessionKey;
                localStorage.user = data.content.UserName;
                localStorage.carqty = data.CartQty;
                location.reload();
            }
            else {
                $('#login_err span').html(data.msg);
                $('#login_err').removeClass('am-hide');
            }
        }
    });

});

$('#user_login input').keydown(function () {
    if (event.keyCode == 13) {
        $('#ls_loginbtn').click();
    }
});

$('#user_login .am-close').click(function () {
    trunUrl('/');
});

$('.alert_err .am-close').click(function () {
    $(this).parent().addClass('am-hide');
});

$('#ud_pd').click(function () {
    if (SessionPass()) {
        $('#update_pwd').modal({
            closeViaDimmer: false,
            onConfirm: function () {
                var oldpwd = $('#ud_oldpwd').val();
                var newpwd = $('#ud_newpwd').val();
                var conpwd = $('#ud_conpwd').val();
                if (newpwd != conpwd || newpwd == '') {
                    $('#ud_err span').html('两次新密码输入不一致');
                    $('#ud_err').removeClass('am-hide');
                    return;
                }
                $.ajax({
                    type: 'POST',
                    url: posturl + 'Login/UpdatePassword',
                    data: {
                        SessionKey: localStorage.lsid,
                        OldPassword: oldpwd,
                        pwd: newpwd,
                    },
                    success: function (data) {
                        var ApiResult = CheckApi(data);
                        if (!ApiResult) {
                            return;
                        }
                        if (!data.IsErr) {
                            localStorage.clear();
                            location.reload();
                        }
                        else {
                            $('#ud_err span').html(data.ErrDesc);
                            $('#ud_err').removeClass('am-hide');
                        }
                    }
                });
            }
        });
    }
});

$('#quit_login').click(function () {
    localStorage.clear();
    location.reload();
});

function getQuery(name, url) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r;
    if (url) {
        r = url.substr(1).match(reg);
    }
    else {
        r = window.location.search.substr(1).match(reg);
    }
    if (r != null) return decodeURI(r[2]); return null;
}

function CheckApi(data) {
    if (data.IsPass == null || data.IsPass == true) {
        return true;
    }
    if ($('#user_login').is(':hidden')) {
        $('#user_login').modal({
            closeViaDimmer: false,
        });
    }
    return;
}

function SessionPass() {
    var turn = false;
    if (localStorage.lsid) {
        $.ajax({
            type: 'GET',
            async: false,
            url: posturl + 'Login/CheckKey',
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
                    turn = true;
                }
                else {
                    $('#user_login').modal({
                        closeViaDimmer: false,
                    });
                    turn = false;
                }
            }
        });
    }
    else {
        $('#user_login').modal({
            closeViaDimmer: false,
        });
    }
    return turn;
};

$('a[use="skpe"]').click(function () {
    var href = $(this).attr('thref');
    if (SessionPass()) {
        trunUrl(href);
    }
    return false;
});

function alertModal(text) {
    $('#Modalalert .am-modal-bd').empty().html(text);
    $('#Modalalert').modal('toggle');
}

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function ChangeDateFormat(time) {
    if (time != null) {
        var ctime = time.replace('T', ' ');
        var date = new Date(ctime);
        return date.Format("yyyy-MM-dd hh:mm:ss");
    }
    return "";
}

function ChangeDate(time) {
    if (time != null) {
        var ctime = time.replace('T', ' ');
        var date = new Date(ctime);
        return date.Format("yyyy-MM-dd");
    }
    return "";
}

function isIE() { //ie?
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

function trunUrl(href) {
    if (isIE()) {
        var referLink = document.createElement('a');
        referLink.href = href;
        document.body.appendChild(referLink);
        referLink.click();
    }
    else {
        self.location = href;
    }
}