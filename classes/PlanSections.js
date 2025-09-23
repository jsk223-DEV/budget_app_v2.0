class PlanSection{
    constructor(index){
        this.name = '';
        this.planItems = [];
        this.index = index;
    }
    render(totalBar){
        let sectionBar = document.createElement('tr');
        sectionBar.classList.add('section-bar');
        sectionBar.dataset.budgetLocation = this.index;
        sectionBar.innerHTML = 
        '<td><div class="option-button" onclick="revealOptions(this.parentElement)"><div></div><div></div><div></div></div></td>' +
        '<td><input type="text" class="input-name" placeholder="Section Name" value="' + this.name + '" onchange="sectionNameChanged(this.parentElement.parentElement, this.value)"></td>' +
        '<td colspan="9"></td>';
        totalBar.before(sectionBar)
        for(let i = 0; i < this.planItems.length; i++){
            sectionBar.after(this.planItems[i].render(this.index))
        }
    }
}