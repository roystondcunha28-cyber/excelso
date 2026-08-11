/* =========================================================
   USEDBOOKR OPERATIONS MANAGEMENT SYSTEM
   STEP 3 - GOOGLE SHEETS API CONNECTION
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyrOAQZ--7aDiAHv0ey60C8-xXuTKDAhOVDQjUOc-uiGdgNnpuJ97nL4m-ABkw0Znf3ig/exec";


/*
   Temporary frontend password.

   IMPORTANT:
   This is only frontend protection.
   Later we will replace this with proper user authentication.
*/

const ADMIN_PASSWORD = "admin123";


/* =========================================================
   DEPARTMENTS
========================================================= */

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


/* =========================================================
   APPLICATION STATE
========================================================= */

let tasks = [];

let currentDepartment = "";

let editingTaskId = null;

let apiOnline = false;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeApplication();

    }
);


function initializeApplication() {

    setupLogin();

    setupNavigation();

    setupButtons();

    setupFilters();

    setupTaskModal();

    setupLogout();

    populateDepartmentSelectors();

    updateCurrentDate();

    checkExistingLogin();

}


/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {

    const loginForm =
        document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const password =
                document.getElementById("loginPassword").value.trim();


            if (password === ADMIN_PASSWORD) {

                sessionStorage.setItem(
                    "usedbookr_logged_in",
                    "true"
                );

                showApplication();

            } else {

                showLoginError();

            }

        }
    );

}


function checkExistingLogin() {

    const loggedIn =
        sessionStorage.getItem(
            "usedbookr_logged_in"
        );


    if (loggedIn === "true") {

        showApplication();

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


    loadTasks();

}


function showLoginError() {

    const error =
        document.getElementById("loginError");


    if (error) {

        error.style.display = "block";

    }

}


function setupLogout() {

    const button =
        document.getElementById("logoutButton");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "usedbookr_logged_in"
            );

            location.reload();

        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    const department =
                        item.dataset.department;


                    const page =
                        item.dataset.page;


                    if (department) {

                        openDepartment(
                            department
                        );

                    } else if (page) {

                        openPage(page);

                    }

                }
            );

        }
    );

}


function openPage(pageName) {

    const pages =
        document.querySelectorAll(".page");


    pages.forEach(
        function (page) {

            page.classList.remove(
                "active-page"
            );

        }
    );


    const target =
        document.getElementById(
            pageName + "Page"
        );


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(
        function (item) {

            item.classList.remove(
                "active"
            );

        }
    );


    const matchingNav =
        document.querySelector(
            '.nav-item[data-page="' +
            pageName +
            '"]'
        );


    if (matchingNav) {

        matchingNav.classList.add(
            "active"
        );

    }


    updatePageHeader(
        pageName
    );


    if (pageName === "dashboard") {

        renderDashboard();

    }


    if (pageName === "tasks") {

        renderTasks();

    }


    if (pageName === "followups") {

        renderFollowups();

    }


    if (pageName === "reports") {

        renderReports();

    }


    if (pageName === "activity") {

        renderActivity();

    }


    if (pageName === "settings") {

        updateDataSourceStatus();

    }

}


