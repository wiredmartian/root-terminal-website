class Terminal {

    constructor (HTMLElementId, Options) {
        this.element = HTMLElementId;
        this.options = Options;

        this.defaults();

    }

    defaults() {
        let self = this;
        if (typeof self.element === "string") {
            let _htmlElement = document.querySelector(self.element);
            if (typeof _htmlElement !== "undefined") {
                self.element = _htmlElement;
            }
        }
    }

}

(function(el = HTMLElementId, ops = Options) {
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
})();
