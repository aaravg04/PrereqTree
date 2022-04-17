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

    var data = {
        value: course,
        children: courses[course][2]
    };
    console.log(data);
    buildData(data);

    var finDat = [data];

    console.log(data, finDat);

    // create a chart and set the data
    var chart = anychart.wordtree(finDat, "as-tree");

    // set the container id
    chart.container("visCont");

    // initiate drawing the chart
    chart.draw();

}

function buildData(data) {

    var tchildren = [];

    if (data.children.length > 0) {

        if(data.children[0] == 'and' || data.children[0] == 'or') {
            // console.log(cell.children);
            tchildren.push({
                value: data.children[0],
                children: data.children.slice(1)
            });
        } else {
            // means its a list of direct courses of format {id: "course id", grade: "min grade"}
            data.children.forEach(function(childCourse) {

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

            });
            // cell.nodechildren.push(new node(course.id, []));
        }
        console.log(data, tchildren);
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