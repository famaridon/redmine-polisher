var issuesTable = $(".list.issues");

function rebuildIssue(issue){
  // set the issue id in data- for treetable
  issue.attr('data-tt-id', issue.attr('id').split('-')[1]);

  rebuildTracker(issue,issue.find("td.tracker"));

  rebuildPriority(issue.find("td.priority"));

  rebuildFixedVersion(issue.find("td.fixed_version"));

  buildParentLink(issue, issue.find("td.parent a"));

  rebuildWorkload(issue);
  rebuildDoneRatio(issue);
}

function rebuildDoneRatio(issue){
  // rebuild with html progressbar
  var issueId = issue.data('tt-id');
  var css = issue.find('table').attr('class');
  var doneRatio = css.substring(css.indexOf("-")+1,css.length);

  issue.find("td.done_ratio").editable({
    type: 'range',
    value: doneRatio,
    title: 'Enter done %',
    tpl: '<input type="range" min="0" max="100" step="10" /><output></output>',
    display: function(value, sourceData) {
      $(this).html('<progress max="100" value="'+value+'"></progress>');
    },
    success: function(response, newValue) {
      var issueId = issue.data('tt-id');
      callRedmineAPI(function(redmineAPIKey){
        $.ajax({
          method: "PUT",
          url: "https://projects.visiativ.com/issues/"+issueId+".json",
          headers: {
            'X-Redmine-API-Key': redmineAPIKey
          },
          contentType: "application/json; charset=utf-8",
          dataType: 'json',
          data: JSON.stringify({
            "issue": {
              "done_ratio": newValue
            }
          }),
          success : function(data){
            console.log(issueId+' workload updated to '+newValue );
          }
        });
      });
    }
  });
}

function rebuildWorkload(issue){
  issue.find("td.cf_28").editable({
    type: 'number',
    emptytext: '-',
    title: 'Enter workload in points',
    success: function(response, newValue) {
      var issueId = issue.data('tt-id');
      callRedmineAPI(function(redmineAPIKey){
        $.ajax({
          method: "PUT",
          url: "https://projects.visiativ.com/issues/"+issueId+".json",
          headers: {
            'X-Redmine-API-Key': redmineAPIKey
          },
          contentType: "application/json; charset=utf-8",
          dataType: 'json',
          data: JSON.stringify({
            "issue": {
              "custom_fields": [
                {"id": 28, "value": newValue }
              ]
            }
          }),
          success : function(data){
            console.log(issueId+' workload updated to '+newValue );
          }
        });
      });
    }
  });
}

function rebuildTracker(issue,tracker){
  var html = tracker.html();
  var simpleTrackerHtml = html.substring("R&amp;D INNOVATION - ".length, html.length);
  simpleTrackerHtml = simpleTrackerHtml.toLowerCase().replace(new RegExp(' ', 'g'),'-')
  issue.find("td.subject").prepend($('<span class="icon icon-'+simpleTrackerHtml+'"></span>'))
}

function rebuildPriority(priority){
  var originalPriority = priority.html();
  var priorityIcon = originalPriority.toLowerCase().replace("é","e");
  priority.html('<span title="' + originalPriority + '" class="icon icon-'+priorityIcon+'"></span>');
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
  }
}

/**
*
**/
function callRedmineAPI(callback){
  chrome.storage.sync.get({
    redmineAPIKey: null
  }, function(items) {
    callback(items.redmineAPIKey);
  });
}

function expandIssues(){
  issuesTable.treetable('expandAll');
}

function collapseIssues(){
  issuesTable.treetable('collapseAll');
}

