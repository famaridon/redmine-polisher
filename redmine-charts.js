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
  $("#main").empty();
  initMenu(configuration);
  initCurrentIteration(configuration);
  initNextIteration(configuration);
}

async function initMenu(configuration){
  $("#main").append(`<nav id="charts-nav" class="nav nav-tabs"></nav>`);
}

async function addMenuItem(label, $zone, hidden, load){
  let $link = $(`<a class="nav-link zone-link">${label}</a>`);
  $link.on("click", () => {
    $('.zone').hide(0);
    $('.zone-link').removeClass("active");
    $link.addClass("active");
    $zone.empty();
    $zone.show(10,load);
  });
  if(hidden === true){
    $zone.hide(0);
  } else {
    $link.addClass("active");
    load();
  }
  $("#charts-nav").append($link);
}

async function initCurrentIteration(configuration){
  let $zone = $(`<div id="current-it" class="iteration zone" ></div>`);
  $("#main").append($zone);
  addMenuItem("Burndown",$zone, false, () => {
    loadBurndownCharts(configuration, $zone);
  });
}

async function loadCurrentIteration(){
  return $.ajax({
    url: "https://redminecharts.famaridon.com/api/charts/current",
  }).promise();
}

async function loadCategories(configuration) {
  return $.ajax({
    method: "GET",
    url: window.location.origin +"/projects/moovapps-process-team/issue_categories.json",
    headers: {
      'X-Redmine-API-Key': configuration.redmineAPIKey
    }
  }).promise();
}

async function loadBurndownChartsData(category) {
  let url = 'https://redminecharts.famaridon.com/api/charts/current/burndown';
  if(category) {
    url = url + `-${category.id}`;
  }
  return $.ajax({
    url: url,
    timeout: 3000
  }).promise();
}

function appendCanvas($zone, category) {
  let chartId = 'burndown';
  if(category) {
    chartId = category.id;
  }
  $zone.append(`<canvas id="${chartId}"></canvas>`);
  return document.getElementById(chartId);
}

/**
* create chart with ideal datasets and global burndown
**/
async function createBurndownCharts(configuration, $zone, category) {

  const ctx = appendCanvas($zone, category);

  const current_version = await loadCurrentIteration();
  const redmine_data = await loadBurndownChartsData(category) ;

  if( !redmine_data || redmine_data.length === 0 ) {
    return
  }

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

  const data = {
    datasets: [{
      label: "Real",
      lineTension: 0,
      data: chartjs_data ,
      borderColor: "#36A2EB",
      pointRadius: 0,
      fill: false
    },{
      label: "Ideal",
      borderColor: '#FF6384',
      borderDash: [5, 5],
      data: ideal_data,
      lineTension: 0,
      fill: false
    }]
  };

  let label = 'burndown';
  if(category) {
    label = category.name;
  }

  const options = {
    responsive: true,
    title:{
      display:true,
      text:label
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
        } ,
        scaleLabel: {
          display: true,
          labelString: 'Date'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Points'
        },
        ticks: {
          min: 0,
          stepSize: 10
        }
      }]
    }
  };

  var burndown = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
  });
  return burndown;
}

async function loadBurndownCharts(configuration, $zone) {
  let chart = await createBurndownCharts(configuration, $zone);
  let categories = await loadCategories(configuration);
  categories.issue_categories.forEach(function(category) {
    createBurndownCharts(configuration, $zone, category);
  });
}

async function initNextIteration(configuration){
  let $zone = $(`<div id="next-it" class="iteration zone">`);
  $("#main").append($zone);
  addMenuItem("Next iteration prioritization",$zone, true, () => {
    // next iteration
    let $indicators = $(`<div id="indicators" class="indicators"></div>`);
    $zone.append($indicators);
    $.ajax({
      url: "https://redminecharts.famaridon.com/api/indicator/UserStoryWithBusinessValue",
    }).done((data) => {
      $indicators.append('<div id="UserStoryWithBusinessValue" class="card"> <div class="card-block"><h4 class="card-title">User story with business value</h4> <p class="card-text"> <span class="value percentage"></span> </p></div></div>');
      let $value = $("#UserStoryWithBusinessValue .value");
      $value.text(Math.round(data.percentage));
      $value.css("color",`hsl(${data.percentage}, 77%, 50%)`);
    } );

    $.ajax({
      url: "https://redminecharts.famaridon.com/api/indicator/UserStoryWithPoints",
    }).done((data) => {
      $indicators.append('<div id="UserStoryWithPoints" class="card"> <div class="card-block"><h4 class="card-title">User story with Points</h4> <p class="card-text"><span class="value percentage"></span></p></div></div>');
      let $value = $("#UserStoryWithPoints .value")
      $value.text(Math.round(data.percentage));
      $value.css("color",`hsl(${data.percentage}, 77%, 50%)`);
    } );

    $.ajax({
      url: "https://redminecharts.famaridon.com/api/charts/next/prioritization",
    }).done((chartjs_data => {
      $zone.append('<canvas id="prioritization"></canvas>');

      let ctx = document.getElementById("prioritization");
      let data = {
        datasets: [{
          label: "Real",
          data: chartjs_data ,
          borderColor: "#36A2EB"
        }]
      };

      let options = {
        responsive: true,
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Business value'
            },
            ticks: {
              max: 100,
              min: 0,
              stepSize: 10
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Points'
            },
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
  });

}
