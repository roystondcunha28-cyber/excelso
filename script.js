/* =========================================================
   USEDBOOKR OPERATIONS MANAGEMENT SYSTEM
   FRONTEND JAVASCRIPT
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbyrOAQZ--7aDiAHv0ey60C8-xXuTKDAhOVDQjUOc-uiGdgNnpuJ97nL4m-ABkw0Znf3ig/exec";


const DEPARTMENTS = [

    "B2B - Sales",

    "Customer Support",

    "Warehouse",

    "Scanning - Catalog",

    "Listing - Inventory",

    "Digital Marketing",

    "IT - Software Development",

    "Finance",

    "Book Fair - Events",

    "Books and Supply Procurement",

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

let editingTaskId = "";

let currentUser = null;


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

        initializeTaskModalUX();

        initializeLogout();

        initializeLogin();

        initializeExports();

        checkLogin();

    }
);


/* =========================================================
   LOGIN / AUTHENTICATION
========================================================= */

function initializeLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "loginUsername"
                )?.value
                ?.trim() || "";


            const password =
                document.getElementById(
                    "loginPassword"
                )?.value || "";


            const error =
                document.getElementById(
                    "loginError"
                );


            if (error) {

                error.classList.remove(
                    "show"
                );

                error.textContent = "";

            }


            if (
                !username ||
                !password
            ) {

                if (error) {

                    error.textContent =
                        "Please enter your username and password.";

                    error.classList.add(
                        "show"
                    );

                }

                return;

            }


            try {

                const result =
                    await apiRequest(
                        "login",
                        {
                            username:
                                username,

                            password:
                                password
                        }
                    );


                console.log(
                    "LOGIN RESPONSE:",
                    result
                );


                if (
                    !result ||
                    !result.success ||
                    !result.user
                ) {

                    if (error) {

                        error.textContent =
                            result?.message ||
                            "Invalid username or password.";

                        error.classList.add(
                            "show"
                        );

                    }

                    return;

                }


                /*
                 * Store authenticated user
                 */

                currentUser =
                    result.user;


                sessionStorage.setItem(
                    "usedbookrCurrentUser",
                    JSON.stringify(
                        currentUser
                    )
                );


                sessionStorage.setItem(
                    "usedbookrOperationsLogin",
                    "true"
                );


                /*
                 * Hide login screen
                 */

                hideLogin();


                /*
                 * Load tasks only after
                 * authentication succeeds.
                 */

                await loadTasks();


                /*
                 * Apply user permissions.
                 */

                applyUserAccess();

            }

            catch (err) {

                console.error(
                    "LOGIN ERROR:",
                    err
                );


                if (error) {

                    error.textContent =
                        "Unable to connect to the authentication server.";

                    error.classList.add(
                        "show"
                    );

                }

            }

        }
    );

}


/* =========================================================
   CHECK LOGIN SESSION
========================================================= */

function checkLogin() {

    const loggedIn =
        sessionStorage.getItem(
            "usedbookrOperationsLogin"
        );


    const savedUser =
        sessionStorage.getItem(
            "usedbookrCurrentUser"
        );


    if (
        loggedIn === "true" &&
        savedUser
    ) {

        try {

            currentUser =
                JSON.parse(
                    savedUser
                );


            hideLogin();


            /*
             * Load current data from
             * Google Sheets.
             */

            loadTasks();


            applyUserAccess();

        }

        catch (error) {

            console.error(
                "SESSION RESTORE ERROR:",
                error
            );


            logoutUser();

        }

    }

    else {

        showLogin();

    }

}


/* =========================================================
   HIDE LOGIN
========================================================= */

function hideLogin() {

    const login =
        document.getElementById(
            "loginScreen"
        );


    const app =
        document.getElementById(
            "app"
        );


    if (login) {

        login.style.display =
            "none";

    }


    if (app) {

        app.style.display =
            "flex";

    }

}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    const login =
        document.getElementById(
            "loginScreen"
        );


    const app =
        document.getElementById(
            "app"
        );


    if (login) {

        login.style.display =
            "flex";

    }


    if (app) {

        app.style.display =
            "none";

    }

}


/* =========================================================
   LOGGED-IN USER PROFILE
========================================================= */

function updateLoggedInUserProfile() {

    if (!currentUser) {

        console.warn(
            "No current user available for profile display."
        );

        return;

    }


    const avatar =
        document.getElementById(
            "loggedUserAvatar"
        );


    const nameElement =
        document.getElementById(
            "loggedUserName"
        );


    const roleElement =
        document.getElementById(
            "loggedUserRole"
        );


    const name =
        String(
            currentUser.name || ""
        ).trim();


    const role =
        String(
            currentUser.role || ""
        ).trim();


    const username =
        String(
            currentUser.username || ""
        ).trim();


    /*
     * Display name
     */

    if (nameElement) {

        nameElement.textContent =
            name ||
            username ||
            "User";

    }


    /*
     * Display role
     */

    if (roleElement) {

        roleElement.textContent =
            role ||
            "User";

    }


    /*
     * Generate initials.
     *
     * Examples:
     *
     * Mr.Tarun → MT
     * Royston → R
     * Sundara → S
     */

    let initials = "";


    if (name) {

        const words =
            name
                .replace(
                    /\./g,
                    " "
                )
                .split(
                    /\s+/
                )
                .filter(
                    function (word) {

                        return (
                            word.length >
                            0
                        );

                    }
                );


        if (
            words.length >= 2
        ) {

            initials =
                words[0].charAt(0) +
                words[
                    words.length - 1
                ].charAt(0);

        }

        else {

            initials =
                words[0]
                    .substring(
                        0,
                        2
                    );

        }

    }


    if (!initials) {

        initials =
            username
                .substring(
                    0,
                    2
                );

    }


    if (avatar) {

        avatar.textContent =
            initials.toUpperCase();

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

            logoutUser();

        }
    );

}


function logoutUser() {

    currentUser =
        null;


    tasks =
        [];


    sessionStorage.removeItem(
        "usedbookrOperationsLogin"
    );


    sessionStorage.removeItem(
        "usedbookrCurrentUser"
    );


    showLogin();


    /*
     * Clear login fields.
     */

    const username =
        document.getElementById(
            "loginUsername"
        );


    const password =
        document.getElementById(
            "loginPassword"
        );


    if (username) {

        username.value = "";

    }


    if (password) {

        password.value = "";

    }

}


/* =========================================================
   USER ACCESS
========================================================= */

function applyUserAccess() {

    if (!currentUser) return;


    console.log(
        "AUTHENTICATED USER:",
        currentUser
    );


    updateLoggedInUserProfile();

}


/* =========================================================
   DEPARTMENTS
========================================================= */

function initializeDepartments() {

    const select =
        document.getElementById(
            "taskDepartment"
        );


    const filter =
        document.getElementById(
            "departmentFilter"
        );


    if (select) {

        select.innerHTML =
            '<option value="">Select Department</option>';


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


    if (filter) {

        filter.innerHTML =
            '<option value="">All Departments</option>';


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


                filter.appendChild(
                    option
                );

            }
        );

    }


    renderDepartmentCards();

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
        new Date()
            .toLocaleDateString(
                "en-IN",
                {
                    day:
                        "2-digit",

                    month:
                        "short",

                    year:
                        "numeric"
                }
            );

}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
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

                            showPage(
                                page
                            );

                        }

                    }
                );

            }
        );


    const menu =
        document.getElementById(
            "menuToggle"
        );


    if (menu) {

        menu.addEventListener(
            "click",
            function () {

                document
                    .querySelector(
                        ".sidebar"
                    )
                    ?.classList
                    .toggle(
                        "sidebar-open"
                    );

            }
        );

    }

}


/* =========================================================
   SHOW PAGE
========================================================= */

function showPage(
    page
) {

    currentPage =
        page;


    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            function (section) {

                section.classList.remove(
                    "active-page"
                );

            }
        );


    const target =
        document.getElementById(
            page +
            "Page"
        );


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


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


    updatePageHeader(
        page
    );


    if (
        page ===
        "dashboard"
    ) {

        updateDashboard();

    }


    if (
        page ===
        "tasks"
    ) {

        renderTasksTable();

    }


    if (
        page ===
        "followups"
    ) {

        renderFollowups();

    }


    if (
        page ===
        "activity"
    ) {

        renderActivity();

    }

}


/* =========================================================
   PAGE HEADER
========================================================= */

function updatePageHeader(
    page
) {

    const title =
        document.getElementById(
            "pageTitle"
        );


    const subtitle =
        document.getElementById(
            "pageSubtitle"
        );


    const names = {

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

        activity: [
            "Activity",
            "Recent operational activity"
        ]

    };


    if (
        !names[page]
    ) {

        return;

    }


    if (title) {

        title.textContent =
            names[page][0];

    }


    if (subtitle) {

        subtitle.textContent =
            names[page][1];

    }

}
/* =========================================================
   USER TASK ACCESS
========================================================= */

function filterTasksForCurrentUser(
    allTasks
) {

    if (!currentUser) {

        return [];

    }


    const role =
        String(
            currentUser.role || ""
        )
        .trim()
        .toLowerCase();


    /*
     * Full-access roles
     */

    const fullAccessRoles = [

        "founder",

        "admin",

        "administrator",

        "operations head",

        "operations manager",

        "manager",

        "super admin"

    ];


    if (
        fullAccessRoles.includes(
            role
        )
    ) {

        return allTasks;

    }


    /*
     * Get user's departments.
     */

    const allowedDepartments =
        getAllowedDepartments();


    const username =
        String(
            currentUser.username || ""
        )
        .trim()
        .toLowerCase();


    const userName =
        String(
            currentUser.name || ""
        )
        .trim()
        .toLowerCase();


    /*
     * If the user has no department
     * restriction configured, allow
     * the tasks assigned directly
     * to the user.
     */

    return allTasks.filter(
        function (task) {

            const taskDepartment =
                normalizeDepartmentName(
                    task.department
                );


            const assignedTo =
                String(
                    task.assignedTo || ""
                )
                .trim()
                .toLowerCase();


            const departmentMatch =
                allowedDepartments.some(
                    function (department) {

                        return (
                            normalizeDepartmentName(
                                department
                            ) ===
                            taskDepartment
                        );

                    }
                );


            const assignedMatch =
                assignedTo &&
                (
                    assignedTo ===
                    username ||

                    assignedTo ===
                    userName
                );


            return (
                departmentMatch ||
                assignedMatch
            );

        }
    );

}


/* =========================================================
   GET USER DEPARTMENTS
========================================================= */

function getAllowedDepartments() {

    if (!currentUser) {

        return [];

    }


    const result = [];


    const possibleFields = [

        currentUser.department,

        currentUser.departments,

        currentUser.allowedDepartment,

        currentUser.allowedDepartments,

        currentUser.primaryDepartment,

        currentUser.coordinationDepartments

    ];


    possibleFields.forEach(
        function (value) {

            if (
                Array.isArray(
                    value
                )
            ) {

                value.forEach(
                    function (item) {

                        if (
                            item &&
                            !result.includes(
                                item
                            )
                        ) {

                            result.push(
                                item
                            );

                        }

                    }
                );

                return;

            }


            if (
                typeof value ===
                "string"
            ) {

                value
                    .split(
                        /[,|]/
                    )
                    .map(
                        function (item) {

                            return item.trim();

                        }
                    )
                    .filter(
                        Boolean
                    )
                    .forEach(
                        function (item) {

                            if (
                                !result.includes(
                                    item
                                )
                            ) {

                                result.push(
                                    item
                                );

                            }

                        }
                    );

            }

        }
    );


    return result;

}


/* =========================================================
   NORMALIZE TASKS
========================================================= */

function normalizeTasks(
    source
) {

    if (
        !Array.isArray(
            source
        )
    ) {

        return [];

    }


    return source.map(
        function (rawTask) {

            const task =
                rawTask || {};


            return {

                ...task,

                taskId:
                    cleanValue(
                        task.taskId ||
                        task.id ||
                        task.ID
                    ),


                task:
                    cleanValue(
                        task.task ||
                        task.title ||
                        task.taskName ||
                        task.name
                    ),


                description:
                    cleanValue(
                        task.description ||
                        task.details
                    ),


                department:
                    normalizeDepartmentName(
                        task.department ||
                        task.Department
                    ),


                assignedTo:
                    cleanValue(
                        task.assignedTo ||
                        task.assignee ||
                        task.assigned
                    ),


                priority:
                    normalizePriority(
                        task.priority
                    ),


                status:
                    normalizeStatus(
                        task.status
                    ),


                createdDate:
                    task.createdDate ||
                    task.createdAt ||
                    task.dateCreated ||
                    "",


                dueDate:
                    task.dueDate ||
                    task.deadline ||
                    "",


                followupDate:
                    task.followupDate ||
                    task.followUpDate ||
                    task.followup ||
                    "",


                lastAction:
                    cleanValue(
                        task.lastAction ||
                        task.action
                    ),


                remarks:
                    cleanValue(
                        task.remarks ||
                        task.remark ||
                        task.notes
                    ),


                updatedBy:
                    cleanValue(
                        task.updatedBy
                    ),


                updatedDate:
                    task.updatedDate ||
                    task.updatedAt ||
                    ""

            };

        }
    );

}


/* =========================================================
   NORMALIZE DEPARTMENT NAME
========================================================= */

function normalizeDepartmentName(
    value
) {

    const department =
        String(
            value || ""
        )
        .trim();


    if (!department) {

        return "";

    }


    /*
     * Match known department names
     * without changing the actual
     * department spelling displayed
     * to the user.
     */

    const match =
        DEPARTMENTS.find(
            function (item) {

                return (
                    item.toLowerCase() ===
                    department.toLowerCase()
                );

            }
        );


    return (
        match ||
        department
    );

}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(
    value
) {

    const status =
        String(
            value || ""
        )
        .trim()
        .toLowerCase();


    if (
        status === "open"
    ) {

        return "Open";

    }


    if (
        status === "in progress" ||
        status === "in-progress" ||
        status === "inprogress"
    ) {

        return "In Progress";

    }


    if (
        status === "completed" ||
        status === "complete" ||
        status === "done"
    ) {

        return "Completed";

    }


    if (
        status === "blocked"
    ) {

        return "Blocked";

    }


    if (
        status === "on hold" ||
        status === "on-hold"
    ) {

        return "On Hold";

    }


    /*
     * Preserve unknown statuses
     * instead of deleting them.
     */

    return (
        value
            ? String(value).trim()
            : "Open"
    );

}


/* =========================================================
   NORMALIZE PRIORITY
========================================================= */

function normalizePriority(
    value
) {

    const priority =
        String(
            value || ""
        )
        .trim()
        .toLowerCase();


    if (
        priority === "high"
    ) {

        return "High";

    }


    if (
        priority === "low"
    ) {

        return "Low";

    }


    if (
        priority === "medium" ||
        priority === "normal"
    ) {

        return "Medium";

    }


    return (
        value
            ? String(value).trim()
            : "Medium"
    );

}


/* =========================================================
   CLEAN VALUE
========================================================= */

function cleanValue(
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
    ).trim();

}


/* =========================================================
   UPDATE ALL VIEWS
========================================================= */

function updateAllViews() {

    updateDashboard();

    renderTasksTable();

    renderFollowups();

    renderActivity();

    renderDepartmentCards();

    updateFollowupSummary();

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

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "Open"
                );

            }
        ).length;


    const inProgress =
        tasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "In Progress"
                );

            }
        ).length;


    const completed =
        tasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "Completed"
                );

            }
        ).length;


    const blocked =
        tasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "Blocked"
                );

            }
        ).length;


    const overdue =
        tasks.filter(
            function (task) {

                return isOverdue(
                    task
                );

            }
        ).length;


    setDashboardValue(
        [
            "totalTasks",
            "totalTaskCount"
        ],
        total
    );


    setDashboardValue(
        [
            "openTasks",
            "openTaskCount"
        ],
        open
    );


    setDashboardValue(
        [
            "inProgressTasks",
            "inProgressTaskCount"
        ],
        inProgress
    );


    setDashboardValue(
        [
            "completedTasks",
            "completedTaskCount"
        ],
        completed
    );


    setDashboardValue(
        [
            "blockedTasks",
            "blockedTaskCount"
        ],
        blocked
    );


    setDashboardValue(
        [
            "overdueTasks",
            "overdueTaskCount"
        ],
        overdue
    );


    renderRecentTasks();

}


