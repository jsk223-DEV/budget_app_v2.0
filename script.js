let BUDGET;
if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
	document.getElementById('small_screen_overlay').style.display = 'flex';
}
window.addEventListener('load', () => {
	let saves = JSON.parse(localStorage.getItem('BUDGET_SAVES'));
	if (!saves || saves.length == 0) {
		BUDGET = new Budget(false, 0);
		autoSetPayDaysToPrefered();
		BUDGET.setUpExpenseTables(false);
		localStorage.setItem('BUDGET_SAVES', JSON.stringify([BUDGET]));
	} else {
		BUDGET = new Budget(saves[saves.length - 1]);
		autoSetPayDaysToPrefered();
	}
	BUDGET.updateTotals();
	BUDGET.updateName();
	document.querySelector('#plan_page #pay_day_drop').value = BUDGET.payDayPreference;
	BUDGET.render();
});
window.addEventListener('beforeunload', () => {
	saveBudget();
});
function saveBudget(manual) {
	if (!BUDGET.autoSave && !manual) {
		return;
	}
	let saves = JSON.parse(localStorage.getItem('BUDGET_SAVES'));
	if (!saves) {
		return;
	}
	if (BUDGET.index <= saves.length) {
		saves[BUDGET.index] = BUDGET;
	} else {
		saves.push(BUDGET);
	}
	localStorage.setItem('BUDGET_SAVES', JSON.stringify(saves));
	showMessageBanner(BUDGET.name + ' Saved!');
}
function moveToPage(navButton, pageLocations) {
	let pages = document.querySelectorAll('.page');
	let navButtons = document.querySelectorAll('#nav button');
	for (let i = 0; i < pages.length; i++) {
		navButtons[i].classList.remove('active');
		pages[i].style.left = pageLocations[i] + 'vw';
	}
	navButton.classList.add('active');
}
function revealOptions(ele) {
	let optionBox = document.getElementById('item_options');
	let left = ele.offsetLeft + ele.offsetWidth;
	let top = ele.offsetTop;
	optionBox.style.left = left + 'px';
	optionBox.style.top = top + 'px';
	optionBox.style.display = 'block';
	ele.parentElement.classList.add('focus');
	optionBox.classList.add('visible');
}
function closeOptions(box) {
	box.style.display = 'none';
	box.classList.remove('visible');
}
function revealLoadOptions() {
	let optionBox = document.getElementById('load_options');
	let linesContainer = document.querySelector('#load_options #lines_container');
	let rows = document.querySelectorAll('#lines_container div');
	let saves = JSON.parse(localStorage.getItem('BUDGET_SAVES'));
	if (saves && saves.length > 0) {
		for (let i = 0; i < rows.length; i++) {
			rows[i].remove();
		}
		for (let i = saves.length - 1; i >= 0; i--) {
			let div = document.createElement('div');
			div.innerText = saves[i].name;
			div.onclick = () => {
				load(saves[i]);
				closeOptions(optionBox);
			};
			linesContainer.appendChild(div);
		}
	} else {
		linesContainer.innerHTML = '<div>No Budgets Saved</div>';
	}

	optionBox.style.display = 'block';
	optionBox.classList.add('visible');
}

function addPlanSection() {
	let focusedSection = document.querySelector('#plan_page .focus');
	let fSBudgetLocation = Number(focusedSection.dataset.budgetLocation);
	let endSections = BUDGET.planSections.splice(fSBudgetLocation + 1);
	BUDGET.planSections.push(new PlanSection(false, fSBudgetLocation + 1));
	for (let i = 0; i < endSections.length; i++) {
		endSections[i].index = fSBudgetLocation + 2 + i;
		BUDGET.planSections.push(endSections[i]);
	}
	document.querySelector('.focus').classList.remove('focus');
	BUDGET.renderPlanSections();
}

