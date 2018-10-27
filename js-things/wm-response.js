const WM = (function() {
    let data = (brain.length > 0) ? brain : [];
    let commands = function() {
        let cmd = [];
        data.forEach((value) => {
            cmd.push(Array.from(Object.keys(value)));
        });
        return cmd;
    };
    let usercommand = function (input) {
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
        input: function (input) {
            return usercommand(input);
        }
    }
})();