```javascript
/* =========================================================
   USEDBOOKR OPERATIONS MANAGEMENT SYSTEM
   Google Sheets Backend
========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyrOAQZ--7aDiAHv0ey60C8-xXuTKDAhOVDQjUOc-uiGdgNnpuJ97nL4m-ABkw0Znf3ig/exec";

const LOGIN_PASSWORD = "admin123";


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

let tasks = [];
let currentDepartment = "";
let currentPage = "dashboard";


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeDepartments();

    initializeDate();

    initializeNavigation();

    initializeTaskButtons();

    initializeFilters();

    initializeTaskForm();

    initializeLogout();

    initializeLogin();

    checkLogin();

});


/* =========================================================
   LOGIN
========================================================= */

function initializeLogin() {

    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const password =
            document.getElementById("loginPassword").value;

        const error =
            document.getElementById("loginError");

        if (password === LOGIN_PASSWORD) {

            localStorage.setItem(
                "usedbookrOperationsLogin",
                "true"
            );

            document.getElementById("loginScreen").style.display =
                "none";

            document.getElementById("app").style.display =
                "flex";

            if (error) {
                error.classList.remove("show");
            }

            loadTasks();

        } else {

            if (error) {
                error.classList.add("show");
            }

        }

    });

}


function checkLogin() {

    const loggedIn =
        localStorage.getItem(
            "usedbookrOperationsLogin"
        );

    if (loggedIn === "true") {

        document.getElementById("loginScreen").style.display =
            "none";

        document.getElementById("app").style.display =
            "flex";

        loadTasks();

    } else {

        document.getElementById("loginScreen").style.display =
            "flex";

        document.getElementById("app").style.display =
            "none";

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function initializeLogout() {

    const button =
        document.getElementById("logoutButton");

    if (!button) return;

    button.addEventListener("click", function () {

        localStorage.removeItem(
            "usedbookrOperationsLogin"
        );

        location.reload();

    });

}


/* =========================================================
   DEPARTMENTS
========================================================= */

function initializeDepartments() {

    const departmentSelect =
        document.getElementById("taskDepartment");

    const departmentFilter =
        document.getElementById("departmentFilter");

    if (departmentSelect) {

        departmentSelect.innerHTML =
            '<option value="">Select Department</option>';

        DEPARTMENTS.forEach(function (department) {

            const option =
                document.createElement("option");

            option.value = department;
            option.textContent = department;

            departmentSelect.appendChild(option);

        });

    }


    if (departmentFilter) {

        departmentFilter.innerHTML =
            '<option value="">All Departments</option>';

        DEPARTMENTS.forEach(function (department) {

            const option =
                document.createElement("option");

            option.value = department;
            option.textContent = department;

            departmentFilter.appendChild(option);

        });

    }


    renderDepartmentCards();

}


/* =========================================================
   DATE
========================================================= */

function initializeDate() {

    const dateElement =
        document.getElementById("currentDate");

    if (!dateElement) return;

    const today = new Date();

    dateElement.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    const navigationItems =
        document.querySelectorAll(".nav-item");

    navigationItems.forEach(function (item) {

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


    const menuToggle =
        document.getElementById("menuToggle");

    if (menuToggle) {

        menuToggle.addEventListener("click", function () {

            document
                .querySelector(".sidebar")
                ?.classList.toggle("sidebar-open");

        });

    }

}


function showPage(page) {

    currentPage = page;

    document
        .querySelectorAll(".page")
        .forEach(function (section) {

            section.classList.remove("active-page");

        });


    const target =
        document.getElementById(
            page + "Page"
        );

    if (target) {

        target.classList.add("active-page");

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(function (item) {

            item.classList.remove("active");

            if (item.dataset.page === page) {

                item.classList.add("active");

            }

        });


    updatePageHeader(page);


    if (page === "dashboard") {

        updateDashboard();

    }

    if (page === "tasks") {

        renderTasksTable();

    }

    if (page === "followups") {

        renderFollowups();

    }

    if (page === "reports") {

        renderAnalysis();

    }

    if (page === "activity") {

        renderActivity();

    }

}


function updatePageHeader(page) {

    const title =
        document.getElementById("pageTitle");

    const subtitle =
        document.getElementById("pageSubtitle");


    const pageNames = {

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


    if (pageNames[page]) {

        title.textContent =
            pageNames[page][0];

        subtitle.textContent =
            pageNames[page][1];

    }

}


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(action, data = {}) {

    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({

                    action: action,

                    ...data

                })

            });


        const result =
            await response.json();

        return result;

    }

    catch (error) {

        console.error(
            "API Error:",
            error
        );

        showNotification(
            "Connection Error",
            "Unable to connect to Google Sheets."
        );

        return {
            success: false,
            message: error.message
        };

    }

}


/* =========================================================
   LOAD TASKS
========================================================= */

async function loadTasks() {

    showNotification(
        "Loading",
        "Loading operations data..."
    );


    const result =
        await apiRequest(
            "getTasks"
        );


    if (!result.success) {

        showNotification(
            "Error",
            result.message ||
            "Unable to load tasks."
        );

        return;

    }


    tasks =
        normalizeTasks(
            result.tasks || []
        );


    updateAllViews();


    const source =
        document.getElementById(
            "dataSourceStatus"
        );

    if (source) {

        source.textContent =
            "Google Sheets";

    }


    showNotification(
        "Updated",
        tasks.length +
        " task(s) loaded from Google Sheets."
    );

}


/* =========================================================
   NORMALIZE TASK DATA
========================================================= */

function normalizeTasks(data) {

    return data.map(function (task) {

        return {

            taskId:
                task["Task ID"] || "",

            department:
                task["Department"] || "",

            task:
                task["Task"] || "",

            description:
                task["Description"] || "",

            assignedTo:
                task["Assigned To"] || "",

            priority:
                task["Priority"] || "Medium",

            status:
                task["Status"] || "Open",

            createdDate:
                formatDateForInput(
                    task["Created Date"]
                ),

            dueDate:
                formatDateForInput(
                    task["Due Date"]
                ),

            followupDate:
                formatDateForInput(
                    task["Follow-up Date"]
                ),

            lastAction:
                task["Last Action / Follow-up"] || "",

            remarks:
                task["Remarks"] || "",

            updatedBy:
                task["Updated By"] || "",

            updatedDate:
                task["Updated Date"] || ""

        };

    });

}


/* =========================================================
   UPDATE EVERYTHING
========================================================= */

function updateAllViews() {

    updateDashboard();

    renderTasksTable();

    renderFollowups();

    renderAnalysis();

    renderActivity();

    renderDepartmentCards();

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        tasks.length;

    const open =
        tasks.filter(
            t => t.status === "Open"
        ).length;

    const progress =
        tasks.filter(
            t => t.status === "In Progress"
        ).length;

    const blocked =
        tasks.filter(
            t => t.status === "Blocked"
        ).length;

    const completed =
        tasks.filter(
            t => t.status === "Completed"
        ).length;

    const overdue =
        tasks.filter(
            isOverdue
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


    setText(
        "highPriorityCount",
        tasks.filter(
            t => t.priority === "High"
        ).length
    );

    setText(
        "mediumPriorityCount",
        tasks.filter(
            t => t.priority === "Medium"
        ).length
    );

    setText(
        "lowPriorityCount",
        tasks.filter(
            t => t.priority === "Low"
        ).length
    );


    updateFollowupSummary();

    renderDepartmentPerformance();

    renderRecentTasks();

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

    container.innerHTML = "";

    DEPARTMENTS.forEach(function (department) {

        const departmentTasks =
            tasks.filter(
                t => t.department === department
            );

        const total =
            departmentTasks.length;

        const completed =
            departmentTasks.filter(
                t => t.status === "Completed"
            ).length;

        const percentage =
            total === 0
                ? 0
                : Math.round(
                    completed / total * 100
                );


        const row =
            document.createElement("div");

        row.className =
            "department-performance-row";

        row.innerHTML = `

            <div class="department-performance-name">
                <strong>${escapeHTML(department)}</strong>
                <span>${total} task(s)</span>
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

        `;

        container.appendChild(row);

    });

}


/* =========================================================
   RECENT TASKS
========================================================= */

function renderRecentTasks() {

    const tbody =
        document.getElementById(
            "recentTasksTable"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    const recent =
        [...tasks]
            .sort(
                (a,b) =>
                    String(b.updatedDate)
                    .localeCompare(
                        String(a.updatedDate)
                    )
            )
            .slice(0, 10);


    if (!recent.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    No tasks available.
                </td>
            </tr>
        `;

        return;

    }


    recent.forEach(function (task) {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>${escapeHTML(task.taskId)}</td>

            <td>${escapeHTML(task.task)}</td>

            <td>${escapeHTML(task.department)}</td>

            <td>${escapeHTML(task.assignedTo)}</td>

            <td>
                ${priorityBadge(task.priority)}
            </td>

            <td>
                ${statusBadge(task.status, task)}
            </td>

            <td>
                ${displayDate(task.dueDate)}
            </td>

        `;

        tbody.appendChild(row);

    });

}


/* =========================================================
   ALL TASKS TABLE
========================================================= */

function renderTasksTable() {

    const tbody =
        document.getElementById(
            "allTasksTable"
        );

    if (!tbody) return;


    const search =
        document.getElementById(
            "taskSearch"
        )?.value
        .toLowerCase() || "";


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


    let filtered =
        tasks.filter(function (task) {

            const text =
                (
                    task.task +
                    " " +
                    task.description +
                    " " +
                    task.assignedTo +
                    " " +
                    task.department
                ).toLowerCase();


            if (
                search &&
                !text.includes(search)
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


            if (status) {

                if (
                    status === "Overdue"
                ) {

                    if (!isOverdue(task)) {
                        return false;
                    }

                }

                else if (
                    task.status !== status
                ) {

                    return false;

                }

            }


            return true;

        });


    tbody.innerHTML = "";


    if (!filtered.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-table">
                    No matching tasks available.
                </td>
            </tr>
        `;

        return;

    }


    filtered.forEach(function (task) {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>${escapeHTML(task.taskId)}</td>

            <td>
                <strong>
                    ${escapeHTML(task.task)}
                </strong>
            </td>

            <td>
                ${escapeHTML(task.department)}
            </td>

            <td>
                ${escapeHTML(task.assignedTo)}
            </td>

            <td>
                ${priorityBadge(task.priority)}
            </td>

            <td>
                ${statusBadge(task.status, task)}
            </td>

            <td>
                ${displayDate(task.dueDate)}
            </td>

            <td>

                <button
                    class="table-action edit-task"
                    data-id="${escapeHTML(task.taskId)}"
                >
                    Edit
                </button>

            </td>

        `;

        tbody.appendChild(row);

    });


    tbody
        .querySelectorAll(".edit-task")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    editTask(
                        button.dataset.id
                    );

                }
            );

        });

}


/* =========================================================
   FOLLOW-UPS
========================================================= */

function updateFollowupSummary() {

    const today =
        new Date();

    today.setHours(
        0,0,0,0
    );


    const todayCount =
        tasks.filter(function (task) {

            if (!task.followupDate)
                return false;

            return sameDate(
                task.followupDate,
                today
            );

        }).length;


    const overdue =
        tasks.filter(function (task) {

            if (!task.followupDate)
                return false;

            return dateBeforeToday(
                task.followupDate
            );

        }).length;


    const upcoming =
        tasks.filter(function (task) {

            if (!task.followupDate)
                return false;

            const date =
                parseDate(
                    task.followupDate
                );

            return (
                date &&
                date > today
            );

        }).length;


    setText(
        "followupsToday",
        todayCount
    );

    setText(
        "followupsOverdue",
        overdue
    );

    setText(
        "followupsUpcoming",
        upcoming
    );

    setText(
        "followupPageToday",
        todayCount
    );

    setText(
        "followupPageOverdue",
        overdue
    );

    setText(
        "followupPageUpcoming",
        upcoming
    );

}


function renderFollowups() {

    const tbody =
        document.getElementById(
            "followupsTable"
        );

    if (!tbody) return;

    tbody.innerHTML = "";


    const followups =
        tasks
            .filter(
                t => t.followupDate
            )
            .sort(
                (a,b) =>
                    String(a.followupDate)
                    .localeCompare(
                        String(b.followupDate)
                    )
            );


    if (!followups.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    No follow-ups available.
                </td>
            </tr>
        `;

        return;

    }


    followups.forEach(function (task) {

        const row =
            document.createElement("tr");

        row.innerHTML = `

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
                ${displayDate(task.followupDate)}
            </td>

            <td>
                ${escapeHTML(task.lastAction || "-")}
            </td>

            <td>
                ${statusBadge(task.status, task)}
            </td>

        `;

        tbody.appendChild(row);

    });

}


/* =========================================================
   DEPARTMENT PAGE
========================================================= */

function openDepartment(department) {

    currentDepartment =
        department;

    showDepartmentPage(
        department
    );

}


function showDepartmentPage(department) {

    currentDepartment =
        department;


    document
        .querySelectorAll(".page")
        .forEach(function (section) {

            section.classList.remove(
                "active-page"
            );

        });


    const page =
        document.getElementById(
            "departmentDetailPage"
        );

    if (page) {

        page.classList.add(
            "active-page"
        );

    }


    setText(
        "departmentDetailCode",
        getDepartmentCode(
            department
        )
    );

    setText(
        "departmentDetailTitle",
        department
    );

    setText(
        "departmentDetailSubtitle",
        "Department operational overview."
    );


    const departmentTasks =
        tasks.filter(
            t => t.department === department
        );


    setText(
        "departmentTotal",
        departmentTasks.length
    );

    setText(
        "departmentOpen",
        departmentTasks.filter(
            t => t.status === "Open"
        ).length
    );

    setText(
        "departmentProgress",
        departmentTasks.filter(
            t => t.status === "In Progress"
        ).length
    );

    setText(
        "departmentBlocked",
        departmentTasks.filter(
            t => t.status === "Blocked"
        ).length
    );

    setText(
        "departmentCompleted",
        departmentTasks.filter(
            t => t.status === "Completed"
        ).length
    );

    setText(
        "departmentOverdue",
        departmentTasks.filter(
            isOverdue
        ).length
    );


    renderDepartmentTasks(
        departmentTasks
    );

}


function renderDepartmentTasks(
    departmentTasks
) {

    const tbody =
        document.getElementById(
            "departmentTasksTable"
        );

    if (!tbody) return;

    tbody.innerHTML = "";


    if (!departmentTasks.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-table">
                    No department tasks available.
                </td>
            </tr>
        `;

        return;

    }


    departmentTasks.forEach(function (task) {

        const row =
            document.createElement("tr");

        row.innerHTML = `

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
                ${priorityBadge(task.priority)}
            </td>

            <td>
                ${statusBadge(task.status, task)}
            </td>

            <td>
                ${displayDate(task.dueDate)}
            </td>

            <td>
                ${displayDate(task.followupDate)}
            </td>

            <td>
                <button
                    class="table-action edit-department-task"
                    data-id="${escapeHTML(task.taskId)}"
                >
                    Edit
                </button>
            </td>

        `;

        tbody.appendChild(row);

    });


    tbody
        .querySelectorAll(
            ".edit-department-task"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    editTask(
                        button.dataset.id
                    );

                }
            );

        });

}


/* =========================================================
   DEPARTMENT CARDS
========================================================= */

function renderDepartmentCards() {

    const container =
        document.getElementById(
            "departmentsGrid"
        );

    if (!container) return;

    container.innerHTML = "";


    DEPARTMENTS.forEach(function (department) {

        const departmentTasks =
            tasks.filter(
                t => t.department === department
            );

        const completed =
            departmentTasks.filter(
                t => t.status === "Completed"
            ).length;

        const blocked =
            departmentTasks.filter(
                t => t.status === "Blocked"
            ).length;

        const overdue =
            departmentTasks.filter(
                isOverdue
            ).length;


        const card =
            document.createElement("div");

        card.className =
            "department-card";


        card.innerHTML = `

            <div class="department-card-code">
                ${getDepartmentCode(department)}
            </div>

            <h3>
                ${escapeHTML(department)}
            </h3>

            <div class="department-card-stats">

                <div>
                    <strong>
                        ${departmentTasks.length}
                    </strong>
                    <span>Total</span>
                </div>

                <div>
                    <strong>
                        ${completed}
                    </strong>
                    <span>Completed</span>
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

            </div>

            <button class="secondary-button">
                View Department
            </button>

        `;


        card
            .querySelector("button")
            .addEventListener(
                "click",
                function () {

                    openDepartment(
                        department
                    );

                }
            );


        container.appendChild(card);

    });

}


/* =========================================================
   REPORTS
========================================================= */

function renderAnalysis() {

    const tbody =
        document.getElementById(
            "analysisTable"
        );

    if (!tbody) return;

    tbody.innerHTML = "";


    DEPARTMENTS.forEach(function (department) {

        const data =
            tasks.filter(
                t => t.department === department
            );


        const total =
            data.length;

        const open =
            data.filter(
                t => t.status === "Open"
            ).length;

        const progress =
            data.filter(
                t => t.status === "In Progress"
            ).length;

        const blocked =
            data.filter(
                t => t.status === "Blocked"
            ).length;

        const completed =
            data.filter(
                t => t.status === "Completed"
            ).length;

        const overdue =
            data.filter(
                isOverdue
            ).length;

        const percentage =
            total === 0
                ? 0
                : Math.round(
                    completed / total * 100
                );


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHTML(department)}
            </td>

            <td>${total}</td>

            <td>${open}</td>

            <td>${progress}</td>

            <td>${blocked}</td>

            <td>${overdue}</td>

            <td>${completed}</td>

            <td>${percentage}%</td>

        `;


        tbody.appendChild(row);

    });

}