function deletePlanSection() {
	if (BUDGET.planSections.length == 1) {
		document.querySelector('.focus').classList.remove('focus');
		return;
	}
	let focusedSection = document.querySelector('#plan_page .focus');
	let fSBudgetLocation = Number(focusedSection.dataset.budgetLocation);
	BUDGET.planSections.splice(fSBudgetLocation, 1);
	for (let i = fSBudgetLocation; i < BUDGET.planSections.length; i++) {
		BUDGET.planSections[i].index = i;
	}
	document.querySelector('.focus').classList.remove('focus');
	BUDGET.updateTotals();
	BUDGET.renderPlanSections();
}

function addPlanItem() {
	let focusedSection = document.querySelector('#plan_page .focus');
	let fSBudgetLocation = Number(focusedSection.dataset.budgetLocation);
	BUDGET.planSections[fSBudgetLocation].planItems.unshift(new PlanItem(false, 0));
	for (let i = 0; i < BUDGET.planSections[fSBudgetLocation].planItems.length; i++) {
		BUDGET.planSections[fSBudgetLocation].planItems[i].index = i;
	}
	document.querySelector('.focus').classList.remove('focus');
	BUDGET.renderPlanSections();
}

function deletePlanItem(item) {
	let itemLocation = item.dataset.budgetLocation.split('_');
	BUDGET.planSections[itemLocation[0]].planItems.splice(itemLocation[1], 1);
	for (let i = itemLocation[1]; i < BUDGET.planSections[itemLocation[0]].planItems.length; i++) {
		BUDGET.planSections[itemLocation[0]].planItems[i].index = i;
	}
	BUDGET.updateTotals();
	BUDGET.renderPlanSections();
}

function sectionNameChanged(row, value) {
	let location = Number(row.dataset.budgetLocation);
	BUDGET.planSections[location].name = value;
}
function itemNameChanged(row, value) {
	let location = row.dataset.budgetLocation.split('_');
	BUDGET.planSections[location[0]].planItems[location[1]].name = value;
}

function getDaysInMonth(year, month) {
	return new Date(year, month, 0).getDate();
}

function autoSetPayDaysToPrefered() {
	let payDayEles = document.querySelectorAll('#plan_page .pay-day');
	let month = Number(BUDGET.date.month) + 1;
	let year = BUDGET.date.year;
	let payDayOne;
	BUDGET.payDays.length = 0;
	let daysInMonth = getDaysInMonth(year, month);
	for (let i = 1; i < 8; i++) {
		let dayOfWeek = new Date(month + ',' + i + ',' + year).getDay();
		if (dayOfWeek == BUDGET.payDayPreference) {
			payDayOne = i;
			for (let j = 0; j < 5; j++) {
				let day = payDayOne + j * 7;
				if (day > daysInMonth) {
					payDayEles[j].innerText = 'N/A';
				} else {
					BUDGET.payDays.push(day);
					payDayEles[j].innerHTML = ordinalNumberify(day);
				}
			}
		}
	}
}

function setPayDayPreference(select) {
	BUDGET.payDayPreference = select.value;
	autoSetPayDaysToPrefered();
	BUDGET.setUpExpenseTables(true);
	BUDGET.renderExpenseTables();
}

function nextMonth() {
	BUDGET.setToReadOnly();
	let saves = JSON.parse(localStorage.getItem('BUDGET_SAVES'));
	if (BUDGET.index < saves.length - 1) {
		load(saves[BUDGET.index + 1]);
		return;
	}
	saveBudget();
	BUDGET = saves[saves.length - 1];
	let newBudget = new Budget(BUDGET, BUDGET.index + 1);
	let month = BUDGET.date.month;
	let year = BUDGET.date.year;
	month = Number(month) + 1;
	if (month > 11) {
		month = '00';
		year = Number(date[1]) + 1;
	}
	newBudget.date.month = month.toString().padStart(2, '0') + '_' + date[1];
	newBudget.date.year = year;
	BUDGET = newBudget;
	BUDGET.clearBudgetValues();
	BUDGET.render();
	BUDGET.updateTotals();
	BUDGET.updateName();
	autoSetPayDaysToPrefered();
	BUDGET.expenseTables = [];
	BUDGET.setUpExpenseTables(false);
	saveBudget();
}

