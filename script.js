/* =========================================================
   USEDBOOKR OPERATIONS MANAGEMENT SYSTEM
   COMPLETE JAVASCRIPT
========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
========================================================= */

const APP_CONFIG = {
    PASSWORD: "admin123",
    STORAGE_KEY: "usedbookr_operations_data",
    ACTIVITY_KEY: "usedbookr_operations_activity",
    SESSION_KEY: "usedbookr_operations_session"
};


/* =========================================================
   DEPARTMENTS
========================================================= */

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


/* =========================================================
   GLOBAL DATA
========================================================= */

let tasks = [];
let activities = [];

let currentDepartment = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeApplication();

});


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

function initializeApplication() {

    loadData();

    setupLogin();

    setupNavigation();

    setupTaskButtons();

    setupTaskForm();

    setupFilters();

    setupLogout();

    setupMenu();

    setupReports();

    populateDepartmentSelects();

    updateCurrentDate();

    if (isLoggedIn()) {

        showApplication();

    } else {

        showLogin();

    }

    refreshEverything();

}


/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const passwordInput =
            document.getElementById("loginPassword");

        const loginError =
            document.getElementById("loginError");

        const enteredPassword =
            passwordInput.value.trim();

        if (enteredPassword === APP_CONFIG.PASSWORD) {

            sessionStorage.setItem(
                APP_CONFIG.SESSION_KEY,
                "authenticated"
            );

            loginError.classList.remove("show");

            passwordInput.value = "";

            showApplication();

            notify(
                "Login Successful",
                "Welcome to the Operations Management System."
            );

        } else {

            loginError.classList.add("show");

            passwordInput.value = "";

            passwordInput.focus();

        }

    });

}


/* =========================================================
   SESSION
========================================================= */

function isLoggedIn() {

    return sessionStorage.getItem(
        APP_CONFIG.SESSION_KEY
    ) === "authenticated";

}


/* =========================================================
   SHOW / HIDE APPLICATION
========================================================= */

function showLogin() {

    const loginScreen =
        document.getElementById("loginScreen");

    const app =
        document.getElementById("app");

    if (loginScreen) {

        loginScreen.style.display = "flex";

    }

    if (app) {

        app.style.display = "none";

    }

}


function showApplication() {

    const loginScreen =
        document.getElementById("loginScreen");

    const app =
        document.getElementById("app");

    if (loginScreen) {

        loginScreen.style.display = "none";

    }

    if (app) {

        app.style.display = "flex";

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const logoutButton =
        document.getElementById("logoutButton");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", function () {

        sessionStorage.removeItem(
            APP_CONFIG.SESSION_KEY
        );

        showLogin();

        notify(
            "Logged Out",
            "You have been logged out."
        );

    });

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(function (item) {

        item.addEventListener("click", function () {

            const page =
                item.dataset.page;

            const department =
                item.dataset.department;

            if (department) {

                openDepartment(department);

                return;

            }

            if (page) {

                showPage(page);

            }

        });

    });

}


function showPage(pageName) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(function (page) {

        page.classList.remove("active-page");

    });

    const target =
        document.getElementById(
            pageName + "Page"
        );

    if (target) {

        target.classList.add("active-page");

    }

    updateNavigation(pageName);

    updatePageHeader(pageName);

    refreshEverything();

}


function updateNavigation(pageName) {

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(function (item) {

        item.classList.remove("active");

        if (item.dataset.page === pageName) {

            item.classList.add("active");

        }

    });

}


function updatePageHeader(pageName) {

    const title =
        document.getElementById("pageTitle");

    const subtitle =
        document.getElementById("pageSubtitle");

    const headers = {

        dashboard: [
            "Operations Dashboard",
            "Centralized operational monitoring"
        ],

        tasks: [
            "All Tasks",
            "Manage tasks across all departments"
        ],

        followups: [
            "Follow-ups",
            "Monitor pending actions and commitments"
        ],

        reports: [
            "Reports & Analysis",
            "Analyze operational performance"
        ],

        activity: [
            "Activity Log",
            "Track operational changes"
        ],

        settings: [
            "Settings",
            "Manage system configuration"
        ]

    };

    if (headers[pageName]) {

        title.textContent =
            headers[pageName][0];

        subtitle.textContent =
            headers[pageName][1];

    }

}


/* =========================================================
   DEPARTMENT PAGE
========================================================= */

