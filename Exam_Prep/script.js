const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const completedTaskList = document.getElementById('completedTaskList');
    const incompleteTaskList = document.getElementById('incompleteTaskList');
    const excelUpload = document.getElementById('excelUpload');
    const completedCountDisplay = document.getElementById('completedCount');
    const remainingCountDisplay = document.getElementById('remainingCount');
    const loginButton = document.getElementById('loginButton');
    const loginMessage = document.getElementById('loginMessage');
    const inputContainer = document.querySelector('.input-container');


    let totalTasks = 0;
    let completedTasks = 0;
    let tasksByDate = {};
    let currentUser;

    function updateTaskCounts() {
        completedCountDisplay.textContent = `Completed: ${completedTasks}`;
        remainingCountDisplay.textContent = `Remaining: ${totalTasks - completedTasks}`;
    }

    function renderTasks() {
        taskList.innerHTML = '<h2>Active Tasks</h2>';
        completedTaskList.innerHTML = '<h2>Completed Tasks</h2>';
        incompleteTaskList.innerHTML = '<h2>Incomplete Tasks</h2>';
        Object.keys(tasksByDate).forEach((date) => {
            const dateHeader = document.createElement('li');
            dateHeader.innerHTML = `<strong>${date}</strong>`;
            if (tasksByDate[date].some(task => !task.isCompleted)) {
                taskList.appendChild(dateHeader);
            }
            tasksByDate[date].forEach((task) => {
                if (task.isCompleted) {
                    completedTaskList.appendChild(task.element);
                } else if (task.isNew || task.isInProgress) {
                    taskList.appendChild(task.element);
                } else {
                    incompleteTaskList.appendChild(task.element);
                }
            });
        });
        updateTaskCounts();
        if (currentUser) {
            saveTasks();
        }
    }

    function addTask(taskText, date, isSubtask = false, parentTask = null) {
        totalTasks++;
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span style="${isSubtask ? 'margin-left: 20px;' : ''}">${taskText}</span>
            <button class="complete">${isSubtask ? '✅' : '😊'}</button>
            <button class="incomplete">${isSubtask ? '❌' : '🙁'}</button>
            <button class="inprogress">${isSubtask ? '▶️' : '😐'}</button>
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
            parentTask: parentTask,
            isNew: true,
            isInProgress: false
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
            taskObject.isNew = false;
            taskObject.isInProgress = false;
            listItem.querySelector('span').classList.add('completed');
            listItem.querySelector('span').classList.remove('incomplete');
            listItem.querySelector('span').classList.remove('inprogress');
            completeButton.style.display = 'none';
            incompleteButton.style.display = 'block';
            inprogressButton.style.display = 'block';
            completedTasks++;
            renderTasks();
        });

        incompleteButton.addEventListener('click', () => {
            taskObject.isCompleted = false;
            taskObject.isNew = false;
            taskObject.isInProgress = false;
            listItem.querySelector('span').classList.remove('completed');
            listItem.querySelector('span').classList.add('incomplete');
            listItem.querySelector('span').classList.remove('inprogress');
            completeButton.style.display = 'block';
            incompleteButton.style.display = 'none';
            inprogressButton.style.display = 'block';
            if (completedTasks > 0) {
                completedTasks--;
            }
            renderTasks();
        });

        inprogressButton.addEventListener('click', () => {
            taskObject.isCompleted = false;
            taskObject.isNew = false;
            taskObject.isInProgress = true;
            listItem.querySelector('span').classList.remove('completed');
            listItem.querySelector('span').classList.remove('incomplete');
            listItem.querySelector('span').classList.add('inprogress');
            completeButton.style.display = 'block';
            incompleteButton.style.display = 'block';
            inprogressButton.style.display = 'none';
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
            let taskDate = taskObject.date;
            tasksByDate[taskDate] = tasksByDate[taskDate].filter(task => task !== taskObject);
            if (tasksByDate[taskDate].length === 0) {
                delete tasksByDate[taskDate];
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
                    if (row[0] && row[2]) {
                        let excelDate = row[0];
                        let jsDate;

                        if (typeof excelDate === 'number') {
                            jsDate = new Date((excelDate - 25569) * 86400 * 1000);
                        } else if (excelDate instanceof Date) {
                            jsDate = excelDate;
                        } else {
                            jsDate = new Date(excelDate);
                        }

                        if (isNaN(jsDate)) {
                            console.error("Invalid date:", excelDate);
                            return;
                        }
                        const formattedDate = jsDate.toISOString().slice(0, 10);
                        addTask(row[2], formattedDate);
                    }
                });
                renderTasks();
            };
            reader.readAsArrayBuffer(file);
        }
    });

    function loadTasks(userId) {
        const tasksRef = database.ref(`users/${userId}/tasks`);
        tasksRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                tasksByDate = data;
                for (const date in tasksByDate) {
                    tasksByDate[date].forEach(task => {
                        const listItem = document.createElement('li');
                        listItem.innerHTML = `
                            <span style="${task.isSubtask ? 'margin-left: 20px;' : ''}">${task.text}</span>
                            <button class="complete">${task.isSubtask ? '✅' : '😊'}</button>
                            <button class="incomplete">${task.isSubtask ? '❌' : '🙁'}</button>
                            <button class="inprogress">${task.isSubtask ? '▶️' : '😐'}</button>
                            ${task.isSubtask ? '' : '<button class="subtask">Subtasks</button>'}
                            <button class="delete">Delete</button>
                            ${task.isSubtask ? '' : '<ul class="subtasks" style="display:none;"></ul>'}
                        `;
                        task.element = listItem;

                        const completeButton = listItem.querySelector('.complete');
                        const incompleteButton = listItem.querySelector('.incomplete');
                        const inprogressButton = listItem.querySelector('.inprogress');
                        const deleteButton = listItem.querySelector('.delete');
                        const subtaskButton = listItem.querySelector('.subtask');
                        const subtaskList = listItem.querySelector('.subtasks');

                        completeButton.addEventListener('click', () => {
                            task.isCompleted = true;
                            task.isNew = false;
                            task.isInProgress = false;
                            listItem.querySelector('span').classList.add('completed');
                            listItem.querySelector('span').classList.remove('incomplete');
                            listItem.querySelector('span').classList.remove('inprogress');
                            completeButton.style.display = 'none';
                            incompleteButton.style.display = 'block';
                            inprogressButton.style.display = 'block';
                            completedTasks++;
                            renderTasks();
                        });

                        incompleteButton.addEventListener('click', () => {
                            task.isCompleted = false;
                            task.isNew = false;
                            task.isInProgress = false;
                            listItem.querySelector('span').classList.remove('completed');
                            listItem.querySelector('span').classList.add('incomplete');
                            listItem.querySelector('span').classList.remove('inprogress');
                            completeButton.style.display = 'block';
                            incompleteButton.style.display = 'none';
                            inprogressButton.style.display = 'block';
                            if (completedTasks > 0) {
                                completedTasks--;
                            }
                            renderTasks();
                        });

                        inprogressButton.addEventListener('click', () => {
                            task.isCompleted = false;
                            task.isNew = false;
                            task.isInProgress = true;
                            listItem.querySelector('span').classList.remove('completed');
                            listItem.querySelector('span').classList.remove('incomplete');
                            listItem.querySelector('span').classList.add('inprogress');
                            completeButton.style.display = 'block';
                            incompleteButton.style.display = 'block';
                            inprogressButton.style.display = 'none';
                            if (completedTasks > 0) {
                                completedTasks--;
                            }
                            renderTasks();
                        });

                        deleteButton.addEventListener('click', () => {
                            if (task.isCompleted) {
                                completedTasks--;
                            }
                            totalTasks--;
                            let taskDate = task.date;
                            tasksByDate[taskDate] = tasksByDate[taskDate].filter(task => task !== taskObject);
                            if (tasksByDate[taskDate].length === 0) {
                                delete tasksByDate[taskDate];
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
                    });
                }
                renderTasks();
            }
        });
    }

    function saveTasks() {
        if (currentUser) {
            const tasksRef = database.ref(`users/${currentUser.uid}/tasks`);
            tasksRef.set(tasksByDate);
        }
    }

    loginButton.addEventListener('click', () => {
        if (currentUser) {
            auth.signOut().then(() => {
                currentUser = null;
                loginButton.textContent = 'Login/Signup';
                loginMessage.textContent = 'Logged out.';
                inputContainer.style.display = 'none';
                taskList.innerHTML = '';
                completedTaskList.innerHTML = '';
                incompleteTaskList.innerHTML = '';
                tasksByDate = {};
                totalTasks = 0;
                completedTasks = 0;
                updateTaskCounts();
            }).catch(error => {
                loginMessage.textContent = `Error logging out: ${error.message}`;
            });
        } else {
            auth.signInAnonymously().then(result => {
                currentUser = result.user;
                loginButton.textContent = 'Logout';
                loginMessage.textContent = 'Logged in successfully!';
                inputContainer.style.display = 'flex';
                loadTasks(currentUser.uid);
            }).catch(error => {
                loginMessage.textContent = `Error logging in: ${error.message}`;
            });
        }
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loginButton.textContent = 'Logout';
            loginMessage.textContent = 'Logged in successfully!';
            inputContainer.style.display = 'flex';
            loadTasks(currentUser.uid);
        } else {
            currentUser = null;
            loginButton.textContent = 'Login/Signup';
            loginMessage.textContent = '';
            inputContainer.style.display = 'none';
            taskList.innerHTML = '';
            completedTaskList.innerHTML = '';
            incompleteTaskList.innerHTML = '';
            tasksByDate = {};
            totalTasks = 0;
            completedTasks = 0;
            updateTaskCounts();
        }
    });

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const date = taskDate.value;
        if (taskText) {
            addTask(taskText, date);
            taskInput.value = '';
            taskDate.value = '';
        }
    });

    function loadInitialTasks() {
      if (currentUser) {
        loadTasks(currentUser.uid);
      }
    }
    loadInitialTasks();
});
