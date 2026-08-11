/* =========================================================
   USEDBOOKR OPERATIONS CONTROL TOWER
   JAVASCRIPT - V1
========================================================= */


/* =========================================================
   SYSTEM DATA
========================================================= */

const DEPARTMENTS = [
    "Projects / Operations",
    "Software / IT",
    "Digital Marketing",
    "B2B",
    "Warehouse",
    "Finance",
    "Scanning / Catalog",
    "Pricing",
    "Listing / Inventory"
];


const PRIORITIES = [
    "P0",
    "P1",
    "P2",
    "P3"
];


const STATUSES = [
    "Not Started",
    "Planned",
    "In Progress",
    "Waiting",
    "Blocked",
    "Review",
    "Verified",
    "Completed",
    "Cancelled"
];


const TASK_TYPES = [
    "Operational Task",
    "Issue",
    "Follow-up",
    "Project",
    "Customer",
    "Vendor",
    "Internal",
    "Management",
    "System",
    "Other"
];


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY =
    "usedbookr_operations_tasks_v1";


let tasks = loadTasks();


/* =========================================================
   DOM HELPERS
========================================================= */

function $(id) {

    return document.getElementById(id);

}


/* =========================================================
   DATE HELPERS
========================================================= */

function todayString() {

    const date = new Date();

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1)
        .padStart(2, "0");

    const day =
        String(date.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(
        dateString + "T00:00:00"
    );

    if (Number.isNaN(date.getTime())) {
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


function isOverdue(task) {

    if (!task.deadline) {
        return false;
    }

    if (
        task.status === "Completed" ||
        task.status === "Cancelled"
    ) {
        return false;
    }

    return task.deadline < todayString();
}


function isDueToday(task) {

    if (!task.deadline) {
        return false;
    }

    if (
        task.status === "Completed" ||
        task.status === "Cancelled"
    ) {
        return false;
    }

    return task.deadline === todayString();
}


function isFollowupDue(task) {

    if (!task.followup) {
        return false;
    }

    if (
        task.status === "Completed" ||
        task.status === "Cancelled"
    ) {
        return false;
    }

    return task.followup <= todayString();
}


/* =========================================================
   STORAGE FUNCTIONS
========================================================= */

function loadTasks() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {
            return createDemoTasks();
        }

        const parsed =
            JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return createDemoTasks();
        }

        return parsed;

    } catch (error) {

        console.error(
            "Unable to load tasks:",
            error
        );

        return createDemoTasks();
    }
}


function saveTasks() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );

    renderAll();
}


/* =========================================================
   TASK ID
========================================================= */

function generateTaskId() {

    const now = new Date();

    const year =
        String(now.getFullYear());

    const number =
        tasks.length + 1;

    return `OPS-${year}-${String(number).padStart(4, "0")}`;
}


/* =========================================================
   DEMO DATA
========================================================= */

