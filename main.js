const { app, BrowserWindow,ipcMain,dialog  } = require('electron');
const path = require('path')
ipcMain.on('addfile',(event,arg)=>{
  dialog.showOpenDialog({
    // 选择文件, 隐藏文件也显示出来
    properties: ['openFile', 'multiSelections'],
    // 后缀为html, js, json, md其中之一
  }).then((result)=>{
    if(!result.canceled){
      event.reply('filelist',result.filePaths)
    }
  });
});
ipcMain.on('fileempty',(event,arg)=>{
  dialog.showErrorBox("错误","请选择文件");
})
function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './js/preload.js'),
      nodeIntegration:true,
      contextIsolation:false,
    }
  })

  win.loadFile('index.html');
  win.webContents.openDevTools();
}

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