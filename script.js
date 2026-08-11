/* =========================================================
   USEDBOOKR OPERATIONS MANAGEMENT SYSTEM
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const APP_CONFIG = {

    // Change this universal password.
    // IMPORTANT: this is only frontend protection.
    // For real security, authentication must eventually
    // be moved to a backend.
    PASSWORD: "admin123",

    STORAGE_KEY: "usedbookr_operations_data",

    LOGIN_KEY: "usedbookr_operations_logged_in",

    USER_NAME: "Operations Monitor",

    COMPANY_NAME: "UsedBookR",

    DEPARTMENTS: [

        {
            id: "b2b-sales",
            name: "B2B / Sales",
            code: "B2B",
            description: "B2B enquiries, sales, quotations and client follow-ups"
        },

        {
            id: "customer-support",
            name: "Customer Support",
            code: "CS",
            description: "Customer enquiries, complaints, refunds and support"
        },

        {
            id: "warehouse",
            name: "Warehouse",
            code: "WH",
            description: "Warehouse operations, stock movement and physical handling"
        },

        {
            id: "scanning-catalog",
            name: "Scanning / Catalog",
            code: "SC",
            description: "Book scanning, ISBN processing and catalog preparation"
        },

        {
            id: "listing-inventory",
            name: "Listing / Inventory",
            code: "LI",
            description: "Website listings, inventory control and stock accuracy"
        },

        {
            id: "digital-marketing",
            name: "Digital Marketing",
            code: "DM",
            description: "Campaigns, social media, promotions and digital activities"
        },

        {
            id: "it-software",
            name: "IT / Software Development",
            code: "IT",
            description: "Software systems, website, automation and technical support"
        },

        {
            id: "finance",
            name: "Finance",
            code: "FIN",
            description: "Payments, accounts, reconciliation and financial activities"
        },

        {
            id: "book-fair-events",
            name: "Book Fair / Events",
            code: "BF",
            description: "Book fairs, events, logistics and event coordination"
        },

        {
            id: "books-procurement",
            name: "Books & Supply Procurement",
            code: "PROC",
            description: "Book sourcing, supplier coordination and procurement"
        },

        {
            id: "hr",
            name: "HR",
            code: "HR",
            description: "People, attendance, recruitment and HR activities"
        },

        {
            id: "data-analysis",
            name: "Data Analysis",
            code: "DA",
            description: "Reports, data processing, analysis and business insights"
        },

        {
            id: "software-testing",
            name: "Software Testing",
            code: "QA",
            description: "Testing, bugs, quality assurance and verification"
        },

        {
            id: "product-development",
            name: "Product Development",
            code: "PD",
            description: "New products, features, process improvements and development"
        }

    ],

    STATUSES: [
        "Open",
        "In Progress",
        "Blocked",
        "Completed"
    ],

    PRIORITIES: [
        "High",
        "Medium",
        "Low"
    ]

};


/* =========================================================
   GLOBAL DATA
========================================================= */

let operationsData = {

    tasks: [],

    followups: [],

    activities: [],

    settings: {

        lastUpdated: null,

        version: "1.0"

    }

};


/* =========================================================
   DOM HELPERS
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


function query(selector) {

    return document.querySelector(selector);

}


function queryAll(selector) {

    return document.querySelectorAll(selector);

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadData();

    initializeLogin();

    initializeNavigation();

    initializeButtons();

    initializeFilters();

    initializeTaskForm();

    initializeModal();

    updateCurrentDate();

    renderApplication();

});


/* =========================================================
   STORAGE
========================================================= */

function loadData() {

    try {

        const savedData =
            localStorage.getItem(APP_CONFIG.STORAGE_KEY);

        if (savedData) {

            const parsed =
                JSON.parse(savedData);

            operationsData = {

                tasks: Array.isArray(parsed.tasks)
                    ? parsed.tasks
                    : [],

                followups: Array.isArray(parsed.followups)
                    ? parsed.followups
                    : [],

                activities: Array.isArray(parsed.activities)
                    ? parsed.activities
                    : [],

                settings: parsed.settings || {
                    version: "1.0",
                    lastUpdated: null
                }

            };

        }

    } catch (error) {

        console.error(
            "Unable to load saved data:",
            error
        );

    }

}


function saveData() {

    operationsData.settings.lastUpdated =
        new Date().toISOString();

    localStorage.setItem(

        APP_CONFIG.STORAGE_KEY,

        JSON.stringify(operationsData)

    );

}


/* =========================================================
   LOGIN
========================================================= */

