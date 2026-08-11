/* ============================================================
   UsedBookR Operations Management System
   Google Sheets Connected Version
   ============================================================ */

"use strict";

/* ============================================================
   CONFIGURATION
   ============================================================ */

const CONFIG = {
    PASSWORD: "admin123",

    API_URL:
        "https://script.google.com/macros/s/AKfycbyrOAQZ--7aDiAHv0ey60C8-xXuTKDAhOVDQjUOc-uiGdgNnpuJ97nL4m-ABkw0Znf3ig/exec",

    REFRESH_INTERVAL: 60000
};


/* ============================================================
   14 DEPARTMENTS
   ============================================================ */

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
    "Books and Supply Procurement",
    "HR",
    "Data Analysis",
    "Software Testing",
    "Product Development"
];


/* ============================================================
   APPLICATION STATE
   ============================================================ */

let tasks = [];
let activities = [];
let currentDepartment = null;
let currentPage = "dashboard";
let editingTaskId = null;


/* ============================================================
   DOM HELPER
   ============================================================ */

function $(id) {
    return document.getElementById(id);
}


/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    initializeLogin();

    initializeNavigation();

    initializeButtons();

    initializeFilters();

    initializeModal();

    initializeDepartments();

    updateCurrentDate();

    setInterval(updateCurrentDate, 60000);

});


/* ============================================================
   LOGIN
   ============================================================ */

function initializeLogin() {

    const loginForm = $("loginForm");

    if (!loginForm) {
        console.error("loginForm not found");
        return;
    }

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const passwordInput = $("loginPassword");
        const error = $("loginError");

        const password =
            passwordInput ? passwordInput.value : "";

        if (password === CONFIG.PASSWORD) {

            if (error) {
                error.classList.remove("show");
            }

            const loginScreen = $("loginScreen");

            if (loginScreen) {
                loginScreen.style.display = "none";
            }

            const app =
                $("app") || $("operationsApp");

            if (app) {
                app.style.display = "flex";
            }

            sessionStorage.setItem(
                "usedbookr_logged_in",
                "true"
            );

            loadApplicationData();

        } else {

            if (error) {
                error.textContent =
                    "Incorrect password. Please try again.";

                error.classList.add("show");
            }

            if (passwordInput) {
                passwordInput.value = "";
                passwordInput.focus();
            }
        }
    });


    /*
       Restore login during the current browser session.
    */

    if (
        sessionStorage.getItem(
            "usedbookr_logged_in"
        ) === "true"
    ) {

        const loginScreen = $("loginScreen");

        if (loginScreen) {
            loginScreen.style.display = "none";
        }

        const app =
            $("app") || $("operationsApp");

        if (app) {
            app.style.display = "flex";
        }

        loadApplicationData();
    }
}


/* ============================================================
   LOGOUT
   ============================================================ */

function logout() {

    sessionStorage.removeItem(
        "usedbookr_logged_in"
    );

    tasks = [];
    activities = [];

    const app =
        $("app") || $("operationsApp");

    const loginScreen =
        $("loginScreen");

    if (app) {
        app.style.display = "none";
    }

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }

    const password =
        $("loginPassword");

    if (password) {
        password.value = "";
    }
}


function initializeButtons() {

    const logoutButton =
        $("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            logout
        );
    }

    const addButtons = [
        "topAddTask",
        "dashboardAddTask",
        "tasksAddButton",
        "departmentAddTaskButton"
    ];

    addButtons.forEach(id => {

        const button = $(id);

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


    const importButton =
        $("importExcelButton");

    if (importButton) {

        importButton.addEventListener(
            "click",
            () => {

                showNotification(
                    "Information",
                    "Google Sheets is the main data source. Edit the department sheet and refresh the website."
                );

            }
        );
    }
}


/* ============================================================
   NAVIGATION
   ============================================================ */

function initializeNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const page =
                        this.dataset.page;

                    const department =
                        this.dataset.department;

                    if (department) {

                        currentDepartment =
                            department;

                        showDepartmentPage(
                            department
                        );

                        return;
                    }

                    if (page) {

                        navigateTo(page);

                    }

                }
            );

        });


    const menuToggle =
        $("menuToggle");

    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            () => {

                const sidebar =
                    document.querySelector(
                        ".sidebar"
                    );

                if (sidebar) {
                    sidebar.classList.toggle(
                        "open"
                    );
                }

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


    const pageElement =
        $(page + "Page");

    if (pageElement) {

        pageElement.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove(
                "active"
            );

        });


    const matchingNav =
        document.querySelector(
            `.nav-item[data-page="${page}"]`
        );

    if (matchingNav) {
        matchingNav.classList.add(
            "active"
        );
    }


    updatePageHeader(page);


    if (page === "dashboard") {
        renderDashboard();
    }

    if (page === "tasks") {
        renderTasks();
    }

    if (page === "followups") {
        renderFollowups();
    }

    if (page === "reports") {
        renderReports();
    }

    if (page === "activity") {
        renderActivity();
    }

    if (page === "settings") {
        updateDataSource();
    }
}