function thisMonth() {
	saveBudget();
	let saves = JSON.parse(localStorage.getItem('BUDGET_SAVES'));
	let thisDate = new Date();
	let thisDateName = MONTH_LOOKUP.get(thisDate.getMonth().toString().padStart(2, '0')) + ' ' + thisDate.getFullYear();
	for (let i = 0; i < saves.length; i++) {
		if (saves[i].name == thisDateName) {
			load(saves[i]);
			i = saves.length;
			return;
		}
	}
	BUDGET.setToReadOnly();
	BUDGET = saves[saves.length - 1];
	let newBudget = new Budget(BUDGET, BUDGET.index + 1);
	newBudget.date = { month: thisDate.getMonth().toString().padStart(2, '0'), year: thisDate.getFullYear() };
	BUDGET = newBudget;
	BUDGET.clearBudgetValues();
	BUDGET.updateTotals();
	BUDGET.updateName();
	autoSetPayDaysToPrefered();
	BUDGET.expenseTables = [];
	BUDGET.setUpExpenseTables(false);
	BUDGET.render();
	saveBudget();
}

function load(object) {
	saveBudget();
	BUDGET = new Budget(object);
	BUDGET.updateTotals();
	BUDGET.updateName();
	autoSetPayDaysToPrefered();
	document.querySelector('#plan_page #pay_day_drop').value = BUDGET.payDayPreference;
	BUDGET.render();
}
function updateIncome(index, value) {
	BUDGET.weeklyIncomes[index] = Number(value);
	BUDGET.updateTotals();
}
function showMessageBanner(message) {
	let messageBanner = document.querySelector('#message_banner');
	if (messageBanner.classList.contains('banner-visible')) {
		return;
	}
	messageBanner.innerText = message;
	messageBanner.style.opacity = 1;
	messageBanner.classList.add('banner-visible');
	setTimeout(() => {
		messageBanner.style.opacity = 0;
		messageBanner.classList.remove('banner-visible');
	}, 4000);
}

function moveSection() {
	removeMoveMarkers();
	let focusedSection = document.querySelector('#plan_page .focus');
	focusedSection.classList.add('move-focus');
	let fSBudgetLocation = Number(focusedSection.dataset.budgetLocation);
	showSectionMarkers(fSBudgetLocation);
	document.querySelector('.focus').classList.remove('focus');
}

function moveSectionTo(focused, destination) {
	removeMoveMarkers();
	if (focused < destination) {
		destination--;
	}

	let focusedSection = BUDGET.planSections.splice(focused, 1)[0];
	let endSections = BUDGET.planSections.splice(destination);
	BUDGET.planSections.push(focusedSection);
	for (let i = 0; i < endSections.length; i++) {
		BUDGET.planSections.push(endSections[i]);
	}
	for (let i = 0; i < BUDGET.planSections.length; i++) {
		BUDGET.planSections[i].index = i;
	}
	BUDGET.render();
}

