// This javascript file is going to run when user is in blackboard home page.
function makeHttpObject() {
    try {return new XMLHttpRequest();}
    catch (error) {}
    try {return new ActiveXObject("Msxml2.XMLHTTP");}
    catch (error) {}
    try {return new ActiveXObject("Microsoft.XMLHTTP");}
    catch (error) {}
  
    throw new Error("Could not create HTTP request object.");
  }
  

 // Get assignment url from the server

 function getAssignmentURL(courseID) {
   var request = makeHttpObject();
   request.open("GET", `https://blackboard.stonybrook.edu/webapps/blackboard/execute/announcement?method=search&context=course_entry&course_id=_${courseID}_1&handle=announcements_entry&mode=view`, true);
   request.send(null);

   request.onreadystatechange = function() {
        var assignmentPageURL;
        if (request.readyState == 4){
           var matches = request.responseText.match(/.*<a.*Assignments/);
           if (matches != null){
            matches = matches[matches.length-1];
            var a = matches.split("<a href=\"");
            assignmentPageURL = a[a.length-1].split('" target="_self"')[0];
            //console.log(assignmentPageURL);
            if (assignmentPageURL != null){
                getAssignmentLinkList(courseID, assignmentPageURL);
            } 
        }
    }
   }

 };


 // Get individual assignments url from the server


 function getAssignmentLinkList(courseID, assignmentPageURL){
   

   var request = makeHttpObject();
   request.open("GET", assignmentPageURL, true);
   request.send(null);
   request.onreadystatechange = function() {
     if (request.readyState == 4){
         var assignmentLinkList;
         var matches = request.responseText.match(/\/webapps.*uploadAssignment.*mode=view/g);
         if (matches != null){
            assignmentLinkList = matches;
            // console.log(assignmentLinkList);
            getAllDueDate(courseID, assignmentLinkList);
         }
         
     }
   }
 
 }



 //add assignment name along with due dates
 function getAllDueDate(courseID, assignmentLinkList){
   var assignmentInfo = [];
   getAllDueDataHelper(courseID, assignmentLinkList, 0, assignmentInfo);

 }

 function getAllDueDataHelper(courseID, assignmentLinkList, i, assignmentInfo){
    var assignmentLink = assignmentLinkList[i];
       var request = makeHttpObject();
       if (assignmentLink == null){
           return;
       }
        request.open("GET", assignmentLink, true);
        request.send(null);
        request.onreadystatechange = function() {
            if (request.readyState == 4){
                var dueDate = request.responseText.match(/[A-Z][a-z]*, [A-Z][a-z]* [0-9]*, 20[0-9]{2}/g);
                var timeMatch = request.responseText.match(/[0-9]{2}:[0-9]{2} .M/g);
                var assignmentNameMatch = request.responseText.match(/Upload Assignment: .*<\/span>/g);
                var assignmentName;
                var time;
                
                if (assignmentNameMatch != null){
                    assignmentName = assignmentNameMatch[0].split("Assignment: ")[1].split("</span>")[0];
                }
                if(timeMatch != null){
                    time = timeMatch[0];


                }
                //console.log(i);
                //console.log(assignmentName);
                if (dueDate != null && assignmentName != null){
                    //console.log(dueDate);
                    assignmentInfo.push([assignmentName, dueDate[0], time]);
                }
                if (i+1 < assignmentLinkList.length){
                    getAllDueDataHelper(courseID, assignmentLinkList, i+1, assignmentInfo);
                }
                else{
                    if (assignmentInfo != null && assignmentInfo.length > 0){
                        finalAssignmentList[courseID] = assignmentInfo;
                    }
                }
                
            }
        }

 }
 
 var finalAssignmentList = {};
 var courseInfo = {};
 var htmlContent;

 function getAssignmentAndDueDate() {
    
    regex = /.*Course&id=.*[0-9]{5}/;
    let courseID_Arr = [];
    for (let i of document.querySelectorAll('*')) {
        for (let j of i.attributes) {
            if (regex.test(j.value)) {
                var id = j.value.split("Course&id=_")[1].split("_")[0];
                courseID_Arr.push(
                    [id]
                );
                courseInfo[id] = i.innerHTML;
            }
        }
    }
    if (courseInfo != undefined){
        chrome.storage.sync.set({"courseInfo": courseInfo});
    }
    
    if (courseID_Arr != undefined){
        chrome.storage.sync.set({"courseID_Arr": courseID_Arr});
    }
    

    var i = 0;
    while (i < courseID_Arr.length && i < 7){
        getAssignmentURL(courseID_Arr[i]);
        i += 1;
    }


    updateHTML();
}

