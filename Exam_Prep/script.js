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

    function updateProgressBar() {
        if (totalTasks === 0) {
            progressBar.style.width = '0%';
        } else {
            const progress = (completedTasks / totalTasks) * 100;
            progressBar.style.width = `${progress}%`;
        }
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

    function addTask(taskText, date) {
        totalTasks++;
        updateProgressBar();

        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${taskText} (${date})</span>
            <button class="complete">😊</button>
            <button class="incomplete">🙁</button>
            <button class="inprogress">😐</button>
            <button class="subtask">Subtasks</button>
            <button class="delete">Delete</button>
            <ul class="subtasks" style="display:none;"></ul>
        `;
        taskList.appendChild(listItem);
        // ... (rest of the addTask function remains the same) ...
        const completeButton = listItem.querySelector('.complete');
        const incompleteButton = listItem.querySelector('.incomplete');
        const inprogressButton = listItem.querySelector('.inprogress');
        const deleteButton = listItem.querySelector('.delete');
        const subtaskButton = listItem.querySelector('.subtask');
        const subtaskList = listItem.querySelector('.subtasks');

        completeButton.addEventListener('click', () => {
            // ... (rest of the completeButton event listener remains the same) ...
            completedTaskList.appendChild(listItem);
            listItem.querySelector('.delete').remove();
        });
        incompleteButton.addEventListener('click', () => {
             // ... (rest of the incompleteButton event listener remains the same) ...
        });
        inprogressButton.addEventListener('click', () => {
             // ... (rest of the inprogressButton event listener remains the same) ...
        });
        deleteButton.addEventListener('click', () => {
            // ... (rest of the deleteButton event listener remains the same) ...
        });
        subtaskButton.addEventListener('click', () => {
            // ... (rest of the subtaskButton event listener remains the same) ...
        });
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
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: ['Date', 'Day', 'Task'] });

                jsonData.forEach((row) => {
                    if (row.Task) {
                        addTask(row.Task, row.Date);
                    }
                });
            };
            reader.readAsArrayBuffer(file);
        }
    });
});