/* =========================================================
   SET DASHBOARD VALUE
========================================================= */

function setDashboardValue(
    ids,
    value
) {

    if (
        !Array.isArray(
            ids
        )
    ) {

        ids = [
            ids
        ];

    }


    ids.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value;

            }

        }
    );

}


/* =========================================================
   RECENT TASKS
========================================================= */

function renderRecentTasks() {

    const container =
        document.getElementById(
            "recentTasks"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const recentTasks =
        [...tasks]
            .sort(
                function (a, b) {

                    const dateA =
                        parseDate(
                            a.updatedDate ||
                            a.createdDate
                        );


                    const dateB =
                        parseDate(
                            b.updatedDate ||
                            b.createdDate
                        );


                    return (
                        (dateB?.getTime() || 0) -
                        (dateA?.getTime() || 0)
                    );

                }
            )
            .slice(
                0,
                10
            );


    if (
        !recentTasks.length
    ) {

        container.innerHTML =
            `
            <div class="empty-state">
                No recent tasks.
            </div>
            `;

        return;

    }


    recentTasks.forEach(
        function (task) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "recent-task-item";


            item.innerHTML =
                `
                <div class="recent-task-main">

                    <div class="recent-task-title">
                        ${escapeHTML(
                            task.task ||
                            "Untitled Task"
                        )}
                    </div>

                    <div class="recent-task-meta">

                        ${escapeHTML(
                            task.department ||
                            ""
                        )}

                        ·

                        ${escapeHTML(
                            task.assignedTo ||
                            "Unassigned"
                        )}

                    </div>

                </div>

                <div class="recent-task-status">

                    ${statusBadge(
                        task.status,
                        task
                    )}

                </div>
                `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   FOLLOW-UP SUMMARY
========================================================= */

function updateFollowupSummary() {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    let todayCount =
        0;


    let overdue =
        0;


    let upcoming =
        0;


    tasks.forEach(
        function (task) {

            const date =
                parseDate(
                    task.followupDate
                );


            if (!date) {

                return;

            }


            date.setHours(
                0,
                0,
                0,
                0
            );


            if (
                date.getTime() ===
                today.getTime()
            ) {

                todayCount++;

            }

            else if (
                date <
                today
            ) {

                if (
                    normalizeStatus(
                        task.status
                    ) !==
                    "Completed"
                ) {

                    overdue++;

                }

            }

            else {

                upcoming++;

            }

        }
    );


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
        "followupsTotal",
        todayCount +
        overdue +
        upcoming
    );

}


/* =========================================================
   BASIC HELPERS
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
            value ?? "";

    }

}


/* =========================================================
   DATE PARSER
========================================================= */

function parseDate(
    value
) {

    if (
        !value
    ) {

        return null;

    }


    if (
        value instanceof Date
    ) {

        return isNaN(
            value.getTime()
        )
            ? null
            : new Date(
                value.getTime()
            );

    }


    const date =
        new Date(
            value
        );


    if (
        !isNaN(
            date.getTime()
        )
    ) {

        return date;

    }


    /*
     * Support dd/mm/yyyy.
     */

    const match =
        String(
            value
        )
        .match(
            /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
        );


    if (match) {

        const day =
            Number(
                match[1]
            );


        const month =
            Number(
                match[2]
            ) - 1;


        const year =
            Number(
                match[3]
            );


        const parsed =
            new Date(
                year,
                month,
                day
            );


        if (
            !isNaN(
                parsed.getTime()
            )
        ) {

            return parsed;

        }

    }


    return null;

}


/* =========================================================
   OVERDUE CHECK
========================================================= */

function isOverdue(
    task
) {

    if (!task) {

        return false;

    }


    if (
        normalizeStatus(
            task.status
        ) ===
        "Completed"
    ) {

        return false;

    }


    const dueDate =
        parseDate(
            task.dueDate
        );


    if (!dueDate) {

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


    dueDate.setHours(
        0,
        0,
        0,
        0
    );


    return (
        dueDate <
        today
    );

}


/* =========================================================
   DATE DISPLAY
========================================================= */

function displayDate(
    value
) {

    const date =
        parseDate(
            value
        );


    if (!date) {

        return "-";

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


function displayDateTime(
    value
) {

    const date =
        parseDate(
            value
        );


    if (!date) {

        return "-";

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
   HTML ESCAPE
========================================================= */

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
/* =========================================================
   TASK TABLE
========================================================= */

function renderTasksTable() {

    const tbody =
        document.getElementById(
            "tasksTableBody"
        ) ||
        document.getElementById(
            "tasksTable"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    const search =
        document.getElementById(
            "taskSearch"
        )?.value
        ?.trim()
        .toLowerCase() || "";


    const department =
        document.getElementById(
            "departmentFilter"
        )?.value
        ?.trim() || "";


    const priority =
        document.getElementById(
            "priorityFilter"
        )?.value
        ?.trim()
        .toLowerCase() || "";


    const status =
        document.getElementById(
            "statusFilter"
        )?.value
        ?.trim()
        .toLowerCase() || "";


    const filteredTasks =
        tasks.filter(
            function (task) {

                const taskText =
                    [
                        task.taskId,
                        task.task,
                        task.description,
                        task.department,
                        task.assignedTo,
                        task.status,
                        task.priority
                    ]
                    .join(" ")
                    .toLowerCase();


                const searchMatch =
                    !search ||
                    taskText.includes(
                        search
                    );


                const departmentMatch =
                    !department ||
                    normalizeDepartmentName(
                        task.department
                    ) ===
                    normalizeDepartmentName(
                        department
                    );


                const priorityMatch =
                    !priority ||
                    normalizePriority(
                        task.priority
                    ).toLowerCase() ===
                    priority;


                const statusMatch =
                    !status ||
                    normalizeStatus(
                        task.status
                    ).toLowerCase() ===
                    status;


                return (
                    searchMatch &&
                    departmentMatch &&
                    priorityMatch &&
                    statusMatch
                );

            }
        );


    if (
        !filteredTasks.length
    ) {

        tbody.innerHTML =
            `
            <tr>
                <td
                    colspan="10"
                    class="empty-table">

                    No tasks found.

                </td>
            </tr>
            `;

        return;

    }


    filteredTasks.forEach(
        function (task) {

            const row =
                document.createElement(
                    "tr"
                );


            const overdue =
                isOverdue(
                    task
                );


            if (overdue) {

                row.classList.add(
                    "task-overdue"
                );

            }


            row.innerHTML =
                `
                <td>
                    ${escapeHTML(
                        task.taskId
                    )}
                </td>


                <td>

                    <div class="task-title-cell">

                        <strong>
                            ${escapeHTML(
                                task.task ||
                                "Untitled Task"
                            )}
                        </strong>

                        ${
                            task.description
                                ? `
                                <small>
                                    ${escapeHTML(
                                        task.description
                                    )}
                                </small>
                                `
                                : ""
                        }

                    </div>

                </td>


                <td>
                    ${escapeHTML(
                        task.department ||
                        "-"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        task.assignedTo ||
                        "Unassigned"
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
                        task.createdDate
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

                    <div class="task-actions">

                        <button
                            type="button"
                            class="table-action edit-task"
                            data-task-id="${escapeHTML(
                                task.taskId
                            )}">

                            Edit

                        </button>

                    </div>

                </td>
                `;


            tbody.appendChild(
                row
            );

        }
    );


    /*
     * Event delegation.
     *
     * This is intentionally attached
     * to the table body once instead
     * of creating multiple listeners
     * every time the table refreshes.
     */

    tbody.onclick =
        function (event) {

            const button =
                event.target.closest(
                    ".edit-task"
                );


            if (!button) {

                return;

            }


            const taskId =
                button.dataset.taskId;


            if (taskId) {

                editTask(
                    taskId
                );

            }

        };

}


/* =========================================================
   TASK FILTERS
========================================================= */

function initializeFilters() {

    const filterIds = [

        "taskSearch",

        "departmentFilter",

        "priorityFilter",

        "statusFilter"

    ];


    filterIds.forEach(
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
                function () {

                    renderTasksTable();

                }
            );


            element.addEventListener(
                "change",
                function () {

                    renderTasksTable();

                }
            );

        }
    );


    const clearButton =
        document.getElementById(
            "clearTaskFilters"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                filterIds.forEach(
                    function (id) {

                        const element =
                            document.getElementById(
                                id
                            );


                        if (element) {

                            element.value =
                                "";

                        }

                    }
                );


                renderTasksTable();

            }
        );

    }

}


/* =========================================================
   STATUS BADGE
========================================================= */

function statusBadge(
    status,
    task = null
) {

    const value =
        normalizeStatus(
            status
        );


    const normalized =
        value.toLowerCase();


    let className =
        "status-badge";


    switch (
        normalized
    ) {

        case "open":

            className +=
                " status-open";

            break;


        case "in progress":

            className +=
                " status-progress";

            break;


        case "completed":

            className +=
                " status-completed";

            break;


        case "blocked":

            className +=
                " status-blocked";

            break;


        case "on hold":

            className +=
                " status-hold";

            break;

    }


    if (
        task &&
        isOverdue(
            task
        )
    ) {

        className +=
            " status-overdue";

    }


    return `
        <span class="${className}">
            ${escapeHTML(
                value
            )}
        </span>
    `;

}


/* =========================================================
   PRIORITY BADGE
========================================================= */

function priorityBadge(
    priority
) {

    const value =
        normalizePriority(
            priority
        );


    const normalized =
        value.toLowerCase();


    let className =
        "priority-badge";


    if (
        normalized ===
        "high"
    ) {

        className +=
            " priority-high";

    }

    else if (
        normalized ===
        "low"
    ) {

        className +=
            " priority-low";

    }

    else {

        className +=
            " priority-medium";

    }


    return `
        <span class="${className}">
            ${escapeHTML(
                value
            )}
        </span>
    `;

}


/* =========================================================
   FOLLOW-UPS
========================================================= */

function renderFollowups() {

    const tbody =
        document.getElementById(
            "followupsTable"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


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

                    const dateA =
                        parseDate(
                            a.followupDate
                        );


                    const dateB =
                        parseDate(
                            b.followupDate
                        );


                    return (
                        (dateA?.getTime() || 0) -
                        (dateB?.getTime() || 0)
                    );

                }
            );


    if (
        !followups.length
    ) {

        tbody.innerHTML =
            `
            <tr>

                <td
                    colspan="8"
                    class="empty-table">

                    No follow-ups available.

                </td>

            </tr>
            `;

        return;

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    followups.forEach(
        function (task) {

            const date =
                parseDate(
                    task.followupDate
                );


            let dateClass =
                "";


            if (date) {

                date.setHours(
                    0,
                    0,
                    0,
                    0
                );


                if (
                    date.getTime() ===
                    today.getTime()
                ) {

                    dateClass =
                        "followup-today";

                }

                else if (
                    date <
                    today
                ) {

                    dateClass =
                        "followup-overdue";

                }

                else {

                    dateClass =
                        "followup-upcoming";

                }

            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML =
                `
                <td>
                    ${escapeHTML(
                        task.taskId
                    )}
                </td>


                <td>

                    <strong>
                        ${escapeHTML(
                            task.task ||
                            "Untitled Task"
                        )}
                    </strong>

                </td>


                <td>
                    ${escapeHTML(
                        task.department ||
                        "-"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        task.assignedTo ||
                        "-"
                    )}
                </td>


                <td
                    class="${dateClass}">

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


                <td>

                    <button
                        type="button"
                        class="table-action edit-task"
                        data-task-id="${escapeHTML(
                            task.taskId
                        )}">

                        Edit

                    </button>

                </td>
                `;


            tbody.appendChild(
                row
            );

        }
    );


    tbody.onclick =
        function (event) {

            const button =
                event.target.closest(
                    ".edit-task"
                );


            if (!button) {

                return;

            }


            const taskId =
                button.dataset.taskId;


            if (taskId) {

                editTask(
                    taskId
                );

            }

        };

}


/* =========================================================
   DEPARTMENT CARDS
========================================================= */

function renderDepartmentCards() {

    const container =
        document.getElementById(
            "departmentCards"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const role =
        String(
            currentUser?.role || ""
        )
        .trim()
        .toLowerCase();


    const allowedDepartments =
        getAllowedDepartments();


    let departments =
        [...DEPARTMENTS];


    /*
     * Restrict department cards for
     * normal users.
     */

    if (
        role !== "founder" &&
        role !== "admin" &&
        role !== "administrator" &&
        role !== "operations head" &&
        allowedDepartments.length
    ) {

        departments =
            departments.filter(
                function (department) {

                    return allowedDepartments.some(
                        function (allowed) {

                            return (
                                normalizeDepartmentName(
                                    allowed
                                ) ===
                                normalizeDepartmentName(
                                    department
                                )
                            );

                        }
                    );

                }
            );

    }


    departments.forEach(
        function (department) {

            const departmentTasks =
                tasks.filter(
                    function (task) {

                        return (
                            normalizeDepartmentName(
                                task.department
                            ) ===
                            normalizeDepartmentName(
                                department
                            )
                        );

                    }
                );


            const total =
                departmentTasks.length;


            const open =
                departmentTasks.filter(
                    function (task) {

                        return (
                            normalizeStatus(
                                task.status
                            ) ===
                            "Open"
                        );

                    }
                ).length;


            const progress =
                departmentTasks.filter(
                    function (task) {

                        return (
                            normalizeStatus(
                                task.status
                            ) ===
                            "In Progress"
                        );

                    }
                ).length;


            const completed =
                departmentTasks.filter(
                    function (task) {

                        return (
                            normalizeStatus(
                                task.status
                            ) ===
                            "Completed"
                        );

                    }
                ).length;


            const blocked =
                departmentTasks.filter(
                    function (task) {

                        return (
                            normalizeStatus(
                                task.status
                            ) ===
                            "Blocked"
                        );

                    }
                ).length;


            const overdue =
                departmentTasks.filter(
                    function (task) {

                        return isOverdue(
                            task
                        );

                    }
                ).length;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "department-card";


            card.innerHTML =
                `
                <div class="department-card-header">

                    <div>

                        <h3>
                            ${escapeHTML(
                                department
                            )}
                        </h3>

                        <span>
                            ${total}
                            ${
                                total === 1
                                    ? "task"
                                    : "tasks"
                            }
                        </span>

                    </div>


                    <button
                        type="button"
                        class="department-view"
                        data-department="${escapeHTML(
                            department
                        )}">

                        View

                    </button>

                </div>


                <div class="department-stats">

                    <div class="department-stat">

                        <strong>
                            ${open}
                        </strong>

                        <span>
                            Open
                        </span>

                    </div>


                    <div class="department-stat">

                        <strong>
                            ${progress}
                        </strong>

                        <span>
                            In Progress
                        </span>

                    </div>


                    <div class="department-stat">

                        <strong>
                            ${completed}
                        </strong>

                        <span>
                            Completed
                        </span>

                    </div>


                    <div class="department-stat">

                        <strong>
                            ${blocked}
                        </strong>

                        <span>
                            Blocked
                        </span>

                    </div>


                    <div class="department-stat">

                        <strong>
                            ${overdue}
                        </strong>

                        <span>
                            Overdue
                        </span>

                    </div>

                </div>
                `;


            container.appendChild(
                card
            );

        }
    );


    container.onclick =
        function (event) {

            const button =
                event.target.closest(
                    ".department-view"
                );


            if (!button) {

                return;

            }


            const department =
                button.dataset.department;


            if (department) {

                openDepartment(
                    department
                );

            }

        };

}


/* =========================================================
   OPEN DEPARTMENT
========================================================= */

function openDepartment(
    department
) {

    if (
        !canAccessDepartment(
            department
        )
    ) {

        showNotification(
            "Access Restricted",
            "You do not have access to this department."
        );

        return;

    }


    currentDepartment =
        normalizeDepartmentName(
            department
        );


    const filter =
        document.getElementById(
            "departmentFilter"
        );


    if (filter) {

        filter.value =
            currentDepartment;

    }


    showPage(
        "tasks"
    );


    renderTasksTable();

}


/* =========================================================
   DEPARTMENT ACCESS
========================================================= */

function canAccessDepartment(
    department
) {

    if (!currentUser) {

        return false;

    }


    const role =
        String(
            currentUser.role || ""
        )
        .trim()
        .toLowerCase();


    if (
        role === "founder" ||
        role === "admin" ||
        role === "administrator" ||
        role === "operations head"
    ) {

        return true;

    }


    const allowedDepartments =
        getAllowedDepartments();


    return allowedDepartments.some(
        function (item) {

            return (
                normalizeDepartmentName(
                    item
                ) ===
                normalizeDepartmentName(
                    department
                )
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
            "activityList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const activity =
        [...tasks]
            .filter(
                function (task) {

                    return (
                        task.updatedDate ||
                        task.updatedBy ||
                        task.lastAction
                    );

                }
            )
            .sort(
                function (a, b) {

                    const dateA =
                        parseDate(
                            a.updatedDate
                        );


                    const dateB =
                        parseDate(
                            b.updatedDate
                        );


                    return (
                        (dateB?.getTime() || 0) -
                        (dateA?.getTime() || 0)
                    );

                }
            )
            .slice(
                0,
                20
            );


    if (
        !activity.length
    ) {

        container.innerHTML =
            `
            <div class="empty-state">

                No recent activity.

            </div>
            `;

        return;

    }


    activity.forEach(
        function (task) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "activity-item";


            item.innerHTML =
                `
                <div class="activity-icon">

                    ${escapeHTML(
                        getInitials(
                            task.updatedBy ||
                            task.assignedTo ||
                            "User"
                        )
                    )}

                </div>


                <div class="activity-content">

                    <div class="activity-title">

                        ${escapeHTML(
                            task.task ||
                            "Task"
                        )}

                    </div>


                    <div class="activity-description">

                        ${escapeHTML(
                            task.lastAction ||
                            "Task updated"
                        )}

                    </div>


                    <div class="activity-meta">

                        ${escapeHTML(
                            task.updatedBy ||
                            "System"
                        )}

                        ·

                        ${displayDateTime(
                            task.updatedDate
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


    const closeButton =
        document.getElementById(
            "closeTaskModal"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                closeTaskModal();

            }
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelTaskButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                closeTaskModal();

            }
        );

    }

}


/* =========================================================
   TASK MODAL UX
========================================================= */

function initializeTaskModalUX() {

    const modal =
        document.getElementById(
            "taskModal"
        );


    if (!modal) {

        return;

    }


    /*
     * Clicking outside the modal closes it.
     */

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modal
            ) {

                closeTaskModal();

            }

        }
    );


    /*
     * ESC closes the modal.
     */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                if (
                    modal.style.display !==
                    "none"
                ) {

                    closeTaskModal();

                }

            }

        }
    );

}


/* =========================================================
   TASK FORM
========================================================= */

function initializeTaskForm() {

    const form =
        document.getElementById(
            "taskForm"
        );


    if (!form) {

        return;

    }


    /*
     * Remove any previously attached
     * handler from this initialization
     * by relying on this single setup.
     */

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


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


    if (!modal) {

        console.warn(
            "Task modal not found."
        );

        return;

    }


    modal.style.display =
        "flex";


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );


    const title =
        document.getElementById(
            "taskModalTitle"
        );


    /*
     * EDIT EXISTING TASK
     */

    if (task) {

        editingTaskId =
            String(
                task.taskId || ""
            );


        if (title) {

            title.textContent =
                "Edit Task";

        }


        populateTaskForm(
            task
        );

    }


    /*
     * CREATE NEW TASK
     */

    else {

        editingTaskId =
            "";


        if (title) {

            title.textContent =
                "Add New Task";

        }


        clearTaskForm();


        /*
         * If the user opened the
         * task modal from a department
         * page, preselect that department.
         */

        if (
            currentDepartment
        ) {

            setInput(
                "taskDepartment",
                currentDepartment
            );

        }


        /*
         * Otherwise use the user's
         * primary department when
         * available.
         */

        else {

            const primary =
                String(
                    currentUser?.primaryDepartment ||
                    ""
                ).trim();


            if (
                primary &&
                primary.toLowerCase() !==
                "all"
            ) {

                setInput(
                    "taskDepartment",
                    primary
                );

            }

        }

    }


    /*
     * Put focus on task name.
     */

    setTimeout(
        function () {

            document
                .getElementById(
                    "taskName"
                )
                ?.focus();

        },
        50
    );

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

        modal.classList.remove(
            "show"
        );


        modal.style.display =
            "none";

    }


    document.body.classList.remove(
        "modal-open"
    );


    editingTaskId =
        "";

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


    /*
     * Defaults for a new task.
     */

    setInput(
        "taskPriority",
        "Medium"
    );


    setInput(
        "taskStatus",
        "Open"
    );


    setInput(
        "taskCreatedDate",
        todayInput()
    );


    /*
     * Clear fields that may have
     * been populated during editing.
     */

    setInput(
        "taskDueDate",
        ""
    );


    setInput(
        "taskFollowupDate",
        ""
    );


    setInput(
        "taskFollowupAction",
        ""
    );


    setInput(
        "taskRemarks",
        ""
    );


    setInput(
        "taskDescription",
        ""
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
        "taskDescription",
        task.description
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
        task.priority ||
        "Medium"
    );


    setInput(
        "taskStatus",
        task.status ||
        "Open"
    );


    setInput(
        "taskCreatedDate",
        formatDateForInput(
            task.createdDate
        )
    );


    setInput(
        "taskDueDate",
        formatDateForInput(
            task.dueDate
        )
    );


    setInput(
        "taskFollowupDate",
        formatDateForInput(
            task.followupDate
        )
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

    const form =
        document.getElementById(
            "taskForm"
        );


    const submitButton =
        form?.querySelector(
            'button[type="submit"]'
        );


    /*
     * Prevent double submission.
     */

    if (
        submitButton &&
        submitButton.disabled
    ) {

        return;

    }


    if (submitButton) {

        submitButton.disabled =
            true;


        submitButton.dataset.originalText =
            submitButton.textContent;


        submitButton.textContent =
            "Saving...";

    }


    try {

        const editId =
            String(
                getInput(
                    "editTaskId"
                ) ||
                editingTaskId ||
                ""
            ).trim();


        const task = {

            taskId:
                editId,


            task:
                getInput(
                    "taskName"
                ),


            description:
                getInput(
                    "taskDescription"
                ),


            department:
                getInput(
                    "taskDepartment"
                ),


            assignedTo:
                getInput(
                    "taskAssignedTo"
                ),


            priority:
                getInput(
                    "taskPriority"
                ) ||
                "Medium",


            status:
                getInput(
                    "taskStatus"
                ) ||
                "Open",


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
                currentUser?.name ||
                currentUser?.username ||
                "Operations Head"

        };


        /*
         * Required field.
         */

        if (
            !task.task.trim()
        ) {

            showNotification(
                "Missing Information",
                "Please enter a task."
            );


            restoreSaveButton(
                submitButton
            );


            return;

        }


        /*
         * Department is important because
         * it controls visibility for users.
         */

        if (
            !task.department
        ) {

            showNotification(
                "Missing Information",
                "Please select a department."
            );


            restoreSaveButton(
                submitButton
            );


            return;

        }


        let result;


        /*
         * EDIT
         */

        if (
            editId
        ) {

            result =
                await apiRequest(
                    "updateTask",
                    {
                        task:
                            task
                    }
                );

        }


        /*
         * CREATE
         */

        else {

            result =
                await apiRequest(
                    "createTask",
                    {
                        task:
                            task
                    }
                );

        }


        console.log(
            "SAVE TASK RESPONSE:",
            result
        );


        /*
         * Server rejected the request.
         */

        if (
            !result ||
            !result.success
        ) {

            showNotification(
                "Error",
                result?.message ||
                "Unable to save task."
            );


            restoreSaveButton(
                submitButton
            );


            return;

        }


        /*
         * IMPORTANT:
         *
         * Do NOT manually push the new task
         * into `tasks`.
         *
         * The Apps Script backend is the
         * source of truth.
         *
         * Reloading prevents stale data and
         * fixes the situation where a task is
         * saved successfully but does not
         * appear in the frontend.
         */

        closeTaskModal();


        showNotification(
            editId
                ? "Task Updated"
                : "Task Created",
            editId
                ? "Task updated successfully."
                : "Task created successfully."
        );


        /*
         * Reload the actual Google Sheet
         * data before refreshing the UI.
         */

        const loaded =
            await loadTasks();


        if (!loaded) {

            console.warn(
                "Task was saved, but the refreshed task list could not be loaded."
            );

        }


        /*
         * Return to Tasks page after
         * creating/editing.
         */

        showPage(
            "tasks"
        );


        /*
         * Re-render once more after
         * navigation to ensure the table
         * displays the refreshed array.
         */

        renderTasksTable();

    }

    catch (error) {

        console.error(
            "SAVE TASK ERROR:",
            error
        );


        showNotification(
            "Error",
            "An unexpected error occurred while saving the task."
        );

    }

    finally {

        restoreSaveButton(
            submitButton
        );

    }

}


/* =========================================================
   RESTORE SAVE BUTTON
========================================================= */

function restoreSaveButton(
    button
) {

    if (!button) {

        return;

    }


    button.disabled =
        false;


    button.textContent =
        button.dataset.originalText ||
        "Save Task";

}


/* =========================================================
   EDIT TASK
========================================================= */

function editTask(
    taskId
) {

    const id =
        String(
            taskId || ""
        ).trim();


    if (!id) {

        showNotification(
            "Error",
            "Invalid task ID."
        );

        return;

    }


    const task =
        tasks.find(
            function (item) {

                return (
                    String(
                        item.taskId
                    ).trim() ===
                    id
                );

            }
        );


    if (!task) {

        showNotification(
            "Error",
            "Task not found."
        );


        /*
         * Data may have changed in
         * Google Sheets, so refresh once.
         */

        loadTasks();


        return;

    }


    openTaskModal(
        task
    );

}
/* =========================================================
   DEPARTMENT DETAIL
========================================================= */

function showDepartmentPage(
    department
) {

    const canonicalDepartment =
        normalizeDepartmentName(
            department
        );


    currentDepartment =
        canonicalDepartment;


    /*
     * Hide all normal pages.
     */

    document
        .querySelectorAll(
            ".page"
        )
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
            canonicalDepartment
        )
    );


    setText(
        "departmentDetailTitle",
        canonicalDepartment
    );


    setText(
        "departmentDetailSubtitle",
        "Department operational overview."
    );


    const departmentTasks =
        tasks.filter(
            function (task) {

                return (
                    normalizeDepartmentName(
                        task.department
                    ) ===
                    canonicalDepartment
                );

            }
        );


    setText(
        "departmentTotal",
        departmentTasks.length
    );


    setText(
        "departmentOpen",
        departmentTasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "Open"
                );

            }
        ).length
    );


    setText(
        "departmentProgress",
        departmentTasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "In Progress"
                );

            }
        ).length
    );


    setText(
        "departmentBlocked",
        departmentTasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "Blocked"
                );

            }
        ).length
    );


    setText(
        "departmentCompleted",
        departmentTasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "Completed"
                );

            }
        ).length
    );


    setText(
        "departmentOverdue",
        departmentTasks.filter(
            function (task) {

                return isOverdue(
                    task
                );

            }
        ).length
    );


    renderDepartmentTasks(
        departmentTasks
    );

}


/* =========================================================
   DEPARTMENT TASK TABLE
========================================================= */

function renderDepartmentTasks(
    departmentTasks
) {

    const tbody =
        document.getElementById(
            "departmentTasksTable"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML =
        "";


    if (
        !departmentTasks.length
    ) {

        tbody.innerHTML =
            `
            <tr>

                <td
                    colspan="8"
                    class="empty-table">

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


            row.innerHTML =
                `
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
                        task.assignedTo ||
                        "-"
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
                        type="button"
                        class="table-action edit-department-task"
                        data-id="${escapeHTML(
                            task.taskId
                        )}">

                        Edit

                    </button>

                </td>
                `;


            tbody.appendChild(
                row
            );

        }
    );


    /*
     * Event delegation.
     */

    tbody.onclick =
        function (event) {

            const button =
                event.target.closest(
                    ".edit-department-task"
                );


            if (!button) {

                return;

            }


            const taskId =
                button.dataset.id;


            if (taskId) {

                editTask(
                    taskId
                );

            }

        };

}


/* =========================================================
   DEPARTMENT CODES
========================================================= */

function getDepartmentCode(
    department
) {

    const codes = {

        "B2B - Sales":
            "B2B",

        "Customer Support":
            "CS",

        "Warehouse":
            "WH",

        "Scanning - Catalog":
            "SC",

        "Listing - Inventory":
            "LI",

        "Digital Marketing":
            "DM",

        "IT - Software Development":
            "IT",

        "Finance":
            "FIN",

        "Book Fair - Events":
            "BFE",

        "Books and Supply Procurement":
            "BSP",

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
            normalizeDepartmentName(
                department
            )
        ] ||
        "DEP"
    );

}


/* =========================================================
   FOLLOW-UP SUMMARY
========================================================= */

function updateFollowupSummary() {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    let todayCount =
        0;


    let overdue =
        0;


    let upcoming =
        0;


    tasks.forEach(
        function (task) {

            if (
                !task.followupDate
            ) {

                return;

            }


            const date =
                parseDate(
                    task.followupDate
                );


            if (!date) {

                return;

            }


            date.setHours(
                0,
                0,
                0,
                0
            );


            if (
                date.getTime() ===
                today.getTime()
            ) {

                todayCount++;

            }

            else if (
                date <
                today
            ) {

                /*
                 * Completed follow-ups
                 * are not counted as overdue.
                 */

                if (
                    normalizeStatus(
                        task.status
                    ) !==
                    "Completed"
                ) {

                    overdue++;

                }

            }

            else {

                upcoming++;

            }

        }
    );


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

function renderFollowupTable() {

    const tbody =
        document.getElementById(
            "followupsTable"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML =
        "";


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

                    const dateA =
                        parseDate(
                            a.followupDate
                        );


                    const dateB =
                        parseDate(
                            b.followupDate
                        );


                    return (
                        (dateA?.getTime() || 0) -
                        (dateB?.getTime() || 0)
                    );

                }
            );


    if (
        !followups.length
    ) {

        tbody.innerHTML =
            `
            <tr>

                <td
                    colspan="8"
                    class="empty-table">

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


            const followupDate =
                parseDate(
                    task.followupDate
                );


            let dateClass =
                "";


            if (followupDate) {

                const today =
                    new Date();


                today.setHours(
                    0,
                    0,
                    0,
                    0
                );


                followupDate.setHours(
                    0,
                    0,
                    0,
                    0
                );


                if (
                    followupDate.getTime() ===
                    today.getTime()
                ) {

                    dateClass =
                        "followup-today";

                }

                else if (
                    followupDate <
                    today
                ) {

                    dateClass =
                        "followup-overdue";

                }

                else {

                    dateClass =
                        "followup-upcoming";

                }

            }


            row.innerHTML =
                `
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
                        task.department ||
                        "-"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        task.assignedTo ||
                        "-"
                    )}
                </td>


                <td class="${dateClass}">
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


                <td>

                    <button
                        type="button"
                        class="table-action edit-followup-task"
                        data-id="${escapeHTML(
                            task.taskId
                        )}">

                        Edit

                    </button>

                </td>
                `;


            tbody.appendChild(
                row
            );

        }
    );


    tbody.onclick =
        function (event) {

            const button =
                event.target.closest(
                    ".edit-followup-task"
                );


            if (!button) {

                return;

            }


            const taskId =
                button.dataset.id;


            if (taskId) {

                editTask(
                    taskId
                );

            }

        };

}


/* =========================================================
   ACTIVITY
========================================================= */

function renderActivity() {

    const container =
        document.getElementById(
            "activityList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    /*
     * Use task updates as the activity
     * source because the task object
     * already contains updatedBy,
     * updatedDate and lastAction.
     */

    const activities =
        [...tasks]
            .filter(
                function (task) {

                    return (
                        task.updatedDate ||
                        task.updatedBy ||
                        task.lastAction
                    );

                }
            )
            .sort(
                function (a, b) {

                    const dateA =
                        parseDate(
                            a.updatedDate ||
                            a.createdDate
                        );


                    const dateB =
                        parseDate(
                            b.updatedDate ||
                            b.createdDate
                        );


                    return (
                        (dateB?.getTime() || 0) -
                        (dateA?.getTime() || 0)
                    );

                }
            )
            .slice(
                0,
                30
            );


    if (
        !activities.length
    ) {

        container.innerHTML =
            `
            <div class="empty-state">

                No recent activity.

            </div>
            `;

        return;

    }


    activities.forEach(
        function (task) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "activity-item";


            const actor =
                task.updatedBy ||
                task.assignedTo ||
                "System";


            const action =
                task.lastAction ||
                "Task updated";


            item.innerHTML =
                `
                <div class="activity-icon">

                    ${escapeHTML(
                        getInitials(
                            actor
                        )
                    )}

                </div>


                <div class="activity-content">

                    <div class="activity-title">

                        ${escapeHTML(
                            task.task ||
                            "Task"
                        )}

                    </div>


                    <div class="activity-description">

                        ${escapeHTML(
                            action
                        )}

                    </div>


                    <div class="activity-meta">

                        ${escapeHTML(
                            actor
                        )}

                        ·

                        ${displayDateTime(
                            task.updatedDate ||
                            task.createdDate
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
   GET INITIALS
========================================================= */

function getInitials(
    value
) {

    const text =
        String(
            value || ""
        )
        .trim();


    if (!text) {

        return "?";

    }


    const parts =
        text
            .replace(
                /\./g,
                " "
            )
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );


    if (
        parts.length >= 2
    ) {

        return (
            parts[0].charAt(0) +
            parts[
                parts.length - 1
            ].charAt(0)
        ).toUpperCase();

    }


    return text
        .substring(
            0,
            2
        )
        .toUpperCase();

}


/* =========================================================
   DATE HELPERS
========================================================= */

function sameDate(
    first,
    second
) {

    const a =
        parseDate(
            first
        );


    const b =
        parseDate(
            second
        );


    if (
        !a ||
        !b
    ) {

        return false;

    }


    a.setHours(
        0,
        0,
        0,
        0
    );


    b.setHours(
        0,
        0,
        0,
        0
    );


    return (
        a.getTime() ===
        b.getTime()
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


    return (
        date <
        today
    );

}


/* =========================================================
   FORM HELPERS
========================================================= */

function getInput(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return "";

    }


    return String(
        element.value ?? ""
    ).trim();

}


function setInput(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.value =
        value ??
        "";

}


/* =========================================================
   TODAY FOR HTML DATE INPUT
========================================================= */

function todayInput() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        )
        .padStart(
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


/* =========================================================
   FORMAT DATE FOR HTML INPUT
========================================================= */

function formatDateForInput(
    value
) {

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
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
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


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(
    title,
    message
) {

    /*
     * Use an existing notification
     * container if your HTML provides one.
     */

    let container =
        document.getElementById(
            "notificationContainer"
        );


    /*
     * If it doesn't exist, create
     * one dynamically so notifications
     * still work.
     */

    if (!container) {

        container =
            document.createElement(
                "div"
            );


        container.id =
            "notificationContainer";


        container.className =
            "notification-container";


        document.body.appendChild(
            container
        );

    }


    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        "notification";


    notification.innerHTML =
        `
        <div class="notification-content">

            <strong>
                ${escapeHTML(
                    title ||
                    "Notification"
                )}
            </strong>

            <span>
                ${escapeHTML(
                    message ||
                    ""
                )}
            </span>

        </div>


        <button
            type="button"
            class="notification-close"
            aria-label="Close">

            ×

        </button>
        `;


    container.appendChild(
        notification
    );


    const close =
        notification.querySelector(
            ".notification-close"
        );


    if (close) {

        close.addEventListener(
            "click",
            function () {

                notification.remove();

            }
        );

    }


    setTimeout(
        function () {

            notification.classList.add(
                "show"
            );

        },
        10
    );


    setTimeout(
        function () {

            notification.classList.remove(
                "show"
            );


            setTimeout(
                function () {

                    notification.remove();

                },
                300
            );

        },
        4000
    );

}


/* =========================================================
   GLOBAL PAGE REFRESH
========================================================= */

function refreshCurrentView() {

    updateDashboard();

    renderTasksTable();

    renderFollowups();

    renderFollowupTable();

    renderActivity();

    renderDepartmentCards();


    if (
        currentDepartment
    ) {

        showDepartmentPage(
            currentDepartment
        );

    }

}


/* =========================================================
   TASK COUNT DISPLAY
========================================================= */

function updateTaskCounts() {

    const counts = {

        total:
            tasks.length,

        open:
            tasks.filter(
                function (task) {

                    return (
                        normalizeStatus(
                            task.status
                        ) ===
                        "Open"
                    );

                }
            ).length,

        progress:
            tasks.filter(
                function (task) {

                    return (
                        normalizeStatus(
                            task.status
                        ) ===
                        "In Progress"
                    );

                }
            ).length,

        completed:
            tasks.filter(
                function (task) {

                    return (
                        normalizeStatus(
                            task.status
                        ) ===
                        "Completed"
                    );

                }
            ).length,

        blocked:
            tasks.filter(
                function (task) {

                    return (
                        normalizeStatus(
                            task.status
                        ) ===
                        "Blocked"
                    );

                }
            ).length,

        overdue:
            tasks.filter(
                function (task) {

                    return isOverdue(
                        task
                    );

                }
            ).length

    };


    setText(
        "totalTasks",
        counts.total
    );


    setText(
        "openTasks",
        counts.open
    );


    setText(
        "inProgressTasks",
        counts.progress
    );


    setText(
        "completedTasks",
        counts.completed
    );


    setText(
        "blockedTasks",
        counts.blocked
    );


    setText(
        "overdueTasks",
        counts.overdue
    );

}
/* =========================================================
   API
========================================================= */

async function apiRequest(
    action,
    data = {}
) {

    try {

        if (!action) {

            throw new Error(
                "API action is missing."
            );

        }


        const payload = {

            action:
                action,

            ...data

        };


        console.log(
            "API REQUEST:",
            action,
            payload
        );


        const response =
            await fetch(
                API_URL,
                {
                    method:
                        "POST",

                    cache:
                        "no-store",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "API RESPONSE:",
            action,
            result
        );


        return result;

    }

    catch (error) {

        console.error(
            "API ERROR:",
            action,
            error
        );


        showNotification(
            "Connection Error",
            "Unable to connect to Google Sheets."
        );


        return {

            success:
                false,

            message:
                error.message ||
                "API request failed."

        };

    }

}


/* =========================================================
   LOAD TASKS
========================================================= */

async function loadTasks() {

    try {

        /*
         * Always request fresh data.
         */

        const result =
            await apiRequest(
                "getTasks"
            );


        if (
            !result ||
            !result.success
        ) {

            console.error(
                "LOAD TASKS ERROR:",
                result?.message ||
                "Unknown server error"
            );


            /*
             * Do not destroy the current
             * task list when a refresh fails.
             *
             * This is safer than replacing
             * good existing data with [].
             */

            updateAllViews();


            showNotification(
                "Unable to Load Tasks",
                result?.message ||
                "Could not load tasks from Google Sheets."
            );


            return false;

        }


        const serverTasks =
            result.tasks ||
            result.data ||
            [];


        if (
            !Array.isArray(
                serverTasks
            )
        ) {

            console.error(
                "Invalid task response:",
                serverTasks
            );


            showNotification(
                "Data Error",
                "The server returned an invalid task list."
            );


            return false;

        }


        /*
         * Normalize the backend records.
         */

        const normalizedTasks =
            normalizeTasks(
                serverTasks
            );


        /*
         * Apply the user's access
         * restrictions only after the
         * complete server response has
         * been received.
         */

        tasks =
            filterTasksForCurrentUser(
                normalizedTasks
            );


        /*
         * Refresh every frontend view.
         */

        updateAllViews();


        updateTaskCounts();


        updateFollowupSummary();


        console.log(
            "TASKS LOADED:",
            {
                serverCount:
                    serverTasks.length,

                visibleCount:
                    tasks.length
            }
        );


        return true;

    }

    catch (error) {

        console.error(
            "LOAD TASKS EXCEPTION:",
            error
        );


        updateAllViews();


        showNotification(
            "Connection Error",
            "Unable to load tasks from Google Sheets."
        );


        return false;

    }

}


/* =========================================================
   REFRESH TASKS
========================================================= */

async function refreshTasks() {

    const button =
        document.getElementById(
            "refreshTasks"
        ) ||
        document.getElementById(
            "refreshButton"
        );


    if (
        button &&
        button.disabled
    ) {

        return;

    }


    if (button) {

        button.disabled =
            true;


        button.dataset.originalText =
            button.textContent;


        button.textContent =
            "Refreshing...";

    }


    try {

        const success =
            await loadTasks();


        if (success) {

            showNotification(
                "Updated",
                "Task data refreshed successfully."
            );

        }

    }

    finally {

        if (button) {

            button.disabled =
                false;


            button.textContent =
                button.dataset.originalText ||
                "Refresh";

        }

    }

}


/* =========================================================
   REFRESH BUTTON
========================================================= */

function initializeRefreshButton() {

    const button =
        document.getElementById(
            "refreshTasks"
        ) ||
        document.getElementById(
            "refreshButton"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            refreshTasks();

        }
    );

}


/* =========================================================
   AUTO REFRESH
========================================================= */

function initializeAutoRefresh() {

    /*
     * Keep the refresh interval modest.
     *
     * This prevents unnecessary
     * requests to Apps Script.
     */

    const interval =
        5 * 60 * 1000;


    setInterval(
        async function () {

            /*
             * Only refresh while the user
             * is authenticated.
             */

            const loggedIn =
                sessionStorage.getItem(
                    "usedbookrOperationsLogin"
                );


            if (
                loggedIn !==
                "true"
            ) {

                return;

            }


            /*
             * Do not refresh while the
             * task modal is open because
             * the user may be editing data.
             */

            const modal =
                document.getElementById(
                    "taskModal"
                );


            if (
                modal &&
                modal.classList.contains(
                    "show"
                )
            ) {

                return;

            }


            await loadTasks();

        },
        interval
    );

}


/* =========================================================
   INITIALIZE DATA REFRESH
========================================================= */

function initializeDataRefresh() {

    initializeRefreshButton();

    initializeAutoRefresh();

}


/* =========================================================
   SAFE SERVER ERROR MESSAGE
========================================================= */

function getServerMessage(
    result,
    fallback
) {

    if (
        result &&
        result.message
    ) {

        return String(
            result.message
        );

    }


    if (
        result &&
        result.error
    ) {

        return String(
            result.error
        );

    }


    return (
        fallback ||
        "An unexpected server error occurred."
    );

}


/* =========================================================
   CHECK SERVER CONNECTION
========================================================= */

async function checkServerConnection() {

    try {

        const result =
            await apiRequest(
                "getTasks"
            );


        if (
            result &&
            result.success
        ) {

            return true;

        }


        return false;

    }

    catch (error) {

        console.error(
            "SERVER CONNECTION CHECK:",
            error
        );


        return false;

    }

}
/* =========================================================
   USER ACCESS / DEPARTMENT HELPERS
========================================================= */

function filterTasksForCurrentUser(
    allTasks
) {

    if (
        !currentUser
    ) {

        return [];

    }


    const role =
        String(
            currentUser.role || ""
        )
        .trim()
        .toLowerCase();


    /*
     * Full-access users.
     */

    const fullAccessRoles = [

        "founder",

        "operations head",

        "admin",

        "administrator",

        "super admin"

    ];


    if (
        fullAccessRoles.includes(
            role
        )
    ) {

        return allTasks;

    }


    const allowedDepartments =
        getAllowedDepartments();


    const username =
        String(
            currentUser.username || ""
        )
        .trim()
        .toLowerCase();


    const name =
        String(
            currentUser.name || ""
        )
        .trim()
        .toLowerCase();


    return allTasks.filter(
        function (task) {

            const taskDepartment =
                normalizeDepartmentName(
                    task.department
                );


            const assignedTo =
                String(
                    task.assignedTo || ""
                )
                .trim()
                .toLowerCase();


            /*
             * Department access.
             */

            const departmentMatch =
                allowedDepartments.some(
                    function (department) {

                        return (
                            normalizeDepartmentName(
                                department
                            ) ===
                            taskDepartment
                        );

                    }
                );


            if (
                departmentMatch
            ) {

                return true;

            }


            /*
             * Personal task access.
             */

            if (
                assignedTo &&
                (
                    assignedTo === username ||
                    assignedTo === name
                )
            ) {

                return true;

            }


            return false;

        }
    );

}


/* =========================================================
   GET ALLOWED DEPARTMENTS
========================================================= */

function getAllowedDepartments() {

    if (
        !currentUser
    ) {

        return [];

    }


    const departments = [];


    /*
     * Primary department.
     */

    const primary =
        String(
            currentUser.primaryDepartment ||
            ""
        )
        .trim();


    if (
        primary &&
        primary.toLowerCase() !==
        "all"
    ) {

        departments.push(
            primary
        );

    }


    /*
     * Some older user records may
     * use `department` instead.
     */

    const fallbackDepartment =
        String(
            currentUser.department ||
            ""
        )
        .trim();


    if (
        fallbackDepartment &&
        fallbackDepartment.toLowerCase() !==
        "all"
    ) {

        if (
            !departments.some(
                function (item) {

                    return (
                        normalizeDepartmentName(
                            item
                        ) ===
                        normalizeDepartmentName(
                            fallbackDepartment
                        )
                    );

                }
            )
        ) {

            departments.push(
                fallbackDepartment
            );

        }

    }


    /*
     * Coordination departments.
     */

    const coordination =
        currentUser.coordinationDepartments;


    if (
        Array.isArray(
            coordination
        )
    {

        coordination.forEach(
            function (department) {

                const value =
                    String(
                        department || ""
                    ).trim();


                if (
                    !value
                ) {

                    return;

                }


                if (
                    value.toLowerCase() ===
                    "all"
                ) {

                    return;

                }


                if (
                    !departments.some(
                        function (item) {

                            return (
                                normalizeDepartmentName(
                                    item
                                ) ===
                                normalizeDepartmentName(
                                    value
                                )
                            );

                        }
                    )
                ) {

                    departments.push(
                        value
                    );

                }

            }
        );

    }

    else {

        const coordinationText =
            String(
                coordination || ""
            ).trim();


        if (
            coordinationText
        ) {

            /*
             * "All" means all departments.
             */

            if (
                coordinationText.toLowerCase() ===
                "all"
            ) {

                return [
                    ...DEPARTMENTS
                ];

            }


            coordinationText
                .split(
                    /[,|]/
                )
                .map(
                    function (department) {

                        return department.trim();

                    }
                )
                .filter(
                    Boolean
                )
                .forEach(
                    function (department) {

                        if (
                            !departments.some(
                                function (item) {

                                    return (
                                        normalizeDepartmentName(
                                            item
                                        ) ===
                                        normalizeDepartmentName(
                                            department
                                        )
                                    );

                                }
                            )
                        ) {

                            departments.push(
                                department
                            );

                        }

                    }
                );

        }

    }


    /*
     * Return canonical department names.
     */

    return departments.map(
        function (department) {

            return normalizeDepartmentName(
                department
            );

        }
    );

}


/* =========================================================
   CHECK DEPARTMENT ACCESS
========================================================= */

function canAccessDepartment(
    department
) {

    if (
        !currentUser
    ) {

        return false;

    }


    const role =
        String(
            currentUser.role || ""
        )
        .trim()
        .toLowerCase();


    if (
        [
            "founder",
            "operations head",
            "admin",
            "administrator",
            "super admin"
        ].includes(
            role
        )
    ) {

        return true;

    }


    const target =
        normalizeDepartmentName(
            department
        );


    const allowed =
        getAllowedDepartments();


    return allowed.some(
        function (item) {

            return (
                normalizeDepartmentName(
                    item
                ) ===
                target
            );

        }
    );

}


/* =========================================================
   NORMALIZE DEPARTMENT
========================================================= */

function normalizeDepartmentName(
    value
) {

    const input =
        String(
            value || ""
        )
        .trim();


    if (
        !input
    ) {

        return "";

    }


    const found =
        DEPARTMENTS.find(
            function (department) {

                return (
                    department.toLowerCase() ===
                    input.toLowerCase()
                );

            }
        );


    return (
        found ||
        input
    );

}


/* =========================================================
   CHECK CURRENT USER
========================================================= */

function hasAuthenticatedUser() {

    return Boolean(
        currentUser
    );

}


/* =========================================================
   ROLE CHECK
========================================================= */

function hasRole(
    ...roles
) {

    if (
        !currentUser
    ) {

        return false;

    }


    const currentRole =
        String(
            currentUser.role || ""
        )
        .trim()
        .toLowerCase();


    return roles.some(
        function (role) {

            return (
                String(
                    role
                )
                .trim()
                .toLowerCase() ===
                currentRole
            );

        }
    );

}


/* =========================================================
   FULL ACCESS CHECK
========================================================= */

function hasFullAccess() {

    return hasRole(
        "Founder",
        "Operations Head",
        "Admin",
        "Administrator",
        "Super Admin"
    );

}


/* =========================================================
   CURRENT USER DISPLAY
========================================================= */

function updateCurrentUserDisplay() {

    if (
        !currentUser
    ) {

        return;

    }


    const displayName =
        currentUser.name ||
        currentUser.username ||
        "User";


    const role =
        currentUser.role ||
        "";


    const department =
        currentUser.primaryDepartment ||
        currentUser.department ||
        "";


    /*
     * Name.
     */

    [
        "currentUserName",
        "userName",
        "profileName"
    ]
    .forEach(
        function (id) {

            setText(
                id,
                displayName
            );

        }
    );


    /*
     * Role.
     */

    [
        "currentUserRole",
        "userRole",
        "profileRole"
    ]
    .forEach(
        function (id) {

            setText(
                id,
                role
            );

        }
    );


    /*
     * Department.
     */

    [
        "currentUserDepartment",
        "userDepartment",
        "profileDepartment"
    ]
    .forEach(
        function (id) {

            setText(
                id,
                department
            );

        }
    );


    /*
     * Avatar initials.
     */

    const initials =
        getInitials(
            displayName
        );


    [
        "userAvatar",
        "profileAvatar",
        "currentUserAvatar"
    ]
    .forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    initials;

            }

        }
    );

}


/* =========================================================
   USER PERMISSION UI
========================================================= */

function applyUserPermissions() {

    if (
        !currentUser
    ) {

        return;

    }


    const fullAccess =
        hasFullAccess();


    /*
     * Elements that should only be
     * visible to full-access users.
     */

    const adminOnlySelectors = [

        "[data-admin-only]",

        ".admin-only",

        "#adminSettings",

        "#settingsNav",

        "#reportsNav",

        "#reportsSection",

        "#settingsSection"

    ];


    adminOnlySelectors.forEach(
        function (selector) {

            document
                .querySelectorAll(
                    selector
                )
                .forEach(
                    function (element) {

                        /*
                         * Don't destroy the element.
                         * Just hide it.
                         */

                        element.style.display =
                            fullAccess
                                ? ""
                                : "none";

                    }
                );

        }
    );


    /*
     * Add-task access.
     *
     * Users can normally create tasks
     * unless the HTML explicitly marks
     * the button as restricted.
     */

    document
        .querySelectorAll(
            "[data-requires-full-access]"
        )
        .forEach(
            function (element) {

                element.style.display =
                    fullAccess
                        ? ""
                        : "none";

            }
        );


    updateCurrentUserDisplay();

}


/* =========================================================
   DEPARTMENT SELECT OPTIONS
========================================================= */

function populateDepartmentSelects() {

    const selects =
        document.querySelectorAll(
            "select[data-department-select], " +
            "#taskDepartment, " +
            "#departmentFilter"
        );


    selects.forEach(
        function (select) {

            /*
             * Preserve the current value.
             */

            const previousValue =
                select.value;


            /*
             * Don't duplicate options
             * if this function runs again.
             */

            const existingOptions =
                Array.from(
                    select.options
                );


            const hasDepartmentOptions =
                existingOptions.some(
                    function (option) {

                        return (
                            option.dataset &&
                            option.dataset.department ===
                            "true"
                        );

                    }
                );


            if (
                hasDepartmentOptions
            ) {

                /*
                 * Remove only dynamically
                 * generated department options.
                 */

                Array.from(
                    select.querySelectorAll(
                        'option[data-department="true"]'
                    )
                )
                .forEach(
                    function (option) {

                        option.remove();

                    }
                );

            }


            const firstOption =
                select.options[0];


            DEPARTMENTS.forEach(
                function (department) {

                    /*
                     * Normal users should only
                     * see departments they can access
                     * in restricted selects.
                     */

                    const isFilter =
                        select.id ===
                        "departmentFilter";


                    if (
                        !hasFullAccess() &&
                        !isFilter &&
                        !canAccessDepartment(
                            department
                        )
                    ) {

                        return;

                    }


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        department;


                    option.textContent =
                        department;


                    option.dataset.department =
                        "true";


                    select.appendChild(
                        option
                    );

                }
            );


            /*
             * Restore previous value.
             */

            if (
                previousValue
            ) {

                const exists =
                    Array.from(
                        select.options
                    )
                    .some(
                        function (option) {

                            return (
                                option.value ===
                                previousValue
                            );

                        }
                    );


                if (
                    exists
                ) {

                    select.value =
                        previousValue;

                }

            }

        }
    );

}
/* =========================================================
   LOGIN / SESSION
========================================================= */

function checkLogin() {

    const loggedIn =
        sessionStorage.getItem(
            "usedbookrOperationsLogin"
        );


    const savedUser =
        sessionStorage.getItem(
            "usedbookrCurrentUser"
        );


    if (
        loggedIn !== "true" ||
        !savedUser
    ) {

        currentUser =
            null;

        showLogin();

        return;

    }


    try {

        currentUser =
            JSON.parse(
                savedUser
            );


        /*
         * Make sure the stored value
         * is actually an object.
         */

        if (
            !currentUser ||
            typeof currentUser !==
            "object"
        ) {

            throw new Error(
                "Invalid saved user."
            );

        }


        hideLogin();


        /*
         * Update profile immediately.
         */

        updateLoggedInUserProfile();

        updateCurrentUserDisplay();

        applyUserPermissions();


        /*
         * Populate department fields
         * after user information exists.
         */

        populateDepartmentSelects();


        /*
         * Load the latest tasks from
         * Google Sheets.
         */

        loadTasks();


        /*
         * Start on dashboard.
         */

        showPage(
            "dashboard"
        );

    }

    catch (error) {

        console.error(
            "SESSION RESTORE ERROR:",
            error
        );


        logoutUser();

    }

}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    const login =
        document.getElementById(
            "loginScreen"
        );


    const app =
        document.getElementById(
            "app"
        );


    if (login) {

        login.style.display =
            "flex";

    }


    if (app) {

        app.style.display =
            "none";

    }


    /*
     * Clear login fields without
     * destroying the form itself.
     */

    setInput(
        "loginUsername",
        ""
    );


    setInput(
        "loginPassword",
        "");


    setText(
        "loginError",
        ""
    );

}


/* =========================================================
   HIDE LOGIN
========================================================= */

function hideLogin() {

    const login =
        document.getElementById(
            "loginScreen"
        );


    const app =
        document.getElementById(
            "app"
        );


    if (login) {

        login.style.display =
            "none";

    }


    if (app) {

        app.style.display =
            "flex";

    }

}


/* =========================================================
   LOGIN FORM
========================================================= */

function initializeLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


            await performLogin();

        }
    );

}


/* =========================================================
   PERFORM LOGIN
========================================================= */

async function performLogin() {

    const username =
        getInput(
            "loginUsername"
        );


    const password =
        getInput(
            "loginPassword"
        );


    if (
        !username ||
        !password
    ) {

        setText(
            "loginError",
            "Please enter username and password."
        );


        return;

    }


    const button =
        document.getElementById(
            "loginButton"
        );


    if (
        button &&
        button.disabled
    ) {

        return;

    }


    if (button) {

        button.disabled =
            true;


        button.dataset.originalText =
            button.textContent;


        button.textContent =
            "Signing in...";

    }


    try {

        /*
         * IMPORTANT:
         *
         * Keep this action name aligned
         * with your Apps Script backend.
         */

        const result =
            await apiRequest(
                "login",
                {
                    username:
                        username,

                    password:
                        password
                }
            );


        if (
            !result ||
            !result.success
        ) {

            setText(
                "loginError",
                getServerMessage(
                    result,
                    "Invalid username or password."
                )
            );


            return;

        }


        /*
         * Support the common response
         * structures without changing
         * backend functionality.
         */

        const user =
            result.user ||
            result.data?.user ||
            result.data;


        if (
            !user ||
            typeof user !==
            "object"
        ) {

            setText(
                "loginError",
                "Login succeeded but user information was not returned."
            );


            return;

        }


        currentUser =
            user;


        /*
         * Store session.
         */

        sessionStorage.setItem(
            "usedbookrOperationsLogin",
            "true"
        );


        sessionStorage.setItem(
            "usedbookrCurrentUser",
            JSON.stringify(
                currentUser
            )
        );


        /*
         * Update interface.
         */

        hideLogin();


        updateLoggedInUserProfile();

        updateCurrentUserDisplay();

        applyUserPermissions();

        populateDepartmentSelects();


        /*
         * Load fresh task data.
         */

        await loadTasks();


        /*
         * Open dashboard.
         */

        showPage(
            "dashboard"
        );


        showNotification(
            "Welcome",
            "Login successful."
        );

    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        setText(
            "loginError",
            "Unable to sign in. Please try again."
        );

    }

    finally {

        if (button) {

            button.disabled =
                false;


            button.textContent =
                button.dataset.originalText ||
                "Login";

        }

    }

}


/* =========================================================
   LOGOUT INITIALIZATION
========================================================= */

function initializeLogout() {

    const button =
        document.getElementById(
            "logoutButton"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            logoutUser();

        }
    );

}


