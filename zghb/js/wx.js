$(document).ready(function(){
	//自动按比例大小
	document.documentElement.style.fontSize = document.documentElement.clientWidth / 5.4 + 'px';
	//每当浏览器窗口大小发生变化
	$(window).resize(function() {
	  document.documentElement.style.fontSize = document.documentElement.clientWidth / 5.4 + 'px';
	});

	var userName = "";
    var userImg = "";
	if (location.search.indexOf("?") == 0 && location.search.indexOf("=") > 1) {
		$(".page1").css("display","block");
		var code = request("code");
		$.ajax({
			url: "https://wx1.yayi365.cn/ya/wx/codeToUserInfo", //请求的Url serviceurl + 
			type: "get", //提交方式
			dataType: "json", //请求的返回类型 这里为json	
			async: false,
			data: {"code": code},
			contentType: "application/json", //内容类型
			cache: false, //是否异步提交
			success: function(dt) {
				console.log("success: " + JSON.stringify(dt));
				if (dt.status == "success") {
					userName = dt.map.nickname;
					userImg = dt.map.headimgurl;

					var moneyValue = 0;
					$("#money-btn").click(function(){
						moneyValue =  $("#money").val();
					    if( moneyValue < 0 || moneyValue == 0 || moneyValue == ""){
					  	    alert("输入的金额必须大于0");
					    }else{
					    	moneyValue = (moneyValue*1).toFixed(2);
					    	//$("#money").val(moneyValue*1);
					    	location.href = "zghb.html?money="+moneyValue+"&username="+userName+"&userimg="+userImg;
					    }
					});
				} else {
					return;
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log("评论列表查询失败！");
				return;
			}
		});
	}else{
		location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx384850d6a13cd619&redirect_uri=https://wx.yayi365.cn/zghb/index.html&response_type=code&scope=snsapi_userinfo#wechat_redirect"; 
	}
});

var request = function(paramName) {
  let paramValue = "",
    isFound = !1;
  if (location.search.indexOf("?") == 0 && location.search.indexOf("=") > 1) {
    let arrSource = decodeURI(location.search).substring(1, location.search.length).split("&"),
      i = 0;
    while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
  }
  return paramValue == "" && (paramValue = null), paramValue
}

var btnSetash = function(btnID) {
    $("#" + btnID).attr("disabled", true);
    $("#" + btnID).css("background", "#c3c3c3");
    $("#" + btnID).css("border", "solid 1px #c3c3c3");
  }
  /* 按钮变回 */
var btnSetBack = function(btnID, bgcolor) {
  $("#" + btnID).attr("disabled", false);
  $("#" + btnID).css("background", "#0180F6");
  $("#" + btnID).css("border", "solid 1px #0180F6");
}
var fools_show=function(){
    $(".bg-cover").show();
    $(".tips-box").show();
};