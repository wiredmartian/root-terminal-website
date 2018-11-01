
const Terminal = (function () {
    const Terminal = function (HTMLElementId, Options) {
        this.element = HTMLElementId;
        _defaults();
        _getOptions(Options);
    };

    function _defaults() {
        /** HTML Element Selector */
        if (typeof this.element === "string") {
            let _htmlElement = document.querySelector(this.element);
            console.log(_htmlElement);
            if (typeof _htmlElement !== "undefined") {

                let isInput = _htmlElement.localName;
                if (isInput === "input") {
                    Terminal.element = _htmlElement;
                    /** attach listener on Enter */
                    Terminal.element.addEventListener("keydown", function (e) {
                        handleUserInput(e)
                    });
                }
            }
        }

    }
    function handleUserInput(e) {
        if (e.key === "Enter" && e.keyCode === 13) {
            let input = Terminal.element.value;

            if (typeof input !== "undefined" && input !== "") {
                _processTerminalInput(input);
            }
        }
    }

    function _getOptions(opts) {
        let self = this;

        let options = new Object({
            root: "root@ubuntu",
            guest: "guest@ubuntu",
            into: ["Leave as null", "if you don't want bio"],
            bg_color: "green"
        });
        Object.assign(options, opts);
        self.options = options;
        console.log(self.options)
    }

    function _getTerminalCommands() {
        let data = (window.commands.length > 0) ? window.commands : [];
        let cmd = [];
        data.forEach((value) => {
            cmd.push(Array.from(Object.keys(value)));
        });
        return cmd;
    }
    function _processTerminalInput(input = "dob") {
        let arr = _getTerminalCommands();
        if (arr.length !== 0 && typeof(input) !== undefined) {
            arr.forEach((value, index) => {
                if (value[0].toString().includes(input)) {
                    let res = Object.values(window.commands[index])[0];
                    console.log(res);
                } else {
                    console.log(`\"${ input }\" is not recognized as an internal or external command`);
                }
            })
        }
    }

    return Terminal;
})();

