$( document ).ready(function() {
  console.log( "Redmine tools started" );
  console.log( "Projects" );

  $("#projects-index").jstree().bind("select_node.jstree", function (e, data) {
    window.location.href = $(data.event.currentTarget).find("a").attr("href");
  });


});