/* =========================================================
   LOGOUT USER
========================================================= */

function logoutUser() {

    /*
     * Close any open modal.
     */

    closeTaskModal();


    /*
     * Clear application state.
     */

    currentUser =
        null;


    tasks =
        [];


    currentDepartment =
        "";


    currentPage =
        "dashboard";


    /*
     * Clear session.
     */

    sessionStorage.removeItem(
        "usedbookrOperationsLogin"
    );


    sessionStorage.removeItem(
        "usedbookrCurrentUser"
    );


    /*
     * Return to login screen.
     */

    showLogin();


    /*
     * Clear visible dashboard data.
     */

    updateAllViews();


    showNotification(
        "Logged Out",
        "You have been logged out successfully."
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item[data-page]"
        );


    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const page =
                        item.dataset.page;


                    if (!page) {

                        return;

                    }


                    /*
                     * Department page is handled
                     * separately.
                     */

                    if (
                        page ===
                        "department"
                    ) {

                        const department =
                            item.dataset.department;


                        if (
                            department
                        ) {

                            openDepartment(
                                department
                            );

                        }


                        return;

                    }


                    showPage(
                        page
                    );


                    /*
                     * Close mobile sidebar
                     * after navigation.
                     */

                    document
                        .querySelector(
                            ".sidebar"
                        )
                        ?.classList
                        .remove(
                            "sidebar-open"
                        );

                }
            );

        }
    );


    /*
     * Mobile menu.
     */

    const menu =
        document.getElementById(
            "menuToggle"
        );


    if (menu) {

        menu.addEventListener(
            "click",
            function () {

                document
                    .querySelector(
                        ".sidebar"
                    )
                    ?.classList
                    .toggle(
                        "sidebar-open"
                    );

            }
        );

    }

}


