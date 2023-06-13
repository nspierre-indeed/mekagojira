import MekaPonent from '../MekaPonent.js';
import Utils from '../../utils.js';
import PixelVariant from './PixelVariant.js';
import VisualizerVariant from './VisualizerVariant.js';

const variantsMap = new Map([['pixel',PixelVariant]]);

class MekaVisualizer extends MekaPonent {
    constructor() {
        super();
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'mainWrapper';
        this.shadowRoot.appendChild(this.wrapper);
        this.boardId = Utils.params().id;
        this.boardName = Utils.params().name;
        this.variant = "standard";
        this.variantClass = VisualizerVariant;
        this.render().catch((error) => {
            console.error('Error rendering: ', error);
        });
    }
    async getStoryPointField() {
        const path = await this.getSetting('jiraPath');
        const fieldRequest = await fetch(`${path}/rest/api/2/field`);
        const fieldData = JSON.parse(await fieldRequest.text());
        const storyPointField = fieldData.find((field) => {
            return field.name === 'Story Points';
        });
        return storyPointField.id;
    }
    async getBoardColumns() {
        const path = await this.getSetting('jiraPath');
        const configRequest = await fetch(`${path}/rest/agile/1.0/board/${this.boardId}/configuration`);
        const configData = JSON.parse(await configRequest.text());
        return configData.columnConfig.columns;
    }
    async render() {
        const [storyField, columns] = await Promise.all([this.getStoryPointField(), this.getBoardColumns()]);
        this.storyField = storyField;
        this.columns = columns;
        this.template = /* html */ `
            ${this.variantClass.getStyles()}
            <h1>${this.boardName}</h1>
            <nav>
                <meka-visualizer-sprints sprint="${this.sprint}"></meka-visualizer-sprints>
                <meka-visualizer-variants variant="${this.variant}"></meka-visualizer-variants>
            </nav>
            <meka-loader variant="${this.variant}"></meka-loader>
            <section class="columns">
              ${this.variantClass.renderSprintDetails(this.sprintData, this.path, this.storyField)}
            </section>
        `;
        this.wrapper.innerHTML = this.template;
        await this.bindUpdates();
    }
    async bindUpdates() {
        this.query('meka-visualizer-variants').addEventListener('updateVariant', async (event) => {
            this.variant = event.target.getAttribute('variant');
            this.variantClass = variantsMap.get(this.variant) || VisualizerVariant;
            this.variantClass.unLoad();
            this.variantClass.onLoad(this.shadowRoot);
            if (this.sprint) {
                await this.reload();
            }
        });
        this.query('meka-visualizer-sprints').addEventListener('updateSprint', async (event) => {
            const targetSprint = event.target.getAttribute('sprint');
            if (!targetSprint) {
                return false;
            }
            this.sprint = targetSprint;
            await this.reload();
        });
    }
    async reload() {
        this.query('meka-loader').done = false;
        const sprintData = await this.getSprintData();
        this.sprintData = this.sortSprintData(sprintData.issues);
        await this.render();
        this.query('meka-loader').done = true;
    }
    sortSprintData(issues) {
        const statusesToColumnNames = new Map();
        const colsToIssues = {};
        this.columns.forEach((column) => {
            column.statuses.forEach((status) => {
                statusesToColumnNames.set(status.id, column.name);
                colsToIssues[column.name] = [];
            });
        });
        issues.forEach((issue) => {
            const status = issue.fields.status.id;
            const columnName = statusesToColumnNames.get(status);
            colsToIssues[columnName].push(issue);
        });
        return colsToIssues;
    }
    async getSprintData() {
        const path = await this.getSetting('jiraPath');
        this.path = path;
        const sprintData = await fetch(`${path}/rest/agile/1.0/sprint/${this.sprint}/issue`);
        return JSON.parse(await sprintData.text());
    }


}

export default MekaVisualizer;