/* =========================================================
   ACTIVITY
========================================================= */

function renderActivity() {

    const container =
        document.getElementById(
            "activityTimeline"
        );

    if (!container) return;


    if (!tasks.length) {

        container.innerHTML = `
            <div class="empty-state">
                No activity recorded yet.
            </div>
        `;

        return;

    }


    const activities =
        [...tasks]
            .sort(
                (a,b) =>
                    String(b.updatedDate)
                    .localeCompare(
                        String(a.updatedDate)
                    )
            )
            .slice(0,20);


    container.innerHTML = "";


    activities.forEach(function (task) {

        const item =
            document.createElement("div");

        item.className =
            "activity-item";


        item.innerHTML = `

            <div class="activity-dot"></div>

            <div class="activity-content">

                <strong>
                    ${escapeHTML(task.task)}
                </strong>

                <p>
                    ${escapeHTML(task.status)}
                    ·
                    ${escapeHTML(task.department)}
                </p>

                <small>
                    Updated by
                    ${escapeHTML(task.updatedBy || "System")}
                    ·
                    ${escapeHTML(displayDate(task.updatedDate))}
                </small>

            </div>

        `;


        container.appendChild(item);

    });

}


/* =========================================================
   TASK FORM
========================================================= */

function initializeTaskButtons() {

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


    const close =
        document.getElementById(
            "closeTaskModal"
        );

    const cancel =
        document.getElementById(
            "cancelTaskButton"
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

}


function initializeTaskForm() {

    const form =
        document.getElementById(
            "taskForm"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await saveTask();

        }
    );

}


