let BUDGET;
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
function saveBudget() {
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
	BUDGET.render();
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
	BUDGET.render();
}

function addPlanItem() {
	let focusedSection = document.querySelector('#plan_page .focus');
	let fSBudgetLocation = Number(focusedSection.dataset.budgetLocation);
	BUDGET.planSections[fSBudgetLocation].planItems.unshift(new PlanItem(false, 0));
	for (let i = 0; i < BUDGET.planSections[fSBudgetLocation].planItems.length; i++) {
		BUDGET.planSections[fSBudgetLocation].planItems[i].index = i;
	}
	document.querySelector('.focus').classList.remove('focus');
	BUDGET.render();
}

function deletePlanItem(item) {
	let itemLocation = item.dataset.budgetLocation.split('_');
	BUDGET.planSections[itemLocation[0]].planItems.splice(itemLocation[1], 1);
	for (let i = itemLocation[1]; i < BUDGET.planSections[itemLocation[0]].planItems.length; i++) {
		BUDGET.planSections[itemLocation[0]].planItems[i].index = i;
	}
	BUDGET.updateTotals();
	BUDGET.render();
}

function sectionNameChanged(row, value) {
	let location = Number(row.dataset.budgetLocation);
	BUDGET.planSections[location].name = value;
	BUDGET.render();
}
function itemNameChanged(row, value) {
	let location = row.dataset.budgetLocation.split('_');
	BUDGET.planSections[location[0]].planItems[location[1]].name = value;
	BUDGET.render();
}

function getDaysInMonth(year, month) {
	return new Date(year, month, 0).getDate();
}

function autoSetPayDaysToPrefered() {
	let payDayEles = document.querySelectorAll('#plan_page .pay-day');
	let month = BUDGET.date.month + 1;
	let year = BUDGET.date.year;
	let payDayOne;
	BUDGET.payDays.length = 0;
	let daysInMonth = getDaysInMonth(year, month);
	for (let i = 1; i < 8; i++) {
		if (new Date(month + ' ' + i + ' ' + year).getDay() == BUDGET.payDayPreference) {
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
	// for (let i = 0; i < BUDGET.expenseTables.length; i++) {
	// 	if (i < BUDGET.payDays.length) {
	// 		BUDGET.expenseTables[i].firstDay = BUDGET.payDays[i];
	// 		BUDGET.expenseTables[i].setName();
	// 	}
	// }
}

function setPayDayPreference(select) {
	BUDGET.payDayPreference = select.value;
	autoSetPayDaysToPrefered();
	BUDGET.setUpExpenseTables(true);
	BUDGET.renderExpenseTables();
}

function nextMonth() {
	saveBudget();
	let saves = JSON.parse(localStorage.getItem('BUDGET_SAVES'));
	BUDGET = saves[saves.length - 1];
	let newBudget = new Budget(BUDGET, BUDGET.index + 1);
	// newBudget.planSections = BUDGET.planSections;
	// newBudget.payDayPreference = BUDGET.payDayPreference;
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
	BUDGET = saves[saves.length - 1];
	let newBudget = new Budget(BUDGET, BUDGET.index + 1);
	newBudget.date = { month: thisDate.getMonth().toString().padStart(2, '0'), year: thisDate.getFullYear() };
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

function load(object) {
	saveBudget();
	BUDGET = new Budget(object);
	BUDGET.render();
	BUDGET.updateTotals();
	BUDGET.updateName();
	autoSetPayDaysToPrefered();
	document.querySelector('#plan_page #pay_day_drop').value = BUDGET.payDayPreference;
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
	let sectionBars = document.querySelectorAll('#plan_page .section-bar');
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
	marker.style.top = planTable.offsetTop + document.querySelector('#plan_page #total_bar').offsetTop - 2 + 'px';
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
	if (!evt.target.classList.contains('option-button')) {
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
function showExpenseForm() {
	let expenseForm = document.querySelector('#new_expense_form');
	expenseForm.style.display = 'flex';
	let select = document.querySelector('#new_expense_type');
	let oldOptions = select.querySelectorAll('option');
	for (let i = 0; i < oldOptions.length; i++) {
		oldOptions[i].remove();
	}
	for (let i = 0; i < BUDGET.planSections.length; i++) {
		let section = BUDGET.planSections[i];
		for (let j = 0; j < section.planItems.length; j++) {
			let option = document.createElement('option');
			option.innerText = section.planItems[j].name;
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
	let expenseType = pType || expenseForm.querySelector('#new_expense_type').value;
	let currentTableEle = document.querySelector('#expenses_page .current-table');
	let expenseTable = pTable || BUDGET.expenseTables[currentTableEle.dataset.index];

	if (expenseAmount == '' || expenseDate == '' || expenseLocation == '' || expenseType == '') {
		return;
	}

	let index = -1;
	for (let i = 0; i < expenseTable.expenseSections.length; i++) {
		if (expenseType == expenseTable.expenseSections[i].name) {
			index = i;
			break;
		}
	}

	if (index == -1) {
		expenseTable.expenseSections.push(new ExpenseSection(false, expenseType));
		index = expenseTable.expenseSections.length - 1;
	}

	expenseTable.expenseSections[index].expenseItems.push(
		new ExpenseItem({
			date: expenseDate,
			amount: expenseAmount,
			location: expenseLocation,
			type: expenseType,
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
