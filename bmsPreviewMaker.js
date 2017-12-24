const { dialog } = require('electron').remote
const fs = require('fs')
const path = require('path')
const bms = require('bms')

const ogg = require('ogg').Encoder()
const vorbis = require('vorbis').Encoder()

const shell = require('electron').shell
document.addEventListener('click', function (event) {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
        event.preventDefault()
        shell.openExternal(event.target.href)
    }
})

let selectedBms;
let selectedOutputFolder;
const previewFileName = "preview.ogg"
let ableToMakePreview = false;
let previewBegin; 
let previewLength;

let worker = new Worker("worker.js")
worker.onmessage = function(e) {
    //We can't use fs in a WebWorker

    console.log("Writing OGG..")

    vorbis.pipe(ogg.stream())
    ogg.pipe(fs.createWriteStream(e.data[1]))
    vorbis.write(Buffer.from(e.data[0]), (err) => {vorbis.end()})

    //TODO : add error handling to close stream properly + report error

    console.log("OK!")
    document.getElementById("statusParagraph").innerText = "Done"
    document.getElementById("status").className = ""
    enableAllForms()
}

function disableAllForms()
{
    document.getElementById("selectInput").setAttribute("disabled","true")
    document.getElementById("selectOutput").setAttribute("disabled","true")
    document.getElementById("previewBegin").setAttribute("disabled","true")
    document.getElementById("previewLength").setAttribute("disabled","true")
    document.getElementById("makePreviewButton").setAttribute("disabled","true")
}

function enableAllForms()
{
    document.getElementById("selectInput").disabled = false
    document.getElementById("selectOutput").disabled = false
    document.getElementById("previewBegin").disabled = false
    document.getElementById("previewLength").disabled = false
    checkAbleToMakePreview()
}

function checkAbleToMakePreview()
{
    updatePreviewRange()

    let bmsSelected = selectedBms != null
    let rangeOk = (previewBegin >= 0) && (previewLength > 0)

    ableToMakePreview = bmsSelected && rangeOk
    let previewButton = document.getElementById("makePreviewButton")
    if(ableToMakePreview)
    {
        previewButton.disabled = false
    }
    else
    {
        previewButton.setAttribute("disabled","true")
    }
}

function updatePreviewRange()
{
    previewBegin = parseFloat(document.getElementById("previewBegin").value)
    previewLength = parseFloat(document.getElementById("previewLength").value)
}

function previewBeginChange()
{
    checkAbleToMakePreview()
}

function previewLengthChange()
{
    checkAbleToMakePreview()
}

function readBms(path)
{
    const buffer = fs.readFileSync(path)
    const compiled = bms.Compiler.compile(buffer.toString())
    const info = bms.SongInfo.fromBMSChart(compiled.chart)
    const timing = bms.Timing.fromBMSChart(compiled.chart)
    const timeSignature = compiled.chart.timeSignatures
    return { path: path, info: info, measureToSeconds: (measure) => { return timing.beatToSeconds(timeSignature.measureToBeat(Math.floor(measure), measure - Math.floor(measure))) } }
}

function showSelectInput()
{
    const result = dialog.showOpenDialog({ 
    properties: ['openFile'],
    filters:[ 
        {name: 'BMS File', extensions: ['bms']}
    ]
    })
    if(result !== undefined)
    {
        selectedBms = readBms(result[0])
        console.log("Selected input : " + selectedBms.path)
        document.getElementById("selectedInputDisplay").innerText = selectedBms.path 
        selectedOutputFolder = path.dirname(selectedBms.path)
        console.log("Selected output : " + selectedOutputFolder)
        document.getElementById("selectedOutputDisplay").innerText = selectedOutputFolder
        checkAbleToMakePreview()
    }
}

function showSelectOutput()
{
    const result = selectedOutputFolder = dialog.showOpenDialog({ 
    properties: ['openDirectory'],
    })
    if(result !== undefined)
    {
        selectedOutputFolder = result[0]
        console.log("Selected output : " + selectedOutputFolder)
        document.getElementById("selectedOutputDisplay").innerText = selectedOutputFolder
        checkAbleToMakePreview()
    }
}

function makePreview()
{
    checkAbleToMakePreview()
    if(ableToMakePreview)
    {
        disableAllForms()
        document.getElementById("statusParagraph").innerText = "WORKING !!"
        document.getElementById("status").className = "shakeAnimation"

        worker.postMessage([selectedBms.path, selectedOutputFolder + "/" + previewFileName, selectedBms.measureToSeconds(previewBegin), selectedBms.measureToSeconds(previewLength)])

    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    checkAbleToMakePreview()
})