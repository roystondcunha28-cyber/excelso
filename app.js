/* =====================================================
   USEDBOOKR OPERATIONS CONTROL TOWER
===================================================== */


/* ================= CONFIG ================= */

const PASSWORD = "UsedBookR@2026";

const STORAGE_KEY =
    "usedbookr_operations_tasks";

const ACTIVITY_KEY =
    "usedbookr_operations_activity";


/* ================= DEPARTMENTS ================= */

const DEPARTMENTS = [

    "Operations",

    "B2B / Sales",

    "Customer Support",

    "Warehouse",

    "Scanning / Catalog",

    "Pricing",

    "Listing / Inventory",

    "Digital Marketing",

    "IT / Software",

    "Finance",

    "Book Fair / Events",

    "Management"

];


/* ================= PRIORITIES ================= */

const PRIORITIES = [

    "P0 - Critical",

    "P1 - High",

    "P2 - Normal",

    "P3 - Low"

];


/* ================= STATUS ================= */

const STATUSES = [

    "Open",

    "In Progress",

    "Waiting",

    "Blocked",

    "Completed",

    "Cancelled"

];


/* ================= VARIABLES ================= */

let tasks = [];

let activity = [];


/* ================= HELPERS ================= */

function $(id) {

    return document.getElementById(id);

}


function today() {

    return new Date()
        .toISOString()
        .slice(0, 10);

}


function taskID() {

    return "TASK-" +
        Date.now()
        .toString(36)
        .toUpperCase();

}