function openTaskModal(task = null) {

    const modal =
        document.getElementById(
            "taskModal"
        );

    if (!modal) return;


    modal.style.display =
        "flex";


    const title =
        document.getElementById(
            "taskModalTitle"
        );


    if (task) {

        title.textContent =
            "Edit Task";

        populateTaskForm(
            task
        );

    }

    else {

        title.textContent =
            "Add New Task";

        clearTaskForm();


        if (currentDepartment) {

            document.getElementById(
                "taskDepartment"
            ).value =
                currentDepartment;

        }

    }

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

}


function clearTaskForm() {

    document.getElementById(
        "taskForm"
    ).reset();


    document.getElementById(
        "editTaskId"
    ).value = "";


    document.getElementById(
        "taskStatus"
    ).value =
        "Open";


    document.getElementById(
        "taskPriority"
    ).value =
        "Medium";

}


function populateTaskForm(task) {

    setInput(
        "editTaskId",
        task.taskId
    );

    setInput(
        "taskName",
        task.task
    );

    setInput(
        "taskDepartment",
        task.department
    );

    setInput(
        "taskAssignedTo",
        task.assignedTo
    );

    setInput(
        "taskPriority",
        task.priority
    );

    setInput(
        "taskStatus",
        task.status
    );

    setInput(
        "taskCreatedDate",
        task.createdDate
    );

    setInput(
        "taskDueDate",
        task.dueDate
    );

    setInput(
        "taskFollowupDate",
        task.followupDate
    );

    setInput(
        "taskFollowupAction",
        task.lastAction
    );

    setInput(
        "taskRemarks",
        task.remarks
    );

}