function updatePageHeader(pageName) {

    const title =
        document.getElementById(
            "pageTitle"
        );

    const subtitle =
        document.getElementById(
            "pageSubtitle"
        );


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
            "Monitor commitments and pending actions"
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
            "System configuration"
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
   DEPARTMENT NAVIGATION
========================================================= */

function openDepartment(department) {

    currentDepartment =
        department;


    const pages =
        document.querySelectorAll(".page");


    pages.forEach(
        function (page) {

            page.classList.remove(
                "active-page"
            );

        }
    );


    const page =
        document.getElementById(
            "departmentDetailPage"
        );


    if (page) {

        page.classList.add(
            "active-page"
        );

    }


    const title =
        document.getElementById(
            "pageTitle"
        );


    const subtitle =
        document.getElementById(
            "pageSubtitle"
        );


    title.textContent =
        department;


    subtitle.textContent =
        "Department operational monitoring";


    renderDepartmentDetail();

}


/* =========================================================
   BUTTONS
========================================================= */

function setupButtons() {

    const buttons = [

        "topAddTask",
        "dashboardAddTask",
        "tasksAddButton",
        "departmentAddTaskButton"

    ];


    buttons.forEach(
        function (id) {

            const button =
                document.getElementById(id);


            if (!button) {
                return;
            }


            button.addEventListener(
                "click",
                function () {

                    openTaskModal();

                }
            );

        }
    );


    const menuToggle =
        document.getElementById(
            "menuToggle"
        );


    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            function () {

                document.body.classList.toggle(
                    "sidebar-open"
                );

            }
        );

    }


    const exportTasks =
        document.getElementById(
            "exportTasksButton"
        );


    if (exportTasks) {

        exportTasks.addEventListener(
            "click",
            exportTasksCSV
        );

    }


    const exportAll =
        document.getElementById(
            "exportAllButton"
        );


    if (exportAll) {

        exportAll.addEventListener(
            "click",
            exportTasksCSV
        );

    }


    const exportExcel =
        document.getElementById(
            "exportExcelButton"
        );


    if (exportExcel) {

        exportExcel.addEventListener(
            "click",
            exportTasksCSV
        );

    }

}


/* =========================================================
   DEPARTMENT SELECTORS
========================================================= */

function populateDepartmentSelectors() {

    const selectors = [

        document.getElementById(
            "taskDepartment"
        ),

        document.getElementById(
            "departmentFilter"
        )

    ];


    selectors.forEach(
        function (select) {

            if (!select) {
                return;
            }


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


    const departmentsGrid =
        document.getElementById(
            "departmentsGrid"
        );


    if (departmentsGrid) {

        departmentsGrid.innerHTML = "";


        DEPARTMENTS.forEach(
            function (department) {

                const card =
                    document.createElement(
                        "button"
                    );


                card.type =
                    "button";

                card.className =
                    "department-card";


                card.innerHTML = `

                    <strong>
                        ${escapeHTML(department)}
                    </strong>

                    <span>
                        View department
                    </span>

                `;


                card.addEventListener(
                    "click",
                    function () {

                        openDepartment(
                            department
                        );

                    }
                );


                departmentsGrid.appendChild(
                    card
                );

            }
        );

    }

}


/* =========================================================
   API CONNECTION
========================================================= */

async function loadTasks() {

    setDataSourceStatus(
        "Connecting..."
    );


    try {

        const response =
            await fetch(
                API_URL + "?action=getTasks",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "API RESPONSE:",
            data
        );


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data.message ||
                "API returned an error"
            );

        }


        tasks =
            Array.isArray(data.tasks)
                ? data.tasks
                : [];


        apiOnline = true;


        setDataSourceStatus(
            "Google Sheets Connected"
        );


        renderEverything();


    } catch (error) {

        console.error(
            "Failed to load tasks:",
            error
        );


        apiOnline = false;


        tasks = [];


        setDataSourceStatus(
            "Connection Error"
        );


        showNotification(
            "Connection Error",
            "Could not load tasks from Google Sheets."
        );


        renderEverything();

    }

}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderEverything() {

    renderDashboard();

    renderTasks();

    renderFollowups();

    renderDepartmentDetail();

    renderReports();

    renderActivity();

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

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
        countOverdue();


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


    const followups =
        getFollowupCounts();


    setText(
        "followupsToday",
        followups.today
    );


    setText(
        "followupsOverdue",
        followups.overdue
    );


    setText(
        "followupsUpcoming",
        followups.upcoming
    );


    renderDepartmentPerformance();

    renderRecentTasks();

}


/* =========================================================
   RECENT TASKS
========================================================= */

