class Budget {
	constructor(object, index) {
		let d = new Date();
		this.name = object.name || '';
		this.date = object.date || { month: d.getMonth(), year: d.getFullYear() };
		this.autoSave = object.autoSave != undefined ? object.autoSave : true;
		this.readOnly = object.readOnly != undefined ? object.readOnly : false;
		this.payDayPreference = object.payDayPreference || 2;
		this.payDays = object.payDays || [0, 0, 0, 0, 0];
		this.weeklyIncomes = object.weeklyIncomes || [0, 0, 0, 0, 0];
		this.weeklyExpenseTotals = object.weeklyExpenseTotals || [0, 0, 0, 0, 0];
		this.totalIncome = object.totalIncome || 0;
		this.totalBudgeted = object.totalBudgeted || 0;
		this.totalLeftTo = object.totalLeftTo || 0;
		this.totalActualSpent = object.totalActualSpent || 0;
		this.planSections = object ? [] : [new PlanSection(false, 0)];
		this.planFundSection = object.planFundSection
			? new PlanSection(object.planFundSection, undefined, true)
			: new PlanSection({ name: 'Sinking Funds' }, undefined, true);
		this.expenseTables = [];
		this.sinkingFunds = [];
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
		if (object.planSections) {
			for (let i = 0; i < object.planSections.length; i++) {
				this.planSections.push(new PlanSection(object.planSections[i]));
			}
		}
		if (object.expenseTables) {
			for (let i = 0; i < object.expenseTables.length; i++) {
				this.expenseTables.push(new ExpenseTable(object.expenseTables[i], i));
			}
		}
		if (object.sinkingFunds) {
			for (let i = 0; i < object.sinkingFunds.length; i++) {
				this.sinkingFunds.push(new SinkingFund(object.sinkingFunds[i], i));
			}
		}
		if (this.readOnly) {
			this.setToReadOnly();
		} else if (!this.readOnly) {
			let wkinEles = document.querySelectorAll('#plan_page .weekly-income');
			for (let i = 0; i < wkinEles.length; i++) {
				wkinEles[i].removeAttribute('disabled');
			}
			document.querySelector('#sinking_funds_page #new_sinking_fund').removeAttribute('disabled');
		}
	}

	setToReadOnly() {
		this.readOnly = true;
		document.querySelector('#plan_page #budget_name').innerText += ' (Read Only)';
		let wkinEles = document.querySelectorAll('#plan_page .weekly-income');
		for (let i = 0; i < wkinEles.length; i++) {
			wkinEles[i].setAttribute('disabled', '');
		}
		document.querySelector('#sinking_funds_page #new_sinking_fund').setAttribute('disabled', '');
	}

	updateName() {
		this.name = MONTH_LOOKUP.get(this.date.month.toString().padStart(2, '0')) + ' ' + this.date.year;
		if (this.readOnly) {
			this.name += ' (Read Only)';
		}
		document.querySelector('#plan_page #budget_name').innerText = this.name;
	}

	render() {
		this.renderPlanSections();
		this.renderExpenseTables();
		this.renderSinkingFunds();

		this.renderFundSection();
	}

	renderFundSection() {
		let oldSpacer = document.querySelector('#plan_page .spacer');
		if (oldSpacer) {
			oldSpacer.remove();
		}
		let oldItems = document.querySelectorAll(
			'#plan_page .section-bar.plan-fund-section, #plan_page .plan-item.plan-fund-item'
		);
		for (let i = 0; i < oldItems.length; i++) {
			oldItems[i].remove();
		}
		if (this.planFundSection.planItems.length < 1) {
			return;
		}
		let spacer = document.createElement('tr');
		spacer.classList.add('spacer');
		spacer.innerHTML = /*html*/ `
			<td colspan="11"></td>
		`;
		this.totalBar.bar.before(spacer);
		this.planFundSection.render(this.totalBar.bar);
	}

	renderPlanSections() {
		let oldSections = document.querySelectorAll(
			'#plan_page .section-bar:not(.plan-fund-section), #plan_page .plan-item:not(.plan-fund-item)'
		);

		for (let i = 0; i < oldSections.length; i++) {
			oldSections[i].remove();
		}
		let fundSection = document.querySelector('#plan_page .spacer');
		let before = fundSection || this.totalBar.bar;
		for (let i = 0; i < this.planSections.length; i++) {
			this.planSections[i].render(before);
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

	renderSinkingFunds() {
		let oldFunds = document.querySelectorAll('#sinking_main .sinking-fund');

		for (let i = 0; i < oldFunds.length; i++) {
			oldFunds[i].remove();
		}
		for (let i = 0; i < this.sinkingFunds.length; i++) {
			this.sinkingFunds[i].index = i;
			this.sinkingFunds[i].render();
		}
	}

	clearBudgetValues() {
		this.weeklyIncomes = [0, 0, 0, 0, 0];
		for (let i = 0; i < this.planSections.length; i++) {
			this.planSections[i].clearItemValues();
		}
		this.planFundSection.clearItemValues();
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
		for (let i = 0; i < this.planFundSection.planItems.length; i++) {
			let item = this.planFundSection.planItems[i];
			this.totalBudgeted += item.budgetAmount;
			this.totalLeftTo += item.leftTo;
			this.totalActualSpent += item.actualSpent;
			for (let w = 0; w < this.weeklyExpenseTotals.length; w++) {
				this.weeklyExpenseTotals[w] += item.weeklyTotals[w];
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