// add AssMan div into bb html 
var htmlSaved = false;
var s = "";
function updateHTML(){
    if (!initialized){
        if (! htmlSaved){
            htmlContent = document.querySelector(".contentBox.clearfix").innerHTML;
            htmlSaved = true;
        }
        
        // document.querySelector(".contentBox.clearfix").innerHTML = "<h1 class=AssManMsg>Gathering assignments data...  Click again after 3 seconds</h1>" + htmlContent;
        // document.querySelector("h1.AssManMsg").style.margin = "30px";
    }
    //console.log(finalAssignmentList);
    s = "<div class='AssManDiv'>";
    // var finishData = false;
    for (const course in finalAssignmentList){
        s += "<h1>Course Name: " + courseInfo[course] + "</h1>";
        var i = 0;
        s += "<table class='AssManTable'><tr><th>Assignment</th><th>Due Date</th><th>Time Left</th></tr>";
        while (i < finalAssignmentList[course].length){
            
            var d = finalAssignmentList[course][i][1] + " " + finalAssignmentList[course][i][2];
            var date = new Date(d);
            var minutes = (date - new Date()) / 1000 / 60;


            s += "<tr><td class='AssManTd'>"+ finalAssignmentList[course][i][0].trim() + "  </td><td class='AssManTd'>Due " + d +`  </td><td class='AssManTd'>${Math.floor(minutes/60/24)}D ${Math.floor(minutes%(60*24)/60)}H ${Math.floor(minutes%60)}M</td>`;

            i += 1;
        }
    

        s += '</table>';
        

        
        
    }
    if (Object.keys(finalAssignmentList).length > 0){
        chrome.storage.sync.set({"finalAssignmentList": finalAssignmentList}, function() {
            // console.log('finalAssignmentList is set to ' + JSON.stringify(finalAssignmentList));
            // console.log(Object.keys(finalAssignmentList).length);
        })
    }
    
    chrome.storage.sync.set({"lastUpdatedTime": (new Date()).getTime()}, function() {
        //console.log('lastUpdatedTime is set to ' + (new Date()).getTime());
    })
        
    
    
}


// getAssignmentURL(34136);
// getAssignmentAndDueDate();

document.getElementById("paneTabs").innerHTML = document.getElementById("paneTabs").innerHTML + "<li class='secondaryButton' id='AssMan'><a>Assignment Manager</a></li>"




var initialized = false;
document.getElementById("AssMan").addEventListener("click",function(){
        // getAssignmentAndDueDate();
        var currentDisplay = document.querySelector(".contentBox.clearfix").innerHTML;
            if (currentDisplay == htmlContent){
                document.querySelector(".contentBox.clearfix").innerHTML = s + htmlContent;
                document.querySelector(".AssManDiv").style.margin = "40px";
                document.querySelector(".AssManTable").style.width = "100%";
            }
            else{
                document.querySelector(".contentBox.clearfix").innerHTML = htmlContent;
            }
})

var i = 0;
const interval = setInterval(function() {
    if (i < 10){
        getAssignmentAndDueDate();
        //console.log(i);
    }
    else{
        if (i % 30 == 0){
            getAssignmentAndDueDate();
            //console.log(i);
        }
    }
    i++;
  }, 2000);

