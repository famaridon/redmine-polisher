var issuesTable = $(".list.issues");
var redmineAPIKey = null;
var project = null;

function rebuildIssuesTable(){

  // remove headers (some td are only used for data)
  $('.list.issues th[title=\'Trier par "Tracker"\']').remove();
  $('.list.issues th[title=\'Sort by "Tracker"\']').remove();
  $('.list.issues th[title=\'Sort by "Parent task"\']').remove();
  $('.list.issues th[title=\'Trier par "Tâche parente"\']').remove();

  $("tr.issue").each(function(index, value){
    var issue = $(value);
    rebuildIssue(issue);

    // remove td are only used for data
    issue.find("td.parent").remove();
    issue.find("td.tracker").remove();
  });
}

function rebuildIssue(issue){
  // set the issue id in data- for treetable
  issue.attr('data-tt-id', issue.attr('id').split('-')[1]);

  rebuildTracker(issue,issue.find("td.tracker"));

  rebuildPriority(issue.find("td.priority"));

  rebuildFixedVersion(issue.find("td.fixed_version"));

  buildParentLink(issue, issue.find("td.parent a"));

  rebuildWorkload(issue);
  rebuildDoneRatio(issue);
  rebuildAssignedTo(issue);

}

function rebuildSubjects(){
  // set the subject width after all to get the max size.
  $("tr.issue").each(function(index, issue){
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
}

function countWorkload(){
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
}

function setupTreeTable(){
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
}

function rebuildDoneRatio(issue){
  // rebuild with html progressbar
  var issueId = issue.data('tt-id');
  var $doneRatio = issue.find('td.done_ratio table');
  if($doneRatio.length == 0){
    return;
  }
  var css = $doneRatio.attr('class');
  var doneRatio = css.substring(css.indexOf("-")+1,css.length);

  issue.find("td.done_ratio").editable({
    type: 'range',
    value: doneRatio,
    title: 'Enter done %',
    tpl: '<input type="range" min="0" max="100" step="10" /><output></output>',
    display: function(value, sourceData) {
      $(this).html('<progress max="100" value="'+value+'"></progress>');
    },
    url: function(params) {
      var issueId = issue.data('tt-id');
      var deferred = $.ajax({
        method: "PUT",
        url: "https://projects.visiativ.com/issues/"+issueId+".json",
        headers: {
          'X-Redmine-API-Key': redmineAPIKey
        },
        contentType: "application/json; charset=utf-8",
        dataType: 'text',
        data: JSON.stringify({
          "issue": {
            "done_ratio": params.value
          }
        })
      });
      return deferred;
    }
  });
}

function rebuildWorkload(issue){
  issue.find("td.cf_28").editable({
    type: 'text',
    emptytext: '-',
    title: 'Enter workload in points',
    url: function(params) {
      var issueId = issue.data('tt-id');
      var deferred = $.ajax({
        method: "PUT",
        url: "https://projects.visiativ.com/issues/"+issueId+".json",
        headers: {
          'X-Redmine-API-Key': redmineAPIKey
        },
        contentType: "application/json; charset=utf-8",
        dataType: 'text',
        data: JSON.stringify({
          "issue": {
            "custom_fields": [
              {"id": 28, "value": params.value }
            ]
          }
        })
      });
      return deferred;
    }
  });
}

function rebuildAssignedTo(issue){
  var $assignedTo = issue.find("td.assigned_to");
  var $a = $assignedTo.find('a');

  var userid = null;
  var username = null;
  if(typeof ($a.attr('href')) != 'undefined')
  {
    userid = $($a.attr('href').split('/')).last();
    username = $a.html();
  }
  project.getMembers().done(function(members){
    $assignedTo.editable({
      type: 'select',
      value: userid,
      emptytext: '-',
      title: 'Assigned to',
      display: function(value, sourceData, response) {
        $(members).each(function(index, member){
          if(member.value == value)
          {
            $assignedTo.html(member.text);
            return false;
          }
        });

      },
      source: members,
      url: function(params) {
        var issueId = issue.data('tt-id');
        var deferred = $.ajax({
          method: "PUT",
          url: "https://projects.visiativ.com/issues/"+issueId+".json",
          headers: {
            'X-Redmine-API-Key': redmineAPIKey
          },
          contentType: "application/json; charset=utf-8",
          dataType: 'text',
          data: JSON.stringify({
            "issue": {
              "assigned_to_id":  params.value
            }
          })
        });
        return deferred;
      }
    });
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

function expandIssues(){
  issuesTable.treetable('expandAll');
}

function collapseIssues(){
  issuesTable.treetable('collapseAll');
}

$( document ).ready(function() {
  console.info( "Redmine tools started!" );
  chrome.storage.sync.get({
    redmineAPIKey: null
  }, function(configuration) {
    console.info( "Configuration loaded : " );
    console.debug( configuration );
    redmineAPIKey = configuration.redmineAPIKey;
    // get the base url
    if (!location.origin) {
      location.origin = location.protocol + "//" + location.host;
    }
    // get the project system name
    var projectName = window.location.href.split('/')[4];

    project = new Project(redmineAPIKey,location.origin, projectName);
    tooltips = new Tooltips(redmineAPIKey,location.origin);

    // setup all default plugin configuration
    $.fn.editableContainer.defaults.className = "tip-default";

    console.info( "Start rebuilding the DOM" );
    rebuildIssuesTable();
    rebuildSubjects();
    countWorkload();

    console.info( "Setup the tree table" );
    setupTreeTable();

    console.info( "Setup tooltips" );
    tooltips.setupTooltips();
  });
});


class Project {

  constructor(apiKey, url, project) {
    this.apiKey = apiKey;
    this.url = url;
    this.projectName = project;
    this.members = null;
    this.issueStatuses = null;
  }

  getMembers(){
    if(this.members == null) {
      var self = this;
      this.members = $.Deferred();
      $.ajax({
        method: "GET",
        url: this.url+"/projects/"+this.projectName+"/memberships.json",
        headers: {
          'X-Redmine-API-Key': this.apiKey
        },
        dataType: 'json'
      })
      .done(function(data){
        var membersArray = [];
        $(data.memberships).each(function(index, membership){
          membersArray.push({value:membership.user.id, text:membership.user.name});
        });
        self.members.resolve(membersArray);
      });
    }
    return this.members;
  }

}
