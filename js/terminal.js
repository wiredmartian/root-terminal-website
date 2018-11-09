const Terminal = (function () {
    const Terminal = function (HTMLElementId, Options) {
        this.element = HTMLElementId;
        this.options = {};
        _defaults();
        _getOptions(Options);
    };

    function _defaults() {
        /** HTML Element Selector */
        if (typeof this.element === "string") {
            let _htmlElement = document.querySelector(this.element);
            if (typeof _htmlElement !== "undefined" && _htmlElement !== null) {
                let isSpan = _htmlElement.localName;
                if (isSpan === "span") {
                    Terminal.element = _htmlElement;
                    console.log(_htmlElement);
                    /** attach listener on Enter */
                    Terminal.element.addEventListener("keydown", _handleUserInput);
                }
            }
        }

    }
    function _handleUserInput(e) {

        if (e.key === "Enter" && e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            let input = "";
            if (e.innerHTML === e.innerText) {
                input = Terminal.element.innerText;
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
        Terminal.element.value = "";
    }
    function _checkOutputIsHTML(output) {
        return /<[a-z][\s\S]*>/.test(output);
    }


    function createNewLine(res) {

        if (_checkOutputIsHTML(res)) {
            let container = document.querySelector('.container');
            let el = document.createElement('div');
            el.innerHTML = res;
            container.appendChild(el.firstElementChild);
            return;
        }
        let last_el = _getLastLineElement(); // get last element
        let new_node = last_el.cloneNode(true); //clone last element
        let new_input = new_node.querySelector('#commandInput'); // get input of the new element (cloned)
        if (new_input) {
            console.log(new_input);
            /** TODO: this line is too much dependent on the DOM */
            new_input.parentElement.firstElementChild.innerText = Terminal.options.root; // set its innerhtml to root (root@user)
            new_input.parentElement.firstElementChild.classList.add('prefix-root'); // add a class to style the 'root@user' text
            new_input.innerHTML = res;
            new_input.innerText = res;
        }
        last_el.after(new_node);
        
        _killElementAfterCloning(last_el, function(){
            console.log('confirm kill():');
            let _last_line = _getLastLineElement();
            let _new_node = _last_line.cloneNode(true);
            let _new_input = _new_node.querySelector('#commandInput');
            if (_new_input) {
                _new_input.parentElement.firstElementChild.innerText = Terminal.options.guest;
                _new_input.parentElement.firstElementChild.classList.remove('prefix-root');
                _new_input.innerHTML = "...";
                _new_input.innerText = "...";
                _new_input.autofocus = true;
                _last_line.after(_new_node);
                _killElementAfterCloning(_last_line, null);
            }
            Terminal.element = _new_input;
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
        let options = new Object({
            root: "root@user:~#",
            guest: "guest@user:~#",
            into: ["Leave as null", "if you don't want bio"],
            bg_color: "green",
            prefix: "wm",
            commands: window.commands
        });
        Object.assign(options, opts);
        Terminal.options = options;
    }

    function _isPrefixValid(prefix) {
        let _prefix = prefix.toString().toLowerCase().trim();
        console.log("getPrefix():", _prefix);
        return (_prefix === Terminal.options.prefix);
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
            result =`\"${ input }\" is not recognized as an internal or external command`;

            let _prefix = _getPrefixFromInput(input);
            if (!_isPrefixValid(_prefix)) {
                console.log("isPrefixValid():", _prefix);
                return result;
            } else {
                input = input.split(" ")[1].toString().trim();
                console.log("newINput():")
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
    Terminal("#commandInput",{});
    return Terminal;
})();

