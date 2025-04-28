// Load dark mode preference and personal tasks from localStorage
document.addEventListener("DOMContentLoaded", () => {
    const isDarkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
    }

    const savedTasks = JSON.parse(localStorage.getItem("personalTasks")) || [];
    const taskList = document.getElementById("personal-tasks");
    savedTasks.forEach(task => {
        const li = createTaskElement(task.text, task.completed);
        taskList.appendChild(li);
    });
});

// Toggle dark mode and save preference
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle("dark-mode");
    const isDarkMode = body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
}

// Add a new personal task
function addPersonalTask() {
    const taskText = prompt("Enter your task:");
    if (taskText) {
        const taskList = document.getElementById("personal-tasks");
        const li = createTaskElement(taskText, false);
        taskList.appendChild(li);
        saveTasks();
    }
}

// Create a task element
function createTaskElement(text, completed) {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;
    checkbox.onchange = saveTasks;

    const span = document.createElement("span");
    span.textContent = text;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "❌";
    deleteButton.style.marginLeft = "10px"; // Add spacing
    deleteButton.onclick = () => {
        li.remove();
        saveTasks();
    };

    label.appendChild(checkbox);
    label.appendChild(span);
    li.appendChild(label);
    li.appendChild(deleteButton);
    return li;
}

// Save personal tasks to localStorage
function saveTasks() {
    const taskList = document.getElementById("personal-tasks");
    const tasks = Array.from(taskList.children).map(li => {
        const checkbox = li.querySelector("input[type='checkbox']");
        const span = li.querySelector("span");
        return { text: span.textContent, completed: checkbox.checked };
    });
    localStorage.setItem("personalTasks", JSON.stringify(tasks));
}

// Reset all checkboxes
function resetCheckboxes() {
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    updateProgress();
    saveProgress();
}

// Update progress bar
function updateProgress() {
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    const checked = document.querySelectorAll('.checklist input[type="checkbox"]:checked');
    const progress = Math.round((checked.length / checkboxes.length) * 100);
    document.getElementById('progress-bar').value = progress;
    document.getElementById('progress-text').textContent = `${progress}% Completed`;
}

// Filter tasks by search input
function filterTasks() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    const tasks = document.querySelectorAll('.checklist li');
    tasks.forEach(task => {
        const text = task.textContent.toLowerCase();
        task.style.display = text.includes(query) ? '' : 'none';
    });
}

// Save checkbox states to local storage
function saveProgress() {
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    const states = Array.from(checkboxes).map(checkbox => checkbox.checked);
    localStorage.setItem('checkboxStates', JSON.stringify(states));
}

// Load checkbox states from local storage
function loadProgress() {
    const states = JSON.parse(localStorage.getItem('checkboxStates') || '[]');
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = states[index] || false;
    });
    updateProgress();
}

// Add collapsible functionality to categories
function setupCollapsibleSections() {
    const headers = document.querySelectorAll('.card h3');
    headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const list = header.nextElementSibling;
            list.style.display = list.style.display === 'none' ? '' : 'none';
        });
    });
}

// Allow adding new tasks
function addTask(category, taskText) {
    const list = document.querySelector(`.card h3:contains(${category})`).nextElementSibling;
    const newTask = document.createElement('li');
    newTask.innerHTML = `<input type="checkbox"> ${taskText} <span class="hint" data-hint="Hint: Custom">?</span>`;
    list.appendChild(newTask);
    updateProgress();
    saveProgress();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    setupCollapsibleSections();
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateProgress();
            saveProgress();
        });
    });

    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                e.target.parentElement.classList.add('task-completed');
                setTimeout(() => {
                    e.target.parentElement.classList.remove('task-completed');
                }, 500);
            }
        });
    });
});