function initializeLogin() {

    const loginScreen =
        query(".login-screen");

    const loginButton =
        query(".login-button");

    const passwordInput =
        query("#password");

    const loginError =
        query(".login-error");


    if (!loginScreen) {

        return;

    }


    const loggedIn =
        localStorage.getItem(
            APP_CONFIG.LOGIN_KEY
        );


    if (loggedIn === "true") {

        loginScreen.style.display =
            "none";

    }


    if (loginButton) {

        loginButton.addEventListener(
            "click",
            performLogin
        );

    }


    if (passwordInput) {

        passwordInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    performLogin();

                }

            }
        );

    }


    function performLogin() {

        const password =
            passwordInput
                ? passwordInput.value
                : "";


        if (password === APP_CONFIG.PASSWORD) {

            localStorage.setItem(
                APP_CONFIG.LOGIN_KEY,
                "true"
            );

            loginScreen.style.display =
                "none";

            showNotification(
                "Login successful",
                "Operations dashboard is ready."
            );

            renderApplication();

        } else {

            if (loginError) {

                loginError.textContent =
                    "Incorrect password. Please try again.";

                loginError.classList.add(
                    "show"
                );

            }

            if (passwordInput) {

                passwordInput.value = "";

                passwordInput.focus();

            }

        }

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem(
        APP_CONFIG.LOGIN_KEY
    );

    location.reload();

}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    queryAll(".nav-item")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        button.dataset.page ||
                        button.getAttribute("data-page");


                    if (!target) {

                        return;

                    }


                    navigateTo(target);

                }
            );

        });


    const menuToggle =
        query(".menu-toggle");

    const sidebar =
        query(".sidebar");


    if (menuToggle && sidebar) {

        menuToggle.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "mobile-open"
                );

            }
        );

    }

}


function navigateTo(pageId) {

    queryAll(".page")
        .forEach(function (page) {

            page.classList.remove(
                "active-page"
            );

        });


    const targetPage =
        getElement(pageId);


    if (targetPage) {

        targetPage.classList.add(
            "active-page"
        );

    }


    queryAll(".nav-item")
        .forEach(function (item) {

            item.classList.remove(
                "active"
            );


            const itemPage =
                item.dataset.page ||
                item.getAttribute("data-page");


            if (itemPage === pageId) {

                item.classList.add(
                    "active"
                );

            }

        });


    updatePageHeader(pageId);

    renderApplication();


    const sidebar =
        query(".sidebar");


    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );

    }

}


function updatePageHeader(pageId) {

    const title =
        getElement("pageTitle");

    const subtitle =
        getElement("pageSubtitle");


    const pages = {

        dashboard: [
            "Operations Dashboard",
            "Monitor tasks, priorities, follow-ups and department performance."
        ],

        tasksPage: [
            "All Tasks",
            "Central view of every operational task across all departments."
        ],

        followupsPage: [
            "Follow-ups",
            "Track pending communication, commitments and next actions."
        ],

        departmentsPage: [
            "Departments",
            "Monitor workload and activity across all 14 departments."
        ],

        reportsPage: [
            "Reports & Analysis",
            "Understand operational performance and identify areas requiring attention."
        ],

        activityPage: [
            "Activity Log",
            "Track changes and actions performed inside the operations system."
        ],

        settingsPage: [
            "Settings",
            "Manage system information and operational preferences."
        ]

    };


    if (pages[pageId]) {

        if (title) {

            title.textContent =
                pages[pageId][0];

        }

        if (subtitle) {

            subtitle.textContent =
                pages[pageId][1];

        }

    }

}


/* =========================================================
   BUTTONS
========================================================= */

function initializeButtons() {

    queryAll(
        "[data-action='logout']"
    )
    .forEach(function (button) {

        button.addEventListener(
            "click",
            logout
        );

    });


    queryAll(
        "[data-action='add-task']"
    )
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                openTaskModal();

            }
        );

    });


    queryAll(
        "[data-action='export']"
    )
    .forEach(function (button) {

        button.addEventListener(
            "click",
            exportData
        );

    });

}


/* =========================================================
   MODAL
========================================================= */

let editingTaskId = null;


function initializeModal() {

    const overlay =
        query(".modal-overlay");

    const closeButton =
        query(".modal-close");


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeTaskModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === overlay
                ) {

                    closeTaskModal();

                }

            }
        );

    }

}


