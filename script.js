const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");
const filterButtons = document.querySelectorAll(".filters button");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

let currentFilter = localStorage.getItem("taskFilter") || "all";
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

document.addEventListener("DOMContentLoaded", () => {
  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });
  renderTasks();
});

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});
addTaskBtn.addEventListener("click", addTask);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    localStorage.setItem("taskFilter", currentFilter);
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  renderTasks();
});

function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    alert("Digite uma tarefa!");
    return;
  }
  tasks.push({ text, completed: false });
  saveTasks();
  renderTasks();
  taskInput.value = "";
}

function renderTasks() {
  taskList.innerHTML = "";

  const container = document.querySelector(".container");
  if (tasks.length > 0) container.classList.add("has-tasks");
  else container.classList.remove("has-tasks");

  let filteredTasks = tasks;
  if (currentFilter === "pending")
    filteredTasks = tasks.filter((t) => !t.completed);
  if (currentFilter === "completed")
    filteredTasks = tasks.filter((t) => t.completed);

  filteredTasks.forEach((task) => {
    const index = tasks.indexOf(task);
    const li = document.createElement("li");
    li.setAttribute("draggable", "true");
    if (task.completed) li.classList.add("completed");

    // Drag and Drop
    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index);
      li.classList.add("dragging");
    });
    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
    });
    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      const draggingLi = document.querySelector(".dragging");
      const bounding = li.getBoundingClientRect();
      const offset = e.clientY - bounding.top;
      const nextSibling = offset > bounding.height / 2 ? li.nextSibling : li;
      taskList.insertBefore(draggingLi, nextSibling);
    });
    li.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
      const draggedTask = tasks[draggedIndex];
      tasks.splice(draggedIndex, 1);
      const newIndex = Array.from(taskList.children).indexOf(li);
      tasks.splice(newIndex, 0, draggedTask);
      saveTasks();
      renderTasks();
    });

    // Concluir
    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✔️";
    completeBtn.classList.add("complete-btn");
    completeBtn.addEventListener("click", () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    // Texto
    const span = document.createElement("span");
    span.textContent = task.text;

    // Excluir
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.append(completeBtn, span, deleteBtn);
    taskList.appendChild(li);
  });

  updateCounter();
}

function updateCounter() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  taskCounter.textContent = `${total} tarefas • ${completed} concluídas • ${pending} pendentes`;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
