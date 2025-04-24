// Select DOM elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

// Load tasks from local storage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(task => addTaskToDOM(task));
}

// Add task to DOM
function addTaskToDOM(task) {
  const li = document.createElement('li');
  li.textContent = task;

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    li.remove();
    deleteTaskFromStorage(task);
  });

  li.appendChild(deleteButton);
  todoList.appendChild(li);
}

// Add task to local storage
function addTaskToStorage(task) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Delete task from local storage
function deleteTaskFromStorage(task) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const updatedTasks = tasks.filter(t => t !== task);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

// Handle form submission
todoForm.addEventListener('submit', event => {
  event.preventDefault();
  const task = todoInput.value.trim();
  if (task) {
    addTaskToDOM(task);
    addTaskToStorage(task);
    todoInput.value = '';
  }
});

// Load tasks on page load
loadTasks();
