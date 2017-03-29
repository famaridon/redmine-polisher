var issuesTable = $(".list.issues");
var redmineAPIKey = null;
var project = null;
var haveCategory = null;
var categories = new Set();

function rebuildIssuesTable(){

  // remove headers (some td are only used for data)
  $('.list.issues th[title=\'Trier par "Tracker"\']').remove();
  $('.list.issues th[title=\'Sort by "Tracker"\']').remove();
  $('.list.issues th[title=\'Sort by "Parent task"\']').remove();
  $('.list.issues th[title=\'Trier par "Tâche parente"\']').remove();

  haveCategory = $('.list.issues .issue .category').length > 0;
  if(haveCategory){
    $('.list.issues th[title=\'Trier par "Catégorie"\']').remove();
    $('.list.issues th[title=\'Sort by "Category"\']').remove();
  }

  $("tr.issue").each(function(index, value){
    var issue = $(value);
    rebuildIssue(issue);
  });

  deduplicateBugStories();
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


  // remove td are only used for data
  issue.find("td.parent").remove();
  issue.find("td.tracker").remove();


  var $subject = issue.find("td.subject a");
  async(function(){
    tooltips.setupTooltips($subject);
  });
  // append bugs if it's a [BUG-STORY] user story
  if($subject.text().startsWith("[BUG-STORY]")){
    issue.attr("data-redmine-polisher-bugstory","true");
    $.ajax({
      method: "GET",
      url: "https://projects.visiativ.com/issues.json?status_id=*&sort=priority:desc&parent_id="+issue.attr('data-tt-id'),
      headers: {
        'X-Redmine-API-Key': redmineAPIKey
      },
      success : function(data){
        data.issues.forEach(function(value) {

          var $issueTR = $("<tr></tr>");
          $issueTR.attr("id","issue-" + value.id);
          $issueTR.addClass("hascontextmenu issue")
            .addClass("tracker-"+value.tracker.id)
            .addClass("status-"+value.status.id)
            .addClass("priority-"+value.priority.id)
            .addClass("child")
            .addClass("odd")
            .attr("data-redmine-polisher-isajax","true");

          $issueTR.append('<td class="checkbox hide-when-print"><input type="checkbox" name="ids[]" value="'+value.id+'"></td>')
          $issueTR.append('<td class="id"><a href="/issues/'+value.id+'">'+value.id+'</a></td>');
          $issueTR.append('<td class="tracker">'+value.tracker.name+'</td>');
          $issueTR.append('<td class="subject"><a href="/issues/'+value.id+'">'+value.subject+'</a></td>');
          $issueTR.append('<td class="status">'+value.status.name+'</td>');
          $issueTR.append('<td class="priority">'+value.priority.name+'</td>');

          var $assigned_to = $('<td class="assigned_to"></td>');
          if(typeof value.assigned_to != 'undefined'){
            $assigned_to.append($('<a class="user active" href="/users/'+value.assigned_to.id+'">'+value.assigned_to.name+'</a>'));
          }
          $issueTR.append($assigned_to);
          $issueTR.append('<td class="done_ratio"><progress max="100" value="'+value.done_ratio+'"></progress></td>');
          $issueTR.append('<td class="parent"></td>');

          var $workload = $('<td class="cf_28 int">-</td>');
          if(typeof value.custom_fields != 'undefined'){
            var workload = $.grep(value.custom_fields, function(e){ return e.id == 28; })[0];
            if(typeof workload != 'undefined'){
              $workload.text(workload.value);
            }
          }
          $issueTR.append($workload);
          $issueTR.append('<td class="category">VDoc-Dev</td>');

          rebuildIssue($issueTR);
          $issueTR.attr("data-tt-id",value.id);
          $issueTR.attr("data-tt-parent-id",issue.attr('data-tt-id'));

          var ttnode = $(issuesTable).treetable("node", issue.attr('data-tt-id'));
          $(issuesTable).treetable("loadBranch", ttnode, $issueTR);

          tooltips.setupTooltips($issueTR.find(".subject a"));
        });
        $(issuesTable).treetable("collapseNode", issue.attr('data-tt-id'));

      }
    });
  }

}

