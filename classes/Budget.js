class Budget{
    constructor(){
        this.name = '';
        this.autoSave = true;
        this.payDay = 2;
        this.payDays = [0, 0, 0, 0, 0];
        this.weeklyIncomes = [0, 0, 0, 0, 0];
        this.weeklyExpenseTotals = [0, 0, 0, 0, 0];
        this.totalIncome = 0;
        this.totalBudgeted = 0;
        this.totalLeftTo = 0;
        this.totalActualSpent = 0;
        this.planSections = [new PlanSection(0)];
        this.expenseItems = [];
        this.totalBar = {
            bar: document.querySelector('#plan_page #total_bar'),
            totalBudgeted: document.querySelector('#plan_page #total_budgeted'),
            weeklyExpenseTotals: document.querySelectorAll('#plan_page #total_bar .weekly-expense-total'),
            totalLeftTo: document.querySelector('#plan_page #total_bar #total_left_to'),
            totalActualSpent: document.querySelector('#plan_page #total_bar #total_actual_spent'),
            totalIncome: document.querySelector('#plan_table #total_income'),
            shouldBeZero: document.querySelector('#plan_table #should_be_zero')
        };
        this.index = 0;
    }

    render(){
        let oldItems = document.querySelectorAll('#plan_page .section-bar, #plan_page .plan-item');
        for(let i = 0; i < oldItems.length; i++){
            oldItems[i].remove();
        }

        for(let i = 0; i < this.planSections.length; i++){
            this.planSections[i].render(this.totalBar.bar)
        }
    }

    updateTotals(){
        this.totalIncome = 0;
        this.totalBudgeted = 0;
        this.totalLeftTo = 0;
        this.totalActualSpent = 0;
        for(let i = 0; i < this.weeklyExpenseTotals.length; i++){
            this.weeklyExpenseTotals[i] = 0;
        }
        for(let i = 0; i < this.planSections.length; i++){
            let pSection = this.planSections[i]
            for(let j = 0; j < pSection.planItems.length; j++){
                let pItem = pSection.planItems[j];
                this.totalBudgeted += pItem.budgetAmount;
                this.totalLeftTo += pItem.leftTo;
                this.totalActualSpent += pItem.actualSpent;
                for(let w = 0; w < this.weeklyExpenseTotals.length; w++){
                    this.weeklyExpenseTotals[w] += pItem.weeklyTotals[w];
                }
            }
        }
        for(let i = 0; i < this.weeklyIncomes.length; i++){
            this.totalIncome += this.weeklyIncomes[i]
        }
        this.totalBar.totalBudgeted.innerText = this.totalBudgeted;
        for(let i = 0; i < this.weeklyExpenseTotals.length; i++){
            this.totalBar.weeklyExpenseTotals[i].innerText = this.weeklyExpenseTotals[i];
        }
        this.totalBar.totalLeftTo.innerText = this.totalLeftTo;
        this.totalBar.totalActualSpent.innerText = this.totalActualSpent;
        this.totalBar.totalIncome.innerText = this.totalIncome;
        this.totalBar.shouldBeZero.innerText = this.totalIncome - this.totalBudgeted;
    }
    updateIncome(index, value){
        this.weeklyIncomes[index] = Number(value);
        this.updateTotals()
    }
}