/* =========================================================
   SHOW PAGE
========================================================= */

function showPage(
    page
) {

    if (!page) {

        return;

    }


    currentPage =
        page;


    /*
     * Hide every page.
     */

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            function (section) {

                section.classList.remove(
                    "active-page"
                );

            }
        );


    /*
     * Show requested page.
     */

    const target =
        document.getElementById(
            page +
            "Page"
        );


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    /*
     * Update active navigation item.
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


    updatePageHeader(
        page
    );


    /*
     * Render only what is needed.
     */

    switch (
        page
    ) {

        case "dashboard":

            updateDashboard();

            break;


        case "tasks":

            renderTasksTable();

            break;


        case "followups":

            renderFollowups();

            renderFollowupTable();

            updateFollowupSummary();

            break;


        case "activity":

            renderActivity();

            break;


        case "departments":

            renderDepartmentCards();

            break;

    }

}


/* =========================================================
   PAGE HEADER
========================================================= */

function updatePageHeader(
    page
) {

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

            "Track pending and upcoming follow-ups"

        ],


        activity: [

            "Activity",

            "Recent operational activity"

        ],


        departments: [

            "Departments",

            "Department-wise operational overview"

        ],


        reports: [

            "Reports",

            "Operational reports and analysis"

        ],


        settings: [

            "Settings",

            "System configuration"

        ]

    };


    const header =
        headers[
            page
        ] ||
        [

            "Operations",

            "Operations management"

        ];


    if (title) {

        title.textContent =
            header[0];

    }


    if (subtitle) {

        subtitle.textContent =
            header[1];

    }

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Static UI.
         */

        initializeDepartments();

        initializeDate();

        initializeNavigation();

        initializeTaskButtons();

        initializeFilters();

        initializeTaskForm();

        initializeTaskModalUX();

        initializeLogout();

        initializeLogin();

        initializeRefreshButton();

        initializeDataRefresh();


        /*
         * Department options.
         *
         * This is safe to run before login;
         * it will simply use the available
         * department list.
         */

        populateDepartmentSelects();


        /*
         * Restore the previous session.
         */

        checkLogin();

    }
);
/* =========================================================
   FILTERS
========================================================= */

