const { app, BrowserWindow, Menu, ipcMain, shell } =require('electron')
const { homedir } =require('os') 
const { join } =require("path")
const imagemin = require("imagemin")
const imageminMozjpeg =require( 'imagemin-mozjpeg')
const imageminPngquant =require('imagemin-pngquant')
const slash =require('slash')
const log = require('electron-log')

process.env.NODE_ENV='production'

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
        resizable: false,
        backgroundColor:'white'
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
            contextIsolation: false
        }
    })
    if(isDev){
        mainWindow.webContents.openDevTools()
    }
    // mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    mainWindow.loadFile(`${__dirname}/app/index.html`)
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

app.disableHardwareAcceleration()
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
    options.dest=join(homedir(),'imageshrink')
    shrinkImage(options)
    // console.log(options)
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
        // console.log(files)
        log.info(files)
        shell.openPath(dest)
        mainWindow.webContents.send('image:done')
    }catch(err){
        console.log(err);
        log.error(err)
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

app.allowRendererProcessReuse = true