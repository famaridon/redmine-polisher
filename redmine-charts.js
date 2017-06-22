var timeFormat = 'MM/DD/YYYY HH:mm';

$( document ).ready(function() {
  console.log( "Redmine tools started" );
  console.log( "Charts" );
  init();
});

async function getConfiguration() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      redmineAPIKey: null,
      enableInlineEdit: true,
      defaultState: "categories"
    }, (configuration) => {
      resolve(configuration);
    });
  });

}

async function init(){
  let configuration = await getConfiguration();
  $("#content").empty();
  initCurrentIteration(configuration);
  initNextIteration(configuration);
}

async function initCurrentIteration(configuration){
  $("#content").append(`<div id="current-it" class="iteration" ><h3>Current iteration</h3></div>`);
  $("#current-it").append(`<canvas id="burndown"></canvas>`);

  var ctx = document.getElementById("burndown");

  // current iteration
  let redmine_data_Deferred = $.ajax({
    url: "https://redminecharts.famaridon.com/api/charts/current/burndown",
  });

  let current_version_Deferred = $.ajax({
    url: "https://redminecharts.famaridon.com/api/charts/current",
  });

  $.when(redmine_data_Deferred, current_version_Deferred).done(function( redmine_data_Deferred_result, current_version_Deferred_result ) {

    let redmine_data= redmine_data_Deferred_result[0];
    let current_version= current_version_Deferred_result[0];

    // build real data
    var chartjs_data = [];
    redmine_data.forEach((item) => {
      chartjs_data.push({x: moment(item.x).toDate(), y: item.y});
    });

    // build ideal data
    let start_date = moment(chartjs_data[0].x).clone().startOf('day');
    let start_point = chartjs_data[0].y;
    let due_date = moment(current_version.due_date).clone().startOf('day');
    let iteration_days = due_date.diff(start_date, 'days')+1;
    let iteration_workindays = 0;
    for(var i=0; i < iteration_days; i++){
      let loop_date = start_date.clone().add(i, 'd');
      if(!(loop_date.day() === 6 || loop_date.day() === 0)){
        iteration_workindays++;
      }
    }

    let ideal_data = [];
    // we must have a = (Yb-Ya) / (Xb - Xa)
    let a = (0 - start_point) / (iteration_workindays - 0);
    let x = 0;
    for(var i=0; i <= iteration_days; i++){
      let loop_date = start_date.clone().add(i, 'd');
      let point;
      if(i !== 0 && (loop_date.day() === 1 || loop_date.day() === 0)){
        point = {x: loop_date.toDate(), y: ideal_data[ideal_data.length-1].y};
      } else {
        point = {x: loop_date.toDate(), y: a * x++ + start_point};
      }
      ideal_data.push(point);
    }

    let average_data = [];
    average_data.push(chartjs_data[0]);
    average_data.push(chartjs_data[chartjs_data.length-1]);

    var data = {
      datasets: [{
        label: "Real",
        lineTension: 0,
        data: chartjs_data ,
        borderColor: "#36A2EB",
        pointRadius: 0,
        fill: true
      },{
        label: "Ideal",
        borderColor: '#FF6384',
        borderDash: [5, 5],
        data: ideal_data,
        lineTension: 0,
        fill: false
      },{
        label: "Average",
        borderColor: '#FF69B4',
        borderDash: [10, 5],
        data: average_data,
        fill: false
      }]
    };

    var options = {
      responsive: true,
      title:{
        display:true,
        text:'burndown'
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [{
          type: 'time',
          position: 'bottom',
          time: {
            format: timeFormat,
            // round: 'day'
            tooltipFormat: 'll HH:mm'
          }
        }],
        yAxes: [{
          ticks: {
            min: 0,
            stepSize: 1
          }
        }]
      }
    };

    var myLineChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: options
    });

  });
}

async function initNextIteration(configuration){
  $("#content").append(`<div id="next-it" class="iteration"><h3>Next iteration</h3></div>`);

  // next iteration
  $.ajax({
    url: "https://redminecharts.famaridon.com/api/indicator/UserStoryWithBusinessValue",
  }).done((data) => {
    $("#next-it").append('<div id="UserStoryWithBusinessValue" class="card"> <div class="card-block"><h4 class="card-title">User story with business value</h4> <p class="card-text"> <span class="value percentage"></span> </p></div></div>');
    let $value = $("#UserStoryWithBusinessValue .value");
    $value.text(Math.round(data.percentage));
    $value.css("color",`hsl(${data.percentage}, 77%, 50%)`);
  } );

  $.ajax({
    url: "https://redminecharts.famaridon.com/api/indicator/UserStoryWithPoints",
  }).done((data) => {
    $("#next-it").append('<div id="UserStoryWithPoints" class="card"> <div class="card-block"><h4 class="card-title">User story with Points</h4> <p class="card-text"><span class="value percentage"></span></p></div></div>');
    let $value = $("#UserStoryWithPoints .value")
    $value.text(Math.round(data.percentage));
    $value.css("color",`hsl(${data.percentage}, 77%, 50%)`);
  } );

  $.ajax({
    url: "https://redminecharts.famaridon.com/api/charts/next/prioritization",
  }).done((chartjs_data => {
    $("#next-it").append('<canvas id="prioritization"></canvas>');

    let ctx = document.getElementById("prioritization");
    let data = {
      datasets: [{
        label: "Real",
        data: chartjs_data ,
        borderColor: "#36A2EB"
      }]
    };

    let options = {
        scales: {
            yAxes: [{
                ticks: {
                    max: 100,
                    min: 0,
                    stepSize: 10
                }
            }],
            xAxes: [{
                ticks: {
                    max: 100,
                    min: 0
                }
            }]
        }
    };

    var myBubbleChart = new Chart(ctx,{
      type: 'bubble',
      data: data,
      options: options
    });
  }));




}