function renderRecentTasks() {

    const tbody =
        document.getElementById(
            "recentTasksTable"
        );


    if (!tbody) {
        return;
    }


    if (!tasks.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-table"
                >
                    No tasks available.
                </td>

            </tr>

        `;

        return;

    }


    const recent =
        tasks.slice(
            0,
            10
        );


    tbody.innerHTML =
        recent.map(
            taskRowDashboard
        ).join("");

}


function taskRowDashboard(task) {

    return `

        <tr>

            <td>
                ${escapeHTML(task.taskId)}
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
                ${statusBadge(task.priority)}
            </td>

            <td>
                ${statusBadge(task.status)}
            </td>

            <td>
                ${escapeHTML(formatDate(task.dueDate))}
            </td>

        </tr>

    `;

}


/* =========================================================
   ALL TASKS
========================================================= */

function renderTasks() {

    const tbody =
        document.getElementById(
            "allTasksTable"
        );


    if (!tbody) {
        return;
    }


    const filtered =
        getFilteredTasks();


    if (!filtered.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-table"
                >
                    No tasks found.
                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        filtered.map(
            taskRowAllTasks
        ).join("");

}


function taskRowAllTasks(task) {

    return `

        <tr>

            <td>
                ${escapeHTML(task.taskId)}
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
                ${statusBadge(task.priority)}
            </td>

            <td>
                ${statusBadge(task.status)}
            </td>

            <td>
                ${escapeHTML(formatDate(task.dueDate))}
            </td>

            <td>

                <button
                    class="table-action-button"
                    type="button"
                    onclick="editTask('${escapeAttribute(task.taskId)}')"
                >
                    Edit
                </button>

            </td>

        </tr>

    `;

}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    const ids = [

        "taskSearch",
        "departmentFilter",
        "priorityFilter",
        "statusFilter"

    ];


    ids.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {
                return;
            }


            element.addEventListener(
                "input",
                renderTasks
            );


            element.addEventListener(
                "change",
                renderTasks
            );

        }
    );

}


function getFilteredTasks() {

    const search =
        getValue(
            "taskSearch"
        ).toLowerCase();


    const department =
        getValue(
            "departmentFilter"
        );


    const priority =
        getValue(
            "priorityFilter"
        );


    const status =
        getValue(
            "statusFilter"
        );


    return tasks.filter(
        function (task) {

            const searchable = [

                task.taskId,
                task.task,
                task.description,
                task.department,
                task.assignedTo,
                task.remarks

            ]
            .join(" ")
            .toLowerCase();


            if (
                search &&
                !searchable.includes(
                    search
                )
            ) {

                return false;

            }


            if (
                department &&
                task.department !== department
            ) {

                return false;

            }


            if (
                priority &&
                task.priority !== priority
            ) {

                return false;

            }


            if (
                status &&
                task.status !== status
            ) {

                return false;

            }


            return true;

        }
    );

}


/* =========================================================
   FOLLOW UPS
========================================================= */

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


    const tbody =
        document.getElementById(
            "followupsTable"
        );


    if (!tbody) {
        return;
    }


    const followups =
        tasks.filter(
            function (task) {

                return Boolean(
                    task.followupDate
                );

            }
        );


    if (!followups.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-table"
                >
                    No follow-ups available.
                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        followups.map(
            function (task) {

                return `

                    <tr>

                        <td>
                            ${escapeHTML(task.taskId)}
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
                            ${escapeHTML(
                                formatDate(
                                    task.followupDate
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                task.lastAction ||
                                ""
                            )}
                        </td>

                        <td>
                            ${statusBadge(task.status)}
                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =========================================================
   DEPARTMENT PERFORMANCE
========================================================= */

function renderDepartmentPerformance() {

    const container =
        document.getElementById(
            "departmentPerformance"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        DEPARTMENTS.map(
            function (department) {

                const departmentTasks =
                    tasks.filter(
                        function (task) {

                            return (
                                task.department ===
                                department
                            );

                        }
                    );


                const total =
                    departmentTasks.length;


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
                    total
                        ? Math.round(
                            completed /
                            total *
                            100
                        )
                        : 0;


                return `

                    <div class="department-performance-row">

                        <div>

                            <strong>
                                ${escapeHTML(department)}
                            </strong>

                            <span>
                                ${total} task${total === 1 ? "" : "s"}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${percentage}%
                            </strong>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   DEPARTMENT DETAIL
========================================================= */

function renderDepartmentDetail() {

    if (!currentDepartment) {
        return;
    }


    const departmentTasks =
        tasks.filter(
            function (task) {

                return (
                    task.department ===
                    currentDepartment
                );

            }
        );


    setText(
        "departmentDetailTitle",
        currentDepartment
    );


    setText(
        "departmentDetailSubtitle",
        "Operational tasks for " +
        currentDepartment
    );


    setText(
        "departmentTotal",
        departmentTasks.length
    );


    setText(
        "departmentOpen",
        countStatusForTasks(
            departmentTasks,
            "Open"
        )
    );


    setText(
        "departmentProgress",
        countStatusForTasks(
            departmentTasks,
            "In Progress"
        )
    );


    setText(
        "departmentBlocked",
        countStatusForTasks(
            departmentTasks,
            "Blocked"
        )
    );


    setText(
        "departmentCompleted",
        countStatusForTasks(
            departmentTasks,
            "Completed"
        )
    );


    setText(
        "departmentOverdue",
        countOverdueForTasks(
            departmentTasks
        )
    );


    const tbody =
        document.getElementById(
            "departmentTasksTable"
        );


    if (!tbody) {
        return;
    }


    if (!departmentTasks.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-table"
                >
                    No department tasks available.
                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        departmentTasks.map(
            function (task) {

                return `

                    <tr>

                        <td>
                            ${escapeHTML(task.taskId)}
                        </td>

                        <td>
                            ${escapeHTML(task.task)}
                        </td>

                        <td>
                            ${escapeHTML(task.assignedTo)}
                        </td>

                        <td>
                            ${statusBadge(task.priority)}
                        </td>

                        <td>
                            ${statusBadge(task.status)}
                        </td>

                        <td>
                            ${escapeHTML(
                                formatDate(task.dueDate)
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                formatDate(task.followupDate)
                            )}
                        </td>

                        <td>

                            <button
                                class="table-action-button"
                                type="button"
                                onclick="editTask('${escapeAttribute(task.taskId)}')"
                            >
                                Edit
                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =========================================================
   TASK MODAL
========================================================= */

function setupTaskModal() {

    const close =
        document.getElementById(
            "closeTaskModal"
        );


    const cancel =
        document.getElementById(
            "cancelTaskButton"
        );


    const form =
        document.getElementById(
            "taskForm"
        );


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


    if (form) {

        form.addEventListener(
            "submit",
            saveTask
        );

    }

}


function openTaskModal(task = null) {

    const modal =
        document.getElementById(
            "taskModal"
        );


    if (!modal) {
        return;
    }


    editingTaskId =
        task
            ? task.taskId
            : null;


    setText(
        "taskModalTitle",
        task
            ? "Edit Task"
            : "Add New Task"
    );


    if (task) {

        setValue(
            "editTaskId",
            task.taskId
        );

        setValue(
            "taskName",
            task.task
        );

        setValue(
            "taskDepartment",
            task.department
        );

        setValue(
            "taskAssignedTo",
            task.assignedTo
        );

        setValue(
            "taskPriority",
            task.priority || "Medium"
        );

        setValue(
            "taskStatus",
            task.status || "Open"
        );

        setValue(
            "taskCreatedDate",
            normalizeDateInput(
                task.createdDate
            )
        );

        setValue(
            "taskDueDate",
            normalizeDateInput(
                task.dueDate
            )
        );

        setValue(
            "taskFollowupDate",
            normalizeDateInput(
                task.followupDate
            )
        );

        setValue(
            "taskFollowupAction",
            task.lastAction || ""
        );

        setValue(
            "taskRemarks",
            task.remarks || ""
        );

    } else {

        clearTaskForm();

        setValue(
            "taskCreatedDate",
            todayISO()
        );

    }


    modal.style.display =
        "flex";

}


function closeTaskModal() {

    const modal =
        document.getElementById(
            "taskModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    editingTaskId =
        null;

}


function clearTaskForm() {

    const form =
        document.getElementById(
            "taskForm"
        );


    if (form) {

        form.reset();

    }


    setValue(
        "editTaskId",
        ""
    );

}


function editTask(taskId) {

    const task =
        tasks.find(
            function (item) {

                return (
                    String(item.taskId) ===
                    String(taskId)
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


/* =========================================================
   SAVE TASK
========================================================= */

async function saveTask(event) {

    event.preventDefault();


    const taskData = {

        taskId:
            getValue("editTaskId"),

        task:
            getValue("taskName"),

        department:
            getValue("taskDepartment"),

        assignedTo:
            getValue("taskAssignedTo"),

        priority:
            getValue("taskPriority"),

        status:
            getValue("taskStatus"),

        createdDate:
            getValue("taskCreatedDate"),

        dueDate:
            getValue("taskDueDate"),

        followupDate:
            getValue("taskFollowupDate"),

        lastAction:
            getValue("taskFollowupAction"),

        remarks:
            getValue("taskRemarks"),

        updatedBy:
            "Operations Head"

    };


    if (!taskData.task) {

        showNotification(
            "Error",
            "Please enter a task."
        );

        return;

    }


    if (!taskData.department) {

        showNotification(
            "Error",
            "Please select a department."
        );

        return;

    }


    try {

        showNotification(
            "Saving",
            "Saving task to Google Sheets..."
        );


        const action =
            taskData.taskId
                ? "updateTask"
                : "createTask";


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({
                            action: action,
                            ...taskData
                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "SAVE RESPONSE:",
            data
        );


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data.message ||
                "Unable to save task"
            );

        }


        closeTaskModal();


        showNotification(
            "Success",
            "Task saved successfully."
        );


        await loadTasks();


    } catch (error) {

        console.error(
            "Save error:",
            error
        );


        showNotification(
            "Error",
            error.message
        );

    }

}


/* =========================================================
   REPORTS
========================================================= */

function renderReports() {

    const tbody =
        document.getElementById(
            "analysisTable"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML =
        DEPARTMENTS.map(
            function (department) {

                const departmentTasks =
                    tasks.filter(
                        function (task) {

                            return (
                                task.department ===
                                department
                            );

                        }
                    );


                const total =
                    departmentTasks.length;


                const open =
                    countStatusForTasks(
                        departmentTasks,
                        "Open"
                    );


                const progress =
                    countStatusForTasks(
                        departmentTasks,
                        "In Progress"
                    );


                const blocked =
                    countStatusForTasks(
                        departmentTasks,
                        "Blocked"
                    );


                const completed =
                    countStatusForTasks(
                        departmentTasks,
                        "Completed"
                    );


                const overdue =
                    countOverdueForTasks(
                        departmentTasks
                    );


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
                            ${escapeHTML(department)}
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

            }
        ).join("");

}


/* =========================================================
   ACTIVITY
========================================================= */

function renderActivity() {

    const container =
        document.getElementById(
            "activityTimeline"
        );


    if (!container) {
        return;
    }


    if (!tasks.length) {

        container.innerHTML = `

            <div class="empty-state">
                No activity recorded yet.
            </div>

        `;

        return;

    }


    container.innerHTML =
        tasks.slice(
            0,
            20
        ).map(
            function (task) {

                return `

                    <div class="activity-item">

                        <strong>
                            ${escapeHTML(task.taskId)}
                        </strong>

                        <span>
                            ${escapeHTML(task.task)}
                        </span>

                        <small>
                            ${escapeHTML(
                                task.updatedBy || ""
                            )}
                            -
                            ${escapeHTML(
                                formatDate(
                                    task.updatedDate
                                )
                            )}
                        </small>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   COUNTERS
========================================================= */

function countStatus(status) {

    return tasks.filter(
        function (task) {

            return (
                task.status ===
                status
            );

        }
    ).length;

}


function countStatusForTasks(
    taskList,
    status
) {

    return taskList.filter(
        function (task) {

            return (
                task.status ===
                status
            );

        }
    ).length;

}


function countPriority(priority) {

    return tasks.filter(
        function (task) {

            return (
                task.priority ===
                priority
            );

        }
    ).length;

}


function countOverdue() {

    return countOverdueForTasks(
        tasks
    );

}


function countOverdueForTasks(
    taskList
) {

    const today =
        todayISO();


    return taskList.filter(
        function (task) {

            if (
                task.status ===
                "Completed"
            ) {

                return false;

            }


            if (!task.dueDate) {

                return false;

            }


            return (
                normalizeDateInput(
                    task.dueDate
                ) < today
            );

        }
    ).length;

}


/* =========================================================
   FOLLOW-UP COUNTS
========================================================= */

function getFollowupCounts() {

    const today =
        todayISO();


    let todayCount = 0;

    let overdueCount = 0;

    let upcomingCount = 0;


    tasks.forEach(
        function (task) {

            if (!task.followupDate) {
                return;
            }


            const date =
                normalizeDateInput(
                    task.followupDate
                );


            if (date === today) {

                todayCount++;

            } else if (
                date < today &&
                task.status !== "Completed"
            ) {

                overdueCount++;

            } else if (
                date > today
            ) {

                upcomingCount++;

            }

        }
    );


    return {

        today:
            todayCount,

        overdue:
            overdueCount,

        upcoming:
            upcomingCount

    };

}


/* =========================================================
   DATA SOURCE STATUS
========================================================= */

function setDataSourceStatus(
    message
) {

    setText(
        "dataSourceStatus",
        message
    );

}


function updateDataSourceStatus() {

    setDataSourceStatus(
        apiOnline
            ? "Google Sheets Connected"
            : "Not Connected"
    );

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportTasksCSV() {

    if (!tasks.length) {

        showNotification(
            "Export",
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
        "Last Action",
        "Remarks",
        "Updated By",
        "Updated Date"

    ];


    const rows =
        tasks.map(
            function (task) {

                return [

                    task.taskId,
                    task.task,
                    task.department,
                    task.assignedTo,
                    task.priority,
                    task.status,
                    task.createdDate,
                    task.dueDate,
                    task.followupDate,
                    task.lastAction,
                    task.remarks,
                    task.updatedBy,
                    task.updatedDate

                ];

            }
        );


    const csv = [

        headers,
        ...rows

    ]
    .map(
        function (row) {

            return row.map(
                function (value) {

                    return '"' +
                        String(
                            value ?? ""
                        )
                        .replace(
                            /"/g,
                            '""'
                        ) +
                        '"';

                }
            ).join(",");

        }
    ).join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "UsedBookR_Operations_Tasks.csv";


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
   DATE
========================================================= */

function updateCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) {
        return;
    }


    element.textContent =
        new Date().toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


function todayISO() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


function normalizeDateInput(
    value
) {

    if (!value) {
        return "";
    }


    const string =
        String(value);


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            string
        )
    ) {

        return string;

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return (

        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")

    );

}


function formatDate(
    value
) {

    const normalized =
        normalizeDateInput(
            value
        );


    if (!normalized) {
        return "";
    }


    const parts =
        normalized.split("-");


    if (parts.length !== 3) {
        return normalized;
    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );

}


/* =========================================================
   HELPERS
========================================================= */

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


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value ?? "";

    }

}


function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? element.value.trim()
        : "";

}


function statusBadge(
    value
) {

    if (!value) {
        return "";
    }


    const safe =
        escapeHTML(
            value
        );


    return `
        <span class="status-badge">
            ${safe}
        </span>
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


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(
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


    if (!notification) {
        return;
    }


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (messageElement) {

        messageElement.textContent =
            message;

    }


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


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.editTask =
    editTask;

window.openDepartment =
    openDepartment;

window.openPage =
    openPage;
