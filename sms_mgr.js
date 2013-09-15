
var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info(str); } : function(str){} ;

    
FM.smsMgr = (function(){
    var uInstance = null;
    
    var request = require("request");
    var md5 = require('MD5');
    
    var mobile_url = 'http://www.yoyo8.com.tw/SMSBridge.php';
    var memberID = 'gabrisl';
    var memberpassword = '53768608';

    
    function constructor(){
        
        return {
            
            /**
             *  Send message to mobile by yoyo8.com
             *  @param request {String} mobileNo
             *                 {String} smsMessage
             *                 ex: mobileNo:'0911123456'
             *                     smsMessage:'hello world'
             *                   
             *  @callback cb (error, result)
             *                if error return(err, null)
             *                else return(null, body)
             *                body 
             *                ex: "status=0&MemberID=gabrisl&MessageID=1372312810444768&UsedCredit=1&Credit=49&MobileNo=0911820138&retstr=Success"
             */
            sendMessageToMobile: function( mobileNo,smsMessage, cb){
                
              var sourceProdID = 'feltmeng';
              var sourceMsgID = Math.random()*10000;
              var password = md5(memberID+':'+memberpassword+':'+sourceProdID+':'+sourceMsgID);
              var charSet = 'B';
              
             /**
              *  request ex:
              *  http://www.yoyo8.com.tw/SMSBridge.php?MemberID=testabc&Password=
              *   9ac2571899e565e1afdc606f8bec7145&MobileNo=0987654321&CharSet=B&SMSMessage=%B1z%A6n,%C5w%AA
              *    %EF%A8%CF%A5%CEyoyo8&SourceProdID=TEST&SourceMsgID=10001
              */
                var path = "/?MemberID="+memberID
                +"&Password="+password
                +"&MobileNo="+mobileNo
                +"&SourceProdID="+sourceProdID
                +"&SourceMsgID="+sourceMsgID
                +"&CharSet="+charSet
                +"&SMSMessage="+smsMessage;
                
                request({
                    method: 'GET',
                    uri: mobile_url + path,
                    json: true,
                    
                }, function(error, response, body){
                    
                    if(error){
                        console.logger("[sendMessageToMobile:] ", error);
                        cb(error, null);
                        
                    }else if(body.error){
						cb(body.error, null);
					}else{
                        cb(null, body);
                    }
                });
            },
            
            
            /** TEST */
            _testkaiser: function(){
                var mobileNo = '0911820138';
                var smsMessage = '5678';

                this.sendMessageToMobile( mobileNo,smsMessage, function(err, result){
                    if(err)
                        console.log("err: " + JSON.stringify(err));
                    else
                        console.log("result: "+JSON.stringify(result));
                });
            },
        };//end return
    }
    
    return {
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            
            return uInstance;
        }
    };
})();

/* TEST */
//FM.smsMgr.getInstance()._testkaiser();

module.exports = FM.smsMgr.getInstance();