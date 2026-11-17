import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabase = createClient(
    "https://prozzqzyvdyeeaukqbml.supabase.co",
    "sb_publishable_16jbn1VV3JXhAufzPnL_3g_YyZdNqfM"
)

let Task_dragged = null;

function createTaskCard(task) {
    const task_card = document.createElement("div");

    task_card.classList.add("task-card");
    task_card.draggable = true;

    task_card.dataset.id = task.id;

    task_card.innerHTML = ` 
        <h3>${task.title}</h3>
        <p>${task.description || ""}</p>
        <p>Priority: ${task.priority || "None"}</p>
        <p>Due: ${task.due_date || "None"}</p>
    `;

    task_card.addEventListener("dragstart", () => {
        Task_dragged = task_card;
    })

    return task_card;
}

function clearForm() {
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("task-priority").value = "";
    document.getElementById("task-due-date").value = "";
}

async function createTask() {
    const title = document.getElementById("task-title").value.trim()

    const description = document.getElementById("task-description").value.trim()
    
    const priority = document.getElementById("task-priority").value.trim()

    const due_date = document.getElementById("task-due-date").value.trim()

    if(!title) {
        alert("Enter a title please.");
        return;
    }

    const {
        data: { user }
    } = await supabase.auth.getUser();

    const {data, error} = await supabase.from("Tasks").insert([{
        title: title, 
        description: description,
        priority: priority,
        due_date: due_date || null,
        status: "todo",
        user_id: user.id
    }]).select().single()

    if(error) {
        console.error(error);
        alert("Failed to create task.");
        return;
    }

    const todoColumn = document.querySelector(
        `[data-status="todo"] .task-list`
    )

    todoColumn.appendChild(createTaskCard(data))

    clearForm();
}

document.querySelectorAll(".task-card").forEach (card => {
    card.addEventListener("dragstart", () => {
        Task_dragged = card;
    })
})

document.querySelectorAll(".column").forEach (column => {
    column.addEventListener("dragover", e => {
        e.preventDefault();
    })

    column.addEventListener("drop", async () => {

        if (!Task_dragged) return;
        column.querySelector(".task-list").appendChild(Task_dragged);
        const task_ID = Task_dragged.dataset.id;
        const new_status = column.dataset.status;

        await supabase.from("Tasks").update({status: new_status}).eq("id", task_ID)
    })

    
})

document.getElementById("create-task-button").addEventListener("click", createTask);
const { data, DataError } = await supabase.auth.signInAnonymously();

if (DataError) {
  console.error(DataError);
} else {
  console.log("Guest user ID:", data.user.id);
}

const {data: Tasks, TaskError} = await supabase.from("Tasks").select("*").order("created_at");



if(TaskError) {
        console.error(TaskError);
        alert("Failed to catch task.");
    }

Tasks.forEach(task => {
    const column = document.querySelector(`[data-status="${task.status}"] .task-list`);

    column.appendChild(createTaskCard(task));
})