function escapeHTML(value) {

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function dateDisplay(date) {

    if (!date) return "—";

    return new Date(
        date + "T00:00:00"
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function overdue(task) {

    return (
        task.deadline &&
        task.deadline < today() &&
        ![
            "Completed",
            "Cancelled"
        ].includes(task.status)
    );

}


function dueToday(task) {

    return (
        task.deadline === today() &&
        ![
            "Completed",
            "Cancelled"
        ].includes(task.status)
    );

}


function followupDue(task) {

    return (
        task.followup &&
        task.followup <= today() &&
        ![
            "Completed",
            "Cancelled"
        ].includes(task.status)
    );

}


/* ================= STORAGE ================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );

    localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(activity)
    );

}


function loadData() {

    tasks = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
        || "[]"
    );

    activity = JSON.parse(
        localStorage.getItem(ACTIVITY_KEY)
        || "[]"
    );


    if (!tasks.length) {

        createSampleData();

    }

}


function logActivity(message) {

    activity.unshift({

        time:
            new Date().toISOString(),

        message

    });


    activity =
        activity.slice(0, 300);


    saveData();

}


/* ================= SAMPLE DATA ================= */

function createSampleData() {

    const tomorrow =
        new Date();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    const date =
        tomorrow
        .toISOString()
        .slice(0, 10);


    tasks = [

        {

            id: taskID(),

            task:
                "Verify warehouse incoming stock",

            department:
                "Warehouse",

            area:
                "Stock Intake",

            owner:
                "Warehouse Head",

            coordinator:
                "Operations",

            priority:
                "P1 - High",

            status:
                "In Progress",

            raised:
                today(),

            deadline:
                date,

            progress:
                60,

            followup:
                today(),

            dependency:
                "",

            nextAction:
                "Complete remaining stock count",

            escalation:
                "Monitor",

            verification:
                "Pending",

            notes:
                "Daily warehouse monitoring."

        },


        {

            id: taskID(),

            task:
                "Update website stock listings",

            department:
                "Listing / Inventory",

            area:
                "Website",

            owner:
                "Catalog Team",

            coordinator:
                "Operations",

            priority:
                "P1 - High",

            status:
                "Open",

            raised:
                today(),

            deadline:
                date,

            progress:
                25,

            followup:
                date,

            dependency:
                "Verified stock",

            nextAction:
                "Publish next listing batch",

            escalation:
                "None",

            verification:
                "Pending",

            notes:
                ""

        },


        {

            id: taskID(),

            task:
                "Follow up on B2B quotation",

            department:
                "B2B / Sales",

            area:
                "Customer Follow-up",

            owner:
                "Sales Head",

            coordinator:
                "Operations",

            priority:
                "P1 - High",

            status:
                "Waiting",

            raised:
                today(),

            deadline:
                date,

            progress:
                50,

            followup:
                today(),

            dependency:
                "Customer confirmation",

            nextAction:
                "Contact customer",

            escalation:
                "Management Attention",

            verification:
                "Pending",

            notes:
                ""

        }

    ];


    logActivity(
        "Operations Control Tower initialized."
    );

}


/* ================= BADGES ================= */

function priorityBadge(priority) {

    let cls = "p2";

    if (priority.startsWith("P0"))
        cls = "p0";

    else if (priority.startsWith("P1"))
        cls = "p1";

    else if (priority.startsWith("P3"))
        cls = "p3";


    return `
        <span class="badge ${cls}">
            ${escapeHTML(priority)}
        </span>
    `;

}


function statusBadge(status) {

    const cls =
        status
        .toLowerCase()
        .replace(" ", "-");


    return `
        <span class="badge ${cls}">
            ${escapeHTML(status)}
        </span>
    `;

}


/* ================= DASHBOARD ================= */

function renderDashboard() {

    const active =
        tasks.filter(
            t =>
                ![
                    "Completed",
                    "Cancelled"
                ].includes(t.status)
        ).length;


    const overdueCount =
        tasks.filter(overdue).length;


    const todayCount =
        tasks.filter(dueToday).length;


    const blocked =
        tasks.filter(
            t => t.status === "Blocked"
        ).length;


    const followups =
        tasks.filter(followupDue).length;


    const completed =
        tasks.filter(
            t => t.status === "Completed"
        ).length;


    const attention =
        tasks.filter(
            t =>
                overdue(t) ||
                t.status === "Blocked" ||
                t.priority.startsWith("P0")
        );


    $("view-dashboard").innerHTML = `

        <div class="kpi-grid">

            ${kpi(
                "ACTIVE TASKS",
                active,
                "Currently active"
            )}

            ${kpi(
                "OVERDUE",
                overdueCount,
                "Past deadline"
            )}

            ${kpi(
                "DUE TODAY",
                todayCount,
                "Requires action"
            )}

            ${kpi(
                "BLOCKED",
                blocked,
                "Needs intervention"
            )}

            ${kpi(
                "FOLLOW-UPS",
                followups,
                "Due today / overdue"
            )}

        </div>


        <div class="grid-2">


            <div class="panel">

                <div class="panel-head">

                    <div>

                        <h3>
                            Department Health
                        </h3>

                        <p>
                            Current workload by department
                        </p>

                    </div>

                </div>


                <div class="table-wrap">

                    <table class="table">

                        <thead>

                            <tr>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Active
                                </th>

                                <th>
                                    Overdue
                                </th>

                                <th>
                                    Blocked
                                </th>

                                <th>
                                    Waiting
                                </th>

                                <th>
                                    Completed
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${DEPARTMENTS
                                .map(department => {

                                    const list =
                                        tasks.filter(
                                            t =>
                                                t.department ===
                                                department
                                        );


                                    return `

                                    <tr>

                                        <td>
                                            <strong>
                                                ${escapeHTML(
                                                    department
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            ${
                                                list.filter(
                                                    t =>
                                                        ![
                                                            "Completed",
                                                            "Cancelled"
                                                        ].includes(
                                                            t.status
                                                        )
                                                ).length
                                            }
                                        </td>

                                        <td>
                                            ${
                                                list.filter(
                                                    overdue
                                                ).length
                                            }
                                        </td>

                                        <td>
                                            ${
                                                list.filter(
                                                    t =>
                                                        t.status ===
                                                        "Blocked"
                                                ).length
                                            }
                                        </td>

                                        <td>
                                            ${
                                                list.filter(
                                                    t =>
                                                        t.status ===
                                                        "Waiting"
                                                ).length
                                            }
                                        </td>

                                        <td>
                                            ${
                                                list.filter(
                                                    t =>
                                                        t.status ===
                                                        "Completed"
                                                ).length
                                            }
                                        </td>

                                    </tr>

                                    `;

                                })
                                .join("")
                            }

                        </tbody>

                    </table>

                </div>

            </div>


            <div class="panel">

                <div class="panel-head">

                    <div>

                        <h3>
                            Needs Attention
                        </h3>

                        <p>
                            Critical operational exceptions
                        </p>

                    </div>

                </div>


                <div class="panel-body">

                    ${
                        attention.length

                        ?

                        attention
                            .slice(0, 8)
                            .map(t => `

                                <div class="attention">

                                    <strong>
                                        ${escapeHTML(
                                            t.task
                                        )}
                                    </strong>

                                    <div>

                                        ${escapeHTML(
                                            t.department
                                        )}

                                        ·

                                        ${escapeHTML(
                                            t.owner
                                        )}

                                        <br>

                                        ${statusBadge(
                                            t.status
                                        )}

                                        ${
                                            overdue(t)
                                            ?
                                            `
                                            <span class="badge overdue">
                                                Overdue
                                            </span>
                                            `
                                            :
                                            ""
                                        }

                                    </div>

                                </div>

                            `)
                            .join("")

                        :

                        `
                        <div class="empty">
                            No critical exceptions.
                        </div>
                        `
                    }

                </div>

            </div>

        </div>


        <div class="grid-3">


            <div class="panel">

                <div class="panel-head">

                    <div>

                        <h3>
                            Completion
                        </h3>

                    </div>

                </div>

                <div class="panel-body">

                    <strong
                        style="
                        font-size:34px;
                        "
                    >
                        ${
                            tasks.length
                            ?
                            Math.round(
                                completed /
                                tasks.length *
                                100
                            )
                            :
                            0
                        }%
                    </strong>

                    <p class="muted">
                        ${completed}
                        of
                        ${tasks.length}
                        tasks completed
                    </p>

                    <div class="bar">

                        <span
                            style="
                            width:
                            ${
                                tasks.length
                                ?
                                completed /
                                tasks.length *
                                100
                                :
                                0
                            }%
                            "
                        ></span>

                    </div>

                </div>

            </div>


            <div class="panel">

                <div class="panel-head">

                    <div>

                        <h3>
                            Operational Rule
                        </h3>

                    </div>

                </div>

                <div class="panel-body">

                    <div class="info">

                        Every task should have:

                        <br><br>

                        <b>
                            Owner
                        </b>
                        →

                        <b>
                            Deadline
                        </b>
                        →

                        <b>
                            Status
                        </b>
                        →

                        <b>
                            Next Action
                        </b>
                        →

                        <b>
                            Follow-up
                        </b>
                        →

                        <b>
                            Verification
                        </b>

                    </div>

                </div>

            </div>


            <div class="panel">

                <div class="panel-head">

                    <div>

                        <h3>
                            Current Exceptions
                        </h3>

                    </div>

                </div>

                <div class="panel-body">

                    <div class="info">

                        <b>
                            ${overdueCount}
                        </b>
                        overdue

                        <br>

                        <b>
                            ${blocked}
                        </b>
                        blocked

                        <br>

                        <b>
                            ${
                                tasks.filter(
                                    t =>
                                        t.status ===
                                        "Waiting"
                                ).length
                            }
                        </b>
                        waiting

                    </div>

                </div>

            </div>

        </div>

    `;

}


function kpi(
    title,
    value,
    subtitle
) {

    return `

        <div class="kpi">

            <div class="kpi-label">
                ${title}
            </div>

            <div class="kpi-value">
                ${value}
            </div>

            <div class="kpi-sub">
                ${subtitle}
            </div>

        </div>

    `;

}


/* ================= TASK PAGE ================= */

function renderTasks() {

    $("view-tasks").innerHTML = `

        <div class="panel">

            <div class="panel-head">

                <div>

                    <h3>
                        Central Task Register
                    </h3>

                    <p>
                        Every department's operational tasks.
                    </p>

                </div>

            </div>


            <div class="filters">

                <input
                    id="searchTask"
                    placeholder="Search task, owner..."
                >


                <select id="filterDepartment">

                    <option value="">
                        All Departments
                    </option>

                    ${DEPARTMENTS
                        .map(
                            d =>
                                `<option>
                                    ${escapeHTML(d)}
                                </option>`
                        )
                        .join("")
                    }

                </select>


                <select id="filterPriority">

                    <option value="">
                        All Priorities
                    </option>

                    ${PRIORITIES
                        .map(
                            p =>
                                `<option>
                                    ${escapeHTML(p)}
                                </option>`
                        )
                        .join("")
                    }

                </select>


                <select id="filterStatus">

                    <option value="">
                        All Status
                    </option>

                    ${STATUSES
                        .map(
                            s =>
                                `<option>
                                    ${s}
                                </option>`
                        )
                        .join("")
                    }

                </select>


                <select id="filterTiming">

                    <option value="">
                        All Timing
                    </option>

                    <option value="overdue">
                        Overdue
                    </option>

                    <option value="today">
                        Due Today
                    </option>

                    <option value="followup">
                        Follow-up Due
                    </option>

                </select>


                <button
                    id="clearFilters"
                    class="btn secondary"
                >
                    Clear
                </button>

            </div>


            <div class="table-wrap">

                <table class="table">

                    <thead>

                        <tr>

                            <th>
                                ID
                            </th>

                            <th>
                                Task
                            </th>

                            <th>
                                Department
                            </th>

                            <th>
                                Priority
                            </th>

                            <th>
                                Owner
                            </th>

                            <th>
                                Deadline
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Progress
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody id="taskTable">

                    </tbody>

                </table>

            </div>

        </div>

    `;


    renderTaskTable();


    [

        "searchTask",
        "filterDepartment",
        "filterPriority",
        "filterStatus",
        "filterTiming"

    ].forEach(
        id =>
            $(id).addEventListener(
                "input",
                renderTaskTable
            )
    );


    $("clearFilters").onclick = () => {

        $("searchTask").value = "";

        $("filterDepartment").value = "";

        $("filterPriority").value = "";

        $("filterStatus").value = "";

        $("filterTiming").value = "";

        renderTaskTable();

    };

}


function renderTaskTable() {

    const search =
        (
            $("searchTask")?.value ||
            ""
        ).toLowerCase();


    const department =
        $("filterDepartment")?.value ||
        "";


    const priority =
        $("filterPriority")?.value ||
        "";


    const status =
        $("filterStatus")?.value ||
        "";


    const timing =
        $("filterTiming")?.value ||
        "";


    const list =
        tasks.filter(t => {

            const text = [

                t.task,

                t.owner,

                t.department,

                t.area,

                t.id

            ]
                .join(" ")
                .toLowerCase();


            if (
                search &&
                !text.includes(search)
            )
                return false;


            if (
                department &&
                t.department !==
                department
            )
                return false;


            if (
                priority &&
                t.priority !==
                priority
            )
                return false;


            if (
                status &&
                t.status !==
                status
            )
                return false;


            if (
                timing === "overdue" &&
                !overdue(t)
            )
                return false;


            if (
                timing === "today" &&
                !dueToday(t)
            )
                return false;


            if (
                timing === "followup" &&
                !followupDue(t)
            )
                return false;


            return true;

        });


    if (!list.length) {

        $("taskTable").innerHTML = `

            <tr>

                <td colspan="9">

                    <div class="empty">

                        No tasks found.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    $("taskTable").innerHTML =

        list
            .map(
                t => `

                <tr>

                    <td>
                        ${escapeHTML(t.id)}
                    </td>


                    <td>

                        <strong>
                            ${escapeHTML(t.task)}
                        </strong>

                        <div class="muted">
                            ${escapeHTML(t.area)}
                        </div>

                    </td>


                    <td>
                        ${escapeHTML(t.department)}
                    </td>


                    <td>
                        ${priorityBadge(t.priority)}
                    </td>


                    <td>
                        ${escapeHTML(t.owner)}
                    </td>


                    <td>

                        ${dateDisplay(t.deadline)}

                        ${
                            overdue(t)
                            ?
                            `
                            <span class="badge overdue">
                                OVERDUE
                            </span>
                            `
                            :
                            ""
                        }

                    </td>


                    <td>
                        ${statusBadge(t.status)}
                    </td>


                    <td>
                        ${t.progress || 0}%
                    </td>


                    <td>

                        <button
                            class="action-btn"
                            data-edit="${t.id}"
                        >
                            Edit
                        </button>

                    </td>

                </tr>

                `
            )
            .join("");

}


/* ================= DEPARTMENTS ================= */

function renderDepartments() {

    $("view-departments").innerHTML = `

        <div class="dept-grid">

            ${
                DEPARTMENTS
                    .map(department => {

                        const list =
                            tasks.filter(
                                t =>
                                    t.department ===
                                    department
                            );


                        const active =
                            list.filter(
                                t =>
                                    ![
                                        "Completed",
                                        "Cancelled"
                                    ].includes(
                                        t.status
                                    )
                            ).length;


                        const completed =
                            list.filter(
                                t =>
                                    t.status ===
                                    "Completed"
                            ).length;


                        const blocked =
                            list.filter(
                                t =>
                                    t.status ===
                                    "Blocked"
                            ).length;


                        const over =
                            list.filter(
                                overdue
                            ).length;


                        const percent =
                            list.length
                            ?
                            Math.round(
                                completed /
                                list.length *
                                100
                            )
                            :
                            0;


                        return `

                        <div class="dept-card">

                            <div class="dept-title">

                                <h3>
                                    ${escapeHTML(
                                        department
                                    )}
                                </h3>

                                <span class="badge p2">
                                    ${list.length}
                                    tasks
                                </span>

                            </div>


                            <div class="stat-row">

                                <div class="stat">

                                    <strong>
                                        ${active}
                                    </strong>

                                    <span>
                                        ACTIVE
                                    </span>

                                </div>


                                <div class="stat">

                                    <strong>
                                        ${over}
                                    </strong>

                                    <span>
                                        OVERDUE
                                    </span>

                                </div>


                                <div class="stat">

                                    <strong>
                                        ${blocked}
                                    </strong>

                                    <span>
                                        BLOCKED
                                    </span>

                                </div>

                            </div>


                            <div class="bar">

                                <span
                                    style="
                                    width:${percent}%
                                    "
                                ></span>

                            </div>


                            <div
                                class="muted"
                                style="
                                margin-top:7px;
                                "
                            >
                                ${percent}%
                                completed
                            </div>

                        </div>

                        `;

                    })
                    .join("")
            }

        </div>

    `;

}


/* ================= FOLLOW UPS ================= */

function renderFollowups() {

    const list =
        tasks.filter(
            followupDue
        );


    $("view-followups").innerHTML = `

        <div class="panel">

            <div class="panel-head">

                <div>

                    <h3>
                        Follow-up Queue
                    </h3>

                    <p>
                        Tasks requiring follow-up.
                    </p>

                </div>

            </div>


            <div class="table-wrap">

                <table class="table">

                    <thead>

                        <tr>

                            <th>
                                Task
                            </th>

                            <th>
                                Department
                            </th>

                            <th>
                                Owner
                            </th>

                            <th>
                                Priority
                            </th>

                            <th>
                                Follow-up
                            </th>

                            <th>
                                Next Action
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            list.length

                            ?

                            list
                                .map(
                                    t => `

                                    <tr>

                                        <td>
                                            <strong>
                                                ${escapeHTML(
                                                    t.task
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                t.department
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                t.owner
                                            )}
                                        </td>

                                        <td>
                                            ${priorityBadge(
                                                t.priority
                                            )}
                                        </td>

                                        <td>
                                            ${dateDisplay(
                                                t.followup
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                t.nextAction
                                            )}
                                        </td>

                                        <td>

                                            <button
                                                class="action-btn"
                                                data-edit="${t.id}"
                                            >
                                                Edit
                                            </button>

                                        </td>

                                    </tr>

                                    `
                                )
                                .join("")

                            :

                            `

                            <tr>

                                <td colspan="7">

                                    <div class="empty">

                                        No follow-ups due.

                                    </div>

                                </td>

                            </tr>

                            `
                        }

                    </tbody>

                </table>

            </div>

        </div>

    `;

}


/* ================= ANALYTICS ================= */

function renderAnalytics() {

    const total =
        tasks.length || 1;


    $("view-analytics").innerHTML = `

        <div class="grid-2">

            <div class="panel">

                <div class="panel-head">

                    <div>

                        <h3>
                            Status Analysis
                        </h3>

                    </div>

                </div>


                <div class="panel-body">

                    <div class="chart">

                        ${
                            STATUSES
                                .map(status => {

                                    const count =
                                        tasks.filter(
                                            t =>
                                                t.status ===
                                                status
                                        ).length;


                                    return `

                                    <div class="chart-row">

                                        <span>
                                            ${status}
                                        </span>

                                        <div
                                            class="chart-track"
                                        >

                                            <div
                                                class="chart-fill"
                                                style="
                                                width:
                                                ${
                                                    count /
                                                    total *
                                                    100
                                                }%
                                                "
                                            ></div>

                                        </div>

                                        <strong>
                                            ${count}
                                        </strong>

                                    </div>

                                    `;

                                })
                                .join("")
                        }

                    </div>

                </div>

            </div>


            <div class="panel">

                <div class="panel-head">

                    <div>

                        <h3>
                            Priority Analysis
                        </h3>

                    </div>

                </div>


                <div class="panel-body">

                    <div class="chart">

                        ${
                            PRIORITIES
                                .map(priority => {

                                    const count =
                                        tasks.filter(
                                            t =>
                                                t.priority ===
                                                priority
                                        ).length;


                                    return `

                                    <div class="chart-row">

                                        <span>
                                            ${priority}
                                        </span>

                                        <div
                                            class="chart-track"
                                        >

                                            <div
                                                class="chart-fill"
                                                style="
                                                width:
                                                ${
                                                    count /
                                                    total *
                                                    100
                                                }%
                                                "
                                            ></div>

                                        </div>

                                        <strong>
                                            ${count}
                                        </strong>

                                    </div>

                                    `;

                                })
                                .join("")
                        }

                    </div>

                </div>

            </div>

        </div>


        <div class="panel">

            <div class="panel-head">

                <div>

                    <h3>
                        Operational Health
                    </h3>

                </div>

            </div>


            <div class="panel-body">

                <div class="grid-3">

                    <div class="info">

                        <b>
                            ${tasks.filter(overdue).length}
                        </b>

                        overdue tasks

                    </div>


                    <div class="info">

                        <b>
                            ${
                                tasks.filter(
                                    t =>
                                        t.status ===
                                        "Blocked"
                                ).length
                            }
                        </b>

                        blocked tasks

                    </div>


                    <div class="info">

                        <b>
                            ${
                                tasks.filter(
                                    t =>
                                        !t.owner ||
                                        !t.deadline ||
                                        !t.nextAction
                                ).length
                            }
                        </b>

                        tasks with missing information

                    </div>

                </div>

            </div>

        </div>

    `;

}


/* ================= ACTIVITY ================= */

function renderActivity() {

    $("view-activity").innerHTML = `

        <div class="panel">

            <div class="panel-head">

                <div>

                    <h3>
                        Activity Log
                    </h3>

                    <p>
                        Recent operational changes.
                    </p>

                </div>

            </div>


            <div class="panel-body">

                <div class="activity">

                    ${
                        activity.length

                        ?

                        activity
                            .slice(0, 100)
                            .map(
                                item => `

                                <div class="activity-row">

                                    <div class="activity-time">

                                        ${
                                            new Date(
                                                item.time
                                            )
                                            .toLocaleString(
                                                "en-IN"
                                            )
                                        }

                                    </div>


                                    <div class="activity-text">

                                        ${escapeHTML(
                                            item.message
                                        )}

                                    </div>

                                </div>

                                `
                            )
                            .join("")

                        :

                        `
                        <div class="empty">
                            No activity yet.
                        </div>
                        `
                    }

                </div>

            </div>

        </div>

    `;

}


/* ================= DATA ================= */

function renderData() {

    $("view-data").innerHTML = `

        <div class="grid-2">

            <div class="panel">

                <div class="panel-head">

                    <div>

                        <h3>
                            Excel / Data
                        </h3>

                        <p>
                            Backup and exchange operational data.
                        </p>

                    </div>

                </div>


                <div class="panel-body">

                    <div class="data-buttons">

                        <button
                            id="exportExcel"
                            class="btn primary"
                        >
                            Export Excel
                        </button>


                        <button
                            id="exportCSV"
                            class="btn secondary"
                        >
                            Export CSV
                        </button>


                        <button
                            id="importExcel"
                            class="btn secondary"
                        >
                            Import Excel
                        </button>

                    </div>

                </div>

            </div>


            <div class="panel">

                <div class="panel-head">

                    <h3>
                        Current Database
                    </h3>

                </div>


                <div class="panel-body">

                    <div class="info">

                        <b>
                            ${tasks.length}
                        </b>
                        tasks

                        <br>

                        <b>
                            ${DEPARTMENTS.length}
                        </b>
                        departments

                        <br><br>

                        Website storage:

                        <b>
                            Browser Local Storage
                        </b>

                        <br><br>

                        For true multi-user access,
                        connect this interface to a shared backend.

                    </div>

                </div>

            </div>

        </div>

    `;


    $("exportExcel")
        .onclick =
        exportExcel;


    $("exportCSV")
        .onclick =
        exportCSV;


    $("importExcel")
        .onclick =
        () =>
            $("importFile").click();

}


/* ================= SETTINGS ================= */

function renderSettings() {

    $("view-settings").innerHTML = `

        <div class="panel">

            <div class="panel-head">

                <div>

                    <h3>
                        System Settings
                    </h3>

                    <p>
                        Operations Control Tower configuration.
                    </p>

                </div>

            </div>


            <div class="panel-body">

                <div class="info">

                    <b>
                        Universal Password
                    </b>

                    <br>

                    Password is currently configured
                    inside app.js.

                    <br><br>

                    <b>
                        Departments
                    </b>

                    <br>

                    ${DEPARTMENTS.length}

                    departments configured.

                    <br><br>

                    <b>
                        Storage
                    </b>

                    <br>

                    Browser Local Storage.

                </div>


                <br>


                <button
                    id="resetData"
                    class="btn danger"
                >
                    Reset Sample Data
                </button>

            </div>

        </div>

    `;


    $("resetData").onclick =
        () => {

            if (
                confirm(
                    "Reset all current tasks?"
                )
            ) {

                localStorage.removeItem(
                    STORAGE_KEY
                );

                localStorage.removeItem(
                    ACTIVITY_KEY
                );

                loadData();

                renderAll();

            }

        };

}


/* ================= TASK MODAL ================= */

function setupForm() {

    $("fDepartment").innerHTML =

        DEPARTMENTS
            .map(
                d =>
                    `<option>
                        ${escapeHTML(d)}
                    </option>`
            )
            .join("");


    $("fPriority").innerHTML =

        PRIORITIES
            .map(
                p =>
                    `<option>
                        ${escapeHTML(p)}
                    </option>`
            )
            .join("");


    $("fStatus").innerHTML =

        STATUSES
            .map(
                s =>
                    `<option>
                        ${s}
                    </option>`
            )
            .join("");

}


function openNewTask() {

    $("modalTitle")
        .textContent =
        "New Task";


    $("taskForm").reset();


    $("taskId").value = "";


    $("fRaised").value =
        today();


    $("fPriority").value =
        "P2 - Normal";


    $("fStatus").value =
        "Open";


    $("fProgress").value =
        0;


    $("modal")
        .classList
        .remove("hidden");

}


function openEditTask(id) {

    const task =
        tasks.find(
            t => t.id === id
        );


    if (!task) return;


    $("modalTitle")
        .textContent =
        "Edit Task";


    $("taskId").value =
        task.id;


    $("fTask").value =
        task.task;


    $("fDepartment").value =
        task.department;


    $("fArea").value =
        task.area;


    $("fOwner").value =
        task.owner;


    $("fCoordinator").value =
        task.coordinator;


    $("fPriority").value =
        task.priority;


    $("fStatus").value =
        task.status;


    $("fRaised").value =
        task.raised;


    $("fDeadline").value =
        task.deadline;


    $("fProgress").value =
        task.progress;


    $("fFollowup").value =
        task.followup;


    $("fDependency").value =
        task.dependency;


    $("fNextAction").value =
        task.nextAction;


    $("fEscalation").value =
        task.escalation;


    $("fVerification").value =
        task.verification;


    $("fNotes").value =
        task.notes;


    $("modal")
        .classList
        .remove("hidden");

}


function closeModal() {

    $("modal")
        .classList
        .add("hidden");

}


/* ================= SAVE TASK ================= */

$("taskForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const id =
                $("taskId").value ||
                taskID();


            const data = {

                id,

                task:
                    $("fTask").value.trim(),

                department:
                    $("fDepartment").value,

                area:
                    $("fArea").value.trim(),

                owner:
                    $("fOwner").value.trim(),

                coordinator:
                    $("fCoordinator").value.trim(),

                priority:
                    $("fPriority").value,

                status:
                    $("fStatus").value,

                raised:
                    $("fRaised").value ||
                    today(),

                deadline:
                    $("fDeadline").value,

                progress:
                    Number(
                        $("fProgress").value
                    ) || 0,

                followup:
                    $("fFollowup").value,

                dependency:
                    $("fDependency").value.trim(),

                nextAction:
                    $("fNextAction")
                        .value
                        .trim(),

                escalation:
                    $("fEscalation").value,

                verification:
                    $("fVerification").value,

                notes:
                    $("fNotes")
                        .value
                        .trim()

            };


            const existing =
                tasks.findIndex(
                    t =>
                        t.id === id
                );


            if (existing >= 0) {

                tasks[existing] =
                    data;


                logActivity(
                    `Updated task: ${data.task}`
                );

            }

            else {

                tasks.unshift(
                    data
                );


                logActivity(
                    `Created task: ${data.task}`
                );

            }


            saveData();


            closeModal();


            renderAll();

        }
    );


/* ================= GLOBAL CLICKS ================= */

document.addEventListener(
    "click",
    event => {

        const edit =
            event.target.closest(
                "[data-edit]"
            );


        if (edit) {

            openEditTask(
                edit.dataset.edit
            );

        }


        if (
            event.target.matches(
                "[data-close-modal]"
            )
        ) {

            closeModal();

        }

    }
);


/* ================= NAVIGATION ================= */

$("navigation")
    .addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".nav[data-view]"
                );


            if (!button)
                return;


            const view =
                button.dataset.view;


            document
                .querySelectorAll(
                    ".nav"
                )
                .forEach(
                    n =>
                        n.classList
                        .remove(
                            "active"
                        )
                );


            button.classList
                .add("active");


            document
                .querySelectorAll(
                    ".view"
                )
                .forEach(
                    section =>
                        section.classList
                        .remove(
                            "active"
                        )
                );


            $("view-" + view)
                .classList
                .add("active");


            const titles = {

                dashboard: [
                    "Dashboard",
                    "Monitor everything from one place."
                ],

                tasks: [
                    "All Tasks",
                    "Central task register."
                ],

                departments: [
                    "Departments",
                    "Department workload and performance."
                ],

                followups: [
                    "Follow-ups",
                    "Tasks requiring action or follow-up."
                ],

                analytics: [
                    "Analytics",
                    "Operational performance analysis."
                ],

                activity: [
                    "Activity Log",
                    "Recent operational changes."
                ],

                data: [
                    "Excel / Data",
                    "Import and export operational information."
                ],

                settings: [
                    "Settings",
                    "System configuration."
                ]

            };


            $("pageTitle")
                .textContent =
                titles[view][0];


            $("pageSubtitle")
                .textContent =
                titles[view][1];

        }
    );


/* ================= LOGIN ================= */

$("loginForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (
                $("loginPassword")
                    .value ===
                PASSWORD
            ) {

                sessionStorage.setItem(
                    "operationsLoggedIn",
                    "true"
                );


                $("loginScreen")
                    .classList
                    .add("hidden");


                $("app")
                    .classList
                    .remove("hidden");


                $("loginError")
                    .classList
                    .remove("show");


                $("loginPassword")
                    .value = "";


                loadData();

                renderAll();

            }

            else {

                $("loginError")
                    .classList
                    .add("show");


                $("loginPassword")
                    .select();

            }

        }
    );


/* ================= LOGOUT ================= */

$("logoutBtn")
    .onclick =
    () => {

        sessionStorage.removeItem(
            "operationsLoggedIn"
        );


        $("app")
            .classList
            .add("hidden");


        $("loginScreen")
            .classList
            .remove("hidden");


        $("loginPassword")
            .focus();

    };


/* ================= NEW TASK ================= */

$("newTaskBtn")
    .onclick =
    openNewTask;


/* ================= REFRESH ================= */

$("refreshBtn")
    .onclick =
    () => {

        loadData();

        renderAll();

    };


/* ================= EXCEL EXPORT ================= */

function exportExcel() {

    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "Excel library could not load."
        );

        return;

    }


    const rows =
        tasks.map(
            t => ({

                "Task ID":
                    t.id,

                "Task":
                    t.task,

                "Department":
                    t.department,

                "Area":
                    t.area,

                "Owner":
                    t.owner,

                "Coordinator":
                    t.coordinator,

                "Priority":
                    t.priority,

                "Status":
                    t.status,

                "Date Raised":
                    t.raised,

                "Deadline":
                    t.deadline,

                "Progress %":
                    t.progress,

                "Next Follow-up":
                    t.followup,

                "Dependency":
                    t.dependency,

                "Next Action":
                    t.nextAction,

                "Escalation":
                    t.escalation,

                "Verification":
                    t.verification,

                "Notes":
                    t.notes

            })
        );


    const workbook =
        XLSX.utils.book_new();


    const sheet =
        XLSX.utils.json_to_sheet(
            rows
        );


    XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        "Master Tasks"
    );


    XLSX.writeFile(
        workbook,
        "UsedBookR_Operations.xlsx"
    );


    logActivity(
        "Exported operations data to Excel."
    );

}


/* ================= CSV ================= */

function exportCSV() {

    const headers = [

        "Task ID",

        "Task",

        "Department",

        "Area",

        "Owner",

        "Coordinator",

        "Priority",

        "Status",

        "Date Raised",

        "Deadline",

        "Progress %",

        "Next Follow-up",

        "Dependency",

        "Next Action",

        "Escalation",

        "Verification",

        "Notes"

    ];


    const rows =
        tasks.map(
            t => [

                t.id,

                t.task,

                t.department,

                t.area,

                t.owner,

                t.coordinator,

                t.priority,

                t.status,

                t.raised,

                t.deadline,

                t.progress,

                t.followup,

                t.dependency,

                t.nextAction,

                t.escalation,

                t.verification,

                t.notes

            ]
        );


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
                                value || ""
                            ).replaceAll(
                                '"',
                                '""'
                            )}"`
                    )
                    .join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            ["\ufeff" + csv],
            {
                type:
                    "text/csv;charset=utf-8"
            }
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        URL.createObjectURL(
            blob
        );


    link.download =
        "UsedBookR_Operations.csv";


    link.click();

}


/* ================= IMPORT ================= */

$("importFile")
    .addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file)
                return;


            const reader =
                new FileReader();


            reader.onload =
                function(e) {

                    try {

                        const workbook =
                            XLSX.read(
                                e.target.result,
                                {
                                    type:
                                        "array"
                                }
                            );


                        const sheet =
                            workbook
                            .Sheets[
                                workbook
                                .SheetNames[0]
                            ];


                        const rows =
                            XLSX.utils
                            .sheet_to_json(
                                sheet,
                                {
                                    defval: ""
                                }
                            );


                        const imported =
                            rows
                                .map(
                                    row => ({

                                        id:
                                            row[
                                                "Task ID"
                                            ] ||
                                            taskID(),

                                        task:
                                            row[
                                                "Task"
                                            ],

                                        department:
                                            row[
                                                "Department"
                                            ] ||
                                            "Operations",

                                        area:
                                            row[
                                                "Area"
                                            ] || "",

                                        owner:
                                            row[
                                                "Owner"
                                            ] || "",

                                        coordinator:
                                            row[
                                                "Coordinator"
                                            ] || "",

                                        priority:
                                            row[
                                                "Priority"
                                            ] ||
                                            "P2 - Normal",

                                        status:
                                            row[
                                                "Status"
                                            ] ||
                                            "Open",

                                        raised:
                                            row[
                                                "Date Raised"
                                            ] ||
                                            today(),

                                        deadline:
                                            row[
                                                "Deadline"
                                            ] || "",

                                        progress:
                                            Number(
                                                row[
                                                    "Progress %"
                                                ]
                                            ) || 0,

                                        followup:
                                            row[
                                                "Next Follow-up"
                                            ] || "",

                                        dependency:
                                            row[
                                                "Dependency"
                                            ] || "",

                                        nextAction:
                                            row[
                                                "Next Action"
                                            ] || "",

                                        escalation:
                                            row[
                                                "Escalation"
                                            ] ||
                                            "None",

                                        verification:
                                            row[
                                                "Verification"
                                            ] ||
                                            "Not Required",

                                        notes:
                                            row[
                                                "Notes"
                                            ] || ""

                                    })
                                )
                                .filter(
                                    t =>
                                        t.task
                                );


                        if (
                            !imported.length
                        ) {

                            alert(
                                "No valid tasks found."
                            );

                            return;

                        }


                        tasks =
                            imported;


                        logActivity(
                            `Imported ${imported.length} tasks from Excel.`
                        );


                        saveData();


                        renderAll();


                        alert(
                            `${imported.length} tasks imported successfully.`
                        );

                    }

                    catch (error) {

                        console.error(
                            error
                        );

                        alert(
                            "Could not read this Excel file."
                        );

                    }

                };


            reader.readAsArrayBuffer(
                file
            );

            event.target.value = "";

        }
    );


/* ================= RENDER ALL ================= */

function renderAll() {

    renderDashboard();

    renderTasks();

    renderDepartments();

    renderFollowups();

    renderAnalytics();

    renderActivity();

    renderData();

    renderSettings();

}


/* ================= INITIALIZE ================= */

setupForm();


if (
    sessionStorage.getItem(
        "operationsLoggedIn"
    ) === "true"
) {

    $("loginScreen")
        .classList
        .add("hidden");


    $("app")
        .classList
        .remove("hidden");


    loadData();

    renderAll();

}

else {

    $("loginPassword")
        .focus();

}
