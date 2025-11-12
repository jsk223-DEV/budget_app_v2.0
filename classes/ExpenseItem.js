class ExpenseItem {
	constructor(object) {
		this.fullDate = object.fullDate || '';
		this.date = object.date || '';
		this.amount = object.amount || 0;
		this.location = object.location || '';
		this.type = object.type || '';
		this.sectionIndex = object.sectionIndex;
		this.index = object.index;
	}
	render(sectionRow) {
		let newRow = document.createElement('tr');
		newRow.dataset.sectionIndex = this.sectionIndex;
		newRow.dataset.index = this.index;
		newRow.classList.add('expense-item');

		newRow.innerHTML = /*html*/ `
			<td class="expense-date">
				<button ${
					BUDGET.readOnly ? 'disabled' : ''
				} data-hover="Delete Expense" class="delete-expense" onclick="deleteExpense(this.parentElement.parentElement)">
					<img src="assets/trashcan.svg">
				</button>
				${this.date}
			</td>
			<td class="expense-dollar">${this.amount}</td>
			<td class="expense-location">${this.location}</td>
		`;

		sectionRow.after(newRow);
	}
}