function showSectionMarkers(focusedLoc) {
	let sectionBars = document.querySelectorAll('#plan_page .section-bar:not(.plan-fund-section)');
	let planPage = document.querySelector('#plan_page');
	let planTable = document.querySelector('#plan_table');
	for (let i = 0; i < sectionBars.length; i++) {
		if (i == focusedLoc || i == focusedLoc + 1) {
			continue;
		}
		let marker = document.createElement('div');
		marker.classList.add('move-marker');
		marker.style.top = planTable.offsetTop + sectionBars[i].offsetTop + 'px';
		marker.onclick = () => moveSectionTo(Number(focusedLoc), Number(sectionBars[i].dataset.budgetLocation));
		marker.innerHTML = '<div></div><div></div><div></div>';
		planPage.appendChild(marker);
	}
	if (focusedLoc == BUDGET.planSections.length - 1) {
		return;
	}
	let marker = document.createElement('div');
	marker.classList.add('move-marker');
	marker.style.top = planTable.offsetTop + document.querySelector('#plan_page .spacer').offsetTop + 'px';
	marker.onclick = () =>
		moveSectionTo(Number(focusedLoc), Number(sectionBars[sectionBars.length - 1].dataset.budgetLocation) + 1);
	marker.innerHTML = '<div></div><div></div><div></div>';
	planPage.appendChild(marker);
}
function movePlanItem(item) {
	removeMoveMarkers();
	item.classList.add('move-focus');
	let itemLocation = item.dataset.budgetLocation.split('_');
	showItemMarkers(itemLocation);
}

function moveItemTo(focused, destination) {
	removeMoveMarkers();
	if (Number(focused[1]) < Number(destination[1])) {
		destination[1] = Number(destination[1]) - 1;
	}
	let section = BUDGET.planSections[Number(focused[0])];
	let focusedItem = section.planItems.splice(Number(focused[1]), 1)[0];
	let endItems = section.planItems.splice(Number(destination[1]));
	section.planItems.push(focusedItem);
	for (let i = 0; i < endItems.length; i++) {
		section.planItems.push(endItems[i]);
	}
	for (let i = 0; i < section.planItems.length; i++) {
		section.planItems[i].index = i;
	}
	BUDGET.render();
}

function showItemMarkers(focusedItemLoc) {
	let items = document.querySelectorAll('#plan_page [data-budget-location^="' + focusedItemLoc[0] + '_"]');
	let planPage = document.querySelector('#plan_page');
	let planTable = document.querySelector('#plan_table');
	for (let i = 0; i < items.length; i++) {
		if (i == Number(focusedItemLoc[1]) || i == Number(focusedItemLoc[1]) + 1) {
			continue;
		}
		let marker = document.createElement('div');
		marker.classList.add('move-marker');
		marker.style.top = planTable.offsetTop + items[i].offsetTop + 'px';
		marker.onclick = () => moveItemTo(focusedItemLoc, items[i].dataset.budgetLocation.split('_'));
		marker.innerHTML = '<div></div><div></div><div></div>';
		planPage.appendChild(marker);
	}
	if (focusedItemLoc[1] == BUDGET.planSections[focusedItemLoc[0]].planItems.length - 1) {
		return;
	}
	let marker = document.createElement('div');
	marker.classList.add('move-marker');
	marker.style.top =
		planTable.offsetTop + items[items.length - 1].offsetTop + items[items.length - 1].offsetHeight - 2 + 'px';
	let destination = items[items.length - 1].dataset.budgetLocation.split('_');
	destination[1] = Number(destination[1]) + 1;
	marker.onclick = () => moveItemTo(focusedItemLoc, destination);
	marker.innerHTML = '<div></div><div></div><div></div>';
	planPage.appendChild(marker);
}
function removeMoveMarkers() {
	let moveFocused = document.querySelectorAll('.move-focus');
	for (let i = 0; i < moveFocused.length; i++) {
		moveFocused[i].classList.remove('move-focus');
	}
	let markers = document.querySelectorAll('.move-marker');
	for (let i = 0; i < markers.length; i++) {
		markers[i].remove();
	}
}
window.addEventListener('click', (evt) => {
	if (!evt.target.classList.contains('move') && !evt.target.classList.contains('move-section-button')) {
		removeMoveMarkers();
	}
	if (
		!evt.target.classList.contains('option-button') &&
		!evt.target.parentElement.classList.contains('option-button')
	) {
		closeOptions(document.querySelector('#item_options'));
	}
	if (evt.target.id != 'new_expense_date') {
		hideNedDrop();
	}
	if (evt.target.id != 'load_button') {
		closeOptions(document.querySelector('#load_options'));
	}
});

