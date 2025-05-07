const timerAudio = new Audio('./assets/audio/timer.mp3');
timerAudio.load(); // Preload audio

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
    addSortingControls(); // Add sorting controls after tasks are loaded
});

// Removed toggleDarkMode function

function createTaskElement(text, completed, isPersonal = false, isHighPriority = false) {
    const li = document.createElement("li");
    li.dataset.sectionId = ""; // Add a data attribute to store the section ID
    li.classList.toggle('high-priority', isHighPriority); // Add high-priority class if applicable

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
    hideImage.style.width = "28px"; // Adjust size as needed
    hideImage.style.height = "28px";
    hideButton.appendChild(hideImage);
    hideButton.onclick = () => {
        hideTask(li, text);
    };

    const priorityButton = document.createElement("button");
    const priorityImage = document.createElement("img");
    priorityImage.src = "./assets/site/high-p.png"; // Use the high-priority icon image
    priorityImage.alt = "High Priority Icon";
    priorityImage.style.width = "20px"; // Adjust size as needed
    priorityImage.style.height = "20px";
    priorityButton.appendChild(priorityImage);
    priorityButton.title = "Mark as High Priority";
    priorityButton.className = "priority-button";
    priorityButton.onclick = () => {
        li.classList.toggle('high-priority');
        saveTasks();
    };

    label.appendChild(checkbox);
    label.appendChild(span);
    li.appendChild(label);
    li.appendChild(hideButton); // Add the hide button
    li.appendChild(priorityButton); // Add the priority button

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
    const tasks = Array.from(document.querySelectorAll(".checklist li")).map(li => {
        const checkbox = li.querySelector("input[type='checkbox']");
        const span = li.querySelector("span");
        const isHighPriority = li.classList.contains('high-priority');
        return { text: span.textContent, completed: checkbox.checked, isHighPriority };
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function resetCheckboxes(type = "all") {
    const selector = type === "all" 
        ? '.checklist input[type="checkbox"]' 
        : `.checklist[id*="${type.toLowerCase()}"] input[type="checkbox"]`;

    document.querySelectorAll(selector).forEach(checkbox => {
        checkbox.checked = false; // Uncheck all matching checkboxes
    });
    saveProgress();
    updateProgressBars(); // Reset progress bars after unchecking all checkboxes
}

function filterTasks() {
    const query = document.querySelector('.search-bar').value.toLowerCase(); // Fixed selector
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const cardId = card.id;
        const isProgressBarCard = cardId === 'progress-bars-container';
        const isResetCard = cardId === 'reset-card';
        const isPersonalCard = cardId === 'personal-tasks';

        if (isProgressBarCard || isResetCard || isPersonalCard) {
            card.style.display = ''; // Always show progress bar, reset card, and personal card
            return;
        }

        const tasks = card.querySelectorAll('.checklist li');
        let hasMatch = false;

        tasks.forEach(task => {
            const text = task.textContent.toLowerCase();
            if (text.includes(query)) {
                task.style.display = '';
                hasMatch = true;
            } else {
                task.style.display = 'none';
            }
        });

        // Show or hide the card based on whether it has matching tasks
        card.style.display = hasMatch ? '' : 'none';
    });

    // If the search bar is cleared, ensure all cards are displayed
    if (!query) {
        cards.forEach(card => {
            card.style.display = '';
        });
    }
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

            const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

            data.forEach(world => {
                const card = document.createElement('div');
                card.className = 'card';

                card.dataset.world = world.name;
                
                if (world.name === 'General') card.classList.add('general-card');

                const cardInner = document.createElement('div');
                cardInner.className = 'card-inner';

                const bannerWrapper = document.createElement('div');
                bannerWrapper.className = 'banner-wrapper';

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
                        const savedTask = savedTasks.find(t => t.text === task);
                        const listItem = createTaskElement(
                            task,
                            savedTask?.completed || false,
                            false,
                            savedTask?.isHighPriority || false
                        );
                        listItem.dataset.sectionId = checklist.id; // Store the section ID
                        checklist.appendChild(listItem);
                    });

                    cardContent.appendChild(checklist);
                });

                bannerWrapper.appendChild(banner);

                cardInner.appendChild(bannerWrapper);
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
    const endTime = Date.now() + minutes * 60 * 1000; // Calculate the end time

    clearInterval(timerIntervals[timerId]);

    const updateDisplay = () => {
        const timeRemaining = Math.max(0, endTime - Date.now()); // Calculate remaining time
        const mins = Math.floor(timeRemaining / 60000);
        const secs = Math.floor((timeRemaining % 60000) / 1000);
        timerElement.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (timeRemaining <= 0) {
            clearInterval(timerIntervals[timerId]);
            timerAudio.currentTime = 0; // Reset audio to the beginning
            timerAudio.play().catch(error => console.error('Error playing audio:', error));
        }
    };

    updateDisplay(); // Show initial time immediately

    timerIntervals[timerId] = setInterval(updateDisplay, 1000); // Update every second

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
        const li = createTaskElement(task.text, task.completed, true, task.isHighPriority);
        personalTasksList.appendChild(li);
    });
}

function sortTasks(sectionId, sortBy = 'alphabetical') {
    const checklist = document.getElementById(sectionId);
    if (!checklist) return;

    const tasks = Array.from(checklist.children);

    tasks.sort((a, b) => {
        if (sortBy === 'priority') {
            const aPriority = a.classList.contains('high-priority') ? 1 : 0;
            const bPriority = b.classList.contains('high-priority') ? 1 : 0;
            return bPriority - aPriority || a.textContent.localeCompare(b.textContent);
        } else if (sortBy === 'alphabetical') {
            return a.textContent.localeCompare(b.textContent);
        }
    });

    tasks.forEach(task => checklist.appendChild(task));
}

function addSortingControls() {
    document.querySelectorAll('.card-content').forEach(content => {
        const checklist = content.querySelector('.checklist');
        if (!checklist) return;

        const sectionId = checklist.id;

        const sortContainer = document.createElement('div');
        sortContainer.className = 'sort-container';

        const sortAlphabeticalButton = document.createElement('button');
        sortAlphabeticalButton.textContent = 'Sort A-Z';
        sortAlphabeticalButton.className = 'sort-button';
        sortAlphabeticalButton.onclick = () => sortTasks(sectionId, 'alphabetical');

        const sortPriorityButton = document.createElement('button');
        sortPriorityButton.textContent = 'Sort by Priority';
        sortPriorityButton.className = 'sort-button';
        sortPriorityButton.onclick = () => sortTasks(sectionId, 'priority');

        sortContainer.appendChild(sortAlphabeticalButton);
        sortContainer.appendChild(sortPriorityButton);

        content.insertBefore(sortContainer, checklist);
    });
}
