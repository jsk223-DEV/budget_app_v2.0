class Budget {
	constructor(object, index) {
		let d = new Date();
		this.name = '';
		this.date = object.date || { month: d.getMonth(), year: d.getFullYear() };
		this.autoSave = object.autoSave || true;
		this.payDayPreference = object.payDayPreference || 2;
		this.payDays = object.payDays || [0, 0, 0, 0, 0];
		this.weeklyIncomes = object.weeklyIncomes || [0, 0, 0, 0, 0];
		this.weeklyExpenseTotals = object.weeklyExpenseTotals || [0, 0, 0, 0, 0];
		this.totalIncome = object.totalIncome || 0;
		this.totalBudgeted = object.totalBudgeted || 0;
		this.totalLeftTo = object.totalLeftTo || 0;
		this.totalActualSpent = object.totalActualSpent || 0;
		this.planSections = object ? [] : [new PlanSection(false, 0)];
		this.expenseTables = [];
		this.totalBar = {
			bar: document.querySelector('#plan_page #total_bar'),
			totalBudgeted: document.querySelector('#plan_page #total_budgeted'),
			weeklyExpenseTotals: document.querySelectorAll('#plan_page #total_bar .weekly-expense-total'),
			totalLeftTo: document.querySelector('#plan_page #total_bar #total_left_to'),
			totalActualSpent: document.querySelector('#plan_page #total_bar #total_actual_spent'),
			totalIncome: document.querySelector('#plan_table #total_income'),
			shouldBeZero: document.querySelector('#plan_table #should_be_zero'),
		};
		this.index = index == undefined ? object.index : index;
		if (object) {
			for (let i = 0; i < object.planSections.length; i++) {
				this.planSections.push(new PlanSection(object.planSections[i]));
			}
			for (let i = 0; i < object.expenseTables.length; i++) {
				this.expenseTables.push(new ExpenseTable(object.expenseTables[i], i));
			}
		} else {
		}
	}

	updateName() {
		this.name = MONTH_LOOKUP.get(this.date.month.toString().padStart(2, '0')) + ' ' + this.date.year;
		document.querySelector('#plan_page #budget_name').innerText = this.name;
	}

	render() {
		this.renderPlanSections();
		this.renderExpenseTables();
	}

	renderPlanSections() {
		let oldSections = document.querySelectorAll('#plan_page .section-bar, #plan_page .plan-item');

		for (let i = 0; i < oldSections.length; i++) {
			oldSections[i].remove();
		}
		for (let i = 0; i < this.planSections.length; i++) {
			this.planSections[i].render(this.totalBar.bar);
		}
	}

	renderExpenseTables() {
		let oldTables = document.querySelectorAll('#expenses_page .expense-table');

		for (let i = 0; i < oldTables.length; i++) {
			oldTables[i].remove();
		}
		for (let i = 0; i < this.expenseTables.length; i++) {
			this.expenseTables[i].render();
		}
	}

	clearBudgetValues() {
		this.weeklyIncomes = [0, 0, 0, 0, 0];
		for (let i = 0; i < this.planSections.length; i++) {
			this.planSections[i].clearItemValues();
		}
		this.updateTotals();
	}

	updateTotals() {
		this.totalIncome = 0;
		this.totalBudgeted = 0;
		this.totalLeftTo = 0;
		this.totalActualSpent = 0;
		let weeklyIncomeEles = document.querySelectorAll('#plan_page .weekly-income');
		for (let i = 0; i < this.weeklyIncomes.length; i++) {
			if (this.weeklyIncomes[i]) {
				weeklyIncomeEles[i].value = this.weeklyIncomes[i];
			} else if (this.weeklyIncomes[i] == 0) {
				weeklyIncomeEles[i].value = '';
			}
		}
		for (let i = 0; i < this.weeklyExpenseTotals.length; i++) {
			this.weeklyExpenseTotals[i] = 0;
		}
		for (let i = 0; i < this.planSections.length; i++) {
			let pSection = this.planSections[i];
			for (let j = 0; j < pSection.planItems.length; j++) {
				let pItem = pSection.planItems[j];
				this.totalBudgeted += pItem.budgetAmount;
				this.totalLeftTo += pItem.leftTo;
				this.totalActualSpent += pItem.actualSpent;
				for (let w = 0; w < this.weeklyExpenseTotals.length; w++) {
					this.weeklyExpenseTotals[w] += pItem.weeklyTotals[w];
				}
			}
		}
		for (let i = 0; i < this.weeklyIncomes.length; i++) {
			this.totalIncome += this.weeklyIncomes[i];
		}
		this.totalBar.totalBudgeted.innerText = this.totalBudgeted;
		for (let i = 0; i < this.weeklyExpenseTotals.length; i++) {
			this.totalBar.weeklyExpenseTotals[i].innerText = this.weeklyExpenseTotals[i];
		}
		this.totalBar.totalLeftTo.innerText = this.totalLeftTo;
		this.totalBar.totalActualSpent.innerText = this.totalActualSpent;
		this.totalBar.totalIncome.innerText = this.totalIncome;
		this.totalBar.shouldBeZero.innerText = this.totalIncome - this.totalBudgeted;
	}

	setUpExpenseTables(copyData) {
		let numOfOldTables = this.expenseTables.length;
		for (let i = 0; i < this.payDays.length; i++) {
			if (copyData) {
				let table = new ExpenseTable(this.expenseTables[i], i);
				this.expenseTables.push(table);
				table.firstDay = this.payDays[i];
				table.setName();
			} else {
				this.expenseTables.push(new ExpenseTable(false, i, this.payDays[i]));
			}
		}
		if (copyData) {
			this.expenseTables.splice(0, numOfOldTables);
		}
	}
}
