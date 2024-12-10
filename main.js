// Select DOM elements
const todoForm = document.querySelector("form"); // The form for adding new todos
const todoInput = document.getElementById("todo-input"); // Input field for new todos
const todoListUL = document.getElementById("todo-list"); // Unordered list to display todos

// Create and position notification element
const notificationElement = document.createElement("div");
notificationElement.id = "notification";
notificationElement.className = "notification";
document
  .querySelector(".wrapper")
  .insertBefore(notificationElement, todoListUL);

// Initialize todos from local storage
let allTodos = getTodos();
updateTodoList(); // Render todos on page load

// Event listener for form submission
todoForm.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form submission
  addTodo();
});

/**
 * Show notification message
 * @param {string} message message - Text to display in the notification
 * @param {string} type type - Type of notification (success, error, edit)
 */
function showNotification(message, type) {
  notificationElement.textContent = message;
  notificationElement.className = `notification ${type}`;
  notificationElement.style.display = "block";

  setTimeout(() => {
    notificationElement.style.display = "none";
  }, 3000);
}
/**
 * Add a new todo item to the list
 */
function addTodo() {
  const todoText = todoInput.value.trim();
  if (todoText.length > 0) {
    // Create todo object
    const todoObject = {
      text: todoText,
      completed: false, // New todos start as incomplete
    };
    // Add to todos array
    allTodos.push(todoObject);

    // Update UI and local storage
    updateTodoList();
    saveTodos();
    todoInput.value = "";
    showNotification("Task added successfully!", "success");
  }
}

/**
 * Update the entire todo list in the DOM
 */
function updateTodoList() {
  // Clear existing list
  todoListUL.innerHTML = "";

  // Create and append each todo item
  allTodos.forEach((todo, todoIndex) => {
    todoItem = createTodoItem(todo, todoIndex);
    todoListUL.append(todoItem);
  });
}

/**
 * Create a DOM element for a single todo item
 * @param {Object} todo - Todo item object
 * @param {number} todoIndex - Index of the todo in the array
 * @returns {HTMLElement} Created todo list item
 */

function createTodoItem(todo, todoIndex) {
  // Generate unique ID for checkbox and labels
  const todoId = `todo-${todoIndex}`;
  // Create list item element
  const todoLI = document.createElement("li");
  const todoText = todo.text;
  todoLI.className = "todo";
  todoLI.innerHTML = `
   <input type="checkbox" id="${todoId}" />
          <label class="custom-checkbox" for="${todoId}">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="transparent"
            >
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
            </svg>
          </label>
          <label for="${todoId}" class="todo-text">
            ${todoText}
          </label>
          <button class="edit-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="var(--secondary-color)"
            >
              <path
                d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"
              />
            </svg>
          </button>
          <button class="delete-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="var(--secondary-color)"
            >
              <path
                d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
              />
            </svg>
          </button>
  `;

  // Delete button functionality
  const deleteButton = todoLI.querySelector(".delete-button");
  deleteButton.addEventListener("click", () => {
    deleteTodoItem(todoIndex);
  });

  // Checkbox functionality
  const checkbox = todoLI.querySelector("input");
  checkbox.addEventListener("change", () => {
    // Update completed status in todos array
    allTodos[todoIndex].completed = checkbox.checked;
    saveTodos();
  });
  checkbox.checked = todo.completed;

  // Edit button functionality
  const editButton = todoLI.querySelector(".edit-button");
  const todoTextLabel = todoLI.querySelector(".todo-text");
  editButton.addEventListener("click", () => {
    // Disable checkbox to prevent interactions during edit
    checkbox.disabled = true;
    // Store current text
    const currentText = todo.text;

    // Create edit input
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = currentText;
    editInput.className = "edit-input";

    // Create save button
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.className = "save-edit-button";

    // Create a container for input and save button
    const editContainer = document.createElement("div");
    editContainer.className = "edit-container";
    editContainer.appendChild(editInput);
    editContainer.appendChild(saveButton);

    /**
     * Save edited todo text
     */
    function saveEdit() {
      // Clean and validate new text
      const newText = editInput.value.trim();
      if (newText && newText !== currentText) {
        // Update todo text
        allTodos[todoIndex].text = newText;
        saveTodos();
        updateTodoList(); // Refresh list
        showNotification("Task Updated Successfully!", "edit");
      } else if (!newText) {
        showNotification("Task Cannot Be Empty!", "error");
      }
    }

    // Add event listeners for saving
    editInput.addEventListener("blur", saveEdit); // On losing focus
    editInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        // On Enter key
        saveEdit();
      }
    });
    saveButton.addEventListener("click", saveEdit); // On save button click

    // Replace text with edit input
    todoTextLabel.replaceWith(editContainer);
    // Focus on input
    editInput.focus();
  });

  return todoLI;
}

/**
 * Delete a specific todo item
 * @param {number} todoIndex - Index of todo to delete
 */

function deleteTodoItem(todoIndex) {
  // Filter out the todo at the given index
  allTodos = allTodos.filter((_, i) => i !== todoIndex);

  // Update storage and UI
  saveTodos();
  updateTodoList();
  showNotification("Task deleted successfully!", "error");
}

function saveTodos() {
  // Convert todos to JSON string
  const todoJson = JSON.stringify(allTodos);
  // Store in browser's local storage
  localStorage.setItem("todos", todoJson);
}

/**
 * Retrieve todos from local storage
 * @returns {Array} Array of todo objects
 */
function getTodos() {
  // Get todos from local storage or return empty array
  const todos = localStorage.getItem("todos") || "[]";
  return JSON.parse(todos);
}