function openDepartment(departmentName) {

    currentDepartment =
        departmentName;

    document.querySelectorAll(".page")
        .forEach(function (page) {

            page.classList.remove(
                "active-page"
            );

        });

    const departmentPage =
        document.getElementById(
            "departmentDetailPage"
        );

    if (departmentPage) {

        departmentPage.classList.add(
            "active-page"
        );

    }

    document.querySelectorAll(".nav-item")
        .forEach(function (item) {

            item.classList.remove("active");

            if (
                item.dataset.department ===
                departmentName
            ) {

                item.classList.add("active");

            }

        });

    const department =
        DEPARTMENTS.find(function (item) {

            return item.name === departmentName;

        });

    if (!department) return;

    document.getElementById(
        "departmentDetailCode"
    ).textContent = department.code;

    document.getElementById(
        "departmentDetailTitle"
    ).textContent = department.name;

    document.getElementById(
        "departmentDetailSubtitle"
    ).textContent =
        "Operational overview for " +
        department.name;

    document.getElementById(
        "pageTitle"
    ).textContent =
        department.name;

    document.getElementById(
        "pageSubtitle"
    ).textContent =
        "Department task monitoring";

    refreshDepartmentPage();

}


/* =========================================================
   DEPARTMENT SELECTS
========================================================= */

function populateDepartmentSelects() {

    const selects = [

        document.getElementById(
            "taskDepartment"
        ),

        document.getElementById(
            "departmentFilter"
        )

    ];

    selects.forEach(function (select) {

        if (!select) return;

        DEPARTMENTS.forEach(function (department) {

            const option =
                document.createElement("option");

            option.value =
                department.name;

            option.textContent =
                department.name;

            select.appendChild(option);

        });

    });

}


/* =========================================================
   TASK BUTTONS
========================================================= */

function setupTaskButtons() {

    const buttons = [

        "topAddTask",
        "dashboardAddTask",
        "tasksAddButton",
        "departmentAddTaskButton"

    ];

    buttons.forEach(function (id) {

        const button =
            document.getElementById(id);

        if (!button) return;

        button.addEventListener(
            "click",
            function () {

                openTaskModal();

            }
        );

    });

}


/* =========================================================
   TASK MODAL
========================================================= */

function openTaskModal(task = null) {

    const modal =
        document.getElementById("taskModal");

    const form =
        document.getElementById("taskForm");

    const title =
        document.getElementById("taskModalTitle");

    if (!modal || !form) return;

    form.reset();

    document.getElementById(
        "editTaskId"
    ).value = "";

    document.getElementById(
        "taskCreatedDate"
    ).value = todayISO();

    if (currentDepartment) {

        document.getElementById(
            "taskDepartment"
        ).value =
            currentDepartment;

    }

    if (task) {

        title.textContent =
            "Edit Task";

        document.getElementById(
            "editTaskId"
        ).value =
            task.id;

        document.getElementById(
            "taskName"
        ).value =
            task.name || "";

        document.getElementById(
            "taskDepartment"
        ).value =
            task.department || "";

        document.getElementById(
            "taskAssignedTo"
        ).value =
            task.assignedTo || "";

        document.getElementById(
            "taskPriority"
        ).value =
            task.priority || "Medium";

        document.getElementById(
            "taskStatus"
        ).value =
            task.status || "Open";

        document.getElementById(
            "taskCreatedDate"
        ).value =
            task.createdDate || todayISO();

        document.getElementById(
            "taskDueDate"
        ).value =
            task.dueDate || "";

        document.getElementById(
            "taskFollowupDate"
        ).value =
            task.followupDate || "";

        document.getElementById(
            "taskFollowupAction"
        ).value =
            task.followupAction || "";

        document.getElementById(
            "taskRemarks"
        ).value =
            task.remarks || "";

    } else {

        title.textContent =
            "Add New Task";

    }

    modal.style.display = "flex";

}


function closeTaskModal() {

    const modal =
        document.getElementById("taskModal");

    if (modal) {

        modal.style.display = "none";

    }

}


/* =========================================================
   TASK FORM
========================================================= */

function setupTaskForm() {

    const form =
        document.getElementById("taskForm");

    const closeButton =
        document.getElementById(
            "closeTaskModal"
        );

    const cancelButton =
        document.getElementById(
            "cancelTaskButton"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeTaskModal
        );

    }

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeTaskModal
        );

    }

    if (!form) return;

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            saveTask();

        }
    );

}


/* =========================================================
   SAVE TASK
========================================================= */

