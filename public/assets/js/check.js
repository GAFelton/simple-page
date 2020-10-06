//Vanilla JavaScript Fetch API Function
async function fetchAsync(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}
async function postFetchAsync(url, req = {}) {
  let response = await fetch(url, {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req)
  });
  let data = await response.text();
  return data;
}
async function putFetchAsync(url, req = {}) {
  let response = await fetch(url, {
    method: "PUT", // or 'POST'
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req)
  });
  let data = await response.json();
  return data;
}

const UIController = (function() {
  const DOMString = {
    day: ".date--day",
    month: ".date--month",
    year: ".date--year",
    addInput: ".add__input",
    addBtn: ".add__circle",
    taskListContainer: ".result__list",
    listTask: ".list__task",
    checkedBtn: ".list__task--check",
    taskText: ".list__task--text",
    editBtn: ".list__task--edit",
    delBtn: ".list__task--del"
  };

  return {
    testUI: function() {
      console.log("Call from UI");
    },

    getDOMString: function() {
      return DOMString;
    },

    getInput: function() {
      return document.querySelector(DOMString.addInput).value;
    },

    clearInput: function() {
      return (document.querySelector(DOMString.addInput).value = "");
    },
    addTaskList: function(tasks, checked = false) {
      const element = DOMString.taskListContainer;

      const html =
        "<li class='list__task' id='task-%id%'><button class='list__task--check' id='check'><i class='ion-ios-checkmark'></i></button><div class='list__task--text'>%description%</div><button class='list__task--del' id='del'><i class='ion-android-delete'></i></button></li>";

      markup = html.replace("%id%", tasks.id);
      markup = markup.replace("%description%", tasks.value);

      document.querySelector(element).insertAdjacentHTML("afterbegin", markup);
      const el = document.querySelector(`#task-${tasks.id}`);

      if (checked === true) {
        el.childNodes[0].classList.toggle("list__task--checked");
        el.childNodes[1].classList.toggle("list__task--text--checked");
      }
    },

    checkedTaskList: function(id) {
      const taskID = "task-" + id;

      const el = document.querySelectorAll(DOMString.listTask);

      for (i = 0; i < el.length; i++) {
        const listID = el[i].id;

        if (taskID === listID) {
          if (!(el[i].childNodes[0].classList.contains("list__task--checked"))) {
            putFetchAsync(`/api/list/done/${id}`, {
              completed: 1
            });
          }
          if (el[i].childNodes[0].classList.contains("list__task--checked")) {
            putFetchAsync(`/api/list/done/${id}`, {
              completed: 0
            });
          }
          el[i].childNodes[0].classList.toggle("list__task--checked");
          el[i].childNodes[1].classList.toggle("list__task--text--checked");
          console.log("TASK", id, "CHECKED");
        }
      }
    },

    deleteTaskList: function(id) {
      const el = document.getElementById("task-" + id);
      el.parentNode.removeChild(el);

      console.log("TASK", id, "REMOVED")

    },

    displayMonth: function() {
      const now = new Date();

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];

      const day = now.getDate();
      const month = now.getMonth();
      const year = now.getFullYear();

      document.querySelector(DOMString.day).textContent = day;
      document.querySelector(DOMString.month).textContent = months[month];
      document.querySelector(DOMString.year).textContent = year;
    }
  };
})();

const TodolistController = (function() {
  const data = [];

  const Task = function(id, value) {
    (this.id = id), (this.value = value);
  };

  return {
    testModel: function() {
      console.log("Call from Model");
    },

    pushData: function(task) {
      data.push(task);
    },

    createNewTask: async function(value) {
      const newTask = { value: value };
      const res = await postFetchAsync("/api/list", newTask);
      const results = JSON.parse(res);
      const ID = results.id;
      const addItem = new Task(ID, value);

      data.push(addItem);

      console.log("NEW TASK", addItem);
      return addItem;
    },

    deleteTask: function(id) {
      const ids = data.map(current => {
        return current.id;
      });

      putFetchAsync(`/api/list/hide/${id}`);

      const index = ids.indexOf(parseInt(id));
      if (index !== -1) {
        data.splice(index, 1);
      }
    }
  };
})();

const MainController = (function(TodoCtrl, UICtrl) {
  const setupEventListener = function() {
    const DOM = UICtrl.getDOMString();

    document.querySelector(DOM.addBtn).addEventListener("click", ctrlAdd);

    document.querySelector(DOM.addInput).addEventListener("keypress", e => {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAdd();
      }
    });

    document
      .querySelector(DOM.taskListContainer)
      .addEventListener("click", ctrlEventCheck);
  };

  const ctrlAdd = async function() {
    const item = UICtrl.getInput();

    if (item !== "" && item !== " ") {
      const tasks = await TodoCtrl.createNewTask(item);
      UICtrl.addTaskList(tasks);
      UICtrl.clearInput();
    }
  };

  const ctrlEventCheck = function(event) {
    const itemID = event.target.parentNode.parentNode.id;
    const itemClass = event.target.parentNode.id;

    const IdSplit = itemID.split("-");

    const ID = IdSplit[1];

    if (itemClass === "check") {
      UICtrl.checkedTaskList(ID);
    } else if (itemClass === "del") {
      TodoCtrl.deleteTask(ID);
      UICtrl.deleteTaskList(ID);
    }
  };

  return {
    init: async function() {
      console.log("script.js : connecting..");
      setupEventListener();
      UICtrl.displayMonth();

      // TODO - Retrieve items from API - ONLY GET ITEMS THAT ARE NOT HIDDEN
      const items = await new Promise(
        resolve => setTimeout(
          () => resolve([
            { id: 1, value: "Task 1", checked: true },
            { id: 2, value: "Task 2", checked: false }
          ]), 500))

      for (const item of items) {
        const task = { id: item.id, value: item.value };
        TodoCtrl.pushData(task);
        console.log(task);
        UICtrl.addTaskList(task, item.checked);
      }
    }
  };
})(TodolistController, UIController);

MainController.init();
