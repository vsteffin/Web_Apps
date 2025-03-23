document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const progressBar = document.getElementById('progressBar');
    const completedTaskList = document.getElementById('completedTaskList');
    const excelUpload = document.getElementById('excelUpload');

    let totalTasks = 0;
    let completedTasks = 0;
    let tasksByDate = {};

    function updateProgressBar() {
        if (totalTasks === 0) {
            progressBar.style.width = '0%';
        } else {
            const progress = (completedTasks / totalTasks) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        Object.keys(tasksByDate).forEach((date) => {
            const dateHeader = document.createElement('li');
            dateHeader.innerHTML = `<strong>${date}</strong>`;
            taskList.appendChild(dateHeader);

            tasksByDate[date].forEach((task) => {
                taskList.appendChild(task.element);
            });
        });
        updateProgressBar();
    }

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const date = taskDate.value;
        if (taskText) {
            addTask(taskText, date);
            taskInput.value = '';
            taskDate.value = '';
        }
    });

    function addTask(taskText, date, isSubtask = false, parentTask = null) {
        totalTasks++;

        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span style="${isSubtask ? 'margin-left: 20px;' : ''}">${taskText}</span>
            <button class="complete">😊</button>
            <button class="incomplete">🙁</button>
            <button class="inprogress">😐</button>
            ${isSubtask ? '' : '<button class="subtask">Subtasks</button>'}
            <button class="delete">Delete</button>
            ${isSubtask ? '' : '<ul class="subtasks" style="display:none;"></ul>'}
        `;

        const taskObject = {
            text: taskText,
            date: date,
            element: listItem,
            isCompleted: false,
            isSubtask: isSubtask,
            parentTask: parentTask
        };

        if (!tasksByDate[date]) {
            tasksByDate[date] = [];
        }
        tasksByDate[date].push(taskObject);

        const completeButton = listItem.querySelector('.complete');
        const incompleteButton = listItem.querySelector('.incomplete');
        const inprogressButton = listItem.querySelector('.inprogress');
        const deleteButton = listItem.querySelector('.delete');
        const subtaskButton = listItem.querySelector('.subtask');
        const subtaskList = listItem.querySelector('.subtasks');

        completeButton.addEventListener('click', () => {
            taskObject.isCompleted = true;
            listItem.querySelector('span').classList.add('completed');
            completeButton.style.display = 'none';
            incompleteButton.style.display = 'none';
            inprogressButton.style.display = 'none';
            completedTasks++;
            renderTasks();
            completedTaskList.appendChild(listItem);
            listItem.querySelector('.delete').remove();

        });

        incompleteButton.addEventListener('click', () => {
            taskObject.isCompleted = false;
            listItem.querySelector('span').classList.remove('completed');
            completeButton.style.display = 'block';
            incompleteButton.style.display = 'block';
            inprogressButton.style.display = 'block';
            if (completedTasks > 0) {
              completedTasks--;
            }
            renderTasks();
        });

        inprogressButton.addEventListener('click', () => {
            taskObject.isCompleted = false;
            listItem.querySelector('span').classList.remove('completed');
            completeButton.style.display = 'block';
            incompleteButton.style.display = 'block';
            inprogressButton.style.display = 'block';
            if (completedTasks > 0) {
              completedTasks--;
            }
            renderTasks();
        });

        deleteButton.addEventListener('click', () => {
            if (taskObject.isCompleted) {
                completedTasks--;
            }
            totalTasks--;
            tasksByDate[date] = tasksByDate[date].filter(task => task !== taskObject);
            if (tasksByDate[date].length === 0) {
                delete tasksByDate[date];
            }
            renderTasks();
        });

        if (subtaskButton) {
            subtaskButton.addEventListener('click', () => {
                if (subtaskList.style.display === 'none') {
                    subtaskList.style.display = 'block';
                    const subtaskInput = document.createElement('input');
                    subtaskInput.type = 'text';
                    const addSubtaskButton = document.createElement('button');
                    addSubtaskButton.textContent = 'Add Subtask';
                    listItem.appendChild(subtaskInput);
                    listItem.appendChild(addSubtaskButton);

                    addSubtaskButton.addEventListener('click', () => {
                        const subtaskText = subtaskInput.value.trim();
                        if (subtaskText) {
                            addTask(subtaskText, date, true, taskObject);
                            subtaskInput.value = '';
                        }
                    });
                } else {
                    subtaskList.style.display = 'none';
                    const subtaskInput = listItem.querySelector('input');
                    const addSubtaskButton = listItem.querySelector('button:last-of-type');
                    if (subtaskInput) {
                        subtaskInput.remove();
                    }
                    if (addSubtaskButton) {
                        addSubtaskButton.remove();
                    }
                }
            });
        }
        renderTasks();
    }

    excelUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                jsonData.forEach((row) => {
                    if (row[2]) {
                        const excelDate = row[0];
                        const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
                        const formattedDate = jsDate.toISOString().slice(0, 10);
                        addTask(row[2], formattedDate);
                    }
                });
            };
            reader.readAsArrayBuffer(file);
        }
    });
});