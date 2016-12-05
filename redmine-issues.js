var issuesTable = $(".list.issues");

function rebuildIssue(issue){
  // set the issue id in data- for treetable
  issue.attr('data-tt-id', issue.attr('id').split('-')[1])

  rebuildTracker(issue.find("td.tracker"));

  rebuildPriority(issue.find("td.priority"));

  rebuildFixedVersion(issue.find("td.fixed_version"));

  buildParentLink(issue, issue.find("td.parent a"));

}

function rebuildTracker(tracker){
  var html = tracker.html();
  var simpleTarckerHtml = html.substring("R&amp;D INNOVATION - ".length, html.length);
  simpleTarckerHtml = simpleTarckerHtml.toLowerCase().replace(new RegExp(' ', 'g'),'-')
  tracker.html('<span class="icon icon-'+simpleTarckerHtml+'"></span>');
}

function rebuildPriority(priority){
  var priorityIcon = priority.html().toLowerCase();
  priority.html('<span class="icon icon-'+priorityIcon+'"></span>');
}

function rebuildFixedVersion(version){
  if(version.length){
    var html = version.find("a").html();
    if(html.startsWith("Moovapps Process - ")){
      var simpleVersionHtml = html.substring("Moovapps Process - ".length, html.length);
      version.find("a").html(simpleVersionHtml);
    }
  }
}

function buildParentLink(issue, parent){
  if(typeof parent.attr('href') !== 'undefined')
  {
    var parentId = /[^/]*$/.exec(parent.attr('href'))[0];
    issue.attr('data-tt-parent-id',parentId);
    $('#issue-'+parentId).after(issue);
  }
}

function expandIssues(){
  issuesTable.treetable('expandAll');
}

function collapseIssues(){
  issuesTable.treetable('collapseAll');
}

$( document ).ready(function() {
  console.log( "Redmine tools started" );
  console.log( "Issues" );

  // rebuild all DOM
  $('.list.issues th[title=\'Trier par "Tâche parente"\']').remove();

  $("tr.issue").each(function(index, value){
    var issue = $(value);
    rebuildIssue(issue);
    issue.find("td.parent").remove();
  });

  // set the subject width after all to get the max size.
  $("tr.issue td.subject").each(function(index, item){
    //sadness
    var initialWidth = $(item).width();
    $(item).find("a").width(initialWidth - 25).css({
      'display':'inline-block',
      'white-space':'nowrap',
      'overflow':'hidden',
      'text-overflow':'ellipsis'
    });
  });

  // start tree table
  var subjectColumn = issuesTable.find("tr.issue:first td.subject").index();
  subjectColumn = subjectColumn === -1 ? 1 : subjectColumn;
  var issuesTreetable = issuesTable.treetable({
    'column': subjectColumn,
    'expandable': true,
    'initialState' : 'expanded',
    'expanderTemplate':'<span class="data-tt-expender  icon icon-arrow-right"></span>'
  });

  var expandAllButton = $("<a class=\"icon icon-arrow-down expand-all-button\">Expand all</a>").css("cursor","pointer").on('click',expandIssues);
  $("#query_form_with_buttons p.buttons").append(expandAllButton);
  var collapseAllButton = $("<a class=\"icon icon-arrow-up collapse-all-button\">Collapse all</a>").css("cursor","pointer").on('click',collapseIssues);
  $("#query_form_with_buttons p.buttons").append(collapseAllButton);


  // start tooltipster
  /*  $('.subject').tooltipster({
  content: 'Loading...',
  contentAsHTML: true,
  interactive: true,
  theme: 'tooltipster-shadow',
  trigger: 'click',
  functionBefore: function(instance, helper){
  var $origin = $(helper.origin);

  // we set a variable so the data is only loaded once via Ajax, not every time the tooltip opens
  if ($origin.data('loaded') !== true) {

  $.get($origin.find("a").attr('href'), function(data) {

  var issueDetails = $.parseHTML(data);

  // call the 'content' method to update the content of our tooltip with the returned data.
  // note: this content update will trigger an update animation (see the updateAnimation option)
  instance.content($(issueDetails).find("#content"));

  // to remember that the data has been loaded
  $origin.data('loaded', true);
});
}
}
});
*/
});
