const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron')
const fs = require('fs')
const path = require('path')

 let win
 const createWindow = async () => {
    win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration:true,
      contextIsolation: false,
    }
  })

  await win.loadFile('index.html')
  // win.webContents.openDevTools()
  createNewFile()

  ipcMain.on('update-content', (event, data) => {
    file.content = data
  })
}

let file = {}
const createNewFile = () => {
  file = {
    name: 'novo-arquivo.txt',
    content: '',
    saved: false,
    path: app.getPath('documents')+'/novo-arquivo.txt'
  }

  win.webContents.send('set-file', file)
}

const readFile = (filePath) => {
  try{
    return fs.readFileSync(filePath, 'utf8')
  }catch(e){
    console.log(e)
    return ''
  }
}

const openFile = async () => {
  //DIALOG
  let dialogFile = await dialog.showOpenDialog({
    defaultPath: file.path
  })

  if(dialogFile.canceled) return false;

  file = {
    name: path.basename(dialogFile.filePaths[0]),
    content: readFile(dialogFile.filePaths[0]),
    saved: true,
    path: dialogFile.filePaths[0]
  }

  win.webContents.send('set-file', file)
}

const writeFile = (filePath) => {
  try{
    fs.writeFile(filePath, file.content, 
    (e) => {
      if(e) throw e

      file.path = filePath
      file.saved = true
      file.name = path.basename(filePath)
      
      win.webContents.send('set-file', file)
    }
    )
  }catch(e){
    console.log(e)
  }
}

const saveFileAs = async () => {

  //DIALOG
  let dialogFile = await dialog.showSaveDialog({
    defaultPath: file.path
  })

  // Verificar cancelamento
  if(dialogFile.canceled){
    return false
  } 

  //SALVAR ARQUIVO
  writeFile(dialogFile.filePath)
}

const saveFile = () => {
  if(file.saved){
    return writeFile(file.path)
  }

  return saveFileAs()
}

const templateMenu = [
  {
    label: 'Arquivo',
    submenu: [
      {
        label: 'Novo',
        accelerator: 'CmdOrCtrl+N',
        click(){
          createNewFile()
        }
      },
      {
        label: 'Abrir',
        accelerator: 'CmdOrCtrl+O',
        click(){
          openFile()
        }
      },
      {
        label: 'Salvar',
        accelerator: 'CmdOrCtrl+S',
        click(){
          saveFile()
        }
      },
      {
        label: 'Salvar Como',
        accelerator: 'CmdOrCtrl+Shift+S',
        click(){
          saveFileAs()
        }
      }, 
      {
        label: 'Fechar',
        accelerator: 'CmdOrCtrl+Q',
        role:process.platform === 'darwin' ? 'close' : 'quit' 
      }
    ]
  },
  {
    label: 'Editar',
    submenu: [
      {
        label: 'Desfazer',
        role: 'undo'
      },
      {
        label: 'Refazer',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Copiar',
        role: 'copy'
      },
      {
        label: 'Cortar',
        role: 'cut'
      },
      {
        label: 'Colar',
        role: 'paste'
      }
    ]
  }, 
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Meu GitHub',
        click(){
          shell.openExternal('https://github.com/HollowDeev')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(templateMenu)
Menu.setApplicationMenu(menu)

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})