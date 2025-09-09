# TypeScript + SuiteScript Toolkit

A tailor made toolkit for developing your next SuiteScript customization, using TypeScript and all the latest bells and whistles offered by ESNext.

## Pre-Requisites

1. Node version 14+<br>
2. [Oracle's SuiteCloud Visual Studio Code Extension](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_159223197655.html)<br>
3. [JDK 17](https://jdk.java.net/17/) (This one can be ignored if you choose to use the CLI for authentication instead.)

## Folder Structure

There are three main folders you should know about. These are **TypeScript**, **SuiteScripts** and **FileCabinet**.

### `TypeScript` folder

The TypeScripts folder contains all your TypeScript files. Please note that this folder has its own ESLint config. When building for NetSuite, the folder structure will be preserved.

### `SuiteScripts` folder

The SuiteScripts folder contains all your legacy JavaScript scripts. This folder is meant to store any scripts that are originally created in JavaScript (and not in TypeScript) and are intended to persist in the codebase.

Ideally, you should avoid adding files to this folder. Consider using the `TypeScript` folder instead.

Contents of this folder will be copied to the `FileCabinet` folder when building with the `js` flag, for reference see the [Building](#building) section.

### `FileCabinet` folder
The FileCabinet folder contains all the *compiled* results that will be uploaded into your FileCabinet. The content of this folder is generated every time you **build**. The process of building will be explained later, but you should consider that all files in the SuiteScripts folder and the TypeScript folder will be here, in the folder structure set in those folders.

## Building

```sh
npm run build
# or
npm run build:js
# This flag will automatically copy files from the `SuiteScripts` folder into the `FileCabinet` folder.
# This is useful for scripts that are not written in TypeScript, since the default build process will not copy them.

```

Ensure to install the project dependencies before executing any action. You may do so by running:
**npm install**
<br>

## Deploying

Deploying is the step used to upload your code into NetSuite. This process requires an initial authentication setup.

### Authentication Setup  

(This tutorial assumes you are using Oracle's SuiteCloud Visual Studio Code Extension. If you wish to only use the CLI check [this page](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_1558708800.html))<br>
1. Navigate to NetSuite and log-in as usual.<br>
2. Press Ctrl + Shift + P and type "Set up account".<br>
3. Create a new authorization token or use an existing token.<br>
4. Select browser-based authentication. <br> 
5. Choose a name to identify your token.<br>
6. Ignore the domain prompt by pressing enter<br>
7. You should see a new tab open in your broswer, prompting you to consent the authentication.

### Deploy commands.

`npm run deploy` To deploy all the files in the codebase.<br>

### Watch mode (Experimental)
`npm run watch` To enter watch mode: This will automatically build and deploy your code every time you save a file. This is useful for development.


## Environment Setup

### `tsconfig.json`
All important parameters are documented in the `tsconfig.json` file, the most important one is `outDir` which is the folder where the compiled files will be placed. This folder should be relative to the `FileCabinet` folder.

For example: `"../../src/FileCabinet/SuiteScripts/your-project"`


### Environment variables in `.env`
You can create a `.env` file in the root of the project to set environment variables.

You can use the `FILE_PATH` environment variable to prefix the project's dir.

For example, if you create a `.env` file with:
```
FILE_PATH=your-project
```

Then, only files under `src/FileCabinet/SuiteScripts/your-project` will be deployed.
