/* =========================================================
   USEDBOOKR OPERATIONS MANAGEMENT SYSTEM
   FRONTEND JAVASCRIPT
   Google Sheets / Apps Script Backend
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyrOAQZ--7aDiAHv0ey60C8-xXuTKDAhOVDQjUOc-uiGdgNnpuJ97nL4m-ABkw0Znf3ig/exec";

const LOGIN_PASSWORD = "admin123";

const LOGIN_STORAGE_KEY =
    "usedbookrOperationsLogin";


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

let currentPage = "dashboard";

let isLoadingTasks = false;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeDepartments();

        initializeDate();

        initializeNavigation();

        initializeTaskButtons();

        initializeFilters();

        initializeTaskForm();

        initializeLogout();

        initializeLogin();

        initializeExports();

        checkLogin();

    }
);


/* =========================================================
   LOGIN
========================================================= */

function initializeLogin() {

    const form =
        document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const input =
                document.getElementById(
                    "loginPassword"
                );

            const error =
                document.getElementById(
                    "loginError"
                );

            const password =
                input ? input.value.trim() : "";

            if (password === LOGIN_PASSWORD) {

                localStorage.setItem(
                    LOGIN_STORAGE_KEY,
                    "true"
                );

                document.getElementById(
                    "loginScreen"
                ).style.display = "none";

                document.getElementById(
                    "app"
                ).style.display = "flex";

                if (error) {
                    error.classList.remove("show");
                }

                loadTasks();

            } else {

                if (error) {
                    error.classList.add("show");
                }

                if (input) {
                    input.value = "";
                    input.focus();
                }

            }

        }
    );

}


/* =========================================================
   CHECK LOGIN
========================================================= */

function checkLogin() {

    const loggedIn =
        localStorage.getItem(
            LOGIN_STORAGE_KEY
        );

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    const app =
        document.getElementById(
            "app"
        );

    if (loggedIn === "true") {

        if (loginScreen) {
            loginScreen.style.display = "none";
        }

        if (app) {
            app.style.display = "flex";
        }

        loadTasks();

    } else {

        if (loginScreen) {
            loginScreen.style.display = "flex";
        }

        if (app) {
            app.style.display = "none";
        }

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function initializeLogout() {

    const button =
        document.getElementById(
            "logoutButton"
        );

    if (!button) return;

    button.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                LOGIN_STORAGE_KEY
            );

            location.reload();

        }
    );

}


/* =========================================================
   DEPARTMENTS
========================================================= */

function initializeDepartments() {

    const departmentSelect =
        document.getElementById(
            "taskDepartment"
        );

    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );

    if (departmentSelect) {

        departmentSelect.innerHTML =
            '<option value="">Select Department</option>';

        DEPARTMENTS.forEach(
            function (department) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value = department;

                option.textContent =
                    department;

                departmentSelect.appendChild(
                    option
                );

            }
        );

    }


    if (departmentFilter) {

        departmentFilter.innerHTML =
            '<option value="">All Departments</option>';

        DEPARTMENTS.forEach(
            function (department) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value = department;

                option.textContent =
                    department;

                departmentFilter.appendChild(
                    option
                );

            }
        );

    }

}


/* =========================================================
   DATE
========================================================= */

function initializeDate() {

    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) return;

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


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    const navigationItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navigationItems.forEach(
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


    const menuToggle =
        document.getElementById(
            "menuToggle"
        );

    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            function () {

                const sidebar =
                    document.querySelector(
                        ".sidebar"
                    );

                if (sidebar) {
                    sidebar.classList.toggle(
                        "sidebar-open"
                    );
                }

            }
        );

    }

}


/* =========================================================
   SHOW PAGE
========================================================= */

function showPage(page) {

    currentPage = page;

    document
        .querySelectorAll(".page")
        .forEach(
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


    document
        .querySelectorAll(".nav-item")
        .forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );

                if (
                    item.dataset.page === page
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            }
        );


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


/* =========================================================
   PAGE HEADER
========================================================= */