function createDemoTasks() {

    const today =
        todayString();

    const yesterday =
        new Date();

    yesterday.setDate(
        yesterday.getDate() - 1
    );

    const yesterdayString =
        yesterday.toISOString()
            .split("T")[0];


    const tomorrow =
        new Date();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    const tomorrowString =
        tomorrow.toISOString()
            .split("T")[0];


    const demoTasks = [

        {
            id: "OPS-2026-0001",
            taskName:
                "Review pending warehouse book intake",
            department:
                "Warehouse",
            area:
                "Book Intake",
            taskType:
                "Operational Task",
            priority:
                "P1",
            owner:
                "Warehouse Head",
            coordinator:
                "Operations",
            raised:
                yesterdayString,
            deadline:
                today,
            status:
                "In Progress",
            progress:
                60,
            dependency:
                "Warehouse stock verification",
            followup:
                today,
            nextAction:
                "Verify remaining stock and update register",
            escalation:
                "Monitor",
            verification:
                "Pending",
            verificationOwner:
                "Operations Head",
            source:
                "Daily Operations",
            outcome:
                "",
            notes:
                "Initial intake completed."
        },

        {
            id: "OPS-2026-0002",
            taskName:
                "Resolve website inventory sync issue",
            department:
                "Software / IT",
            area:
                "Inventory System",
            taskType:
                "Issue",
            priority:
                "P0",
            owner:
                "IT Head",
            coordinator:
                "Operations",
            raised:
                yesterdayString,
            deadline:
                yesterdayString,
            status:
                "Blocked",
            progress:
                30,
            dependency:
                "Developer investigation",
            followup:
                today,
            nextAction:
                "Confirm root cause and provide resolution ETA",
            escalation:
                "Management Attention",
            verification:
                "Pending",
            verificationOwner:
                "Operations Head",
            source:
                "Management Review",
            outcome:
                "",
            notes:
                "High priority system issue."
        },

        {
            id: "OPS-2026-0003",
            taskName:
                "Prepare B2B customer follow-up list",
            department:
                "B2B",
            area:
                "Customer Follow-up",
            taskType:
                "Follow-up",
            priority:
                "P1",
            owner:
                "B2B Head",
            coordinator:
                "Operations",
            raised:
                today,
            deadline:
                tomorrowString,
            status:
                "Waiting",
            progress:
                40,
            dependency:
                "Customer response",
            followup:
                tomorrowString,
            nextAction:
                "Contact pending customers",
            escalation:
                "None",
            verification:
                "Not Required",
            verificationOwner:
                "",
            source:
                "B2B Review",
            outcome:
                "",
            notes:
                ""
        },

        {
            id: "OPS-2026-0004",
            taskName:
                "Complete monthly pricing review",
            department:
                "Pricing",
            area:
                "Pricing",
            taskType:
                "Operational Task",
            priority:
                "P2",
            owner:
                "Pricing Head",
            coordinator:
                "Operations",
            raised:
                yesterdayString,
            deadline:
                tomorrowString,
            status:
                "Review",
            progress:
                85,
            dependency:
                "",
            followup:
                tomorrowString,
            nextAction:
                "Submit final pricing sheet for verification",
            escalation:
                "None",
            verification:
                "Pending",
            verificationOwner:
                "Operations Head",
            source:
                "Monthly Review",
            outcome:
                "",
            notes:
                ""
        },

        {
            id: "OPS-2026-0005",
            taskName:
                "Complete pending catalogue scanning",
            department:
                "Scanning / Catalog",
            area:
                "Catalogue",
            taskType:
                "Project",
            priority:
                "P2",
            owner:
                "Scanning Head",
            coordinator:
                "Operations",
            raised:
                today,
            deadline:
                tomorrowString,
            status:
                "In Progress",
            progress:
                70,
            dependency:
                "",
            followup:
                tomorrowString,
            nextAction:
                "Complete remaining batch",
            escalation:
                "None",
            verification:
                "Pending",
            verificationOwner:
                "",
            source:
                "Daily Review",
            outcome:
                "",
            notes:
                ""
        },

        {
            id: "OPS-2026-0006",
            taskName:
                "Verify completed inventory listings",
            department:
                "Listing / Inventory",
            area:
                "Website Listing",
            taskType:
                "Verification",
            priority:
                "P3",
            owner:
                "Listing Head",
            coordinator:
                "Operations",
            raised:
                yesterdayString,
            deadline:
                yesterdayString,
            status:
                "Completed",
            progress:
                100,
            dependency:
                "",
            followup:
                "",
            nextAction:
                "Archive completed task",
            escalation:
                "None",
            verification:
                "Verified",
            verificationOwner:
                "Operations Head",
            source:
                "Listing Review",
            outcome:
                "Listings verified.",
            notes:
                ""
        }

    ];

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(demoTasks)
    );

    return demoTasks;
}


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const view =
                    button.dataset.view;

                showView(view);

            }
        );

    });


function showView(view) {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.view === view
            );

        });


    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    const selected =
        $(view);

    if (selected) {

        selected.classList.add(
            "active-section"
        );

    }


    const titles = {

        dashboard:
            [
                "Operations Dashboard",
                "Observe → Understand → Coordinate → Follow up → Escalate → Verify → Close"
            ],

        tasks:
            [
                "All Tasks",
                "Central task register"
            ],

        mytasks:
            [
                "My Department Tasks",
                "Department-level task monitoring"
            ],

        followups:
            [
                "Follow-up Queue",
                "Follow-ups due today or overdue"
            ],

        departments:
            [
                "Department Overview",
                "Workload and exception monitoring"
            ],

        analysis:
            [
                "Operations Analysis",
                "Understand workload, status and exceptions"
            ],

        excel:
            [
                "Excel / Data",
                "Import and export operational data"
            ],

        settings:
            [
                "System Settings",
                "Manage the Operations Control Tower"
            ]

    };


    if (titles[view]) {

        $("page-title").textContent =
            titles[view][0];

        $("page-description").textContent =
            titles[view][1];

    }

}


/* =========================================================
   FORM DROPDOWNS
========================================================= */

