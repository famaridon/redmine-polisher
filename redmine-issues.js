var issuesTable = $(".list.issues");

function rebuildIssue(issue){
  // set the issue id in data- for treetable
  issue.attr('data-tt-id', issue.attr('id').split('-')[1])

  rebuildTracker(issue,issue.find("td.tracker"));

  rebuildPriority(issue.find("td.priority"));

  rebuildFixedVersion(issue.find("td.fixed_version"));

  buildParentLink(issue, issue.find("td.parent a"));

}

function rebuildTracker(issue,tracker){
  var html = tracker.html();
  var simpleTrackerHtml = html.substring("R&amp;D INNOVATION - ".length, html.length);
  simpleTrackerHtml = simpleTrackerHtml.toLowerCase().replace(new RegExp(' ', 'g'),'-')
  issue.find("td.subject").prepend($('<span class="icon icon-'+simpleTrackerHtml+'"></span>'))
}

function rebuildPriority(priority){
  var priorityIcon = priority.html().toLowerCase().replace("é","e");
  priority.html('<span class="icon icon-'+priorityIcon+'"></span>');
}

function rebuildFixedVersion(version){
  var html = version.find("a").html();
  if(typeof(html) != 'undefined' && html.startsWith("Moovapps Process - ")){
    var simpleVersionHtml = html.substring("Moovapps Process - ".length, html.length);
    version.find("a").html(simpleVersionHtml);
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

  // rebuild all DOM
  $('.list.issues th[title=\'Trier par "Tracker"\']').remove();
  $('.list.issues th[title=\'Trier par "Tâche parente"\']').remove();

  $("tr.issue").each(function(index, value){
    var issue = $(value);
    rebuildIssue(issue);
    issue.find("td.parent").remove();
    issue.find("td.tracker").remove();
  });


  $("tr.issue").each(function(index, issue){
    // set the subject width after all to get the max size.
    var subject = $(issue).find("td.subject");
    var initialWidth = subject.width();
    $(subject).find("a").width(initialWidth - 65).css({
      'display':'inline-block',
      'white-space':'nowrap',
      'overflow':'hidden',
      'text-overflow':'ellipsis'
    });
    if($(issue).hasClass("child") && !$("#issue-" + $(issue).attr("data-tt-parent-id")).length){
      $(issue).addClass("isolated-child");
    }
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
  $(".subject").tooltipster({
    content: 'Loading...',
    contentAsHTML: true,
    animation: 'fade',
    updateAnimation: 'fade',
    theme: 'tooltipster-light',
    delay: 500,
    maxWidth: 800,
    functionBefore: function(instance, helper){

      var $origin = $(helper.origin);

      chrome.storage.sync.get({
        redmineAPIKey: null
      }, function(items) {
        if(items.redmineAPIKey != null && items.redmineAPIKey !== "" && $origin.data('loaded') !== true)
        {

          var issueId = $origin.parent().data('tt-id');
          $.ajax({
            method: "GET",
            url: "https://projects.visiativ.com/issues/"+issueId+".json",
            headers: {
              'X-Redmine-API-Key': items.redmineAPIKey
            },
            success : function(data){


              var title =$('<h3>'+data.issue.subject+'</h3>');
              var description =$('<dt>Description</dt><dd><pre>'+textile.parse(data.issue.description)+'</pre></dd>');

              var dom = $('<div></div>').addClass('tooltip-content').append(title).append($('<dl class="dl-horizontal"></dl>').append( description ));
              instance.content(dom);
              // to remember that the data has been loaded
              $origin.data('loaded', true);
            }
          });
        }
        else{
          instance.content($("<span class=\"error-message\">Please add your redmine API key</span>"));
        }
      });
    }
  });

});
