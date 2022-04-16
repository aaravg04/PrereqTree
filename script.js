// no longer using wallpapered instructions, gave weird type selecting thingy
// var textAreaChecker = setInterval(checkTArea, 10);

var courses;
// very helpful - https://www.codegrepper.com/code-examples/javascript/How+to+access+return+value+of+promise
fetch("https://gt-scheduler.github.io/crawler/202208.json")
    .then(response => {return response.json();})
    .then((obj) => {courses = obj.courses});

function checkTArea() {
    if(document.getElementById("course").value != '') {
        document.getElementById("bkgdtxt").style.visibility = "hidden";
    } else {
        document.getElementById("bkgdtxt").style = "";
    }
}

function buildTree() {
    var course = document.getElementById("course").value
    // assuming that the course was entered in correct format (uppercase tag MATH/CS/ACCT/HUM/etc..) because i don't want to deal with an autocomplete rn
    // i can barely do js and webdev, much less an actual autocompleter (efficiently at least)
    
    // TODO: need to figure out how to strip tailing spaces so that both "CS 1331" and "CS 1331 " pass

    if (!(course in courses)) {
        alert("Error! Course not found in Fall 2022 Course list. Try checking if you typed it correctly and if there are any trailing/leading spaces")
    }
}