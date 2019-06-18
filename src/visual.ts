
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
import * as Utils from "./visuals/utils"
import { EditModeVisual } from "./visuals/EditModeVisual"
import { TableConfig, RowType, ColumnType } from './visuals/TableConfig';
import { forEach } from 'lodash'
import { EvalFormula } from './visuals/utils';
import { valueFormatter } from "powerbi-visuals-utils-formattingutils/lib/src/valueFormatter";
//function visualTransform(options: VisualUpdateOptions, host: IVisualHost, thisRef: Visual): VisualViewModel {            
function visualTransform(options: VisualUpdateOptions): any {
    let dataViews = options.dataViews;

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
            rowLabel = "NULL"
        }
        var row = {
            title: rowLabel,
            name: "[" + rowLabel + "]",
            values: colData,
        };
        tblData.push(row);
    }
    //TODO: remove
    //console.log(tblData);
    return tblData;
}

function visualTransform2(options: VisualUpdateOptions, tableDefinition: TableConfig): any {
    var t0 = performance.now();
    let dataViews = options.dataViews;

    var tblData = {};

    for (var i = 0; i < dataViews[0].table.rows.length; i++) {
        var r = dataViews[0].table.rows[i];
        var colData = {};
        for (var t = 0; t < r.length; t++) {
            var rawValue = r[t];
            var formatString = dataViews[0].table.columns[t].format;
            var columnName = dataViews[0].table.columns[t].displayName;
            var isColumnNumeric = dataViews[0].table.columns[t].type.numeric;
            var col = {
                rawValue: rawValue,
                formatString: formatString,
                displayName: columnName,
                refName: "[" + columnName + "]",
                isNumeric: isColumnNumeric
            };
            colData[columnName] = col;
        }
        var rowLabel: string = dataViews[0].table.rows[i][0] as string;
        if (!rowLabel) {
            rowLabel = "NULL"
        }
        var row = {
            title: rowLabel,
            name: "[" + rowLabel + "]",
            values: colData,
        };
        tblData[rowLabel] = row;
    }
    try {

        for (let index = 0; index < tableDefinition.rows.length; index++) {
            const row = tableDefinition.rows[index];
            var rowRef = tblData[row.title];
            if (rowRef) {
                rowRef["config"] = row;
            } else {
                rowRef = {
                    config: row,
                    title: row.title,
                    name: "[" + row.title + "]",
                    values: {}
                };
                tblData[row.title] = rowRef;
            }
            //Utils.evalInContext('console.log(this["Doroga"])', tblData);
            for (let index = 0; index < tableDefinition.columns.length; index++) {
                const col = tableDefinition.columns[index];
                if (row.type === RowType.Calculation && col.type === ColumnType.Data) {
                    var formulaCal = row.formula;                   
                    forEach(row.formula.match(/\[[^[]*\]/g), function (f) {
                        var keyR = f.substring(1, f.length - 1);
                        if (tblData[keyR] && tblData[keyR].values[col.title]) {
                            formulaCal = formulaCal.replace(f, tblData[keyR].values[col.title].rawValue)
                        } else {
                            formulaCal = ""
                        }
                    });
                    //console.log(col.title + "-" + formulaCal)
                    formulaCal = Utils.EvalFormula(formulaCal);
                    //formulaCal = valueFormatter.format(formulaCal,col.format)
                    rowRef.values[col.title] = {
                        "config": col,
                        "rawValue": formulaCal,
                        "formattedValue" : valueFormatter.format(formulaCal,col.format)
                    };
                } else if (col.type === ColumnType.Calculation) {
                    var formulaRow = col.calculationFormula
                    forEach(col.calculationFormula.match(/\[[^[]*\]/g), function (f) {
                        var keyC = f.substring(1, f.length - 1);
                        if (rowRef.values[keyC]) {
                            formulaRow = formulaRow.replace(f, rowRef.values[keyC].rawValue)
                        } else {
                            formulaRow = ""
                        }

                    });

                    formulaRow = Utils.EvalFormula(formulaRow);
                    rowRef.values[col.title] = {
                        "config": col,
                        "rawValue": formulaRow,
                        "formattedValue" : valueFormatter.format(formulaRow,col.format)
                    }
                }else if(col.type === ColumnType.RowHeader){
                    rowRef.values[col.title] ={
                        "config": col,
                        "rawValue": col.title,
                        "formattedValue" : col.title
                    };
                }else{
                    var formula = valueFormatter.format(rowRef.values[col.title].rawValue,rowRef.values[col.title].formatString);
                    rowRef.values[col.title]["formattedValue"] = formula;
                    rowRef.values[col.title]["config"] = col;
                }
            }

        }
    } catch (e) {
        console.log(e);
    }
    //TODO: remove
    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
    console.log(tblData);
    return tblData;
}

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    //private textNode: Text;
    private tableDefinition: TableConfig;
    private model: any;
    private tableData: any;
    private host: IVisualHost;
    private editModeVisual: EditModeVisual;
    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.target = options.element;
        this.editModeVisual = new EditModeVisual(this);
    }

    public update(options: VisualUpdateOptions) {
        var w = options.viewport.width;
        var h = options.viewport.height;
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        this.model = visualTransform(options);
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
        console.log(this.tableDefinition);
        this.tableData = visualTransform2(options, this.tableDefinition);
        if (options.editMode === 1) {
            //console.log("Rendering Edit mode..")
            //console.log(this.settings);
            this.editModeVisual.ClearAllContent(this.target);
            this.editModeVisual.RenderEditMode(this.target, this.settings);

        } else {
            if (errorMsg.length === 0) {
                //console.log("Rendering View mode..")
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

    public getTableData(): any {
        return this.tableData;
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
        let objectName = options.objectName;
        let objectEnumeration: VisualObjectInstance[] = [];

        switch (options.objectName) {
            case 'config':
                objectEnumeration.push({
                    objectName: objectName,
                    displayName: "Config",
                    properties: {
                        exportExcel: this.settings.config.exportExcel
                    },
                    selector: null
                })
                break;
            // case 'dataPoint':
            // objectEnumeration.push({
            //     objectName: objectName,
            //     displayName: "Settings",
            //     properties: {
            //         tableConfiguration: this.settings.dataPoint.tableConfiguration
            //     },
            //     selector: null
            // })
            // break;
        }
        return objectEnumeration;
    }

}

