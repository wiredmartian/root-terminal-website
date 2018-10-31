class Terminal {

    constructor (HTMLElementId, Options) {
        this.element = HTMLElementId;
        this.defaults();
        this.getOptions(Options);
    }

    defaults() {
        let self = this;

        /** HTML Element Selector */
        if (typeof self.element === "string") {
            let _htmlElement = document.querySelector(self.element);
            if (typeof _htmlElement !== "undefined") {
                self.element = _htmlElement;
            }
        }
    }

    getOptions(opts) {
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

    getTerminalCommands() {
        let data = (window.commands.length > 0) ? window.commands : [];
        let cmd = [];
        data.forEach((value) => {
            cmd.push(Array.from(Object.keys(value)));
        });
        return cmd;
    }
    proccessTerminalInput(input = "dob") {
        let arr = this.getTerminalCommands();
        if (arr.length !== 0 && typeof(input) !== undefined) {
            arr.forEach((value, index) => {
                if (value[0].toString().includes(input)) {
                    let res = Object.values(window.commands[index])[0];
                    console.log(res);
                }
            })
        }
    }
}

/** (function(el = HTMLElementId, ops = Options) {
    let element = el;
    let options = Object.create({
        color: 'green'
    });
    let defaults = () => {
        if (typeof element === "string") {
            let _htmlElement = document.querySelector(element);
            if (typeof _htmlElement !== "undefined") {
                element = _htmlElement;
            }
        }
    };
    defaults();

    let data = (brain.length > 0) ? brain : [];
    let commands = () => {
        let cmd = [];
        data.forEach((value) => {
            cmd.push(Array.from(Object.keys(value)));
        });
        return cmd;
    };
    let usercommand = (input) => {
        let arr = commands();
        if (arr.length !== 0 && typeof(input) !== undefined) {
            arr.forEach((value, index) => {
                if (value[0].toString().includes(input)) {
                    let res = Object.values(data[index])[0];
                    console.log(res);
                }
            })
        }
    };
    return {
        commands: commands(),
        input:  (input) => {
            return usercommand(input);
        },
        HTMLElement: element
    }
})(); */