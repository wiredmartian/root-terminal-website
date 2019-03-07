import { firebaseconfig } from "./firebase.config";
import { terminalcommands } from "./data";
import Typed from 'typed.js';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import '../css/main.scss'
let _db, _storage;

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
                    _activateInput();
                    _onInputBlur();
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
                _deactivateInput();
                createNewLine(response);
            } else {
                console.error('You have entered an invalid input');
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
        console.log(typeof(res));
        let last_el = _getLastLineElement(); // get last element
        let new_node = last_el.cloneNode(true); //clone last element

        /** element to handle root response from user input */
        let response_el = new_node.querySelector('#commandInput'); // get input of the new element (cloned)
        if (response_el) {
            /** TODO: this line is too much dependent on the DOM */
            response_el.parentElement.firstElementChild.innerText = _self.options.root; // set its innerhtml to root (root@user)
            response_el.parentElement.firstElementChild.classList.add('prefix-root'); // add a class to style the 'root@user' text

            if (typeof(res) !== 'string') {
                res.then(function(url) {
                    response_el.innerHTML = url;
                });
            } else {
                if (_checkOutputIsHTML(res)) {
                    response_el.innerHTML = res;
                } else {
                    response_el.innerText = res;
                }
            }
            pageScroll();
        }
        last_el.after(new_node);

        _killElementAfterCloning(last_el, () => {
            let _last_line = _getLastLineElement();
            let _new_node = _last_line.cloneNode(true);
            let _new_input = _new_node.querySelector('#commandInput');
            if (_new_input) {
                _new_input.parentElement.firstElementChild.innerText = _self.options.guest;
                _new_input.parentElement.firstElementChild.classList.remove('prefix-root');
                _new_input.innerHTML = "";
                _new_input.innerText = "";
                _last_line.after(_new_node);
                _killElementAfterCloning(_last_line, null);
            }
            _self.element = _new_input;
            _attachEventToNewInputElement(_new_input);
            _activateInput();
            _onInputBlur();
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
            root: "wiredmartian@user:~ $",
            guest: "guest@user:~ $",
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
        let pendingGifPromise = getPanicGif();
        if (arr.length !== 0 && typeof(input) !== 'undefined') {
            let _prefix = _getPrefixFromInput(input);
            if (!_isPrefixValid(_prefix)) {
                return pendingGifPromise.then(function(img) {
                    return `<span style='color:red'>\"${ input }\" is not recognized as an internal or external command, operable program or batch file.</span><br><img class='git-image' src=${img}/>`;
                });
            } else {
                /** no keyword used after prefix */
                input = input.split(" ");
                if (input[1]) {
                    /** check command after the prefix is valid */
                    input = input[1].toString().trim()
                } else {
                    result = help();
                    return result;
                }
            }
            for (let index in arr) {
                if (arr[index].toString().includes(input.toLocaleLowerCase())) {
                    result = Object.values(_self.options.commands[index])[0];
                    break;
                }
            }
        }
        if (!result) {
            // `\"${ input }\" is not recognized as an internal or external command, operable program or batch file.`
            return pendingGifPromise.then(function(img) {
                return `<span style='color:red'>\"${ input }\" is not recognized as an internal or external command, operable program or batch file.</span><br><img class='git-image' src=${img}/>`;
            });
        } else {
            return result;
        }
    }
    function _loadTerminalHTML(callback) {
        // language=HTML
        let _template = "<div class='window-title-bar'>wiredmartian:~ $</div>\n" +
            "<div id='window' class='terminal'>\n" +
            "    <div class='typewriter-container'><span id='typewriter'></span></div>\n" +
            "    <div class='lines'>\n" +
            "        <div class='line'>\n" +
            "            <span class='prefix'>guest@user:~ $ </span>\n" +
            "            <span></span>\n" +
            "            <small id='commandInput' class='caret' contenteditable='true' spellcheck='false'></small>\n" +
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
        _storage = firebase.storage();
        _db.settings({ timestampsInSnapshots: true });
        if (!firebase.apps.length) {
            console.info("firebase is not initialized");
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
                    }
                });
            });
        });
    }
    function _activateInput() {
        _self.element.addEventListener('click', function () {
            _self.element.classList.add('active');
        });
    }
    function _deactivateInput() {
        _self.element.classList.remove('active');
    }
    function _onInputBlur() {
        _self.element.addEventListener('blur', function () {
            _self.element.classList.remove('active');
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
    function _getRandomInt(maxnumber) {
        return Math.floor(Math.random() * Math.floor(maxnumber));
    }
     function getPanicGif() {
        let gif = _getRandomInt(10) + '.gif';
        return _storage.ref('panic/' + gif).getDownloadURL()
        .then(function(url) {
            return url
        }).catch(function(err) {
            return '';
        });
    }
    function pageScroll() {
        window.scrollBy(0,1);
        let scrollDelay = setTimeout(pageScroll,10)
        window.onmousewheel = function () {
            clearTimeout(scrollDelay);    
        };
        
    }
}
new Terminal("#commandInput", {
    intro:[
        "<h1>Hello 👋 </h1>^800" +
        "My name is <b>Solomzi Jikani</b> aka the <span class='prefix-root'>Wired Martian</span>.<br>^800" +
        "I'm a <b>web developer</b> based in Durban, originally from Port St Johns.<br>^800" +
        "I build <b>web apps</b> using <span class='prefix-root'>JavaScript, Angular 2+, .NET</span> and <span class='prefix-root'>Nodejs.</span><br>^800" +
        "I have some experience with <span class='prefix-root'>NativeScript </span> and <span class='prefix-root'>Ionic</span> for building <b>hybrid mobile apps</b>.<br>^600" +
        "<b><a target='_blank' href='https://drive.google.com/file/d/12p_aFwSiqziIQIJYyxuThod76kpXa_6g/view?usp=sharing'>Download my full resume </a></b> for more information about myself.<br>^800<br>" +
        "<h2>Contacts:</h2>" +
        "<strong> +27 71 786 2455</strong> | <strong> solomzi.jikani@gmail.com</strong> | <strong> madcoder@wiredmartian.co.za</strong><br>" +
        "<a class='contact-link' href='https://github.com/wiredmartian' target='_blank'>github</a>" +
        "<a class='contact-link' href='#' target='_blank'>blog</a>" +
        "<a class='contact-link' href='https://twitter.com/wiredmartian' target='_blank'>twitter</a>" +
        "<a class='contact-link' href='https://instagram.com/wiredmartian' target='_blank'>instagram</a>" +
        "<a class='contact-link' href='https://www.youtube.com/channel/UCxMBdiwRylKoT_KUstcgsNg/videos' target='_blank'>YouTube</a><br><br>^800" +
        "Click on 'start typing..' and type 'wm' to see all the commands you can execute 😊"
    ],
    source: "remote"
});
