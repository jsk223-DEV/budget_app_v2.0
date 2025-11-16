class ExpenseSection {
	constructor(object, name) {
		this.name = object.name || name;
		this.expenseItems = [];
		this.typeTotal = 0;
		if (object) {
			for (let i = 0; i < object.expenseItems.length; i++) {
				this.expenseItems.push(new ExpenseItem(object.expenseItems[i]));
			}
			this.updateTypeTotal();
		}
	}

	updateTypeTotal() {
		this.typeTotal = 0;
		for (let i = 0; i < this.expenseItems.length; i++) {
			this.typeTotal += Number(this.expenseItems[i].amount);
		}
		this.typeTotal = round(this.typeTotal);
	}

	render(categoryRow) {
		let sectionRow = document.createElement('tr');
		sectionRow.classList.add('e-section-bar');
		categoryRow.after(sectionRow);

		let typeNameCell = document.createElement('td');
		typeNameCell.innerText = this.name;
		sectionRow.appendChild(typeNameCell);

		let twoCell = document.createElement('td');
		sectionRow.appendChild(twoCell);

		let totalCell = document.createElement('td');
		totalCell.innerHTML = /*html*/ `Total: $<span class="type-total">${this.typeTotal}</span>`;
		sectionRow.appendChild(totalCell);

		for (let i = 0; i < this.expenseItems.length; i++) {
			this.expenseItems[i].render(sectionRow);
		}
	}
}