function openTaskModal(taskId = null) {

    const overlay =
        query(".modal-overlay");


    if (!overlay) {

        showNotification(
            "Task form unavailable",
            "Please check the HTML structure."
        );

        return;

    }


    editingTaskId = taskId;


    populateDepartmentSelect();

    populateStatusSelect();

    populatePrioritySelect();


    const form =
        getElement("taskForm");


    if (form) {

        form.reset();

    }


    if (taskId) {

        const task =
            operationsData.tasks.find(
                function (item) {

                    return item.id === taskId;

                }
            );


        if (task) {

            fillTaskForm(task);

        }

    }


    overlay.style.display =
        "flex";

}


function closeTaskModal() {

    const overlay =
        query(".modal-overlay");


    if (overlay) {

        overlay.style.display =
            "none";

    }


    editingTaskId = null;

}


function populateDepartmentSelect() {

    const select =
        getElement("taskDepartment");


    if (!select) {

        return;

    }


    select.innerHTML =
        '<option value="">Select department</option>';


    APP_CONFIG.DEPARTMENTS
        .forEach(function (department) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                department.id;

            option.textContent =
                department.name;

            select.appendChild(
                option
            );

        });

}


function populateStatusSelect() {

    const select =
        getElement("taskStatus");


    if (!select) {

        return;

    }


    select.innerHTML = "";


    APP_CONFIG.STATUSES
        .forEach(function (status) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                status;

            option.textContent =
                status;

            select.appendChild(
                option
            );

        });

}


function populatePrioritySelect() {

    const select =
        getElement("taskPriority");


    if (!select) {

        return;

    }


    select.innerHTML = "";


    APP_CONFIG.PRIORITIES
        .forEach(function (priority) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                priority;

            option.textContent =
                priority;

            select.appendChild(
                option
            );

        });

}


/* =========================================================
   TASK FORM
========================================================= */

function initializeTaskForm() {

    const form =
        getElement("taskForm");


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            saveTaskFromForm();

        }
    );

}


function fillTaskForm(task) {

    setValue(
        "taskTitle",
        task.title
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
        task.priority
    );

    setValue(
        "taskStatus",
        task.status
    );

    setValue(
        "taskDueDate",
        task.dueDate
    );

    setValue(
        "taskDescription",
        task.description
    );

    setValue(
        "taskFollowup",
        task.followupDate
    );

    setValue(
        "taskRemarks",
        task.remarks
    );

}


function setValue(id, value) {

    const element =
        getElement(id);


    if (element) {

        element.value =
            value || "";

    }

}


function getValue(id) {

    const element =
        getElement(id);


    return element
        ? element.value.trim()
        : "";

}


/* =========================================================
   SAVE TASK
========================================================= */

function saveTaskFromForm() {

    const title =
        getValue("taskTitle");

    const department =
        getValue("taskDepartment");

    const assignedTo =
        getValue("taskAssignedTo");

    const priority =
        getValue("taskPriority");

    const status =
        getValue("taskStatus");

    const dueDate =
        getValue("taskDueDate");

    const description =
        getValue("taskDescription");

    const followupDate =
        getValue("taskFollowup");

    const remarks =
        getValue("taskRemarks");


    if (!title) {

        showNotification(
            "Task title required",
            "Please enter the task name."
        );

        return;

    }


    if (!department) {

        showNotification(
            "Department required",
            "Please select the responsible department."
        );

        return;

    }


    const departmentInfo =
        getDepartment(
            department
        );


    if (editingTaskId) {

        const task =
            operationsData.tasks.find(
                function (item) {

                    return item.id === editingTaskId;

                }
            );


        if (task) {

            task.title =
                title;

            task.department =
                department;

            task.assignedTo =
                assignedTo;

            task.priority =
                priority || "Medium";

            task.status =
                status || "Open";

            task.dueDate =
                dueDate;

            task.description =
                description;

            task.followupDate =
                followupDate;

            task.remarks =
                remarks;

            task.updatedAt =
                new Date().toISOString();

            addActivity(
                "Task updated",
                `${title} was updated under ${departmentInfo ? departmentInfo.name : department}.`
            );

        }

    } else {

        const newTask = {

            id:
                generateId("TASK"),

            taskNumber:
                generateTaskNumber(),

            title,

            department,

            departmentName:
                departmentInfo
                    ? departmentInfo.name
                    : department,

            assignedTo,

            priority:
                priority || "Medium",

            status:
                status || "Open",

            dueDate,

            description,

            followupDate,

            remarks,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        operationsData.tasks.push(
            newTask
        );


        addActivity(
            "New task created",
            `${title} was added to ${departmentInfo ? departmentInfo.name : department}.`
        );

    }


    saveData();

    closeTaskModal();

    renderApplication();

    showNotification(
        editingTaskId
            ? "Task updated"
            : "Task created",
        "The operations database has been updated."
    );

}


/* =========================================================
   TASK NUMBERS
========================================================= */

function generateTaskNumber() {

    const number =
        operationsData.tasks.length + 1;

    return "OPS-" +
        String(number).padStart(
            5,
            "0"
        );

}


/* =========================================================
   ID
========================================================= */

function generateId(prefix) {

    return prefix +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8);

}