function updatePageHeader(page) {

    const title =
        document.getElementById(
            "pageTitle"
        );

    const subtitle =
        document.getElementById(
            "pageSubtitle"
        );


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


    if (
        pageNames[page]
    ) {

        if (title) {
            title.textContent =
                pageNames[page][0];
        }

        if (subtitle) {
            subtitle.textContent =
                pageNames[page][1];
        }

    }

}


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(
    action,
    data = {}
) {

    try {

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
                            action,
                            ...data
                        })
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP error " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "API:",
            action,
            result
        );


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

            message:
                error.message ||
                "API connection failed."

        };

    }

}


/* =========================================================
   LOAD TASKS
========================================================= */

async function loadTasks() {

    if (isLoadingTasks) {
        return;
    }

    isLoadingTasks = true;


    showNotification(
        "Loading",
        "Loading operations data..."
    );


    try {

        const result =
            await apiRequest(
                "getTasks"
            );


        if (!result || !result.success) {

            showNotification(
                "Error",
                result?.message ||
                "Unable to load tasks."
            );

            return;

        }


        const rawTasks =
            Array.isArray(
                result.tasks
            )
                ? result.tasks
                : [];


        console.log(
            "Raw tasks from API:",
            rawTasks
        );


        tasks =
            normalizeTasks(
                rawTasks
            );


        console.log(
            "Normalized tasks:",
            tasks
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
    finally {

        isLoadingTasks = false;

    }

}


/* =========================================================
   VALUE HELPER
   Supports both:
   "Task ID"
   and
   "taskId"
========================================================= */

function getTaskValue(
    task,
    keys,
    fallback = ""
) {

    if (!task) {
        return fallback;
    }


    for (
        const key of keys
    ) {

        if (
            task[key] !== undefined &&
            task[key] !== null &&
            String(
                task[key]
            ).trim() !== ""
        ) {

            return task[key];

        }

    }


    return fallback;

}


/* =========================================================
   NORMALIZE TASK DATA
   THIS FIXES THE MAIN API / FRONTEND MISMATCH
========================================================= */

function normalizeTasks(data) {

    if (!Array.isArray(data)) {
        return [];
    }


    return data.map(
        function (task, index) {

            return {

                taskId:
                    String(
                        getTaskValue(
                            task,
                            [
                                "Task ID",
                                "taskId",
                                "TaskID",
                                "id"
                            ],
                            "T" +
                            String(
                                index + 1
                            ).padStart(
                                3,
                                "0"
                            )
                        )
                    ),


                department:
                    String(
                        getTaskValue(
                            task,
                            [
                                "Department",
                                "department"
                            ]
                        )
                    ),


                task:
                    String(
                        getTaskValue(
                            task,
                            [
                                "Task",
                                "task",
                                "Title",
                                "title"
                            ]
                        )
                    ),


                description:
                    String(
                        getTaskValue(
                            task,
                            [
                                "Description",
                                "description"
                            ]
                        )
                    ),


                assignedTo:
                    String(
                        getTaskValue(
                            task,
                            [
                                "Assigned To",
                                "assignedTo",
                                "Assignee",
                                "assignee"
                            ]
                        )
                    ),


                priority:
                    String(
                        getTaskValue(
                            task,
                            [
                                "Priority",
                                "priority"
                            ],
                            "Medium"
                        )
                    ),


                status:
                    String(
                        getTaskValue(
                            task,
                            [
                                "Status",
                                "status"
                            ],
                            "Open"
                        )
                    ),


                createdDate:
                    formatDateForInput(
                        getTaskValue(
                            task,
                            [
                                "Created Date",
                                "createdDate"
                            ]
                        )
                    ),


                dueDate:
                    formatDateForInput(
                        getTaskValue(
                            task,
                            [
                                "Due Date",
                                "dueDate"
                            ]
                        )
                    ),


                followupDate:
                    formatDateForInput(
                        getTaskValue(
                            task,
                            [
                                "Follow-up Date",
                                "followupDate",
                                "Followup Date"
                            ]
                        )
                    ),


                lastAction:
                    String(
                        getTaskValue(
                            task,
                            [
                                "Last Action / Follow-up",
                                "Last Action",
                                "lastAction",
                                "Follow-up / Action Taken"
                            ]
                        )
                    ),


                remarks:
                    String(
                        getTaskValue(
                            task,
                            [
                                "Remarks",
                                "remarks"
                            ]
                        )
                    ),


                updatedBy:
                    String(
                        getTaskValue(
                            task,
                            [
                                "Updated By",
                                "updatedBy"
                            ]
                        )
                    ),


                updatedDate:
                    String(
                        getTaskValue(
                            task,
                            [
                                "Updated Date",
                                "updatedDate"
                            ]
                        )
                    )

            };

        }
    );

}


/* =========================================================
   UPDATE ALL VIEWS
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
            function (task) {
                return task.status === "Open";
            }
        ).length;


    const progress =
        tasks.filter(
            function (task) {
                return task.status === "In Progress";
            }
        ).length;


    const blocked =
        tasks.filter(
            function (task) {
                return task.status === "Blocked";
            }
        ).length;


    const completed =
        tasks.filter(
            function (task) {
                return task.status === "Completed";
            }
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
            function (task) {
                return (
                    task.priority ===
                    "High"
                );
            }
        ).length
    );


    setText(
        "mediumPriorityCount",
        tasks.filter(
            function (task) {
                return (
                    task.priority ===
                    "Medium"
                );
            }
        ).length
    );


    setText(
        "lowPriorityCount",
        tasks.filter(
            function (task) {
                return (
                    task.priority ===
                    "Low"
                );
            }
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


    DEPARTMENTS.forEach(
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

                <div class="department-performance-name">

                    <strong>
                        ${escapeHTML(
                            department
                        )}
                    </strong>

                    <span>
                        ${total} task(s)
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

            `;


            container.appendChild(
                row
            );

        }
    );

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
                function (a, b) {

                    return String(
                        b.updatedDate ||
                        b.createdDate ||
                        ""
                    ).localeCompare(
                        String(
                            a.updatedDate ||
                            a.createdDate ||
                            ""
                        )
                    );

                }
            )
            .slice(
                0,
                10
            );


    if (!recent.length) {

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


    recent.forEach(
        function (task) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

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
                        task.status,
                        task
                    )}
                </td>

                <td>
                    ${displayDate(
                        task.dueDate
                    )}
                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   ALL TASKS
========================================================= */

function renderTasksTable() {

    const tbody =
        document.getElementById(
            "allTasksTable"
        );

    if (!tbody) return;


    const search =
        (
            document.getElementById(
                "taskSearch"
            )?.value ||
            ""
        )
        .toLowerCase()
        .trim();


    const department =
        document.getElementById(
            "departmentFilter"
        )?.value ||
        "";


    const priority =
        document.getElementById(
            "priorityFilter"
        )?.value ||
        "";


    const status =
        document.getElementById(
            "statusFilter"
        )?.value ||
        "";


    const filtered =
        tasks.filter(
            function (task) {

                const text =
                    (
                        task.task +
                        " " +
                        task.description +
                        " " +
                        task.assignedTo +
                        " " +
                        task.department +
                        " " +
                        task.taskId
                    )
                    .toLowerCase();


                if (
                    search &&
                    !text.includes(
                        search
                    )
                ) {
                    return false;
                }


                if (
                    department &&
                    task.department !==
                    department
                ) {
                    return false;
                }


                if (
                    priority &&
                    task.priority !==
                    priority
                ) {
                    return false;
                }


                if (status) {

                    if (
                        status ===
                        "Overdue"
                    ) {

                        if (
                            !isOverdue(task)
                        ) {
                            return false;
                        }

                    }
                    else if (
                        task.status !==
                        status
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    tbody.innerHTML = "";


    if (!filtered.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-table"
                >
                    No matching tasks available.
                </td>

            </tr>

        `;

        return;

    }


    filtered.forEach(
        function (task) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        task.taskId
                    )}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(
                            task.task
                        )}
                    </strong>
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
                        task.status,
                        task
                    )}
                </td>

                <td>
                    ${displayDate(
                        task.dueDate
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

            `;


            tbody.appendChild(
                row
            );

        }
    );


    tbody
        .querySelectorAll(
            ".edit-task"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        editTask(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   FOLLOW-UP SUMMARY
========================================================= */

function updateFollowupSummary() {

    const today =
        startOfDay(
            new Date()
        );


    const todayCount =
        tasks.filter(
            function (task) {

                return (
                    task.followupDate &&
                    sameDate(
                        task.followupDate,
                        today
                    )
                );

            }
        ).length;


    const overdue =
        tasks.filter(
            function (task) {

                return (
                    task.followupDate &&
                    dateBeforeToday(
                        task.followupDate
                    )
                );

            }
        ).length;


    const upcoming =
        tasks.filter(
            function (task) {

                if (
                    !task.followupDate
                ) {
                    return false;
                }


                const date =
                    parseDate(
                        task.followupDate
                    );


                return (
                    date &&
                    date > today
                );

            }
        ).length;


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


/* =========================================================
   FOLLOW-UP TABLE
========================================================= */

function renderFollowups() {

    const tbody =
        document.getElementById(
            "followupsTable"
        );

    if (!tbody) return;


    const followups =
        tasks
            .filter(
                function (task) {
                    return Boolean(
                        task.followupDate
                    );
                }
            )
            .sort(
                function (a, b) {

                    return String(
                        a.followupDate
                    ).localeCompare(
                        String(
                            b.followupDate
                        )
                    );

                }
            );


    tbody.innerHTML = "";


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


    followups.forEach(
        function (task) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

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
                    ${displayDate(
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
                    ${statusBadge(
                        task.status,
                        task
                    )}
                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   DEPARTMENT
========================================================= */

function openDepartment(
    department
) {

    currentDepartment =
        department;

    showDepartmentPage(
        department
    );

}


function showDepartmentPage(
    department
) {

    currentDepartment =
        department;


    document
        .querySelectorAll(".page")
        .forEach(
            function (section) {

                section.classList.remove(
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
            function (task) {

                return (
                    task.department ===
                    department
                );

            }
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
            isOverdue
        ).length
    );


    renderDepartmentTasks(
        departmentTasks
    );

}


/* =========================================================
   DEPARTMENT TASKS
========================================================= */

function renderDepartmentTasks(
    departmentTasks
) {

    const tbody =
        document.getElementById(
            "departmentTasksTable"
        );

    if (!tbody) return;


    tbody.innerHTML = "";


    if (
        !departmentTasks.length
    ) {

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


    departmentTasks.forEach(
        function (task) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

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
                        task.status,
                        task
                    )}
                </td>

                <td>
                    ${displayDate(
                        task.dueDate
                    )}
                </td>

                <td>
                    ${displayDate(
                        task.followupDate
                    )}
                </td>

                <td>

                    <button
                        class="table-action edit-department-task"
                        data-id="${escapeHTML(
                            task.taskId
                        )}"
                    >
                        Edit
                    </button>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    tbody
        .querySelectorAll(
            ".edit-department-task"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        editTask(
                            button.dataset.id
                        );

                    }
                );

            }
        );

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


    DEPARTMENTS.forEach(
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


            const completed =
                countStatus(
                    departmentTasks,
                    "Completed"
                );


            const blocked =
                countStatus(
                    departmentTasks,
                    "Blocked"
                );


            const overdue =
                departmentTasks.filter(
                    isOverdue
                ).length;


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "department-card";


            card.innerHTML = `

                <div class="department-card-code">

                    ${escapeHTML(
                        getDepartmentCode(
                            department
                        )
                    )}

                </div>

                <h3>
                    ${escapeHTML(
                        department
                    )}
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

                <button
                    class="secondary-button"
                    type="button"
                >
                    View Department
                </button>

            `;


            card
                .querySelector(
                    "button"
                )
                .addEventListener(
                    "click",
                    function () {

                        openDepartment(
                            department
                        );

                    }
                );


            container.appendChild(
                card
            );

        }
    );

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


    DEPARTMENTS.forEach(
        function (department) {

            const data =
                tasks.filter(
                    function (task) {

                        return (
                            task.department ===
                            department
                        );

                    }
                );


            const total =
                data.length;


            const open =
                countStatus(
                    data,
                    "Open"
                );


            const progress =
                countStatus(
                    data,
                    "In Progress"
                );


            const blocked =
                countStatus(
                    data,
                    "Blocked"
                );


            const completed =
                countStatus(
                    data,
                    "Completed"
                );


            const overdue =
                data.filter(
                    isOverdue
                ).length;


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
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        department
                    )}
                </td>

                <td>${total}</td>

                <td>${open}</td>

                <td>${progress}</td>

                <td>${blocked}</td>

                <td>${overdue}</td>

                <td>${completed}</td>

                <td>${percentage}%</td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

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
                function (a, b) {

                    return String(
                        b.updatedDate ||
                        b.createdDate ||
                        ""
                    ).localeCompare(
                        String(
                            a.updatedDate ||
                            a.createdDate ||
                            ""
                        )
                    );

                }
            )
            .slice(
                0,
                20
            );


    container.innerHTML = "";


    activities.forEach(
        function (task) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "activity-item";


            item.innerHTML = `

                <div class="activity-dot"></div>

                <div class="activity-content">

                    <strong>
                        ${escapeHTML(
                            task.task
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            task.status
                        )}
                        ·
                        ${escapeHTML(
                            task.department
                        )}
                    </p>

                    <small>
                        Updated by
                        ${escapeHTML(
                            task.updatedBy ||
                            "System"
                        )}
                        ·
                        ${escapeHTML(
                            displayDate(
                                task.updatedDate
                            )
                        )}
                    </small>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   TASK BUTTONS
========================================================= */

function initializeTaskButtons() {

    const buttonIds = [

        "topAddTask",

        "dashboardAddTask",

        "tasksAddButton",

        "departmentAddTaskButton"

    ];


    buttonIds.forEach(
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


/* =========================================================
   TASK FORM
========================================================= */

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


/* =========================================================
   OPEN TASK MODAL
========================================================= */

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


    const title =
        document.getElementById(
            "taskModalTitle"
        );


    if (task) {

        if (title) {
            title.textContent =
                "Edit Task";
        }

        populateTaskForm(
            task
        );

    }
    else {

        if (title) {
            title.textContent =
                "Add New Task";
        }

        clearTaskForm();


        if (
            currentDepartment
        ) {

            const department =
                document.getElementById(
                    "taskDepartment"
                );

            if (department) {

                department.value =
                    currentDepartment;

            }

        }

    }

}


/* =========================================================
   CLOSE TASK MODAL
========================================================= */

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


/* =========================================================
   CLEAR TASK FORM
========================================================= */

function clearTaskForm() {

    const form =
        document.getElementById(
            "taskForm"
        );

    if (form) {
        form.reset();
    }


    setInput(
        "editTaskId",
        ""
    );


    setInput(
        "taskStatus",
        "Open"
    );


    setInput(
        "taskPriority",
        "Medium"
    );


    setInput(
        "taskCreatedDate",
        todayInput()
    );

}


/* =========================================================
   POPULATE TASK FORM
========================================================= */

function populateTaskForm(
    task
) {

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


/* =========================================================
   SAVE TASK
========================================================= */

async function saveTask() {

    const editId =
        getInput(
            "editTaskId"
        );


    const task = {

        taskId:
            editId,

        department:
            getInput(
                "taskDepartment"
            ),

        task:
            getInput(
                "taskName"
            ),

        assignedTo:
            getInput(
                "taskAssignedTo"
            ),

        priority:
            getInput(
                "taskPriority"
            ),

        status:
            getInput(
                "taskStatus"
            ),

        createdDate:
            getInput(
                "taskCreatedDate"
            ) ||
            todayInput(),

        dueDate:
            getInput(
                "taskDueDate"
            ),

        followupDate:
            getInput(
                "taskFollowupDate"
            ),

        lastAction:
            getInput(
                "taskFollowupAction"
            ),

        remarks:
            getInput(
                "taskRemarks"
            ),

        updatedBy:
            "Operations Head"

    };


    if (
        !task.task
    ) {

        showNotification(
            "Missing Information",
            "Please enter a task."
        );

        return;

    }


    if (
        !task.department
    ) {

        showNotification(
            "Missing Information",
            "Please select a department."
        );

        return;

    }


    if (
        !task.assignedTo
    ) {

        showNotification(
            "Missing Information",
            "Please enter the assigned person."
        );

        return;

    }


    if (
        !task.dueDate
    ) {

        showNotification(
            "Missing Information",
            "Please select a due date."
        );

        return;

    }


    showNotification(
        "Saving",
        "Saving task to Google Sheets..."
    );


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


    if (
        !result ||
        !result.success
    ) {

        showNotification(
            "Error",
            result?.message ||
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


/* =========================================================
   EDIT TASK
========================================================= */

function editTask(
    taskId
) {

    const task =
        tasks.find(
            function (item) {

                return (
                    String(
                        item.taskId
                    ) ===
                    String(
                        taskId
                    )
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
   FILTERS
========================================================= */

function initializeFilters() {

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

            if (!element) return;


            element.addEventListener(
                "input",
                renderTasksTable
            );


            element.addEventListener(
                "change",
                renderTasksTable
            );

        }
    );

}


/* =========================================================
   EXPORT
========================================================= */

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
        tasks.map(
            function (task) {

                return [

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

                ];

            }
        );


    const csv =
        [
            headers,
            ...rows
        ]
        .map(
            function (row) {

                return row
                    .map(
                        csvEscape
                    )
                    .join(",");

            }
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


    link.href =
        url;


    link.download =
        "UsedBookR_Operations_Tasks.csv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   DATE HELPERS
========================================================= */

function startOfDay(
    date
) {

    const result =
        new Date(date);

    result.setHours(
        0,
        0,
        0,
        0
    );

    return result;

}


function parseDate(
    value
) {

    if (!value) {
        return null;
    }


    if (
        value instanceof Date
    ) {

        return isNaN(
            value.getTime()
        )
            ? null
            : value;

    }


    const text =
        String(
            value
        ).trim();


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            text
        )
    ) {

        const parts =
            text.split(
                "-"
            );


        const date =
            new Date(
                Number(parts[0]),
                Number(parts[1]) - 1,
                Number(parts[2])
            );


        return isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    const date =
        new Date(
            text
        );


    return isNaN(
        date.getTime()
    )
        ? null
        : date;

}


function formatDateForInput(
    value
) {

    if (!value) {
        return "";
    }


    const text =
        String(
            value
        ).trim();


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            text
        )
    ) {

        return text;

    }


    const date =
        parseDate(
            value
        );


    if (!date) {
        return "";
    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
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


function displayDate(
    value
) {

    if (!value) {
        return "-";
    }


    const date =
        parseDate(
            value
        );


    if (!date) {

        return String(
            value
        );

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


function todayInput() {

    const today =
        new Date();


    return formatDateForInput(
        today
    );

}


/* =========================================================
   DATE CONDITIONS
========================================================= */

function sameDate(
    value,
    date
) {

    const parsed =
        parseDate(
            value
        );


    if (!parsed) {
        return false;
    }


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


function dateBeforeToday(
    value
) {

    const date =
        parseDate(
            value
        );


    if (!date) {
        return false;
    }


    const today =
        startOfDay(
            new Date()
        );


    return (
        startOfDay(date) <
        today
    );

}


function isOverdue(
    task
) {

    if (
        !task ||
        !task.dueDate ||
        task.status ===
        "Completed"
    ) {

        return false;

    }


    return dateBeforeToday(
        task.dueDate
    );

}


/* =========================================================
   BADGES
========================================================= */

function priorityBadge(
    priority
) {

    const safePriority =
        priority ||
        "Medium";


    return `

        <span
            class="priority-badge priority-${String(
                safePriority
            ).toLowerCase()}"
        >
            ${escapeHTML(
                safePriority
            )}
        </span>

    `;

}


function statusBadge(
    status,
    task
) {

    let displayStatus =
        status ||
        "Open";


    if (
        displayStatus !==
        "Completed"
        &&
        isOverdue(task)
    ) {

        displayStatus =
            "Overdue";

    }


    const className =
        String(
            displayStatus
        )
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );


    return `

        <span
            class="status-badge status-${className}"
        >
            ${escapeHTML(
                displayStatus
            )}
        </span>

    `;

}


/* =========================================================
   DEPARTMENT CODE
========================================================= */

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
        codes[
            department
        ] ||
        "DP"
    );

}


/* =========================================================
   COUNT STATUS
========================================================= */

function countStatus(
    list,
    status
) {

    return list.filter(
        function (task) {

            return (
                task.status ===
                status
            );

        }
    ).length;

}


/* =========================================================
   DOM HELPERS
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


function setInput(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value || "";

    }

}


function getInput(
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


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
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


/* =========================================================
   CSV HELPER
========================================================= */

function csvEscape(
    value
) {

    const text =
        String(
            value ??
            ""
        );


    return (
        '"' +
        text.replace(
            /"/g,
            '""'
        ) +
        '"'
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
   END
========================================================= */
