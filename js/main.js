
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