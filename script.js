// no longer using wallpapered instructions, gave weird type selecting thingy
// var textAreaChecker = setInterval(checkTArea, 10);

var courses;
// very helpful - https://www.codegrepper.com/code-examples/javascript/How+to+access+return+value+of+promise
fetch("https://gt-scheduler.github.io/crawler/202208.json")
    .then(response => {return response.json();})
    .then((obj) => {courses = obj.courses});

const ref  = { 
                "and": "any of: ",
                "or": "all of: "
            };

var chart = anychart.wordtree([{}], "as-tree");

var mode = true;


// useless
function checkTArea() {
    if(document.getElementById("course").value != '') {
        document.getElementById("bkgdtxt").style.visibility = "hidden";
    } else {
        document.getElementById("bkgdtxt").style = "";
    }
}

function visualToggle() {
    // toggle from light to dark mode or other way around

    if(mode) {
        chart.background().fill("#000000");
        document.body.style.backgroundColor = "black";
        document.getElementById("modeswitcher").innerHTML = "Toggle Light Mode"
        document.getElementById("info").style.color = "#7c868e";
        document.getElementById("course").style.backgroundColor = "black";
        document.getElementById("course").style.color = "#7c868e";
        document.getElementById("submit").style.backgroundColor = "black";
        document.getElementById("submit").style.color = "#7c868e";

        mode = false;
    } else {

        chart.background().fill("#ffffff");
        document.body.style.backgroundColor = "white";
        document.getElementById("modeswitcher").innerHTML = "Toggle Dark Mode"
        document.getElementById("info").style.color = "black";
        document.getElementById("course").style.backgroundColor = "white";
        document.getElementById("course").style.color = "black";
        document.getElementById("submit").style.backgroundColor = "";
        document.getElementById("submit").style.color = "black";

        mode = true;
    }
    chart.draw();

}

function buildTree() {

    document.getElementById("visCont").innerHTML = "";

    var course = document.getElementById("course").value;
    // assuming that the course was entered in correct format (uppercase tag MATH/CS/ACCT/HUM/etc..) because i don't want to deal with an autocomplete rn
    // i can barely do js and webdev, much less an actual autocompleter (efficiently at least)
    
    // TODO: need to figure out how to strip tailing spaces so that both "CS 1331" and "CS 1331 " pass

    if (!(course in courses)) {
        alert("Error! Course not found in Fall 2022 Course list. Try checking if you typed it correctly and if there are any trailing/leading spaces");
        return;
    }

    // var root = new node(course, courses[course][2]);
    // console.log(root);
    // root = recursiveTree(root);
    // recursiveTree(root);
    // console.log(root);


    // NOTE: FIGURE OUT HOW TO ADD DESCRIPTIONS SO HOVERING OVER ITEM GIVES STUFF LIKE COURSE DESCR, CREDIT HOURS, ETC.
    // OR IS IT REALLY NECESSARY? IDK
    var data = {
        value: course,
        children: courses[course][2]
    };

    // console.log(data);
    buildData(data);

    var finDat = [data];

    // console.log(data, finDat);

    // create a chart and set the data
    chart = anychart.wordtree(finDat, "as-tree");
    // aligning visuals
    if(mode) {
        chart.background().fill("#ffffff");
    } else {
        chart.background().fill("#000000");
    }

    // set the container id
    chart.container("visCont");

    // initiate drawing the chart
    chart.draw();

}

/*
FOUND THE ERROR CASE
Program doesn't account for the possibility that one of the children is an and list

(from Math 3670 tree)
children: Array(5)
0: {id: 'MATH 1502', grade: 'D'}
1: {id: 'MATH 1512', grade: 'D'}
2: {id: 'MATH 1504', grade: 'D'}
3: {id: 'MATH 1555', grade: 'D'}
4: (3) ['and', Array(4), Array(7)]

Breaks on output 4 because doesn't realize that it's an "and" tree and treats it like a normal class dict

*/

