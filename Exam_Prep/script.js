document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            addTask(taskText);
            taskInput.value = '';
        }
    });

    function addTask(taskText) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${taskText}</span>
            <button class="complete">Complete</button>
            <button class="delete">Delete</button>
        `;
        taskList.appendChild(listItem);

        const completeButton = listItem.querySelector('.complete');
        const deleteButton = listItem.querySelector('.delete');

        completeButton.addEventListener('click', () => {
            listItem.querySelector('span').classList.toggle('completed');
        });

        deleteButton.addEventListener('click', () => {
            listItem.remove();
        });
    }
});