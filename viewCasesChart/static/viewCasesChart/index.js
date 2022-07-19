// copyright @Nayeemur 2021
document.addEventListener('DOMContentLoaded', () =>{
    // set the alert div to none initially
    document.getElementById('alert').style.display = 'none';
    // when the alert pops up, and user clicks 'x', hide it and reset the input field to blank
    document.getElementById('alert_clicked').addEventListener('click', (e) => {
        document.getElementById('alert').style.display = 'none';
        document.getElementById('country').value = "";
    })

    // keep track of what mode is clicked
    let mode = "confirmed_cases";

    // keep track of graph label
    let graph_label = "Confirmed Cases";

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

    // initialize data for chart
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataset.xs,
            datasets: [{
                label: "Covid 19 " + graph_label + ` in ${country}`,
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

    // Load initial data for US
    document.getElementById('country').value = country;
    dataToGraph();

    // if the user clicked the 'Deaths' button, then change the mode to "deaths"
    document.getElementById("deaths_button").addEventListener('click', () => {
        mode = "deaths";
        graph_label = "Deaths";
    })
    // if the user clicked the 'Confirmed Cases' button, then change the mode to "confirmed_cases"
    document.getElementById("confirmed_cases_button").addEventListener('click', () => {
        mode = "confirmed_cases";
        graph_label = "Confirmed Cases";
    })


    // when the country form is submitted, run the dataToGraph function, (no parenthesis b/c then we'll pass the return as an arg, which is not what we want; we want to run the function)
    document.getElementById('country_form').addEventListener('submit', dataToGraph);

    // make sure to prevent the default action of submitting a form b/c we're not really submitting data, we just want the countnry name
    function dataToGraph(event) {
        if (event) {
            event.preventDefault();
        }

        // get the user's input and set it to be global variable country, with some formatting (first letter capital) 
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


        // fetch() is a Promise, i.e. it is like an async callback already; hence no need to call async again.
        fetch(`https://webhooks.mongodb-stitch.com/api/client/v2.0/app/covid-19-qppza/service/REST-API/incoming_webhook/countries_summary?country=${country}&min_date=2020-04-22&max_date=${today}`)
        .then(response => {
            return response.json()
        })
        .then(days => {
            // console.log(days);
            days.forEach(day => {
                if (mode == "confirmed_cases") {
                    ys.push(day.confirmed);
                } else if (mode == "deaths") {
                    ys.push(day.deaths);
                }

                xs.push(day.date.slice(0, 10));
            });
            // check if data for that country actually exists, if so, we can graph the data
            if (xs.length > 0) { 
                dataset.xs = xs;
                dataset.ys = ys;
            } else {
                // else display the alert div
                document.getElementById('alert').style.display = 'block';

            }
            graphit();
        })
    }
                
    function graphit() {
        // re-assign the datasets again (x- and y-axis)
        myChart.data.labels = dataset.xs;
        myChart.data.datasets[0].data = dataset.ys;
        myChart.data.datasets[0].label =  "Covid 19 " + graph_label + ` in ${country}`;
        // now update chart
        myChart.update();
    };

});