function ordinalNumberify(num) {
	num = num.toString();
	if (num.charAt(num.length - 1) == '1' && num != '11') {
		return num.concat('<sup>st</sup>');
	} else if (num.charAt(num.length - 1) == '2' && num != '12') {
		return num.concat('<sup>nd</sup>');
	} else if (num.charAt(num.length - 1) == '3' && num != '13') {
		return num.concat('<sup>rd</sup>');
	} else {
		return num.concat('<sup>th</sup>');
	}
}
function lastWeek() {
	let tables = document.querySelectorAll('#expense_main .expense-table');
	let currentIndex = document.querySelector('#expense_main .expense-table.current-table').dataset.index;
	if (tables[0].classList.contains('current-table')) {
		return;
	}
	tables[currentIndex].classList.remove('current-table');
	for (let i = currentIndex - 1; i < tables.length; i++) {
		let amountLeft = (i - currentIndex + 1) * 100;
		tables[i].style.left = amountLeft + '%';
		if (amountLeft == 0) {
			tables[i].classList.add('current-table');
		}
	}
	let tableIndex = currentIndex - 2;
	for (let i = 0; i <= tableIndex; i++) {
		let amount = (i + 1) * -100;
		tables[tableIndex].style.left = amount + '%';
		tableIndex--;
	}
}
function nextWeek() {
	let tables = document.querySelectorAll('#expense_main .expense-table');
	let currentIndex = Number(document.querySelector('#expense_main .expense-table.current-table').dataset.index);
	if (tables[tables.length - 1].classList.contains('current-table')) {
		return;
	}
	tables[currentIndex].classList.remove('current-table');
	for (let i = currentIndex + 1; i < tables.length; i++) {
		let amountLeft = (i - currentIndex - 1) * 100;
		tables[i].style.left = amountLeft + '%';
		if (amountLeft == 0) {
			tables[i].classList.add('current-table');
		}
	}
	let tableIndex = currentIndex;

	for (let i = 0; i <= currentIndex; i++) {
		let amount = (i + 1) * -100;
		tables[tableIndex].style.left = amount + '%';
		tableIndex--;
	}
}

