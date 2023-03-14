import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import Room from '../lib/Room';
const path = require('path')

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady(() => {
    
  });

  const mainWindow = createWindow('main', {
    width: 1200,
    height: 600,
  });

  ipcMain.handle('createRoom', (event, roomId, nickname) => {
    createRoom(roomId, nickname)
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    // mainWindow.webContents.openDevTools();
  }


})();

app.on('window-all-closed', () => {
  app.quit();
});

var room

ipcMain.on('createRoom', (event, roomId, nickname) => {
  room = new Room(roomId, nickname)

  room.on('chat', (message) => {
    console.log('received message from ' + message.nickname + ': ' + message.text)
    event.sender.send('chat', message)
  })
  room.on('join', (message) => {
    event.sender.send('join', message)
  })
})

ipcMain.on('sendMessage', (event, message) => {
  room.sendMessage(message)
})