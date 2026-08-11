/* ============================================================
   UsedBookR Operations Management System
   Complete replacement script.js
   ============================================================ */

"use strict";

/* ============================================================
   CONFIGURATION
   ============================================================ */

const CONFIG = {
    API_URL:
        "https://script.google.com/macros/s/AKfycbyrOAQZ--7aDiAHv0ey60C8-xXuTKDAhOVDQjUOc-uiGdgNnpuJ97nL4m-ABkw0Znf3ig/exec",

    PASSWORD: "UsedBookR@2026",

    SESSION_KEY: "usedbookr_operations_logged_in",

    USER_KEY: "usedbookr_operations_user",

    TASK_CACHE_KEY: "usedbookr_operations_tasks"
};


/* ============================================================
   14 DEPARTMENTS
   ============================================================ */

const DEPARTMENTS = [
    {
        name: "B2B / Sales",
        code: "B2B"
    },
    {
        name: "Customer Support",
        code: "CS"
    },
    {
        name: "Warehouse",
        code: "WH"
    },
    {
        name: "Scanning / Catalog",
        code: "SC"
    },
    {
        name: "Listing / Inventory",
        code: "LI"
    },
    {
        name: "Digital Marketing",
        code: "DM"
    },
    {
        name: "IT / Software Development",
        code: "IT"
    },
    {
        name: "Finance",
        code: "FN"
    },
    {
        name: "Book Fair / Events",
        code: "BF"
    },
    {
        name: "Books & Supply Procurement",
        code: "BP"
    },
    {
        name: "HR",
        code: "HR"
    },
    {
        name: "Data Analysis",
        code: "DA"
    },
    {
        name: "Software Testing",
        code: "ST"
    },
    {
        name: "Product Development",
        code: "PD"
    }
];


/* ============================================================
   APPLICATION STATE
   ============================================================ */

let tasks = [];
let currentDepartment = "";
let currentPage = "dashboard";
let editingTaskId = null;
let apiAvailable = false;


/* ============================================================
   DOM HELPERS
   ============================================================ */

function $(id) {
    return document.getElementById(id);
}

function show(element) {
    if (element) {
        element.style.display = "";
    }
}

function hide(element) {
    if (element) {
        element.style.display = "none";
    }
}

function safeText(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}

