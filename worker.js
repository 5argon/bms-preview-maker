const bmsRenderer = require('bms-renderer')

onmessage = function(e) {
    console.log("Start working!")
    bmsRenderer.render(e.data[0], e.data[1], e.data[2], e.data[3]).then( (buffer) =>
    {
        console.log("Stop working!")
        postMessage([buffer, e.data[1]])
    })
}