function updateDateOptions() {
	let dateOptions = document.querySelectorAll('#ned_drop div');
	let currentTable =
		BUDGET.expenseTables[Number(document.querySelector('#expenses_page .current-table').dataset.index)];
	let daysInMonth = getDaysInMonth(BUDGET.date.year, BUDGET.date.month + 1);
	for (let i = 0; i < dateOptions.length; i++) {
		let month = BUDGET.date.month;
		let day = i + currentTable.firstDay;
		if (day > daysInMonth) {
			month += 1;
			if (month > 12) {
				month = 1;
			}
			day = day - daysInMonth;
		}
		dateOptions[i].innerText = MONTH_ABBR.get(month.toString()) + ' ' + day.toString();
	}
}
function revealNedDrop() {
	document.querySelector('#expenses_page #ned_drop').style.display = 'flex';
}
function hideNedDrop() {
	document.querySelector('#expenses_page #ned_drop').style.display = 'none';
}
function setExpenseDate(button) {
	hideNedDrop();
	document.querySelector('#expenses_page #new_expense_date').innerText = button.innerText;
}
function showExpenseForm(sinking) {
	let expenseForm = document.querySelector('#new_expense_form');
	expenseForm.style.display = 'flex';
	let selectWrapper = document.querySelector('#new_expense_type');
	let select = selectWrapper.querySelector('.cs-option-wrapper');
	let oldOptions = select.querySelectorAll('div');
	for (let i = 0; i < oldOptions.length; i++) {
		oldOptions[i].remove();
	}
	selectWrapper.querySelector('.custom-select .cs-val').innerText = '';
	expenseForm.dataset.sinking = sinking;
	if (sinking) {
		expenseForm.querySelector('.form-name').innerHTML = 'New Expense<br>From Sinking Fund';
		expenseForm.querySelector('#net_label').innerText = 'Fund:';
		for (let i = 0; i < BUDGET.sinkingFunds.length; i++) {
			let option = document.createElement('div');
			option.classList.add('cs-option');
			option.setAttribute('onclick', 'selectValChanged(this)');
			option.innerText = BUDGET.sinkingFunds[i].name;
			select.appendChild(option);
		}
	} else {
		expenseForm.querySelector('.form-name').innerText = 'New Expense';
		expenseForm.querySelector('#net_label').innerText = 'Type:';
		for (let i = 0; i < BUDGET.planSections.length; i++) {
			let section = BUDGET.planSections[i];
			let optSection = document.createElement('div');
			optSection.innerText = section.name;
			optSection.classList.add('cs-option-section');
			select.appendChild(optSection);
			for (let j = 0; j < section.planItems.length; j++) {
				let option = document.createElement('div');
				option.classList.add('cs-option');
				option.setAttribute('onclick', 'selectValChanged(this)');
				option.innerText = section.planItems[j].name;
				select.appendChild(option);
			}
		}
		let optSection = document.createElement('div');
		optSection.innerText = 'Sinking Funds';
		optSection.classList.add('cs-option-section');
		select.appendChild(optSection);
		for (let i = 0; i < BUDGET.planFundSection.planItems.length; i++) {
			let option = document.createElement('div');
			option.innerText = BUDGET.planFundSection.planItems[i].name;
			option.classList.add('cs-option');
			option.setAttribute('onclick', 'selectValChanged(this)');
			select.appendChild(option);
		}
	}
	updateDateOptions();
}
function hideExpenseForm() {
	let expenseForm = document.querySelector('#new_expense_form');
	let resets = document.querySelectorAll('#new_expense_form input');
	resets.forEach((reset) => (reset.value = ''));
	document.querySelector('#new_expense_form #new_expense_date').innerText = '';
	document.querySelector('#new_expense_form #new_expense_type').value = '';
	expenseForm.style.display = 'none';
	hideNedDrop();
}

function submitNewExpense(expenseForm, pAmount, pDate, pLoc, pType, pTable) {
	let expenseAmount = pAmount || expenseForm.querySelector('#new_expense_amount').value;
	let expenseDate = pDate || expenseForm.querySelector('#new_expense_date').innerText;
	let expenseLocation = pLoc || expenseForm.querySelector('#new_expense_location').value;
	let expenseType = pType || expenseForm.querySelector('#new_expense_type .custom-select .cs-val').innerText;
	let currentTableEle = document.querySelector('#expenses_page .current-table');
	let expenseTable = pTable || BUDGET.expenseTables[currentTableEle.dataset.index];
	let oos = expenseForm.dataset.sinking.toString() == 'true' ? true : false;
	let fdate;
	let type = expenseType;

	if (expenseAmount == '' || expenseType == '') {
		return;
	}
	expenseAmount = round(expenseAmount);
	if (expenseDate == '') {
		expenseDate = '--';
		fdate = '--';
	} else {
		fdate = expenseDate.split(' ');
		fdate = `${Number(MONTH_ABBR_TO_I.get(fdate[0])) + 1}-${fdate[1]}-${BUDGET.date.year}`;
	}
	if (expenseLocation == '') {
		expenseLocation = '--';
	}

	if (oos) {
		type = 'Expense From: ' + type;
		for (let i = 0; i < BUDGET.sinkingFunds.length; i++) {
			if (BUDGET.sinkingFunds[i].name == expenseType) {
				BUDGET.sinkingFunds[i].addExpense(fdate, expenseAmount, expenseLocation);
				i = Infinity;
				BUDGET.renderSinkingFunds();
			}
		}
	} else {
		for (let i = 0; i < BUDGET.planFundSection.planItems.length; i++) {
			if (expenseType == BUDGET.planFundSection.planItems[i].name) {
				BUDGET.sinkingFunds[i].addIncome(fdate, expenseAmount, expenseLocation);
				i = Infinity;
				BUDGET.renderSinkingFunds();
			}
		}
	}

	let index = -1;
	for (let i = 0; i < expenseTable.expenseSections.length; i++) {
		if (type == expenseTable.expenseSections[i].name) {
			index = i;
			break;
		}
	}

	if (index == -1) {
		expenseTable.expenseSections.push(new ExpenseSection(false, type));
		index = expenseTable.expenseSections.length - 1;
	}

	expenseTable.expenseSections[index].expenseItems.push(
		new ExpenseItem({
			fullDate: fdate,
			date: expenseDate,
			amount: expenseAmount,
			location: expenseLocation,
			type: type,
			index: 0,
			sectionIndex: index,
		})
	);
	for (let i = 0; i < expenseTable.expenseSections[index].expenseItems.length; i++) {
		expenseTable.expenseSections[index].expenseItems[i].index = i;
	}
	expenseTable.expenseSections[index].updateTypeTotal();
	expenseTable.renderSections(currentTableEle);
}

