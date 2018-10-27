const WM = (function() {
    let data = (brain.length > 0) ? brain : [];
    let commands = function() {
        let cmd = [];
        data.forEach((value, index) => {
            cmd.push(Array.from(Object.keys(brain[index])))
        });
        return cmd;
    };
})();