# React Chrome Extension

The boilerplate is to quickly create a chrome extension using ReactJs, The motivation behind creating a boilerplate was:

1. Instead of chrome's ready-made popup, We wanted our own page injected into DOM as a sidebar for better UX.

2. We wanted to use ReactJs for the Component-based approach, Routing, and its build mechanism.

3. We need to make sure that the extension CSS should not conflict with the host page styles in any case.

## Features

- Used ReactJs to write chrome extension
- Injecting extension to host page as content script
- Utilized the Chrome messaging API
- Isolated extension CSS using Iframe

## Installation

1. Make sure you have latest **NodeJs** version installed
2. Run `yarn install` or `npm install` for installing the packages
3. After installing run `yarn watch` or `npm run watch` while developing for hot realoading, It will create a build folder which has to be loaded into the browser from load unpacked
4. Use `yarn start` or `npm run start` to run the app in the browser

## Building your chrome extension

1. If you want to build your app use yarn build or npm run build which will create an optimized build into build folder
