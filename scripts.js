document.addEventListener("DOMContentLoaded", () => {
    const isDarkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
    if (isDarkMode) document.body.classList.add("dark-mode");

    loadTasks();
    setupCollapsibleSections();
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', saveProgress);
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                e.target.parentElement.classList.add('task-completed');
                setTimeout(() => e.target.parentElement.classList.remove('task-completed'), 500);
            }
        });
    });
});

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", JSON.stringify(body.classList.contains("dark-mode")));
}

function addPersonalTask() {
    const taskText = prompt("Enter your task:");
    if (taskText) {
        const taskList = document.getElementById("personal-tasks");
        const li = createTaskElement(taskText, false);
        taskList.appendChild(li);
        saveTasks();
    }
}

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
    deleteButton.style.marginLeft = "10px";
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

function saveTasks() {
    const tasks = Array.from(document.getElementById("personal-tasks").children).map(li => {
        const checkbox = li.querySelector("input[type='checkbox']");
        const span = li.querySelector("span");
        return { text: span.textContent, completed: checkbox.checked };
    });
    localStorage.setItem("personalTasks", JSON.stringify(tasks));
}

function resetCheckboxes() {
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    saveProgress();
}

function filterTasks() {
    const query = document.querySelector('.search-bar').value.toLowerCase(); // Fixed selector
    document.querySelectorAll('.checklist li').forEach(task => {
        task.style.display = task.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
}

function saveProgress() {
    const states = Array.from(document.querySelectorAll('.checklist input[type="checkbox"]')).map(checkbox => checkbox.checked);
    localStorage.setItem('checkboxStates', JSON.stringify(states));
}

function loadProgress() {
    const states = JSON.parse(localStorage.getItem('checkboxStates') || '[]');
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach((checkbox, index) => {
        checkbox.checked = states[index] || false;
    });
}

function setupCollapsibleSections() {
    document.querySelectorAll('.card h3').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const list = header.nextElementSibling;
            list.style.display = list.style.display === 'none' ? '' : 'none';
        });
    });
}

function loadTasks() {
    fetch('./tasks.json') // Ensure the correct relative path to tasks.json
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('task-container');
            data.forEach(world => {
                const card = document.createElement('div');
                card.className = 'card';

                const banner = document.createElement('img');
                banner.src = world.banner;
                banner.alt = `${world.name} Banner`;
                banner.className = 'banner';

                const cardContent = document.createElement('div');
                cardContent.className = 'card-content';

                const title = document.createElement('h3');
                title.textContent = world.name;

                cardContent.appendChild(title);

                world.tasks.forEach(taskGroup => {
                    const groupTitle = document.createElement('h4');
                    groupTitle.textContent = taskGroup.type;
                    cardContent.appendChild(groupTitle);

                    const checklist = document.createElement('ul');
                    checklist.className = 'checklist';

                    taskGroup.items.forEach(task => {
                        const listItem = document.createElement('li');
                        listItem.textContent = task;
                        checklist.appendChild(listItem);
                    });

                    cardContent.appendChild(checklist);
                });

                card.appendChild(banner);
                card.appendChild(cardContent);
                container.appendChild(card);
            });
        })
        .catch(error => console.error('Error loading tasks:', error));
}