function updatePageHeader(page) {

    const titles = {

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


    const data =
        titles[page];

    if (!data) return;


    if ($("pageTitle")) {
        $("pageTitle").textContent =
            data[0];
    }

    if ($("pageSubtitle")) {
        $("pageSubtitle").textContent =
            data[1];
    }
}


/* ============================================================
   DEPARTMENTS
   ============================================================ */

function initializeDepartments() {

    const departmentFilter =
        $("departmentFilter");

    const taskDepartment =
        $("taskDepartment");


    DEPARTMENTS.forEach(department => {

        if (departmentFilter) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                department;

            option.textContent =
                department;

            departmentFilter.appendChild(
                option
            );
        }


        if (taskDepartment) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                department;

            option.textContent =
                department;

            taskDepartment.appendChild(
                option
            );
        }

    });


    renderDepartmentCards();
}


function renderDepartmentCards() {

    const container =
        $("departmentsGrid");

    if (!container) return;

    container.innerHTML = "";


    DEPARTMENTS.forEach(department => {

        const departmentTasks =
            tasks.filter(
                task =>
                    normalizeDepartment(
                        task.department
                    ) ===
                    normalizeDepartment(
                        department
                    )
            );


        const completed =
            departmentTasks.filter(
                task =>
                    task.status ===
                    "Completed"
            ).length;


        const card =
            document.createElement("div");

        card.className =
            "department-card";


        card.innerHTML = `

            <div class="department-card-header">

                <strong>
                    ${escapeHTML(department)}
                </strong>

                <span>
                    ${departmentTasks.length}
                </span>

            </div>

            <div class="department-card-stats">

                <span>
                    Open:
                    <b>
                        ${countStatus(
                            departmentTasks,
                            "Open"
                        )}
                    </b>
                </span>

                <span>
                    Progress:
                    <b>
                        ${countStatus(
                            departmentTasks,
                            "In Progress"
                        )}
                    </b>
                </span>

                <span>
                    Blocked:
                    <b>
                        ${countStatus(
                            departmentTasks,
                            "Blocked"
                        )}
                    </b>
                </span>

                <span>
                    Completed:
                    <b>
                        ${completed}
                    </b>
                </span>

            </div>

            <button
                class="secondary-button department-view-button"
            >
                View Department
            </button>

        `;


        const viewButton =
            card.querySelector(
                ".department-view-button"
            );

        if (viewButton) {

            viewButton.addEventListener(
                "click",
                () => {

                    currentDepartment =
                        department;

                    showDepartmentPage(
                        department
                    );

                }
            );

        }


        container.appendChild(card);

    });
}


/* ============================================================
   GOOGLE SHEETS API
   ============================================================ */

async function apiRequest(
    action,
    method = "GET",
    data = null
) {

    try {

        let url =
            CONFIG.API_URL;


        if (method === "GET") {

            const separator =
                url.includes("?")
                    ? "&"
                    : "?";

            url +=
                separator +
                "action=" +
                encodeURIComponent(
                    action
                );
        }


        const options = {
            method: method,
            headers: {
                "Content-Type":
                    "application/json"
            }
        };


        if (
            method !== "GET" &&
            data !== null
        ) {

            options.body =
                JSON.stringify({
                    action,
                    ...data
                });

        }


        const response =
            await fetch(
                url,
                options
            );


        if (!response.ok) {

            throw new Error(
                "API HTTP error: " +
                response.status
            );

        }


        const result =
            await response.json();


        return result;

    } catch (error) {

        console.error(
            "API Error:",
            error
        );

        showNotification(
            "Connection Error",
            "Unable to connect to Google Sheets API."
        );

        return {
            success: false,
            error: error.message
        };
    }
}