function saveTask() {

    const editId =
        document.getElementById(
            "editTaskId"
        ).value;

    const taskData = {

        id:
            editId ||
            generateTaskId(),

        name:
            document.getElementById(
                "taskName"
            ).value.trim(),

        department:
            document.getElementById(
                "taskDepartment"
            ).value,

        assignedTo:
            document.getElementById(
                "taskAssignedTo"
            ).value.trim(),

        priority:
            document.getElementById(
                "taskPriority"
            ).value,

        status:
            document.getElementById(
                "taskStatus"
            ).value,

        createdDate:
            document.getElementById(
                "taskCreatedDate"
            ).value ||
            todayISO(),

        dueDate:
            document.getElementById(
                "taskDueDate"
            ).value,

        followupDate:
            document.getElementById(
                "taskFollowupDate"
            ).value,

        followupAction:
            document.getElementById(
                "taskFollowupAction"
            ).value.trim(),

        remarks:
            document.getElementById(
                "taskRemarks"
            ).value.trim(),

        updatedAt:
            new Date().toISOString()

    };


    if (!taskData.name) {

        notify(
            "Missing Task",
            "Please enter the task name."
        );

        return;

    }


    if (!taskData.department) {

        notify(
            "Missing Department",
            "Please select a department."
        );

        return;

    }


    if (editId) {

        const index =
            tasks.findIndex(function (task) {

                return task.id === editId;

            });

        if (index !== -1) {

            const oldTask =
                tasks[index];

            tasks[index] =
                taskData;

            addActivity(
                "Task Updated",
                taskData.name +
                " was updated.",
                taskData.department
            );

        }

    } else {

        tasks.unshift(taskData);

        addActivity(
            "Task Created",
            taskData.name +
            " was added.",
            taskData.department
        );

    }


    saveData();

    closeTaskModal();

    refreshEverything();

    notify(
        editId ?
        "Task Updated" :
        "Task Created",
        editId ?
        "Task successfully updated." :
        "New task successfully created."
    );

}


/* =========================================================
   GENERATE TASK ID
========================================================= */

function generateTaskId() {

    const number =
        Date.now()
        .toString()
        .slice(-6);

    return "TASK-" + number;

}


/* =========================================================
   EDIT TASK
========================================================= */

function editTask(taskId) {

    const task =
        tasks.find(function (item) {

            return item.id === taskId;

        });

    if (!task) return;

    openTaskModal(task);

}


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(taskId) {

    const task =
        tasks.find(function (item) {

            return item.id === taskId;

        });

    if (!task) return;

    const confirmed =
        confirm(
            "Delete this task?\n\n" +
            task.name
        );

    if (!confirmed) return;

    tasks =
        tasks.filter(function (item) {

            return item.id !== taskId;

        });

    addActivity(
        "Task Deleted",
        task.name +
        " was deleted.",
        task.department
    );

    saveData();

    refreshEverything();

    notify(
        "Task Deleted",
        "The task has been removed."
    );

}


/* =========================================================
   STATUS LOGIC
========================================================= */

function getEffectiveStatus(task) {

    if (
        task.status !== "Completed" &&
        task.dueDate &&
        isPastDate(task.dueDate)
    ) {

        return "Overdue";

    }

    return task.status;

}


/* =========================================================
   DATE HELPERS
========================================================= */

function todayISO() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


function isPastDate(dateString) {

    if (!dateString) return false;

    return dateString < todayISO();

}


function isToday(dateString) {

    return (
        dateString &&
        dateString === todayISO()
    );

}