$( document ).ready(function() {
  console.log( "Redmine tools started" );

  $.fn.editableContainer.defaults.className = "tip-default";

  // rebuild all DOM
  $('.list.issues th[title=\'Trier par "Tracker"\']').remove();
  $('.list.issues th[title=\'Sort by "Tracker"\']').remove();

  $('.list.issues th[title=\'Sort by "Parent task"\']').remove();
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
    $(subject).find("a").css("max-width", initialWidth - 75).css({
      'display':'inline-block',
      'white-space':'nowrap',
      'overflow':'hidden',
      'text-overflow':'ellipsis'
    });
    if($(issue).hasClass("child") && !$("#issue-" + $(issue).attr("data-tt-parent-id")).length){
      if($(issue).find("td.subject .icon").hasClass("icon-user-story")){
        $(issue).addClass("isolated-parent");
      }
      else{
        $(issue).addClass("isolated-child");
      }
    }
  });

  //count all the "charges"
  var total = 0;
  if($("td.cf_28").length > 0){
    $("td.cf_28").each(function(index,item){
      var val = parseFloat($(item).html());
      if(!isNaN(parseFloat(val)) && isFinite(val)){
        total += val;
      }
    });
    $('.list.issues th[title=\'Sort by "Charges (Pts)"\'] a').html(total + " pts");
    $('.list.issues th[title=\'Trier par "Charges (Pts)"\'] a').html(total + " pts");
  }

  // start tree table

  // reorder table for treetable
  $("tr.issue").each(function(index, issue){
    var id = $(issue).attr('data-tt-id');
    var lastChild = $(issue);
    $('.issue[data-tt-parent-id="'+id+'"]').each(function(index, child){
      var $child = $(child);
      lastChild.after($child);
      lastChild = $child;
    })
  });

  var subjectColumn = issuesTable.find("tr.issue:first td.subject").index();
  subjectColumn = subjectColumn === -1 ? 1 : subjectColumn;
  var issuesTreetable = issuesTable.treetable({
    'column': subjectColumn,
    'expandable': true,
    'expanderTemplate':'<span class="data-tt-expender  icon icon-arrow-right"></span>'
  });

  var expandAllButton = $("<a class=\"icon icon-arrow-down expand-all-button\">Expand all</a>").css("cursor","pointer").on('click',expandIssues);
  $("#query_form_with_buttons p.buttons").append(expandAllButton);
  var collapseAllButton = $("<a class=\"icon icon-arrow-up collapse-all-button\">Collapse all</a>").css("cursor","pointer").on('click',collapseIssues);
  $("#query_form_with_buttons p.buttons").append(collapseAllButton);

  // start tooltipster
  $(".subject a").tooltipster({
    content: 'Loading...',
    contentAsHTML: true,
    animation: 'fade',
    updateAnimation: 'fade',
    theme: 'tooltipster-light',
    delay: 500,
    maxWidth: 800,
    functionBefore: function(instance, helper){

      var $origin = $(helper.origin);
      callRedmineAPI(function(redmineAPIKey){
        if(redmineAPIKey != null && redmineAPIKey !== "")
        {

          var issueId = $origin.closest("tr.issue").attr('data-tt-id');
          $.ajax({
            method: "GET",
            url: "https://projects.visiativ.com/issues/"+issueId+".json",
            headers: {
              'X-Redmine-API-Key': redmineAPIKey
            },
            success : function(data){
              var trackerName;
              switch(data.issue.tracker.name){
                case "R&D INNOVATION - Task":
                trackerName = "Task - ";
                break;
                case "R&D INNOVATION - User story":
                trackerName = "User story - ";
                break;
                case "R&D INNOVATION - Defect":
                trackerName = "Defect - ";
                break;
                case "R&D INNOVATION - Requirement":
                trackerName = "Requirement - ";
                break;
                case "R&D INNOVATION - Improvement":
                trackerName = "Improvement - ";
                break;
                default :
                trackerName = "";
              }
              var title =$('<h3>' + trackerName + data.issue.subject + '</h3>');
              var description =$('<dt>Description</dt><dd class="description" >'+textile.parse(data.issue.description)+'</dd>');

              var dom = $('<div></div>').addClass('tooltip-content').append(title).append($('<dl class="dl-horizontal"></dl>').append( description ));
              instance.content(dom);
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