/* =========================================================
   DEPARTMENT HELPERS
========================================================= */

function getDepartment(id) {

    return APP_CONFIG.DEPARTMENTS.find(
        function (department) {

            return department.id === id;

        }
    );

}


function getDepartmentName(id) {

    const department =
        getDepartment(id);


    return department
        ? department.name
        : id || "Unassigned";

}


/* =========================================================
   FILTERS
========================================================= */

function initializeFilters() {

    queryAll(
        "[data-filter]"
    )
    .forEach(function (element) {

        element.addEventListener(
            "input",
            renderApplication
        );

        element.addEventListener(
            "change",
            renderApplication
        );

    });

}


function getFilteredTasks() {

    let tasks =
        [...operationsData.tasks];


    const search =
        getFilterValue(
            "search"
        )
        .toLowerCase();


    const department =
        getFilterValue(
            "department"
        );


    const status =
        getFilterValue(
            "status"
        );


    const priority =
        getFilterValue(
            "priority"
        );


    if (search) {

        tasks =
            tasks.filter(
                function (task) {

                    return (

                        String(task.title || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        String(task.taskNumber || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        String(task.assignedTo || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        getDepartmentName(
                            task.department
                        )
                        .toLowerCase()
                        .includes(search)

                    );

                }
            );

    }


    if (department) {

        tasks =
            tasks.filter(
                function (task) {

                    return task.department ===
                        department;

                }
            );

    }


    if (status) {

        tasks =
            tasks.filter(
                function (task) {

                    return task.status ===
                        status;

                }
            );

    }


    if (priority) {

        tasks =
            tasks.filter(
                function (task) {

                    return task.priority ===
                        priority;

                }
            );

    }


    return tasks;

}


function getFilterValue(name) {

    const element =
        query(
            `[data-filter="${name}"]`
        );


    return element
        ? element.value
        : "";

}


/* =========================================================
   OVERDUE
========================================================= */

function isOverdue(task) {

    if (
        !task.dueDate ||
        task.status === "Completed"
    ) {

        return false;

    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const due =
        new Date(
            task.dueDate
        );

    due.setHours(
        0,
        0,
        0,
        0
    );


    return due < today;

}


/* =========================================================
   STATUS DISPLAY
========================================================= */

function getDisplayStatus(task) {

    if (isOverdue(task)) {

        return "Overdue";

    }


    return task.status ||
        "Open";

}


function getStatusClass(status) {

    const classes = {

        "Open":
            "status-open",

        "In Progress":
            "status-progress",

        "Blocked":
            "status-blocked",

        "Completed":
            "status-completed",

        "Overdue":
            "status-overdue"

    };


    return classes[status] ||
        "status-open";

}


function getPriorityClass(priority) {

    const classes = {

        "High":
            "priority-high",

        "Medium":
            "priority-medium",

        "Low":
            "priority-low"

    };


    return classes[priority] ||
        "priority-medium";

}


/* =========================================================
   MAIN RENDER
========================================================= */

function renderApplication() {

    renderDashboard();

    renderTasks();

    renderFollowups();

    renderDepartments();

    renderReports();

    renderActivity();

    renderSettings();

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const tasks =
        operationsData.tasks;


    const total =
        tasks.length;


    const open =
        tasks.filter(
            task =>
                task.status === "Open"
        ).length;


    const progress =
        tasks.filter(
            task =>
                task.status === "In Progress"
        ).length;


    const blocked =
        tasks.filter(
            task =>
                task.status === "Blocked"
        ).length;


    const completed =
        tasks.filter(
            task =>
                task.status === "Completed"
        ).length;


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


    renderPrioritySummary();

    renderDepartmentPerformance();

}


/* =========================================================
   PRIORITY SUMMARY
========================================================= */

function renderPrioritySummary() {

    const container =
        getElement(
            "prioritySummary"
        );


    if (!container) {

        return;

    }


    const high =
        operationsData.tasks.filter(
            task =>
                task.priority === "High"
                &&
                task.status !== "Completed"
        ).length;


    const medium =
        operationsData.tasks.filter(
            task =>
                task.priority === "Medium"
                &&
                task.status !== "Completed"
        ).length;


    const low =
        operationsData.tasks.filter(
            task =>
                task.priority === "Low"
                &&
                task.status !== "Completed"
        ).length;


    container.innerHTML = `

        <div>
            <span>High Priority</span>
            <strong>${high}</strong>
        </div>

        <div>
            <span>Medium Priority</span>
            <strong>${medium}</strong>
        </div>

        <div>
            <span>Low Priority</span>
            <strong>${low}</strong>
        </div>

    `;

}


/* =========================================================
   DEPARTMENT PERFORMANCE
========================================================= */

function renderDepartmentPerformance() {

    const container =
        getElement(
            "departmentPerformance"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    APP_CONFIG.DEPARTMENTS
        .forEach(function (department) {

            const tasks =
                operationsData.tasks.filter(
                    task =>
                        task.department ===
                        department.id
                );


            const completed =
                tasks.filter(
                    task =>
                        task.status ===
                        "Completed"
                ).length;


            const percentage =
                tasks.length === 0
                    ? 0
                    : Math.round(
                        (
                            completed /
                            tasks.length
                        ) * 100
                    );


            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "department-performance-item";


            item.innerHTML = `

                <div class="department-performance-header">

                    <span class="department-performance-name">
                        ${escapeHtml(department.name)}
                    </span>

                    <span class="department-performance-number">
                        ${completed}/${tasks.length}
                    </span>

                </div>

                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        style="width:${percentage}%"
                    ></div>

                </div>

            `;


            container.appendChild(
                item
            );

        });

}


/* =========================================================
   TASK TABLE
========================================================= */

function renderTasks() {

    const tableBody =
        getElement(
            "tasksTableBody"
        );


    if (!tableBody) {

        return;

    }


    const tasks =
        getFilteredTasks();


    tableBody.innerHTML = "";


    if (!tasks.length) {

        tableBody.innerHTML = `

            <tr>
                <td
                    colspan="10"
                    class="empty-table"
                >
                    No tasks found.
                    Create a task or change your filters.
                </td>
            </tr>

        `;

        return;

    }


    tasks
        .sort(
            function (a, b) {

                return (
                    new Date(
                        b.createdAt
                    )
                    -
                    new Date(
                        a.createdAt
                    )
                );

            }
        )
        .forEach(
            function (task) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const displayStatus =
                    getDisplayStatus(
                        task
                    );


                row.innerHTML = `

                    <td>
                        <strong>
                            ${escapeHtml(
                                task.taskNumber || ""
                            )}
                        </strong>
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                task.title
                            )}
                        </strong>

                        ${
                            task.description
                                ? `
                                <div style="
                                    color:#9ca3af;
                                    font-size:9px;
                                    margin-top:2px;
                                ">
                                    ${escapeHtml(
                                        shorten(
                                            task.description,
                                            60
                                        )
                                    )}
                                </div>
                                `
                                : ""
                        }
                    </td>

                    <td>
                        ${escapeHtml(
                            getDepartmentName(
                                task.department
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            task.assignedTo ||
                            "—"
                        )}
                    </td>

                    <td>
                        <span class="priority-badge ${getPriorityClass(task.priority)}">
                            ${escapeHtml(
                                task.priority ||
                                "Medium"
                            )}
                        </span>
                    </td>

                    <td>
                        <span class="status-badge ${getStatusClass(displayStatus)}">
                            ${escapeHtml(
                                displayStatus
                            )}
                        </span>
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
                        ${formatDateTime(
                            task.updatedAt
                        )}
                    </td>

                    <td>

                        <button
                            class="table-action"
                            title="Edit"
                            onclick="openTaskModal('${task.id}')"
                        >
                            ✎
                        </button>

                        <button
                            class="table-action"
                            title="Delete"
                            onclick="deleteTask('${task.id}')"
                        >
                            ×
                        </button>

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );

}


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(taskId) {

    const task =
        operationsData.tasks.find(
            item =>
                item.id === taskId
        );


    if (!task) {

        return;

    }


    const confirmed =
        confirm(
            `Delete task "${task.title}"?`
        );


    if (!confirmed) {

        return;

    }


    operationsData.tasks =
        operationsData.tasks.filter(
            item =>
                item.id !== taskId
        );


    addActivity(
        "Task deleted",
        `${task.title} was removed from the operations tracker.`
    );


    saveData();

    renderApplication();

    showNotification(
        "Task deleted",
        "The task has been removed."
    );

}


/* =========================================================
   FOLLOW-UPS
========================================================= */

function renderFollowups() {

    const tableBody =
        getElement(
            "followupsTableBody"
        );


    if (!tableBody) {

        return;

    }


    const followupTasks =
        operationsData.tasks.filter(
            task =>
                task.followupDate
        );


    tableBody.innerHTML = "";


    if (!followupTasks.length) {

        tableBody.innerHTML = `

            <tr>
                <td
                    colspan="7"
                    class="empty-table"
                >
                    No follow-ups recorded yet.
                </td>
            </tr>

        `;

        return;

    }


    followupTasks
        .sort(
            function (a, b) {

                return (
                    new Date(
                        a.followupDate
                    )
                    -
                    new Date(
                        b.followupDate
                    )
                );

            }
        )
        .forEach(
            function (task) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        <strong>
                            ${escapeHtml(
                                task.taskNumber
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            task.title
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            getDepartmentName(
                                task.department
                            )
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            task.followupDate
                        )}
                    </td>

                    <td>
                        <span class="status-badge ${getStatusClass(getDisplayStatus(task))}">
                            ${escapeHtml(
                                getDisplayStatus(task)
                            )}
                        </span>
                    </td>

                    <td>
                        ${escapeHtml(
                            task.remarks ||
                            "No remarks"
                        )}
                    </td>

                    <td>

                        <button
                            class="table-action"
                            onclick="openTaskModal('${task.id}')"
                        >
                            ✎
                        </button>

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );


    renderFollowupNumbers();

}


function renderFollowupNumbers() {

    const tasks =
        operationsData.tasks
            .filter(
                task =>
                    task.followupDate
            );


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const upcoming =
        tasks.filter(
            task => {

                const date =
                    new Date(
                        task.followupDate
                    );

                date.setHours(
                    0,
                    0,
                    0,
                    0
                );

                return (
                    date >= today &&
                    task.status !==
                        "Completed"
                );

            }
        ).length;


    const overdue =
        tasks.filter(
            task => {

                const date =
                    new Date(
                        task.followupDate
                    );

                date.setHours(
                    0,
                    0,
                    0,
                    0
                );

                return (
                    date < today &&
                    task.status !==
                        "Completed"
                );

            }
        ).length;


    setText(
        "totalFollowups",
        tasks.length
    );

    setText(
        "upcomingFollowups",
        upcoming
    );

    setText(
        "overdueFollowups",
        overdue
    );

}


/* =========================================================
   DEPARTMENTS
========================================================= */

function renderDepartments() {

    const container =
        getElement(
            "departmentsGrid"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    APP_CONFIG.DEPARTMENTS
        .forEach(function (department) {

            const tasks =
                operationsData.tasks.filter(
                    task =>
                        task.department ===
                        department.id
                );


            const pending =
                tasks.filter(
                    task =>
                        task.status !==
                        "Completed"
                ).length;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "department-card";


            card.innerHTML = `

                <div class="department-card-top">

                    <div class="department-card-code">
                        ${escapeHtml(
                            department.code
                        )}
                    </div>

                    <div class="department-card-count">
                        ${tasks.length}
                    </div>

                </div>

                <h3>
                    ${escapeHtml(
                        department.name
                    )}
                </h3>

                <p>
                    ${escapeHtml(
                        department.description
                    )}
                </p>

                <div style="
                    margin-top:12px;
                    color:#6b7280;
                    font-size:9px;
                ">
                    ${pending} pending
                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    filterByDepartment(
                        department.id
                    );

                }
            );


            container.appendChild(
                card
            );

        });

}


function filterByDepartment(
    departmentId
) {

    const departmentFilter =
        query(
            '[data-filter="department"]'
        );


    if (departmentFilter) {

        departmentFilter.value =
            departmentId;

    }


    navigateTo(
        "tasksPage"
    );

}


/* =========================================================
   REPORTS
========================================================= */

function renderReports() {

    const total =
        operationsData.tasks.length;


    const completed =
        operationsData.tasks.filter(
            task =>
                task.status ===
                "Completed"
        ).length;


    const completionRate =
        total === 0
            ? 0
            : Math.round(
                completed /
                total *
                100
            );


    const overdue =
        operationsData.tasks.filter(
            task =>
                isOverdue(task)
        ).length;


    const blocked =
        operationsData.tasks.filter(
            task =>
                task.status ===
                "Blocked"
        ).length;


    setText(
        "completionRate",
        `${completionRate}%`
    );

    setText(
        "reportTotalTasks",
        total
    );

    setText(
        "reportOverdue",
        overdue
    );

    setText(
        "reportBlocked",
        blocked
    );


    renderDepartmentReport();

}


function renderDepartmentReport() {

    const container =
        getElement(
            "departmentReport"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    APP_CONFIG.DEPARTMENTS
        .forEach(function (department) {

            const tasks =
                operationsData.tasks.filter(
                    task =>
                        task.department ===
                        department.id
                );


            const completed =
                tasks.filter(
                    task =>
                        task.status ===
                        "Completed"
                ).length;


            const overdue =
                tasks.filter(
                    task =>
                        isOverdue(task)
                ).length;


            const blocked =
                tasks.filter(
                    task =>
                        task.status ===
                        "Blocked"
                ).length;


            const rate =
                tasks.length
                    ? Math.round(
                        completed /
                        tasks.length *
                        100
                    )
                    : 0;


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHtml(
                            department.name
                        )}
                    </strong>
                </td>

                <td>
                    ${tasks.length}
                </td>

                <td>
                    ${completed}
                </td>

                <td>
                    ${blocked}
                </td>

                <td>
                    ${overdue}
                </td>

                <td>
                    <strong>
                        ${rate}%
                    </strong>
                </td>

            `;


            container.appendChild(
                row
            );

        });

}


/* =========================================================
   ACTIVITY LOG
========================================================= */

function addActivity(
    action,
    description
) {

    operationsData.activities.unshift({

        id:
            generateId("ACT"),

        action,

        description,

        timestamp:
            new Date().toISOString()

    });


    // Keep the activity log manageable.
    if (
        operationsData.activities.length >
        500
    ) {

        operationsData.activities =
            operationsData.activities.slice(
                0,
                500
            );

    }

}


function renderActivity() {

    const container =
        getElement(
            "activityTimeline"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        !operationsData.activities.length
    ) {

        container.innerHTML = `

            <div class="empty-state">
                No activity recorded yet.
            </div>

        `;

        return;

    }


    operationsData.activities
        .slice(0, 30)
        .forEach(
            function (activity) {

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
                            ${escapeHtml(
                                activity.action
                            )}
                        </strong>

                        <p>
                            ${escapeHtml(
                                activity.description
                            )}
                        </p>

                        <div class="activity-time">
                            ${formatDateTime(
                                activity.timestamp
                            )}
                        </div>

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );

}


/* =========================================================
   SETTINGS
========================================================= */

function renderSettings() {

    setText(
        "settingsTaskCount",
        operationsData.tasks.length
    );

    setText(
        "settingsFollowupCount",
        operationsData.tasks.filter(
            task =>
                task.followupDate
        ).length
    );

    setText(
        "settingsDepartmentCount",
        APP_CONFIG.DEPARTMENTS.length
    );

    setText(
        "settingsLastUpdated",
        formatDateTime(
            operationsData.settings.lastUpdated
        )
    );

}


/* =========================================================
   EXPORT DATA
========================================================= */

function exportData() {

    const data =
        JSON.stringify(
            operationsData,
            null,
            2
        );


    const blob =
        new Blob(
            [data],
            {
                type:
                    "application/json"
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
        `usedbookr-operations-backup-${formatFileDate()}.json`;


    document.body.appendChild(
        link
    );


    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );


    showNotification(
        "Backup exported",
        "Your operations data has been downloaded."
    );

}


/* =========================================================
   IMPORT DATA
========================================================= */

function importData(file) {

    if (!file) {

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            try {

                const imported =
                    JSON.parse(
                        event.target.result
                    );


                if (
                    !imported ||
                    !Array.isArray(
                        imported.tasks
                    )
                ) {

                    throw new Error(
                        "Invalid backup file."
                    );

                }


                operationsData =
                    imported;


                saveData();

                renderApplication();


                showNotification(
                    "Backup restored",
                    "Operations data has been restored successfully."
                );


            } catch (error) {

                showNotification(
                    "Import failed",
                    error.message
                );

            }

        };


    reader.readAsText(
        file
    );

}


/* =========================================================
   CLEAR ALL DATA
========================================================= */

function clearAllData() {

    const confirmed =
        confirm(
            "This will permanently delete all tasks, follow-ups and activity history. Continue?"
        );


    if (!confirmed) {

        return;

    }


    operationsData = {

        tasks: [],

        followups: [],

        activities: [],

        settings: {

            lastUpdated: null,

            version: "1.0"

        }

    };


    saveData();

    renderApplication();


    showNotification(
        "Data cleared",
        "The operations tracker is now empty."
    );

}


/* =========================================================
   NOTIFICATION
========================================================= */

let notificationTimer;


function showNotification(
    title,
    message
) {

    const notification =
        query(".notification");


    if (!notification) {

        return;

    }


    const titleElement =
        notification.querySelector(
            "strong"
        );


    const messageElement =
        notification.querySelector(
            "span"
        );


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


    clearTimeout(
        notificationTimer
    );


    notificationTimer =
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
   DATE FUNCTIONS
========================================================= */

function formatDate(dateString) {

    if (!dateString) {

        return "—";

    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

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


function formatDateTime(dateString) {

    if (!dateString) {

        return "—";

    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

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


function formatFileDate() {

    const date =
        new Date();


    return date
        .toISOString()
        .slice(
            0,
            10
        );

}


function updateCurrentDate() {

    const element =
        getElement(
            "currentDate"
        );


    if (element) {

        element.textContent =
            new Date().toLocaleDateString(
                "en-IN",
                {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    }

}


/* =========================================================
   GENERAL HELPERS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        getElement(id);


    if (element) {

        element.textContent =
            value;

    }

}


function shorten(
    text,
    length
) {

    if (!text) {

        return "";

    }


    if (
        text.length <= length
    ) {

        return text;

    }


    return text.substring(
        0,
        length
    ) + "...";

}


function escapeHtml(value) {

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


/* =========================================================
   DEMO DATA
========================================================= */

/*
   This function is intentionally NOT called automatically.

   If you want to test the dashboard with sample tasks,
   open the browser console and run:

       createDemoData();

   Then refresh the page.
*/

function createDemoData() {

    operationsData.tasks = [

        {

            id: generateId("TASK"),

            taskNumber: "OPS-00001",

            title:
                "Prepare B2B school quotation",

            department:
                "b2b-sales",

            departmentName:
                "B2B / Sales",

            assignedTo:
                "Sales Head",

            priority:
                "High",

            status:
                "In Progress",

            dueDate:
                getDateOffset(2),

            description:
                "Prepare quotation for school bulk reading requirement.",

            followupDate:
                getDateOffset(3),

            remarks:
                "Waiting for final quantity confirmation.",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        },

        {

            id: generateId("TASK"),

            taskNumber: "OPS-00002",

            title:
                "Verify warehouse stock",

            department:
                "warehouse",

            departmentName:
                "Warehouse",

            assignedTo:
                "Warehouse Head",

            priority:
                "Medium",

            status:
                "Open",

            dueDate:
                getDateOffset(5),

            description:
                "Verify physical stock against inventory records.",

            followupDate:
                getDateOffset(5),

            remarks:
                "",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        },

        {

            id: generateId("TASK"),

            taskNumber: "OPS-00003",

            title:
                "Resolve website listing issue",

            department:
                "listing-inventory",

            departmentName:
                "Listing / Inventory",

            assignedTo:
                "Listing Team",

            priority:
                "High",

            status:
                "Blocked",

            dueDate:
                getDateOffset(-2),

            description:
                "Investigate books not appearing correctly on the website.",

            followupDate:
                getDateOffset(1),

            remarks:
                "Requires IT assistance.",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        }

    ];


    operationsData.activities = [

        {

            id:
                generateId("ACT"),

            action:
                "Demo data created",

            description:
                "Sample operational tasks were added for testing.",

            timestamp:
                new Date().toISOString()

        }

    ];


    saveData();

    renderApplication();

    showNotification(
        "Demo data created",
        "Sample tasks have been added."
    );

}


function getDateOffset(days) {

    const date =
        new Date();


    date.setDate(
        date.getDate() + days
    );


    return date
        .toISOString()
        .split("T")[0];

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

/*
   These functions are deliberately attached to window
   because table buttons use onclick="..." in generated HTML.
*/

window.openTaskModal =
    openTaskModal;

window.closeTaskModal =
    closeTaskModal;

window.deleteTask =
    deleteTask;

window.logout =
    logout;

window.exportData =
    exportData;

window.importData =
    importData;

window.clearAllData =
    clearAllData;

window.createDemoData =
    createDemoData;


/* =========================================================
   END OF SCRIPT
========================================================= */
