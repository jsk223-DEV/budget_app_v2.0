let BUDGET;
window.addEventListener('load', () => {
    if(!localStorage.getItem('BUDGET_SAVES') || JSON.parse(localStorage.getItem('BUDGET_SAVES')).length == 0){
        BUDGET = new Budget()
        localStorage.setItem('BUDGET_SAVES', JSON.stringify([BUDGET]))
    }else{
        BUDGET = JSON.parse(localStorage.getItem('BUDGET_SAVES'))[0]
    }
})
window.addEventListener('beforeunload', () => {
    let saves = JSON.parse(localStorage.getItem('BUDGET_SAVES'));
    saves[0] = BUDGET;
    for(let i = 0; i < saves.length; i++){
        saves[i].index = i;
    }
    localStorage.setItem('BUDGET_SAVES', JSON.stringify(saves))
})
function moveToPage(navButton, pageLocations){
    let pages = document.querySelectorAll('.page');
    let navButtons = document.querySelectorAll('#nav button')
    for(let i = 0; i < pages.length; i++){
        navButtons[i].classList.remove('active');
        pages[i].style.left = pageLocations[i] + 'vw';
    }
    navButton.classList.add('active')
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

function addPlanSection(){
    let focusedSection = document.querySelector('#plan_page .focus');
    let fSBudgetLocation = Number(focusedSection.dataset.budgetLocation);
    let endSections = BUDGET.planSections.splice(fSBudgetLocation + 1);
    BUDGET.planSections.push(new PlanSection(fSBudgetLocation + 1));
    for(let i = 0; i < endSections.length; i++){
        endSections[i].index = fSBudgetLocation + 2 + i;
        BUDGET.planSections.push(endSections[i])

    }
    console.log(BUDGET)
    document.querySelector('.focus').classList.remove('focus')
    BUDGET.render()
}

function deletePlanSection(){
    let focusedSection = document.querySelector('#plan_page .focus');
    let fSBudgetLocation = Number(focusedSection.dataset.budgetLocation);
    BUDGET.planSections.splice(fSBudgetLocation, 1);
    for(let i = fSBudgetLocation; i < BUDGET.planSections.length; i++){
        BUDGET.planSections[i].index = i;
    }
    console.log(BUDGET)
    document.querySelector('.focus').classList.remove('focus')
    BUDGET.render()
}

function addPlanItem(){
    let focusedSection = document.querySelector('#plan_page .focus');
    let fSBudgetLocation = Number(focusedSection.dataset.budgetLocation);
    BUDGET.planSections[fSBudgetLocation].planItems.unshift(new PlanItem(0))
    for(let i = 0; i < BUDGET.planSections[fSBudgetLocation].planItems.length; i++){
        BUDGET.planSections[fSBudgetLocation].planItems[i].index = i;
    }
    console.log(BUDGET)
    document.querySelector('.focus').classList.remove('focus')
    BUDGET.render()
}

function deletePlanItem(item){
    let itemLocation = item.dataset.budgetLocation.split('_');
    BUDGET.planSections[itemLocation[0]].planItems.splice(itemLocation[1], 1)
    for(let i = itemLocation[1]; i < BUDGET.planSections[itemLocation[0]].planItems.length; i++){
        BUDGET.planSections[itemLocation[0]].planItems[i].index = i;
    }
    console.log(BUDGET)
    BUDGET.render()
}

function sectionNameChanged(row, value){
    let location = Number(row.dataset.budgetLocation);
    BUDGET.planSections[location].name = value;
    BUDGET.render()
}
function itemNameChanged(row, value){
    let location = row.dataset.budgetLocation.split('_');
    BUDGET.planSections[location[0]].planItems[location[1]].name = value;
    BUDGET.render()
}