class PlanItem{
    constructor(index){
        this.name = '';
        this.budgetAmount = 0;
        this.weeklyTotals = [0,0,0,0,0];
        this.leftTo = 0;
        this.actualSpent = 0;
        this.index = index || 0;
    }
    render(sectIndex){
        let item = document.createElement('tr');
        item.classList.add('plan-item');
        item.dataset.budgetLocation = sectIndex + '_' + this.index;
        item.innerHTML =                 
        '<td><button class="delete-plan-item" onclick="deletePlanItem(this.parentElement.parentElement)"><img src="trash-can.png"></button></td>' +
        '<td><input type="text" class="input-name" placeholder="Item Name" value="' + this.name + '" onchange="itemNameChanged(this.parentElement.parentElement, this.value)"></td>' +
        '<td><input type="number" class="budget-amount" value="' + this.budgetAmount +'" onchange="updateBudgetAmount(this.parentElement.parentElement, this.value)"></td>' +
        '<td></td>' +
        '<td><input type="number" class="weekly-expense one" value="' + this.weeklyTotals[0] + '" onchange="updateWeeklyTotal(0, this.value, this.parentElement.parentElement)"></td>' +
        '<td><input type="number" class="weekly-expense two" value="' + this.weeklyTotals[1] + '" onchange="updateWeeklyTotal(1, this.value, this.parentElement.parentElement)"></td>' +
        '<td><input type="number" class="weekly-expense three" value="' + this.weeklyTotals[2] + '" onchange="updateWeeklyTotal(2, this.value, this.parentElement.parentElement)"></td>' +
        '<td><input type="number" class="weekly-expense four" value="' + this.weeklyTotals[3] + '" onchange="updateWeeklyTotal(3, this.value, this.parentElement.parentElement)"></td>' +
        '<td><input type="number" class="weekly-expense five" value="' + this.weeklyTotals[4] + '" onchange="updateWeeklyTotal(4, this.value, this.parentElement.parentElement)"></td>' +
        '<td class="left-to">' + this.leftTo + '</td>' +
        '<td class="actual-spent">' + this.actualSpent + '</td>';
        item.querySelector('.budget-amount').addEventListener(onchange, (evt) => console.log(evt.target.value))
        return item;
    }

    updateLTAS(row){
        let leftToEle = row.querySelector('.left-to')
        let actualSpentEle = row.querySelector('.actual-spent')
        let totalSpent = 0;
        for(let i = 0; i < this.weeklyTotals.length; i++){
            totalSpent += this.weeklyTotals[i];
        }
        this.actualSpent = totalSpent;
        actualSpentEle.innerText = this.actualSpent;
        this.leftTo = this.budgetAmount - totalSpent;
        leftToEle.innerText = this.leftTo;
        BUDGET.updateTotals()
    }
}
function updateBudgetAmount(row, value){
    let location = row.dataset.budgetLocation.split('_');
    let item = BUDGET.planSections[location[0]].planItems[location[1]];
    item.budgetAmount = Number(value);
    item.updateLTAS(row);
}
function updateWeeklyTotal(index, value, row){
    let location = row.dataset.budgetLocation.split('_');
    let item = BUDGET.planSections[location[0]].planItems[location[1]];
    item.weeklyTotals[index] = Number(value);
    item.updateLTAS(row);
}