module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            preload : 'src/preload.js',
            builderOptions: {
                "appId": "com.xxx.app",
    "mac": {
      "target": [
        "dmg",
        "zip"
      ],
      "icon": "./icons/icon.png"
    },
    "win": {
      "target": [
        "nsis",
        "zip"
      ],
      "icon": "./icons/icon.png"
    },
    "linux": {
      "target": [
        "AppImage",
        "zip"
      ],
      "icon": "./icons/512x512.png"
    },
    "nsis": {
      "oneClick": false,
      "perMachine": false,
      "allowElevation": true,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "./icons/icon.ico",
      "uninstallerIcon": "./icons/icon.ico",
      "installerHeaderIcon": "./icons/icon.ico",
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "runAfterFinish": true,
      "shortcutName": "aliyunShare"
    }
              }
        }
    }
}