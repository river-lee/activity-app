/* global ejs: true,YmtApi:true */

/**
 * pk首页
 * @author river
 * @email lijiang@ymaotu.com
 * @create-date 20151014
 */
$(function () {
    'use strict';


    //初始化ejs
    ejs.open = '{{';
    ejs.close = '}}';

    var isFuntion = function (str) {
        return 'function' === typeof str;
    };

    var search = YmtApi.utils.getUrlObj(),
        authInfo = YmtApi.utils.getAuthInfo();

    var showLogStatus = true;

    /**
     * 显示日志
     */
    var showLog = function (msg, callback) {
        if (showLogStatus) {
            showLogStatus = false;
            var errElm = $('.pk-error');
            if (!errElm[0]) {
                errElm = $('<div class="pk-error"></div>')
                    .appendTo('body');
            }
            errElm.html(msg).css('opacity', '1');

            setTimeout(function () {
                $('.pk-error').css('opacity', '0');
                showLogStatus = true;
                callback && callback();
            }, 1800);
        }
    };

    /**
     * 通过jsonp获得数据
     * @param  {String}   url      请求的地址
     * @param  {Function} callback 回调方法
     * @param  {String}   fnName   [description]
     * @return {[type]}            [description]
     */
    var jsonpGetData = function (url, callback) {
        /*if(fnName){
            if(!(typeof window[fnName] === 'function')){
                window[fnName] = function(data){
                    callback && callback(data);
                    delete window[fnName];
                }
            }
        }*/
        $.ajax({
            url: url,
            type: 'GET',
            //jsonpCallback:undefined,
            dataType: 'jsonp',
            success: function (res) {
                if (res && (res.Code === 200 || res.Code === '200')) {
                    isFuntion(callback) && callback(res.Data);
                }
                else {
                    showLog(res.Msg || '操作错误.');
                }
            },
            error: function () {
                showLog('操作失败');
            }
        });
    };

    //获得pk信息
    var getPkInfo = function () {
        jsonpGetData(YmtApi.utils.addParam('http://jsapi.pk.ymatou.com/api/PKGame/GetPastPKGameDetail', {
            accessToken: authInfo.AccessToken,
            PKId: search.id || ''
        }), function (data) {
            data.hasLogin = YmtApi.utils.hasLogin();
            var html = ejs.render($('#pkInfo').html(), data);
            $('pkInfo').html(html);

            $('.pk-container').removeClass('pk-hide');
            $('#loading-fixed').remove();
        });
    };

    getPkInfo();

    $(document).on('click', '.J-open', function () {
        var $this = $(this);

        YmtApi.open({
            url: $this.attr('data-url'),
            isNew: true,
        });
    });


});
