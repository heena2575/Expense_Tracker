let expenses = [];

let editingId = null;


// ==================================================
// NAVIGATION
// ==================================================


function showDashboard() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    setActiveNav("dashboardNav");

}


function showExpenses() {

    const section =
        document.getElementById("expensesSection");

    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }

    setActiveNav("expensesNav");

}


function openAnalytics() {

    window.location.href = "/analytics.html";

}


function setActiveNav(activeId) {

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");

        });


    const activeItem =
        document.getElementById(activeId);


    if (activeItem) {

        activeItem.classList.add("active");

    }

}


// ==================================================
// LOAD EXPENSES
// ==================================================

async function loadExpenses() {

    try {

        const response =
            await fetch("/api/expenses");


        if (!response.ok) {

            throw new Error(
                "Failed to load expenses"
            );

        }


        expenses =
            await response.json();


        displayExpenses(expenses);

        updateSummary();


    } catch (error) {

        console.error(
            "Error:",
            error
        );


        document.getElementById(
            "expenseTableBody"
        ).innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-state"
                >
                    Unable to load expenses.
                </td>

            </tr>

        `;

    }

}


// ==================================================
// DISPLAY EXPENSES
// ==================================================

function displayExpenses(data) {


    const tableBody =
        document.getElementById(
            "expenseTableBody"
        );


    if (data.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-state"
                >
                    No expenses added yet.
                    Click "Add Expense" to get started.
                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =

        data.map(expense => {

            const amount =
                Number(expense.amount)
                    .toFixed(2);


            return `

                <tr>

                    <td>

                        <strong>
                            ${escapeHTML(expense.title)}
                        </strong>

                    </td>


                    <td>

                        <span class="category-badge">

                            ${escapeHTML(
                                expense.category
                            )}

                        </span>

                    </td>


                    <td>

                        ${formatDate(
                            expense.expense_date
                        )}

                    </td>


                    <td>

                        <strong>
                            ₹${amount}
                        </strong>

                    </td>


                    <td>


                        <button

                            class="action-btn edit-btn"

                            onclick="editExpense(${expense.id})"

                            title="Edit"

                        >
                            ✏️
                        </button>


                        <button

                            class="action-btn delete-btn"

                            onclick="deleteExpense(${expense.id})"

                            title="Delete"

                        >
                            🗑️
                        </button>


                    </td>


                </tr>

            `;

        }).join("");

}


// ==================================================
// UPDATE SUMMARY
// ==================================================

function updateSummary() {


    const totalAmount =

        expenses.reduce(

            (sum, expense) =>

                sum +
                Number(expense.amount),

            0

        );


    document.getElementById(
        "totalAmount"
    ).textContent =

        `₹${totalAmount.toFixed(2)}`;


    document.getElementById(
        "totalRecords"
    ).textContent =

        expenses.length;


    const now =
        new Date();


    const currentMonth =
        now.getMonth();


    const currentYear =
        now.getFullYear();


    const monthlyAmount =

        expenses

            .filter(expense => {

                const date =
                    new Date(
                        expense.expense_date
                    );


                return (

                    date.getMonth()
                    === currentMonth &&

                    date.getFullYear()
                    === currentYear

                );

            })

            .reduce(

                (sum, expense) =>

                    sum +
                    Number(expense.amount),

                0

            );


    document.getElementById(
        "monthlyAmount"
    ).textContent =

        `₹${monthlyAmount.toFixed(2)}`;

}


// ==================================================
// OPEN ADD MODAL
// ==================================================

function openAddModal() {


    editingId = null;


    document.getElementById(
        "modalTitle"
    ).textContent =

        "Add Expense";


    document.querySelector(
        ".save-btn"
    ).textContent =

        "Save Expense";


    document.getElementById(
        "expenseForm"
    ).reset();


    setTodayDate();


    document.getElementById(
        "expenseModal"
    ).classList.add("show");

}


// ==================================================
// CLOSE MODAL
// ==================================================

function closeModal() {


    document
        .getElementById("expenseModal")
        .classList.remove("show");


    editingId = null;

}


// ==================================================
// SET TODAY DATE
// ==================================================

function setTodayDate() {


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    document.getElementById(
        "expenseDate"
    ).value =

        `${year}-${month}-${day}`;

}


// ==================================================
// SAVE / UPDATE EXPENSE
// ==================================================

document
    .getElementById("expenseForm")
    .addEventListener(
        "submit",
        async function(event) {


            event.preventDefault();


            const title =

                document
                    .getElementById("title")
                    .value
                    .trim();


            const amount =

                document
                    .getElementById("amount")
                    .value;


            const category =

                document
                    .getElementById("category")
                    .value;


            const expense_date =

                document
                    .getElementById("expenseDate")
                    .value;


            const description =

                document
                    .getElementById("description")
                    .value
                    .trim();


            const expenseData = {

                title: title,

                amount: amount,

                category: category,

                expense_date: expense_date,

                description: description

            };


            try {


                let response;


                // UPDATE

                if (editingId !== null) {


                    response =

                        await fetch(

                            `/api/expenses/${editingId}`,

                            {

                                method: "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        expenseData
                                    )

                            }

                        );


                }

                // CREATE

                else {


                    response =

                        await fetch(

                            "/api/expenses",

                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        expenseData
                                    )

                            }

                        );

                }


                const result =
                    await response.json();


                if (!response.ok) {


                    alert(

                        result.message ||
                        "Something went wrong."

                    );


                    return;

                }


                alert(
                    result.message
                );


                closeModal();


                await loadExpenses();


            } catch (error) {


                console.error(
                    "Error:",
                    error
                );


                alert(
                    "Unable to save expense."
                );

            }

        }
    );


// ==================================================
// EDIT EXPENSE
// ==================================================

function editExpense(id) {


    const expense =

        expenses.find(
            item => item.id === id
        );


    if (!expense) {

        return;

    }


    editingId = id;


    document.getElementById(
        "modalTitle"
    ).textContent =

        "Edit Expense";


    document.querySelector(
        ".save-btn"
    ).textContent =

        "Update Expense";


    document.getElementById(
        "title"
    ).value =

        expense.title;


    document.getElementById(
        "amount"
    ).value =

        expense.amount;


    document.getElementById(
        "category"
    ).value =

        expense.category;


    document.getElementById(
        "expenseDate"
    ).value =

        expense.expense_date;


    document.getElementById(
        "description"
    ).value =

        expense.description || "";


    document.getElementById(
        "expenseModal"
    ).classList.add("show");

}


// ==================================================
// DELETE EXPENSE
// ==================================================

async function deleteExpense(id) {


    const expense =

        expenses.find(
            item => item.id === id
        );


    if (!expense) {

        return;

    }


    const confirmed =

        confirm(
            `Delete "${expense.title}"?`
        );


    if (!confirmed) {

        return;

    }


    try {


        const response =

            await fetch(

                `/api/expenses/${id}`,

                {

                    method: "DELETE"

                }

            );


        const result =
            await response.json();


        if (!response.ok) {


            alert(

                result.message ||
                "Unable to delete expense."

            );


            return;

        }


        alert(
            result.message
        );


        await loadExpenses();


    } catch (error) {


        console.error(
            "Error:",
            error
        );


        alert(
            "Unable to delete expense."
        );

    }

}


// ==================================================
// SEARCH
// ==================================================

function filterExpenses() {


    const searchText =

        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


    if (!searchText) {


        displayExpenses(
            expenses
        );


        return;

    }


    const filtered =

        expenses.filter(
            expense => {


                return (

                    expense.title
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    expense.category
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    expense.description
                        .toLowerCase()
                        .includes(searchText)

                );

            }
        );


    displayExpenses(
        filtered
    );

}


// ==================================================
// FORMAT DATE
// ==================================================

function formatDate(dateString) {


    if (!dateString) {

        return "-";

    }


    const date =
        new Date(dateString);


    if (
        isNaN(
            date.getTime()
        )
    ) {

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


// ==================================================
// HTML ESCAPE
// ==================================================

function escapeHTML(value) {


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


// ==================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==================================================

document
    .getElementById("expenseModal")
    .addEventListener(
        "click",
        function(event) {


            if (
                event.target === this
            ) {

                closeModal();

            }

        }
    );


// ==================================================
// INITIAL LOAD
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadExpenses();

    }
);