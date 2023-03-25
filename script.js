// no longer using wallpapered instructions, gave weird type selecting thingy
// var textAreaChecker = setInterval(checkTArea, 10);

var courses;
// very helpful - https://www.codegrepper.com/code-examples/javascript/How+to+access+return+value+of+promise
fetch("https://gt-scheduler.github.io/crawler/202308.json")
    .then(response => {return response.json();})
    .then((obj) => {courses = obj.courses});

const ref  = { 
                "and": "ALL",
                "or": "ANY"
            };

var idRef = {};
var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);

// going to add a feature that lets users put a list of courses that they have alr completed
// make it so that for ANY, it's green if any of children are completed and ALL, its green if all children completed
// TODO: ADD LISTING THING IN HTML TO ADD LIST OF TAKEN COURSES
// ALSO THEN MAKE THE ANY/ALL CHECK IF CHILDREN COMPLETED AND MARK THEMSELVES AS COMPLETED TOO
// COULD USE CHILD FIRST SEARCH? (RECURSIVELY CHECK CHILDREN/REMARK SO IT WORKS ITS WAY UP THE NETWORK, CHECK CHILDREN, MARK THOSE, THEN PARENTS CHECK AGAINST CHILDREN, THEN GRANDPARENTS AGAINST PARENTS, ...)
var coursesTaken = [];
var nCT = 0;

var mode = true;

function visualToggle() {
    // toggle from light to dark mode or other way around

    if(mode) {
        // chart.background().fill("#000000");
        document.body.style.backgroundColor = "black";
        document.getElementById("modeswitcher").innerHTML = "Toggle Light Mode"
        document.getElementById("info").style.color = "#7c868e";
        document.getElementById("course").style.backgroundColor = "black";
        document.getElementById("course").style.color = "#7c868e";
        document.getElementById("submit").style.backgroundColor = "black";
        document.getElementById("submit").style.color = "#7c868e";

        mode = false;
    } else {

        // chart.background().fill("#ffffff");
        document.body.style.backgroundColor = "white";
        document.getElementById("modeswitcher").innerHTML = "Toggle Dark Mode"
        document.getElementById("info").style.color = "black";
        document.getElementById("course").style.backgroundColor = "white";
        document.getElementById("course").style.color = "black";
        document.getElementById("submit").style.backgroundColor = "";
        document.getElementById("submit").style.color = "black";

        mode = true;
    }
    // chart.draw();
}

// TODO: ALLOW TO REMOVE CLASSES ADDED
function addtClass() {
    var cTaken = document.getElementById("tID").value;
    // console.log(cTaken);

    if (!(Object.keys(courses).includes(cTaken))) {
        alert("Error! Course not found in Fall 2022 Course list. It's possible that this class is limited to a specific semester or was processed incorrectly. Please check if you typed it correctly and if there are any trailing/leading spaces");
        return;
    } else {
        // means that the class is in the courses thingy
        if(!(coursesTaken.includes(cTaken))) {
            // ensuring no duplicates
            coursesTaken.push(cTaken);
            var fset = document.getElementById("tcList");

            var ctnr = document.createElement("div");
            ctnr.id = "div" + nCT;

            var elem = document.createElement("label");
            elem.appendChild(document.createTextNode(cTaken));
            elem.id = "label" + nCT;
            ctnr.appendChild(elem);

            var padding = document.createElement("label");
            padding.appendChild(document.createTextNode("  "));
            ctnr.appendChild(padding);

            var rmv = document.createElement("button");
            rmv.textContent = "Remove Course";
            rmv.id = nCT;
            rmv.onclick = function() {
                // delete course div container
                console.log(this.id)
                var div = document.getElementById("div" + this.id);
                coursesTaken.splice(coursesTaken.indexOf(document.getElementById("label" + this.id).innerText), 1);
                div.remove();
                // coursesTaken.splice(this.id, 1);
            }
            ctnr.appendChild(rmv);
            
            fset.appendChild(ctnr);
            nCT++;
            // fset.appendChild(document.createElement("br"));
        }
    }
}