function isUpcoming(dateString) {

    if (!dateString) return false;

    return (
        dateString > todayISO()
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    if (!dateString) return "—";

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    if (isNaN(date.getTime())) {

        return dateString;

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   REFRESH EVERYTHING
========================================================= */

function refreshEverything() {

    refreshDashboard();

    refreshTasksTable();

    refreshFollowups();

    refreshDepartments();

    refreshDepartmentPage();

    refreshReports();

    refreshActivity();

    updateDataSourceStatus();

}


/* =========================================================
   DASHBOARD
========================================================= */

function refreshDashboard() {

    const total =
        tasks.length;

    const open =
        tasks.filter(function (task) {

            return (
                getEffectiveStatus(task) ===
                "Open"
            );

        }).length;

    const progress =
        tasks.filter(function (task) {

            return (
                getEffectiveStatus(task) ===
                "In Progress"
            );

        }).length;

    const blocked =
        tasks.filter(function (task) {

            return (
                getEffectiveStatus(task) ===
                "Blocked"
            );

        }).length;

    const overdue =
        tasks.filter(function (task) {

            return (
                getEffectiveStatus(task) ===
                "Overdue"
            );

        }).length;

    const completed =
        tasks.filter(function (task) {

            return (
                task.status ===
                "Completed"
            );

        }).length;


    setText(
        "totalTasks",
        total
    );

    setText(
        "openTasks",
        open
    );

    setText(
        "progressTasks",
        progress
    );

    setText(
        "blockedTasks",
        blocked
    );

    setText(
        "overdueTasks",
        overdue
    );

    setText(
        "completedTasks",
        completed
    );


    const high =
        tasks.filter(function (task) {

            return (
                task.priority ===
                "High"
            );

        }).length;

    const medium =
        tasks.filter(function (task) {

            return (
                task.priority ===
                "Medium"
            );

        }).length;

    const low =
        tasks.filter(function (task) {

            return (
                task.priority ===
                "Low"
            );

        }).length;


    setText(
        "highPriorityCount",
        high
    );

    setText(
        "mediumPriorityCount",
        medium
    );

    setText(
        "lowPriorityCount",
        low
    );


    const dueToday =
        tasks.filter(function (task) {

            return (
                task.followupDate &&
                isToday(
                    task.followupDate
                )
            );

        }).length;


    const followupOverdue =
        tasks.filter(function (task) {

            return (
                task.followupDate &&
                isPastDate(
                    task.followupDate
                )
            );

        }).length;


    const upcoming =
        tasks.filter(function (task) {

            return (
                task.followupDate &&
                isUpcoming(
                    task.followupDate
                )
            );

        }).length;


    setText(
        "followupsToday",
        dueToday
    );

    setText(
        "followupsOverdue",
        followupOverdue
    );

    setText(
        "followupsUpcoming",
        upcoming
    );


    renderDepartmentPerformance();

    renderRecentTasks();

}


/* =========================================================
   RECENT TASKS
========================================================= */

function renderRecentTasks() {

    const table =
        document.getElementById(
            "recentTasksTable"
        );

    if (!table) return;

    const recent =
        tasks.slice(0, 10);

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
        recent.map(function (task) {

            return `
                <tr>

                    <td>${escapeHTML(task.id)}</td>

                    <td>
                        ${escapeHTML(task.name)}
                    </td>

                    <td>
                        ${escapeHTML(task.department)}
                    </td>

                    <td>
                        ${escapeHTML(task.assignedTo)}
                    </td>

                    <td>
                        ${statusBadge(
                            task.priority
                        )}
                    </td>

                    <td>
                        ${statusBadge(
                            getEffectiveStatus(task)
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            task.dueDate
                        )}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   TASK TABLE
========================================================= */

function refreshTasksTable() {

    const table =
        document.getElementById(
            "allTasksTable"
        );

    if (!table) return;

    let filtered =
        applyTaskFilters();

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
        filtered.map(function (task) {

            return `
                <tr>

                    <td>
                        ${escapeHTML(task.id)}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(task.name)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(task.department)}
                    </td>

                    <td>
                        ${escapeHTML(task.assignedTo)}
                    </td>

                    <td>
                        ${statusBadge(
                            task.priority
                        )}
                    </td>

                    <td>
                        ${statusBadge(
                            getEffectiveStatus(task)
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            task.dueDate
                        )}
                    </td>

                    <td>

                        <button
                            class="table-action"
                            onclick="editTask('${task.id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="table-action danger"
                            onclick="deleteTask('${task.id}')"
                        >
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    [
        "taskSearch",
        "departmentFilter",
        "priorityFilter",
        "statusFilter"

    ].forEach(function (id) {

        const element =
            document.getElementById(id);

        if (!element) return;

        element.addEventListener(
            "input",
            refreshTasksTable
        );

        element.addEventListener(
            "change",
            refreshTasksTable
        );

    });

}


function applyTaskFilters() {

    const search =
        getValue("taskSearch")
            .toLowerCase();

    const department =
        getValue("departmentFilter");

    const priority =
        getValue("priorityFilter");

    const status =
        getValue("statusFilter");


    return tasks.filter(function (task) {

        const effectiveStatus =
            getEffectiveStatus(task);

        const matchesSearch =
            !search ||
            (
                task.name || ""
            ).toLowerCase()
                .includes(search) ||
            (
                task.id || ""
            ).toLowerCase()
                .includes(search) ||
            (
                task.assignedTo || ""
            ).toLowerCase()
                .includes(search);

        const matchesDepartment =
            !department ||
            task.department ===
            department;

        const matchesPriority =
            !priority ||
            task.priority ===
            priority;

        const matchesStatus =
            !status ||
            effectiveStatus ===
            status;

        return (
            matchesSearch &&
            matchesDepartment &&
            matchesPriority &&
            matchesStatus
        );

    });

}


/* =========================================================
   FOLLOW UPS
========================================================= */

function refreshFollowups() {

    const followupTasks =
        tasks.filter(function (task) {

            return (
                task.followupDate ||
                task.followupAction
            );

        });

    const today =
        followupTasks.filter(function (task) {

            return isToday(
                task.followupDate
            );

        });

    const overdue =
        followupTasks.filter(function (task) {

            return isPastDate(
                task.followupDate
            );

        });

    const upcoming =
        followupTasks.filter(function (task) {

            return isUpcoming(
                task.followupDate
            );

        });


    setText(
        "followupPageToday",
        today.length
    );

    setText(
        "followupPageOverdue",
        overdue.length
    );

    setText(
        "followupPageUpcoming",
        upcoming.length
    );


    const table =
        document.getElementById(
            "followupsTable"
        );

    if (!table) return;


    if (!followupTasks.length) {

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
        followupTasks.map(function (task) {

            return `
                <tr>

                    <td>
                        ${escapeHTML(task.id)}
                    </td>

                    <td>
                        ${escapeHTML(task.name)}
                    </td>

                    <td>
                        ${escapeHTML(task.department)}
                    </td>

                    <td>
                        ${escapeHTML(task.assignedTo)}
                    </td>

                    <td>
                        ${formatDate(
                            task.followupDate
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            task.followupAction ||
                            "—"
                        )}
                    </td>

                    <td>
                        ${statusBadge(
                            getEffectiveStatus(task)
                        )}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   DEPARTMENTS
========================================================= */

function refreshDepartments() {

    const grid =
        document.getElementById(
            "departmentsGrid"
        );

    if (!grid) return;

    grid.innerHTML =
        DEPARTMENTS.map(function (department) {

            const departmentTasks =
                tasks.filter(function (task) {

                    return (
                        task.department ===
                        department.name
                    );

                });

            const completed =
                departmentTasks.filter(
                    function (task) {

                        return (
                            task.status ===
                            "Completed"
                        );

                    }
                ).length;

            const percentage =
                departmentTasks.length ?
                Math.round(
                    (
                        completed /
                        departmentTasks.length
                    ) * 100
                ) :
                0;

            return `
                <div
                    class="department-card"
                    onclick="openDepartment('${department.name}')"
                >

                    <div class="department-card-header">

                        <span class="department-code">
                            ${department.code}
                        </span>

                        <strong>
                            ${escapeHTML(
                                department.name
                            )}
                        </strong>

                    </div>

                    <div class="department-card-stats">

                        <div>
                            <span>Total</span>
                            <strong>
                                ${departmentTasks.length}
                            </strong>
                        </div>

                        <div>
                            <span>Completed</span>
                            <strong>
                                ${completed}
                            </strong>
                        </div>

                        <div>
                            <span>Progress</span>
                            <strong>
                                ${percentage}%
                            </strong>
                        </div>

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   DEPARTMENT PERFORMANCE
========================================================= */

function renderDepartmentPerformance() {

    const container =
        document.getElementById(
            "departmentPerformance"
        );

    if (!container) return;

    container.innerHTML =
        DEPARTMENTS.map(function (department) {

            const departmentTasks =
                tasks.filter(function (task) {

                    return (
                        task.department ===
                        department.name
                    );

                });

            const completed =
                departmentTasks.filter(
                    function (task) {

                        return (
                            task.status ===
                            "Completed"
                        );

                    }
                ).length;

            const percentage =
                departmentTasks.length ?
                Math.round(
                    completed /
                    departmentTasks.length *
                    100
                ) :
                0;

            return `
                <div class="department-performance-row">

                    <div>

                        <strong>
                            ${escapeHTML(
                                department.name
                            )}
                        </strong>

                        <span>
                            ${departmentTasks.length}
                            task(s)
                        </span>

                    </div>

                    <div>

                        <strong>
                            ${percentage}%
                        </strong>

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   DEPARTMENT DETAIL
========================================================= */

function refreshDepartmentPage() {

    if (!currentDepartment) return;

    const departmentTasks =
        tasks.filter(function (task) {

            return (
                task.department ===
                currentDepartment
            );

        });


    const total =
        departmentTasks.length;

    const open =
        departmentTasks.filter(
            function (task) {

                return (
                    getEffectiveStatus(task) ===
                    "Open"
                );

            }
        ).length;

    const progress =
        departmentTasks.filter(
            function (task) {

                return (
                    getEffectiveStatus(task) ===
                    "In Progress"
                );

            }
        ).length;

    const blocked =
        departmentTasks.filter(
            function (task) {

                return (
                    getEffectiveStatus(task) ===
                    "Blocked"
                );

            }
        ).length;

    const overdue =
        departmentTasks.filter(
            function (task) {

                return (
                    getEffectiveStatus(task) ===
                    "Overdue"
                );

            }
        ).length;

    const completed =
        departmentTasks.filter(
            function (task) {

                return (
                    task.status ===
                    "Completed"
                );

            }
        ).length;


    setText(
        "departmentTotal",
        total
    );

    setText(
        "departmentOpen",
        open
    );

    setText(
        "departmentProgress",
        progress
    );

    setText(
        "departmentBlocked",
        blocked
    );

    setText(
        "departmentOverdue",
        overdue
    );

    setText(
        "departmentCompleted",
        completed
    );


    const table =
        document.getElementById(
            "departmentTasksTable"
        );

    if (!table) return;


    if (!departmentTasks.length) {

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
        departmentTasks.map(function (task) {

            return `
                <tr>

                    <td>
                        ${escapeHTML(task.id)}
                    </td>

                    <td>
                        ${escapeHTML(task.name)}
                    </td>

                    <td>
                        ${escapeHTML(task.assignedTo)}
                    </td>

                    <td>
                        ${statusBadge(
                            task.priority
                        )}
                    </td>

                    <td>
                        ${statusBadge(
                            getEffectiveStatus(task)
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            task.dueDate
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            task.followupDate
                        )}
                    </td>

                    <td>

                        <button
                            class="table-action"
                            onclick="editTask('${task.id}')"
                        >
                            Edit
                        </button>

                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   REPORTS
========================================================= */

function refreshReports() {

    const table =
        document.getElementById(
            "analysisTable"
        );

    if (!table) return;


    table.innerHTML =
        DEPARTMENTS.map(function (department) {

            const departmentTasks =
                tasks.filter(function (task) {

                    return (
                        task.department ===
                        department.name
                    );

                });


            const total =
                departmentTasks.length;

            const open =
                departmentTasks.filter(
                    function (task) {

                        return (
                            getEffectiveStatus(task) ===
                            "Open"
                        );

                    }
                ).length;

            const progress =
                departmentTasks.filter(
                    function (task) {

                        return (
                            getEffectiveStatus(task) ===
                            "In Progress"
                        );

                    }
                ).length;

            const blocked =
                departmentTasks.filter(
                    function (task) {

                        return (
                            getEffectiveStatus(task) ===
                            "Blocked"
                        );

                    }
                ).length;

            const overdue =
                departmentTasks.filter(
                    function (task) {

                        return (
                            getEffectiveStatus(task) ===
                            "Overdue"
                        );

                    }
                ).length;

            const completed =
                departmentTasks.filter(
                    function (task) {

                        return (
                            task.status ===
                            "Completed"
                        );

                    }
                ).length;


            const completion =
                total ?
                Math.round(
                    completed /
                    total *
                    100
                ) :
                0;


            return `
                <tr>

                    <td>
                        ${escapeHTML(
                            department.name
                        )}
                    </td>

                    <td>${total}</td>

                    <td>${open}</td>

                    <td>${progress}</td>

                    <td>${blocked}</td>

                    <td>${overdue}</td>

                    <td>${completed}</td>

                    <td>
                        ${completion}%
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   ACTIVITY LOG
========================================================= */

function addActivity(
    title,
    description,
    department
) {

    activities.unshift({

        id:
            "ACT-" +
            Date.now(),

        title:
            title,

        description:
            description,

        department:
            department,

        timestamp:
            new Date().toISOString()

    });

    activities =
        activities.slice(0, 200);

    saveActivity();

}


function refreshActivity() {

    const container =
        document.getElementById(
            "activityTimeline"
        );

    if (!container) return;


    if (!activities.length) {

        container.innerHTML = `
            <div class="empty-state">
                No activity recorded yet.
            </div>
        `;

        return;

    }


    container.innerHTML =
        activities.map(function (activity) {

            return `
                <div class="activity-item">

                    <div class="activity-dot">
                    </div>

                    <div class="activity-content">

                        <strong>
                            ${escapeHTML(
                                activity.title
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                activity.description
                            )}
                        </p>

                        <small>

                            ${
                                escapeHTML(
                                    activity.department ||
                                    ""
                                )
                            }

                            ·

                            ${
                                formatDateTime(
                                    activity.timestamp
                                )
                            }

                        </small>

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   MENU
========================================================= */

function setupMenu() {

    const button =
        document.getElementById(
            "menuToggle"
        );

    if (!button) return;

    button.addEventListener(
        "click",
        function () {

            const sidebar =
                document.querySelector(
                    ".sidebar"
                );

            if (sidebar) {

                sidebar.classList.toggle(
                    "mobile-open"
                );

            }

        }
    );

}


/* =========================================================
   REPORT BUTTONS
========================================================= */

function setupReports() {

    const exportTasks =
        document.getElementById(
            "exportTasksButton"
        );

    const exportExcel =
        document.getElementById(
            "exportExcelButton"
        );

    const exportAll =
        document.getElementById(
            "exportAllButton"
        );

    if (exportTasks) {

        exportTasks.addEventListener(
            "click",
            function () {

                exportCSV(
                    tasks,
                    "UsedBookR_Tasks.csv"
                );

            }
        );

    }

    if (exportExcel) {

        exportExcel.addEventListener(
            "click",
            function () {

                exportCSV(
                    tasks,
                    "UsedBookR_Operations.csv"
                );

            }
        );

    }

    if (exportAll) {

        exportAll.addEventListener(
            "click",
            function () {

                exportAllData();

            }
        );

    }


    const departmentReport =
        document.getElementById(
            "departmentReportButton"
        );

    if (departmentReport) {

        departmentReport.addEventListener(
            "click",
            function () {

                exportDepartmentReport();

            }
        );

    }


    const performance =
        document.getElementById(
            "performanceReportButton"
        );

    if (performance) {

        performance.addEventListener(
            "click",
            function () {

                exportPerformanceReport();

            }
        );

    }


    const importButton =
        document.getElementById(
            "importExcelButton"
        );

    if (importButton) {

        importButton.addEventListener(
            "click",
            function () {

                notify(
                    "Import",
                    "Excel import will be connected in the next stage."
                );

            }
        );

    }

}


/* =========================================================
   CSV EXPORT
========================================================= */

function exportCSV(data, filename) {

    if (!data.length) {

        notify(
            "Nothing to Export",
            "There is currently no data."
        );

        return;

    }


    const headers = Object.keys(
        data[0]
    );


    const rows =
        data.map(function (item) {

            return headers.map(
                function (header) {

                    const value =
                        item[header] ?? "";

                    return '"' +
                        String(value)
                            .replace(
                                /"/g,
                                '""'
                            ) +
                        '"';

                }
            ).join(",");

        });


    const csv =
        [
            headers.join(","),
            ...rows

        ].join("\n");


    downloadFile(
        csv,
        filename,
        "text/csv"
    );


    notify(
        "Export Complete",
        filename +
        " has been downloaded."
    );

}


/* =========================================================
   DEPARTMENT REPORT
========================================================= */

function exportDepartmentReport() {

    const report =
        DEPARTMENTS.map(
            function (department) {

                const list =
                    tasks.filter(
                        function (task) {

                            return (
                                task.department ===
                                department.name
                            );

                        }
                    );

                const completed =
                    list.filter(
                        function (task) {

                            return (
                                task.status ===
                                "Completed"
                            );

                        }
                    ).length;

                return {

                    Department:
                        department.name,

                    Total:
                        list.length,

                    Open:
                        list.filter(
                            t =>
                                getEffectiveStatus(t) ===
                                "Open"
                        ).length,

                    InProgress:
                        list.filter(
                            t =>
                                getEffectiveStatus(t) ===
                                "In Progress"
                        ).length,

                    Blocked:
                        list.filter(
                            t =>
                                getEffectiveStatus(t) ===
                                "Blocked"
                        ).length,

                    Overdue:
                        list.filter(
                            t =>
                                getEffectiveStatus(t) ===
                                "Overdue"
                        ).length,

                    Completed:
                        completed,

                    CompletionPercent:
                        list.length ?
                        Math.round(
                            completed /
                            list.length *
                            100
                        ) :
                        0

                };

            }
        );


    exportCSV(
        report,
        "UsedBookR_Department_Report.csv"
    );

}


/* =========================================================
   PERFORMANCE REPORT
========================================================= */

function exportPerformanceReport() {

    const report =
        tasks.map(function (task) {

            return {

                TaskID:
                    task.id,

                Task:
                    task.name,

                Department:
                    task.department,

                AssignedTo:
                    task.assignedTo,

                Priority:
                    task.priority,

                OriginalStatus:
                    task.status,

                EffectiveStatus:
                    getEffectiveStatus(task),

                CreatedDate:
                    task.createdDate,

                DueDate:
                    task.dueDate,

                FollowupDate:
                    task.followupDate,

                FollowupAction:
                    task.followupAction,

                Remarks:
                    task.remarks

            };

        });


    exportCSV(
        report,
        "UsedBookR_Performance_Report.csv"
    );

}


/* =========================================================
   EXPORT ALL DATA
========================================================= */

function exportAllData() {

    const data = {

        exportedAt:
            new Date().toISOString(),

        departments:
            DEPARTMENTS,

        tasks:
            tasks,

        activities:
            activities

    };


    downloadFile(
        JSON.stringify(
            data,
            null,
            2
        ),
        "UsedBookR_Operations_Backup.json",
        "application/json"
    );


    notify(
        "Backup Created",
        "All operational data has been exported."
    );

}


/* =========================================================
   DOWNLOAD HELPER
========================================================= */

function downloadFile(
    content,
    filename,
    type
) {

    const blob =
        new Blob(
            [content],
            {
                type: type
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href =
        url;

    link.download =
        filename;

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );

    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadData() {

    try {

        const savedTasks =
            localStorage.getItem(
                APP_CONFIG.STORAGE_KEY
            );

        const savedActivities =
            localStorage.getItem(
                APP_CONFIG.ACTIVITY_KEY
            );


        tasks =
            savedTasks ?
            JSON.parse(savedTasks) :
            [];


        activities =
            savedActivities ?
            JSON.parse(savedActivities) :
            [];


        if (!Array.isArray(tasks)) {

            tasks = [];

        }

        if (!Array.isArray(activities)) {

            activities = [];

        }

    } catch (error) {

        console.error(
            "Data loading error:",
            error
        );

        tasks = [];

        activities = [];

    }

}


function saveData() {

    localStorage.setItem(
        APP_CONFIG.STORAGE_KEY,
        JSON.stringify(tasks)
    );

}


function saveActivity() {

    localStorage.setItem(
        APP_CONFIG.ACTIVITY_KEY,
        JSON.stringify(activities)
    );

}


/* =========================================================
   DATA SOURCE STATUS
========================================================= */

function updateDataSourceStatus() {

    const element =
        document.getElementById(
            "dataSourceStatus"
        );

    if (!element) return;

    element.textContent =
        "Browser Local Storage";

}


/* =========================================================
   CURRENT DATE
========================================================= */

function updateCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) return;

    const date =
        new Date();

    element.textContent =
        date.toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


/* =========================================================
   NOTIFICATION
========================================================= */

function notify(
    title,
    message
) {

    const notification =
        document.getElementById(
            "notification"
        );

    const titleElement =
        document.getElementById(
            "notificationTitle"
        );

    const messageElement =
        document.getElementById(
            "notificationMessage"
        );


    if (
        !notification ||
        !titleElement ||
        !messageElement
    ) return;


    titleElement.textContent =
        title;

    messageElement.textContent =
        message;


    notification.classList.add(
        "show"
    );


    setTimeout(
        function () {

            notification.classList.remove(
                "show"
            );

        },
        3000
    );

}


/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


function getValue(id) {

    const element =
        document.getElementById(id);

    return element ?
        element.value :
        "";

}


function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   STATUS BADGES
========================================================= */

function statusBadge(status) {

    const safeStatus =
        escapeHTML(status);

    const className =
        String(status)
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );


    return `
        <span class="status-badge ${className}">
            ${safeStatus}
        </span>
    `;

}


/* =========================================================
   DATE / TIME
========================================================= */

function formatDateTime(
    timestamp
) {

    if (!timestamp) return "—";

    const date =
        new Date(timestamp);

    if (isNaN(date.getTime())) {

        return timestamp;

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


/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "taskModal"
            );

        if (!modal) return;

        if (
            event.target === modal
        ) {

            closeTaskModal();

        }

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   Required for inline table buttons
========================================================= */

window.editTask =
    editTask;

window.deleteTask =
    deleteTask;

window.openDepartment =
    openDepartment;
