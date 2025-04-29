import MekaPonent from "../MekaPonent.js";

class MekaOptionFilters extends MekaPonent {
    constructor() {
        super();
    }

    render() {
        const template = /* html */ `
        <div class="formGroup">
             <label for="savedFilters">Favorite Filters</label>
             <input list="filters" id="savedFilters" placeholder="Pick Filter or leave blank" class="userInput">
             <datalist id="filters">
               <option value="">- - -</option>
               ${this.getAttribute('value')?.length && this.getAttribute('value').map(filter => /* html */
               `<option value="${filter.id}">${filter.name}</option>`).join('')}
             </datalist>
        </div>`;
        this.super.query('section').innerHTML = template;
        this.super.query('input').addEventListener('input', (event) => {
            console.warn('input event fired');
            const filter = me.savedFilters.find((element) => {
                return element.id === event.target.value; // coming from text field on both sides
            });
            if (filter) {
                // todo: figure out how to communicate with other component from here
                popupQuery.value = filter.jql;
            } else {
                popupQuery.value = '';
            }
        });
    } 

    async connectedCallback() {
        this.render();
    }
}

export default MekaOptionFilters;