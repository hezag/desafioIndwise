(function(){
  var app = angular.module('indWise', []);
  var parseDate = function(input) {
    var parts = input.match(/(\d+)/g);
    // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
  }
  // transform spaces into "-"
  app.filter('parseDate', function(){
    return function(input){
      return parseDate(input).toLocaleDateString("pt-BR");
    };
  });
  app.controller('dataViewerCtrl', function($http){
    this.loading = true;
    this.data = [];
    var scope = this;
    $http.get('/production/summary').success(
      function(data){
        // ordenação por data
        data.production = data.production.sort(function(a,b){
          return parseDate(a.date) - parseDate(b.date);
        })

        scope.data = data;
        scope.loading = false;

        new Chart(document.getElementById("chart1"), {
            type: 'line',
            data: {
                labels: data.production.map(function(a){
                  return parseDate(a.date).toLocaleDateString("pt-BR");
                }),
                datasets: [{
                  lineTension: 0,
                  label: 'Itens produzidos',
                  backgroundColor: "rgba(26, 179, 148,0.1)",
                  pointBackgroundColor: "rgba(26, 179, 148,1)",
                  pointBorderColor: "rgba(26, 179, 148,1)",
                  borderColor: "rgba(26, 179, 148,.6)",
                  borderWidth: 4,
                  pointHoverRadius: 5,
                  pointRadius: 4,
                  data: data.production.map(function(a){
                    return a.count;
                  })
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                },
            }
        });

        new Chart(document.getElementById("chart2"), {
            type: 'pie',
            data: {
                labels: data.production.map(function(a){
                  return parseDate(a.date).toLocaleDateString("pt-BR");
                }),
                datasets: [
                  {
                    data: data.production.map(function(a){
                      return (a.count / data.total * 100).toFixed(2);
                    }),
                    backgroundColor: [
                      'rgba(26, 188, 156,.8)', 'rgba(46, 204, 113,0.5)', 'rgba(52, 152, 219,.8)',
                      'rgba(155, 89, 182,.8)', 'rgba(52, 73, 94,.8)', 'rgba(243, 156, 18,.8)',
                      'rgba(211, 84, 0,.8)', 'rgba(192, 57, 43,.8)', 'rgba(127, 140, 141,.8)'
                    ],
                    hoverBackgroundColor: [
                      'rgba(26, 188, 156,1.0)', 'rgba(46, 204, 113,1.0)', 'rgba(52, 152, 219,1.0)',
                      'rgba(155, 89, 182,1.0)', 'rgba(52, 73, 94,1.0)', 'rgba(243, 156, 18,1.0)',
                      'rgba(211, 84, 0,1.0)', 'rgba(192, 57, 43,1.0)', 'rgba(127, 140, 141,1.0)'
                    ],
                  }
                ]
            },
            options: {
              showLines: true,
              margins: {
                  top: 20,
              },
              legend: {
                onClick: function(){
                  return;
                }
              },
            }
        });
      }
    );
  });
})();
