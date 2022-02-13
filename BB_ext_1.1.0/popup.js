chrome.storage.sync.get(['finalAssignmentList', "courseInfo", "lastUpdatedTime", "assignedTask", "sortBy"], function (result) {
    var finalAssignmentList = result.finalAssignmentList;
    var courseInfo = result.courseInfo;
    var lastUpdatedTime = result.lastUpdatedTime;
    var extraAssignments = result.assignedTask;
    var sortBy = result.sortBy;

    if (extraAssignments == undefined) {
        extraAssignments = [];
    }
    if (sortBy == undefined) {
        sortBy = "dueDate";
    }


    console.log('finalAssignmentList currently is ' + JSON.stringify(finalAssignmentList));
    console.log('courseInfo currently is ' + JSON.stringify(courseInfo));
    console.log('lastUpdatedTime currently is ' + lastUpdatedTime);
    console.log('extraAssignments currently is ' + JSON.stringify(extraAssignments));
    console.log('sortBy currently is ' + sortBy);


    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekdayShort = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var s = "";

    // sort by course
    if (sortBy == "course") {
        var unfinishedAssignment = false;
        for (const course in finalAssignmentList) {
            unfinishedAssignment = true;
            s += "<div class='AssMan'>";
            s += "<p>Course Name: " + courseInfo[course] + "</p>";
            s += "<table class='AssManTable'><tr><th>Assignment</th><th>Due Date</th><th>Time Left</th></tr>";
            var i = 0;
            while (i < finalAssignmentList[course].length) {

                var d = finalAssignmentList[course][i][1] + " " + finalAssignmentList[course][i][2];
                var date = new Date(d);
                var minutes = (date - new Date()) / 1000 / 60;


                s += "<tr><td class='AssManTd'>" + finalAssignmentList[course][i][0].trim() + "  </td><td class='AssManTd'>Due " + d + `  </td><td class='AssManTd'>${Math.floor(minutes / 60 / 24)}D ${Math.floor(minutes % (60 * 24) / 60)}H ${Math.floor(minutes % 60)}M</td>`;

                i += 1;
            }
            s += '</table>';
        }

        // added assignments 

        if (Object.keys(extraAssignments).length != 0) {
            unfinishedAssignment = true;
            s += "<div class='AssMan'><p> Added Assignments </p>";
            s += "<table class='AssManTable'><tr><th>Assignment</th><th>Due Date</th><th>Time Left</th></tr>";


            var keys = Object.keys(extraAssignments);
            var displayedKeys = [];

            for (var i = 0; i < keys.length; i++) {
                console.log("i", i);

                var keyCandidate = 0;
                var displayKey = keys[keyCandidate];
                while (displayedKeys.includes(displayKey)) {
                    keyCandidate += 1;
                    displayKey = keys[keyCandidate];
                }


                var displayD = extraAssignments[displayKey].date + " " + extraAssignments[displayKey].time
                var displayDate = new Date(displayD);
                var displayMinutes = (displayDate - new Date()) / 1000 / 60;

                for (var j = 0; j < keys.length; j++) {
                    console.log("j", j)

                    var key = keys[j];
                    var displayed = false;

                    if (displayedKeys.includes(key)) {
                        continue;
                    }

                    var d = extraAssignments[key].date + " " + extraAssignments[key].time;
                    //console.log("d", d);
                    var date = new Date(d);
                    //console.log("date", date);
                    var minutes = (date - new Date()) / 1000 / 60;
                    //console.log("minutes", minutes);



                    if (date - displayDate < 0) {
                        displayKey = key;
                        displayD = d;
                        displayDate = date;
                        displayMinutes = minutes;
                    }

                }

                var dateStr = weekday[displayDate.getDay()] + ", " + month[displayDate.getMonth()] + " " + displayDate.getDate() + ", " + displayDate.getFullYear() + " ";
                if (displayDate.getHours() > 12) {
                    dateStr += `${displayDate.getHours() - 12}:${displayDate.getMinutes()} PM`;
                }
                else {
                    dateStr += `${displayDate.getHours() - 12}:${displayDate.getMinutes()} AM`;
                }
                s += "<tr><td class='AssManTd'>" + extraAssignments[displayKey].name + "  </td><td class='AssManTd'>Due " + dateStr + `  </td><td class='AssManTd'>${Math.floor(displayMinutes / 60 / 24)}D ${Math.floor(displayMinutes % (60 * 24) / 60)}H ${Math.floor(displayMinutes % 60)}M</td>`;

                displayedKeys.push(displayKey);


            }

            s += '</table>';
        }
        if (!unfinishedAssignment) {
            s += `<div class='AssMan'>
        <p> No assignment is due. Good job! </p>`
        }
    }

    // sort by dueDate
    else if(sortBy == "dueDate"){
        s += "<div class='AssMan'>";

        var assignments = [];
        for (const course in finalAssignmentList) {
            for (var i = 0; i < finalAssignmentList[course].length; i++) {
                var name = finalAssignmentList[course][i];
                var d = finalAssignmentList[course][i][1] + " " + finalAssignmentList[course][i][2];
                var date = new Date(d);

                let assignmentObj = {
                    dateObj: date,
                    course: courseInfo[course].match(/[A-Z]{3} [0-9]{3}/),
                    name: finalAssignmentList[course][i][0]
                };

                assignments.push(assignmentObj);

            }
        }

        var keys = Object.keys(extraAssignments);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var d = extraAssignments[key].date + " " + extraAssignments[key].time;
            var date = new Date(d);
            var name = extraAssignments[key].name;

            let assignmentObj = {
                dateObj: date,
                course: "Script",
                name: name
            };
            assignments.push(assignmentObj);
        }
        var addedIndex = [];
        for (var i = 0; i < assignments.length; i++){
            var displayIndex = 0;

            while (addedIndex.includes(displayIndex)){
                displayIndex++;
            }

            for (var j = 0; j < assignments.length; j++){
                if (addedIndex.includes(j)){
                    continue;
                }
                console.log(assignments[j].dateObj - assignments[displayIndex].dateObj);
                if (assignments[j].dateObj - assignments[displayIndex].dateObj < 0){
                    displayIndex = j;
                }
            }

            addedIndex.push(displayIndex);
        }

        

        if (assignments.length > 0){

            s += "<table class='AssManTable'><tr><th>Course</th><th>Assignment</th><th>Due Date</th><th>Time Left</th></tr>";

            
            for (var i = 0; i < addedIndex.length; i++){
                var index = addedIndex[i];
                var assignment = assignments[index];

                var dateStr = weekdayShort[assignment.dateObj.getDay()] + ", " + assignment.dateObj.getMonth() + "/" + assignment.dateObj.getDate() + "/" + assignment.dateObj.getFullYear() + " ";
                if (assignment.dateObj.getHours() > 12) {
                    dateStr += `${assignment.dateObj.getHours() - 12}:${assignment.dateObj.getMinutes()} PM`;
                }
                else {
                    dateStr += `${assignment.dateObj.getHours() - 12}:${assignment.dateObj.getMinutes()} AM`;
                }
                var minutes = (assignment.dateObj - (new Date())) / 1000 / 60;

                s += "<tr><td class='AssManTd'>" + assignment.course + "</td><td class='AssManTd'>" + assignment.name + "</td><td class='AssManTd'>Due " + dateStr + `  </td><td class='AssManTd'>${Math.floor(minutes / 60 / 24)}D ${Math.floor(minutes % (60 * 24) / 60)}H ${Math.floor(minutes % 60)}M</td>`;



            }
            s += '</table>';
        }

        else{
            s += `<div class='AssMan'>
            <p> No assignment is due. Good job! </p>`
        }
           


        console.log(JSON.stringify(assignments));

    }
    var seconds = Math.floor(((new Date()).getTime() - lastUpdatedTime) / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 60);

    if (days > 0) {
        if (days == 1)
            s += `<p> Last update: ${days} day ago</p>`;
        else
            s += `<p> Last update: ${days} days ago</p>`;
    }
    else if (hours > 0) {
        if (hours == 1)
            s += `<p> Last update: ${hours} hour ago</p>`;
        else
            s += `<p> Last update: ${hours} hours ago</p>`;
    }
    else if (minutes > 0) {
        if (minutes == 1)
            s += `<p> Last update: ${minutes} minute ago</p>`;
        else
            s += `<p> Last update: ${minutes} minutes ago</p>`;
    }
    else {
        if (seconds == 1)
            s += `<p> Last update: ${seconds} second ago</p>`;
        else
            s += `<p> Last update: ${seconds} seconds ago</p>`;
    }

    s += "<button class='sort' id='sortBy'> Sort by course / due date </button>";

    s += `</div>
        <div class='link'>
        <p><a class='ad-btn' href='index.html' target='_self'><button class='ad-btn'>Add/Delete assignments</button>
        </a></p>`;

    s += `<p class='log'><a class='log' href='https://blackboard.stonybrook.edu/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1'  target='_blank'>
        Log into BlackBoard to update the assignments list
        </a></p>
        </div>`;

    


    document.querySelector("body").innerHTML = document.querySelector("body").innerHTML + s;


    var sortByBtn = document.getElementById("sortBy");
    sortByBtn.addEventListener("click", function(){
        console.log("success")
        if (sortBy == "course"){
            chrome.storage.sync.set({"sortBy": "dueDate"});
        }
        else if (sortBy == "dueDate"){
            chrome.storage.sync.set({"sortBy": "course"});
        }
        location = location;
    })

    document.querySelector(".AssManDiv").style.margin = "40px";
    document.querySelector(".AssManTable").style.width = "100%";

    
    

});




