document.addEventListener('DOMContentLoaded', () =>{
    // set global variables to represent x and y axis data
    let xs = [];
    let ys = [];
    let dataset = {};

    dataset.xs = xs;
    dataset.ys = ys;

    // initialze a starting country
    let country = "US";

    // get today's date to access Covid-19 info up to today
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;


    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataset.xs,
            datasets: [{
                label: `Covid 19 Confirmed cases in ${country}`,
                data: dataset.ys,
                backgroundColor: ['rgb(108,229,232)'],
                borderColor: ['rgb(108,229,232)'],
                borderWidth: 1,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: {
                    scaleLabel: {
                        display: true,
                        labelString: 'Confirmed Cases'
                    }
                },
                xAxes: {
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }
            }
        }
    });

    // Load initial data for Italy
    document.getElementById('country').value = country;
    dataToGraph();

    // here goes your Event-Listener with function as argument;
    document.getElementById('country_form').addEventListener('submit', dataToGraph);

    function dataToGraph(event) {
        if (event) {
            event.preventDefault(); // make sure to prevent the default action of submitting a form b/c we're not really submitting data, we just want the countnry name
        }

        let user_input = document.getElementById('country').value;

        country = user_input.charAt(0).toUpperCase() + user_input.slice(1);

        // give feedback to user that data is loading in background
        myChart.data.datasets[0].label =  `loading ... ${country}`;
        myChart.update();

        // set all variables to empty again:
        xs = [];
        ys = [];
        dataset = {};
        dataset.xs = xs;
        dataset.ys = ys;

        // fetch() is a Promise, i.e. it is like an async callback already,
        // hence no need to call async again.
        fetch(`https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/countries_summary?country=${country}&min_date=2020-04-22&max_date=${today}`)
            .then(response => response.json())
            .then(days => {
                days.forEach(day => {
                    ys.push(day.confirmed);
                    xs.push(day.date.slice(0, 10));
                });
                dataset.xs = xs;
                dataset.ys = ys;
                
                // now graph this data
                graphit();
            })

    };


    function graphit() {
        // re-assign the datasets again (x- and y-axis)
        myChart.data.labels = dataset.xs;
        myChart.data.datasets[0].data = dataset.ys;
        myChart.data.datasets[0].label =  `Covid 19 Confirmed cases in ${country}`;
        // now update chart
        myChart.update();
    };
});