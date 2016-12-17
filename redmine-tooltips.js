
class Tooltips{

  constructor(apiKey, url, project) {
    this.apiKey = apiKey;
    this.url = url;
  }

  setupTooltips(){
    var self = this;
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
        var issueId = $origin.closest("tr.issue").attr('data-tt-id');
        $.ajax({
          method: "GET",
          url: self.url +"/issues/"+issueId+".json",
          headers: {
            'X-Redmine-API-Key': self.apiKey
          },
          success : function(data){
            var trackerName = "";
            if(data.issue.tracker.name.startsWith("R&D INNOVATION - "))
            {
              trackerName = data.issue.tracker.name.substring("R&D INNOVATION - ".length,data.issue.tracker.name.length);
            }
            var title =$('<h3>' + trackerName + ' - ' + data.issue.subject + '</h3>');
            var description =$('<dt>Description</dt><dd class="description" >'+textile.parse(data.issue.description)+'</dd>');

            var dom = $('<div></div>').addClass('tooltip-content').append(title).append($('<dl class="dl-horizontal"></dl>').append( description ));
            instance.content(dom);
          }
        });

      }
    });
  }

}
