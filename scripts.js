document.addEventListener("DOMContentLoaded", () => {
    // Removed dark mode toggle logic
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

    loadHiddenTasks();
    loadPersonalTasks();
});

// Removed toggleDarkMode function

function createTaskElement(text, completed, isPersonal = false) {
    const li = document.createElement("li");
    li.dataset.sectionId = ""; // Add a data attribute to store the section ID
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

    const hideButton = document.createElement("button");
    const hideImage = document.createElement("img");
    hideImage.src = "./assets/site/Vector 2.png"; // Use the eye icon image
    hideImage.alt = "Hide Icon";
    hideImage.style.width = "20px"; // Adjust size as needed
    hideImage.style.height = "20px";
    hideButton.appendChild(hideImage);
    hideButton.onclick = () => {
        hideTask(li, text);
    };

    label.appendChild(checkbox);
    label.appendChild(span);
    li.appendChild(label);
    li.appendChild(hideButton); // Add the hide button

    if (isPersonal) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.title = "Delete Task"; // Tooltip for better clarity
        deleteButton.onclick = () => {
            li.remove();
            saveTasks();
            updateProgressBars(); // Update progress bar after removing a task
        };
        li.appendChild(deleteButton); // Add the delete button only for personal tasks
    }

    return li;
}

function addPersonalTask() {
    const taskText = prompt("Enter your task:");
    if (taskText) {
        const taskList = document.getElementById("personal-tasks");
        const li = createTaskElement(taskText, false, true); // Pass `true` for personal tasks
        taskList.appendChild(li);
        updateProgressBars(); // Update progress bar after adding a task
    }
}

function hideTask(taskElement, text) {
    const hiddenTasksList = document.getElementById("hidden-tasks");
    const hiddenTask = document.createElement("li");
    hiddenTask.textContent = text;

    const restoreButton = document.createElement("button");
    const restoreImage = document.createElement("img");
    restoreImage.src = "./assets/site/111 1.png"; // Use the return icon image
    restoreImage.alt = "Restore Icon";
    restoreImage.style.width = "20px"; // Adjust size as needed
    restoreImage.style.height = "20px";
    restoreButton.appendChild(restoreImage);
    restoreButton.onclick = () => {
        const originalSectionId = taskElement.dataset.sectionId; // Retrieve the original section ID
        restoreTask(hiddenTask, text, originalSectionId);
    };

    hiddenTask.appendChild(restoreButton);
    hiddenTasksList.appendChild(hiddenTask);

    taskElement.remove();
    saveHiddenTasks(); // Save hidden tasks
    updateProgressBars(); // Update progress bar after hiding a task
}

