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
        updateProgressBars(); // Update progress bar after adding a task
    }
}

function createTaskElement(text, completed) {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;
    checkbox.addEventListener('change', () => {
        saveTasks();
        updateProgressBars(); // Update progress bar on checkbox change
    });

    const span = document.createElement("span");
    span.textContent = text;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "❌";
    deleteButton.onclick = () => {
        li.remove();
        saveTasks();
        updateProgressBars(); // Update progress bar after removing a task
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
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false; // Uncheck all checkboxes
    });
    saveProgress();
    updateProgressBars(); // Reset progress bars after unchecking all checkboxes
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
    fetch('./tasks.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const generalContainer = document.getElementById('general-container');
            const worldsContainer = document.getElementById('worlds-container');
            const completionCard = document.querySelector('.completion-card');

            data.forEach(world => {
                const card = document.createElement('div');
                card.className = 'card';
                if (world.name === 'General') card.classList.add('general-card');

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
                        const label = document.createElement('label');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.addEventListener('change', updateProgressBars);

                        const span = document.createElement('span');
                        span.textContent = task;

                        label.appendChild(checkbox);
                        label.appendChild(span);
                        listItem.appendChild(label);
                        checklist.appendChild(listItem);
                    });

                    cardContent.appendChild(checklist);
                });

                card.appendChild(banner);
                card.appendChild(cardContent);

                if (world.name === 'General') {
                    generalContainer.appendChild(card);
                } else {
                    worldsContainer.appendChild(card);
                }
            });

            // Add progress bars
            const progressBars = [
                { label: 'Total', id: 'total-progress' },
                { label: 'World 1', id: 'world-1-progress' },
                { label: 'World 2', id: 'world-2-progress' },
                { label: 'World 3', id: 'world-3-progress' },
                { label: 'World 4', id: 'world-4-progress' },
                { label: 'World 5', id: 'world-5-progress' },
                { label: 'World 6', id: 'world-6-progress' },
                { label: 'Personal', id: 'personal-progress' }
            ];

            progressBars.forEach(bar => {
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';

                const label = document.createElement('span');
                label.textContent = bar.label;

                const barContainer = document.createElement('div');
                barContainer.className = 'bar';

                const fill = document.createElement('div');
                fill.className = 'fill';
                fill.id = bar.id;

                barContainer.appendChild(fill);
                progressBar.appendChild(label);
                progressBar.appendChild(barContainer);
                completionCard.appendChild(progressBar);
            });

            loadProgress();
            updateProgressBars(); // Initialize progress bars
        })
        .catch(error => console.error('Error loading tasks:', error));
}

function updateProgressBars() {
    const allCheckboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    const totalChecked = Array.from(allCheckboxes).filter(checkbox => checkbox.checked).length;
    const totalCheckboxes = allCheckboxes.length;

    const worlds = ['World 1', 'World 2', 'World 3', 'World 4', 'World 5', 'World 6'];
    worlds.forEach((world, index) => {
        const worldCheckboxes = document.querySelectorAll(`#worlds-container .card:nth-child(${index + 1}) .checklist input[type="checkbox"]`);
        const worldChecked = Array.from(worldCheckboxes).filter(checkbox => checkbox.checked).length;
        const worldProgress = document.getElementById(`world-${index + 1}-progress`);
        worldProgress.style.width = `${(worldChecked / worldCheckboxes.length) * 100 || 0}%`;
    });

    const personalCheckboxes = document.querySelectorAll('#personal-tasks input[type="checkbox"]');
    const personalChecked = Array.from(personalCheckboxes).filter(checkbox => checkbox.checked).length;
    const personalProgress = document.getElementById('personal-progress');
    personalProgress.style.width = `${(personalChecked / personalCheckboxes.length) * 100 || 0}%`;

    const totalProgress = document.getElementById('total-progress');
    totalProgress.style.width = `${(totalChecked / totalCheckboxes) * 100 || 0}%`;
}

let timerIntervals = {};

function startTimer(timerId, minutes) {
    const timerElement = document.getElementById(timerId);
    let timeRemaining = minutes * 60;

    clearInterval(timerIntervals[timerId]); // Clear any existing timer
    timerIntervals[timerId] = setInterval(() => {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timeRemaining--;

        if (timeRemaining < 0) {
            clearInterval(timerIntervals[timerId]);
            alert(`${timerId.replace('timer-', '')}-Minute Timer Finished!`);
        }
    }, 1000);
}

function resetTimer(timerId, minutes) {
    clearInterval(timerIntervals[timerId]); // Clear the existing timer
    const timerElement = document.getElementById(timerId);
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:00`; // Reset the display
    startTimer(timerId, minutes); // Restart the timer
}

function startCustomTimer() {
    const input = document.getElementById('custom-timer-input');
    const minutes = parseInt(input.value, 10);
    if (isNaN(minutes) || minutes <= 0) {
        alert('Please enter a valid number of minutes.');
        return;
    }
    startTimer('timer-custom', minutes);
}

function resetCustomTimer() {
    const input = document.getElementById('custom-timer-input');
    const minutes = parseInt(input.value, 10) || 0; // Use the current input value or default to 0
    if (minutes > 0) {
        resetTimer('timer-custom', minutes); // Restart the timer with the current input value
    } else {
        alert('Please enter a valid number of minutes to reset the timer.');
    }
}
