function dragOverHandler(event) {
    event.preventDefault()
}

function hideLabelTool() {
    const labelDiv = document.querySelector('#label-div')
    labelDiv.style.visibility = 'hidden'
}

function clearSamples() {
    hideLabelTool()
    const sampleTable = document.querySelector('#sample-table')
    sampleTable.innerHTML = '<tr><th>Sample</th><th>String</th></tr>'
}

var generators = []
var currGenerator
function showSamples(n) {
    hideLabelTool()
    const dataDiv = document.querySelector('#data-div')
    const mode = document.querySelector('#task-type').value
    
        for (let i = 0; i < n; i++) {
            if (currGenerator < generators.length) {
                const next = generators[currGenerator].next()
                if (!next.done) {
                    const [idx, text] = next.value
                    const sampleTable = document.querySelector('#sample-table')
                    const row = document.createElement('tr')
                    const sample = document.createElement('td')
                    const string = document.createElement('td')
                    string.setAttribute('id', `${currGenerator}-${idx}`)
                    string.setAttribute('class', 'data')

                    sample.append(idx)
                    string.append(text)
                    row.append(sample)
                    row.append(string)

                    string.addEventListener('mouseup', (event) => {
                        event.preventDefault()
                        showLabelDiv()
                    })
            
                    if (mode === 'sentence') {
                        sampleTable.append(row)
                    } else if (mode === 'str') {
                        /*
                        const children = sampleTable.childNodes
                        sampleTable.replaceChild(row, children[children.length - 1])
                        */
                        sampleTable.innerHTML = '<tr><th>Sample</th><th>String</th></tr>'
                        sampleTable.append(row)
                    }
                } else {
                    currGenerator++
                    i--;
                }  
            } else {
                alert('No more data')
                break
            }
        }
}

async function uploadFiles(event) {
    event.preventDefault()
    
    if (event.dataTransfer.items) { // if browser supports DataTransferItemList interface
        //console.log(`${event.dataTransfer.items.length} files uploaded`)
        const dropZone = document.querySelector('#drop-zone')
        const p = document.createElement('p')
        p.append(`Successfully uploaded ${event.dataTransfer.items.length} files`)
        p.setAttribute('style', 'background-color: lightgreen; border: 1px solid black; width: 90%')
        dropZone.append(p)
        setTimeout(() => {
            dropZone.removeChild(p)
        }, 3000)
        for (let i = 0; i < event.dataTransfer.items.length; i++) {
            if (event.dataTransfer.items[i].kind === 'file') {
                const file = event.dataTransfer.items[i].getAsFile()
                console.log(`Uploaded ${file.name}`)
                const generator = processFile(file)
                generator.then(gen => {console.log(gen);generators.push(gen)})
            }
        }
        currGenerator = 0
    }
}

async function processFile(file) {
    const content = await file.text()
    const lines = await content.split('\n')
    const generator = processLines(lines)
    return generator
}

function* processLines(lines) {
    for (let i = 0; i < lines.length; i++) {
        //console.log(lines[i])
        yield [i, lines[i]]
    }
}

function labelSample() {
    const deleteHeader = document.querySelector('#delete-header')
    deleteHeader.style.display = 'table-cell';

    const labelSelect = document.querySelector('#labels')
    const label = labelSelect.value
    labelSelect.selectedIndex = 0

    const selected = document.getSelection()
    const range = selected.getRangeAt(0)
    
    const start = (range.startOffset < range.endOffset)? range.startOffset : range.endOffset
    const end = (range.startOffset < range.endOffset)? range.endOffset : range.startOffset

    //console.log(`Label: ${label} Start: ${start} End: ${end}`)
    if (start < end) {
        const table = document.querySelector('#labelledData')
        const sample = document.createElement('tr')
        const sampleDelete = document.createElement('td')
        const deleteButton = document.createElement('button')
        const sampleId = document.createElement('td')
        const sampleString = document.createElement('td')
        const sampleStart = document.createElement('td')
        const sampleEnd = document.createElement('td')
        const sampleLabel = document.createElement('td')

        deleteButton.textContent = 'x'
        deleteButton.addEventListener('click', (event) => {
            event.preventDefault()
            const row = deleteButton.parentNode.parentNode
            const table = document.querySelector('#labelledData')
            table.deleteRow(row.rowIndex)
        })

        sampleId.textContent = selected.anchorNode.parentNode.id
        sampleString.textContent = range.toString()
        sampleStart.textContent = start
        sampleEnd.textContent = end
        sampleLabel.textContent = label

        sampleDelete.append(deleteButton)
        sample.append(sampleDelete)
        sample.append(sampleId)
        sample.append(sampleString)
        sample.append(sampleStart)
        sample.append(sampleEnd)
        sample.append(sampleLabel)
        table.append(sample)
    }
}

