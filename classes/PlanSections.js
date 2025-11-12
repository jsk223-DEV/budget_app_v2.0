class PlanSection {
	constructor(object, index, sinking) {
		this.name = object.name || '';
		this.planItems = [];
		this.index = index == undefined ? object.index : index;
		this.sinking = sinking ? true : false;
		if (object.planItems) {
			for (let i = 0; i < object.planItems.length; i++) {
				this.planItems.push(new PlanItem(object.planItems[i], undefined, this.sinking));
			}
		}
	}

	clearItemValues() {
		for (let i = 0; i < this.planItems.length; i++) {
			this.planItems[i].clearWeeklyTotals();
		}
	}
	render(totalBar) {
		let sectionBar = document.createElement('tr');
		sectionBar.classList.add('section-bar');
		sectionBar.dataset.budgetLocation = this.index;
		if (this.sinking) {
			sectionBar.classList.add('plan-fund-section');
			sectionBar.innerHTML = /*html*/ `
				<td></td>
				<td><input value="${this.name}" disabled class="input-name" type="text" /></td>
				<td colspan="9"></td>
			`;
		} else {
			sectionBar.innerHTML = /*html*/ `
			
			<td><button ${
				BUDGET.readOnly ? 'disabled' : ''
			} data-hover="Section Options" class="option-button" onclick="revealOptions(this.parentElement)">
				<span></span>
				<span></span>
				<span></span>
		</button></td>
			<td><input ${BUDGET.readOnly ? 'disabled' : ''} type="text" class="input-name" placeholder="Section Name" value="${
				this.name
			}" onchange="sectionNameChanged(this.parentElement.parentElement, this.value)"></td>
			<td colspan="9"></td>`;
		}
		totalBar.before(sectionBar);
		for (let i = this.planItems.length - 1; i >= 0; i--) {
			sectionBar.after(this.planItems[i].render(this.index));
		}
	}
}
