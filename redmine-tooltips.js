
class Tooltips{

  constructor(apiKey, url, project) {
    this.apiKey = apiKey;
    this.url = url;
  }

  setupTooltips($element){
    var self = this;
    // start tooltipster
    $element.tooltipster({
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

            var dom = $('<div></div>').addClass('tooltip-content').append(title);

            var $workload = $('<dt>Charges (Pts)</dt><dd class="description" >-</dd>');
            if(typeof data.issue.custom_fields != 'undefined'){
              var workload = $.grep(data.issue.custom_fields, function(e){ return e.id == 28; })[0];
              if(typeof workload != 'undefined'){
                $workload = $('<dt>'+workload.name+'</dt><dd class="description" >'+workload.value+'</dd>');
              }
            }
            dom.append($('<dl class="dl-horizontal"></dl>').append($workload));

            dom.append($('<dl></dl>').append( description ));
            instance.content(dom);
          }
        });

      }
    });
  }

}
