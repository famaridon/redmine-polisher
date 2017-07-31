console.info( "Redmine polisher started!" );
document.addEventListener("DOMContentLoaded", function(event) {

  let main = document.getElementById("main");
  main.appendChild(document.createElement('app-root'))

  let content = document.getElementById("content");
  content.style.display = "none";
  let sidebar = document.getElementById("sidebar");
  sidebar.style.display = "none";


  chrome.runtime.sendMessage({event: "loadAngular"}, function(response) {
    console.log(JSON.stringify(response));
  });

});