function populateDropdowns() {

    const departmentSelects = [
        $("departmentFilter"),
        $("myDepartment"),
        $("taskDepartment")
    ];


    departmentSelects.forEach(
        select => {

            if (!select) {
                return;
            }

            const current =
                select.value;

            const firstOption =
                select.id === "taskDepartment"
                    ? `<option value="">Select Department</option>`
                    : `<option value="">All Departments</option>`;

            select.innerHTML =
                firstOption +
                DEPARTMENTS
                    .map(
                        department =>
                            `<option value="${escapeHtml(department)}">${escapeHtml(department)}</option>`
                    )
                    .join("");


            if (
                DEPARTMENTS.includes(current)
            ) {

                select.value =
                    current;

            }

        }
    );


    $("priorityFilter").innerHTML =
        `<option value="">All Priorities</option>` +
        PRIORITIES
            .map(
                priority =>
                    `<option value="${priority}">${priority}</option>`
            )
            .join("");


    $("statusFilter").innerHTML =
        `<option value="">All Statuses</option>` +
        STATUSES
            .map(
                status =>
                    `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`
            )
            .join("");


    $("taskPriority").innerHTML =
        PRIORITIES
            .map(
                priority =>
                    `<option value="${priority}">${priority}</option>`
            )
            .join("");


    $("taskStatus").innerHTML =
        STATUSES
            .map(
                status =>
                    `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`
            )
            .join("");


    $("taskType").innerHTML =
        TASK_TYPES
            .map(
                type =>
                    `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`
            )
            .join("");

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const active =
        tasks.filter(
            task =>
                task.status !== "Completed" &&
                task.status !== "Cancelled"
        ).length;


    const overdue =
        tasks.filter(
            isOverdue
        ).length;


    const dueToday =
        tasks.filter(
            isDueToday
        ).length;


    const blocked =
        tasks.filter(
            task =>
                task.status === "Blocked"
        ).length;


    const waiting =
        tasks.filter(
            task =>
                task.status === "Waiting"
        ).length;


    const critical =
        tasks.filter(
            task =>
                task.priority === "P0" &&
                task.status !== "Completed" &&
                task.status !== "Cancelled"
        ).length;


    const completed =
        tasks.filter(
            task =>
                task.status === "Completed"
        ).length;


    const followups =
        tasks.filter(
            isFollowupDue
        ).length;


    $("activeCount").textContent =
        active;

    $("overdueCount").textContent =
        overdue;

    $("dueTodayCount").textContent =
        dueToday;

    $("blockedCount").textContent =
        blocked;

    $("waitingCount").textContent =
        waiting;

    $("criticalCount").textContent =
        critical;

    $("completedCount").textContent =
        completed;

    $("followupCount").textContent =
        followups;


    renderDepartmentHealth();

    renderAttentionList();

}


/* =========================================================
   DEPARTMENT HEALTH
========================================================= */

function getDepartmentStats(
    department
) {

    const departmentTasks =
        tasks.filter(
            task =>
                task.department === department
        );


    return {

        open:
            departmentTasks.filter(
                task =>
                    task.status !== "Completed" &&
                    task.status !== "Cancelled"
            ).length,

        overdue:
            departmentTasks.filter(
                isOverdue
            ).length,

        blocked:
            departmentTasks.filter(
                task =>
                    task.status === "Blocked"
            ).length,

        waiting:
            departmentTasks.filter(
                task =>
                    task.status === "Waiting"
            ).length,

        completed:
            departmentTasks.filter(
                task =>
                    task.status === "Completed"
            ).length

    };

}


