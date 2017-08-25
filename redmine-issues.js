console.info( "Redmine polisher started!" );
document.addEventListener("DOMContentLoaded", function(event) {

  // append angular start point
  let main = document.getElementById("main");
  main.appendChild(document.createElement('app-root'))

  // extract redmine context
  window.Redmine = {};
  let content = document.getElementById("content");
  window.Redmine.content = content;
  content.style.display = "none";
  let sidebar = document.getElementById("sidebar");
  sidebar.style.display = "none";
  window.Redmine.sidebar = sidebar;


  chrome.runtime.sendMessage({event: "loadAngular"}, function(response) {
    console.log(`Angular load event ${JSON.stringify(response)}`);
  });

});