function escapeHTML(value) {
    return safeText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   DATE HELPERS
   ============================================================ */

function todayString() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return safeText(dateValue);
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getDateOnly(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


/* ============================================================
   STATUS HELPERS
   ============================================================ */

function calculateStatus(task) {
    if (!task) {
        return "Open";
    }

    if (task.status === "Completed") {
        return "Completed";
    }

    if (task.status === "Blocked") {
        return "Blocked";
    }

    const dueDate = getDateOnly(task.dueDate);
    const today = getDateOnly(todayString());

    if (dueDate && today && dueDate < today) {
        return "Overdue";
    }

    if (task.status === "In Progress") {
        return "In Progress";
    }

    return "Open";
}

function statusClass(status) {
    return safeText(status)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/\//g, "-");
}

function priorityClass(priority) {
    return safeText(priority)
        .toLowerCase()
        .replace(/\s+/g, "-");
}


/* ============================================================
   TASK NORMALIZATION
   ============================================================ */

function normalizeTask(raw) {
    if (!raw) {
        return null;
    }

    return {
        id:
            raw.id ||
            raw.ID ||
            raw.taskId ||
            raw["Task ID"] ||
            generateTaskId(),

        task:
            raw.task ||
            raw.Task ||
            raw.taskName ||
            raw["Task Name"] ||
            "",

        department:
            raw.department ||
            raw.Department ||
            "",

        assignedTo:
            raw.assignedTo ||
            raw["Assigned To"] ||
            raw.assignee ||
            "",

        priority:
            raw.priority ||
            raw.Priority ||
            "Medium",

        status:
            raw.status ||
            raw.Status ||
            "Open",

        createdDate:
            raw.createdDate ||
            raw["Created Date"] ||
            todayString(),

        dueDate:
            raw.dueDate ||
            raw["Due Date"] ||
            "",

        followupDate:
            raw.followupDate ||
            raw["Follow-up Date"] ||
            raw.followUpDate ||
            "",

        followupAction:
            raw.followupAction ||
            raw["Follow-up / Action Taken"] ||
            raw.lastAction ||
            "",

        remarks:
            raw.remarks ||
            raw.Remarks ||
            "",

        updatedAt:
            raw.updatedAt ||
            raw["Updated At"] ||
            new Date().toISOString()
    };
}


/* ============================================================
   TASK ID
   ============================================================ */

function generateTaskId() {
    const timestamp = Date.now().toString().slice(-6);

    return `UBR-${timestamp}`;
}


/* ============================================================
   LOGIN
   ============================================================ */

function initializeLogin() {
    const loginScreen = $("loginScreen");
    const app = $("app");
    const loginForm = $("loginForm");

    if (!loginScreen || !app) {
        return;
    }

    const loggedIn =
        sessionStorage.getItem(CONFIG.SESSION_KEY) === "true";

    if (loggedIn) {
        hide(loginScreen);
        show(app);

        initializeApplication();
    } else {
        show(loginScreen);
        hide(app);
    }

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
}

function handleLogin(event) {
    event.preventDefault();

    const passwordInput = $("loginPassword");
    const errorBox = $("loginError");

    const enteredPassword =
        passwordInput ? passwordInput.value : "";

    if (enteredPassword === CONFIG.PASSWORD) {

        sessionStorage.setItem(
            CONFIG.SESSION_KEY,
            "true"
        );

        sessionStorage.setItem(
            CONFIG.USER_KEY,
            "Operations Head"
        );

        if (errorBox) {
            errorBox.classList.remove("show");
        }

        hide($("loginScreen"));
        show($("app"));

        initializeApplication();

        if (passwordInput) {
            passwordInput.value = "";
        }

    } else {

        if (errorBox) {
            errorBox.textContent =
                "Incorrect password. Please try again.";

            errorBox.classList.add("show");
        }

        if (passwordInput) {
            passwordInput.focus();
            passwordInput.select();
        }
    }
}

function logout() {

    sessionStorage.removeItem(
        CONFIG.SESSION_KEY
    );

    sessionStorage.removeItem(
        CONFIG.USER_KEY
    );

    location.reload();
}


/* ============================================================
   APPLICATION INITIALIZATION
   ============================================================ */

async function initializeApplication() {

    updateCurrentDate();

    populateDepartmentSelects();

    initializeNavigation();

    initializeButtons();

    initializeFilters();

    initializeModal();

    updateDataSourceStatus("Connecting...");

    await loadTasks();

    renderEverything();
}


/* ============================================================
   CURRENT DATE
   ============================================================ */

function updateCurrentDate() {

    const element = $("currentDate");

    if (!element) {
        return;
    }

    const now = new Date();

    element.textContent =
        now.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
}


/* ============================================================
   DEPARTMENT SELECTS
   ============================================================ */

function populateDepartmentSelects() {

    const selects = [
        $("taskDepartment"),
        $("departmentFilter")
    ];

    selects.forEach(select => {

        if (!select) {
            return;
        }

        const firstOption =
            select.options.length
                ? select.options[0].outerHTML
                : "";

        select.innerHTML = firstOption;

        DEPARTMENTS.forEach(department => {

            const option =
                document.createElement("option");

            option.value = department.name;
            option.textContent = department.name;

            select.appendChild(option);
        });
    });
}


/* ============================================================
   NAVIGATION
   ============================================================ */

function initializeNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener("click", () => {

                const page =
                    button.dataset.page;

                const department =
                    button.dataset.department;

                if (department) {

                    openDepartment(
                        department
                    );

                    return;
                }

                if (page) {

                    navigateTo(page);
                }
            });
        });


    const menuToggle = $("menuToggle");

    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            () => {

                document
                    .querySelector(".sidebar")
                    ?.classList.toggle(
                        "sidebar-open"
                    );
            }
        );
    }
}

function navigateTo(page) {

    currentPage = page;

    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove(
                "active-page"
            );
        });

    const target =
        $(`${page}Page`);

    if (target) {

        target.classList.add(
            "active-page"
        );
    }

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

            if (
                button.dataset.page === page
            ) {

                button.classList.add(
                    "active"
                );
            }
        });

    updatePageHeader(page);

    renderPage(page);
}

function updatePageHeader(page) {

    const title = $("pageTitle");
    const subtitle = $("pageSubtitle");

    const headers = {

        dashboard: [
            "Operations Dashboard",
            "Centralized operational monitoring"
        ],

        tasks: [
            "All Tasks",
            "Manage operational tasks across departments"
        ],

        followups: [
            "Follow-ups",
            "Monitor pending commitments and actions"
        ],

        reports: [
            "Reports & Analysis",
            "Analyze operational performance"
        ],

        activity: [
            "Activity Log",
            "Track system activity"
        ],

        settings: [
            "Settings",
            "System configuration and data management"
        ]
    };

    const data =
        headers[page];

    if (data) {

        if (title) {
            title.textContent = data[0];
        }

        if (subtitle) {
            subtitle.textContent = data[1];
        }
    }
}

function renderPage(page) {

    switch (page) {

        case "dashboard":
            renderDashboard();
            break;

        case "tasks":
            renderTasksTable();
            break;

        case "followups":
            renderFollowups();
            break;

        case "reports":
            renderReports();
            break;

        case "activity":
            renderActivity();
            break;

        case "settings":
            updateDataSourceStatus(
                apiAvailable
                    ? "Google Sheets Connected"
                    : "Offline / Local Cache"
            );
            break;
    }
}


/* ============================================================
   BUTTONS
   ============================================================ */

