MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    if($("#issue_status_id").val() === "24" || $("#issue_status_id").val() === "6"){ // A valider
      console.info( "Auto update donne ratio" );
      $("#issue_done_ratio").val("100");
    } else if($("#issue_status_id").val() === "9" ){ // Réouvert
      console.info( "Auto update donne ratio" );
      $("#issue_done_ratio").val("0");
    }
});

observer.observe(document.getElementById("all_attributes"), {
  subtree: true,
  attributes: true
});

$( document ).ready(function() {
  console.info( "Redmine tools started!" );

  // build better title
  var subject = new Subject($("div.subject"));

  subject.$subject.html(subject.toBreadcrumbs());

  $(".cf_29.attribute").appendTo($(".issue .attributes"));
  var input = $("#issue_custom_field_values_29").closest("div[class^=\"splitcontent\"]");
  input.removeClass("splitcontentright");
  input.removeClass("splitcontentleft");
  input.appendTo($("#update .attributes"));
  input.find("textarea").attr("rows",10);

  // build support link
  var ticketId = $('div.cf_1 > div.value').html();
  var ticketLink = $('div.cf_3 > div.value').html();
  $('div.cf_3 > div.value').html('<a href="' + ticketLink + '">' + ticketId + '</a>');
  $('div.cf_1').hide();
  $(".list.issues tr.issue").each(function(index,item){
    var link = $(item).find("td.subject a");
    link.append(link[0].nextSibling.nodeValue);
     $(item).find("td.subject").html(link);
  });
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

    tooltips = new Tooltips(redmineAPIKey,location.origin);

    $("tr.issue").each(function(index, value){
      var issue = $(value);
      issue.attr('data-tt-id', issue.find("a.issue").attr('href').split('/')[2]);
      tooltips.setupTooltips(issue.find(".subject a"));
    });
  });
});

class Subject{
  constructor($subject) {
    this.$subject = $subject;
    this.title = this.$subject.find("div h3").text();

    var $parents = this.$subject.find("div p");
    if($parents.length > 0){
      this.parents =  new SubjectParent($parents);
    } else {
      this.parents = null;
    }
  }

  toBreadcrumbs(){
    var breadcrumbs = $('<ol class="breadcrumb"></ol>');
    if(this.parents != null){
        $.each( this.parents.$parents, function( index, parent ){
          breadcrumbs.append('<li><a title="'+parent.parentId+'" href="'+parent.parentUrl+'">'+parent.parentTitle+'</a></li>');
        });
      }
    breadcrumbs.append('<li>'+this.title+'</li>');
    return breadcrumbs;
  }

}

class SubjectParent{
  constructor($parents) {
    this.$parents = $parents;
    var self = this;
    $.each( this.$parents, function( index, $parent ){
      var $parentA =   $($parent).find("a.issue");
      $(self.$parents)[index].parentUrl = $parentA.attr("href");
      $(self.$parents)[index].parentId = $parentA.html().substring($parentA.html().indexOf("#")+1, $parentA.html().length);
      $(self.$parents)[index].parentTitle = $parentA[0].nextSibling.nodeValue;
      $(self.$parents)[index].parentTitle = this.parentTitle.substring(2, this.parentTitle.length);
    });
  }
}
