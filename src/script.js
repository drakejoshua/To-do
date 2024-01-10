// import the program dependencies
import Sortable from "sortablejs";
import { StatefulElement } from "./one";

// import the styles for the page
import "./style.css";


// import the tasks array data from localStorage if existing to store all the initial and created tasks
var tasksArray = ( 
        JSON.parse( localStorage.getItem("todoproject-tasks") ) == null 
        || JSON.parse( localStorage.getItem("todoproject-tasks")  == "" ) 
    ) ? [] : JSON.parse( localStorage.getItem("todoproject-tasks") );


// import the DOM representations of element on the page
var tasksList = document.getElementById("tasks-list"), addButton = document.getElementById("create-task-btn"), 
    createTaskInput = document.getElementById("create-task-input");


// create a stateful representation of the to-do section( using the stateful 
// representation class from the one.js library )
var ToDoSectionStatefulRepresentation = new StatefulElement( 
    document.getElementById("to-do"),

    // initial state
    {
        state: "not-empty",
        tasks: tasksArray
    },

    // state listener function
    function( internalState, element ) {

        // check the state based on the internalState and display the appropriate UI
        switch ( internalState.state ) {
            case "empty":
                element.classList.remove("empty", "not-empty");
                element.classList.add("empty");
            break;
            
            case "not-empty":

                // check if the tasks in this state is not empty if not, revert back to former state
                if ( internalState.tasks.length > 0 ) {

                    element.classList.remove("empty", "not-empty");
                    element.classList.add("not-empty");
    
                    // clear the tasksList of all previous elements
                    tasksList.innerHTML = "";
    
                    // make the tasksList a sortable( using sortable.js )
                    var sortable = Sortable.create( tasksList, {
                        swap: true,
                        swapClass: "swap-class",
                        animation: 300,
                        onUpdate: function( event ) {
                            updateSwapInTasksArray( event.oldIndex, event.newIndex );
                        }
                    } );
    
                    // insert all the task in this state into the tasksList as <li> elements
                    for ( var task of internalState.tasks ) {
                        tasksList.innerHTML += `
                            <li class="task" data-todoid="${task.id}"> 
                                <span class="task-name">${task.text}</span>
                
                                <span class="task-icon material-symbols-rounded">
                                    delete
                                </span>
                            </li>
                        `;
                    }


                    for ( var taskIcon of document.getElementsByClassName("task-icon") ) {
                        taskIcon.addEventListener( "click", function( event ) {
                            deleteTask( event.target.parentElement );
                        })
                    }
                } else {
                    element.statefulRepresentation.internalState = { state: "empty" };
                }
            break;
        }
    }
);


// the deleteTask() function
// this function is called to the delete a task from the tasksList and tasksArray using the delete icon on the page
function deleteTask( task ){
    // get the data-todoid attr value from the <li>.task element
    var id = task.getAttribute("data-todoid");

    // remove the <li> element from the page
    task.remove();

    // get the index of the task object with the correlating data-todoid value from the tasksArray
    var taskIndexInArray = tasksArray.findIndex( function( value ) {
        return ( value.id == id );
    });

    // check if returned index is valid if so, remove the task object from the tasksArray
    // , re-map the id's of the task object in the tasksArray to be orderly and re-display the tasksList
    if ( taskIndexInArray != -1 ) {
        tasksArray.splice( taskIndexInArray, 1 );

        var id = 0;

        var newTasksArray = tasksArray.map( 
            function( value ) {
                id++;

                return {
                    id: id,
                    text: value.text
                }
            }
        )

        tasksArray = newTasksArray;

        ToDoSectionStatefulRepresentation.internalState = { state: "not-empty", tasks: tasksArray };

        // save the tasksArray to localStorage for later retrieval
        localStorage.setItem( "todoproject-tasks", JSON.stringify( tasksArray ) );
    }
}


addButton.addEventListener( "click", function() {
    addTask();
})


// the addTask() function
// this function is called to add a new task using the task objective from the input on the page
function addTask() {

    // get the newTasktext from the createTaskInput on the page
    var newTaskText = createTaskInput.value;

    // check if the newTaskText is not empty if so, create a new task object and add it to the tasksArray
    // and also re-display the tasksList on the page with the updated tasksArray( using the stateful representation )
    if ( newTaskText != "" ) {

        // push the new task object to the tasksArray
        tasksArray.push(
            {
                id: ( tasksArray.length + 1 ),
                text: newTaskText
            }
        );


        // update the state of the ToDoSection
        ToDoSectionStatefulRepresentation.internalState = {
            state: "not-empty",
            tasks: tasksArray
        }

        // save the tasksArray to localStorage for later retrieval
        localStorage.setItem( "todoproject-tasks", JSON.stringify( tasksArray ) );
    } else {
        alert("Cannot create task with no objective");
    }
}



// the updateSwapInTasksArray() function
// this function is called to update the positions of task objects in the tasksArray after a swap in the tasksList
// on the page
function updateSwapInTasksArray( oldIndex, newIndex ){
    // create duplicate task object for the selected task object ( as relating to the selected task element on the page )
    // and also the swapped task object ( as relating to the swapped task element on the page )
    var selectedTaskObject = tasksArray[oldIndex],
        swappedTaskObject = tasksArray[newIndex];

    // swap the positions of the duplicate selected and swapped task objects in the tasksArray
    tasksArray[ oldIndex ] = swappedTaskObject;
    tasksArray[ newIndex ] = selectedTaskObject;


    // save the tasksArray to localStorage for later retrieval
    localStorage.setItem( "todoproject-tasks", JSON.stringify( tasksArray ) );
}