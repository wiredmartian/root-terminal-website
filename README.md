## Terminal
Simple javascript web app that mimics the standard command line interface.


### Running
You must have Nodejs installed. Then use `npm` to install `webpack` and `webpack-dev-server`

`$ npm install -g webpack webpack` 

`$ npm install -g webpack-dev-server` 

`$ npm run build`


### Installation
If you wanna use this on your own application, then you'll need a tweak it based to your specs.
Do the following:

`$ npm run build:prod`

Locate the created `/dist` folder for `bundle.js` file and `main.css` file.

Include the files in your solution, .css in the <head> and .js before </body>:

~~~html
<link rel="stylesheet" href="dist/main.css">

<script src="dist/bundle.js"></script>
~~~

Create a container element for your terminal
~~~html
<div id="terminal-container"></div>
~~~

#### Initialinzing the app

~~~javascript
let options = { 
    root: "wiredmartian@user:~#",
    guest: "guest@user:~#",
    intro: "",
    source: "local", // remote or local
    prefix: "wm",
    commands: [{ os: "Linux"}]
    }
new Terminal("#commandInput", options);
~~~
