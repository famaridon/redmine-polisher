$( document ).ready(function() {
  console.info( "Redmine tools started!" );

  // build better title
  var subject = new Subject($("div.subject"));

  subject.$subject.html(subject.toBreadcrumbs());

  // build support link
  var ticketId = $('div.cf_1 > div.value').html();
  var ticketLink = $('div.cf_3 > div.value').html();
  $('div.cf_3 > div.value').html('<a href="' + ticketLink + '">' + ticketId + '</a>');
  $('div.cf_1').hide();

});

class Subject{
  constructor($subject) {
    this.$subject = $subject;
    this.title = this.$subject.find("div h3").text();

    var $parent = this.$subject.find("div p");
    if($parent.length > 0){
      this.parent =  new SubjectParent($parent);
    } else {
      this.parent = null;
    }
  }

  toBreadcrumbs(){
    var breadcrumbs = $('<ol class="breadcrumb"></ol>');
    if(this.parent != null){
      breadcrumbs.append('<li><a title="'+this.parent.parentId+'" href="'+this.parent.parentUrl+'">'+this.parent.parentTitle+'</a></li>');
    }
    breadcrumbs.append('<li>'+this.title+'</li>');
    return breadcrumbs;
  }

}

class SubjectParent{
  constructor($parent) {
    this.$parent = $parent;
    var $parentA =   this.$parent.find("a.issue");
    this.parentUrl = $parentA.attr("href");
    this.parentId = $parentA.html().substring($parentA.html().indexOf("#")+1, $parentA.html().length);
    this.parentTitle = $parentA[0].nextSibling.nodeValue;
    this.parentTitle = this.parentTitle.substring(2, this.parentTitle.length);
  }
}
/*
<div class="subject">
  <div>
    <p>
      <a class="issue tracker-36 status-1 priority-3 priority-lowest parent created-by-me assigned-to-me" href="/issues/21460">R&amp;D INNOVATION - User story #21460</a> : Plugin Redmine
    </p>
    <div>
      <h3>Rendre le champ "Ticket support" cliquable</h3>
    </div>
  </div>
</div>
*/
