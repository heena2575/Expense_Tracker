let analyticsExpenses = [];


// ================= LOAD EXPENSE DATA =================

async function loadAnalytics() {

    try {

        const response = await fetch("/api/expenses");

        if (!response.ok) {
            throw new Error("Failed to load expenses");
        }

        analyticsExpenses = await response.json();

        updateAnalytics();

    } catch (error) {

        console.error("Analytics Error:", error);

    }
}


// ================= UPDATE ANALYTICS =================

function updateAnalytics() {

    const expenses = analyticsExpenses;


    // TOTAL

    const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );


    document.getElementById("analyticsTotal").textContent =
        `₹${total.toFixed(2)}`;


    document.getElementById("analyticsCount").textContent =
        expenses.length;


    // THIS MONTH

    const now = new Date();

    const currentMonth = now.getMonth();

    const currentYear = now.getFullYear();


    const monthlyTotal = expenses
        .filter(expense => {

            const date = new Date(expense.expense_date);

            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );

        })
        .reduce(
            (sum, expense) => sum + Number(expense.amount),
            0
        );


    document.getElementById("analyticsMonth").textContent =
        `₹${monthlyTotal.toFixed(2)}`;


    // AVERAGE

    const average =
        expenses.length > 0
            ? total / expenses.length
            : 0;


    document.getElementById("averageExpense").textContent =
        `₹${average.toFixed(2)}`;


    // HIGHEST

    const highest =
        expenses.length > 0
            ? Math.max(
                ...expenses.map(
                    expense => Number(expense.amount)
                )
            )
            : 0;


    document.getElementById("highestExpense").textContent =
        `₹${highest.toFixed(2)}`;


    document.getElementById("summaryTotal").textContent =
        `₹${total.toFixed(2)}`;


    document.getElementById("summaryCount").textContent =
        expenses.length;


    createCategoryAnalytics(expenses);

}


// ================= CATEGORY ANALYTICS =================

function createCategoryAnalytics(expenses) {

    const categoryChart =
        document.getElementById("categoryChart");

    const categoryTableBody =
        document.getElementById("categoryTableBody");


    if (expenses.length === 0) {

        categoryChart.innerHTML = `
            <p class="empty-analytics">
                No expense data available yet.
            </p>
        `;

        categoryTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    No data available.
                </td>
            </tr>
        `;

        return;
    }


    const categories = {};


    // GROUP EXPENSES BY CATEGORY

    expenses.forEach(expense => {

        const category = expense.category;

        const amount = Number(expense.amount);


        if (!categories[category]) {

            categories[category] = {
                count: 0,
                total: 0
            };

        }


        categories[category].count += 1;

        categories[category].total += amount;

    });


    const totalAmount = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );


    // CATEGORY BARS

    categoryChart.innerHTML = Object.entries(categories)
        .map(([category, data]) => {

            const percentage =
                totalAmount > 0
                    ? (data.total / totalAmount) * 100
                    : 0;


            return `
                <div class="category-item">

                    <div class="category-info">

                        <span>
                            ${escapeHTML(category)}
                        </span>

                        <strong>
                            ₹${data.total.toFixed(2)}
                        </strong>

                    </div>

                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="width: ${percentage}%"
                        ></div>

                    </div>

                    <small>
                        ${percentage.toFixed(1)}% of total spending
                    </small>

                </div>
            `;

        })
        .join("");


    // CATEGORY TABLE

    categoryTableBody.innerHTML =
        Object.entries(categories)
            .map(([category, data]) => {

                const percentage =
                    totalAmount > 0
                        ? (data.total / totalAmount) * 100
                        : 0;


                return `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(category)}
                            </strong>
                        </td>

                        <td>
                            ${data.count}
                        </td>

                        <td>
                            <strong>
                                ₹${data.total.toFixed(2)}
                            </strong>
                        </td>

                        <td>
                            ${percentage.toFixed(1)}%
                        </td>

                    </tr>
                `;

            })
            .join("");

}


// ================= HTML ESCAPE =================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ================= START =================

document.addEventListener(
    "DOMContentLoaded",
    loadAnalytics
);