/* ============================================================
   LOAD DATA
   ============================================================ */

async function loadApplicationData() {

    showNotification(
        "Loading",
        "Loading data from Google Sheets..."
    );


    const result =
        await apiRequest(
            "getTasks"
        );


    if (
        result &&
        result.success
    ) {

        tasks =
            normalizeTasks(
                result.tasks || []
            );


        renderEverything();


        showNotification(
            "Connected",
            `${tasks.length} task(s) loaded from Google Sheets.`
        );

    } else {

        tasks = [];

        renderEverything();

        showNotification(
            "Connection Problem",
            "Google Sheets data could not be loaded."
        );
    }


    updateDataSource();


    /*
       Automatically refresh Google Sheets data.
    */

    setTimeout(
        loadApplicationData,
        CONFIG.REFRESH_INTERVAL
    );
}


/* ============================================================
   NORMALIZE TASK DATA
   ============================================================ */

function normalizeTasks(data) {

    if (!Array.isArray(data)) {
        return [];
    }


    return data.map((task, index) => {

        return {

            taskId:
                task.taskId ||
                task.TaskID ||
                task.id ||
                `T${String(index + 1).padStart(3, "0")}`,

            department:
                task.department ||
                task.Department ||
                "",

            task:
                task.task ||
                task.Task ||
                task.title ||
                "",

            description:
                task.description ||
                task.Description ||
                "",

            assignedTo:
                task.assignedTo ||
                task.AssignedTo ||
                "",

            priority:
                task.priority ||
                task.Priority ||
                "Medium",

            status:
                task.status ||
                task.Status ||
                "Open",

            createdDate:
                task.createdDate ||
                task.CreatedDate ||
                "",

            dueDate:
                task.dueDate ||
                task.DueDate ||
                "",

            followupDate:
                task.followupDate ||
                task.FollowupDate ||
                "",

            lastAction:
                task.lastAction ||
                task.LastAction ||
                "",

            remarks:
                task.remarks ||
                task.Remarks ||
                "",

            updatedBy:
                task.updatedBy ||
                task.UpdatedBy ||
                "",

            updatedDate:
                task.updatedDate ||
                task.UpdatedDate ||
                ""

        };

    });
}


/* ============================================================
   DASHBOARD
   ============================================================ */

function renderDashboard() {

    const total =
        tasks.length;

    const open =
        countStatus(
            tasks,
            "Open"
        );

    const progress =
        countStatus(
            tasks,
            "In Progress"
        );

    const blocked =
        countStatus(
            tasks,
            "Blocked"
        );

    const completed =
        countStatus(
            tasks,
            "Completed"
        );

    const overdue =
        tasks.filter(
            task =>
                isOverdue(task)
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
        countPriority(
            tasks,
            "High"
        )
    );

    setText(
        "mediumPriorityCount",
        countPriority(
            tasks,
            "Medium"
        )
    );

    setText(
        "lowPriorityCount",
        countPriority(
            tasks,
            "Low"
        )
    );


    renderFollowupSummary();

    renderDepartmentPerformance();

    renderRecentTasks();

    renderDepartmentCards();
}


/* ============================================================
   DEPARTMENT PERFORMANCE
   ============================================================ */

function renderDepartmentPerformance() {

    const container =
        $("departmentPerformance");

    if (!container) return;

    container.innerHTML = "";


    DEPARTMENTS.forEach(
        department => {

            const departmentTasks =
                getDepartmentTasks(
                    department
                );


            const total =
                departmentTasks.length;


            const completed =
                countStatus(
                    departmentTasks,
                    "Completed"
                );


            const percentage =
                total === 0
                    ? 0
                    : Math.round(
                        completed /
                        total *
                        100
                    );


            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "department-performance-row";


            row.innerHTML = `

                <div>
                    <strong>
                        ${escapeHTML(
                            department
                        )}
                    </strong>

                    <span>
                        ${total} task(s)
                    </span>
                </div>

                <div class="performance-bar">

                    <div
                        class="performance-progress"
                        style="width:${percentage}%"
                    ></div>

                </div>

                <strong>
                    ${percentage}%
                </strong>

            `;


            container.appendChild(row);

        }
    );
}


