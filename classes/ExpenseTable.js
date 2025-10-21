class ExpenseTable {
	constructor(object, index, firstDay) {
		this.expenseSections = [];
		this.firstDay = object.firstDay || firstDay;
		this.name = object.name || '';
		this.index = index;
		if (object) {
			for (let i = 0; i < object.expenseSections.length; i++) {
				this.expenseSections.push(new ExpenseSection(object.expenseSections[i]));
			}
		} else {
			this.setName();
		}
	}
	setName() {
		let amountOfDays = getDaysInMonth(BUDGET.date.year, BUDGET.date.month + 1);
		let secondDate = this.firstDay + 6;
		if (secondDate > amountOfDays) {
			if (BUDGET.date.month == '12') {
				secondDate = MONTH_LOOKUP.get('01') + ' ' + (secondDate - amountOfDays).toString();
			} else {
				secondDate =
					MONTH_LOOKUP.get((Number(BUDGET.date.month) + 1).toString().padStart(2, '0')) +
					' ' +
					(secondDate - amountOfDays).toString();
			}
		}
		this.name = `${MONTH_LOOKUP.get(BUDGET.date.month.toString().padStart(2, '0'))} ${
			this.firstDay
		} - ${secondDate}`;
	}
	render(oldTable) {
		let expenseMain = document.querySelector('#expenses_page #expense_main');
		let table = document.createElement('table');
		table.dataset.index = this.index;
		table.classList.add('expense-table');
		table.dataset.tableIndex = ALPHA_NUM.get((this.index + 1).toString());
		table.style.left = (this.index * 100).toString() + '%';
		if (this.index == 0) {
			table.classList.add('current-table');
		}
		table.innerHTML = /*html*/ `
				<caption>${this.name}</caption>
				<tr class="control-row">
					<td colspan="3">
						<button onclick="showExpenseForm()" class="show-expense-form">+ New Expense</button>
						<button onclick="BUDGET.expenseTables[${this.index}].transferTotals()" class="transfer-totals">Transfer Totals</button>
						<button onclick="lastWeek(); hideExpenseForm()">&larr;</button>      
						<button onclick="nextWeek(); hideExpenseForm()">&rarr;</button>
					</td>
				</tr>
				<tr class="expense-categories">
					<th>Date</th>
					<th>Dollars</th>
					<th>Location</th>
				</tr>`;
		expenseMain.appendChild(table);

		for (let i = 0; i < this.expenseSections.length; i++) {
			this.expenseSections[i].render(table.querySelector('.expense-categories'));
		}
		// this.renderSections(table);
	}
	renderSections(table) {
		let items = table.querySelectorAll('.e-section-bar, .expense-item');
		for (let i = 0; i < items.length; i++) {
			items[i].remove();
		}

		for (let i = 0; i < this.expenseSections.length; i++) {
			this.expenseSections[i].render(table.querySelector('.expense-categories'));
		}
	}

	transferTotals() {
		for (let i = 0; i < BUDGET.planSections.length; i++) {
			let section = BUDGET.planSections[i];
			for (let j = 0; j < section.planItems.length; j++) {
				section.planItems[j].weeklyTotals[this.index] = 0;
			}
		}
		for (let i = 0; i < this.expenseSections.length; i++) {
			for (let j = 0; j < BUDGET.planSections.length; j++) {
				let section = BUDGET.planSections[j];
				for (let x = 0; x < section.planItems.length; x++) {
					let planItem = section.planItems[x];
					if (planItem.name === this.expenseSections[i].name) {
						planItem.weeklyTotals[this.index] = this.expenseSections[i].typeTotal;
						planItem.updateLTAS(
							document.querySelector('#plan_page [data-budget-location="' + j + '_' + x + '"]')
						);
					}
				}
			}
		}
		BUDGET.renderPlanSections();
		showMessageBanner('Expense totals for ' + this.name + ' carried over to plan.');
	}
}