async function saveTask() {

    const editId =
        document.getElementById(
            "editTaskId"
        ).value;


    const task = {

        taskId:
            editId,

        department:
            getInput("taskDepartment"),

        task:
            getInput("taskName"),

        assignedTo:
            getInput("taskAssignedTo"),

        priority:
            getInput("taskPriority"),

        status:
            getInput("taskStatus"),

        createdDate:
            getInput("taskCreatedDate") ||
            todayInput(),

        dueDate:
            getInput("taskDueDate"),

        followupDate:
            getInput("taskFollowupDate"),

        lastAction:
            getInput("taskFollowupAction"),

        remarks:
            getInput("taskRemarks"),

        updatedBy:
            "Operations Head"

    };


    if (!task.task) {

        showNotification(
            "Missing Information",
            "Please enter a task."
        );

        return;

    }


    let result;


    if (editId) {

        result =
            await apiRequest(
                "updateTask",
                {
                    task: task
                }
            );

    }

    else {

        result =
            await apiRequest(
                "addTask",
                {
                    task: task
                }
            );

    }


    if (!result.success) {

        showNotification(
            "Error",
            result.message ||
            "Unable to save task."
        );

        return;

    }


    closeTaskModal();


    showNotification(
        "Saved",
        "Task saved successfully."
    );


    await loadTasks();

}