/* ============================================================
   RECENT TASKS
   ============================================================ */

function renderRecentTasks() {

    const table =
        $("recentTasksTable");

    if (!table) return;


    const recent =
        [...tasks]
            .sort(
                (a, b) =>
                    new Date(
                        b.updatedDate ||
                        b.createdDate ||
                        0
                    ) -
                    new Date(
                        a.updatedDate ||
                        a.createdDate ||
                        0
                    )
            )
            .slice(0, 10);


    if (!recent.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7"
                    class="empty-table">
                    No tasks available.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        recent
            .map(
                task =>
                    taskRowHTML(
                        task,
                        false
                    )
            )
            .join("");
}


/* ============================================================
   ALL TASKS
   ============================================================ */

function renderTasks() {

    const table =
        $("allTasksTable");

    if (!table) return;


    const search =
        value("taskSearch")
            .toLowerCase();


    const department =
        value("departmentFilter");


    const priority =
        value("priorityFilter");


    const status =
        value("statusFilter");


    let filtered =
        tasks.filter(task => {

            const matchesSearch =
                !search ||
                (
                    `${task.taskId} ${task.task} ${task.description} ${task.assignedTo}`
                )
                    .toLowerCase()
                    .includes(search);


            const matchesDepartment =
                !department ||
                normalizeDepartment(
                    task.department
                ) ===
                normalizeDepartment(
                    department
                );


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

        });


    /*
       Overdue is calculated automatically.
    */

    if (
        status === "Overdue"
    ) {

        filtered =
            tasks.filter(
                task =>
                    isOverdue(task)
            );

    }


    if (!filtered.length) {

        table.innerHTML = `
            <tr>
                <td colspan="8"
                    class="empty-table">
                    No matching tasks.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        filtered
            .map(
                task =>
                    taskRowHTML(
                        task,
                        true
                    )
            )
            .join("");


    attachTaskActions();
}


/* ============================================================
   TASK ROW
   ============================================================ */

function taskRowHTML(
    task,
    actions
) {

    const overdue =
        isOverdue(task);


    const status =
        overdue &&
        task.status !== "Completed"
            ? "Overdue"
            : task.status;


    return `

        <tr>

            <td>
                <strong>
                    ${escapeHTML(
                        task.taskId
                    )}
                </strong>
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
                <span class="status-badge priority-${safeClass(
                    task.priority
                )}">
                    ${escapeHTML(
                        task.priority
                    )}
                </span>
            </td>

            <td>
                <span class="status-badge status-${safeClass(
                    status
                )}">
                    ${escapeHTML(
                        status
                    )}
                </span>
            </td>

            <td>
                ${formatDate(
                    task.dueDate
                )}
            </td>

            ${
                actions
                    ? `
                        <td>

                            <button
                                class="table-action edit-task"
                                data-id="${escapeHTML(
                                    task.taskId
                                )}"
                            >
                                Edit
                            </button>

                        </td>
                    `
                    : ""
            }

        </tr>

    `;
}


/* ============================================================
   TASK ACTIONS
   ============================================================ */

function attachTaskActions() {

    document
        .querySelectorAll(
            ".edit-task"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    const task =
                        tasks.find(
                            item =>
                                item.taskId ===
                                id
                        );

                    if (task) {
                        openTaskModal(
                            task
                        );
                    }

                }
            );

        });
}


/* ============================================================
   DEPARTMENT PAGE
   ============================================================ */

function showDepartmentPage(
    department
) {

    currentDepartment =
        department;


    document
        .querySelectorAll(".page")
        .forEach(page =>
            page.classList.remove(
                "active-page"
            )
        );


    const page =
        $("departmentDetailPage");

    if (page) {
        page.classList.add(
            "active-page"
        );
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item =>
            item.classList.remove(
                "active"
            )
        );


    const nav =
        document.querySelector(
            `.department-item[data-department="${CSS.escape(
                department
            )}"]`
        );


    if (nav) {
        nav.classList.add(
            "active"
        );
    }


    setText(
        "departmentDetailTitle",
        department
    );


    setText(
        "departmentDetailCode",
        getDepartmentCode(
            department
        )
    );


    const departmentTasks =
        getDepartmentTasks(
            department
        );


    setText(
        "departmentTotal",
        departmentTasks.length
    );

    setText(
        "departmentOpen",
        countStatus(
            departmentTasks,
            "Open"
        )
    );

    setText(
        "departmentProgress",
        countStatus(
            departmentTasks,
            "In Progress"
        )
    );

    setText(
        "departmentBlocked",
        countStatus(
            departmentTasks,
            "Blocked"
        )
    );

    setText(
        "departmentCompleted",
        countStatus(
            departmentTasks,
            "Completed"
        )
    );

    setText(
        "departmentOverdue",
        departmentTasks.filter(
            task =>
                isOverdue(task)
        ).length
    );


    renderDepartmentTasks(
        departmentTasks
    );
}