function showLabelDiv() {
    const body = document.querySelector('body')
    const bodyRect = body.getBoundingClientRect()
    /*
    const dataArea = document.querySelector('#data-title')
    const dataAreaRect = dataArea.getBoundingClientRect()
    */
    const selected = document.getSelection()
    const range = selected.getRangeAt(0)
    const selectionRect = range.getBoundingClientRect()

    const offset = selectionRect.top - bodyRect.top
    /*
    console.log(`Working area top is ${workingAreaRect.top}`)
    console.log(`Data area top is ${dataAreaRect.top}`)
    console.log(`Selection top is ${selectionRect.top}`)
    console.log(`Selection top is ${offset} px from working area top`)
    */
    const labelDiv = document.querySelector('#label-div')
    const labelRect = labelDiv.getBoundingClientRect()
    labelDiv.style.display = 'inline-block'
    labelDiv.style.left = (selectionRect.left + labelRect.width >= window.innerWidth)? (window.innerWidth - labelRect.width) : selectionRect.left
    labelDiv.style.top = offset - labelRect.height
    labelDiv.style.visibility = 'visible'
    
    //console.log(`Label Div top is ${labelDiv.style.top}`)
}

async function fetchData() {
    const res = await fetch('https://jsonplaceholder.typicode.com/users')
    const users = await res.json()

    const body = document.querySelector('body')
    const usersDiv = document.createElement('div')
    const usersList = document.createElement('ul')

    users.forEach(user => {
        const userItem = document.createElement('li')
        userItem.textContent = user['name']
        usersList.appendChild(userItem)
    })

    const usersTitle = document.createElement('h1')
    usersTitle.textContent = 'Users'

    usersDiv.append(usersTitle)
    usersDiv.appendChild(usersList)
    body.appendChild(usersDiv)
}


// Quick and simple export target #table_id into a csv
function download_table_as_csv(table_id, separator = ',') {
    // Select rows from table_id
    var rows = document.querySelectorAll('table#' + table_id + ' tr');

    // Construct csv
    let csv = [];
    for (var i = 0; i < rows.length; i++) {
        let row = []
        let cols = rows[i].querySelectorAll('td, th');
        for (let j = 1; j < cols.length; j++) {
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
            data = data.replace(/"/g, '""');
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }

    let csv_string = csv.join('\n');

    // Download it
    let filename = 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
    let link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/*
const dataButton = document.querySelector('#fetch-button')
dataButton.addEventListener('click', fetchData)

const button = document.querySelector('#button')
button.addEventListener('click', buttonClicked)

const input = document.getElementById('number');
input.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const n = parseInt(input.value);

        for (let i = 0; i < n; i++) {
            foo();
        }
    }
});
*/

const taskType = document.querySelector('#task-type')
taskType.addEventListener('change', (event) => {
    event.preventDefault()
    const mode = taskType.value
    const loadBatch = document.querySelector('#load-5')
    if (mode === 'str') {
        loadBatch.disabled = true
    } else if (mode === 'sentence') {
        loadBatch.disabled = false
    }
})

window.addEventListener('dragover', (event) => {
    event.preventDefault()
})

window.addEventListener('drop', (event) => {
    event.preventDefault()
})