function initializeFilters() {

    const filterIds = [

        "taskSearch",

        "departmentFilter",

        "priorityFilter",

        "statusFilter"

    ];


    filterIds.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {

                return;

            }


            /*
             * Search field.
             */

            element.addEventListener(
                "input",
                function () {

                    renderTasksTable();

                }
            );


            /*
             * Dropdown filters.
             */

            element.addEventListener(
                "change",
                function () {

                    renderTasksTable();

                }
            );

        }
    );

}


/* =========================================================
   GET FILTERED TASKS
========================================================= */

function getFilteredTasks() {

    const search =
        getInput(
            "taskSearch"
        )
        .toLowerCase();


    const department =
        getInput(
            "departmentFilter"
        );


    const priority =
        getInput(
            "priorityFilter"
        );


    const status =
        getInput(
            "statusFilter"
        );


    return tasks.filter(
        function (task) {

            /*
             * Search across the most useful
             * task fields.
             */

            const searchableText = [

                task.taskId,

                task.task,

                task.description,

                task.assignedTo,

                task.department,

                task.priority,

                task.status,

                task.lastAction,

                task.remarks

            ]
            .map(
                function (value) {

                    return String(
                        value || ""
                    )
                    .toLowerCase();

                }
            )
            .join(" ");


            if (
                search &&
                !searchableText.includes(
                    search
                )
            ) {

                return false;

            }


            /*
             * Department filter.
             */

            if (
                department &&
                normalizeDepartmentName(
                    task.department
                ) !==
                normalizeDepartmentName(
                    department
                )
            ) {

                return false;

            }


            /*
             * Priority filter.
             */

            if (
                priority &&
                normalizePriority(
                    task.priority
                ) !==
                normalizePriority(
                    priority
                )
            ) {

                return false;

            }


            /*
             * Overdue is a calculated filter,
             * not an actual task status.
             */

            if (
                status ===
                "Overdue"
            ) {

                return isOverdue(
                    task
                );

            }


            /*
             * Normal status filter.
             */

            if (
                status &&
                normalizeStatus(
                    task.status
                ) !==
                normalizeStatus(
                    status
                )
            ) {

                return false;

            }


            return true;

        }
    );

}


