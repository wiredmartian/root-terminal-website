import { firebaseconfig } from "./firebase.config";
import { terminalcommands } from "./data";
import Typed from 'typed.js';
import firebase from 'firebase';
import '../css/main.scss'
let _db;

function Terminal(element, options) {
    let _self = this;
    _self.options = options;
    _self.element = element;
    (function() {
        _loadTerminalHTML((res) => {
            if (res) {
                _defaults();
                _getOptions(_self.options);
            }
        });
    })();
    function _defaults() {
        /** HTML Element Selector */
        if (typeof _self.element === "string") {
            let _htmlElement = document.querySelector(_self.element);
            if (typeof _htmlElement !== "undefined" && _htmlElement !== null) {
                let isSmall = _htmlElement.localName;
                if (isSmall === "small") {
                    _self.element = _htmlElement;
                    /** attach listener on Enter */
                    _htmlElement.focus(); /** auto focus */
                    _self.element.addEventListener("keydown", _handleUserInput);
                }
            } else {
                console.info(`The element ${_self.element} was not found`);
            }
        } else {
            console.info(`${_self.element} unexpected element`);
        }
    }
    function _handleUserInput(e) {
        if (e.key === "Enter" && e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            let input = "";
            if (e.innerHTML === e.innerText) {
                input = _self.element.innerText;
            }

            if (typeof input !== "undefined" && input != null && input !== "") {
                let response;
                /** is input a clear()? */
                input = input.toLocaleLowerCase();
                if (input === "clear" || input === "clear()") {
                    _clearTerminal();
                    return;
                } else if (input === "help") {
                    response = help();
                } else {
                    response = _processTerminalInput(input)
                }
                createNewLine(response);
            }
        }
    }
    function _clearTerminal() {
        let _parent = document.querySelector('.lines');
        let _lines = Array.from(document.querySelectorAll('.line'));
        _lines.forEach((value, index) => {
            if (_lines.length - 1 !== index) {
                _parent.removeChild(_lines[index]);
            }
        });
        document.querySelector("#typewriter").classList.add("hidden");
        document.querySelector("span.typed-cursor").classList.add("hidden");
        _self.element.innerText = "";
        _self.element.innerHTML = "";
    }
    function _checkOutputIsHTML(output) {
        return /<[a-z][\s\S]*>/.test(output);
    }

    function createNewLine(res) {
        let last_el = _getLastLineElement(); // get last element
        let new_node = last_el.cloneNode(true); //clone last element
        let new_input = new_node.querySelector('#commandInput'); // get input of the new element (cloned)
        if (new_input) {
            /** TODO: this line is too much dependent on the DOM */
            new_input.parentElement.firstElementChild.innerText = _self.options.root; // set its innerhtml to root (root@user)
            new_input.parentElement.firstElementChild.classList.add('prefix-root'); // add a class to style the 'root@user' text
            new_input.innerHTML = res;
            /*new_input.innerText = res;*/
        }
        last_el.after(new_node);

        _killElementAfterCloning(last_el, () => {
            let _last_line = _getLastLineElement();
            let _new_node = _last_line.cloneNode(true);
            let _new_input = _new_node.querySelector('#commandInput');
            if (_new_input) {
                _new_input.parentElement.firstElementChild.innerText = _self.options.guest;
                _new_input.parentElement.firstElementChild.classList.remove('prefix-root');
                _new_input.innerHTML = "_";
                _new_input.innerText = "_";
                _last_line.after(_new_node);
                _killElementAfterCloning(_last_line, null);
            }
            _self.element = _new_input;
            _attachEventToNewInputElement(_new_input)
        });
    }

    function _getLastLineElement() {
        let lines = Array.from(document.querySelectorAll('.line'));
        return lines[lines.length - 1];
    }

    function _killElementAfterCloning(el, callback) {
        let old_el = el.querySelector('#commandInput');
        if (old_el) {
            /** detach event listener */
            _detachEventOnElement(old_el);
            old_el.removeAttribute("contenteditable");
            old_el.removeAttribute("id");
            old_el.disabled = true;
        }
        if (callback) { callback(); }
    }
    function _detachEventOnElement(el) {
        el.removeEventListener("keydown", _handleUserInput, false);
    }
    function _attachEventToNewInputElement(el) {
        el.addEventListener("keydown", _handleUserInput);
    }

    function _getOptions(opts) {
        let options = new Object({
            root: "wiredmartian@user:~#",
            guest: "guest@user:~#",
            intro: "",
            source: "local", // remote or local
            prefix: "wm",
            commands: [{ os: "Linux"}]
        });
        Object.assign(options, opts);
        _self.options = options;
        /** no commands passed */
        if (!opts.commands) {
            if (opts.source) {
                _getDataSource();
            }
        }
    }

    function _isPrefixValid(prefix) {
        let _prefix = prefix.toString().toLowerCase().trim();
        return (_prefix === _self.options.prefix);
    }

    function _getPrefixFromInput(input) {
        return input.toString().trim().split(" ")[0].trim();
    }

    function _getTerminalCommands() {
        let cmd = [];
        _self.options.commands.map((value) => {
            cmd.push(Array.from(Object.keys(value)));
        });
        return cmd;
    }
    function _processTerminalInput(input) {
        let arr = _getTerminalCommands();
        let result = "";
        if (arr.length !== 0 && typeof(input) !== 'undefined') {
            result =`\"${ input }\" is not recognized as an internal or external command, operable program or batch file.`;
            let _prefix = _getPrefixFromInput(input);
            if (!_isPrefixValid(_prefix)) {
                return result;
            } else {
                input = input.split(" ")[1].toString().trim();
            }
            for (let index in arr) {
                if (arr[index].toString().includes(input.toLocaleLowerCase())) {
                    result = Object.values(_self.options.commands[index])[0];
                    break;
                }
            }
        }
        return result;
    }

    function _loadTerminalHTML(callback) {
        // language=HTML
        let _template = "<div class='window-title-bar'>root@wiredmartian:~</div>\n" +
            "<div id='window' class='terminal'>\n" +
            "    <div class='typewriter-container'><span id='typewriter'></span></div>\n" +
            "    <div class='lines'>\n" +
            "        <div class='line'>\n" +
            "            <span class='prefix'>guest@user:~# </span>\n" +
            "            <span></span>\n" +
            "            <small id='commandInput' class='caret' contenteditable='true' spellcheck='false'>_</small>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "</div>";

        let _container = document.querySelector("#terminal-container");
        if (_container && _checkOutputIsHTML(_template)) {
            _container.innerHTML = _template;
            initializeTyping();
            callback(true);
        } else {
            callback();
        }
    }
    function initializeTyping() {
        let intro = "<small>Terminal is a simple javascript mini library that mimics the standard terminal (win + linux). ^1000" +
            "Use the <span class='prefix-root'>$ help</span> command to view all the available commands. ^1000" +
            "Use <span class='prefix-root'>$ clear()</span> to clear this message</small>";

        /** wait for options init before running typed.js */
        if (typeof (_self.options.intro) !== "undefined" && _self.options.intro !== "") {
            intro = _self.options.intro;
        }
        animateTyping(intro);
    }

    function help() {
        /** do help things here*/
        let html = "<br><strong>Use the commands below to query info: </strong><br>";
        const prefix = _self.options.prefix;
        Array.from(_self.options.commands).map(item => {
            let _key = Object.keys(item);
            html += `<span class="prefix-root">${ prefix +' '+ _key }</span><br>`;
        });
        html += "<strong>To clear the terminal, use <b>clear</b></strong>";
        return html;
    }

    function getIntroFromOptions() {
        let _intro = _self.options.intro;
        if (_intro && _self.options.intro.constructor === Array) {
            return _intro;
        }
        return undefined;
    }
    function animateTyping(intro) {
        let _intro = getIntroFromOptions();
        if (_intro) {
            intro = _intro;
        } else {
            intro = Array.from(intro); // Touch ye NOT, this piece of code. What??
        }

        let options = {
            strings: intro,
            startDelay: 1000,
            typeSpeed: 50,
            backSpeed: 20,
            cursorChar: '_'
        };
        initTyped(options);
    }
    function initTyped(opts) {
        new Typed("#typewriter", opts);
    }
    function _initFirebase () {
        firebase.initializeApp(firebaseconfig);
        _db = firebase.firestore();
        _db.settings({ timestampsInSnapshots: true });
        if (!firebase.apps.length) {
            console.info("firebase is not initialized");
        } else {
            console.info("firebase is already initialized");
        }
    }
    function getRemoteCommands() {
        let _commandsRef = _db.collection("commands");
        _commandsRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                _commandsRef.doc(`${doc.id}`).get().then((snapshot) => {
                    if (snapshot.exists) {
                        _self.options.commands = Object.entries(snapshot.data().commands).map((item) => {
                            let key = item[0], val = item[1];
                            return {[key]: val};
                        });
                        console.info(_self.options.commands);
                    }
                });
            });
        });
    }
    function _getDataSource() {
        let source = _self.options.source;
        /** no source specified */
        if (source) {
            switch (source) {
                case "local" :
                    _self.options.commands = terminalcommands;
                    console.info(_self.options.commands);
                    break;
                case "remote" :
                    _initFirebase();
                    getRemoteCommands();
                    break;
                default:
                    _self.options.commands = terminalcommands;
            }
        } else {
            console.info("no data source specified");
        }
    }
}
new Terminal("#commandInput", {
    intro:[
        "<h1>Hello 👋 </h1>^800" +
        "My name is <b>Solomzi Jikani</b> aka the <span class='prefix-root'>wiredmartian</span>.<br>^800" +
        "I'm a <b>web developer</b> based in Durban, originally from Port St Johns.<br>^800" +
        "I build <b>web apps</b> using <span class='prefix-root'>JavaScript, Angular 2+, .NET</span> and <span class='prefix-root'>Nodejs.</span><br>^800" +
        "I have some experience with <span class='prefix-root'>NativeScript </span> and <span class='prefix-root'>Ionic</span> for building <b>hybrid mobile apps</b>.<br>^800" +
        "I'm currently employed as a <b>front-end developer</b>. But my contacts are below for any enquiry.<br>^800<br>" +
        "<h2>Contacts:</h2>" +
        "<strong> +27 71 786 2455</strong> | <strong> solomzi.jikani@gmail.com</strong><br>" +
        "<a class='contact-link' href='https://github.com/wiredmartian' target='_blank'>Github</a>" +
        "<a class='contact-link' href='#' target='_blank'>Blog</a>" +
        "<a class='contact-link' href='https://twitter.com/wiredmartian' target='_blank'>Twitter</a>" +
        "<a class='contact-link' href='https://instagram.com/wiredmartian' target='_blank'>Instagram</a>" +
        "<a class='contact-link' href='https://www.linkedin.com/in/solomzi-jikani' target='_blank'>LinkedIn</a>"
    ],
    source: "remote"
});