/* ============================================================
   DEPARTMENT TASK TABLE
   ============================================================ */

function renderDepartmentTasks(
    departmentTasks
) {

    const table =
        $("departmentTasksTable");

    if (!table) return;


    if (!departmentTasks.length) {

        table.innerHTML = `
            <tr>
                <td colspan="8"
                    class="empty-table">
                    No department tasks available.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        departmentTasks
            .map(task => {

                const overdue =
                    isOverdue(task);


                return `

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
                            ${escapeHTML(
                                task.priority
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                overdue &&
                                task.status !==
                                    "Completed"
                                    ? "Overdue"
                                    : task.status
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
                                class="table-action edit-task"
                                data-id="${escapeHTML(
                                    task.taskId
                                )}"
                            >
                                Edit
                            </button>

                        </td>

                    </tr>

                `;

            })
            .join("");


    attachTaskActions();
}


/* ============================================================
   FOLLOW-UPS
   ============================================================ */

function renderFollowupSummary() {

    const today =
        getDateOnly(
            new Date()
        );


    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;


    tasks.forEach(task => {

        if (!task.followupDate) {
            return;
        }


        if (
            task.status ===
            "Completed"
        ) {
            return;
        }


        const date =
            getDateOnly(
                task.followupDate
            );


        if (!date) return;


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


    setText(
        "followupsToday",
        dueToday
    );

    setText(
        "followupsOverdue",
        overdue
    );

    setText(
        "followupsUpcoming",
        upcoming
    );
}


function renderFollowups() {

    renderFollowupSummary();


    setText(
        "followupPageToday",
        $("followupsToday")
            ? $("followupsToday")
                .textContent
            : 0
    );

    setText(
        "followupPageOverdue",
        $("followupsOverdue")
            ? $("followupsOverdue")
                .textContent
            : 0
    );

    setText(
        "followupPageUpcoming",
        $("followupsUpcoming")
            ? $("followupsUpcoming")
                .textContent
            : 0
    );


    const table =
        $("followupsTable");

    if (!table) return;


    const followups =
        tasks.filter(
            task =>
                task.followupDate &&
                task.status !==
                    "Completed"
        );


    if (!followups.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7"
                    class="empty-table">
                    No follow-ups available.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        followups
            .sort(
                (a, b) =>
                    new Date(
                        a.followupDate
                    ) -
                    new Date(
                        b.followupDate
                    )
            )
            .map(task => `

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
                            task.lastAction ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            task.status
                        )}
                    </td>

                </tr>

            `)
            .join("");
}


/* ============================================================
   REPORTS
   ============================================================ */

function renderReports() {

    const table =
        $("analysisTable");

    if (!table) return;


    table.innerHTML =
        DEPARTMENTS
            .map(department => {

                const list =
                    getDepartmentTasks(
                        department
                    );


                const total =
                    list.length;


                const completed =
                    countStatus(
                        list,
                        "Completed"
                    );


                const percentage =
                    total === 0
                        ? 0
                        : Math.round(
                            completed /
                            total *
                            100
                        );


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
                            ${countStatus(
                                list,
                                "Open"
                            )}
                        </td>

                        <td>
                            ${countStatus(
                                list,
                                "In Progress"
                            )}
                        </td>

                        <td>
                            ${countStatus(
                                list,
                                "Blocked"
                            )}
                        </td>

                        <td>
                            ${list.filter(
                                task =>
                                    isOverdue(
                                        task
                                    )
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

            })
            .join("");
}


/* ============================================================
   ACTIVITY
   ============================================================ */

function renderActivity() {

    const container =
        $("activityTimeline");

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
        activities
            .slice()
            .reverse()
            .map(activity => `

                <div class="activity-item">

                    <strong>
                        ${escapeHTML(
                            activity.action ||
                            "Activity"
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            activity.description ||
                            ""
                        )}
                    </p>

                    <small>
                        ${escapeHTML(
                            activity.date ||
                            ""
                        )}
                    </small>

                </div>

            `)
            .join("");
}


/* ============================================================
   TASK MODAL
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
            saveTask
        );

    }


    const modal =
        $("taskModal");

    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {
                    closeTaskModal();
                }

            }
        );
    }
}


function openTaskModal(
    task = null
) {

    const modal =
        $("taskModal");

    if (!modal) return;


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


    setValue(
        "editTaskId",
        task
            ? task.taskId
            : ""
    );


    setValue(
        "taskName",
        task
            ? task.task
            : ""
    );


    setValue(
        "taskDepartment",
        task
            ? task.department
            : currentDepartment || ""
    );


    setValue(
        "taskAssignedTo",
        task
            ? task.assignedTo
            : ""
    );


    setValue(
        "taskPriority",
        task
            ? task.priority
            : "Medium"
    );


    setValue(
        "taskStatus",
        task
            ? task.status
            : "Open"
    );


    setValue(
        "taskCreatedDate",
        task
            ? toInputDate(
                task.createdDate
            )
            : todayInputDate()
    );


    setValue(
        "taskDueDate",
        task
            ? toInputDate(
                task.dueDate
            )
            : ""
    );


    setValue(
        "taskFollowupDate",
        task
            ? toInputDate(
                task.followupDate
            )
            : ""
    );


    setValue(
        "taskFollowupAction",
        task
            ? task.lastAction
            : ""
    );


    setValue(
        "taskRemarks",
        task
            ? task.remarks
            : ""
    );


    modal.style.display =
        "flex";
}


function closeTaskModal() {

    const modal =
        $("taskModal");

    if (modal) {
        modal.style.display =
            "none";
    }

    editingTaskId = null;
}


/* ============================================================
   SAVE TASK
   ============================================================ */

async function saveTask(
    event
) {

    event.preventDefault();


    const taskData = {

        taskId:
            value("editTaskId"),

        task:
            value("taskName"),

        department:
            value("taskDepartment"),

        assignedTo:
            value("taskAssignedTo"),

        priority:
            value("taskPriority"),

        status:
            value("taskStatus"),

        createdDate:
            value("taskCreatedDate"),

        dueDate:
            value("taskDueDate"),

        followupDate:
            value("taskFollowupDate"),

        lastAction:
            value("taskFollowupAction"),

        remarks:
            value("taskRemarks"),

        updatedBy:
            "Operations Head",

        updatedDate:
            todayInputDate()

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


    showNotification(
        "Saving",
        "Saving task to Google Sheets..."
    );


    /*
       Your Apps Script should accept
       an action named saveTask.

       If you use a different action name,
       change it here.
    */

    const result =
        await apiRequest(
            "saveTask",
            "POST",
            taskData
        );


    if (
        result &&
        result.success
    ) {

        closeTaskModal();

        await loadApplicationData();

        showNotification(
            "Saved",
            "Task successfully saved."
        );

    } else {

        showNotification(
            "Save Failed",
            result &&
            result.message
                ? result.message
                : "Could not save task."
        );
    }
}


/* ============================================================
   FILTERS
   ============================================================ */

function initializeFilters() {

    [
        "taskSearch",
        "departmentFilter",
        "priorityFilter",
        "statusFilter"
    ]
        .forEach(id => {

            const element =
                $(id);

            if (element) {

                element.addEventListener(
                    "input",
                    renderTasks
                );

                element.addEventListener(
                    "change",
                    renderTasks
                );

            }

        });
}


/* ============================================================
   RENDER EVERYTHING
   ============================================================ */

function renderEverything() {

    renderDashboard();

    renderTasks();

    renderFollowups();

    renderReports();

    renderActivity();

    renderDepartmentCards();

    if (
        currentDepartment
    ) {

        renderDepartmentTasks(
            getDepartmentTasks(
                currentDepartment
            )
        );

    }
}


/* ============================================================
   DATA SOURCE
   ============================================================ */

function updateDataSource() {

    const element =
        $("dataSourceStatus");

    if (element) {

        element.textContent =
            "Google Sheets API";

    }
}


/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

function countStatus(
    list,
    status
) {

    return list.filter(
        task =>
            task.status === status
    ).length;
}


function countPriority(
    list,
    priority
) {

    return list.filter(
        task =>
            task.priority ===
            priority
    ).length;
}


function getDepartmentTasks(
    department
) {

    return tasks.filter(
        task =>
            normalizeDepartment(
                task.department
            ) ===
            normalizeDepartment(
                department
            )
    );
}


function normalizeDepartment(
    department
) {

    return String(
        department || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /&/g,
            "and"
        )
        .replace(
            /\s+/g,
            " "
        );
}


function isOverdue(
    task
) {

    if (
        !task.dueDate ||
        task.status ===
            "Completed"
    ) {
        return false;
    }


    const due =
        getDateOnly(
            task.dueDate
        );


    const today =
        getDateOnly(
            new Date()
        );


    if (!due) return false;


    return due < today;
}


function getDateOnly(
    value
) {

    if (!value) {
        return null;
    }


    const date =
        value instanceof Date
            ? new Date(value)
            : new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }


    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


function formatDate(
    date
) {

    if (!date) {
        return "-";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return escapeHTML(
            String(date)
        );

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function toInputDate(
    value
) {

    if (!value) {
        return "";
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


    return `${year}-${month}-${day}`;
}


function todayInputDate() {

    return toInputDate(
        new Date()
    );
}


function updateCurrentDate() {

    const element =
        $("currentDate");

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


function getDepartmentCode(
    department
) {

    const codes = {

        "B2B / Sales":
            "B2B",

        "Customer Support":
            "CS",

        "Warehouse":
            "WH",

        "Scanning / Catalog":
            "SC",

        "Listing / Inventory":
            "LI",

        "Digital Marketing":
            "DM",

        "IT / Software Development":
            "IT",

        "Finance":
            "FN",

        "Book Fair / Events":
            "BF",

        "Books and Supply Procurement":
            "BP",

        "Books & Supply Procurement":
            "BP",

        "HR":
            "HR",

        "Data Analysis":
            "DA",

        "Software Testing":
            "ST",

        "Product Development":
            "PD"

    };


    return (
        codes[department] ||
        "DEPARTMENT"
    );
}


function safeClass(
    value
) {

    return String(
        value || ""
    )
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            ""
        );
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


function setText(
    id,
    text
) {

    const element =
        $(id);

    if (element) {
        element.textContent =
            text;
    }
}


function setValue(
    id,
    value
) {

    const element =
        $(id);

    if (element) {
        element.value =
            value ?? "";
    }
}


function value(
    id
) {

    const element =
        $(id);

    return element
        ? element.value
        : "";
}


/* ============================================================
   NOTIFICATION
   ============================================================ */

function showNotification(
    title,
    message
) {

    const notification =
        $("notification");

    const notificationTitle =
        $("notificationTitle");

    const notificationMessage =
        $("notificationMessage");


    if (!notification) {
        console.log(
            title,
            message
        );
        return;
    }


    if (notificationTitle) {
        notificationTitle.textContent =
            title;
    }


    if (notificationMessage) {
        notificationMessage.textContent =
            message;
    }


    notification.classList.add(
        "show"
    );


    clearTimeout(
        window.__notificationTimer
    );


    window.__notificationTimer =
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
   EXPORT CSV
   ============================================================ */

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
        "Description",
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
        tasks.map(task => [

            task.taskId,
            task.department,
            task.task,
            task.description,
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

        ]);


    const csv = [

        headers,

        ...rows

    ]
        .map(
            row =>
                row
                    .map(
                        value =>
                            `"${String(
                                value ?? ""
                            ).replace(
                                /"/g,
                                '""'
                            )}"`
                    )
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
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        `UsedBookR_Operations_${todayInputDate()}.csv`;


    document.body.appendChild(
        link
    );

    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );


    showNotification(
        "Export Complete",
        "Task data exported successfully."
    );
}


/* ============================================================
   STARTUP LOG
   ============================================================ */

console.log(
    "UsedBookR Operations Management System loaded."
);

console.log(
    "Google Sheets API:",
    CONFIG.API_URL
);

console.log(
    "Departments:",
    DEPARTMENTS.length
);