/* =========================================================
   RENDER ALL TASKS
========================================================= */

function renderTasksTable() {

    const tbody =
        document.getElementById(
            "allTasksTable"
        );


    if (!tbody) {

        return;

    }


    const filtered =
        getFilteredTasks();


    tbody.innerHTML =
        "";


    /*
     * Empty result.
     */

    if (
        !filtered.length
    ) {

        tbody.innerHTML =
            `
            <tr>

                <td
                    colspan="8"
                    class="empty-table">

                    No matching tasks available.

                </td>

            </tr>
            `;

        updateTaskTableCount(
            0
        );


        return;

    }


    /*
     * Sort newest/updated tasks first.
     */

    const sorted =
        [...filtered].sort(
            function (a, b) {

                const dateA =
                    parseDate(
                        a.updatedDate ||
                        a.createdDate
                    );


                const dateB =
                    parseDate(
                        b.updatedDate ||
                        b.createdDate
                    );


                return (
                    (dateB?.getTime() || 0) -
                    (dateA?.getTime() || 0)
                );

            }
        );


    sorted.forEach(
        function (task) {

            const row =
                document.createElement(
                    "tr"
                );


            /*
             * Mark overdue rows.
             */

            if (
                isOverdue(
                    task
                )
            ) {

                row.classList.add(
                    "task-overdue"
                );

            }


            row.innerHTML =
                `
                <td>

                    ${escapeHTML(
                        task.taskId ||
                        "-"
                    )}

                </td>


                <td>

                    <strong>

                        ${escapeHTML(
                            task.task ||
                            "-"
                        )}

                    </strong>

                    ${
                        task.description
                            ? `
                                <div class="task-description">

                                    ${escapeHTML(
                                        task.description
                                    )}

                                </div>
                              `
                            : ""
                    }

                </td>


                <td>

                    ${escapeHTML(
                        task.department ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        task.assignedTo ||
                        "-"
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

                    <div class="task-actions">

                        <button
                            type="button"
                            class="table-action edit-task-button"
                            data-task-id="${escapeHTML(
                                task.taskId
                            )}">

                            Edit

                        </button>

                    </div>

                </td>

                `;


            tbody.appendChild(
                row
            );

        }
    );


    updateTaskTableCount(
        sorted.length
    );

}


/* =========================================================
   TASK TABLE COUNT
========================================================= */

function updateTaskTableCount(
    count
) {

    const elements = [

        "taskTableCount",

        "tasksResultCount",

        "visibleTaskCount"

    ];


    elements.forEach(
        function (id) {

            setText(
                id,
                count
            );

        }
    );

}


/* =========================================================
   TASK TABLE CLICK HANDLER
========================================================= */

function initializeTaskTableActions() {

    const tbody =
        document.getElementById(
            "allTasksTable"
        );


    if (!tbody) {

        return;

    }


    /*
     * Event delegation means we don't
     * need to attach an event listener
     * to every row after every render.
     */

    tbody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".edit-task-button"
                );


            if (!button) {

                return;

            }


            const taskId =
                button.dataset.taskId;


            if (
                taskId
            ) {

                editTask(
                    taskId
                );

            }

        }
    );

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearTaskFilters() {

    setInput(
        "taskSearch",
        ""
    );


    setInput(
        "departmentFilter",
        ""
    );


    setInput(
        "priorityFilter",
        ""
    );


    setInput(
        "statusFilter",
        ""
    );


    renderTasksTable();

}


/* =========================================================
   CLEAR FILTER BUTTON
========================================================= */

function initializeClearFilters() {

    const possibleIds = [

        "clearFilters",

        "clearTaskFilters",

        "resetFilters"

    ];


    possibleIds.forEach(
        function (id) {

            const button =
                document.getElementById(
                    id
                );


            if (!button) {

                return;

            }


            button.addEventListener(
                "click",
                function () {

                    clearTaskFilters();

                }
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


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            exportTasksCSV();

        }
    );

}


/* =========================================================
   EXPORT TASKS CSV
========================================================= */

function exportTasksCSV() {

    /*
     * Export the currently visible
     * filtered tasks rather than
     * unexpectedly exporting hidden
     * records.
     */

    const exportTasks =
        getFilteredTasks();


    if (
        !exportTasks.length
    ) {

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
        exportTasks.map(
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


    /*
     * Add UTF-8 BOM so Excel opens
     * Indian/local text correctly.
     */

    const blob =
        new Blob(
            [
                "\uFEFF" +
                csv
            ],
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


    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        100
    );


    showNotification(
        "Export Complete",
        exportTasks.length +
        " task(s) exported successfully."
    );

}


/* =========================================================
   CSV ESCAPE
========================================================= */

function csvEscape(
    value
) {

    const text =
        String(
            value ??
            ""
        );


    /*
     * CSV requires quotes when a
     * field contains comma, quote,
     * or newline.
     */

    if (
        /[",\r\n]/.test(
            text
        )
    ) {

        return (
            '"' +
            text.replace(
                /"/g,
                '""'
            ) +
            '"'
        );

    }


    return text;

}


/* =========================================================
   ADD FILTER / TABLE INITIALIZATION
========================================================= */

function initializeTaskTableFeatures() {

    initializeTaskTableActions();

    initializeClearFilters();

    initializeExports();

}
/* =========================================================
   NORMALIZE API DATA
========================================================= */

function normalizeTasks(data) {

    if (!Array.isArray(data)) {

        return [];

    }


    return data.map(function (task) {

        task =
            task ||
            {};


        return {

            taskId:
                task.taskId ??
                task["Task ID"] ??
                "",


            task:
                task.task ??
                task["Task"] ??
                "",


            description:
                task.description ??
                task["Description"] ??
                "",


            department:
                normalizeDepartmentName(
                    task.department ??
                    task["Department"] ??
                    ""
                ),


            assignedTo:
                task.assignedTo ??
                task["Assigned To"] ??
                "",


            priority:
                normalizePriority(
                    task.priority ??
                    task["Priority"] ??
                    "Medium"
                ),


            status:
                normalizeStatus(
                    task.status ??
                    task["Status"] ??
                    "Open"
                ),


            createdDate:
                formatDateForInput(
                    task.createdDate ??
                    task["Created Date"] ??
                    ""
                ),


            dueDate:
                formatDateForInput(
                    task.dueDate ??
                    task["Due Date"] ??
                    ""
                ),


            followupDate:
                formatDateForInput(
                    task.followupDate ??
                    task["Follow-up Date"] ??
                    ""
                ),


            lastAction:
                task.lastAction ??
                task["Last Action"] ??
                task["Last Action / Follow-up"] ??
                "",


            remarks:
                task.remarks ??
                task["Remarks"] ??
                "",


            updatedBy:
                task.updatedBy ??
                task["Updated By"] ??
                "",


            updatedDate:
                task.updatedDate ??
                task["Updated Date"] ??
                "",


            createdBy:
                task.createdBy ??
                task["Created By"] ??
                ""

        };

    });

}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(
    value
) {

    const text =
        String(
            value ||
            ""
        )
        .trim();


    if (!text) {

        return "Open";

    }


    const normalized =
        text
            .toLowerCase()
            .replace(
                /[_-]+/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            );


    const map = {

        "open":
            "Open",

        "pending":
            "Open",

        "new":
            "Open",

        "in progress":
            "In Progress",

        "inprogress":
            "In Progress",

        "progress":
            "In Progress",

        "working":
            "In Progress",

        "completed":
            "Completed",

        "complete":
            "Completed",

        "done":
            "Completed",

        "closed":
            "Completed",

        "blocked":
            "Blocked",

        "on hold":
            "Blocked",

        "onhold":
            "Blocked"

    };


    return (
        map[
            normalized
        ] ||
        text
    );

}


/* =========================================================
   NORMALIZE PRIORITY
========================================================= */

function normalizePriority(
    value
) {

    const text =
        String(
            value ||
            ""
        )
        .trim();


    if (!text) {

        return "Medium";

    }


    const normalized =
        text.toLowerCase();


    if (
        normalized ===
        "high"
    ) {

        return "High";

    }


    if (
        normalized ===
        "low"
    ) {

        return "Low";

    }


    if (
        normalized ===
        "medium"
    ) {

        return "Medium";

    }


    /*
     * Preserve unknown values rather
     * than silently changing backend data.
     */

    return text;

}


/* =========================================================
   DATE PARSER
========================================================= */

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
            : new Date(
                value.getTime()
            );

    }


    const text =
        String(
            value
        )
        .trim();


    if (!text) {

        return null;

    }


    /*
     * yyyy-MM-dd
     *
     * Parse manually to avoid timezone
     * shifts caused by new Date("yyyy-MM-dd").
     */

    const isoDate =
        text.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );


    if (isoDate) {

        const year =
            Number(
                isoDate[1]
            );


        const month =
            Number(
                isoDate[2]
            ) - 1;


        const day =
            Number(
                isoDate[3]
            );


        const date =
            new Date(
                year,
                month,
                day
            );


        if (
            date.getFullYear() ===
                year &&
            date.getMonth() ===
                month &&
            date.getDate() ===
                day
        ) {

            return date;

        }


        return null;

    }


    /*
     * dd/MM/yyyy
     */

    const indianDate =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );


    if (indianDate) {

        const day =
            Number(
                indianDate[1]
            );


        const month =
            Number(
                indianDate[2]
            ) - 1;


        const year =
            Number(
                indianDate[3]
            );


        const date =
            new Date(
                year,
                month,
                day
            );


        if (
            date.getFullYear() ===
                year &&
            date.getMonth() ===
                month &&
            date.getDate() ===
                day
        ) {

            return date;

        }


        return null;

    }


    /*
     * ISO datetime / Google Apps Script
     * datetime / other standard values.
     */

    const date =
        new Date(
            text
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


/* =========================================================
   FORMAT DATE FOR INPUT
========================================================= */

function formatDateForInput(
    value
) {

    if (!value) {

        return "";

    }


    const text =
        String(
            value
        )
        .trim();


    /*
     * Already yyyy-MM-dd.
     */

    const direct =
        text.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (direct) {

        return (
            direct[1] +
            "-" +
            direct[2] +
            "-" +
            direct[3]
        );

    }


    const date =
        parseDate(
            value
        );


    if (!date) {

        return "";

    }


    return (

        date.getFullYear() +

        "-" +

        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        ) +

        "-" +

        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        )

    );

}


/* =========================================================
   DISPLAY DATE
========================================================= */

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
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


/* =========================================================
   DISPLAY DATE + TIME
========================================================= */

function displayDateTime(
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


    return date.toLocaleString(
        "en-IN",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


/* =========================================================
   TODAY
========================================================= */

function todayInput() {

    const today =
        new Date();


    return (

        today.getFullYear() +

        "-" +

        String(
            today.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        ) +

        "-" +

        String(
            today.getDate()
        )
        .padStart(
            2,
            "0"
        )

    );

}


/* =========================================================
   SAME DATE
========================================================= */

function sameDate(
    first,
    second
) {

    const a =
        parseDate(
            first
        );


    const b =
        parseDate(
            second
        );


    if (
        !a ||
        !b
    ) {

        return false;

    }


    return (

        a.getFullYear() ===
            b.getFullYear() &&

        a.getMonth() ===
            b.getMonth() &&

        a.getDate() ===
            b.getDate()

    );

}


/* =========================================================
   DATE BEFORE TODAY
========================================================= */

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


    return (
        date <
        today
    );

}


/* =========================================================
   OVERDUE
========================================================= */

function isOverdue(
    task
) {

    if (
        !task ||
        !task.dueDate
    ) {

        return false;

    }


    /*
     * Completed tasks are never overdue.
     */

    if (
        normalizeStatus(
            task.status
        ) ===
        "Completed"
    ) {

        return false;

    }


    return dateBeforeToday(
        task.dueDate
    );

}


/* =========================================================
   PRIORITY BADGE
========================================================= */

function priorityBadge(
    priority
) {

    const safePriority =
        normalizePriority(
            priority
        );


    const cssClass =
        safePriority
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            );


    return `
        <span
            class="priority-badge priority-${escapeHTML(
                cssClass
            )}">

            ${escapeHTML(
                safePriority
            )}

        </span>
    `;

}


/* =========================================================
   STATUS BADGE
========================================================= */

function statusBadge(
    status,
    task
) {

    let displayStatus =
        normalizeStatus(
            status
        );


    /*
     * Overdue takes priority over the
     * normal status except Completed.
     */

    if (
        displayStatus !==
        "Completed" &&
        isOverdue(
            task
        )
    ) {

        displayStatus =
            "Overdue";

    }


    const cssClass =
        displayStatus
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            );


    return `
        <span
            class="status-badge status-${escapeHTML(
                cssClass
            )}">

            ${escapeHTML(
                displayStatus
            )}

        </span>
    `;

}


/* =========================================================
   HTML ESCAPE
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
   SET TEXT SAFELY
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(
                value
            );

}


/* =========================================================
   SET HTML SAFELY
========================================================= */

function setHTML(
    id,
    html
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.innerHTML =
        html ||
        "";

}
/* =========================================================
   TASK FORM
========================================================= */

function initializeTaskForm() {

    const form =
        document.getElementById(
            "taskForm"
        );


    if (!form) {

        return;

    }


    /*
     * Prevent duplicate submit listeners.
     */

    if (
        form.dataset.initialized ===
        "true"
    ) {

        return;

    }


    form.dataset.initialized =
        "true";


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


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


    if (!modal) {

        return;

    }


    /*
     * Editing existing task.
     */

    if (task) {

        editingTaskId =
            task.taskId ||
            "";


        setText(
            "taskModalTitle",
            "Edit Task"
        );


        populateTaskForm(
            task
        );

    }


    /*
     * Creating new task.
     */

    else {

        editingTaskId =
            "";


        setText(
            "taskModalTitle",
            "Add New Task"
        );


        clearTaskForm();


        /*
         * If user opened Add Task
         * from a department page,
         * automatically select it.
         */

        if (
            currentDepartment
        ) {

            setInput(
                "taskDepartment",
                currentDepartment
            );

        }


        /*
         * Default creation date.
         */

        if (
            !getInput(
                "taskCreatedDate"
            )
        ) {

            setInput(
                "taskCreatedDate",
                todayInput()
            );

        }

    }


    /*
     * Display modal only after the
     * form has been prepared.
     */

    modal.style.display =
        "flex";


    modal.classList.add(
        "show"
    );


    /*
     * Prevent background scrolling.
     */

    document.body.classList.add(
        "modal-open"
    );


    /*
     * Focus task field.
     */

    setTimeout(
        function () {

            const taskInput =
                document.getElementById(
                    "taskName"
                );


            if (taskInput) {

                taskInput.focus();

            }

        },
        50
    );

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

        modal.classList.remove(
            "show"
        );


        modal.style.display =
            "none";

    }


    document.body.classList.remove(
        "modal-open"
    );


    editingTaskId =
        "";

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


    editingTaskId =
        "";


    setInput(
        "editTaskId",
        ""
    );


    setInput(
        "taskPriority",
        "Medium"
    );


    setInput(
        "taskStatus",
        "Open"
    );


    setInput(
        "taskCreatedDate",
        todayInput()
    );


    /*
     * Clear fields that may not be
     * reset correctly by custom UI.
     */

    setInput(
        "taskName",
        ""
    );


    setInput(
        "taskDescription",
        ""
    );


    setInput(
        "taskAssignedTo",
        ""
    );


    setInput(
        "taskDueDate",
        ""
    );


    setInput(
        "taskFollowupDate",
        ""
    );


    setInput(
        "taskFollowupAction",
        ""
    );


    setInput(
        "taskRemarks",
        ""
    );

}


/* =========================================================
   POPULATE TASK FORM
========================================================= */

