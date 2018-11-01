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
            console.log("_defaults():", _htmlElement);
            if (typeof _htmlElement !== "undefined") {

                let isInput = _htmlElement.localName;
                if (isInput === "input") {
                    Terminal.element = _htmlElement;
                    /** attach listener on Enter */
                    Terminal.element.addEventListener("keydown", handleUserInput);
                }
            }
        }

    }
    function handleUserInput(e) {
        if (e.key === "Enter" && e.keyCode === 13 && e.isTrusted) {
            let input = Terminal.element.value;

            if (typeof input !== "undefined" && input !== "") {
                let response = _processTerminalInput(input);
                createNewLine(response);
            }
        }
    }
    
    function createHTMLElement() {
        let newelement = document.createElement("span");
        let node = `<span class=\"prefix\"> ${Terminal.options.root} </span>`;
        newelement.textContent = Terminal.options.root;
        newelement.className = "prefix"
        createNewLine();
    }

    function createNewLine(res) {
        console.log(`createNewLine(): ${res}`);
        let lines = Array.from(document.querySelectorAll('.line'));
        let last_el = lines[lines.length - 1];
        let new_node = last_el.cloneNode(true);
        let new_input = new_node.querySelector('input#commandInput');
        if (new_input) {
            /** TODO: this line is too much dependent on the DOM */
            new_input.parentElement.firstElementChild.innerText = Terminal.options.root;
            new_input.value = res;
            new_input.autofocus = true;
        }
        Terminal.element = new_input;
        last_el.after(new_node)
        _killElementAfterCloning(last_el)
        _attachEventToNewInputElement(new_input)
    }

    function _killElementAfterCloning(el) {
        let old_el = el.querySelector('input#commandInput');
        if (old_el) {
            /** detach event listener */
            console.log("kil():");
            _detachEventOnElement(old_el);
            old_el.removeAttribute("id");
            old_el.removeAttribute("name");
            old_el.disabled = true;
        }
    }
    function _detachEventOnElement(el) {
        el.removeEventListener("keydown", handleUserInput, false);
    }
    function _attachEventToNewInputElement(el) {
        el.addEventListener("keydown", handleUserInput);
    }

    function _getOptions(opts) {
        let options = new Object({
            root: "root@ubuntu",
            guest: "guest@ubuntu",
            into: ["Leave as null", "if you don't want bio"],
            bg_color: "green",
            commands: [
                { realname: "wiredmartian"},
                { dob: "September 29, 0001"}
            ]
        });
        Object.assign(options, opts);
        Terminal.options = options;
    }

    function _getTerminalCommands() {
        let data = (Terminal.options.commands.length > 0) ? Terminal.options.commands : [];
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
            for (let index in arr) {
                if (arr[index].toString().includes(input.toLocaleLowerCase())) {
                    result = Object.values(Terminal.options.commands[index])[0];
                    break;
                }
            }
        }
        return result;
    }
    Terminal("#commandInput", {root: "root@user", bg_color: "red"});
    return Terminal;
})();

