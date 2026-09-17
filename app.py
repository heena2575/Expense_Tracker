from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path

from database import initialize_database, get_connection


# ==================================================
# PROJECT PATHS
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"


# ==================================================
# FLASK APP
# ==================================================

app = Flask(__name__)


# ==================================================
# DATABASE
# ==================================================

initialize_database()


# ==================================================
# FRONTEND ROUTES
# ==================================================

@app.route("/")
@app.route("/index.html")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/analytics.html")
def analytics():
    return send_from_directory(FRONTEND_DIR, "analytics.html")


@app.route("/css/<path:filename>")
def css_files(filename):
    return send_from_directory(FRONTEND_DIR / "css", filename)


@app.route("/js/<path:filename>")
def js_files(filename):
    return send_from_directory(FRONTEND_DIR / "js", filename)


# ==================================================
# CREATE EXPENSE
# ==================================================

@app.route("/api/expenses", methods=["POST"])
def add_expense():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    title = str(data.get("title", "")).strip()
    amount = data.get("amount")
    category = str(data.get("category", "")).strip()
    expense_date = str(data.get("expense_date", "")).strip()
    description = str(data.get("description", "")).strip()

    if not title:
        return jsonify({
            "success": False,
            "message": "Expense title is required"
        }), 400

    if amount is None or str(amount).strip() == "":
        return jsonify({
            "success": False,
            "message": "Amount is required"
        }), 400

    try:
        amount = float(amount)
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Amount must be a valid number"
        }), 400

    if amount <= 0:
        return jsonify({
            "success": False,
            "message": "Amount must be greater than zero"
        }), 400

    if not category:
        return jsonify({
            "success": False,
            "message": "Category is required"
        }), 400

    if not expense_date:
        return jsonify({
            "success": False,
            "message": "Date is required"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO expenses
        (title, amount, category, expense_date, description)
        VALUES (?, ?, ?, ?, ?)
    """, (
        title,
        amount,
        category,
        expense_date,
        description
    ))

    connection.commit()

    new_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "success": True,
        "message": "Expense added successfully",
        "id": new_id
    }), 201


# ==================================================
# READ EXPENSES
# ==================================================

@app.route("/api/expenses", methods=["GET"])
def get_expenses():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            title,
            amount,
            category,
            expense_date,
            description
        FROM expenses
        ORDER BY expense_date DESC, id DESC
    """)

    expenses = cursor.fetchall()

    connection.close()

    expense_list = []

    for expense in expenses:

        expense_list.append({
            "id": expense["id"],
            "title": expense["title"],
            "amount": expense["amount"],
            "category": expense["category"],
            "expense_date": expense["expense_date"],
            "description": expense["description"] or ""
        })

    return jsonify(expense_list)


# ==================================================
# UPDATE EXPENSE
# ==================================================

@app.route("/api/expenses/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    title = str(data.get("title", "")).strip()
    amount = data.get("amount")
    category = str(data.get("category", "")).strip()
    expense_date = str(data.get("expense_date", "")).strip()
    description = str(data.get("description", "")).strip()

    if not title:
        return jsonify({
            "success": False,
            "message": "Expense title is required"
        }), 400

    if amount is None or str(amount).strip() == "":
        return jsonify({
            "success": False,
            "message": "Amount is required"
        }), 400

    try:
        amount = float(amount)
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Amount must be a valid number"
        }), 400

    if amount <= 0:
        return jsonify({
            "success": False,
            "message": "Amount must be greater than zero"
        }), 400

    if not category:
        return jsonify({
            "success": False,
            "message": "Category is required"
        }), 400

    if not expense_date:
        return jsonify({
            "success": False,
            "message": "Date is required"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id
        FROM expenses
        WHERE id = ?
    """, (expense_id,))

    existing_expense = cursor.fetchone()

    if not existing_expense:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Expense not found"
        }), 404

    cursor.execute("""
        UPDATE expenses
        SET
            title = ?,
            amount = ?,
            category = ?,
            expense_date = ?,
            description = ?
        WHERE id = ?
    """, (
        title,
        amount,
        category,
        expense_date,
        description,
        expense_id
    ))

    connection.commit()

    connection.close()

    return jsonify({
        "success": True,
        "message": "Expense updated successfully"
    })


# ==================================================
# DELETE EXPENSE
# ==================================================

@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id
        FROM expenses
        WHERE id = ?
    """, (expense_id,))

    existing_expense = cursor.fetchone()

    if not existing_expense:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Expense not found"
        }), 404

    cursor.execute("""
        DELETE FROM expenses
        WHERE id = ?
    """, (expense_id,))

    connection.commit()

    connection.close()

    return jsonify({
        "success": True,
        "message": "Expense deleted successfully"
    })


# ==================================================
# RUN APPLICATION
# ==================================================

if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )