let addBtn = document.getElementById("add-btn");
let courseBtn = document.getElementById("courseName");
let dateBtn = document.getElementById("dueDate");
let timeBtn = document.getElementById("time");

function displayTasks() {
    chrome.storage.sync.get(["assignedTask"], function(result){
        var x = result.assignedTask;
        //console.log("display", x);
        let elem = document.getElementById("notes");
        let html = "";
        if(x == undefined || Object.keys(x).length == 0) {
            //console.log(x);
            elem.innerHTML = "No task to do";
        }else {
            var keys = Object.keys(x);
            //console.log(keys)
            for(let i=0; i<keys.length; i++){
                html += `
                <div id="note">
                    <p class="noteText">${x[keys[i]].name} -    Deadline: ${x[keys[i]].date} ${x[keys[i]].time}</p>
                    <button id="${keys[i]}" class="delete-btn">Delete</button>
                </div>`;
                elem.innerHTML = html;

                // console.log("id", document.getElementById(keys[i]));
                
            }

            for (let i=0; i<keys.length; i++){
                document.getElementById(keys[i]).addEventListener("click", function(){
                    var current_key = keys[i];
                    //console.log("deleting", current_key);
                    chrome.storage.sync.get(["assignedTask"], function(result){

                        var x = result.assignedTask;
                        delete x[current_key];
                        chrome.storage.sync.set({"assignedTask": x});
                        //console.log(current_key, "deleted");
                        displayTasks();
                       
                    });
                    displayTasks();
                
                });
            }
            
            
        }
    })


}

addBtn.addEventListener("click", function() {
    
    if (courseBtn.value == "" || dateBtn.value == "") {
        return alert("Invalid task name or date");
    }

    var name = courseBtn.value;
    var date = dateBtn.value;
    var time = timeBtn.value;

    var enterDate = new Date(date + " " + time);
    var now = new Date();

    if(now - enterDate > 0) {
        return alert("Due date cannot be set before current time");
    }

    

    var newAssignment = {
        "name": name,
        "date": date,
        "time": time
    }

    chrome.storage.sync.get(["assignedTask"], function(result){

        var x = result.assignedTask;
        if (x != undefined){
            //console.log("get", x);
            x[name] = newAssignment;
            chrome.storage.sync.set({"assignedTask": x});
        }
        else{
            //console.log("get", x);
            var temp = {name: newAssignment}
            chrome.storage.sync.set({"assignedTask": temp});
        }
        courseBtn.value = "";
        dateBtn.value = "";
    });

    displayTasks();

})




displayTasks();


