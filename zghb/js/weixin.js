$(document).ready(function(){
	var sig = "";
	var timestamp = "";
	var getsignatureNew = function(url) {
        $.ajax({
			url: "https://wx1.yayi365.cn/ya/wx/getTicketSignature",
			type: "get", //提交方式
			dataType: "json", //请求的返回类型 这里为json	
			async: false,
			data: {"url": url},
			contentType: "application/json", //内容类型
			cache: false, //是否异步提交
			success: function(dt) {
				console.log("success: " + JSON.stringify(dt));
				if (dt.status == "success") {
					sig = dt.map.signature;
					timestamp = dt.map.timestamp;
				} else {
					return;
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log("评论列表查询失败！");
				return;
			}
		});
    }

	getsignatureNew(window.location.href);

	wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: 'wx384850d6a13cd619', // 必填，公众号的唯一标识
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonceStr: 'yigukeji', // 必填，生成签名的随机串
        signature: sig, // 必填，签名，见附录1
        jsApiList: [
            'checkJsApi',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'onMenuShareQZone',
            'hideMenuItems',
            'showMenuItems',
            'hideAllNonBaseMenuItem',
            'showAllNonBaseMenuItem',
            'translateVoice',
            'startRecord',
            'stopRecord',
            'onVoiceRecordEnd',
            'playVoice',
            'onVoicePlayEnd',
            'pauseVoice',
            'stopVoice',
            'uploadVoice',
            'downloadVoice',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'getNetworkType',
            'openLocation',
            'getLocation',
            'hideOptionMenu',
            'showOptionMenu',
            'closeWindow',
            'scanQRCode',
            'chooseWXPay',
            'openProductSpecificView',
            'addCard',
            'chooseCard',
            'openCard'
        ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });
    wx.ready(function() {
        var title = '恭喜发财 大吉大利';
	    var desc = '测试关键字';
	    var imgUrl = 'https://wx.yayi365.cn/zghb/images/logo.png';//hongbao_icon.jpg

        wx.onMenuShareTimeline({
            title: title, // 分享标题
            desc: desc, //分享描述
            imgUrl: imgUrl, // 分享图标
            success: function() {
                // 用户确认分享后执行的回调函数
            },
            cancel: function() {
                // 用户取消分享后执行的回调函数
            }
        });
        wx.onMenuShareAppMessage({
            title: title, // 分享标题
            desc: desc, // 分享描述
            imgUrl: imgUrl, // 分享图标
            success: function() {
                // 用户确认分享后执行的回调函数
            },
            cancel: function() {
                // 用户取消分享后执行的回调函数
            }
        });
   	})
});