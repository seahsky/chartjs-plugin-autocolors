module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['color'],
      datasets: Array.from({length: 20}, (v, i) => ({label: `Bar ${i + 1}`, data: [10]}))
    },
    options: {
      borderWidth: 2,
      plugins: {legend: false},
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false
        }
      }
    },
    plugins: [window['@seahsky/chartjs-plugin-autocolors']]
  }
};
