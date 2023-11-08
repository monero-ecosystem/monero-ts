# Getting started part 2: creating a web application

_Note: Though it is not strictly necessary, we recommend reading [part 1 of the monero-ts getting started guide](getting_started_p1.md) before learning about monero-ts web application development._

## Overview

This guide describes a convenient method for downloading, building, and launching monero-ts sample web applications in an application server.  The guide also explains how to convert the offline wallet generator from [part 1 of the getting started guide](getting_started_p1.md) to a web browser application.

This guide is divided into three sections:
1. [Creating a monero-ts web application project](#creating-a-monero-ts-web-application-project): A walkthrough of how to download and run the monero-ts web application starter script, which automatically downloads, builds, and launches monero-ts sample web applications in an application server.
2. [Modifying the offline wallet generator to display in a browser](#modifying-the-offline-wallet-generator-to-display-in-a-browser): Explains how to modify the offline wallet generator to display wallet attributes to an HTML page rather than the console.
3. [Running the application on your own application server](#running-the-application-on-your-own-application-server): Describes how to run the web application on your own application server rather than the built-in Python server.

## Creating a monero-ts web application project

### Required software

The web application starter script relies on:
* [Python 3](installing_prerequisites.md#python)
* [Node.js and the node package manager (npm)](installing_prerequisites.md#nodejs-and-npm)

_Note: These are already installed if you followed [part 1 of the getting started guide](getting_started_p1.md)._

### Configuring the project directory

A script is available to automatically download, build, and launch sample monero-ts web applications in an application server.  To download and run the script:

1. Create a new folder to contain the project: `mkdir ~/monero-ts-sample-web-apps`
2. Enter the new directory: `cd ~/monero-ts-sample-web-apps`
3. Download and run the web app starter script: `bash <(curl -sL https://raw.githubusercontent.com/woodser/xmr-sample-app/master/bin/web_template_script.sh)`

Alternatively, you can [manually download](https://raw.githubusercontent.com/woodser/xmr-sample-app/master/bin/web_template_script.sh) the script then run it.

The script configures a project folder and serves sample web applications on port 9100. Open a web browser and navigate to http://localhost:9100 for links to the applications:
* "Offline wallet generator" shows off the final result of following this guide. To view the complete offline wallet generator code as a functioning web application, see "src/offline_wallet_generator.html" and "src/offline_wallet_generator.ts".
* "Sample code" demonstrates a handful of common monero-ts operations. Open the developer console to see the application's output.

_Note: In order for the server to reflect changes to source files, you need to stop it by pressing "ctrl-c" in the terminal where the server is running and then rebuild the application and restart the server by typing: `./bin/build_browser_app.sh`._

## Modifying the offline wallet generator to display in a browser

1. Navigate to the "./src/" directory.
2. Delete the files "offline_wallet_generator.html" and "offline_wallet_generator.ts". We'll be rewriting them from scratch.
3. Create the file "offline_wallet_generator.html" and insert the following:
    ```html
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Offline Wallet Generator</title>
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height">
      </head>
      <body>
        <script type="text/javascript" src="offline_wallet_generator.dist.js"></script>
      </body>
    </html>
    ```
    Take note of the line with the `<script>` element:
    `<script type="text/javascript" src="offline_wallet_generator.ts"></script>`
    This line will tell the browser to run your offline wallet generator program.
4. Save the file.
5. While still in the "src" directory, create the file "offline_wallet_generator.ts" and insert the following from [part 1 of this guide](getting_started_p1.md):
	```typescript
  import moneroTs from "monero-ts";
	
	main();
	async function main() {
	  
	  // create a random keys-only (offline) stagenet wallet
	  let walletKeys = await moneroTs.createWalletKeys({networkType: moneroTs.MoneroNetworkType.STAGENET, language: "English"});
	
	  // print wallet attributes
	  console.log("Seed phrase: " + await walletKeys.getSeed());
	  console.log("Address: " + await walletKeys.getAddress(0, 0)); // get address of account 0, subaddress 0
	  console.log("Spend key: " + await walletKeys.getPrivateSpendKey());
	  console.log("View key: " + await walletKeys.getPrivateViewKey());
	}
	```
7. Save the file.
8. Return to the project's root directory: `cd ..`
9. Run the build_browser_app.sh script to host the application on a server: `./bin/build_browser_app.sh`
    	
    _Note: The starter web application includes a second script - "start_dev_server.sh" - in the "./bin/" folder. start_dev_server.sh hosts the existing browser build on a server without rebuilding the application from the source files. You can run this script instead of "build_browser_app.sh" if you have not modified any of the files in the "./src/" directory._
10. Point a browser to http://localhost:9100/offline_wallet_generator.html to view the application.

The browser displays a blank page, because index.html is empty, and because the index.js does not add any output to the browser display. You can verify that the program runs exactly as it did as a Node.js application at the command line, however, by opening your browser's developer console.

### Creating HTML elements to display the wallet attributes

The wallet generator is now _technically_ running on a server, but the typical end user should not have to open the developer console to see the result. We need to modify the application to print the wallet attributes to the browser window instead.

Add "div" elements between the opening and closing "body" tags to display each wallet attribute: 

```html
    <div id="wallet_address"></div>
    <div id="wallet_seed_phrase"></div>
    <div id="wallet_spend_key"></div>
    <div id="wallet_view_key"></div>
```

### Assigning wallet attributes to display in the browser

Open offline_wallet_generator.ts and find the lines that the print the wallet attributes to the console:

```typescript
console.log("Seed phrase: " + await walletKeys.getSeed());
console.log("Address: " + await walletKeys.getAddress(0, 0)); // get address of account 0, subaddress 0
console.log("Spend key: " + await walletKeys.getPrivateSpendKey());
console.log("View key: " + await walletKeys.getPrivateViewKey());
```

Modify these lines to assign each string to its corresponding div element in index.html instead:

```html
// print the wallet's attributes in the browser window
document.getElementById("wallet_seed_phrase").innerHTML = "Seed phrase: " + await walletKeys.getSeed();
document.getElementById("wallet_address").innerHTML = "Address: " + await walletKeys.getAddress(0, 0); // get address of account 0, subaddress 0
document.getElementById("wallet_spend_key").innerHTML = "Spend key: " + await walletKeys.getPrivateSpendKey();
document.getElementById("wallet_view_key").innerHTML = "View key: " + await walletKeys.getPrivateViewKey();
```

The final HTML and JavaScript files should match the following:

### offline_wallet_generator.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Offline Wallet Generator</title>
    <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height">
  </head>
  <body>
    <div id="wallet_address"></div>
    <div id="wallet_seed_phrase"></div>
    <div id="wallet_spend_key"></div>
    <div id="wallet_view_key"></div>
    <script type="text/javascript" src="offline_wallet_generator.dist.js"></script>
  </body>
</html>
```

### offline_wallet_generator.ts

```typescript
import moneroTs from "monero-ts";

main();
async function main() {
  
  // create a random keys-only (offline) stagenet wallet
  let walletKeys = await moneroTs.createWalletKeys({networkType: moneroTs.MoneroNetworkType.STAGENET, language: "English"});
  
  // print the wallet's attributes in the browser window
  document.getElementById("wallet_seed_phrase").innerHTML = "Seed phrase: " + await walletKeys.getSeed();
  document.getElementById("wallet_address").innerHTML = "Address: " + await walletKeys.getAddress(0, 0); // get address at account 0, subaddress 0
  document.getElementById("wallet_spend_key").innerHTML = "Spend key: " + await walletKeys.getPrivateSpendKey();
  document.getElementById("wallet_view_key").innerHTML = "View key: " + await walletKeys.getPrivateViewKey();
}
```

Run `./bin/build_browser_app.sh` to rebuild the application and launch the server, then point your browser to http://localhost:9100/offline_wallet_generator.html. You should see the wallet's address, seed phrase, spend key, and view key displayed in the browser window.

## Running the application on your own application server

To host the application on your own application server, copy the contents of the "./browser_build" folder to the source directory for your application server.

For example, to host the application on a standard apache server: `cp ./browser_build/* [app_server_path]/var/www/html`

## Additional resources

Read through the rest of the developer guides to learn more about using monero-ts:

* [Creating wallets](./creating_wallets.md)
* [The data model: blocks, transactions, transfers, and outputs](./data_model.md)
* [Getting transactions, transfers, and outputs](./query_data_model.md)
* [Sending funds](./sending_funds.md)
* [Multisig wallets](./multisig_wallets.md)
* [View-only and offline wallets](./view_only_offline.md)
* [HTTPS and self-signed certificates](./https_and_self_signed_certificates.md)
