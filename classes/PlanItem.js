class PlanItem {
	constructor(object, index, sinking) {
		this.name = object.name || '';
		this.budgetAmount = object.budgetAmount || 0;
		this.weeklyTotals = object.weeklyTotals || [0, 0, 0, 0, 0];
		this.leftTo = object.leftTo || 0;
		this.actualSpent = object.actualSpent || 0;
		this.index = index == undefined ? object.index : index;
		this.sinking = sinking ? true : false;
	}
	render(sectIndex) {
		let item = document.createElement('tr');
		item.classList.add('plan-item');
		item.dataset.budgetLocation = sectIndex + '_' + this.index;
		if (this.sinking) {
			let sf = BUDGET.sinkingFunds[this.index];
			let tb = '';
			if (sf.targetBalance && sf.targetBalance > 0) {
				tb = `/$${sf.targetBalance}`;
			}
			item.classList.add('plan-fund-item');
			item.innerHTML = /* html */ `
				<td></td>
				<td><input type="text" class="input-name" placeholder="Item Name" value="${this.name}" disabled><span>$${sf.balance
					.toString()
					.concat(tb)}</span></td>
				<td><input ${
					BUDGET.readOnly ? 'disabled' : ''
				} type="number" class="budget-amount" onchange="this.value = Math.round(this.value);updateBudgetAmount(this.parentElement.parentElement, this.value, true)"></td>
				<td></td>
				<td><input disabled type="number" class="weekly-expense one" onchange="updateWeeklyTotal(0, this.value, this.parentElement.parentElement, true)"></td>
				<td><input disabled type="number" class="weekly-expense two" onchange="updateWeeklyTotal(1, this.value, this.parentElement.parentElement, true)"></td>
				<td><input disabled type="number" class="weekly-expense three" onchange="updateWeeklyTotal(2, this.value, this.parentElement.parentElement, true)"></td>
				<td><input disabled type="number" class="weekly-expense four" onchange="updateWeeklyTotal(3, this.value, this.parentElement.parentElement, true)"></td>
				<td><input disabled type="number" class="weekly-expense five" onchange="updateWeeklyTotal(4, this.value, this.parentElement.parentElement, true)"></td>
				<td class="left-to">${this.leftTo}</td>
				<td class="actual-spent">${this.actualSpent}</td>`;
		} else {
			// <img class="move" src="assets/updownarr.svg">
			// <svg xmlns="http://www.w3.org/2000/svg" class="move"><use href="#updownarr"></use></svg>
			item.innerHTML = /* html */ `
				<td>
					<button ${
						BUDGET.readOnly ? 'disabled' : ''
					} data-hover="Delete Item" class="item-button delete" onclick="deletePlanItem(this.parentElement.parentElement)"><img src="assets/trashcan.svg"></button>
					<button ${
						BUDGET.readOnly ? 'disabled' : ''
					} data-hover="Move Item" class="item-button move" onclick="movePlanItem(this.parentElement.parentElement)"><img class="move" src="assets/updownarr.svg"></button></td>
				<td><input ${BUDGET.readOnly ? 'disabled' : ''} type="text" class="input-name" placeholder="Item Name" value="${
					this.name
				}" onchange="itemNameChanged(this.parentElement.parentElement, this.value)"></td>
				<td><input ${
					BUDGET.readOnly ? 'disabled' : ''
				} type="number" class="budget-amount" onchange="this.value = Math.round(this.value);updateBudgetAmount(this.parentElement.parentElement, this.value)"></td>
				<td></td>
				<td><input disabled type="number" class="weekly-expense one" onchange="updateWeeklyTotal(0, this.value, this.parentElement.parentElement)"></td>
				<td><input disabled type="number" class="weekly-expense two" onchange="updateWeeklyTotal(1, this.value, this.parentElement.parentElement)"></td>
				<td><input disabled type="number" class="weekly-expense three" onchange="updateWeeklyTotal(2, this.value, this.parentElement.parentElement)"></td>
				<td><input disabled type="number" class="weekly-expense four" onchange="updateWeeklyTotal(3, this.value, this.parentElement.parentElement)"></td>
				<td><input disabled type="number" class="weekly-expense five" onchange="updateWeeklyTotal(4, this.value, this.parentElement.parentElement)"></td>
				<td class="left-to">${this.leftTo}</td>
				<td class="actual-spent">${this.actualSpent}</td>`;
		}

		let weeklyExpenseEles = item.querySelectorAll('.weekly-expense');
		for (let i = 0; i < weeklyExpenseEles.length; i++) {
			if (this.weeklyTotals[i]) {
				weeklyExpenseEles[i].value = this.weeklyTotals[i];
			}
		}
		let budgetAmountEle = item.querySelector('.budget-amount');
		if (this.budgetAmount) {
			budgetAmountEle.value = this.budgetAmount;
		}
		return item;
	}

	updateLTAS(row) {
		let totalSpent = 0;
		for (let i = 0; i < this.weeklyTotals.length; i++) {
			totalSpent += this.weeklyTotals[i];
		}
		this.actualSpent = round(totalSpent);
		this.leftTo = round(this.budgetAmount - totalSpent);
		if (row) {
			row.querySelector('.left-to').innerText = this.leftTo;
			row.querySelector('.actual-spent').innerText = this.actualSpent;
		}
		BUDGET.updateTotals();
	}
	clearWeeklyTotals() {
		for (let i = 0; i < this.weeklyTotals.length; i++) {
			this.weeklyTotals[i] = 0;
		}
		this.leftTo = 0;
		this.actualSpent = 0;
	}
}
function updateBudgetAmount(row, value, sunk) {
	let location = row.dataset.budgetLocation.split('_');
	let item = sunk
		? BUDGET.planFundSection.planItems[location[1]]
		: BUDGET.planSections[location[0]].planItems[location[1]];
	item.budgetAmount = Number(value);
	item.updateLTAS(row);
}
function updateWeeklyTotal(index, value, row, sunk) {
	let location = row.dataset.budgetLocation.split('_');
	let item = sunk
		? BUDGET.planFundSection.planItems[location[1]]
		: BUDGET.planSections[location[0]].planItems[location[1]];
	item.weeklyTotals[index] = Number(value);
	item.updateLTAS(row);
}