function initializeButtons() {

    const logoutButton =
        $("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            logout
        );
    }


    [
        $("topAddTask"),
        $("dashboardAddTask"),
        $("tasksAddButton"),
        $("departmentAddTaskButton")
    ].forEach(button => {

        if (button) {

            button.addEventListener(
                "click",
                () => openTaskModal()
            );
        }
    });


    const exportTasks =
        $("exportTasksButton");

    if (exportTasks) {

        exportTasks.addEventListener(
            "click",
            exportTasksCSV
        );
    }


    const exportAll =
        $("exportAllButton");

    if (exportAll) {

        exportAll.addEventListener(
            "click",
            exportTasksCSV
        );
    }


    const exportExcel =
        $("exportExcelButton");

    if (exportExcel) {

        exportExcel.addEventListener(
            "click",
            exportTasksCSV
        );
    }


    const departmentReport =
        $("departmentReportButton");

    if (departmentReport) {

        departmentReport.addEventListener(
            "click",
            () => {

                navigateTo("reports");

                notify(
                    "Report Ready",
                    "Department analysis has been generated."
                );
            }
        );
    }


    const performanceReport =
        $("performanceReportButton");

    if (performanceReport) {

        performanceReport.addEventListener(
            "click",
            () => {

                navigateTo("reports");

                notify(
                    "Analysis Ready",
                    "Performance data has been updated."
                );
            }
        );
    }


    const importButton =
        $("importExcelButton");

    if (importButton) {

        importButton.addEventListener(
            "click",
            importCSV
        );
    }
}


/* ============================================================
   FILTERS
   ============================================================ */

function initializeFilters() {

    [
        $("taskSearch"),
        $("departmentFilter"),
        $("priorityFilter"),
        $("statusFilter")
    ].forEach(element => {

        if (element) {

            element.addEventListener(
                "input",
                renderTasksTable
            );

            element.addEventListener(
                "change",
                renderTasksTable
            );
        }
    });
}


/* ============================================================
   MODAL
   ============================================================ */

function initializeModal() {

    const close =
        $("closeTaskModal");

    const cancel =
        $("cancelTaskButton");

    if (close) {
        close.addEventListener(
            "click",
            closeTaskModal
        );
    }

    if (cancel) {
        cancel.addEventListener(
            "click",
            closeTaskModal
        );
    }

    const form =
        $("taskForm");

    if (form) {

        form.addEventListener(
            "submit",
            saveTaskFromForm
        );
    }
}

function openTaskModal(task = null) {

    const modal =
        $("taskModal");

    if (!modal) {
        return;
    }

    editingTaskId =
        task ? task.id : null;

    const title =
        $("taskModalTitle");

    if (title) {

        title.textContent =
            task
                ? "Edit Task"
                : "Add New Task";
    }

    setInputValue(
        "editTaskId",
        task?.id || ""
    );

    setInputValue(
        "taskName",
        task?.task || ""
    );

    setInputValue(
        "taskDepartment",
        task?.department ||
        currentDepartment ||
        ""
    );

    setInputValue(
        "taskAssignedTo",
        task?.assignedTo || ""
    );

    setInputValue(
        "taskPriority",
        task?.priority || "Medium"
    );

    setInputValue(
        "taskStatus",
        task?.status || "Open"
    );

    setInputValue(
        "taskCreatedDate",
        task?.createdDate ||
        todayString()
    );

    setInputValue(
        "taskDueDate",
        task?.dueDate || ""
    );

    setInputValue(
        "taskFollowupDate",
        task?.followupDate || ""
    );

    setInputValue(
        "taskFollowupAction",
        task?.followupAction || ""
    );

    setInputValue(
        "taskRemarks",
        task?.remarks || ""
    );

    modal.style.display = "flex";
}

function closeTaskModal() {

    const modal =
        $("taskModal");

    if (modal) {
        modal.style.display = "none";
    }

    editingTaskId = null;

    const form =
        $("taskForm");

    if (form) {
        form.reset();
    }
}

function setInputValue(id, value) {

    const element = $(id);

    if (element) {
        element.value = value;
    }
}


/* ============================================================
   SAVE TASK
   ============================================================ */

async function saveTaskFromForm(event) {

    event.preventDefault();

    const task = normalizeTask({

        id:
            editingTaskId ||
            generateTaskId(),

        task:
            $("taskName")?.value.trim(),

        department:
            $("taskDepartment")?.value,

        assignedTo:
            $("taskAssignedTo")?.value.trim(),

        priority:
            $("taskPriority")?.value,

        status:
            $("taskStatus")?.value,

        createdDate:
            $("taskCreatedDate")?.value ||
            todayString(),

        dueDate:
            $("taskDueDate")?.value,

        followupDate:
            $("taskFollowupDate")?.value,

        followupAction:
            $("taskFollowupAction")?.value.trim(),

        remarks:
            $("taskRemarks")?.value.trim(),

        updatedAt:
            new Date().toISOString()
    });

    if (!task.task) {
        notify(
            "Missing Task",
            "Please enter a task name."
        );
        return;
    }

    if (!task.department) {
        notify(
            "Missing Department",
            "Please select a department."
        );
        return;
    }

    if (!task.assignedTo) {
        notify(
            "Missing Assignee",
            "Please enter the responsible person."
        );
        return;
    }

    if (!task.dueDate) {
        notify(
            "Missing Due Date",
            "Please select a due date."
        );
        return;
    }


    if (editingTaskId) {

        const index =
            tasks.findIndex(
                item =>
                    item.id === editingTaskId
            );

        if (index !== -1) {

            tasks[index] = task;
        }

        await saveToGoogleSheets(
            "update",
            task
        );

        addActivity(
            "Task Updated",
            task
        );

        notify(
            "Task Updated",
            `${task.id} was updated successfully.`
        );

    } else {

        tasks.unshift(task);

        await saveToGoogleSheets(
            "create",
            task
        );

        addActivity(
            "Task Created",
            task
        );

        notify(
            "Task Created",
            `${task.id} was created successfully.`
        );
    }

    saveLocalCache();

    closeTaskModal();

    renderEverything();
}


