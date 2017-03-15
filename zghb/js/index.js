$(document).ready(function(){
	//自动按比例大小
	document.documentElement.style.fontSize = document.documentElement.clientWidth / 5.4 + 'px';
	//每当浏览器窗口大小发生变化
	$(window).resize(function() {
	  document.documentElement.style.fontSize = document.documentElement.clientWidth / 5.4 + 'px';
	});

	var userName = request("username");
	var userImg = request("userimg");
	var money = request("money");

	if( money.split(".")[1][1] == 0){
		if( money.split(".")[1][0] == 0){
			money = money.split(".")[0];
		}else{
			money = money.split(".")[0]+"."+money.split(".")[1][0];
		}
	}

	$(".userimg").attr("src",userImg);
	$(".username").text(userName);
	$(".money-number").text(money);
	
    $(".hot-click").click(function(){
        $(".first-box").hide();
        $(".second-box").show();
        //var t=setTimeout('fools_show()',1750); 
    });
    $(".second-box").click(fools_show);
});

var request = function(paramName) {
  var paramValue = "",
    isFound = !1;
  if (location.search.indexOf("?") == 0 && location.search.indexOf("=") > 1) {
    var arrSource = decodeURI(location.search).substring(1, location.search.length).split("&"),
      i = 0;
    while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
  }
  return paramValue == "" && (paramValue = null), paramValue
}

var fools_show = function(){
	$(".bg-cover").show();
	$(".tips-box").show();
};