const { app, BrowserWindow, Menu, ipcMain, shell } =require('electron')

const os =require('os') 
const path = require("path")
const imagemin = require ('imagemin')
const imageminMozjpeg = require ('imagemin-mozjpeg')
const imageminPngquant = require ('imagemin-pngquant')
const slash= require('slash')

process.env.NODE_ENV='development'
const isDev= process.env.NODE_ENV !=='production' ? true: false
const isMac= process.platform === 'darwin' ? true: false
console.log(process.platform)

let mainWindow
let aboutWindow

function createAboutWindow(){
    aboutWindow=new BrowserWindow({
        title: 'About ImageShrink',
        width: 300,
        height: 300,
        icon: `${__dirname}/assets/icons/icon.png`,
        resizable: false
    })
    mainWindow.loadFile(`${__dirname}/app/about.html`)
}

function createMainWindow(){
    mainWindow=new BrowserWindow({
        title: 'ImageShrink',
        width: isDev?800:500,
        height: 600,
        icon: `${__dirname}/assets/icons/icon.png`,
        resizable: isDev,
        backgroundColor:'white',
        webPreferences:{
            nodeIntegration: true,
        }
    })
    if(isDev){
        mainWindow.webContents.openDevTools()
    }
    // mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    mainWindow.loadFile(`${__dirname}/app/index.html`)

}


function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: isDev ? 800 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev ? true : false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.loadFile('./app/index.html')
}


function createHelpWindow(){
    mainWindow=new BrowserWindow({
        title: 'ImageShrink',
        width: 500,
        height: 600,
        icon: `${__dirname}/assets/icons/icon.png`,
        resizable: isDev
    })
    mainWindow.loadFile(`${__dirname}/app/help.html`)
}

// app.disableHardwareAcceleration()
// Handling WebGL

app.on('ready', () => {
    createMainWindow()
    
    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)
    
    // globalShortcut.register('CmdOrCtrl+R',()=> mainWindow.reload())
    // globalShortcut.register(isMac ? 'Command+Alt+I':'Ctrl+Shift+I',()=>mainWindow.toggleDevTools())
    
    mainWindow.on('close', () => (mainWindow = null))
  })

ipcMain.on('image:minimize',(e, options)=>{
    options.dest=path.join(os.homedir(),'imageshrink')
    shrinkImage(options)
})

async function shrinkImage({imgPath, quality, dest}){
    try{
        const pngquality=quality/100
        const files =await imagemin([slash(imgPath)],{
            destination:dest,
            plugins:[
                imageminMozjpeg({quality}),
                imageminPngquant({
                    quality:[pngquality,pngquality]
                })
            ]
        })
        console.log(files)
        // shell.openPath(dest)
    }catch(err){
        console.log(err);
    }

}

app.on('window-all-closed',()=>{
    if(!isMac){
        app.quit()
    }
})



// Declaring Explicitly

// const menu =[
//     ...(isMac? [{role: 'appMenu'}]:[]),
//     {
//         label:'File',
//         // accelerator: isMac ? 'Command+W' : 'Ctrl+W',
//         accelerator: 'CmdOrCtrl+W',
//         submenu: [{
//             label: 'Quit',
//             click: ()=>app.quit()
//         }]
//     }
// ]

// Using File Menu


const menu =[
    ...(isMac
        ? [
            {
              label: app.name,
              submenu: [
                {
                  label: 'About',
                  click: createAboutWindow,
                },
              ],
            },
          ]
        : []),
    {
        role: 'fileMenu',
    },
    ...(isMac?[{
        label: 'Help',
        submenu: [
            {
                label: 'Help',
                click: createHelpWindow,
            }
        ]
    }]:[]),
    ...(isDev?[{
        label:'Developer',
        submenu: [
            {role:'reload'},
            {role:'forcereload'},
            {role:'seperator'},
            {role:'toggledevtools'}
        ]
    }]:[])
]

console.log("Hello! Electron");