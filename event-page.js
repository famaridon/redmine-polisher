chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
  if (request.event == "loadAngular"){
    loadAngular(request, sender, sendResponse);
  }
});

function loadAngular(request, sender, sendResponse){
  let files = [
    "inline.bundle.js",
    "polyfills.bundle.js",
    "styles.bundle.js",
    "vendor.bundle.js",
    "main.bundle.js"
  ];

  files.forEach(function(file){
    let filePath = `/angular/polisher/dist/${file}`;
    console.log(`file ${filePath} loaded.`);
    chrome.tabs.executeScript({ file: filePath});
  });
  sendResponse({status: "success"})
}
