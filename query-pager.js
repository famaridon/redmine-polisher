chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if( details.url.indexOf("per_page=") <= 0 ){
      var redirectUrl = details.url;
      if(redirectUrl.indexOf("?") <= 0){
        redirectUrl += "?";
      } else {
        redirectUrl += "&";
      }
      return {redirectUrl: redirectUrl+"per_page=500" };
    }
  },
  {urls: ["https://projects.visiativ.com/*/issues*"]},
  ["blocking"]);