function editTask(taskId) {

    const task =
        tasks.find(
            t => t.taskId === taskId
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
   FILTERS
========================================================= */

function initializeFilters() {

    [
        "taskSearch",
        "departmentFilter",
        "priorityFilter",
        "statusFilter"
    ]
    .forEach(function (id) {

        const element =
            document.getElementById(id);

        if (!element) return;

        element.addEventListener(
            "input",
            renderTasksTable
        );

        element.addEventListener(
            "change",
            renderTasksTable
        );

    });

}


/* =========================================================
   EXPORT
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
        "Department",
        "Task",
        "Assigned To",
        "Priority",
        "Status",
        "Created Date",
        "Due Date",
        "Follow-up Date",
        "Last Action",
        "Remarks",
        "Updated By"

    ];


    const rows =
        tasks.map(function (task) {

            return [

                task.taskId,
                task.department,
                task.task,
                task.assignedTo,
                task.priority,
                task.status,
                task.createdDate,
                task.dueDate,
                task.followupDate,
                task.lastAction,
                task.remarks,
                task.updatedBy

            ];

        });


    const csv = [

        headers,

        ...rows

    ]
    .map(
        row =>
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


    link.href =
        url;

    link.download =
        "UsedBookR_Operations_Tasks.csv";

    link.click();


    URL.revokeObjectURL(
        url
    );

}


function initializeExports() {

    const button =
        document.getElementById(
            "exportTasksButton"
        );

    if (button) {

        button.addEventListener(
            "click",
            exportTasksCSV
        );

    }

}


/* =========================================================
   HELPERS
========================================================= */

function isOverdue(task) {

    if (
        !task.dueDate ||
        task.status === "Completed"
    ) {

        return false;

    }


    const date =
        parseDate(
            task.dueDate
        );


    if (!date) return false;


    const today =
        new Date();

    today.setHours(
        0,0,0,0
    );


    return date < today;

}


function dateBeforeToday(value) {

    const date =
        parseDate(value);

    if (!date) return false;


    const today =
        new Date();

    today.setHours(
        0,0,0,0
    );


    return date < today;

}


function sameDate(value,date) {

    const parsed =
        parseDate(value);

    if (!parsed) return false;


    return (

        parsed.getFullYear() ===
        date.getFullYear()

        &&

        parsed.getMonth() ===
        date.getMonth()

        &&

        parsed.getDate() ===
        date.getDate()

    );

}


function parseDate(value) {

    if (!value) return null;


    if (
        value instanceof Date
    ) {

        return value;

    }


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


function formatDateForInput(value) {

    if (!value) return "";


    const date =
        parseDate(value);


    if (!date) return "";


    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2,"0");

    const day =
        String(
            date.getDate()
        ).padStart(2,"0");


    return `${year}-${month}-${day}`;

}


function displayDate(value) {

    if (!value) return "-";


    const date =
        parseDate(value);


    if (!date) return value;


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function todayInput() {

    return formatDateForInput(
        new Date()
    );

}


function priorityBadge(priority) {

    return `
        <span class="priority-badge priority-${String(priority).toLowerCase()}">
            ${escapeHTML(priority)}
        </span>
    `;

}


function statusBadge(status, task) {

    let displayStatus =
        status;


    if (
        status !== "Completed" &&
        isOverdue(task)
    ) {

        displayStatus =
            "Overdue";

    }


    return `
        <span class="status-badge status-${String(displayStatus).toLowerCase().replace(/\s+/g,"-")}">
            ${escapeHTML(displayStatus)}
        </span>
    `;

}


function getDepartmentCode(department) {

    const codes = {

        "B2B / Sales": "B2B",

        "Customer Support": "CS",

        "Warehouse": "WH",

        "Scanning / Catalog": "SC",

        "Listing / Inventory": "LI",

        "Digital Marketing": "DM",

        "IT / Software Development": "IT",

        "Finance": "FN",

        "Book Fair / Events": "BF",

        "Books & Supply Procurement": "BP",

        "HR": "HR",

        "Data Analysis": "DA",

        "Software Testing": "ST",

        "Product Development": "PD"

    };


    return codes[department] ||
        "DP";

}


function setText(id,value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


function setInput(id,value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.value =
            value || "";

    }

}


function getInput(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value
        : "";

}


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

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


function csvEscape(value) {

    const text =
        String(
            value ?? ""
        );

    return `"${text.replace(
        /"/g,
        '""'
    )}"`;

}


/* =========================================================
   NOTIFICATIONS
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


    if (!notification) return;


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
   INITIALIZE EXPORTS
========================================================= */

initializeExports();
```
