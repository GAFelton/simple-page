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

      const html = `<li class='list__task' id='task-%id%'><button class='list__task--${
        checked ? "checked" : "check"
      }' id='check'><i class='ion-ios-checkmark'></i></button><div class='list__task--text${
        checked ? "--checked" : ""
      }'>%description%</div><button class='list__task--del' id='del'><i class='ion-android-delete'></i></button></li>`;

      markup = html.replace("%id%", tasks.id);
      markup = markup.replace("%description%", tasks.description);

      document.querySelector(element).insertAdjacentHTML("afterbegin", markup);
    },

    checkedTaskList: function(id) {
      const taskID = "task-" + id;

      const el = document.querySelectorAll(DOMString.listTask);

      for (i = 0; i < el.length; i++) {
        const listID = el[i].id;

        if (taskID === listID) {
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

  const Task = function(id, description) {
    (this.id = id), (this.description = description);
  };

  return {
    testModel: function() {
      console.log("Call from Model");
    },

    createNewTask: function(desc) {
      let addItem, ID;

      const dbItem = await new Promise(
        resolve => setTimeout(
          () => resolve([
            {title: "Task 1", checked: true},
            {title: "Task 2", checked: false}
          ]), 500))

      if (data.length > 0) {
        for (i = 0; i < data.length; i++) {
          ID = i + 1;
          addItem = new Task(ID, desc);
        }
      } else {
        ID = 0;
        addItem = new Task(ID, desc);
      }

      data.push(addItem);

      console.log("NEW TASK", addItem)
      return addItem;
    },

    deleteTask: function(id) {
      const ids = data.map(current => {
        return current.id;
      });

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

  const ctrlAdd = function() {
    const item = UICtrl.getInput();

    if (item !== "" && item !== " ") {
      const tasks = TodoCtrl.createNewTask(item);

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

      // TODO - Retrieve items from API
      const items = await new Promise(
        resolve => setTimeout(
          () => resolve([
            {title: "Task 1", checked: true},
            {title: "Task 2", checked: false}
          ]), 500))

      for (const item of items) {
        const task = TodoCtrl.createNewTask(item.title);
  
        UICtrl.addTaskList(task, item.checked);
        
      }
    }
  };
})(TodolistController, UIController);

MainController.init();