/* ============================================================
   LOAD TASKS
   ============================================================ */

async function loadTasks() {

    try {

        const response =
            await fetch(
                `${CONFIG.API_URL}?action=getTasks`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        if (
            data &&
            Array.isArray(data.tasks)
        ) {

            tasks =
                data.tasks
                    .map(normalizeTask)
                    .filter(Boolean);

            apiAvailable = true;

            saveLocalCache();

            updateDataSourceStatus(
                "Google Sheets Connected"
            );

            return;
        }

        if (
            data &&
            Array.isArray(data.data)
        ) {

            tasks =
                data.data
                    .map(normalizeTask)
                    .filter(Boolean);

            apiAvailable = true;

            saveLocalCache();

            updateDataSourceStatus(
                "Google Sheets Connected"
            );

            return;
        }

        throw new Error(
            "No task array returned by API."
        );

    } catch (error) {

        console.warn(
            "Google Sheets API unavailable:",
            error
        );

        apiAvailable = false;

        loadLocalCache();

        updateDataSourceStatus(
            "Offline / Local Cache"
        );
    }
}


/* ============================================================
   GOOGLE SHEETS API
   ============================================================ */

async function saveToGoogleSheets(
    action,
    task
) {

    try {

        const payload = {

            action: action,

            task: task,

            timestamp:
                new Date().toISOString()
        };


        const response =
            await fetch(
                CONFIG.API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const result =
            await response.json();

        console.log(
            "Google Sheets response:",
            result
        );

        apiAvailable = true;

        updateDataSourceStatus(
            "Google Sheets Connected"
        );

        return result;

    } catch (error) {

        console.error(
            "Google Sheets save error:",
            error
        );

        apiAvailable = false;

        updateDataSourceStatus(
            "Offline / Local Cache"
        );

        return null;
    }
}


/* ============================================================
   LOCAL CACHE
   ============================================================ */

function saveLocalCache() {

    try {

        localStorage.setItem(
            CONFIG.TASK_CACHE_KEY,
            JSON.stringify(tasks)
        );

    } catch (error) {

        console.warn(
            "Could not save local cache:",
            error
        );
    }
}

function loadLocalCache() {

    try {

        const saved =
            localStorage.getItem(
                CONFIG.TASK_CACHE_KEY
            );

        if (saved) {

            const parsed =
                JSON.parse(saved);

            if (Array.isArray(parsed)) {

                tasks =
                    parsed
                        .map(normalizeTask)
                        .filter(Boolean);
            }
        }

    } catch (error) {

        console.warn(
            "Could not load local cache:",
            error
        );

        tasks = [];
    }
}


/* ============================================================
   RENDER EVERYTHING
   ============================================================ */

function renderEverything() {

    renderDashboard();

    renderTasksTable();

    renderFollowups();

    renderDepartments();

    renderReports();

    renderActivity();
}


/* ============================================================
   DASHBOARD
   ============================================================ */

function renderDashboard() {

    const total =
        tasks.length;

    const open =
        tasks.filter(
            task =>
                calculateStatus(task) === "Open"
        ).length;

    const progress =
        tasks.filter(
            task =>
                calculateStatus(task) === "In Progress"
        ).length;

    const blocked =
        tasks.filter(
            task =>
                calculateStatus(task) === "Blocked"
        ).length;

    const overdue =
        tasks.filter(
            task =>
                calculateStatus(task) === "Overdue"
        ).length;

    const completed =
        tasks.filter(
            task =>
                calculateStatus(task) === "Completed"
        ).length;


    setText("totalTasks", total);
    setText("openTasks", open);
    setText("progressTasks", progress);
    setText("blockedTasks", blocked);
    setText("overdueTasks", overdue);
    setText("completedTasks", completed);


    setText(
        "highPriorityCount",
        tasks.filter(
            task => task.priority === "High"
        ).length
    );

    setText(
        "mediumPriorityCount",
        tasks.filter(
            task => task.priority === "Medium"
        ).length
    );

    setText(
        "lowPriorityCount",
        tasks.filter(
            task => task.priority === "Low"
        ).length
    );


    const followupCounts =
        getFollowupCounts();

    setText(
        "followupsToday",
        followupCounts.today
    );

    setText(
        "followupsOverdue",
        followupCounts.overdue
    );

    setText(
        "followupsUpcoming",
        followupCounts.upcoming
    );


    renderDepartmentPerformance();

    renderRecentTasks();
}


/* ============================================================
   RECENT TASKS
   ============================================================ */

function renderRecentTasks() {

    const table =
        $("recentTasksTable");

    if (!table) {
        return;
    }

    const recent =
        [...tasks]
            .sort(
                (a, b) =>
                    new Date(b.updatedAt) -
                    new Date(a.updatedAt)
            )
            .slice(0, 10);


    if (!recent.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    No tasks available.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        recent
            .map(task => taskRow(task, false))
            .join("");
}


/* ============================================================
   TASK TABLE
   ============================================================ */

function renderTasksTable() {

    const table =
        $("allTasksTable");

    if (!table) {
        return;
    }


    const search =
        $("taskSearch")?.value
            .toLowerCase()
            .trim() || "";

    const department =
        $("departmentFilter")?.value || "";

    const priority =
        $("priorityFilter")?.value || "";

    const status =
        $("statusFilter")?.value || "";


    let filtered =
        tasks.filter(task => {

            const actualStatus =
                calculateStatus(task);

            const matchesSearch =
                !search ||
                task.task
                    .toLowerCase()
                    .includes(search) ||
                task.id
                    .toLowerCase()
                    .includes(search) ||
                task.assignedTo
                    .toLowerCase()
                    .includes(search);

            const matchesDepartment =
                !department ||
                task.department === department;

            const matchesPriority =
                !priority ||
                task.priority === priority;

            const matchesStatus =
                !status ||
                actualStatus === status ||
                task.status === status;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesPriority &&
                matchesStatus
            );
        });


    if (!filtered.length) {

        table.innerHTML = `
            <tr>
                <td colspan="8" class="empty-table">
                    No tasks found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        filtered
            .map(task => taskRow(task, true))
            .join("");
}


/* ============================================================
   TASK ROW
   ============================================================ */

function taskRow(task, actions = true) {

    const status =
        calculateStatus(task);

    const actionCell =
        actions
            ? `
                <div class="table-actions">

                    <button
                        class="secondary-button small-button"
                        onclick="window.editTask('${escapeJS(task.id)}')"
                    >
                        Edit
                    </button>

                    <button
                        class="danger-button small-button"
                        onclick="window.deleteTask('${escapeJS(task.id)}')"
                    >
                        Delete
                    </button>

                </div>
            `
            : "";


    return `
        <tr>

            <td>
                <strong>
                    ${escapeHTML(task.id)}
                </strong>
            </td>

            <td>
                ${escapeHTML(task.task)}
            </td>

            <td>
                ${escapeHTML(task.department)}
            </td>

            <td>
                ${escapeHTML(task.assignedTo)}
            </td>

            <td>
                <span class="badge priority-${priorityClass(task.priority)}">
                    ${escapeHTML(task.priority)}
                </span>
            </td>

            <td>
                <span class="badge status-${statusClass(status)}">
                    ${escapeHTML(status)}
                </span>
            </td>

            <td>
                ${formatDate(task.dueDate)}
            </td>

            ${
                actions
                    ? `<td>${actionCell}</td>`
                    : ""
            }

        </tr>
    `;
}

function escapeJS(value) {

    return safeText(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* ============================================================
   GLOBAL EDIT / DELETE
   ============================================================ */

window.editTask = function(id) {

    const task =
        tasks.find(
            item => item.id === id
        );

    if (task) {
        openTaskModal(task);
    }
};


window.deleteTask = async function(id) {

    const task =
        tasks.find(
            item => item.id === id
        );

    if (!task) {
        return;
    }


    const confirmed =
        confirm(
            `Delete task ${task.id}?\n\n${task.task}`
        );

    if (!confirmed) {
        return;
    }


    tasks =
        tasks.filter(
            item => item.id !== id
        );


    await saveToGoogleSheets(
        "delete",
        task
    );


    saveLocalCache();

    addActivity(
        "Task Deleted",
        task
    );

    notify(
        "Task Deleted",
        `${task.id} has been deleted.`
    );

    renderEverything();
};


/* ============================================================
   DEPARTMENT PERFORMANCE
   ============================================================ */

function renderDepartmentPerformance() {

    const container =
        $("departmentPerformance");

    if (!container) {
        return;
    }


    container.innerHTML =
        DEPARTMENTS
            .map(department => {

                const deptTasks =
                    tasks.filter(
                        task =>
                            task.department ===
                            department.name
                    );

                const completed =
                    deptTasks.filter(
                        task =>
                            calculateStatus(task) ===
                            "Completed"
                    ).length;

                const total =
                    deptTasks.length;

                const percentage =
                    total
                        ? Math.round(
                            completed /
                            total *
                            100
                        )
                        : 0;

                return `
                    <div class="department-performance-row">

                        <div class="department-performance-name">

                            <strong>
                                ${escapeHTML(department.name)}
                            </strong>

                            <span>
                                ${total} task${total === 1 ? "" : "s"}
                            </span>

                        </div>

                        <div class="department-progress">

                            <div
                                class="department-progress-bar"
                                style="width:${percentage}%"
                            ></div>

                        </div>

                        <strong>
                            ${percentage}%
                        </strong>

                    </div>
                `;

            })
            .join("");
}


/* ============================================================
   DEPARTMENT PAGE
   ============================================================ */

function openDepartment(departmentName) {

    currentDepartment =
        departmentName;

    navigateToDepartmentPage(
        departmentName
    );
}

function navigateToDepartmentPage(
    departmentName
) {

    currentPage =
        "departmentDetail";

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );
        });


    const page =
        $("departmentDetailPage");

    if (page) {

        page.classList.add(
            "active-page"
        );
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

            if (
                button.dataset.department ===
                departmentName
            ) {

                button.classList.add(
                    "active"
                );
            }
        });


    const department =
        DEPARTMENTS.find(
            item =>
                item.name ===
                departmentName
        );


    setText(
        "departmentDetailCode",
        department?.code ||
        "DEPARTMENT"
    );

    setText(
        "departmentDetailTitle",
        departmentName
    );

    setText(
        "departmentDetailSubtitle",
        `${departmentName} operational overview and task monitoring.`
    );


    renderDepartmentDetail(
        departmentName
    );
}

function renderDepartmentDetail(
    departmentName
) {

    const deptTasks =
        tasks.filter(
            task =>
                task.department ===
                departmentName
        );


    setText(
        "departmentTotal",
        deptTasks.length
    );

    setText(
        "departmentOpen",
        deptTasks.filter(
            task =>
                calculateStatus(task) ===
                "Open"
        ).length
    );

    setText(
        "departmentProgress",
        deptTasks.filter(
            task =>
                calculateStatus(task) ===
                "In Progress"
        ).length
    );

    setText(
        "departmentBlocked",
        deptTasks.filter(
            task =>
                calculateStatus(task) ===
                "Blocked"
        ).length
    );

    setText(
        "departmentOverdue",
        deptTasks.filter(
            task =>
                calculateStatus(task) ===
                "Overdue"
        ).length
    );

    setText(
        "departmentCompleted",
        deptTasks.filter(
            task =>
                calculateStatus(task) ===
                "Completed"
        ).length
    );


    const table =
        $("departmentTasksTable");

    if (!table) {
        return;
    }


    if (!deptTasks.length) {

        table.innerHTML = `
            <tr>
                <td colspan="8" class="empty-table">
                    No department tasks available.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        deptTasks
            .map(task => {

                const status =
                    calculateStatus(task);

                return `
                    <tr>

                        <td>
                            ${escapeHTML(task.id)}
                        </td>

                        <td>
                            ${escapeHTML(task.task)}
                        </td>

                        <td>
                            ${escapeHTML(task.assignedTo)}
                        </td>

                        <td>
                            <span class="badge priority-${priorityClass(task.priority)}">
                                ${escapeHTML(task.priority)}
                            </span>
                        </td>

                        <td>
                            <span class="badge status-${statusClass(status)}">
                                ${escapeHTML(status)}
                            </span>
                        </td>

                        <td>
                            ${formatDate(task.dueDate)}
                        </td>

                        <td>
                            ${formatDate(task.followupDate)}
                        </td>

                        <td>

                            <button
                                class="secondary-button small-button"
                                onclick="window.editTask('${escapeJS(task.id)}')"
                            >
                                Edit
                            </button>

                        </td>

                    </tr>
                `;

            })
            .join("");
}


/* ============================================================
   DEPARTMENTS GRID
   ============================================================ */

function renderDepartments() {

    const container =
        $("departmentsGrid");

    if (!container) {
        return;
    }


    container.innerHTML =
        DEPARTMENTS
            .map(department => {

                const deptTasks =
                    tasks.filter(
                        task =>
                            task.department ===
                            department.name
                    );

                const open =
                    deptTasks.filter(
                        task =>
                            calculateStatus(task) ===
                            "Open"
                    ).length;

                const progress =
                    deptTasks.filter(
                        task =>
                            calculateStatus(task) ===
                            "In Progress"
                    ).length;

                const blocked =
                    deptTasks.filter(
                        task =>
                            calculateStatus(task) ===
                            "Blocked"
                    ).length;

                const overdue =
                    deptTasks.filter(
                        task =>
                            calculateStatus(task) ===
                            "Overdue"
                    ).length;

                const completed =
                    deptTasks.filter(
                        task =>
                            calculateStatus(task) ===
                            "Completed"
                    ).length;


                return `
                    <div
                        class="department-card"
                        onclick="window.openDepartment('${escapeJS(department.name)}')"
                    >

                        <div class="department-card-header">

                            <div class="department-code">
                                ${escapeHTML(department.code)}
                            </div>

                            <div>

                                <h3>
                                    ${escapeHTML(department.name)}
                                </h3>

                                <span>
                                    ${deptTasks.length} total tasks
                                </span>

                            </div>

                        </div>


                        <div class="department-card-stats">

                            <div>
                                <strong>
                                    ${open}
                                </strong>
                                <span>Open</span>
                            </div>

                            <div>
                                <strong>
                                    ${progress}
                                </strong>
                                <span>Progress</span>
                            </div>

                            <div>
                                <strong>
                                    ${blocked}
                                </strong>
                                <span>Blocked</span>
                            </div>

                            <div>
                                <strong>
                                    ${overdue}
                                </strong>
                                <span>Overdue</span>
                            </div>

                            <div>
                                <strong>
                                    ${completed}
                                </strong>
                                <span>Done</span>
                            </div>

                        </div>

                    </div>
                `;

            })
            .join("");
}


window.openDepartment = function(
    department
) {

    openDepartment(department);
};


/* ============================================================
   FOLLOW-UP SYSTEM
   ============================================================ */

function getFollowupCounts() {

    const today =
        getDateOnly(todayString());

    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;


    tasks.forEach(task => {

        if (!task.followupDate) {
            return;
        }

        const date =
            getDateOnly(
                task.followupDate
            );

        if (!date) {
            return;
        }


        if (
            date.getTime() ===
            today.getTime()
        ) {

            dueToday++;

        } else if (
            date < today
        ) {

            overdue++;

        } else {

            upcoming++;
        }
    });


    return {
        today: dueToday,
        overdue: overdue,
        upcoming: upcoming
    };
}

function renderFollowups() {

    const counts =
        getFollowupCounts();


    setText(
        "followupPageToday",
        counts.today
    );

    setText(
        "followupPageOverdue",
        counts.overdue
    );

    setText(
        "followupPageUpcoming",
        counts.upcoming
    );


    const table =
        $("followupsTable");

    if (!table) {
        return;
    }


    const followups =
        tasks
            .filter(
                task =>
                    task.followupDate
            )
            .sort(
                (a, b) =>
                    new Date(a.followupDate) -
                    new Date(b.followupDate)
            );


    if (!followups.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    No follow-ups available.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        followups
            .map(task => {

                const status =
                    calculateStatus(task);

                return `
                    <tr>

                        <td>
                            ${escapeHTML(task.id)}
                        </td>

                        <td>
                            ${escapeHTML(task.task)}
                        </td>

                        <td>
                            ${escapeHTML(task.department)}
                        </td>

                        <td>
                            ${escapeHTML(task.assignedTo)}
                        </td>

                        <td>
                            ${formatDate(task.followupDate)}
                        </td>

                        <td>
                            ${escapeHTML(
                                task.followupAction || "-"
                            )}
                        </td>

                        <td>
                            <span class="badge status-${statusClass(status)}">
                                ${escapeHTML(status)}
                            </span>
                        </td>

                    </tr>
                `;

            })
            .join("");
}


/* ============================================================
   REPORTS
   ============================================================ */

function renderReports() {

    const table =
        $("analysisTable");

    if (!table) {
        return;
    }


    table.innerHTML =
        DEPARTMENTS
            .map(department => {

                const deptTasks =
                    tasks.filter(
                        task =>
                            task.department ===
                            department.name
                    );


                const total =
                    deptTasks.length;

                const open =
                    deptTasks.filter(
                        task =>
                            calculateStatus(task) ===
                            "Open"
                    ).length;

                const progress =
                    deptTasks.filter(
                        task =>
                            calculateStatus(task) ===
                            "In Progress"
                    ).length;

                const blocked =
                    deptTasks.filter(
                        task =>
                            calculateStatus(task) ===
                            "Blocked"
                    ).length;

                const overdue =
                    deptTasks.filter(
                        task =>
                            calculateStatus(task) ===
                            "Overdue"
                    ).length;

                const completed =
                    deptTasks.filter(
                        task =>
                            calculateStatus(task) ===
                            "Completed"
                    ).length;

                const percentage =
                    total
                        ? Math.round(
                            completed /
                            total *
                            100
                        )
                        : 0;


                return `
                    <tr>

                        <td>
                            ${escapeHTML(department.name)}
                        </td>

                        <td>
                            ${total}
                        </td>

                        <td>
                            ${open}
                        </td>

                        <td>
                            ${progress}
                        </td>

                        <td>
                            ${blocked}
                        </td>

                        <td>
                            ${overdue}
                        </td>

                        <td>
                            ${completed}
                        </td>

                        <td>
                            ${percentage}%
                        </td>

                    </tr>
                `;

            })
            .join("");
}


/* ============================================================
   ACTIVITY LOG
   ============================================================ */

function addActivity(
    action,
    task
) {

    try {

        const key =
            "usedbookr_activity_log";

        const existing =
            JSON.parse(
                localStorage.getItem(key) ||
                "[]"
            );


        existing.unshift({

            action: action,

            taskId:
                task?.id || "-",

            task:
                task?.task || "-",

            department:
                task?.department || "-",

            timestamp:
                new Date().toISOString()

        });


        localStorage.setItem(
            key,
            JSON.stringify(
                existing.slice(0, 100)
            )
        );

    } catch (error) {

        console.warn(
            "Activity log error:",
            error
        );
    }


    renderActivity();
}

function renderActivity() {

    const container =
        $("activityTimeline");

    if (!container) {
        return;
    }


    try {

        const activities =
            JSON.parse(
                localStorage.getItem(
                    "usedbookr_activity_log"
                ) ||
                "[]"
            );


        if (!activities.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No activity recorded yet.
                </div>
            `;

            return;
        }


        container.innerHTML =
            activities
                .map(activity => {

                    return `
                        <div class="activity-item">

                            <div class="activity-dot">
                                •
                            </div>

                            <div class="activity-content">

                                <strong>
                                    ${escapeHTML(activity.action)}
                                </strong>

                                <p>
                                    ${escapeHTML(activity.task)}
                                </p>

                                <span>
                                    ${escapeHTML(activity.department)}
                                    ·
                                    ${formatDateTime(
                                        activity.timestamp
                                    )}
                                </span>

                            </div>

                        </div>
                    `;

                })
                .join("");

    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">
                Unable to load activity log.
            </div>
        `;
    }
}

function formatDateTime(value) {

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return safeText(value);
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* ============================================================
   EXPORT CSV
   ============================================================ */

function exportTasksCSV() {

    if (!tasks.length) {

        notify(
            "No Data",
            "There are no tasks to export."
        );

        return;
    }


    const headers = [
        "Task ID",
        "Task",
        "Department",
        "Assigned To",
        "Priority",
        "Status",
        "Created Date",
        "Due Date",
        "Follow-up Date",
        "Follow-up / Action Taken",
        "Remarks",
        "Updated At"
    ];


    const rows =
        tasks.map(task => [

            task.id,
            task.task,
            task.department,
            task.assignedTo,
            task.priority,
            calculateStatus(task),
            task.createdDate,
            task.dueDate,
            task.followupDate,
            task.followupAction,
            task.remarks,
            task.updatedAt

        ]);


    const csv = [

        headers,

        ...rows

    ]
        .map(row =>
            row
                .map(csvEscape)
                .join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `UsedBookR_Operations_${todayString()}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);


    notify(
        "Export Complete",
        "Task data has been downloaded."
    );
}

function csvEscape(value) {

    const text =
        safeText(value);

    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {

        return `"${text.replace(
            /"/g,
            '""'
        )}"`;
    }

    return text;
}


/* ============================================================
   IMPORT CSV
   ============================================================ */

function importCSV() {

    const input =
        document.createElement("input");

    input.type = "file";

    input.accept =
        ".csv,text/csv";

    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                () => {

                    try {

                        const imported =
                            parseCSV(
                                reader.result
                            );

                        tasks =
                            imported
                                .map(normalizeTask)
                                .filter(
                                    task =>
                                        task.task
                                );

                        saveLocalCache();

                        renderEverything();

                        notify(
                            "Import Complete",
                            `${tasks.length} tasks loaded.`
                        );

                    } catch (error) {

                        console.error(
                            error
                        );

                        notify(
                            "Import Failed",
                            "The CSV file could not be read."
                        );
                    }
                };

            reader.readAsText(file);
        }
    );

    input.click();
}

function parseCSV(text) {

    const lines =
        text
            .split(/\r?\n/)
            .filter(
                line =>
                    line.trim()
            );

    if (!lines.length) {
        return [];
    }


    const headers =
        parseCSVLine(
            lines[0]
        );


    return lines
        .slice(1)
        .map(line => {

            const values =
                parseCSVLine(line);

            const object = {};

            headers.forEach(
                (header, index) => {

                    object[header] =
                        values[index] || "";
                }
            );

            return object;
        });
}

function parseCSVLine(line) {

    const result = [];

    let current = "";

    let quoted = false;


    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        const char =
            line[i];


        if (char === '"') {

            if (
                quoted &&
                line[i + 1] === '"'
            ) {

                current += '"';

                i++;

            } else {

                quoted =
                    !quoted;
            }

        } else if (
            char === "," &&
            !quoted
        ) {

            result.push(
                current
            );

            current = "";

        } else {

            current += char;
        }
    }


    result.push(current);

    return result;
}


/* ============================================================
   DATA SOURCE STATUS
   ============================================================ */

function updateDataSourceStatus(
    message
) {

    const element =
        $("dataSourceStatus");

    if (element) {
        element.textContent =
            message;
    }
}


/* ============================================================
   NOTIFICATIONS
   ============================================================ */

function notify(
    title,
    message
) {

    const notification =
        $("notification");

    const titleElement =
        $("notificationTitle");

    const messageElement =
        $("notificationMessage");


    if (
        !notification ||
        !titleElement ||
        !messageElement
    ) {
        return;
    }


    titleElement.textContent =
        title;

    messageElement.textContent =
        message;


    notification.classList.add(
        "show"
    );


    setTimeout(
        () => {

            notification.classList.remove(
                "show"
            );

        },
        3500
    );
}


/* ============================================================
   GENERIC HELPERS
   ============================================================ */

function setText(
    id,
    value
) {

    const element =
        $(id);

    if (element) {

        element.textContent =
            safeText(value);
    }
}


/* ============================================================
   START APPLICATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initializeLogin
);
