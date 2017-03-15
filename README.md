# WX-ShareConfig  
微信web配置及分享      
微信分享api：http://mp.weixin.qq.com/wiki/4/9ac2e7b1f1d22e9e57260f6553822520.html    

# 微信第三方页面配置

## 第一步：用户同意授权，获取code         

在确保微信公众账号拥有授权作用域（scope参数）的权限的前提下（服务号获得高级接口后，默认拥有scope参数中的snsapi_base和snsapi_userinfo），引导关注者打开如下页面：       
https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect       
若提示“该链接无法访问”，请检查参数是否填写错误，是否拥有scope参数对应的授权作用域权限。        
尤其注意：由于授权操作安全等级较高，所以在发起授权请求时，微信会对授权链接做正则强匹配校验，如果链接的参数顺序不对，授权页面将无法正常访问       

参考链接(请在微信客户端中打开此链接体验)       
Scope为snsapi_base       
https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx520c15f417810387&redirect_uri=https%3A%2F%2Fchong.qq.com%2Fphp%2Findex.php%3Fd%3D%26c%3DwxAdapter%26m%3DmobileDeal%26showwxpaytitle%3D1%26vb2ctag%3D4_2030_5_1194_60&response_type=code&scope=snsapi_base&state=123#wechat_redirect     
Scope为snsapi_userinfo     
https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf0e81c3bee622d60&redirect_uri=http%3A%2F%2Fnba.bluewebgame.com%2Foauth_response.php&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect     
尤其注意：跳转回调redirect_uri，应当使用https链接来确保授权code的安全性。    

参数说明      

	参数             	 是否必须           说明                      
	appid		     是		    公众号的唯一标识            
	redirect_uri	     是		    授权后重定向的回调链接地址，请使用urlencode对链接进行处理            
	response_type	     是		    返回类型，请填写code             
	scope		     是		    应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且，即使在未关注的情况下，只要用户授权，也能获取其信息）              
	state		     否		    重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节          
	'#wechat_redirect    是	 	    无论直接打开还是做页面302重定向时候，必须带此参数           

用户同意授权后     

如果用户同意授权，页面将跳转至 redirect_uri/?code=CODE&state=STATE。若用户禁止授权，则重定向后不会带上code参数，仅会带上state参数redirect_uri?state=STATE    

code说明 ：     
code作为换取access_token的票据，每次用户授权带上的code将不一样，code只能使用一次，5分钟未被使用自动过期。    
    
## 第二步：通过code换取网页授权access_token

首先请注意，这里通过code换取的是一个特殊的网页授权access_token,与基础支持中的access_token（该access_token用于调用其他接口）不同。公众号可通过下述接口来获取网页授权access_token。如果网页授权的作用域为snsapi_base，则本步骤中获取到网页授权access_token的同时，也获取到了openid，snsapi_base式的网页授权流程即到此为止。     

尤其注意：由于公众号的secret和获取到的access_token安全级别都非常高，必须只保存在服务器，不允许传给客户端。后续刷新access_token、通过access_token获取用户信息等步骤，也必须从服务器发起。     

请求方法     

获取code后，请求以下链接获取access_token：      
https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code     
参数说明      

	参数	是否必须		说明
	appid	    是		    公众号的唯一标识
	secret	    是		    公众号的appsecret
	code	    是	  	    填写第一步获取的code参数
	grant_type  是		    填写为authorization_code
返回说明

正确时返回的JSON数据包如下：    

	{
  	 "access_token":"ACCESS_TOKEN",
   	"expires_in":7200,
   	"refresh_token":"REFRESH_TOKEN",
   	"openid":"OPENID",
   	"scope":"SCOPE"
	}    
	参数		描述
	access_token	 网页授权接口调用凭证,注意：此access_token与基础支持的access_token不同
	expires_in	 access_token接口调用凭证超时时间，单位（秒）
	refresh_token	 用户刷新access_token
	openid		 用户唯一标识，请注意，在未关注公众号时，用户访问公众号的网页，也会产生一个用户和公众号唯一的OpenID
	scope		 用户授权的作用域，使用逗号（,）分隔

错误时微信会返回JSON数据包如下（示例为Code无效错误）:     

	{"errcode":40029,"errmsg":"invalid code"}     
全局返回码说明   

## 第三步：刷新access_token（如果需要）   

由于access_token拥有较短的有效期，当access_token超时后，可以使用refresh_token进行刷新，refresh_token拥有较长的有效期（7天、30天、60天、90天），当refresh_token失效的后，需要用户重新授权。    
 
请求方法    

获取第二步的refresh_token后，请求以下链接获取access_token：     
https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=APPID&grant_type=refresh_token&refresh_token=REFRESH_TOKEN<br />

	参数		是否必须		说明
	appid		    是		    公众号的唯一标识
	grant_type	    是		    填写为refresh_token
	refresh_token	    是	    	    填写通过access_token获取到的refresh_token参数
	返回说明

