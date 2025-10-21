class ExpenseItem {
	constructor(object) {
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

		let dateCell = document.createElement('td');
		dateCell.classList.add('expense-date');
		dateCell.innerHTML = /*html*/ `<button class="delete-expense" onclick="deleteExpense(this.parentElement.parentElement)"><img src="assets/trashcan.svg"></button> ${this.date}`;
		newRow.appendChild(dateCell);

		let amountCell = document.createElement('td');
		amountCell.classList.add('expense-dollar');
		amountCell.innerText = this.amount;
		newRow.appendChild(amountCell);

		let locationCell = document.createElement('td');
		locationCell.classList.add('expense-location');
		locationCell.innerText = this.location;
		newRow.appendChild(locationCell);

		sectionRow.after(newRow);
	}
}