function restoreTask(hiddenTaskElement, text, sectionId) {
    const originalSection = document.getElementById(sectionId); // Use the section ID to find the original checklist
    if (originalSection) {
        const isPersonal = sectionId === "personal-tasks"; // Check if the task belongs to the personal section
        const restoredTask = createTaskElement(text, false, isPersonal); // Pass `isPersonal` to control delete button
        restoredTask.dataset.sectionId = sectionId; // Ensure the restored task retains its section ID
        originalSection.appendChild(restoredTask);
    }

    hiddenTaskElement.remove();
    saveHiddenTasks(); // Save hidden tasks
    updateProgressBars(); // Update progress bar after restoring a task
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
            const progressBarsContainer = document.getElementById('progress-bars-container'); // Updated container

            data.forEach(world => {
                const card = document.createElement('div');
                card.className = 'card';

                card.dataset.world = world.name;
                
                if (world.name === 'General') card.classList.add('general-card');

                const cardInner = document.createElement('div');
                cardInner.className = 'card-inner';

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
                    checklist.id = `${world.name.toLowerCase().replace(/\s+/g, '-')}-${taskGroup.type.toLowerCase().replace(/\s+/g, '-')}`;

                    taskGroup.items.forEach(task => {
                        const listItem = document.createElement('li');
                        listItem.dataset.sectionId = checklist.id; // Store the section ID
                        const label = document.createElement('label');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.addEventListener('change', updateProgressBars);

                        const span = document.createElement('span');
                        span.textContent = task;

                        const hideButton = document.createElement('button');
                        const hideImage = document.createElement("img");
                        hideImage.src = "./assets/site/Vector 2.png"; // Use the eye icon image
                        hideImage.alt = "Hide Icon";
                        hideImage.style.width = "20px"; // Adjust size as needed
                        hideImage.style.height = "20px";
                        hideButton.appendChild(hideImage);
                        hideButton.onclick = () => {
                            hideTask(listItem, task);
                        };

                        label.appendChild(checkbox);
                        label.appendChild(span);
                        listItem.appendChild(label);
                        listItem.appendChild(hideButton); // Add the hide button
                        checklist.appendChild(listItem);
                    });

                    cardContent.appendChild(checklist);
                });

                cardInner.appendChild(banner);
                cardInner.appendChild(cardContent);

                card.appendChild(cardInner);

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
                progressBarsContainer.appendChild(progressBar); // Append to the correct container
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
        const progressPercentage = (worldChecked / worldCheckboxes.length) * 100 || 0;
        worldProgress.style.width = `${progressPercentage}%`;
        worldProgress.classList.toggle('glow', progressPercentage === 100); // Add glow if 100%
    });

    const personalCheckboxes = document.querySelectorAll('#personal-tasks input[type="checkbox"]');
    const personalChecked = Array.from(personalCheckboxes).filter(checkbox => checkbox.checked).length;
    const personalProgress = document.getElementById('personal-progress');
    const personalPercentage = (personalChecked / personalCheckboxes.length) * 100 || 0;
    personalProgress.style.width = `${personalPercentage}%`;
    personalProgress.classList.toggle('glow', personalPercentage === 100); // Add glow if 100%

    const totalProgress = document.getElementById('total-progress');
    const totalPercentage = (totalChecked / totalCheckboxes) * 100 || 0;
    totalProgress.style.width = `${totalPercentage}%`;
    totalProgress.classList.toggle('glow', totalPercentage === 100); // Add glow if 100%
}

let timerIntervals = {};

function startTimer(timerId, minutes) {
    const timerElement = document.getElementById(timerId);
    const startButton = document.querySelector(`[onclick="startTimer('${timerId}', ${minutes})"]`);
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

    // Change the button label to "Restart"
    startButton.textContent = "Restart";
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

function saveHiddenTasks() {
    const hiddenTasks = Array.from(document.getElementById("hidden-tasks").children).map(li => li.textContent.replace("↩️", "").trim());
    localStorage.setItem("hiddenTasks", JSON.stringify(hiddenTasks));
}

function loadHiddenTasks() {
    const hiddenTasks = JSON.parse(localStorage.getItem("hiddenTasks") || "[]");
    const hiddenTasksList = document.getElementById("hidden-tasks");
    hiddenTasks.forEach(text => {
        const hiddenTask = document.createElement("li");
        hiddenTask.textContent = text;

        const restoreButton = document.createElement("button");
        const restoreImage = document.createElement("img");
        restoreImage.src = "./assets/site/111 1.png"; // Use the return icon image
        restoreImage.alt = "Restore Icon";
        restoreImage.style.width = "20px"; // Adjust size as needed
        restoreImage.style.height = "20px";
        restoreButton.appendChild(restoreImage);
        restoreButton.onclick = () => {
            restoreTask(hiddenTask, text, ""); // Section ID will be empty for now
        };

        hiddenTask.appendChild(restoreButton);
        hiddenTasksList.appendChild(hiddenTask);
    });
}

function savePersonalTasks() {
    const personalTasks = Array.from(document.getElementById("personal-tasks").children).map(li => {
        const checkbox = li.querySelector("input[type='checkbox']");
        const span = li.querySelector("span");
        return { text: span.textContent, completed: checkbox.checked };
    });
    localStorage.setItem("personalTasks", JSON.stringify(personalTasks));
}

function loadPersonalTasks() {
    const personalTasks = JSON.parse(localStorage.getItem("personalTasks") || "[]");
    const personalTasksList = document.getElementById("personal-tasks");
    personalTasks.forEach(task => {
        const li = createTaskElement(task.text, task.completed, true);
        personalTasksList.appendChild(li);
    });
}