正确时返回的JSON数据包如下：    

	{
   	"access_token":"ACCESS_TOKEN",
   	"expires_in":7200,
   	"refresh_token":"REFRESH_TOKEN",
   	"openid":"OPENID",
   	"scope":"SCOPE"
	}
	
	参数		描述
	access_token	  网页授权接口调用凭证,注意：此access_token与基础支持的access_token不同
	expires_in	  access_token接口调用凭证超时时间，单位（秒）
	refresh_token	  用户刷新access_token
	openid		  用户唯一标识
	scope	 	  用户授权的作用域，使用逗号（,）分隔

错误时微信会返回JSON数据包如下（示例为Code无效错误）:    

	{"errcode":40029,"errmsg":"invalid code"}   
全局返回码说明   

## 第四步：拉取用户信息(需scope为 snsapi_userinfo)    

如果网页授权作用域为snsapi_userinfo，则此时开发者可以通过access_token和openid拉取用户信息了。   

请求方法   

http：GET（请使用https协议）   
https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN   
参数说明   

	参数		描述
	access_token	  网页授权接口调用凭证,注意：此access_token与基础支持的access_token不同
	openid	  	  用户的唯一标识
	lang		  返回国家地区语言版本，zh_CN 简体，zh_TW 繁体，en 英语
返回说明

正确时返回的JSON数据包如下：   

	{
   	"openid":" OPENID",
   	" nickname": NICKNAME,
   	"sex":"1",
   	"province":"PROVINCE"
   	"city":"CITY",
   	"country":"COUNTRY",
    	"headimgurl":    "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46", 
	"privilege":[
	"PRIVILEGE1"
	"PRIVILEGE2"
    ],
    "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
	}   
	参数		描述
	openid	 	  用户的唯一标识
	nickname	  用户昵称
	sex		  用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
	province	  用户个人资料填写的省份
	city		  普通用户个人资料填写的城市
	country		  国家，如中国为CN
	headimgurl	  用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空。若用户		     更换头像，原有头像URL将失效。
	privilege	  用户特权信息，json 数组，如微信沃卡用户为（chinaunicom）
	unionid		 只有在用户将公众号绑定到微信开放平台帐号后，才会出现该字段。详见：获取用户个人信息（UnionID机制）

错误时微信会返回JSON数据包如下（示例为openid无效）:    

	{"errcode":40003,"errmsg":" invalid openid "}   
全局返回码说明   

## 附：检验授权凭证（access_token）是否有效    

请求方法    

http：GET（请使用https协议）   
https://api.weixin.qq.com/sns/auth?access_token=ACCESS_TOKEN&openid=OPENID   
参数说明   

	参数		描述
	access_token	  网页授权接口调用凭证,注意：此access_token与基础支持的access_token不同
	openid		  用户的唯一标识
返回说明   

正确的Json返回结果：     

	{ "errcode":0,"errmsg":"ok"}    
	
错误时的Json返回示例：   

	{ "errcode":40003,"errmsg":"invalid openid"}


# 微信分享配置
概述<br />
微信JS-SDK是微信公众平台面向网页开发者提供的基于微信内的网页开发工具包。<br />
通过使用微信JS-SDK，网页开发者可借助微信高效地使用拍照、选图、语音、位置等手机系统的能力，同时可以直接使用微信分享、扫一扫、卡券、支付等微信特有的能力，为微信用户提供更优质的网页体验。<br />
此文档面向网页开发者介绍微信JS-SDK如何使用及相关注意事项。<br />

## JSSDK使用步骤<br />

### 步骤一：绑定域名<br />

先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。如果你使用了支付类接口，请确保支付目录在该安全域名下，否则将无法完成支付。<br />
备注：登录后可在“开发者中心”查看对应的接口权限。<br />

### 步骤二：引入JS文件<br />

在需要调用JS接口的页面引入如下JS文件，（支持https）：http://res.wx.qq.com/open/js/jweixin-1.0.0.js<br />
请注意，如果你的页面启用了https，务必引入 https://res.wx.qq.com/open/js/jweixin-1.0.0.js ，否则将无法在iOS9.0以上系统中成功使用JSSDK<br />
如需使用摇一摇周边功能，请引入 jweixin-1.1.0.js<br />
备注：支持使用 AMD/CMD 标准模块加载方法加载<br />

### 步骤三：通过config接口注入权限验证配置<br />

所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用（同一个url仅需调用一次，对于变化url的SPA的web app可在每次url变化时进行调用,目前Android微信客户端不支持pushState的H5新特性，所以使用pushState来实现web app的页面会导致签名失败，此问题会在Android6.2中修复）。<br />


	wx.config({
    	debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    	appId: '', // 必填，公众号的唯一标识
    	timestamp: , // 必填，生成签名的时间戳
    	nonceStr: '', // 必填，生成签名的随机串
    	signature: '',// 必填，签名，见附录1
    	jsApiList: [] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	});
	
	
### 步骤四：通过ready接口处理成功验证<br />

	wx.ready(function(){

    	// config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
	});


### 步骤五：通过error接口处理失败验证<br />

	wx.error(function(res){

    	// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。

	});
接口调用说明<br />

