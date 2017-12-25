# BMS Preview Maker

![icon](http://5argon.info/bms-preview-maker/icon.png)

## What is it

[http://5argon.info/bms-preview-maker](http://5argon.info/bms-preview-maker)

## How to build!

```
npm install --global --production windows-build-tools (Windows only)
npm run install
npm run rebuild
npm run distWin (Running this on macOS is not a good idea)
npm run distMac (Can't run this on Windows since you can't sign the app)
```

Then get your installer in `dist/`

## Development Run

Copy `libsndfile.dll` to `Windows/` or `brew install libsndfile` for macOS then you can test with : 

```
npm run electron
```