function buildTree() {

    // increase spacing btwn nodes
    // if any/all has just one child, eliminate the any/all and directly connect/point
    // also if you alr have prereq credit, enter it and see how much of the path is green/already complete

    document.getElementById("visCont").innerHTML = "";

    var course = document.getElementById("course").value;
    // assuming that the course was entered in correct format (uppercase tag MATH/CS/ACCT/HUM/etc..) because i don't want to deal with an autocomplete rn
    // i can barely do js and webdev, much less an actual autocompleter (efficiently at least)
    
    // TODO: need to figure out how to strip tailing spaces so that both "CS 1331" and "CS 1331 " pass

    if (!(Object.keys(courses).includes(course))) {
        alert("Error! Course not found in Fall 2022 Course list. Try checking if you typed it correctly and if there are any trailing/leading spaces");
        return;
    }

    // resetting vars
    nodes = new vis.DataSet([]);
    edges = new vis.DataSet([]);
    idRef = {};

    // NOTE: FIGURE OUT HOW TO ADD DESCRIPTIONS SO HOVERING OVER ITEM GIVES STUFF LIKE COURSE DESCR, CREDIT HOURS, ETC.
    // OR IS IT REALLY NECESSARY? IDK
    var data = {
        value: course,
        children: courses[course][2]
    };

    // console.log(data);
    buildData(data);
    idRef[Object.keys(idRef).length] = data.value;
    nodes.add(
            {
                id: 0, 
                label: data.value, 
                color: "#FF0000", 
                title: courses[course][0]
            }
        );
    traverseData(data.value, 0, data.children, "");
    // checkPrereqs(data.value, 0, data.children, "");

    var options = {
        autoResize: true, 
        edges:{
            smooth:{
                enabled: true,
                type: "continuous",
                roundness: 0.75
            }, 
            color:{
                inherit: true
            }
        }, 
        interaction: {
            hover: true,
            tooltipDelay: 0, 
            navigationButtons: true
        }
    };

    // create a network
    var container = document.getElementById('visCont');

    var visDat = {
        nodes: nodes,
        edges: edges
    };
    console.log(visDat);
    console.log(nodes.get());
    console.log(edges.get());
    console.log(idRef);

    // initialize your network!
    var network = new vis.Network(container, visDat, options);

    // make course title on node click instead of on hover? hover could be annoying if just moving mouse around
    // can adapt from https://stackoverflow.com/questions/48150985/vis-js-network-fixed-position-for-tooltip-popup 
    // network.on('click', function(properties) {
    //     var ids = properties.nodes;
    //     var clickedNode = nodes.get(ids);
    //     // console.log(clickedNode);
    //     if(clickedNode.length != 0) {
    //         var cNode = clickedNode[0];

    //     }
    // });

}

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
                                value: childCourse.id + " (NPRQ)",
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

function traverseData(parent, parentID, children, color) {

    if(children.length > 0) {
        var nCompleted = 0;
        var isAny = (parent.value == "ANY");
        var isAll = (parent.value == "ALL");
        var cList = [];

        var completedColor = "#00FF00";

        children.forEach(function(child) {

            // IF IT'S NOT AN ALL/ANY, MAKE IT POINT TO THE PRE-EXISTING NODE?

            // if child not in idRef yet
            var childID;
            var childColor = "";
            var childDeets = {};

            if(["", "#FF0000", "#0000FF"].includes(color)) {
                var childName = child.value;
                if(childName.includes("(NPRQ)")) {
                    childName = childName.slice(0, -7);
                }
                console.log(child, childName, color);
                if(coursesTaken.includes(childName)) {
                    childColor = completedColor;
                    nCompleted++;
                }
            } else {
                childColor = color;
            }
            if(child.value == "ANY" && child.children.length == 1) {
                child = child.children[0];
            }
            if(child.value != "ANY" && child.value != "ALL" && Object.values(idRef).includes(child.value)) {
                childID = Object.keys(idRef).find(key => idRef[key] === child.value);
            } else {
                idRef[Object.keys(idRef).length] = child.value;
                var childID = Object.keys(idRef).length - 1;
                // deets about da child
                childDeets = {
                    id: childID, 
                    label: child.value
                }

                if(childColor != "") {
                    childDeets["color"] = childColor; // opening up possibility for different colorcoding in future
                }

                if(child.value != "ANY" && child.value != "ALL") {
                    // console.log(child, child.value)
                    if(child.value.includes("(NPRQ)")) {
                        childDeets["title"] = "No Course Name Found";
                    } else if(child.value.includes("X")) {
                        childDeets["title"] = "Transfer Credit";
                    } else {
                        childDeets["title"] = courses[child.value][0];
                    }
                }
                nodes.add(childDeets);
            }

            // edges.add({from: parentID, to: childID, arrows: "to"});

            cList.push([child.value, childID, child.children, childColor, childDeets])

            // traverseData(child.value, childID, child.children, childColor);
        });

        var satisfiesAny = nCompleted > 0;
        var satisfiesAll = nCompleted == children.length;

        cList.forEach(function(items) {

            console.log(items, ((isAny && satisfiesAny) || (isAll && satisfiesAll) || (coursesTaken.includes(parent.value))) ? completedColor : items[3]);

            // if(items[4] != {}) {
            //     items[4]["color"] = ((isAny && satisfiesAny) || (isAll && satisfiesAll) || (coursesTaken.includes(parent.value))) ? completedColor : items[3];
            //     nodes.add(items[4]);
            // }
            edges.add({from: parentID, to: items[1], arrows: "to"});
            traverseData(items[0], items[1], items[2], ((isAny && satisfiesAny) || (isAll && satisfiesAll) || (coursesTaken.includes(parent.value))) ? completedColor : items[3])
            
            // add followup that checks color of child nodes and updates parent nodes based on that?

        });

    }
}

// function checkPrereqs(parent, parentID, children, color) {
//     if(children.length > 0) {

//     }
// }

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