所有接口通过wx对象(也可使用jWeixin对象)来调用，参数是一个对象，除了每个接口本身需要传的参数之外，还有以下通用参数：<br />

	success：接口调用成功时执行的回调函数。
	fail：接口调用失败时执行的回调函数。
	complete：接口调用完成时执行的回调函数，无论成功或失败都会执行。
	cancel：用户点击取消时的回调函数，仅部分有用户取消操作的api才会用到。
	trigger: 监听Menu中的按钮点击时触发的方法，该方法仅支持Menu中的相关接口。
	
备注：不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回。<br />


以上几个函数都带有一个参数，类型为对象，其中除了每个接口本身返回的数据之外，还有一个通用属性errMsg，其值格式如下：<br />

	调用成功时："xxx:ok" ，其中xxx为调用的接口名
	用户取消时："xxx:cancel"，其中xxx为调用的接口名
	调用失败时：其值为具体错误信息
	基础接口

#### 判断当前客户端版本是否支持指定JS接口

	wx.checkJsApi({
    	jsApiList: ['chooseImage'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
    	success: function(res) {
        	// 以键值对的形式返回，可用的api值true，不可用为false
        	// 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
    	}
	});
备注：checkJsApi接口是客户端6.0.2新引入的一个预留接口，第一期开放的接口均可不使用checkJsApi来检测。<br />

#### 分享接口<br />

请注意不要有诱导分享等违规行为，对于诱导分享行为将永久回收公众号接口权限，详细规则请查看：朋友圈管理常见问题 。<br />
获取“分享到朋友圈”按钮点击状态及自定义分享内容接口<br />

	wx.onMenuShareTimeline({
    	title: '', // 分享标题
    	link: '', // 分享链接
    	imgUrl: '', // 分享图标
    	success: function () { 
        	// 用户确认分享后执行的回调函数
    	},
   	 cancel: function () { 
        	// 用户取消分享后执行的回调函数
   	 }
	});
	
##### 获取“分享给朋友”按钮点击状态及自定义分享内容接口<br />

	wx.onMenuShareAppMessage({
    	title: '', // 分享标题
    	desc: '', // 分享描述
    	link: '', // 分享链接
    	imgUrl: '', // 分享图标
    	type: '', // 分享类型,music、video或link，不填默认为link
    	dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
    	success: function () { 
        	// 用户确认分享后执行的回调函数
    	},
    	cancel: function () { 
        	// 用户取消分享后执行的回调函数
    	}
	});

###### 获取“分享到QQ”按钮点击状态及自定义分享内容接口<br />

	wx.onMenuShareQQ({
    	title: '', // 分享标题
    	desc: '', // 分享描述
    	link: '', // 分享链接
    	imgUrl: '', // 分享图标
    	success: function () { 
       	// 用户确认分享后执行的回调函数
    	},
    	cancel: function () { 
       	// 用户取消分享后执行的回调函数
    	}
	});

###### 获取“分享到腾讯微博”按钮点击状态及自定义分享内容接口<br />

	wx.onMenuShareWeibo({
    	title: '', // 分享标题
    	desc: '', // 分享描述
    	link: '', // 分享链接
    	imgUrl: '', // 分享图标
    	success: function () { 
       	// 用户确认分享后执行的回调函数
    	},
    	cancel: function () { 
        	// 用户取消分享后执行的回调函数
    	}
	});

###### 获取“分享到QQ空间”按钮点击状态及自定义分享内容接口<br />

	wx.onMenuShareQZone({
    	title: '', // 分享标题
    	desc: '', // 分享描述
    	link: '', // 分享链接
    	imgUrl: '', // 分享图标
    	success: function () { 
       	// 用户确认分享后执行的回调函数
    	},
    	cancel: function () { 
        	// 用户取消分享后执行的回调函数
    	}
	});

###### 图像接口<br />

拍照或从手机相册中选图接口<br />

	wx.chooseImage({
    	count: 1, // 默认9
    	sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    	sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    	success: function (res) {
        	var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
    	}
	});
###### 预览图片接口<br />

	wx.previewImage({
	current: '', // 当前显示图片的http链接
    	urls: [] // 需要预览的图片http链接列表
	});
	
###### 上传图片接口<br />

	wx.uploadImage({
    	localId: '', // 需要上传的图片的本地ID，由chooseImage接口获得
    	isShowProgressTips: 1, // 默认为1，显示进度提示
    	success: function (res) {
        	var serverId = res.serverId; // 返回图片的服务器端ID
    	}
	});
备注：上传图片有效期3天，可用微信多媒体接口下载图片到自己的服务器，此处获得的 serverId 即 media_id，参考文档<br /> ../12/58bfcfabbd501c7cd77c19bd9cfa8354.html 目前多媒体文件下载接口的频率限制为10000次/天，如需要调高频率，请邮件weixin-open@qq.com,邮件主题为【申请多媒体接口调用量】，请对你的项目进行简单描述，附上产品体验链接，并对用户量和使用量进行说明。<br />

###### 下载图片接口<br />

	wx.downloadImage({
    	serverId: '', // 需要下载的图片的服务器端ID，由uploadImage接口获得
    	isShowProgressTips: 1, // 默认为1，显示进度提示
    	success: function (res) {
        	var localId = res.localId; // 返回图片下载后的本地ID
    	}
	});
##### 音频接口<br />

##### 开始录音接口<br />
	wx.startRecord();
	
##### 停止录音接口<br />
	wx.stopRecord({
    	success: function (res) {
        	var localId = res.localId;
    	}
	});
	
##### 监听录音自动停止接口<br />
	wx.onVoiceRecordEnd({
    	// 录音时间超过一分钟没有停止的时候会执行 complete 回调
    	complete: function (res) {
        	var localId = res.localId; 
    	}
	});
	
###### 播放语音接口<br />
	wx.playVoice({
    	localId: '' // 需要播放的音频的本地ID，由stopRecord接口获得
	});

##### 暂停播放接口<br />
	wx.pauseVoice({
    	localId: '' // 需要暂停的音频的本地ID，由stopRecord接口获得
	});
	
##### 停止播放接口<br />
	wx.stopVoice({
    	localId: '' // 需要停止的音频的本地ID，由stopRecord接口获得
	});

##### 监听语音播放完毕接口<br />
	wx.onVoicePlayEnd({
    	success: function (res) {
        	var localId = res.localId; // 返回音频的本地ID
    	}
	});

##### 上传语音接口<br />
	wx.uploadVoice({
    	localId: '', // 需要上传的音频的本地ID，由stopRecord接口获得
    	isShowProgressTips: 1, // 默认为1，显示进度提示
        	success: function (res) {
        	var serverId = res.serverId; // 返回音频的服务器端ID
    	}
	});
	
备注：上传语音有效期3天，可用微信多媒体接口下载语音到自己的服务器，此处获得的 serverId 即 media_id，参考文档<br /> ../12/58bfcfabbd501c7cd77c19bd9cfa8354.html 目前多媒体文件下载接口的频率限制为10000次/天，如需要调高频率，请邮件weixin-open@qq.com,邮件主题为【申请多媒体接口调用量】，请对你的项目进行简单描述，附上产品体验链接，并对用户量和使用量进行说明。<br />

##### 下载语音接口<br />
	wx.downloadVoice({
    	serverId: '', // 需要下载的音频的服务器端ID，由uploadVoice接口获得
    	isShowProgressTips: 1, // 默认为1，显示进度提示
    	success: function (res) {
        	var localId = res.localId; // 返回音频的本地ID
    	}
	});

#### 智能接口<br />

##### 识别音频并返回识别结果接口<br />

	wx.translateVoice({
   	localId: '', // 需要识别的音频的本地Id，由录音相关接口获得
    	isShowProgressTips: 1, // 默认为1，显示进度提示
    	success: function (res) {
        	alert(res.translateResult); // 语音识别的结果
    	}
	});
	
##### 设备信息<br />

###### 获取网络状态接口<br />

	wx.getNetworkType({
    	success: function (res) {
        	var networkType = res.networkType; // 返回网络类型2g，3g，4g，wifi
    	}
	});

##### 地理位置<br />

使用微信内置地图查看位置接口<br />

	wx.openLocation({
    	latitude: 0, // 纬度，浮点数，范围为90 ~ -90
    	longitude: 0, // 经度，浮点数，范围为180 ~ -180。
    	name: '', // 位置名
    	address: '', // 地址详情说明
    	scale: 1, // 地图缩放级别,整形值,范围从1~28。默认为最大
    	infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
	});
	
获取地理位置接口<br />

	wx.getLocation({
    	type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
    	success: function (res) {
        	var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
        	var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
        	var speed = res.speed; // 速度，以米/每秒计
        	var accuracy = res.accuracy; // 位置精度
    	}
	});


#### 摇一摇周边<br /><br />

开启查找周边ibeacon设备接口<br />

	wx.startSearchBeacons({
		ticket:"",  //摇周边的业务ticket, 系统自动添加在摇出来的页面链接后面
		complete:function(argv){
			//开启查找完成后的回调函数
		}
	});
备注：如需接入摇一摇周边功能，请参考：申请开通摇一摇周边<br />

关闭查找周边ibeacon设备接口<br />

	wx.stopSearchBeacons({
		complete:function(res){
			//关闭查找完成后的回调函数
		}
	});
	
监听周边ibeacon设备接口<br />

	wx.onSearchBeacons({
		complete:function(argv){
			//回调函数，可以数组形式取得该商家注册的在周边的相关设备列表
		}
	});
备注：上述摇一摇周边接口使用注意事项及更多返回结果说明，请参考：摇一摇周边获取设备信息<br />


界面操作<br />

隐藏右上角菜单接口<br />

	wx.hideOptionMenu();
	
显示右上角菜单接口<br />

	wx.showOptionMenu();
	
关闭当前网页窗口接口<br />

	wx.closeWindow();
	
批量隐藏功能按钮接口<br />

	wx.hideMenuItems({
    	menuList: [] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
	});
	
批量显示功能按钮接口<br />

	wx.showMenuItems({
    	menuList: [] // 要显示的菜单项，所有menu项见附录3
	});
	
隐藏所有非基础按钮接口<br />

	wx.hideAllNonBaseMenuItem();
	
// “基本类”按钮详见附录3<br />
显示所有功能按钮接口<br />

	wx.showAllNonBaseMenuItem();
	
##### 微信扫一扫<br />

调起微信扫一扫接口<br />

	wx.scanQRCode({
    	needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
    	scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
    	success: function (res) {
    	var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
	}
	});
微信小店<br />

跳转微信商品页接口<br />

	wx.openProductSpecificView({
    	productId: '', // 商品id
    	viewType: '' // 0.默认值，普通商品详情页1.扫一扫商品详情页2.小店商品详情页
	});

微信卡券<br />

微信卡券接口中使用的签名凭证api_ticket，与步骤三中config使用的签名凭证jsapi_ticket不同，开发者在调用微信卡券JS-SDK的过程中需依次完成两次不同的签名，并确保凭证的缓存。<br />

获取api_ticket<br />

api_ticket 是用于调用微信卡券JS API的临时票据，有效期为7200 秒，通过access_token 来获取。<br />

开发者注意事项：<br />

1.此用于卡券接口签名的api_ticket与步骤三中通过config接口注入权限验证配置使用的jsapi_ticket不同。<br />

2.由于获取api_ticket 的api 调用次数非常有限，频繁刷新api_ticket 会导致api调用受限，影响自身业务，开发者需在自己的服务存储与更新api_ticket。<br />

接口调用请求说明<br />

http请求方式: GET
https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=wx_card
参数说明<br />

	参数	是否必须	说明
	access_token	是	调用接口凭证
	返回数据

数据示例：<br />

 	{
	"errcode":0,
	"errmsg":"ok",
	"ticket":"bxLdikRXVbTPdHSM05e5u5sUoXNKdvsdshFKA",
	"expires_in":7200
	}
	参数名	描述
	errcode	错误码
	errmsg	错误信息
	ticket	api_ticket，卡券接口中签名所需凭证
	expires_in	有效时间
	
拉取适用卡券列表并获取用户选择信息<br />

	wx.chooseCard({
    	shopId: '', // 门店Id
    	cardType: '', // 卡券类型
    	cardId: '', // 卡券Id
    	timestamp: 0, // 卡券签名时间戳
    	nonceStr: '', // 卡券签名随机串
    	signType: '', // 签名方式，默认'SHA1'
    	cardSign: '', // 卡券签名
    	success: function (res) {
        	var cardList= res.cardList; // 用户选中的卡券列表信息
    	}
	});
	参数名	必填	类型	示例值	描述
	shopId	否	string(24)	1234	门店ID。shopID用于筛选出拉起带有指定location_list(shopID)的卡券列表，非必填。
	cardType	否	string(24)	GROUPON	卡券类型，用于拉起指定卡券类型的卡券列表。当cardType为空时，默认拉起所有卡券的列表，非必填。
	cardId	否	string(32)	p1Pj9jr90_SQRaVqYI239Ka1erk	卡券ID，用于拉起指定cardId的卡券列表，当cardId为空时，默认拉起所有卡券的列表，非必填。
	timestamp	是	string(32)	14300000000	时间戳。
	nonceStr	是	string(32)	sduhi123	随机字符串。
	signType	是	string(32)	SHA1	签名方式，目前仅支持SHA1
	cardSign	是	string(64)	abcsdijcous123	签名。
	cardSign详见附录4。开发者特别注意：签名错误会导致拉取卡券列表异常为空，请仔细检查参与签名的参数有效性。

特别提醒<br />

拉取列表仅与用户本地卡券有关，拉起列表异常为空的情况通常有三种：签名错误、时间戳无效、筛选机制有误。请开发者依次排查定位原因。<br />

批量添加卡券接口<br />

	wx.addCard({
    	cardList: [{
        	cardId: '',
        	cardExt: ''
    	}], // 需要添加的卡券列表
    	success: function (res) {
        	var cardList = res.cardList; // 添加的卡券列表信息
    	}
	});
cardExt详见附录4，值得注意的是，这里的card_ext参数必须与参与签名的参数一致，格式为字符串而不是Object，否则会报签名错误。<br />

查看微信卡包中的卡券接口<br />

	wx.openCard({
    	cardList: [{
        	cardId: '',
        	code: ''
    	}]// 需要打开的卡券列表
	});
	
核销后再次赠送卡券接口<br />

	wx.consumeAndShareCard({
    	cardId: '',
    	code: ''
	});
	
参数说明：<br />

	参数	说明
	cardId	上一步核销的card_id，若传入错误的card_id会报错
	code	上一步核销的code，若传入错误的code会报错
	
注意：<br />

该接口只支持微信6.3.6以上版本的客户端，开发者在调用时需要注意两点：<br />

1.需要引入1.1.0版本的js文件： https://res.wx.qq.com/open/js/jweixin-1.1.0.js<br />

2.需要判断用户客户端版本号，做出容错处理，详情点击：判断当前客户端版本是否支持指定JS接口<br />

微信支付<br />

发起一个微信支付请求<br />

	wx.chooseWXPay({
    	timestamp: 0, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
    	nonceStr: '', // 支付签名随机串，不长于 32 位
    	package: '', // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
    	signType: '', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
    	paySign: '', // 支付签名
    	success: function (res) {
        	// 支付成功后的回调函数
    	}
	});
备注：prepay_id 通过微信支付统一下单接口拿到，paySign 采用统一的微信支付 Sign 签名生成方法，注意这里 appId 也要参与签名，appId 与 config 中传入的 appId 一致，即最后参与签名的参数有appId, timeStamp, nonceStr, package, signType。<br />

请注意该接口只能在你配置的支付目录下调用，同时需确保支付目录在JS接口安全域名下。<br />

微信支付开发文档：https://pay.weixin.qq.com/wiki/doc/api/index.html<br />

附录1-JS-SDK使用权限签名算法<br />

jsapi_ticket<br />

生成签名之前必须先了解一下jsapi_ticket，jsapi_ticket是公众号用于调用微信JS接口的临时票据。正常情况下，jsapi_ticket的有效期为7200秒，通过access_token来获取。由于获取jsapi_ticket的api调用次数非常有限，频繁刷新jsapi_ticket会导致api调用受限，影响自身业务，开发者必须在自己的服务全局缓存jsapi_ticket 。<br />

参考以下文档获取access_token（有效期7200秒，开发者必须在自己的服务全局缓存access_token）：../15/54ce45d8d30b6bf6758f68d2e95bc627.html
用第一步拿到的access_token 采用http GET方式请求获得jsapi_ticket（有效期7200秒，开发者必须在自己的服务全局缓存jsapi_ticket）：https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi
成功返回如下JSON：<br />

	{
	"errcode":0,
	"errmsg":"ok",
	"ticket":"bxLdikRXVbTPdHSM05e5u5sUoXNKd8-41ZO3MhKoyN5OfkWITDGgnr2fwJ0m9E8NYzWKVZvdVtaUgWvsdshFKA",
	"expires_in":7200
	}
	
获得jsapi_ticket之后，就可以生成JS-SDK权限验证的签名了。<br />


签名算法<br />

签名生成规则如下：参与签名的字段包括noncestr（随机字符串）, 有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分） 。对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1。这里需要注意的是所有参数名均为小写字符。对string1作sha1加密，字段名和字段值都采用原始值，不进行URL 转义。<br />


即signature=sha1(string1)。 示例：<br />

noncestr=Wm3WZYTPz0wzccnW
jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg
timestamp=1414587457
url=http://mp.weixin.qq.com?params=value

##### 步骤1. 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1：

jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg&noncestr=Wm3WZYTPz0wzccnW&timestamp=1414587457&url=http://mp.weixin.qq.com?params=value<br />

###### 步骤2. 对string1进行sha1签名，得到signature：

0f9de62fce790f9a083d5c99e95740ceb90c27ed<br />
注意事项<br />

签名用的noncestr和timestamp必须与wx.config中的nonceStr和timestamp相同。<br />
签名用的url必须是调用JS接口页面的完整URL。<br />
出于安全考虑，开发者必须在服务器端实现签名的逻辑。<br />

如出现invalid signature 等错误详见附录5常见错误及解决办法。<br />

附录2-所有JS接口列表<br />

版本1.0.0接口<br />

	onMenuShareTimeline
	onMenuShareAppMessage
	onMenuShareQQ
	onMenuShareWeibo
	onMenuShareQZone
	startRecord
	stopRecord
	onVoiceRecordEnd
	playVoice
	pauseVoice
	stopVoice
	onVoicePlayEnd
	uploadVoice
	downloadVoice
	chooseImage
	previewImage
	uploadImage
	downloadImage
	translateVoice
	getNetworkType
	openLocation
	getLocation
	hideOptionMenu
	showOptionMenu
	hideMenuItems
	showMenuItems
	hideAllNonBaseMenuItem
	showAllNonBaseMenuItem
	closeWindow
	scanQRCode
	chooseWXPay
	openProductSpecificView
	addCard
	chooseCard
	openCard
	
附录3-所有菜单项列表<br />

基本类<br />

	举报: "menuItem:exposeArticle"
	调整字体: "menuItem:setFont"
	日间模式: "menuItem:dayMode"
	夜间模式: "menuItem:nightMode"
	刷新: "menuItem:refresh"
	查看公众号（已添加）: "menuItem:profile"
	查看公众号（未添加）: "menuItem:addContact"
	传播类

	发送给朋友: "menuItem:share:appMessage"
	分享到朋友圈: "menuItem:share:timeline"
	分享到QQ: "menuItem:share:qq"
	分享到Weibo: "menuItem:share:weiboApp"
	收藏: "menuItem:favorite"
	分享到FB: "menuItem:share:facebook"
	分享到 QQ 空间/menuItem:share:QZone
	
保护类<br />

	编辑标签: "menuItem:editTag"
	删除: "menuItem:delete"
	复制链接: "menuItem:copyUrl"
	原网页: "menuItem:originPage"
	阅读模式: "menuItem:readMode"
	在QQ浏览器中打开: "menuItem:openWithQQBrowser"
	在Safari中打开: "menuItem:openWithSafari"
	邮件: "menuItem:share:email"
	一些特殊公众号: "menuItem:share:brand"
	附录4-卡券扩展字段及签名生成算法

JSSDK使用者请读这里，JSAPI用户可以跳过<br />

卡券签名和JSSDK的签名完全独立，两者的算法和意义完全不同，请不要混淆。JSSDK的签名是使用所有JS接口都需要走的一层鉴权，用以标识调用者的身份，和卡券本身并无关系。其次，卡券的签名考虑到协议的扩展性和简单的防数据擅改，设计了一套独立的签名协议。另外由于历史原因，卡券的JS接口先于JSSDK出现，当时的JSAPI并没有鉴权体系，所以在卡券的签名里也加上了appsecret/api_ticket这些身份信息，希望开发者理解。


卡券 api_ticket

卡券 api_ticket 是用于调用卡券相关接口的临时票据，有效期为 7200 秒，通过 access_token 来获取。这里要注意与 jsapi_ticket 区分开来。由于获取卡券 api_ticket 的 api 调用次数非常有限，频繁刷新卡券 api_ticket 会导致 api 调用受限，影响自身业务，开发者必须在自己的服务全局缓存卡券 api_ticket 。

参考以下文档获取access_token（有效期7200秒，开发者必须在自己的服务全局缓存access_token）：../15/54ce45d8d30b6bf6758f68d2e95bc627.html
用第一步拿到的access_token 采用http GET方式请求获得卡券 api_ticket（有效期7200秒，开发者必须在自己的服务全局缓存卡券 api_ticket）：https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=wx_card

卡券扩展字段cardExt说明

cardExt本身是一个JSON字符串，是商户为该张卡券分配的唯一性信息，包含以下字段：

	字段	是否必填	说明
	code	否	指定的卡券code码，只能被领一次。use_custom_code字段为true的卡券必须填写，非自定义code不必填写。
	openid	否	指定领取者的openid，只有该用户能领取。bind_openid字段为true的卡券必须填写，bind_openid字段为false不必填写。
	timestamp	是	时间戳，商户生成从1970年1月1日00:00:00至今的秒数,即当前的时间,且最终需要转换为字符串形式;由商户生成后传入,不同添加请求的时间戳须动态生成，若重复将会导致领取失败！。
	nonce_str	否	随机字符串，由开发者设置传入，加强签名的安全性。随机字符串，不长于32位。推荐使用大小写字母和数字，不同添加请求的nonce须动态生成，若重复将会导致领取失败！。
	signature	是	签名，商户将接口列表中的参数按照指定方式进行签名,签名方式使用SHA1,具体签名方案参见下文;由商户按照规范签名后传入。
	outer_id	否	领取场景值，用于领取渠道的数据统计，默认值为0，字段类型为整型，长度限制为60位数字。用户领取卡券后触发的事件推送中会带上此自定义场景值，不参与签名。
	
签名说明

将 api_ticket、timestamp、card_id、code、openid、nonce_str的value值进行字符串的字典序排序。<br />
将所有参数字符串拼接成一个字符串进行sha1加密，得到signature。<br />
signature中的timestamp，nonce字段和card_ext中的timestamp，nonce_str字段必须保持一致。<br />
code=jonyqin_1434008071，timestamp=1404896688，card_id=pjZ8Yt1XGILfi-FUsewpnnolGgZk， api_ticket=ojZ8YtyVyr30HheH3CM73y7h4jJE ，nonce_str=jonyqin 则signature=sha1(1404896688jonyqinjonyqin_1434008071ojZ8YtyVyr30HheH3CM73y7h4jJE pjZ8Yt1XGILfi-FUsewpnnolGgZk)=6b81fbf6af16e856334153b39737556063c82689。<br />
强烈建议开发者使用卡券资料包中的签名工具SDK进行签名或使用debug工具进行校验：http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=cardsign<br />

卡券签名cardSign说明

将 api_ticket、app_id、location_id、timestamp、nonce_str、card_id、card_type的value值进行字符串的字典序排序。<br />
将所有参数字符串拼接成一个字符串进行sha1加密，得到cardSign。<br />

附录5-常见错误及解决方法

调用config 接口的时候传入参数 debug: true 可以开启debug模式，页面会alert出错误信息。以下为常见错误及解决方法：

invalid url domain当前页面所在域名与使用的appid没有绑定，请确认正确填写绑定的域名，如果使用了端口号，则配置的绑定域名也要加上端口号（一个appid可以绑定三个有效域名，见 目录1.1.1）。
invalid signature签名错误。建议按如下顺序检查：
确认签名算法正确，可用 http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=jsapisign 页面工具进行校验。
确认config中nonceStr（js中驼峰标准大写S）, timestamp与用以签名中的对应noncestr, timestamp一致。
确认url是页面完整的url(请在当前页面alert(location.href.split('#')[0])确认)，包括'http(s)://'部分，以及'？'后面的GET参数部分,但不包括'#'hash后面的部分。
确认 config 中的 appid 与用来获取 jsapi_ticket 的 appid 一致。
确保一定缓存access_token和jsapi_ticket。
确保你获取用来签名的url是动态获取的，动态页面可参见实例代码中php的实现方式。如果是html的静态页面在前端通过ajax将url传到后台签名，前端需要用js获取当前页面除去'#'hash部分的链接（可用location.href.split('#')[0]获取,而且需要encodeURIComponent），因为页面一旦分享，微信客户端会在你的链接末尾加入其它参数，如果不是动态获取当前链接，将导致分享后的页面签名失败。
the permission value is offline verifying这个错误是因为config没有正确执行，或者是调用的JSAPI没有传入config的jsApiList参数中。建议按如下顺序检查：
确认config正确通过。
如果是在页面加载好时就调用了JSAPI，则必须写在wx.ready的回调中。
确认config的jsApiList参数包含了这个JSAPI。
permission denied该公众号没有权限使用这个JSAPI，或者是调用的JSAPI没有传入config的jsApiList参数中（部分接口需要认证之后才能使用）。
function not exist当前客户端版本不支持该接口，请升级到新版体验。
为什么6.0.1版本config:ok，但是6.0.2版本之后不ok（因为6.0.2版本之前没有做权限验证，所以config都是ok，但这并不意味着你config中的签名是OK的，请在6.0.2检验是否生成正确的签名以保证config在高版本中也ok。）
在iOS和Android都无法分享（请确认公众号已经认证，只有认证的公众号才具有分享相关接口权限，如果确实已经认证，则要检查监听接口是否在wx.ready回调函数中触发）
服务上线之后无法获取jsapi_ticket，自己测试时没问题。（因为access_token和jsapi_ticket必须要在自己的服务器缓存，否则上线后会触发频率限制。请确保一定对token和ticket做缓存以减少2次服务器请求，不仅可以避免触发频率限制，还加快你们自己的服务速度。目前为了方便测试提供了1w的获取量，超过阀值后，服务将不再可用，请确保在服务上线前一定全局缓存access_token和jsapi_ticket，两者有效期均为7200秒，否则一旦上线触发频率限制，服务将不再可用）。
uploadImage怎么传多图（目前只支持一次上传一张，多张图片需等前一张图片上传之后再调用该接口）
没法对本地选择的图片进行预览（chooseImage接口本身就支持预览，不需要额外支持）
通过a链接(例如先通过微信授权登录)跳转到b链接，invalid signature签名失败（后台生成签名的链接为使用jssdk的当前链接，也就是跳转后的b链接，请不要用微信登录的授权链接进行签名计算，后台签名的url一定是使用jssdk的当前页面的完整url除去'#'部分）
出现config:fail错误（这是由于传入的config参数不全导致，请确保传入正确的appId、timestamp、nonceStr、signature和需要使用的jsApiList）
如何把jsapi上传到微信的多媒体资源下载到自己的服务器（请参见文档中uploadVoice和uploadImage接口的备注说明）
Android通过jssdk上传到微信服务器，第三方再从微信下载到自己的服务器，会出现杂音（微信团队已经修复此问题，目前后台已优化上线）
绑定父级域名，是否其子域名也是可用的（是的，合法的子域名在绑定父域名之后是完全支持的）
在iOS微信6.1版本中，分享的图片外链不显示，只能显示公众号页面内链的图片或者微信服务器的图片，已在6.2中修复
是否需要对低版本自己做兼容（jssdk都是兼容低版本的，不需要第三方自己额外做更多工作，但有的接口是6.0.2新引入的，只有新版才可调用）
该公众号支付签名无效，无法发起该笔交易（请确保你使用的jweixin.js是官方线上版本，不仅可以减少用户流量，还有可能对某些bug进行修复，拷贝到第三方服务器中使用，官方将不对其出现的任何问题提供保障，具体支付签名算法可参考 JSSDK微信支付一栏）
目前Android微信客户端不支持pushState的H5新特性，所以使用pushState来实现web app的页面会导致签名失败，此问题已在Android6.2中修复
uploadImage在chooseImage的回调中有时候Android会不执行，Android6.2会解决此问题，若需支持低版本可以把调用uploadImage放在setTimeout中延迟100ms解决
require subscribe错误说明你没有订阅该测试号，该错误仅测试号会出现
getLocation返回的坐标在openLocation有偏差，因为getLocation返回的是gps坐标，openLocation打开的腾讯地图为火星坐标，需要第三方自己做转换，6.2版本开始已经支持直接获取火星坐标
查看公众号（未添加）: "menuItem:addContact"不显示，目前仅有从公众号传播出去的链接才能显示，来源必须是公众号
ICP备案数据同步有一天延迟，所以请在第二日绑定
附录6-DEMO页面和示例代码
