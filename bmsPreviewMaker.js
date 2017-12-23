const bmsRenderer = require('bms-renderer')
const { dialog } = require('electron').remote
const fs = require('fs')
const path = require('path')
const bms = require('bms')

let selectedBms;
let selectedOutputFolder;
const previewFileName = "preview.ogg"
let ableToMakePreview = false;
let previewBegin; 
let previewLength;


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
    console.log(ableToMakePreview)
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
        document.getElementById("statusParagraph").innerText = "WORKING !!"

        yield bmsRenderer.render(selectedBms.path, selectedOutputFolder + "/" + previewFileName, selectedBms.measureToSeconds(previewBegin), selectedBms.measureToSeconds(previewLength))().done()

        document.getElementById("statusParagraph").innerText = "Done"
    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    checkAbleToMakePreview()
})