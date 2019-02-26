//variable for holding todos
var todos = [];
var todosHolder = document.getElementById('todosHolder');


//get the time values from browser local storage
var gettingItem = browser.storage.local.get('tslTodos');
// localstorage returns promise
gettingItem.then((res) => {

  try{
    if(res.tslTodos.length > 0){
      res.tslTodos.forEach((entry)=>{
        todos.push(entry);
      });    
    }
  }catch(e){}

  setupTodos();
});


browser.tabs.query({currentWindow: true, active: true}).then(
     function(tabs){
         let tab = tabs[0];
         document.getElementsByTagName('input')[0].value = tab.url;
    }, function(error){
         document.getElementsByTagName('input')[0].value = "No Url";
    });


function setupTodos() {

  todosHolder.innerHTML = '';
  let current_url = '';
  if(todos.length > 0){
    todos.forEach((entry)=>{
      if (current_url != entry.url) {
        insertDivider(entry);
        current_url = entry.url;
      }
      insertTodo(entry);
    });
    setupBadge(todos.length);
  }
}
function insertDivider(entry) {
      let tempChild = document.createElement('h3');
      tempChild.className = "row";
      if (entry.url != '') {
          tempChild.innerHTML = `${entry.url} <div class="openUrl">&#x1F517;</div>`;
      } else {
         tempChild.innerHTML = 'General';
      }
      tempChild.setAttribute('url', entry.url);
      todosHolder.appendChild(tempChild);
}
function insertTodo(entry) {
      let tempChild = document.createElement('div');
      if(entry.done !== 0){
        tempChild.className="IAmDone row";
        
      }else{
        tempChild.className="row";
      }
      tempChild.innerHTML = `<div class="removeTodo">&#x1f5d1;</div><div class="checkTodo">&#x2713;</div><div class="toggleTodo">${entry.task}</div>`;
      tempChild.setAttribute('data-isDone', entry.done);
      tempChild.setAttribute('data-id', entry.key);

      todosHolder.appendChild(tempChild);

}

function pushIntoStore(obj){
  let len = todos.length + 1;
  let index = "I" + len;
  obj.key = index;
  
  let lastIndex = len;
  let count = 0;
  let arrayLength = todos.length;
  for (let i = 0; i < arrayLength; i++) {
     if (todos[i].url == obj.url){
        lastIndex = i;
     }
  }
  lastIndex++;
  todos.splice(lastIndex, 0, obj);
  return obj;

}

function toggleTodo(ele){
  let parentNode = ele.parentNode;
  let dataId = parentNode.getAttribute('data-id');
  let dataIsDone = parentNode.getAttribute('data-isDone');

  if(parseInt(dataIsDone, 10)!==0){
    parentNode.className = "row";
    parentNode.setAttribute('data-isDone',0);
  }else{
    parentNode.className = "IAmDone row";
    parentNode.setAttribute('data-isDone',1);
  }
  toggleTodoInMemory(dataId,dataIsDone);
}

function removeTodo(ele){

  let parentNode = ele.parentNode;
  let dataId = parentNode.getAttribute('data-id');
  removeTodoFromMemory(dataId);
  parentNode.remove(dataId);  
}

function removeTodoFromMemory(dataId){
    todos = todos.filter((item) => item.key !== dataId);
    resetMemory();
}

function openUrl(ele){
  let parentNode = ele.parentNode;
  let url = parentNode.getAttribute('url');
   browser.tabs.create({url: url});
}

function toggleTodoInMemory(dataId, dataIsDone){

  var mapTodos = todos.map(function(entry) {
    if(entry.key == dataId)
      entry.done = dataIsDone != 1 ? 1:0;
    return entry; 
  });
  resetMemory();
}

function saveToDo() {
  let todoVal = document.getElementsByTagName('textarea')[0].value;
  let todoUrl = document.getElementsByTagName('input')[0].value;
  if(todoVal.trim().length > 0) {
         obj = pushIntoStore({task:todoVal, done:0, url: todoUrl});
         document.getElementsByTagName('textarea')[0].value = "";
         resetMemory();
         setupTodos();
  }
}

function resetMemory() {
  browser.storage.local.set({tslTodos:todos});
  setupBadge(todos.length);
}

document.querySelector('body').addEventListener('click', function(event) {
  if (event.target.className === 'removeTodo')
    removeTodo(event.target);
  if (event.target.className === 'toggleTodo')
    toggleTodo(event.target);
  if (event.target.className === 'openUrl')
    openUrl(event.target);
  if (event.target.className === 'addTask')
    saveToDo();
});

function setupBadge(count){
  browser.runtime.sendMessage({
    action: 'setBadge',
    data: count
  });  
}

document.querySelector('textarea').addEventListener('keyup',function(event) {
  if(event.keyCode == 13)
    saveToDo();
});