function renderDepartmentHealth() {

    const table =
        $("departmentHealthTable");

    table.innerHTML = "";


    DEPARTMENTS.forEach(
        department => {

            const stats =
                getDepartmentStats(
                    department
                );


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHtml(department)}
                    </strong>
                </td>

                <td>
                    ${stats.open}
                </td>

                <td>
                    ${
                        stats.overdue > 0
                            ? `<span class="badge priority-p0">${stats.overdue}</span>`
                            : stats.overdue
                    }
                </td>

                <td>
                    ${
                        stats.blocked > 0
                            ? `<span class="badge status-blocked">${stats.blocked}</span>`
                            : stats.blocked
                    }
                </td>

                <td>
                    ${
                        stats.waiting > 0
                            ? `<span class="badge status-waiting">${stats.waiting}</span>`
                            : stats.waiting
                    }
                </td>

                <td>
                    ${
                        stats.completed > 0
                            ? `<span class="badge status-completed">${stats.completed}</span>`
                            : stats.completed
                    }
                </td>

            `;


            table.appendChild(row);

        }
    );

}


/* =========================================================
   NEEDS ATTENTION
========================================================= */

function renderAttentionList() {

    const container =
        $("attentionList");


    const attentionTasks =
        tasks
            .filter(
                task => {

                    return (

                        task.priority === "P0" ||
                        isOverdue(task) ||
                        task.status === "Blocked"

                    );

                }
            )
            .sort(
                sortByUrgency
            )
            .slice(
                0,
                8
            );


    if (!attentionTasks.length) {

        container.innerHTML = `
            <div class="empty-state">
                No urgent tasks.
            </div>
        `;

        return;
    }


    container.innerHTML =
        attentionTasks
            .map(
                task => `

                    <div
                        class="attention-item"
                        onclick="editTask('${task.id}')"
                        style="cursor:pointer"
                    >

                        <div class="attention-title">

                            ${escapeHtml(task.taskName)}

                        </div>

                        <div class="attention-meta">

                            ${priorityBadge(task.priority)}

                            ${statusBadge(task.status)}

                            <span>
                                ${escapeHtml(task.department)}
                            </span>

                            ${
                                isOverdue(task)
                                    ? `<span class="badge overdue-badge">OVERDUE</span>`
                                    : ""
                            }

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   TASK TABLE
========================================================= */

function getFilteredTasks() {

    const search =
        $("taskSearch")
            .value
            .trim()
            .toLowerCase();


    const department =
        $("departmentFilter")
            .value;


    const priority =
        $("priorityFilter")
            .value;


    const status =
        $("statusFilter")
            .value;


    return tasks.filter(
        task => {

            const searchMatch =
                !search ||
                [
                    task.id,
                    task.taskName,
                    task.department,
                    task.owner,
                    task.area,
                    task.nextAction
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(search);


            const departmentMatch =
                !department ||
                task.department === department;


            const priorityMatch =
                !priority ||
                task.priority === priority;


            const statusMatch =
                !status ||
                task.status === status;


            return (
                searchMatch &&
                departmentMatch &&
                priorityMatch &&
                statusMatch
            );

        }
    );

}


function renderTaskTable() {

    const table =
        $("taskTable");


    const filtered =
        getFilteredTasks();


    if (!filtered.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="text-align:center;padding:30px"
                >

                    <span class="empty-state">
                        No tasks found.
                    </span>

                </td>

            </tr>

        `;

        return;
    }


    table.innerHTML =
        filtered
            .sort(sortByUrgency)
            .map(
                task => `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHtml(task.id)}
                            </strong>
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(task.taskName)}
                            </strong>

                            ${
                                task.area
                                    ? `
                                        <br>
                                        <small
                                            style="color:#718096"
                                        >
                                            ${escapeHtml(task.area)}
                                        </small>
                                      `
                                    : ""
                            }
                        </td>

                        <td>
                            ${escapeHtml(task.department)}
                        </td>

                        <td>
                            ${priorityBadge(task.priority)}
                        </td>

                        <td>
                            ${escapeHtml(task.owner)}
                        </td>

                        <td>

                            ${formatDate(task.deadline)}

                            ${
                                isOverdue(task)
                                    ? `<span class="badge overdue-badge">OVERDUE</span>`
                                    : isDueToday(task)
                                        ? `<span class="badge status-waiting">TODAY</span>`
                                        : ""
                            }

                        </td>

                        <td>
                            ${statusBadge(task.status)}
                        </td>

                        <td>
                            ${progressBar(task.progress)}
                        </td>

                        <td>

                            <button
                                class="secondary-button"
                                onclick="editTask('${task.id}')"
                            >
                                Edit
                            </button>

                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   PRIORITY BADGE
========================================================= */

function priorityBadge(priority) {

    const classes = {

        P0: "priority-p0",
        P1: "priority-p1",
        P2: "priority-p2",
        P3: "priority-p3"

    };


    return `
        <span class="badge ${classes[priority] || "status-neutral"}">
            ${escapeHtml(priority)}
        </span>
    `;

}


/* =========================================================
   STATUS BADGE
========================================================= */

function statusBadge(status) {

    let className =
        "status-neutral";


    if (
        status === "Blocked"
    ) {

        className =
            "status-blocked";

    } else if (
        status === "Waiting"
    ) {

        className =
            "status-waiting";

    } else if (
        status === "In Progress"
    ) {

        className =
            "status-progress";

    } else if (
        status === "Completed" ||
        status === "Verified"
    ) {

        className =
            "status-completed";

    } else if (
        status === "Review"
    ) {

        className =
            "status-review";

    }


    return `
        <span class="badge ${className}">
            ${escapeHtml(status)}
        </span>
    `;

}


/* =========================================================
   PROGRESS BAR
========================================================= */

function progressBar(progress) {

    const value =
        Math.max(
            0,
            Math.min(
                100,
                Number(progress) || 0
            )
        );


    return `

        <div class="progress-wrapper">

            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width:${value}%"
                ></div>

            </div>

            <span class="progress-number">
                ${value}%
            </span>

        </div>

    `;

}


/* =========================================================
   SORTING
========================================================= */

function sortByUrgency(a, b) {

    const priorityOrder = {

        P0: 0,
        P1: 1,
        P2: 2,
        P3: 3

    };


    const priorityDifference =
        (
            priorityOrder[a.priority] ?? 99
        ) -
        (
            priorityOrder[b.priority] ?? 99
        );


    if (
        priorityDifference !== 0
    ) {

        return priorityDifference;

    }


    const aOverdue =
        isOverdue(a);

    const bOverdue =
        isOverdue(b);


    if (
        aOverdue !== bOverdue
    ) {

        return aOverdue
            ? -1
            : 1;

    }


    return (
        a.deadline || "9999-12-31"
    )
        .localeCompare(
            b.deadline || "9999-12-31"
        );

}


/* =========================================================
   MY TASKS
========================================================= */

function renderMyTasks() {

    const department =
        $("myDepartment")
            .value;


    const table =
        $("myTaskTable");


    let filtered =
        tasks;


    if (department) {

        filtered =
            tasks.filter(
                task =>
                    task.department === department
            );

    }


    if (!filtered.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;padding:30px"
                >

                    No tasks for this department.

                </td>

            </tr>

        `;

        return;
    }


    table.innerHTML =
        filtered
            .sort(sortByUrgency)
            .map(
                task => `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHtml(task.id)}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(task.taskName)}
                        </td>

                        <td>
                            ${priorityBadge(task.priority)}
                        </td>

                        <td>
                            ${escapeHtml(task.owner)}
                        </td>

                        <td>
                            ${formatDate(task.deadline)}

                            ${
                                isOverdue(task)
                                    ? `<span class="badge overdue-badge">OVERDUE</span>`
                                    : ""
                            }

                        </td>

                        <td>
                            ${statusBadge(task.status)}
                        </td>

                        <td>
                            ${escapeHtml(task.nextAction || "-")}
                        </td>

                        <td>

                            <button
                                class="secondary-button"
                                onclick="editTask('${task.id}')"
                            >
                                Edit
                            </button>

                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   FOLLOW-UP TABLE
========================================================= */

function renderFollowups() {

    const table =
        $("followupTable");


    const followups =
        tasks
            .filter(
                isFollowupDue
            )
            .sort(
                (a, b) =>
                    (
                        a.followup || "9999-12-31"
                    )
                        .localeCompare(
                            b.followup || "9999-12-31"
                        )
            );


    if (!followups.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;padding:30px"
                >

                    No follow-ups currently due.

                </td>

            </tr>

        `;

        return;
    }


    table.innerHTML =
        followups
            .map(
                task => `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHtml(task.taskName)}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(task.department)}
                        </td>

                        <td>
                            ${priorityBadge(task.priority)}
                        </td>

                        <td>

                            ${formatDate(task.followup)}

                            ${
                                task.followup < todayString()
                                    ? `<span class="badge overdue-badge">OVERDUE</span>`
                                    : `<span class="badge status-waiting">TODAY</span>`
                            }

                        </td>

                        <td>
                            ${escapeHtml(task.nextAction || "-")}
                        </td>

                        <td>
                            ${statusBadge(task.status)}
                        </td>

                        <td>

                            <button
                                class="secondary-button"
                                onclick="editTask('${task.id}')"
                            >
                                Open
                            </button>

                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   DEPARTMENT ANALYSIS
========================================================= */

function renderDepartmentAnalysis() {

    const table =
        $("departmentTable");


    table.innerHTML = "";


    DEPARTMENTS.forEach(
        department => {

            const departmentTasks =
                tasks.filter(
                    task =>
                        task.department === department
                );


            const open =
                departmentTasks.filter(
                    task =>
                        task.status !== "Completed" &&
                        task.status !== "Cancelled"
                ).length;


            const p0 =
                departmentTasks.filter(
                    task =>
                        task.priority === "P0" &&
                        task.status !== "Completed" &&
                        task.status !== "Cancelled"
                ).length;


            const overdue =
                departmentTasks.filter(
                    isOverdue
                ).length;


            const blocked =
                departmentTasks.filter(
                    task =>
                        task.status === "Blocked"
                ).length;


            const waiting =
                departmentTasks.filter(
                    task =>
                        task.status === "Waiting"
                ).length;


            const completed =
                departmentTasks.filter(
                    task =>
                        task.status === "Completed"
                ).length;


            table.innerHTML += `

                <tr>

                    <td>
                        <strong>
                            ${escapeHtml(department)}
                        </strong>
                    </td>

                    <td>${open}</td>

                    <td>
                        ${
                            p0
                                ? `<span class="badge priority-p0">${p0}</span>`
                                : 0
                        }
                    </td>

                    <td>
                        ${
                            overdue
                                ? `<span class="badge priority-p0">${overdue}</span>`
                                : 0
                        }
                    </td>

                    <td>
                        ${
                            blocked
                                ? `<span class="badge status-blocked">${blocked}</span>`
                                : 0
                        }
                    </td>

                    <td>
                        ${
                            waiting
                                ? `<span class="badge status-waiting">${waiting}</span>`
                                : 0
                        }
                    </td>

                    <td>
                        ${
                            completed
                                ? `<span class="badge status-completed">${completed}</span>`
                                : 0
                        }
                    </td>

                </tr>

            `;

        }
    );

}


/* =========================================================
   ANALYSIS
========================================================= */

function renderAnalysis() {

    renderPriorityAnalysis();

    renderStatusAnalysis();

    renderExceptions();

}


/* =========================================================
   PRIORITY ANALYSIS
========================================================= */

function renderPriorityAnalysis() {

    const table =
        $("priorityAnalysisTable");


    table.innerHTML = "";


    PRIORITIES.forEach(
        priority => {

            const priorityTasks =
                tasks.filter(
                    task =>
                        task.priority === priority
                );


            const open =
                priorityTasks.filter(
                    task =>
                        task.status !== "Completed" &&
                        task.status !== "Cancelled"
                ).length;


            const overdue =
                priorityTasks.filter(
                    isOverdue
                ).length;


            const blocked =
                priorityTasks.filter(
                    task =>
                        task.status === "Blocked"
                ).length;


            const completed =
                priorityTasks.filter(
                    task =>
                        task.status === "Completed"
                ).length;


            table.innerHTML += `

                <tr>

                    <td>
                        ${priorityBadge(priority)}
                    </td>

                    <td>${open}</td>

                    <td>
                        ${
                            overdue
                                ? `<span class="badge priority-p0">${overdue}</span>`
                                : 0
                        }
                    </td>

                    <td>
                        ${
                            blocked
                                ? `<span class="badge status-blocked">${blocked}</span>`
                                : 0
                        }
                    </td>

                    <td>
                        ${
                            completed
                                ? `<span class="badge status-completed">${completed}</span>`
                                : 0
                        }
                    </td>

                </tr>

            `;

        }
    );

}


/* =========================================================
   STATUS ANALYSIS
========================================================= */

function renderStatusAnalysis() {

    const table =
        $("statusAnalysisTable");


    table.innerHTML = "";


    const total =
        tasks.length;


    STATUSES.forEach(
        status => {

            const count =
                tasks.filter(
                    task =>
                        task.status === status
                ).length;


            const percentage =
                total
                    ? Math.round(
                        (
                            count / total
                        ) * 100
                    )
                    : 0;


            table.innerHTML += `

                <tr>

                    <td>
                        ${statusBadge(status)}
                    </td>

                    <td>
                        ${count}
                    </td>

                    <td>
                        ${percentage}%
                    </td>

                </tr>

            `;

        }
    );

}


/* =========================================================
   EXCEPTIONS
========================================================= */

function renderExceptions() {

    const container =
        $("exceptionList");


    const exceptions = [

        {
            title:
                "Tasks without an owner",

            count:
                tasks.filter(
                    task =>
                        !task.owner ||
                        !task.owner.trim()
                ).length
        },

        {
            title:
                "Tasks without a next action",

            count:
                tasks.filter(
                    task =>
                        task.status !== "Completed" &&
                        task.status !== "Cancelled" &&
                        (
                            !task.nextAction ||
                            !task.nextAction.trim()
                        )
                ).length
        },

        {
            title:
                "Open tasks without deadline",

            count:
                tasks.filter(
                    task =>
                        task.status !== "Completed" &&
                        task.status !== "Cancelled" &&
                        !task.deadline
                ).length
        },

        {
            title:
                "Blocked tasks without dependency",

            count:
                tasks.filter(
                    task =>
                        task.status === "Blocked" &&
                        (
                            !task.dependency ||
                            !task.dependency.trim()
                        )
                ).length
        },

        {
            title:
                "Completed tasks awaiting verification",

            count:
                tasks.filter(
                    task =>
                        task.status === "Completed" &&
                        task.verification === "Pending"
                ).length
        }

    ];


    const activeExceptions =
        exceptions.filter(
            item =>
                item.count > 0
        );


    if (!activeExceptions.length) {

        container.innerHTML = `

            <div class="empty-state">
                No operational exceptions detected.
            </div>

        `;

        return;
    }


    container.innerHTML =
        activeExceptions
            .map(
                item => `

                    <div class="exception-item">

                        <div class="exception-title">
                            ${escapeHtml(item.title)}
                        </div>

                        <div class="exception-number">
                            ${item.count}
                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   OPEN TASK MODAL
========================================================= */

$("newTaskButton")
    .addEventListener(
        "click",
        () => openNewTaskModal()
    );


$("newTaskButton2")
    .addEventListener(
        "click",
        () => openNewTaskModal()
    );


function openNewTaskModal() {

    $("taskForm").reset();

    $("taskId").value = "";

    $("taskRaised").value =
        todayString();

    $("taskProgress").value =
        0;

    $("taskPriority").value =
        "P2";

    $("taskStatus").value =
        "Not Started";

    $("taskType").value =
        "Operational Task";

    $("taskEscalation").value =
        "None";

    $("taskVerification").value =
        "Not Required";


    $("modalTitle").textContent =
        "Create New Task";


    $("taskModal")
        .classList
        .add("show");

}


/* =========================================================
   CLOSE MODAL
========================================================= */

$("closeTaskModal")
    .addEventListener(
        "click",
        closeTaskModal
    );


$("cancelTask")
    .addEventListener(
        "click",
        closeTaskModal
    );


$("taskModal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("taskModal")
            ) {

                closeTaskModal();

            }

        }
    );


function closeTaskModal() {

    $("taskModal")
        .classList
        .remove("show");

}


/* =========================================================
   EDIT TASK
========================================================= */

function editTask(id) {

    const task =
        tasks.find(
            item =>
                item.id === id
        );


    if (!task) {
        return;
    }


    $("taskId").value =
        task.id;

    $("taskName").value =
        task.taskName || "";

    $("taskDepartment").value =
        task.department || "";

    $("taskArea").value =
        task.area || "";

    $("taskType").value =
        task.taskType || "Operational Task";

    $("taskPriority").value =
        task.priority || "P2";

    $("taskOwner").value =
        task.owner || "";

    $("taskCoordinator").value =
        task.coordinator || "";

    $("taskRaised").value =
        task.raised || "";

    $("taskDeadline").value =
        task.deadline || "";

    $("taskStatus").value =
        task.status || "Not Started";

    $("taskProgress").value =
        task.progress || 0;

    $("taskDependency").value =
        task.dependency || "";

    $("taskFollowup").value =
        task.followup || "";

    $("taskNextAction").value =
        task.nextAction || "";

    $("taskEscalation").value =
        task.escalation || "None";

    $("taskVerification").value =
        task.verification || "Not Required";

    $("taskVerificationOwner").value =
        task.verificationOwner || "";

    $("taskSource").value =
        task.source || "";

    $("taskOutcome").value =
        task.outcome || "";

    $("taskNotes").value =
        task.notes || "";


    $("modalTitle").textContent =
        `Edit Task — ${task.id}`;


    $("taskModal")
        .classList
        .add("show");

}


/* =========================================================
   SAVE TASK
========================================================= */

$("taskForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const existingId =
                $("taskId").value;


            const taskData = {

                id:
                    existingId ||
                    generateTaskId(),

                taskName:
                    $("taskName").value.trim(),

                department:
                    $("taskDepartment").value,

                area:
                    $("taskArea").value.trim(),

                taskType:
                    $("taskType").value,

                priority:
                    $("taskPriority").value,

                owner:
                    $("taskOwner").value.trim(),

                coordinator:
                    $("taskCoordinator").value.trim(),

                raised:
                    $("taskRaised").value,

                deadline:
                    $("taskDeadline").value,

                status:
                    $("taskStatus").value,

                progress:
                    Number(
                        $("taskProgress").value
                    ) || 0,

                dependency:
                    $("taskDependency").value.trim(),

                followup:
                    $("taskFollowup").value,

                nextAction:
                    $("taskNextAction").value.trim(),

                escalation:
                    $("taskEscalation").value,

                verification:
                    $("taskVerification").value,

                verificationOwner:
                    $("taskVerificationOwner").value.trim(),

                source:
                    $("taskSource").value.trim(),

                outcome:
                    $("taskOutcome").value.trim(),

                notes:
                    $("taskNotes").value.trim()

            };


            if (
                taskData.status ===
                "Completed"
            ) {

                taskData.progress =
                    100;

            }


            if (existingId) {

                const index =
                    tasks.findIndex(
                        task =>
                            task.id === existingId
                    );


                if (index !== -1) {

                    tasks[index] =
                        taskData;

                }

            } else {

                tasks.push(
                    taskData
                );

            }


            saveTasks();

            closeTaskModal();


            showView(
                "tasks"
            );

        }
    );


/* =========================================================
   FILTER EVENTS
========================================================= */

$("taskSearch")
    .addEventListener(
        "input",
        renderTaskTable
    );


$("departmentFilter")
    .addEventListener(
        "change",
        renderTaskTable
    );


$("priorityFilter")
    .addEventListener(
        "change",
        renderTaskTable
    );


$("statusFilter")
    .addEventListener(
        "change",
        renderTaskTable
    );


$("clearFilters")
    .addEventListener(
        "click",
        () => {

            $("taskSearch").value =
                "";

            $("departmentFilter").value =
                "";

            $("priorityFilter").value =
                "";

            $("statusFilter").value =
                "";

            renderTaskTable();

        }
    );


$("myDepartment")
    .addEventListener(
        "change",
        renderMyTasks
    );


/* =========================================================
   EXPORT CSV
========================================================= */

$("exportTasks")
    .addEventListener(
        "click",
        exportTasksToCSV
    );


function exportTasksToCSV() {

    if (!tasks.length) {

        alert(
            "There are no tasks to export."
        );

        return;

    }


    const headers = [

        "Task ID",
        "Task / Issue",
        "Department",
        "Area / Project",
        "Task Type",
        "Priority",
        "Owner",
        "Coordinator",
        "Date Raised",
        "Deadline",
        "Status",
        "Progress %",
        "Dependency / Waiting For",
        "Next Follow-up",
        "Next Action",
        "Escalation",
        "Verification",
        "Verification Owner",
        "Source",
        "Result / Outcome",
        "Notes"

    ];


    const rows =
        tasks.map(
            task => [

                task.id,
                task.taskName,
                task.department,
                task.area,
                task.taskType,
                task.priority,
                task.owner,
                task.coordinator,
                task.raised,
                task.deadline,
                task.status,
                task.progress,
                task.dependency,
                task.followup,
                task.nextAction,
                task.escalation,
                task.verification,
                task.verificationOwner,
                task.source,
                task.outcome,
                task.notes

            ]
        );


    const csvRows = [

        headers,

        ...rows

    ];


    const csv =
        csvRows
            .map(
                row =>
                    row
                        .map(
                            value =>
                                csvEscape(value)
                        )
                        .join(",")
            )
            .join("\n");


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
        `UsedBookR_Operations_Tasks_${todayString()}.csv`;


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
   CSV ESCAPE
========================================================= */

function csvEscape(value) {

    const stringValue =
        value === null ||
        value === undefined
            ? ""
            : String(value);


    return `"${stringValue
        .replace(/"/g, '""')}"`;

}


/* =========================================================
   RESET DEMO DATA
========================================================= */

$("resetData")
    .addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Reset all current task data and restore the demo data?"
                );


            if (!confirmed) {
                return;
            }


            tasks =
                createDemoTasks();


            renderAll();

            alert(
                "Demo data has been restored."
            );

        }
    );


/* =========================================================
   HTML ESCAPE
========================================================= */

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
   RENDER EVERYTHING
========================================================= */

function renderAll() {

    renderDashboard();

    renderTaskTable();

    renderMyTasks();

    renderFollowups();

    renderDepartmentAnalysis();

    renderAnalysis();

}


/* =========================================================
   INITIALIZE
========================================================= */

function initialize() {

    populateDropdowns();

    $("taskRaised").value =
        todayString();

    $("myDepartment").value =
        "";

    renderAll();

}


/* =========================================================
   START SYSTEM
========================================================= */

initialize();