function populateTaskForm(
    task
) {

    if (!task) {

        return;

    }


    setInput(
        "editTaskId",
        task.taskId ||
        ""
    );


    setInput(
        "taskName",
        task.task ||
        ""
    );


    setInput(
        "taskDescription",
        task.description ||
        ""
    );


    setInput(
        "taskDepartment",
        task.department ||
        ""
    );


    setInput(
        "taskAssignedTo",
        task.assignedTo ||
        ""
    );


    setInput(
        "taskPriority",
        normalizePriority(
            task.priority
        )
    );


    setInput(
        "taskStatus",
        normalizeStatus(
            task.status
        )
    );


    setInput(
        "taskCreatedDate",
        formatDateForInput(
            task.createdDate
        )
    );


    setInput(
        "taskDueDate",
        formatDateForInput(
            task.dueDate
        )
    );


    setInput(
        "taskFollowupDate",
        formatDateForInput(
            task.followupDate
        )
    );


    setInput(
        "taskFollowupAction",
        task.lastAction ||
        ""
    );


    setInput(
        "taskRemarks",
        task.remarks ||
        ""
    );

}


/* =========================================================
   COLLECT TASK FORM DATA
========================================================= */

function collectTaskFormData() {

    const task = {

        taskId:
            getInput(
                "editTaskId"
            ) ||
            editingTaskId ||
            "",


        task:
            getInput(
                "taskName"
            ).trim(),


        description:
            getInput(
                "taskDescription"
            ).trim(),


        department:
            normalizeDepartmentName(
                getInput(
                    "taskDepartment"
                )
            ),


        assignedTo:
            getInput(
                "taskAssignedTo"
            ).trim(),


        priority:
            normalizePriority(
                getInput(
                    "taskPriority"
                )
            ),


        status:
            normalizeStatus(
                getInput(
                    "taskStatus"
                )
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
            ).trim(),


        remarks:
            getInput(
                "taskRemarks"
            ).trim(),


        updatedBy:
            currentUser?.name ||
            currentUser?.username ||
            ""

    };


    return task;

}


/* =========================================================
   VALIDATE TASK
========================================================= */

function validateTask(
    task
) {

    if (
        !task
    ) {

        return {
            valid:
                false,

            message:
                "Task information is missing."

        };

    }


    if (
        !task.task
    ) {

        return {
            valid:
                false,

            message:
                "Please enter a task."

        };

    }


    if (
        !task.department
    ) {

        return {
            valid:
                false,

            message:
                "Please select a department."

        };

    }


    /*
     * Non-admin users cannot create
     * tasks in departments they cannot
     * access.
     */

    if (
        !hasFullAccess() &&
        !canAccessDepartment(
            task.department
        )
    ) {

        return {
            valid:
                false,

            message:
                "You do not have permission to create a task for this department."

        };

    }


    return {
        valid:
            true,

        message:
            ""

    };

}


/* =========================================================
   SAVE TASK
========================================================= */

async function saveTask() {

    const form =
        document.getElementById(
            "taskForm"
        );


    if (!form) {

        return;

    }


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    /*
     * Prevent double-click /
     * double-submit.
     */

    if (
        submitButton &&
        submitButton.disabled
    ) {

        return;

    }


    if (submitButton) {

        submitButton.disabled =
            true;


        submitButton.dataset.originalText =
            submitButton.textContent;


        submitButton.textContent =
            "Saving...";

    }


    try {

        const task =
            collectTaskFormData();


        const validation =
            validateTask(
                task
            );


        if (
            !validation.valid
        ) {

            showNotification(
                "Missing Information",
                validation.message
            );


            return;

        }


        /*
         * Determine whether this is
         * CREATE or UPDATE.
         */

        const isEditing =
            Boolean(
                task.taskId
            );


        const action =
            isEditing
                ? "updateTask"
                : "createTask";


        console.log(
            "Saving task:",
            {
                action:
                    action,

                task:
                    task
            }
        );


        /*
         * Apps Script expects the task
         * object under the `task` property.
         */

        const result =
            await apiRequest(
                action,
                {
                    task:
                        task
                }
            );


        console.log(
            "Save result:",
            result
        );


        /*
         * Backend failure.
         */

        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                getServerMessage(
                    result,
                    "Unable to save task."
                )
            );

        }


        /*
         * IMPORTANT:
         *
         * Do NOT immediately add the task
         * manually to `tasks`.
         *
         * Instead, fetch the actual data
         * from Apps Script again.
         *
         * This prevents the frontend from
         * displaying data that wasn't really
         * written to Google Sheets.
         */

        const refreshed =
            await loadTasks();


        if (!refreshed) {

            /*
             * The save succeeded, but the
             * refresh failed.
             */

            closeTaskModal();


            showNotification(
                "Saved",
                "Task was saved, but the latest task list could not be refreshed. Please refresh once."
            );


            return;

        }


        /*
         * Close only after successful
         * save + refresh.
         */

        closeTaskModal();


        showNotification(
            isEditing
                ? "Task Updated"
                : "Task Created",

            isEditing
                ? "Task updated successfully."
                : "New task created successfully."
        );


        /*
         * Make sure the tasks page is
         * rendered using the fresh data.
         */

        renderTasksTable();


        /*
         * Update dashboard counters.
         */

        updateDashboard();


        updateTaskCounts();

        updateFollowupSummary();

    }

    catch (error) {

        console.error(
            "SAVE TASK ERROR:",
            error
        );


        showNotification(
            "Save Error",
            error.message ||
            "Unable to save task."
        );

    }

    finally {

        if (submitButton) {

            submitButton.disabled =
                false;


            submitButton.textContent =
                submitButton.dataset.originalText ||
                "Save Task";

        }

    }

}


/* =========================================================
   EDIT TASK
========================================================= */

function editTask(
    taskId
) {

    if (
        !taskId
    ) {

        return;

    }


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
            "Task Not Found",
            "The selected task is no longer available. Refresh the task list and try again."
        );


        return;

    }


    /*
     * Check access before opening.
     */

    if (
        !hasFullAccess() &&
        !canAccessDepartment(
            task.department
        )
    ) {

        showNotification(
            "Access Denied",
            "You do not have permission to edit this task."
        );


        return;

    }


    openTaskModal(
        task
    );

}


/* =========================================================
   ADD TASK BUTTONS
========================================================= */

function initializeTaskButtons() {

    const addButtonIds = [

        "addTaskButton",

        "addTaskBtn",

        "createTaskButton",

        "createNewTask",

        "newTaskButton"

    ];


    addButtonIds.forEach(
        function (id) {

            const button =
                document.getElementById(
                    id
                );


            if (!button) {

                return;

            }


            /*
             * Avoid duplicate listeners.
             */

            if (
                button.dataset.taskButtonInitialized ===
                "true"
            ) {

                return;

            }


            button.dataset.taskButtonInitialized =
                "true";


            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    openTaskModal();

                }
            );

        }
    );

}


/* =========================================================
   MODAL UX
========================================================= */

function initializeTaskModalUX() {

    const modal =
        document.getElementById(
            "taskModal"
        );


    if (!modal) {

        return;

    }


    /*
     * Close buttons.
     */

    modal
        .querySelectorAll(
            "[data-close-modal], " +
            ".close-modal, " +
            ".modal-close"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        closeTaskModal();

                    }
                );

            }
        );


    /*
     * Clicking the backdrop closes
     * the modal.
     */

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modal
            ) {

                closeTaskModal();

            }

        }
    );


    /*
     * Escape closes modal.
     */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                if (
                    modal.classList.contains(
                        "show"
                    )
                ) {

                    closeTaskModal();

                }

            }

        }
    );

}
/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    /*
     * Always calculate dashboard numbers
     * from the current visible task array.
     */

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "Completed"
                );

            }
        ).length;


    const overdue =
        tasks.filter(
            function (task) {

                return isOverdue(
                    task
                );

            }
        ).length;


    const open =
        tasks.filter(
            function (task) {

                const status =
                    normalizeStatus(
                        task.status
                    );


                return (
                    status !==
                    "Completed" &&
                    !isOverdue(
                        task
                    )
                );

            }
        ).length;


    const inProgress =
        tasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "In Progress"
                );

            }
        ).length;


    /*
     * Update the common dashboard
     * counter IDs.
     */

    setMultipleText(
        [
            "totalTasks",
            "totalTaskCount",
            "dashboardTotalTasks"
        ],
        total
    );


    setMultipleText(
        [
            "completedTasks",
            "completedTaskCount",
            "dashboardCompletedTasks"
        ],
        completed
    );


    setMultipleText(
        [
            "overdueTasks",
            "overdueTaskCount",
            "dashboardOverdueTasks"
        ],
        overdue
    );


    setMultipleText(
        [
            "openTasks",
            "openTaskCount",
            "dashboardOpenTasks"
        ],
        open
    );


    setMultipleText(
        [
            "inProgressTasks",
            "inProgressTaskCount",
            "dashboardInProgressTasks"
        ],
        inProgress
    );


    /*
     * Completion percentage.
     */

    const completionRate =
        total > 0
            ? Math.round(
                (
                    completed /
                    total
                ) * 100
            )
            : 0;


    setMultipleText(
        [
            "completionRate",
            "taskCompletionRate",
            "dashboardCompletionRate"
        ],
        completionRate + "%"
    );


    /*
     * Update progress bars if they
     * exist in the HTML.
     */

    document
        .querySelectorAll(
            "[data-completion-progress]"
        )
        .forEach(
            function (element) {

                element.style.width =
                    completionRate +
                    "%";

            }
        );


    /*
     * Render department overview.
     */

    renderDepartmentOverview();


    /*
     * Render recent tasks.
     */

    renderRecentTasks();


    /*
     * Render today's follow-ups.
     */

    renderTodayFollowups();

}


/* =========================================================
   SET MULTIPLE TEXT ELEMENTS
========================================================= */

function setMultipleText(
    ids,
    value
) {

    if (
        !Array.isArray(
            ids
        )
    ) {

        return;

    }


    ids.forEach(
        function (id) {

            setText(
                id,
                value
            );

        }
    );

}


/* =========================================================
   UPDATE TASK COUNTS
========================================================= */

function updateTaskCounts() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "Completed"
                );

            }
        ).length;


    const overdue =
        tasks.filter(
            function (task) {

                return isOverdue(
                    task
                );

            }
        ).length;


    const pending =
        total -
        completed;


    setMultipleText(
        [
            "totalTasks",
            "totalTaskCount"
        ],
        total
    );


    setMultipleText(
        [
            "completedTasks",
            "completedTaskCount"
        ],
        completed
    );


    setMultipleText(
        [
            "pendingTasks",
            "pendingTaskCount"
        ],
        pending
    );


    setMultipleText(
        [
            "overdueTasks",
            "overdueTaskCount"
        ],
        overdue
    );

}


/* =========================================================
   DEPARTMENT STATISTICS
========================================================= */

function getDepartmentStats(
    department
) {

    const normalized =
        normalizeDepartmentName(
            department
        );


    const departmentTasks =
        tasks.filter(
            function (task) {

                return (
                    normalizeDepartmentName(
                        task.department
                    ) ===
                    normalized
                );

            }
        );


    const total =
        departmentTasks.length;


    const completed =
        departmentTasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "Completed"
                );

            }
        ).length;


    const overdue =
        departmentTasks.filter(
            function (task) {

                return isOverdue(
                    task
                );

            }
        ).length;


    const inProgress =
        departmentTasks.filter(
            function (task) {

                return (
                    normalizeStatus(
                        task.status
                    ) ===
                    "In Progress"
                );

            }
        ).length;


    const open =
        departmentTasks.filter(
            function (task) {

                const status =
                    normalizeStatus(
                        task.status
                    );


                return (
                    status ===
                    "Open"
                );

            }
        ).length;


    return {

        department:
            normalized,

        total:
            total,

        completed:
            completed,

        overdue:
            overdue,

        inProgress:
            inProgress,

        open:
            open

    };

}


/* =========================================================
   ALL DEPARTMENT STATISTICS
========================================================= */

function getAllDepartmentStats() {

    return DEPARTMENTS.map(
        function (department) {

            return getDepartmentStats(
                department
            );

        }
    );

}


/* =========================================================
   DEPARTMENT OVERVIEW
========================================================= */

function renderDepartmentOverview() {

    const container =
        document.getElementById(
            "departmentOverview"
        );


    /*
     * If the section has been removed
     * from your HTML, simply do nothing.
     *
     * This is intentional because you
     * previously wanted this section
     * removed from the dashboard.
     */

    if (!container) {

        return;

    }


    /*
     * If the section is explicitly
     * disabled, don't render it.
     */

    if (
        container.dataset.disabled ===
        "true"
    ) {

        return;

    }


    const stats =
        getAllDepartmentStats();


    container.innerHTML =
        "";


    stats.forEach(
        function (item) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "department-overview-card";


            const completion =
                item.total > 0
                    ? Math.round(
                        (
                            item.completed /
                            item.total
                        ) * 100
                    )
                    : 0;


            card.innerHTML =
                `
                <div class="department-card-header">

                    <div>

                        <h3>
                            ${escapeHTML(
                                item.department
                            )}
                        </h3>

                        <span class="department-code">

                            ${escapeHTML(
                                getDepartmentCode(
                                    item.department
                                )
                            )}

                        </span>

                    </div>

                    <strong>

                        ${item.total}

                    </strong>

                </div>


                <div class="department-card-stats">

                    <span>
                        Open: ${item.open}
                    </span>

                    <span>
                        In Progress: ${item.inProgress}
                    </span>

                    <span>
                        Completed: ${item.completed}
                    </span>

                    <span>
                        Overdue: ${item.overdue}
                    </span>

                </div>


                <div class="department-progress">

                    <div
                        class="department-progress-bar"
                        style="width:${completion}%">

                    </div>

                </div>


                <div class="department-progress-label">

                    ${completion}% completed

                </div>
                `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   DEPARTMENT CARDS PAGE
========================================================= */

function renderDepartmentCards() {

    const container =
        document.getElementById(
            "departmentsContainer"
        );


    if (!container) {

        return;

    }


    const allowed =
        hasFullAccess()
            ? DEPARTMENTS
            : getAllowedDepartments();


    container.innerHTML =
        "";


    allowed.forEach(
        function (department) {

            const stats =
                getDepartmentStats(
                    department
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "department-card";


            card.innerHTML =
                `
                <div class="department-card-header">

                    <div>

                        <h3>
                            ${escapeHTML(
                                stats.department
                            )}
                        </h3>

                        <small>

                            ${escapeHTML(
                                getDepartmentCode(
                                    stats.department
                                )
                            )}

                        </small>

                    </div>

                    <span class="department-total">

                        ${stats.total}

                    </span>

                </div>


                <div class="department-stat-row">

                    <span>Open</span>

                    <strong>
                        ${stats.open}
                    </strong>

                </div>


                <div class="department-stat-row">

                    <span>In Progress</span>

                    <strong>
                        ${stats.inProgress}
                    </strong>

                </div>


                <div class="department-stat-row">

                    <span>Completed</span>

                    <strong>
                        ${stats.completed}
                    </strong>

                </div>


                <div class="department-stat-row">

                    <span>Overdue</span>

                    <strong>
                        ${stats.overdue}
                    </strong>

                </div>


                <button
                    type="button"
                    class="department-view-button"
                    data-department="${escapeHTML(
                        stats.department
                    )}">

                    View Tasks

                </button>
                `;


            container.appendChild(
                card
            );

        }
    );


    /*
     * Event delegation.
     */

    container
        .querySelectorAll(
            ".department-view-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const department =
                            button.dataset.department;


                        openDepartment(
                            department
                        );

                    }
                );

            }
        );

}


/* =========================================================
   OPEN DEPARTMENT
========================================================= */

function openDepartment(
    department
) {

    const normalized =
        normalizeDepartmentName(
            department
        );


    if (
        !normalized
    ) {

        return;

    }


    if (
        !hasFullAccess() &&
        !canAccessDepartment(
            normalized
        )
    ) {

        showNotification(
            "Access Denied",
            "You do not have access to this department."
        );


        return;

    }


    currentDepartment =
        normalized;


    /*
     * Apply department filter.
     */

    setInput(
        "departmentFilter",
        normalized
    );


    /*
     * Open task page.
     */

    showPage(
        "tasks"
    );


    renderTasksTable();

}


/* =========================================================
   RECENT TASKS
========================================================= */

