console.info( "Redmine polisher started!" );
document.addEventListener("DOMContentLoaded", function(event) {

  let content = document.getElementById("content");
  content.appendChild(document.createElement('app-root'))

  chrome.runtime.sendMessage({event: "loadAngular"}, function(response) {
    console.log(JSON.stringify(response));
  });

});
