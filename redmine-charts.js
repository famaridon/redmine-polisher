$( document ).ready(function() {
  console.log( "Redmine tools started" );
  console.log( "Charts" );
  var timeFormat = 'MM/DD/YYYY HH:mm';

  $("#content").empty();
  $("#content").append(`<canvas id="canvas"></canvas>`);
  var ctx = document.getElementById("canvas");

  let redmine_data_Deferred = $.ajax({
    url: "https://redminecharts.famaridon.com/api/charts/latest/burndown",
  });

  let latest_version_Deferred = $.ajax({
    url: "https://redminecharts.famaridon.com/api/charts/latest",
  });

  $.when(redmine_data_Deferred, latest_version_Deferred).done(function( redmine_data_Deferred_result, latest_version_Deferred_result ) {

    let redmine_data= redmine_data_Deferred_result[0];
    let latest_version= latest_version_Deferred_result[0];

    // build real data
    var chartjs_data = [];
    redmine_data.forEach((item) => {
      chartjs_data.push({x: moment(item.x).toDate(), y: item.y});
    });

    // build ideal data
    let start_date = moment(chartjs_data[0].x).clone().startOf('day');
    let start_point = chartjs_data[0].y;
    let due_date = moment(latest_version.due_date).clone().startOf('day');
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
      console.log(`loop day ${loop_date.day()}`)
      let point;
      if(i !== 0 && (loop_date.day() === 6 || loop_date.day() === 0)){
        point = {x: loop_date.toDate(), y: ideal_data[ideal_data.length-1].y};
      } else {
        point = {x: loop_date.toDate(), y: a * x++ + start_point};
      }
      ideal_data.push(point);
    }

    var data = {
      datasets: [{
        label: "Real",
        lineTension: 0,
        data: chartjs_data ,
        borderColor: "#36A2EB",
        fill: true
      },{
        label: "Ideal",
        borderColor: '#FF6384',
        borderDash: [5, 5],
        data: ideal_data,
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
});
