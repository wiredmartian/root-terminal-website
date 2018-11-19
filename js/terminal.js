'use strict';
function Terminal(element, options) {
    let _self = this;
    _self.options = options;
    _self.element = element;
    let _xhttp = new XMLHttpRequest();
    _loadTerminalHTML(function (res) {
        if (res) {
            _defaults();
            _getOptions(_self.options);
            dragElement("#terminal-window");
        }
    });

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
            }
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
                /** is input a clear()? */
                if (input.toLowerCase() === "clear" || input.toLowerCase() === "clear()") {
                    _clearTerminal();
                    return;
                }
                let response = _processTerminalInput(input);
                createNewLine(response);
            }
        }
    }
    function _clearTerminal() {
        let _parent = document.querySelector('.terminal-content');
        let _lines = Array.from(document.querySelectorAll('.line'));
        _lines.forEach((value, index) => {
            if (_lines.length - 1 !== index) {
                _parent.removeChild(_lines[index]);
            }
        });
        document.querySelector("#typewriter").classList.add("hidden");
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
        
        _killElementAfterCloning(last_el, function(){
            let _last_line = _getLastLineElement();
            let _new_node = _last_line.cloneNode(true);
            let _new_input = _new_node.querySelector('#commandInput');
            if (_new_input) {
                _new_input.parentElement.firstElementChild.innerText = _self.options.guest;
                _new_input.parentElement.firstElementChild.classList.remove('prefix-root');
                _new_input.innerHTML = "...";
                _new_input.innerText = "...";
                _new_input.focus();
                _last_line.after(_new_node);
                _killElementAfterCloning(_last_line, null);
            }
            _self.element = _new_input;
            _attachEventToNewInputElement(_new_input)
        })
        
    }

    function _getLastLineElement() {
        let lines = Array.from(document.querySelectorAll('.line'));
        return lines[lines.length - 1];
    }

    function _killElementAfterCloning(el, cb) {
        let old_el = el.querySelector('#commandInput');
        if (old_el) {
            /** detach event listener */
            _detachEventOnElement(old_el);
            old_el.removeAttribute("contenteditable");
            old_el.removeAttribute("id");
            old_el.disabled = true;
        }
        if (cb) { cb(); }
    }
    function _detachEventOnElement(el) {
        el.removeEventListener("keydown", _handleUserInput, false);
    }
    function _attachEventToNewInputElement(el) {
        el.addEventListener("keydown", _handleUserInput);
    }

    function _getOptions(opts) {
        let _cmds = _self.options.commands;
        if (_cmds && _self.options.commands.constructor === Array) { // Array of objects
            window.commands = _cmds;
        }
        let options = new Object({
            root: "root@user:~#",
            guest: "guest@user:~#",
            intro: ["Leave as null", "if you don't want bio"],
            prefix: "wm",
            commands: window.commands
        });
        Object.assign(options, opts);
        _self.options = options;
    }

    function _isPrefixValid(prefix) {
        let _prefix = prefix.toString().toLowerCase().trim();
        return (_prefix === _self.options.prefix);
    }

    function _getPrefixFromInput(input) {
        return input.toString().trim().split(" ")[0].trim();
    }

    function _getTerminalCommands() {
        let data = (window.commands.length > 0) ? window.commands : [{}];
        let cmd = [];
        data.forEach((value) => {
            cmd.push(Array.from(Object.keys(value)));
        });
        return cmd;
    }
    function _processTerminalInput(input = "dob") {
        let arr = _getTerminalCommands();
        let result = "";
        if (arr.length !== 0 && typeof(input) !== undefined) {
            result =`\"${ input }\" is not recognized as an internal or external command, operable program or batch file.`;

            let _prefix = _getPrefixFromInput(input);
            if (!_isPrefixValid(_prefix)) {
                return result;
            } else {
                input = input.split(" ")[1].toString().trim();
            }
            for (let index in arr) {
                if (arr[index].toString().includes(input.toLocaleLowerCase())) {
                    result = Object.values(window.commands[index])[0];
                    break;
                }
            }
        }
        return result;
    }

    /** make the terminal draggable */

    function dragElement(el) {
        el = document.querySelector(el);
        let _titleblock = document.querySelector("#window-title-bar");

        let position1 = 0, position2 = 0, position3 = 0, position4 = 0;
        if (_titleblock) {
            _titleblock.onmousedown = dragMouseDown;
        } else {
            el.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            position3 = e.clientX;
            position4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            position1 = position3 - e.clientX;
            position2 = position4 - e.clientY;
            position3 = e.clientX;
            position4 = e.clientY;
            el.style.top = (el.offsetTop - position2) + "px";
            el.style.left = (el.offsetLeft - position1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function _loadTerminalHTML(cb) {
        _xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                let _container = document.querySelector("#terminal-container");
                if (_container && _checkOutputIsHTML(this.responseText)) {
                    _container.innerHTML = this.responseText;
                    initializeTyping();
                    cb(true);
                }
                cb();
            }
        };
        _xhttp.open("GET", "../_htmlsnippets/_terminal.html", true);
        _xhttp.send();
    }
    function initializeTyping() {
        let intro = "";
        _xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                intro = this.responseText;
                animateTyping(intro)
            }
        };
        _xhttp.open("GET", "../_htmlsnippets/_intro.html", true);
        _xhttp.send();
    }

    function help() {
        /** do help things here*/
    }

    function initTyped(opts) {
        if (window.Typed) {
            new Typed("#typewriter", opts);
        }
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
            intro = Array.from(intro.split(",")); // Touch ye NOT, this piece of code. What??
        }

        let options = {
            strings: intro,
            startDelay: 1000,
            typeSpeed: 40,
            backSpeed: 10,
            cursorChar: '_'
        };
        initTyped(options);
    }
}

//new Terminal("#commandInput",{});