function deleteExpense(row) {
	let currentTableEle = document.querySelector('#expenses_page .current-table');
	let expenseTable = BUDGET.expenseTables[Number(currentTableEle.dataset.index)];
	let sectionIndex = Number(row.dataset.sectionIndex);
	let section = expenseTable.expenseSections[sectionIndex];
	section.expenseItems.splice(Number(row.dataset.index), 1);
	if (section.expenseItems.length == 0) {
		expenseTable.expenseSections.splice(sectionIndex, 1);
	} else {
		section.updateTypeTotal();
		for (let i = 0; i < section.expenseItems.length; i++) {
			section.expenseItems[i].index = i;
		}
	}
	expenseTable.renderSections(currentTableEle);
}

function revealFundForm() {
	let form = document.querySelector('#new_fund_form');
	form.style.display = 'flex';
}
function hideFundForm() {
	let form = document.querySelector('#new_fund_form');
	form.style.display = 'none';
}

function submitNewFund(form) {
	let name = form.querySelector('#new_fund_name').value;
	let startingBalance = form.querySelector('#new_fund_amount').value || 0;
	let targetBalance = form.querySelector('#new_fund_target_balance').value || 0;
	let fund = new SinkingFund({ name: name }, BUDGET.sinkingFunds.length);
	if (targetBalance && targetBalance > 0) {
		fund.targetBalance = targetBalance;
	}
	if (startingBalance && startingBalance > 0) {
		startingBalance = round(startingBalance);
		let d = new Date();
		let date = `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
			.getDate()
			.toString()
			.padStart(2, '0')}-${d.getFullYear()}`;
		fund.addIncome(date, startingBalance, 'Starting Balance');
	}
	BUDGET.planFundSection.planItems.push(new PlanItem({ name: name }, BUDGET.planFundSection.planItems.length, true));
	BUDGET.renderFundSection();
	BUDGET.sinkingFunds.push(fund);
	fund.render();
}