// remove issues under a [BUG-STORY] not loaded by rebuildIssue ajax GET
function deduplicateBugStories(){
  $("tr[data-redmine-polisher-bugstory=\"true\"]").each(function(index,elem){
    $("tr[data-tt-parent-id='" + $(elem).data("tt-id") + "']:not([data-redmine-polisher-isajax='true'])").remove();
  });
}

function rebuildSubjects(){
  // set the subject width after all to get the max size.
  $("tr.issue").each(function(index, issue){
    rebuildSubject(index, issue);
  });
}

function rebuildSubject(index, issue){
  async(function(){
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
  })
}

function countWorkload(){
  //count all the "charges"
  var total = 0;
  if($("td.cf_28").length > 0){
    $("tr.tracker-36 td.cf_28").each(function(index,item){
      var val = parseFloat($(item).html());
      if(!isNaN(parseFloat(val)) && isFinite(val)){
        total += val;
      }
    });
    $('.list.issues th[title=\'Sort by "Charges (Pts)"\'] a').html(total + " pts");
    $('.list.issues th[title=\'Trier par "Charges (Pts)"\'] a').html(total + " pts");
  }

  if(haveCategory){ // count workload by category
    categories.forEach(function(element) {
      var categoryWorkload = 0;
      $('.issue[data-tt-parent-id="'+element+'"]').each(function(index, child) {
        $(child).find("td.cf_28").each(function(index,item){
          var val = parseFloat($(item).html());
          if(!isNaN(parseFloat(val)) && isFinite(val)){
            categoryWorkload += val;
          }
        });
      })
      $('tr[data-tt-id="'+element+'"] .subject').append($("<span class=\"badge\">"+categoryWorkload+" Pts</span>"));
    });
  }
}

function setupTreeTable(){
  // start tree table

  categories.forEach(function(element,index) {
    var lastChild = $("<tr data-tt-id=\""+element+"\" class=\"rp-category group\"><td class=\"checkbox\" ></td><td class=\"id\"></td><td class=\"subject\" colspan=\"10\">"+element+"</td></tr>").appendTo(issuesTable);
    lastChild.on("click",function(event){
      if(!$(event.target).hasClass("data-tt-expender")){
        $(this).find(".data-tt-expender").click();
      }
    });
    $('.issue[data-tt-parent-id="'+element+'"]').each(function(idx, child){
      var $child = $(child);
      lastChild.after($child);
      lastChild = $child;
    })
  });

  // reorder table for treetable
  issuesTable.find("tr").each(function(index, issue){
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

  categories.forEach(function(element,index) {
    issuesTable.treetable('expandNode', element);
  });

  var expandAllButton = $("<a class=\"icon icon-arrow-down expand-all-button\">Expand all</a>").css("cursor","pointer").on('click',expandIssues);
  $("#query_form_with_buttons p.buttons").append(expandAllButton);
  var collapseAllButton = $("<a class=\"icon icon-arrow-up collapse-all-button\">Collapse all</a>").css("cursor","pointer").on('click',collapseIssues);
  $("#query_form_with_buttons p.buttons").append(collapseAllButton);
}

function rebuildDoneRatio(issue){
  async(function(){
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
  });
}

function rebuildWorkload(issue){
  async(function(){
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
  });
}

function rebuildAssignedTo(issue){
  async(function(){
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
  var haveParent = typeof parent.attr('href') !== 'undefined';
  if(haveCategory && ( issue.hasClass("tracker-36") || !haveParent ) ) // if we display category and issue is "Use case"
  {
    // try to use categories
    var category = $(issue).find(".category").html();
    if(category !== ""){
      categories.add(category);
      issue.attr('data-tt-parent-id',category);
    }
  } else if(haveParent) {
    var parentId = /[^/]*$/.exec(parent.attr('href'))[0];
    issue.attr('data-tt-parent-id',parentId);
  }

  if(haveCategory){
    $(issue).find(".category").remove();
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
  getStorage({
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

    console.info( "Setup the tree table" );
    setupTreeTable();

    countWorkload();
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

function async(your_function, callback) {
    setTimeout(function() {
        your_function();
        if (callback) {callback();}
    }, 0);
}
