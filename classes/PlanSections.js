class PlanSection {
	constructor(object, index) {
		this.name = object.name || '';
		this.planItems = [];
		this.index = index == undefined ? object.index : index;
		if (object) {
			for (let i = 0; i < object.planItems.length; i++) {
				this.planItems.push(new PlanItem(object.planItems[i]));
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
		sectionBar.innerHTML = /*html*/ `
        <!-- <td><div class="option-button" onclick="revealOptions(this)"><div></div><div></div><div></div></div></td> -->
        <td><div class="option-button" onclick="revealOptions(this.parentElement)"><div></div><div></div><div></div></div></td>
        <td><input type="text" class="input-name" placeholder="Section Name" value="${this.name}" onchange="sectionNameChanged(this.parentElement.parentElement, this.value)"></td>
        <td colspan="9"></td>`;
		totalBar.before(sectionBar);
		for (let i = this.planItems.length - 1; i >= 0; i--) {
			sectionBar.after(this.planItems[i].render(this.index));
		}
	}
}
