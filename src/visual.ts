
"use strict";
import "@babel/polyfill";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
//import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import { VisualSettings } from "./settings";
import VisualObjectInstancesToPersist = powerbi.VisualObjectInstancesToPersist;
// import { ValueUtil } from "powerbi-visuals-utils-typeutils/lib/numericSequence/numericSequenceRange";
// import { dataViewTransform } from "powerbi-visuals-utils-dataviewutils";
// import { valueFormatter } from "powerbi-visuals-utils-formattingutils/lib/src/valueFormatter";
// import * as FormatUtils from "./FormattingUtil"
import { CalculationEngine } from './visuals/CalculationEngine';
//import * as Utils from "./utils"
import { EditModeVisual } from "./visuals/EditModeVisual"

//function visualTransform(options: VisualUpdateOptions, host: IVisualHost, thisRef: Visual): VisualViewModel {            
function visualTransform(options: VisualUpdateOptions): any {
    let dataViews = options.dataViews;
    var a = options.dataViews[0].metadata.columns[1];

    let tblView = dataViews[0].table;

    var tblData = [];

    for (var i = 0; i < dataViews[0].table.rows.length; i++) {
        var r = dataViews[0].table.rows[i];
        var colData = [];
        for (var t = 0; t < r.length; t++) {
            var rawValue = r[t];
            var formatString = dataViews[0].table.columns[t].format;
            var columnName = dataViews[0].table.columns[t].displayName;
            var isColumnNumeric = dataViews[0].table.columns[t].type.numeric;
            colData.push({ rawValue: rawValue, formatString: formatString, displayName: columnName, refName: "[" + columnName + "]", isNumeric: isColumnNumeric });
        }
        var rowLabel = dataViews[0].table.rows[i][0];
        if (!rowLabel) {
            rowLabel = "_NULL"
        }
        var row = {
            title: rowLabel,
            name: "[" + rowLabel + "]",
            values: colData,
        };
        tblData.push(row);
    }
    //TODO: remove
    
    return tblData;
}

function visualTransform2(options: VisualUpdateOptions, tableDefinition : any): any {
    let dataViews = options.dataViews;
    var a = options.dataViews[0].metadata.columns[1];

    let tblView = dataViews[0].table;

    var tblData = {};

    for (var i = 0; i < dataViews[0].table.rows.length; i++) {
        var r = dataViews[0].table.rows[i];
        var colData = {};
        for (var t = 0; t < r.length; t++) {
            var rawValue = r[t];
            var formatString = dataViews[0].table.columns[t].format;
            var columnName = dataViews[0].table.columns[t].displayName;
            var isColumnNumeric = dataViews[0].table.columns[t].type.numeric;
            colData[columnName]={ rawValue: rawValue, formatString: formatString, displayName: columnName, refName: "[" + columnName + "]", isNumeric: isColumnNumeric };
        }
        var rowLabel = dataViews[0].table.rows[i][0];
        if (!rowLabel) {
            rowLabel = "_NULL"
        }
        var row = {
            title: rowLabel,
            name: "[" + rowLabel + "]",
            values: colData,
        };
        tblData[rowLabel.toString()]=row;
    }
    //TODO: remove
    console.log(tableDefinition);
    console.log(tblData);
    return tblData;
}

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private textNode: Text;
    private tableDefinition: any;
    private model: any;
    private host: IVisualHost;
    private editModeJsonEditor: HTMLTextAreaElement;
    private sampleJson: string;
    private displayAllRows: boolean = true;
    private internalVersionNo: string = "2.0.0";
    private CalculationEngine: CalculationEngine;
    private editModeVisual: EditModeVisual;
    private visualSettings: VisualSettings;
    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.target = options.element;
        this.sampleJson = null;
        this.editModeVisual = new EditModeVisual(this);
    }

    public update(options: VisualUpdateOptions) {
        var w = options.viewport.width;
        var h = options.viewport.height;
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        
        this.model = visualTransform(options);
        console.log(this.model);
        this.tableDefinition = null;
        var errorMsg = "";
        if (this.settings.dataPoint.tableConfiguration.trim().length > 0) {
            try {
                this.tableDefinition = JSON.parse(this.settings.dataPoint.tableConfiguration);
            }
            catch (e) {
                errorMsg = "Error parsing table definition. Enter edit mode and correct the error.";
            }
        }
        visualTransform2(options, this.tableDefinition);
        if (options.editMode === 1) {
            this.editModeVisual.ClearAllContent(this.target);
            this.editModeVisual.RenderEditMode(this.target, this.settings);
        } else {
            if (errorMsg.length === 0) {
                this.editModeVisual.ClearAllContent(this.target);
                this.editModeVisual.RenderAllContent(this.target, this.tableDefinition);
            } else {
                this.target.innerHTML = "<div>" + errorMsg + "</div>"
            }
        }
        this.target.style.overflow = "auto";

        this.editModeVisual.RenderVersionNo(this.target);
    }

    public getViewModel(): any {
        return this.model;
    }

    public getHost(): IVisualHost {
        return this.host
    }

    public getSettings(): VisualSettings {
        return this.settings;
    }
    public saveConfig() {
        let general: VisualObjectInstance[] = [{
            objectName: "dataPoint",
            displayName: "Data colors",
            selector: null,
            properties: {
                tableConfiguration: this.settings.dataPoint.tableConfiguration
            }
        }];
        let propertToChange: VisualObjectInstancesToPersist = {
            replace: general
        }
        this.host.persistProperties(propertToChange);
    }

    


    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: VisualSettings = this.visualSettings ||
       VisualSettings.getDefault() as VisualSettings;
        return VisualSettings.enumerateObjectInstances(settings, options);
       }

}

