```javascript
/* =====================================================
   USED BOOKR OPERATIONS MANAGEMENT
   Google Sheets API Connection
===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyrOAQZ--7aDiAHv0ey60C8-xXuTKDAhOVDQjUOc-uiGdgNnpuJ97nL4m-ABkw0Znf3ig/exec";


/* =====================================================
   DEPARTMENTS
===================================================== */

const DEPARTMENTS = [
    "B2B / Sales",
    "Customer Support",
    "Warehouse",
    "Scanning / Catalog",
    "Listing / Inventory",
    "Digital Marketing",
    "IT / Software Development",
    "Finance",
    "Book Fair / Events",
    "Books & Supply Procurement",
    "HR",
    "Data Analysis",
    "Software Testing",
    "Product Development"
];


/* =====================================================
   APPLICATION DATA
===================================================== */

let tasks = [];
let activityLog = [];

let currentDepartment = null;


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    initializeLogin();

    initializeNavigation();

    initializeButtons();

    initializeFilters();

    initializeDepartmentDropdowns();

    updateCurrentDate();

});


/* =====================================================
   LOGIN
===================================================== */

function initializeLogin() {

    const loginForm =
        document.getElementById("loginForm");

    const loginScreen =
        document.getElementById("loginScreen");

    const app =
        document.getElementById("app");

    const loginError =
        document.getElementById("loginError");

    if (!loginForm) return;


    /*
     * Password
     *
     * IMPORTANT:
     * Keep your existing working password here.
     */

    const PASSWORD = "UsedBookR@2026";


    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            if (password === PASSWORD) {

                loginScreen.style.display =
                    "none";

                app.style.display =
                    "flex";

                loginError.classList.remove(
                    "show"
                );


                /*
                 * Load Google Sheets data
                 */

                loadAllData();

            } else {

                loginError.classList.add(
                    "show"
                );

            }

        }
    );


    /*
     * Logout
     */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                app.style.display =
                    "none";

                loginScreen.style.display =
                    "flex";

                document.getElementById(
                    "loginPassword"
                ).value = "";

            }
        );

    }

}


/* =====================================================
   LOAD ALL DATA
===================================================== */

async function loadAllData() {

    showNotification(
        "Loading",
        "Fetching operations data..."
    );


    try {

        const response =
            await fetch(
                API_URL +
                "?action=getTasks"
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load tasks"
            );

        }


        tasks =
            Array.isArray(data.tasks)
                ? data.tasks
                : [];


        /*
         * Load activity separately
         */

        await loadActivity();


        /*
         * Update everything
         */

        refreshApplication();


        updateDataSourceStatus(
            "Google Sheets"
        );


        showNotification(
            "Connected",
            tasks.length +
            " task(s) loaded from Google Sheets."
        );


    } catch (error) {

        console.error(
            "API ERROR:",
            error
        );


        updateDataSourceStatus(
            "Connection Error"
        );


        showNotification(
            "Connection Error",
            "Could not load Google Sheets data."
        );

    }

}


/* =====================================================
   LOAD ACTIVITY
===================================================== */

async function loadActivity() {

    try {

        const response =
            await fetch(
                API_URL +
                "?action=getActivity"
            );


        const data =
            await response.json();


        if (data.success) {

            activityLog =
                Array.isArray(
                    data.activity
                )
                    ? data.activity
                    : [];

        }

    } catch (error) {

        console.error(
            "Activity API error:",
            error
        );

        activityLog = [];

    }

}


/* =====================================================
   REFRESH APPLICATION
===================================================== */

function refreshApplication() {

    updateDashboard();

    renderAllTasks();

    renderFollowups();

    renderDepartments();

    renderAnalysis();

    renderActivity();

}


/* =====================================================
   NAVIGATION
===================================================== */

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    const page =
                        item.dataset.page;

                    const department =
                        item.dataset.department;


                    if (department) {

                        openDepartment(
                            department
                        );

                        return;

                    }


                    if (page) {

                        showPage(page);

                    }

                }
            );

        }
    );

}


/* =====================================================
   SHOW PAGE
===================================================== */

function showPage(page) {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        function (section) {

            section.classList.remove(
                "active-page"
            );

        }
    );


    const target =
        document.getElementById(
            page + "Page"
        );


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    const titles = {

        dashboard:
            [
                "Operations Dashboard",
                "Centralized operational monitoring"
            ],

        tasks:
            [
                "All Tasks",
                "Manage operational tasks"
            ],

        followups:
            [
                "Follow-ups",
                "Monitor pending actions"
            ],

        reports:
            [
                "Reports & Analysis",
                "Operational performance"
            ],

        activity:
            [
                "Activity Log",
                "Operational audit trail"
            ],

        settings:
            [
                "Settings",
                "System configuration"
            ]

    };


    if (titles[page]) {

        document.getElementById(
            "pageTitle"
        ).textContent =
            titles[page][0];


        document.getElementById(
            "pageSubtitle"
        ).textContent =
            titles[page][1];

    }


    /*
     * Update active navigation
     */

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );

                if (
                    item.dataset.page ===
                    page
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            }
        );

}


/* =====================================================
   OPEN DEPARTMENT
===================================================== */

function openDepartment(
    department
) {

    currentDepartment =
        department;


    showPage(
        "departmentDetail"
    );


    document.getElementById(
        "departmentDetailTitle"
    ).textContent =
        department;


    document.getElementById(
        "departmentDetailSubtitle"
    ).textContent =
        "Operational overview for " +
        department;


    const departmentTasks =
        getDepartmentTasks(
            department
        );


    updateDepartmentKPIs(
        departmentTasks
    );


    renderDepartmentTasks(
        departmentTasks
    );


    /*
     * Active sidebar item
     */

    document
        .querySelectorAll(
            ".department-item"
        )
        .forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );


                if (
                    item.dataset.department ===
                    department
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            }
        );

}


/* =====================================================
   GET DEPARTMENT TASKS
===================================================== */

function getDepartmentTasks(
    department
) {

    return tasks.filter(
        function (task) {

            return normalize(
                task.department
            ) === normalize(
                department
            );

        }
    );

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const total =
        tasks.length;


    const open =
        countStatus(
            "Open"
        );


    const progress =
        countStatus(
            "In Progress"
        );


    const blocked =
        countStatus(
            "Blocked"
        );


    const completed =
        countStatus(
            "Completed"
        );


    const overdue =
        tasks.filter(
            isTaskOverdue
        ).length;


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
        "completedTasks",
        completed
    );

    setText(
        "overdueTasks",
        overdue
    );


    /*
     * Priority
     */

    setText(
        "highPriorityCount",
        countPriority("High")
    );

    setText(
        "mediumPriorityCount",
        countPriority("Medium")
    );

    setText(
        "lowPriorityCount",
        countPriority("Low")
    );


    /*
     * Follow-ups
     */

    const today =
        tasks.filter(
            isFollowupToday
        ).length;


    const followupOverdue =
        tasks.filter(
            isFollowupOverdue
        ).length;


    const upcoming =
        tasks.filter(
            isUpcomingFollowup
        ).length;


    setText(
        "followupsToday",
        today
    );

    setText(
        "followupsOverdue",
        followupOverdue
    );

    setText(
        "followupsUpcoming",
        upcoming
    );


    /*
     * Recent Tasks
     */

    renderRecentTasks();


    /*
     * Department performance
     */

    renderDepartmentPerformance();

}


/* =====================================================
   STATUS COUNT
===================================================== */

function countStatus(
    status
) {

    return tasks.filter(
        function (task) {

            return task.status ===
                status;

        }
    ).length;

}


/* =====================================================
   PRIORITY COUNT
===================================================== */

function countPriority(
    priority
) {

    return tasks.filter(
        function (task) {

            return task.priority ===
                priority;

        }
    ).length;

}


/* =====================================================
   RECENT TASKS
===================================================== */

function renderRecentTasks() {

    const tbody =
        document.getElementById(
            "recentTasksTable"
        );


    if (!tbody) return;


    const recent =
        [...tasks]
            .reverse()
            .slice(0, 10);


    if (
        recent.length === 0
    ) {

        tbody.innerHTML =
            emptyRow(
                7,
                "No tasks available."
            );

        return;

    }


    tbody.innerHTML =
        recent.map(
            task =>
                `
                <tr>

                    <td>${escapeHTML(task.taskId)}</td>

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
                        ${priorityBadge(
                            task.priority
                        )}
                    </td>

                    <td>
                        ${statusBadge(
                            task.status
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            task.dueDate
                        )}
                    </td>

                </tr>
                `
        ).join("");

}


/* =====================================================
   ALL TASKS
===================================================== */

function renderAllTasks() {

    const tbody =
        document.getElementById(
            "allTasksTable"
        );


    if (!tbody) return;


    const filtered =
        getFilteredTasks();


    if (
        filtered.length === 0
    ) {

        tbody.innerHTML =
            emptyRow(
                8,
                "No matching tasks."
            );

        return;

    }


    tbody.innerHTML =
        filtered.map(
            task =>
                `
                <tr>

                    <td>
                        ${escapeHTML(
                            task.taskId
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            task.task
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            task.department
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            task.assignedTo
                        )}
                    </td>

                    <td>
                        ${priorityBadge(
                            task.priority
                        )}
                    </td>

                    <td>
                        ${statusBadge(
                            task.status
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
                            onclick="editTask('${escapeAttribute(task.taskId)}')"
                        >
                            Edit
                        </button>

                    </td>

                </tr>
                `
        ).join("");

}


/* =====================================================
   FILTERS
===================================================== */

function initializeFilters() {

    [
        "taskSearch",
        "departmentFilter",
        "priorityFilter",
        "statusFilter"
    ].forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (!element) return;


            element.addEventListener(
                "input",
                renderAllTasks
            );


            element.addEventListener(
                "change",
                renderAllTasks
            );

        }
    );

}


function getFilteredTasks() {

    const search =
        (
            document.getElementById(
                "taskSearch"
            )?.value || ""
        )
            .toLowerCase()
            .trim();


    const department =
        document.getElementById(
            "departmentFilter"
        )?.value || "";


    const priority =
        document.getElementById(
            "priorityFilter"
        )?.value || "";


    const status =
        document.getElementById(
            "statusFilter"
        )?.value || "";


    return tasks.filter(
        function (task) {

            const matchesSearch =
                !search ||

                String(
                    task.taskId
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    task.task
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    task.assignedTo
                )
                    .toLowerCase()
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
                task.status ===
                status;


            return (
                matchesSearch &&
                matchesDepartment &&
                matchesPriority &&
                matchesStatus
            );

        }
    );

}


/* =====================================================
   FOLLOW UPS
===================================================== */

function renderFollowups() {

    const tbody =
        document.getElementById(
            "followupsTable"
        );


    if (!tbody) return;


    const followups =
        tasks.filter(
            function (task) {

                return task.followupDate;

            }
        );


    if (
        followups.length === 0
    ) {

        tbody.innerHTML =
            emptyRow(
                7,
                "No follow-ups available."
            );

        return;

    }


    tbody.innerHTML =
        followups.map(
            task =>
                `
                <tr>

                    <td>
                        ${escapeHTML(
                            task.taskId
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            task.task
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            task.department
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            task.assignedTo
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            task.followupDate
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            task.lastAction || "-"
                        )}
                    </td>

                    <td>
                        ${statusBadge(
                            task.status
                        )}
                    </td>

                </tr>
                `
        ).join("");


    setText(
        "followupPageToday",
        tasks.filter(
            isFollowupToday
        ).length
    );


    setText(
        "followupPageOverdue",
        tasks.filter(
            isFollowupOverdue
        ).length
    );


    setText(
        "followupPageUpcoming",
        tasks.filter(
            isUpcomingFollowup
        ).length
    );

}


/* =====================================================
   DEPARTMENTS
===================================================== */

function renderDepartments() {

    const grid =
        document.getElementById(
            "departmentsGrid"
        );


    if (!grid) return;


    grid.innerHTML =
        DEPARTMENTS.map(
            function (department) {

                const departmentTasks =
                    getDepartmentTasks(
                        department
                    );


                const completed =
                    departmentTasks.filter(
                        task =>
                            task.status ===
                            "Completed"
                    ).length;


                const percentage =
                    departmentTasks.length
                        ? Math.round(
                            completed /
                            departmentTasks.length *
                            100
                        )
                        : 0;


                return `
                    <div
                        class="department-card"
                        onclick="openDepartment('${escapeAttribute(department)}')"
                    >

                        <h3>
                            ${escapeHTML(
                                department
                            )}
                        </h3>

                        <strong>
                            ${departmentTasks.length}
                        </strong>

                        <span>
                            Tasks
                        </span>

                        <div>
                            ${percentage}% completed
                        </div>

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   DEPARTMENT PERFORMANCE
===================================================== */

function renderDepartmentPerformance() {

    const container =
        document.getElementById(
            "departmentPerformance"
        );


    if (!container) return;


    container.innerHTML =
        DEPARTMENTS.map(
            function (department) {

                const list =
                    getDepartmentTasks(
                        department
                    );


                const completed =
                    list.filter(
                        task =>
                            task.status ===
                            "Completed"
                    ).length;


                const percentage =
                    list.length
                        ? Math.round(
                            completed /
                            list.length *
                            100
                        )
                        : 0;


                return `
                    <div
                        class="department-performance-row"
                    >

                        <span>
                            ${escapeHTML(
                                department
                            )}
                        </span>

                        <strong>
                            ${list.length}
                        </strong>

                        <div
                            class="performance-bar"
                        >

                            <div
                                style="width:${percentage}%"
                            ></div>

                        </div>

                        <small>
                            ${percentage}%
                        </small>

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   DEPARTMENT DETAIL
===================================================== */

function updateDepartmentKPIs(
    list
) {

    setText(
        "departmentTotal",
        list.length
    );


    setText(
        "departmentOpen",
        list.filter(
            t => t.status === "Open"
        ).length
    );


    setText(
        "departmentProgress",
        list.filter(
            t =>
                t.status ===
                "In Progress"
        ).length
    );


    setText(
        "departmentBlocked",
        list.filter(
            t =>
                t.status ===
                "Blocked"
        ).length
    );


    setText(
        "departmentCompleted",
        list.filter(
            t =>
                t.status ===
                "Completed"
        ).length
    );


    setText(
        "departmentOverdue",
        list.filter(
            isTaskOverdue
        ).length
    );

}


function renderDepartmentTasks(
    list
) {

    const tbody =
        document.getElementById(
            "departmentTasksTable"
        );


    if (!tbody) return;


    if (
        list.length === 0
    ) {

        tbody.innerHTML =
            emptyRow(
                8,
                "No department tasks available."
            );

        return;

    }


    tbody.innerHTML =
        list.map(
            task =>
                `
                <tr>

                    <td>
                        ${escapeHTML(
                            task.taskId
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            task.task
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            task.assignedTo
                        )}
                    </td>

                    <td>
                        ${priorityBadge(
                            task.priority
                        )}
                    </td>

                    <td>
                        ${statusBadge(
                            task.status
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
                            onclick="editTask('${escapeAttribute(task.taskId)}')"
                        >
                            Edit
                        </button>

                    </td>

                </tr>
                `
        ).join("");

}


/* =====================================================
   REPORTS
===================================================== */

function renderAnalysis() {

    const tbody =
        document.getElementById(
            "analysisTable"
        );


    if (!tbody) return;


    tbody.innerHTML =
        DEPARTMENTS.map(
            function (department) {

                const list =
                    getDepartmentTasks(
                        department
                    );


                const total =
                    list.length;


                const completed =
                    list.filter(
                        t =>
                            t.status ===
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
                            ${escapeHTML(
                                department
                            )}
                        </td>

                        <td>
                            ${total}
                        </td>

                        <td>
                            ${list.filter(
                                t =>
                                    t.status ===
                                    "Open"
                            ).length}
                        </td>

                        <td>
                            ${list.filter(
                                t =>
                                    t.status ===
                                    "In Progress"
                            ).length}
                        </td>

                        <td>
                            ${list.filter(
                                t =>
                                    t.status ===
                                    "Blocked"
                            ).length}
                        </td>

                        <td>
                            ${list.filter(
                                isTaskOverdue
                            ).length}
                        </td>

                        <td>
                            ${completed}
                        </td>

                        <td>
                            ${percentage}%
                        </td>

                    </tr>
                `;

            }
        ).join("");

}


/* =====================================================
   ACTIVITY
===================================================== */

function renderActivity() {

    const container =
        document.getElementById(
            "activityTimeline"
        );


    if (!container) return;


    if (
        activityLog.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty-state">
                No activity recorded yet.
            </div>
            `;

        return;

    }


    container.innerHTML =
        activityLog
            .slice(0, 50)
            .map(
                activity =>
                    `
                    <div
                        class="activity-item"
                    >

                        <strong>
                            ${escapeHTML(
                                activity.action
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                activity.taskId
                            )}
                        </span>

                        <p>
                            ${escapeHTML(
                                activity.notes || ""
                            )}
                        </p>

                        <small>
                            ${escapeHTML(
                                activity.changedBy || ""
                            )}
                            ·
                            ${escapeHTML(
                                activity.timestamp || ""
                            )}
                        </small>

                    </div>
                    `
            )
            .join("");

}


/* =====================================================
   DEPARTMENT DROPDOWNS
===================================================== */

function initializeDepartmentDropdowns() {

    const filters = [

        document.getElementById(
            "departmentFilter"
        ),

        document.getElementById(
            "taskDepartment"
        )

    ];


    filters.forEach(
        function (select) {

            if (!select) return;


            DEPARTMENTS.forEach(
                function (department) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        department;


                    option.textContent =
                        department;


                    select.appendChild(
                        option
                    );

                }
            );

        }
    );

}


/* =====================================================
   BUTTONS
===================================================== */

function initializeButtons() {

    const addButtons = [

        "topAddTask",

        "dashboardAddTask",

        "tasksAddButton",

        "departmentAddTaskButton"

    ];


    addButtons.forEach(
        function (id) {

            const button =
                document.getElementById(
                    id
                );


            if (!button) return;


            button.addEventListener(
                "click",
                function () {

                    openTaskModal();

                }
            );

        }
    );


    const closeButton =
        document.getElementById(
            "closeTaskModal"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeTaskModal
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelTaskButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeTaskModal
        );

    }


    const taskForm =
        document.getElementById(
            "taskForm"
        );


    if (taskForm) {

        taskForm.addEventListener(
            "submit",
            saveTask
        );

    }

}


/* =====================================================
   OPEN TASK MODAL
===================================================== */

function openTaskModal(
    task = null
) {

    const modal =
        document.getElementById(
            "taskModal"
        );


    if (!modal) return;


    modal.style.display =
        "flex";


    document.getElementById(
        "taskModalTitle"
    ).textContent =
        task
            ? "Edit Task"
            : "Add New Task";


    document.getElementById(
        "editTaskId"
    ).value =
        task
            ? task.taskId
            : "";


    document.getElementById(
        "taskName"
    ).value =
        task?.task || "";


    document.getElementById(
        "taskDepartment"
    ).value =
        task?.department ||
        currentDepartment ||
        "";


    document.getElementById(
        "taskAssignedTo"
    ).value =
        task?.assignedTo || "";


    document.getElementById(
        "taskPriority"
    ).value =
        task?.priority ||
        "Medium";


    document.getElementById(
        "taskStatus"
    ).value =
        task?.status ||
        "Open";


    document.getElementById(
        "taskCreatedDate"
    ).value =
        task?.createdDate ||
        todayString();


    document.getElementById(
        "taskDueDate"
    ).value =
        task?.dueDate || "";


    document.getElementById(
        "taskFollowupDate"
    ).value =
        task?.followupDate || "";


    document.getElementById(
        "taskFollowupAction"
    ).value =
        task?.lastAction || "";


    document.getElementById(
        "taskRemarks"
    ).value =
        task?.remarks || "";

}


/* =====================================================
   CLOSE TASK MODAL
===================================================== */

function closeTaskModal() {

    const modal =
        document.getElementById(
            "taskModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =====================================================
   EDIT TASK
===================================================== */

function editTask(
    taskId
) {

    const task =
        tasks.find(
            function (item) {

                return String(
                    item.taskId
                ) === String(
                    taskId
                );

            }
        );


    if (!task) {

        showNotification(
            "Error",
            "Task not found."
        );

        return;

    }


    openTaskModal(
        task
    );

}


/* =====================================================
   SAVE TASK
===================================================== */

async function saveTask(
    event
) {

    event.preventDefault();


    const taskId =
        document.getElementById(
            "editTaskId"
        ).value;


    const taskData = {

        action:
            taskId
                ? "updateTask"
                : "addTask",

        taskId:
            taskId || undefined,

        task:
            document.getElementById(
                "taskName"
            ).value,

        department:
            document.getElementById(
                "taskDepartment"
            ).value,

        assignedTo:
            document.getElementById(
                "taskAssignedTo"
            ).value,

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
            ).value,

        dueDate:
            document.getElementById(
                "taskDueDate"
            ).value,

        followupDate:
            document.getElementById(
                "taskFollowupDate"
            ).value,

        lastAction:
            document.getElementById(
                "taskFollowupAction"
            ).value,

        remarks:
            document.getElementById(
                "taskRemarks"
            ).value,

        updatedBy:
            "Website"

    };


    try {

        showNotification(
            "Saving",
            "Updating Google Sheets..."
        );


        const response =
            await fetch(
                API_URL,
                {

                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(
                            taskData
                        )

                }
            );


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to save task"
            );

        }


        closeTaskModal();


        showNotification(
            "Saved",
            "Task saved successfully."
        );


        /*
         * Reload from Google Sheets.
         */

        await loadAllData();


    } catch (error) {

        console.error(
            error
        );


        showNotification(
            "Error",
            error.message ||
            "Could not save task."
        );

    }

}


/* =====================================================
   DATE HELPERS
===================================================== */

function todayString() {

    const date =
        new Date();


    return date
        .toISOString()
        .split("T")[0];

}


function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    return String(
        value
    );

}


function parseDate(
    value
) {

    if (!value) return null;


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


function isTaskOverdue(
    task
) {

    if (
        task.status ===
        "Completed"
    ) {

        return false;

    }


    const due =
        parseDate(
            task.dueDate
        );


    if (!due) return false;


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    due.setHours(
        0,
        0,
        0,
        0
    );


    return due < today;

}


function isFollowupToday(
    task
) {

    const date =
        parseDate(
            task.followupDate
        );


    if (!date) return false;


    const today =
        new Date();


    return (
        date.toDateString() ===
        today.toDateString()
    );

}


function isFollowupOverdue(
    task
) {

    const date =
        parseDate(
            task.followupDate
        );


    if (!date) return false;


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    date.setHours(
        0,
        0,
        0,
        0
    );


    return date < today;

}


function isUpcomingFollowup(
    task
) {

    const date =
        parseDate(
            task.followupDate
        );


    if (!date) return false;


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    date.setHours(
        0,
        0,
        0,
        0
    );


    return date > today;

}


/* =====================================================
   BADGES
===================================================== */

function priorityBadge(
    priority
) {

    return `
        <span class="badge priority-${String(
            priority || ""
        )
            .toLowerCase()}">
            ${escapeHTML(
                priority || "-"
            )}
        </span>
    `;

}


function statusBadge(
    status
) {

    return `
        <span class="badge status-${String(
            status || ""
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            )}">
            ${escapeHTML(
                status || "-"
            )}
        </span>
    `;

}


/* =====================================================
   UTILITY
===================================================== */

function normalize(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


function emptyRow(
    columns,
    message
) {

    return `
        <tr>
            <td
                colspan="${columns}"
                class="empty-table"
            >
                ${escapeHTML(message)}
            </td>
        </tr>
    `;

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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


function escapeAttribute(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );

}


/* =====================================================
   NOTIFICATION
===================================================== */

function showNotification(
    title,
    message
) {

    const notification =
        document.getElementById(
            "notification"
        );


    if (!notification) return;


    setText(
        "notificationTitle",
        title
    );


    setText(
        "notificationMessage",
        message
    );


    notification.classList.add(
        "show"
    );


    setTimeout(
        function () {

            notification.classList.remove(
                "show"
            );

        },
        3500
    );

}


/* =====================================================
   DATA SOURCE
===================================================== */

function updateDataSourceStatus(
    status
) {

    setText(
        "dataSourceStatus",
        status
    );

}


/* =====================================================
   CURRENT DATE
===================================================== */

function updateCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) return;


    element.textContent =
        new Date()
            .toLocaleDateString(
                "en-IN",
                {
                    weekday:
                        "short",

                    day:
                        "2-digit",

                    month:
                        "short",

                    year:
                        "numeric"
                }
            );

}
```
