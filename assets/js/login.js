(function (window, $) {
    var posturl='';
    if (location.port == 8890) {
        posturl = 'http://119.145.166.182:8806/lsmaterial/';
    }
    else {
        posturl = 'http://localhost:56952/';
        $('body').append('<span style="color:#f00;">提示：测试环境</span>');
    }

    $('#ls_loginbtn').click(function () {
        var _this = this;
        $(this).attr('disabled', true).html('<i class="am-icon-spinner am-icon-pulse am-margin-right"></i>加载中..');
        $.ajax({
            type: 'POST',
            url: posturl + 'Login/ToLogin',
            data: {
                username: $('#ls_username').val(),
                pwd: $('#ls_userpsd').val(),
            },
            success: function (data) {
                $(_this).attr('disabled', false).html('登录');
                if (data.IsPass) {
                    localStorage.lsid = data.content.SessionKey;
                    localStorage.user = data.content.UserName;
                    localStorage.carqty = data.CartQty;
                    trunUrl('/');
                }
                else {
                    $('#login_err span').html(data.msg);
                    $('#login_err').removeClass('am-hide');
                }
            }
        });

    });

    $('.ele').keydown(function (e) {
        if (e.which == 13) {
            $('#ls_loginbtn').click();
        }
    });

    $('.am-close').click(function () {
        $('#login_err').addClass('am-hide');
    });


    function trunUrl(href) {
        if (isIE()) {
            window.location.href = href;
            var referLink = document.createElement('a');
            referLink.href = href;
            document.body.appendChild(referLink);
            referLink.click();
        }
        else {
            self.location = href;
        }
    }
    function isIE() { //ie?
        if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
        else
            return false;
    }
})(window, $);
