class PlanItem {
	constructor(object, index) {
		this.name = object.name || '';
		this.budgetAmount = object.budgetAmount || 0;
		this.weeklyTotals = object.weeklyTotals || [0, 0, 0, 0, 0];
		this.leftTo = object.leftTo || 0;
		this.actualSpent = object.actualSpent || 0;
		this.index = index == undefined ? object.index : index;
	}
	render(sectIndex) {
		let item = document.createElement('tr');
		item.classList.add('plan-item');
		item.dataset.budgetLocation = sectIndex + '_' + this.index;
		item.innerHTML = /* html */ `
        <!-- <td><div class="item-button delete" onclick="deletePlanItem(this.parentElement.parentElement)"><img src="trash-can.png"></div><div class="item-button move" onclick="movePlanItem(this.parentElement.parentElement)">&udarr;</div></td> -->
        <td>
            <div class="item-button delete" onclick="deletePlanItem(this.parentElement.parentElement)"><img src="assets/trashcan.svg"></div>
            <div class="item-button move" onclick="movePlanItem(this.parentElement.parentElement)"><img src="assets/updownarr.svg"></div></td>
        <td><input type="text" class="input-name" placeholder="Item Name" value="${this.name}" onchange="itemNameChanged(this.parentElement.parentElement, this.value)"></td>
        <td><input type="number" class="budget-amount" onchange="updateBudgetAmount(this.parentElement.parentElement, this.value)"></td>
        <td></td>
        <td><input type="number" class="weekly-expense one" onchange="updateWeeklyTotal(0, this.value, this.parentElement.parentElement)"></td>
        <td><input type="number" class="weekly-expense two" onchange="updateWeeklyTotal(1, this.value, this.parentElement.parentElement)"></td>
        <td><input type="number" class="weekly-expense three" onchange="updateWeeklyTotal(2, this.value, this.parentElement.parentElement)"></td>
        <td><input type="number" class="weekly-expense four" onchange="updateWeeklyTotal(3, this.value, this.parentElement.parentElement)"></td>
        <td><input type="number" class="weekly-expense five" onchange="updateWeeklyTotal(4, this.value, this.parentElement.parentElement)"></td>
        <td class="left-to">${this.leftTo}</td>
        <td class="actual-spent">${this.actualSpent}</td>`;

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
		let leftToEle = row.querySelector('.left-to');
		let actualSpentEle = row.querySelector('.actual-spent');
		let totalSpent = 0;
		for (let i = 0; i < this.weeklyTotals.length; i++) {
			totalSpent += this.weeklyTotals[i];
		}
		this.actualSpent = totalSpent;
		actualSpentEle.innerText = this.actualSpent;
		this.leftTo = this.budgetAmount - totalSpent;
		leftToEle.innerText = this.leftTo;
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
function updateBudgetAmount(row, value) {
	let location = row.dataset.budgetLocation.split('_');
	let item = BUDGET.planSections[location[0]].planItems[location[1]];
	item.budgetAmount = Number(value);
	item.updateLTAS(row);
}
function updateWeeklyTotal(index, value, row) {
	let location = row.dataset.budgetLocation.split('_');
	let item = BUDGET.planSections[location[0]].planItems[location[1]];
	item.weeklyTotals[index] = Number(value);
	item.updateLTAS(row);
}
