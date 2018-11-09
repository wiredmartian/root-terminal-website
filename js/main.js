dragElement(document.getElementById("terminal-window"));

let bio = [
    "Oh, hello there^500, Welcome!^1000",
    "I am the wiredmartian, a <b>software developer</b> based in Durban, South Africa.\n^500" +
    "I mostly specialize in <b>JavaScript^300</b>, with <b>Angular</b> as framework of choice.^500",
    "I also write <b>NodeJS</b> and <b>C#</b> code^1000. I have about 1.5 years of experience in the field of software development.\n" +
    "^1500I'd be a millionaire^1000 if only...^1000 if only I could finish my side projects.",
    "If you wanna know more about me, type in any of the commands listed below. Leave out the <b>$</b> sign",
    "<strong>commands:</strong><br>^500<br>^1000" +
    "<strong>$ wm realname</strong><br>" +
    "<strong>$ wm education</strong><br>" +
    "<strong>$ wm contacts</strong><br>" ];

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById("window-title-bar")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById("window-title-bar").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


/*typing animation */
animateTyping();
function animateTyping() {
    let typeheaderOptions = {
        strings: bio,
        startDelay: 1000,
        typeSpeed: 40,
        backSpeed: 10,
        cursorChar: '_'
    };

    new Typed("#typewriter", typeheaderOptions);
}