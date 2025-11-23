class SinkingFund {
	constructor(object, index) {
		this.name = object.name || '';
		this.balance = Number(object.balance) || 0;
		this.index = index;
		this.history = object.history || [];
		this.targetBalance = object.targetBalance || 0;
	}

	addIncome(date, amount, location) {
		this.balance += Number(amount);
		this.balance = round(this.balance);
		let loc = location || '--';
		let d = date || '--';
		this.history.unshift(new SinkingHistoryItem({ type: 'income', amount: '$' + amount, location: loc, date: d }));
	}

	addExpense(date, amount, location) {
		this.balance -= Number(amount);
		this.balance = round(this.balance);
		let loc = location || '--';
		let d = date || '--';
		this.history.unshift(new SinkingHistoryItem({ type: 'expense', amount: '$' + amount, location: loc, date: d }));
	}

	render() {
		let tb = '';
		if (this.targetBalance && this.targetBalance > 0) {
			tb = `/$${this.targetBalance}`;
		}
		let div = document.createElement('div');
		div.classList.add('sinking-fund');
		div.innerHTML = /*html*/ `
			<div class="sinking-manual-form form">
				<div class="form-name">Add Money</div>
				<div>
					<label>Amount $: </label>
					<input class="sinking-manual-amount" type="number" />
				</div>
				<div>
					<label>Date: </label>
					<input class="sinking-manual-date" type="date" />
				</div>
				<div>
					<label>Location: </label>
					<input class="sinking-manual-location" type="text" />
				</div>

				<div>
					<button onclick="hideManualForm(this.parentElement.parentElement)">Cancel</button>
					<button class="submit-manual-button" onclick="submitManualAmount(this.parentElement.parentElement); hideManualForm(this.parentElement.parentElement)">
						Submit
					</button>
				</div>
			</div>
			<div class="change-tb-form form">
				<div class="form-name">Target Balance</div>
				<div>
					<label>Amount $: </label>
					<input class="sinking-tb-amount" type="number" />
				</div>
				<div>
					<button onclick="hideTBForm(this.parentElement.parentElement)">Cancel</button>
					<button class="submit-tb-button" onclick="submitTBAmount(this.parentElement.parentElement); hideTBForm(this.parentElement.parentElement)">
						Submit
					</button>
				</div>
			</div>
			<div class="control">
				<button ${
					BUDGET.readOnly ? 'disabled' : ''
				}  data-hover="Add Money" class="add-money" onclick="showManualForm('income', 
					${this.index}
				)"><img src="assets/plus.svg" /></button>
				<button ${
					BUDGET.readOnly ? 'disabled' : ''
				}  data-hover="Remove Money" class="remove-money" onclick="showManualForm('expense', 
					${this.index}
				)"><img src="assets/subtract.svg" /></button>
				<button ${BUDGET.readOnly ? 'disabled' : ''}  data-hover="Delete Fund" class="delete-fund" onclick="deleteSinkingFund(
					${this.index}
				)"><img src="assets/trashcan.svg" /></button>
				<button ${
					BUDGET.readOnly ? 'disabled' : ''
				}  data-hover="Change Target Balance" class="change-target-balance" onclick="showTBForm(
					${this.index}
				)"><img src="assets/goal.svg"></button>
			</div>
			<input class="name" value="${this.name}" type="text" onchange="fundNameChanged(this, ${this.index})"/>
			<span class="balance" style="font-size: clamp(24px, ${
				((22 - ('$' + this.balance + tb).length) * 50) / 20 + 'px'
			}, 35px);">$${this.balance}${tb}</span>
			<ul class="history">
				<li>
					<span>Date</span>
					<span>Amount</span>
					<span>Location</span>
				</li>
				${this.renderHistory()}
			</ul>
		`;
		document.querySelector('#sinking_main').append(div);
	}

	renderHistory() {
		let html = '';
		for (let i = 0; i < this.history.length; i++) {
			let item = this.history[i];
			html += /*html*/ `
				<li class="${item.type}">
					<span>${item.date}</span>
					<span>${item.amount}</span>
					<span>${item.location}</span>
				</li>`;
		}
		return html;
	}
}

class SinkingHistoryItem {
	constructor(object) {
		this.type = object.type;
		this.location = object.location;
		this.amount = object.amount;
		this.date = object.date;
	}
}
