chrome.storage.sync.get({
  perPage: 250
}, function (configuration) {

  const perPage = configuration.perPage;
  browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    if ( details.method == "GET" && details.url.indexOf("per_page=") <= 0) {
      var redirectUrl = details.url;
      if (redirectUrl.indexOf("?") <= 0) {
        redirectUrl += "?";
      } else {
        redirectUrl += "&";
      }
      return { redirectUrl: `${redirectUrl}per_page=${perPage}` };
    }
  },
  {urls: ["https://projects.visiativ.com/*/issues*"]},
  ["blocking"]);
});