function showManualForm(type, index) {
	let fundEle = document.querySelectorAll('#sinking_main .sinking-fund')[index];
	let form = fundEle.querySelector('.sinking-manual-form');
	let d = new Date();
	let date = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
		.getDate()
		.toString()
		.padStart(2, '0')}`;
	form.querySelector('.sinking-manual-date').value = date;
	form.style.display = 'flex';
	form.dataset.index = index;
	form.dataset.type = type;
	if (type == 'income') {
		form.querySelector('.form-name').innerText = 'Add Money';
	} else if (type == 'expense') {
		form.querySelector('.form-name').innerText = 'Remove Money';
	}
}

function showTBForm(index) {
	let fundEle = document.querySelectorAll('#sinking_main .sinking-fund')[index];
	let form = fundEle.querySelector('.change-tb-form');
	form.dataset.index = index;
	form.style.display = 'flex';
}

function submitTBAmount(formEle) {
	let i = formEle.dataset.index;
	let amount = formEle.querySelector('.sinking-tb-amount').value;
	BUDGET.sinkingFunds[i].targetBalance = amount;
	BUDGET.renderSinkingFunds();
}

function submitManualAmount(form) {
	let amount = Number(form.querySelector('.sinking-manual-amount').value);
	amount = round(amount);
	let date = form.querySelector('.sinking-manual-date').value.split('-');
	let loc = form.querySelector('.sinking-manual-location').value;
	if (loc.length < 1) {
		loc == '--';
	}
	if (date.length < 3) {
		date == '--';
	} else {
		date = `${date[1]}-${date[2]}-${date[0]}`;
	}
	let index = Number(form.dataset.index);
	let type = form.dataset.type;
	if (type == 'income') {
		BUDGET.sinkingFunds[index].addIncome(date, amount, loc);
	} else if (type == 'expense') {
		BUDGET.sinkingFunds[index].addExpense(date, amount, loc);
	}
	BUDGET.renderSinkingFunds();
}

function hideTBForm(form) {
	form.style.display = 'none';
}
function hideManualForm(form) {
	form.style.display = 'none';
}

function fundNameChanged(input, index) {
	BUDGET.sinkingFunds[index].name = input.value;
	BUDGET.planFundSection.planItems[index].name = input.value;
	BUDGET.renderFundSection();
}

function deleteSinkingFund(i) {
	BUDGET.sinkingFunds.splice(i, 1);
	BUDGET.planFundSection.planItems.splice(i, 1);
	for (let i = 0; i < BUDGET.sinkingFunds.length; i++) {
		BUDGET.sinkingFunds[i].index = i;
		BUDGET.planFundSection.planItems[i].index = i;
	}
	BUDGET.updateTotals();
	BUDGET.renderSinkingFunds();
	BUDGET.renderFundSection();
}

function toggleTheme(themeButton) {
	let b = document.body;
	let currentTheme = b.classList[0];
	b.classList.remove(currentTheme);
	if (currentTheme == 'dark-theme') {
		b.classList.add('light-theme');
		themeButton.innerText = 'Dark';
		BUDGET.theme = 'light-theme';
	} else if (currentTheme == 'light-theme') {
		b.classList.add('dark-theme');
		themeButton.innerText = 'Light';
		BUDGET.theme = 'dark-theme';
	}
}

function changeAccentColor(color) {
	document.body.style.setProperty('--accent', color);
	BUDGET.accent = color;
}

function showSelect(selectButton) {
	let id = selectButton.dataset.selectid;
	let wrapper = document.querySelector('.cs-option-wrapper[data-selectid="' + id + '"]');
	if (!wrapper || wrapper.querySelectorAll('.cs-option').length == 0) {
		return;
	}
	if (wrapper.classList.contains('visible')) {
		hideSelect(selectButton, wrapper);
	} else {
		wrapper.classList.add('visible');
		selectButton.querySelector('.cs-arrow').style.rotate = '180deg';
		window.addEventListener('click', hsmiddleman);
		function hsmiddleman(evt) {
			if (evt.target != selectButton && evt.target.parentElement != selectButton) {
				hideSelect(selectButton, wrapper);
				window.removeEventListener('click', hsmiddleman);
			}
		}
	}
}
function hideSelect(selectButton, wrapper) {
	wrapper.classList.remove('visible');
	selectButton.querySelector('.cs-arrow').style.rotate = '0deg';
}
function selectValChanged(option) {
	let wrapper = option.parentElement;
	let id = wrapper.dataset.selectid;
	let selectButton = document.querySelector('.custom-select[data-selectid="' + id + '"]');
	selectButton.querySelector('.cs-val').innerText = option.innerText;
}