function buildData(data) {

    var tchildren = [];

    if (data.children.length > 0) {

        if(data.children[0] == 'and' || data.children[0] == 'or') {
            // console.log(cell.children);
            tchildren.push({
                value: ref[data.children[0]],
                children: data.children.slice(1)
            });
        } else {
            // means its a list of direct courses of format {id: "course id", grade: "min grade"}
            data.children.forEach(function(childCourse) {
                // console.log(childCourse);
                
                // can replace hasOwnProperty w/ isArray(childCourse), checks if array
                if(childCourse.hasOwnProperty("id")) {
                    // means that it's a dictionary object thingy
                    
                    if(childCourse.id.includes("X")) {
                        // assuming that it direclty means its one of the wacky transfer thingies
                        tchildren.push({
                            value: childCourse.id,
                            children: []
                        });
                    } else {
                        // normal course
                        if(childCourse.id in courses) {
                            tchildren.push({
                                value: childCourse.id,
                                children: courses[childCourse.id][2]
                            });
                        } else {
                            tchildren.push({
                                value: childCourse.id + " (UNAVAILABLE PREREQS)",
                                children: []
                            });
                        }
                    }

                } else {

                    // means it's a list of MOAR items yay
                    tchildren.push({
                        value: ref[childCourse[0]], 
                        children: childCourse.slice(1)
                    })

                }


            });
            // cell.nodechildren.push(new node(course.id, []));
        }
        // console.log(data, tchildren);
        tchildren.forEach(childCell => buildData(childCell));
    }
    data.children = tchildren;

}

/*
    Need tree of nodes, root node is the course selection
    each child is direct prerequisites, how designate which are interchangable?
    for each child, repeat process and give them children with their direct prerequisites
    then for each of those, repeat until no prerequisites for a node

    IDEA
    IT BRANCHES DOWN TO A BIG OR AND THEN THE OTHER CLASSES
    so if a class has a prereq of "this or this or this" and "that and that and that", it can do:
                    class
                  /      \
                AND       OR 
              / | \      / | \          
*/

// redundant 
function recursiveTree(cell) {

    // DON'T CHECK COURSES WITH "X" IN IT FOR CHILDREN (MATH 1X55, ETC.)
    // console.log(cell.children, cell.children[0]);
    console.log(cell);
    if (cell.children.length > 0) {

        if(cell.children[0] == 'and' || cell.children[0] == 'or') {
            // console.log(cell.children);
            cell.nodechildren.push(new node(cell.children[0], cell.children.slice(1)));
        } else {
            // means its a list of direct courses of format {id: "course id", grade: "min grade"}
            cell.children.forEach(function(childCourse) {

                if(childCourse.id.includes("X")) {
                    // assuming that it direclty means its one of the wacky transfer thingies
                    cell.nodechildren.push(new node(childCourse.id, []));
                } else {
                    // normal course
                    if(childCourse.id in courses) {
                        cell.nodechildren.push(new node(childCourse.id, courses[childCourse.id][2]));
                    } else {
                        cell.nodechildren.push(new node(childCourse.id + " (UNAVAILABLE PREREQS)", []));
                    }
                }

            });
            // cell.nodechildren.push(new node(course.id, []));
        }
        console.log(cell, cell.nodechildren)
        cell.nodechildren.forEach(childCell => recursiveTree(childCell))
    }

}



class node {

    constructor(name, children) {

        this.name = name; // course name
        this.children = children; // children course names, can also be the dict thingys like "and" : [course, course, course]
        this.nodechildren = []; // actual node items for children

    }

}

/*
sample visualization code from AnyChart https://docs.anychart.com/Basic_Charts/Word_Tree 
once the full data tree is created, can transfer to this structure and visualize
probably more efficient way to do it but eh its fiiiiiiiiiine

---
// create data
var data = [
  {value:     "Slavic Languages",
   children: [
    {value:   "East", children: [
      {value: "Russian"},
      {value: "Ukrainian"},
      {value: "Belarusian"}
    ]},
    {value:   "West", children: [
      {value: "Polish"},
      {value: "Czech"},
      {value: "Slovak"}
    ]},
    {value:   "South", children: [
      {value: "Bulgarian"},
      {value: "Serbian"},
      {value: "Croatian"},
      {value: "Slovene"},
      {value: "Macedonian"}
    ]}  
  ]} 
];

// create a chart and set the data
var chart = anychart.wordtree(data, "as-tree");

// set the container id
chart.container("visCont");

// initiate drawing the chart
chart.draw();
---
*/