function renderRecentTasks() {

    const container =
        document.getElementById(
            "recentTasks"
        );


    if (!container) {

        return;

    }


    const recent =
        [...tasks]
        .sort(
            function (a, b) {

                const aDate =
                    parseDate(
                        a.updatedDate ||
                        a.createdDate
                    );


                const bDate =
                    parseDate(
                        b.updatedDate ||
                        b.createdDate
                    );


                return (
                    (bDate?.getTime() || 0) -
                    (aDate?.getTime() || 0)
                );

            }
        )
        .slice(
            0,
            5
        );


    container.innerHTML =
        "";


    if (
        !recent.length
    ) {

        container.innerHTML =
            `
            <div class="empty-state">

                No recent tasks.

            </div>
            `;


        return;

    }


    recent.forEach(
        function (task) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "recent-task-item";


            item.innerHTML =
                `
                <div class="recent-task-main">

                    <strong>

                        ${escapeHTML(
                            task.task ||
                            "-"
                        )}

                    </strong>

                    <span>

                        ${escapeHTML(
                            task.department ||
                            "-"
                        )}

                    </span>

                </div>


                <div class="recent-task-meta">

                    ${statusBadge(
                        task.status,
                        task
                    )}

                    <small>

                        ${displayDate(
                            task.updatedDate ||
                            task.createdDate
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
   TODAY'S FOLLOW-UPS
========================================================= */

function renderTodayFollowups() {

    const container =
        document.getElementById(
            "todayFollowups"
        );


    if (!container) {

        return;

    }


    const today =
        new Date();


    const followups =
        tasks.filter(
            function (task) {

                return (
                    task.followupDate &&
                    sameDate(
                        task.followupDate,
                        today
                    ) &&
                    normalizeStatus(
                        task.status
                    ) !==
                    "Completed"
                );

            }
        );


    container.innerHTML =
        "";


    if (
        !followups.length
    ) {

        container.innerHTML =
            `
            <div class="empty-state">

                No follow-ups scheduled for today.

            </div>
            `;


        return;

    }


    followups.forEach(
        function (task) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "followup-item";


            item.innerHTML =
                `
                <div>

                    <strong>

                        ${escapeHTML(
                            task.task ||
                            "-"
                        )}

                    </strong>

                    <small>

                        ${escapeHTML(
                            task.assignedTo ||
                            "Unassigned"
                        )}

                    </small>

                </div>


                <span>

                    ${escapeHTML(
                        task.lastAction ||
                        "Follow-up due"
                    )}

                </span>
                `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   UPDATE ALL VIEWS
========================================================= */

function updateAllViews() {

    /*
     * Main task table.
     */

    renderTasksTable();


    /*
     * Dashboard.
     */

    updateDashboard();


    /*
     * Counters.
     */

    updateTaskCounts();


    /*
     * Follow-up summary.
     */

    updateFollowupSummary();


    /*
     * Department cards.
     */

    renderDepartmentCards();

}
/* =========================================================
   FOLLOW-UP SYSTEM
========================================================= */

function updateFollowupSummary() {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    /*
     * Follow-ups scheduled for today.
     */

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


    /*
     * Follow-ups before today.
     */

    const overdue =
        tasks.filter(
            function (task) {

                if (
                    !task.followupDate
                ) {

                    return false;

                }


                /*
                 * Completed tasks do not need
                 * follow-up attention.
                 */

                if (
                    normalizeStatus(
                        task.status
                    ) ===
                    "Completed"
                ) {

                    return false;

                }


                return dateBeforeToday(
                    task.followupDate
                );

            }
        ).length;


    /*
     * Future follow-ups.
     */

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


                if (!date) {

                    return false;

                }


                date.setHours(
                    0,
                    0,
                    0,
                    0
                );


                return (
                    date >
                    today
                );

            }
        ).length;


    /*
     * Dashboard counters.
     */

    setMultipleText(
        [
            "followupsToday",
            "followupPageToday"
        ],
        todayCount
    );


    setMultipleText(
        [
            "followupsOverdue",
            "followupPageOverdue"
        ],
        overdue
    );


    setMultipleText(
        [
            "followupsUpcoming",
            "followupPageUpcoming"
        ],
        upcoming
    );

}


/* =========================================================
   RENDER FOLLOW-UP TABLE
========================================================= */

function renderFollowups() {

    const tbody =
        document.getElementById(
            "followupsTable"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML =
        "";


    const followups =
        tasks
            .filter(
                function (task) {

                    return (
                        task.followupDate
                    );

                }
            )
            .sort(
                function (a, b) {

                    const dateA =
                        parseDate(
                            a.followupDate
                        );


                    const dateB =
                        parseDate(
                            b.followupDate
                        );


                    return (
                        (dateA?.getTime() || 0) -
                        (dateB?.getTime() || 0)
                    );

                }
            );


    if (
        !followups.length
    ) {

        tbody.innerHTML =
            `
            <tr>

                <td
                    colspan="7"
                    class="empty-table">

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


            /*
             * Determine follow-up state.
             */

            const followupDate =
                parseDate(
                    task.followupDate
                );


            const completed =
                normalizeStatus(
                    task.status
                ) ===
                "Completed";


            let followupClass =
                "";


            let followupLabel =
                "Upcoming";


            if (
                completed
            ) {

                followupClass =
                    "followup-completed";


                followupLabel =
                    "Completed";

            }

            else if (
                sameDate(
                    task.followupDate,
                    new Date()
                )
            ) {

                followupClass =
                    "followup-today";


                followupLabel =
                    "Today";

            }

            else if (
                followupDate &&
                dateBeforeToday(
                    task.followupDate
                )
            ) {

                followupClass =
                    "followup-overdue";


                followupLabel =
                    "Overdue";

            }


            row.className =
                followupClass;


            row.innerHTML =
                `
                <td>

                    ${escapeHTML(
                        task.taskId ||
                        "-"
                    )}

                </td>


                <td>

                    <strong>

                        ${escapeHTML(
                            task.task ||
                            "-"
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHTML(
                        task.department ||
                        "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        task.assignedTo ||
                        "Unassigned"
                    )}

                </td>


                <td>

                    ${displayDate(
                        task.followupDate
                    )}

                </td>


                <td>

                    <span
                        class="followup-status ${followupClass}">

                        ${followupLabel}

                    </span>

                </td>


                <td>

                    <button
                        type="button"
                        class="table-action edit-followup-task"
                        data-task-id="${escapeHTML(
                            task.taskId
                        )}">

                        View

                    </button>

                </td>

                `;


            tbody.appendChild(
                row
            );

        }
    );


    /*
     * Event delegation.
     */

    tbody
        .querySelectorAll(
            ".edit-followup-task"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        editTask(
                            button.dataset.taskId
                        );

                    }
                );

            }
        );

}


/* =========================================================
   FOLLOW-UP PAGE INITIALIZATION
========================================================= */

function initializeFollowups() {

    /*
     * Render immediately if the
     * follow-up table exists.
     */

    renderFollowups();


    updateFollowupSummary();

}


/* =========================================================
   FOLLOW-UP REFRESH
========================================================= */

function refreshFollowups() {

    updateFollowupSummary();

    renderFollowups();

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


    /*
     * If the notification HTML isn't
     * present, don't crash the app.
     */

    if (
        !notification
    ) {

        /*
         * Still log the notification
         * for debugging.
         */

        console.log(
            title +
            ": " +
            message
        );


        return;

    }


    if (
        titleElement
    ) {

        titleElement.textContent =
            title ||
            "";

    }


    if (
        messageElement
    ) {

        messageElement.textContent =
            message ||
            "";

    }


    /*
     * Clear an existing timer so
     * repeated notifications don't
     * interfere with each other.
     */

    if (
        notificationTimeout
    ) {

        clearTimeout(
            notificationTimeout
        );

    }


    notification.classList.add(
        "show"
    );


    notificationTimeout =
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
   CLOSE NOTIFICATION
========================================================= */

function closeNotification() {

    const notification =
        document.getElementById(
            "notification"
        );


    if (!notification) {

        return;

    }


    notification.classList.remove(
        "show"
    );


    if (
        notificationTimeout
    ) {

        clearTimeout(
            notificationTimeout
        );


        notificationTimeout =
            null;

    }

}


/* =========================================================
   NOTIFICATION CLOSE BUTTON
========================================================= */

function initializeNotification() {

    const notification =
        document.getElementById(
            "notification"
        );


    if (!notification) {

        return;

    }


    const closeButton =
        notification.querySelector(
            "[data-close-notification], " +
            ".notification-close, " +
            ".close-notification"
        );


    if (!closeButton) {

        return;

    }


    if (
        closeButton.dataset.initialized ===
        "true"
    ) {

        return;

    }


    closeButton.dataset.initialized =
        "true";


    closeButton.addEventListener(
        "click",
        function () {

            closeNotification();

        }
    );

}


/* =========================================================
   NOTIFICATION HELPERS
========================================================= */

function notifySuccess(
    message
) {

    showNotification(
        "Success",
        message
    );

}


function notifyError(
    message
) {

    showNotification(
        "Error",
        message
    );

}


function notifyInfo(
    message
) {

    showNotification(
        "Information",
        message
    );

}


/* =========================================================
   REFRESH FOLLOW-UP DATA AFTER TASK SAVE
========================================================= */

function updateFollowupsAfterTaskChange() {

    updateFollowupSummary();

    renderFollowups();

    renderTodayFollowups();

}
/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(
    action,
    data = {}
) {

    if (!API_URL) {

        console.error(
            "API_URL is not configured."
        );


        return {

            success:
                false,

            message:
                "API URL is not configured."

        };

    }


    if (!action) {

        return {

            success:
                false,

            message:
                "API action is missing."

        };

    }


    try {

        const payload = {

            action:
                action,

            ...data

        };


        console.log(
            "API REQUEST:",
            action,
            payload
        );


        const response =
            await fetch(
                API_URL,
                {

                    method:
                        "POST",

                    cache:
                        "no-store",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        /*
         * HTTP-level failure.
         */

        if (
            !response.ok
        ) {

            throw new Error(
                "HTTP " +
                response.status +
                " " +
                response.statusText
            );

        }


        /*
         * Read response as text first.
         *
         * This is safer with Apps Script because
         * a deployment/proxy error can sometimes
         * return HTML instead of JSON.
         */

        const responseText =
            await response.text();


        if (
            !responseText
        ) {

            throw new Error(
                "Empty response received from Google Apps Script."
            );

        }


        let result;


        try {

            result =
                JSON.parse(
                    responseText
                );

        }

        catch (
            jsonError
        ) {

            console.error(
                "INVALID API JSON:",
                responseText
            );


            throw new Error(
                "Invalid response received from Google Apps Script."
            );

        }


        console.log(
            "API RESPONSE:",
            action,
            result
        );


        return result;

    }

    catch (
        error
    ) {

        console.error(
            "API ERROR:",
            action,
            error
        );


        /*
         * Don't show a notification here for
         * every API call if the caller is going
         * to display a more specific error.
         */

        return {

            success:
                false,

            message:
                error.message ||
                "Unable to connect to Google Sheets.",

            error:
                true

        };

    }

}


/* =========================================================
   LOAD TASKS
========================================================= */

async function loadTasks() {

    /*
     * Don't destroy the existing task list
     * while a new request is being made.
     *
     * This is important if the API temporarily
     * fails after a successful save.
     */

    const previousTasks =
        Array.isArray(
            tasks
        )
            ? [...tasks]
            : [];


    try {

        console.log(
            "Loading tasks..."
        );


        const result =
            await apiRequest(
                "getTasks"
            );


        if (
            !result ||
            !result.success
        ) {

            console.error(
                "LOAD TASKS ERROR:",
                result?.message ||
                "Unknown server error"
            );


            /*
             * KEEP the existing tasks.
             *
             * Do NOT replace them with [].
             */

            tasks =
                previousTasks;


            updateAllViews();


            showNotification(
                "Unable to Refresh",
                result?.message ||
                "Could not load the latest tasks from Google Sheets."
            );


            return false;

        }


        /*
         * Apps Script may return either:
         *
         * result.tasks
         *
         * or
         *
         * result.data
         */

        const serverTasks =
            Array.isArray(
                result.tasks
            )
                ? result.tasks
                : (
                    Array.isArray(
                        result.data
                    )
                        ? result.data
                        : []
                );


        console.log(
            "Tasks received from server:",
            serverTasks.length
        );


        const normalizedTasks =
            normalizeTasks(
                serverTasks
            );


        /*
         * Apply access control only after
         * receiving valid server data.
         */

        const visibleTasks =
            filterTasksForCurrentUser(
                normalizedTasks
            );


        /*
         * Replace local state ONLY after
         * successful server response.
         */

        tasks =
            visibleTasks;


        console.log(
            "Visible tasks:",
            tasks.length
        );


        /*
         * Update everything using the
         * fresh server data.
         */

        updateAllViews();


        refreshFollowups();


        return true;

    }

    catch (
        error
    ) {

        console.error(
            "LOAD TASKS EXCEPTION:",
            error
        );


        /*
         * Preserve the existing list.
         */

        tasks =
            previousTasks;


        updateAllViews();


        showNotification(
            "Connection Error",
            error.message ||
            "Unable to load tasks from Google Sheets."
        );


        return false;

    }

}


/* =========================================================
   REFRESH TASKS
========================================================= */

async function refreshTasks(
    showMessage = true
) {

    const success =
        await loadTasks();


    if (
        success &&
        showMessage
    ) {

        showNotification(
            "Updated",
            "Task list refreshed successfully."
        );

    }


    return success;

}


/* =========================================================
   FILTER TASKS FOR CURRENT USER
========================================================= */

function filterTasksForCurrentUser(
    allTasks
) {

    if (
        !Array.isArray(
            allTasks
        )
    ) {

        return [];

    }


    /*
     * No authenticated user means
     * no task access.
     */

    if (
        !currentUser
    ) {

        console.warn(
            "No authenticated user found."
        );


        return [];

    }


    const role =
        String(
            currentUser.role ||
            ""
        )
        .trim()
        .toLowerCase();


    /*
     * Administrators / managers with
     * full access see all tasks.
     */

    if (
        role === "admin" ||
        role === "administrator" ||
        role === "manager" ||
        role === "super admin" ||
        role === "superadmin"
    ) {

        return allTasks;

    }


    /*
     * Determine departments assigned
     * to the current user.
     */

    const allowedDepartments =
        getAllowedDepartments();


    /*
     * If the user has no department
     * restriction configured, preserve
     * the existing behavior and use the
     * user's department when available.
     */

    const userDepartment =
        normalizeDepartmentName(
            currentUser.department ||
            ""
        );


    return allTasks.filter(
        function (task) {

            const taskDepartment =
                normalizeDepartmentName(
                    task.department ||
                    ""
                );


            /*
             * Department access.
             */

            if (
                allowedDepartments.length
            ) {

                if (
                    allowedDepartments.some(
                        function (department) {

                            return (
                                normalizeDepartmentName(
                                    department
                                ) ===
                                taskDepartment
                            );

                        }
                    )
                ) {

                    return true;

                }

            }


            /*
             * Direct department fallback.
             */

            if (
                userDepartment &&
                taskDepartment ===
                    userDepartment
            ) {

                return true;

            }


            /*
             * Assigned-to fallback.
             *
             * This allows a user to see tasks
             * specifically assigned to them.
             */

            const assignedTo =
                String(
                    task.assignedTo ||
                    ""
                )
                .trim()
                .toLowerCase();


            const username =
                String(
                    currentUser.username ||
                    ""
                )
                .trim()
                .toLowerCase();


            const name =
                String(
                    currentUser.name ||
                    ""
                )
                .trim()
                .toLowerCase();


            if (
                assignedTo &&
                (
                    (
                        username &&
                        assignedTo ===
                            username
                    ) ||
                    (
                        name &&
                        assignedTo ===
                            name
                    )
                )
            ) {

                return true;

            }


            return false;

        }
    );

}


/* =========================================================
   API SERVER MESSAGE
========================================================= */

function getServerMessage(
    result,
    fallback
) {

    if (
        !result
    ) {

        return (
            fallback ||
            "An unknown server error occurred."
        );

    }


    return (
        result.message ||
        result.error ||
        result.reason ||
        fallback ||
        "An unknown server error occurred."
    );

}
