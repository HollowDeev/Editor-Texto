const {ipcRenderer} = require('electron')
//Elementos
const textarea = document.getElementById('text')
const title = document.getElementById('title')

ipcRenderer.on('set-file', function(event, data){
    textarea.value = data.content;
    title.innerHTML = `${data.name} | Editor Hollow Deev`
})

const handleChangeText = () => {
    ipcRenderer.send('update-content', textarea.value)
} 