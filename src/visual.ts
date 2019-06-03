
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
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import { VisualSettings } from "./settings";
import VisualObjectInstancesToPersist = powerbi.VisualObjectInstancesToPersist;
import { ValueUtil } from "powerbi-visuals-utils-typeutils/lib/numericSequence/numericSequenceRange";
import { dataViewTransform } from "powerbi-visuals-utils-dataviewutils";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils/lib/src/valueFormatter";
import * as FormatUtils from "./FormattingUtil"
import { CalculationEngine } from './CalculationEngine';
import * as Utils from "./utils"
import { EditModeVisual } from "./visuals/EditModeVisual"
import "bootstrap";

//function visualTransform(options: VisualUpdateOptions, host: IVisualHost, thisRef: Visual): VisualViewModel {            
function visualTransform(options: VisualUpdateOptions, thisRef: Visual): any {
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
        var row = {
            title: dataViews[0].table.rows[i][0],
            name: "[" + dataViews[0].table.rows[i][0] + "]",
            values: colData,
        };
        tblData.push(row);
    }
    console.log("Table data", options);
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
    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.target = options.element;
        this.sampleJson = null;
    }

    public update(options: VisualUpdateOptions) {
        var w = options.viewport.width;
        var h = options.viewport.height;
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        this.model = visualTransform(options, this);

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
        this.CalculationEngine = new CalculationEngine(this.model, this.tableDefinition);
        if (options.editMode === 1) {
            this.ClearAllContent();
            this.RenderEditMode();
        } else {
            if (errorMsg.length === 0) {
                this.ClearAllContent();
                this.RenderAllContent(this.target, this.tableDefinition);
            } else {
                this.target.innerHTML = "<div>" + errorMsg + "</div>"
            }
        }
        this.target.style.overflow = "auto";

        this.RenderVersionNo();
    }

    public RenderVersionNo() {
        var a = document.createElement("div");
        a.style.display = "none";
        a.innerHTML = "Version: " + this.internalVersionNo;
        this.target.appendChild(a);
    }

    public RenderNoContentText() {
        var a = document.createElement("div");
        a.innerHTML = "No table definition defined. Edit the table definition by pressing the edit link in the upper right menu.";
        this.target.appendChild(a);
    }

    public RenderNonNumericColumns(target) {
        target.innerHTML = "Columns other than the first one contains non-numeric fields. This is not allowed.";
    }

    public RenderEditMode() {
        var btnSave: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
        var btnLoadFromFieldList: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
        btnSave.type = "button";
        btnSave.value = "Save";
        btnSave.innerText = "Save";
        btnSave.className = "inputButton";
        btnLoadFromFieldList.type = "button";
        btnLoadFromFieldList.value = "Generate template from field list";
        btnLoadFromFieldList.title = "Note! This will replace the current configuration.";
        btnLoadFromFieldList.className = "inputButton";
        btnLoadFromFieldList.innerText = "Generate";
        this.target.appendChild(btnSave);
        this.target.appendChild(btnLoadFromFieldList);
        var divContainer: HTMLDivElement = document.createElement("div");
        divContainer.style.height = "94%"; // With 100% we get scrollbars in edit mode.
        this.target.appendChild(divContainer);
        var txtJson: HTMLTextAreaElement = this.editModeJsonEditor = document.createElement("textarea");
        var txtSampleJson: HTMLTextAreaElement = document.createElement("textarea");
        var divRenderInEditMode = document.createElement("div");
        txtSampleJson.readOnly = true;
        divContainer.appendChild(txtJson);
        //divContainer.appendChild(txtSampleJson);
        divContainer.appendChild(divRenderInEditMode);
        txtJson.className = "TextCodeBox";
        txtJson.value = this.settings.dataPoint.tableConfiguration;
        txtSampleJson.className = "TextCodeBox TextCodeBoxSample";
        txtSampleJson.value = this.sampleJson;

        txtJson.onkeydown = function (e) {
            if (e.keyCode == 9 || e.which == 9) {
                e.preventDefault();
                var s = txtJson.selectionStart;
                txtJson.value = txtJson.value.substring(0, txtJson.selectionStart) + "\t" + txtJson.value.substring(txtJson.selectionEnd);
                txtJson.selectionEnd = s + 1;
            }
        }
        txtJson.onkeyup = function (e) {
            try {
                var tableDefTmp = JSON.parse(txtJson.value);
                that.RenderAllContent(divRenderInEditMode, tableDefTmp);
            }
            catch (e) {
                divRenderInEditMode.innerHTML = "No valid JSON.";
            }
        }
        var that = this;
        btnLoadFromFieldList.onclick = function (e) {
            that.EditModeCreateTemplateFromFieldList();
            txtJson.onkeyup(null);
        }
        btnSave.onclick = function (e) {
            that.saveConfig(txtJson.value);
        }

        var tableDefTmp = JSON.parse(txtJson.value);
        that.RenderAllContent(divRenderInEditMode, tableDefTmp);
    }

    public saveConfig(jsonCinfig: string) {
        this.settings.dataPoint.tableConfiguration = jsonCinfig;
        let general: VisualObjectInstance[] = [{
            objectName: "dataPoint",
            displayName: "Data colors",
            selector: null,
            properties: {
                tableConfiguration: jsonCinfig
            }
        }];
        let propertToChange: VisualObjectInstancesToPersist = {
            replace: general
        }
        this.host.persistProperties(propertToChange);
    }

    public EditModeCreateTemplateFromFieldList() {
        this.editModeJsonEditor.value = this.templateFromFields();
    }

    private templateFromFields(): string {
        // Columns
        var colJson = "";
        for (var c = 0; c < this.model[0].values.length; c++) {
            var col = this.model[0].values[c];
            var j1 = `
    {
        "headerStyle": "border-bottom:1px;border-bottom-color:#eee;border-bottom-style:solid",
        "rowStyle": "%ROWSTYLE%",
        "width": 150,
        "type": "%COLTYPE%",
        "refName": "%REFNAME%", 
        "title": "%TITLECOLNAME%",
        "calculationFormula": "", 
        "format": ""
    },`;
            if (c === 0) {
                j1 = j1.replace(/%TITLECOLNAME%/g, '');
                j1 = j1.replace(/%COLTYPE%/g, 'RowHeader');
                j1 = j1.replace(/%ROWSTYLE%/g, 'text-align:left');
            } else {
                j1 = j1.replace(/%TITLECOLNAME%/g, col.displayName);
                j1 = j1.replace(/%COLTYPE%/g, 'Data');
                j1 = j1.replace(/%ROWSTYLE%/g, '');
            }
            j1 = j1.replace(/%REFNAME%/g, col.refName);
            colJson += j1;
        }
        colJson = colJson.substr(0, colJson.length - 1);
        // Rows (de tre första)
        var rowJson = "";
        for (var r = 0; r < this.model.length && r < 500; r++) {
            var row = this.model[r];
            var j1 = `
    {
        "title": "%ROWTITLE%",
        "formula": "%FORMULA%",
        "rowStyle": "",
        "visible": true,
        "cellRowHeaderStyle": "",
        "cellRowDataStyle": ""
    },`;
            j1 = j1.replace(/%ROWTITLE%/g, row.title);
            j1 = j1.replace(/%FORMULA%/g, row.name);
            rowJson += j1;
        }
        rowJson = rowJson.substr(0, rowJson.length - 1);
        var fullJson = `
{
"columns": [
%COLS%
],
"rows": [
%ROWS%
],
"headerRow": {
    "rowStyle": ""
},
"displayAllRows": false
}
        `;
        fullJson = fullJson.replace(/%COLS%/g, colJson);
        fullJson = fullJson.replace(/%ROWS%/g, rowJson);
        return fullJson;
    }

    private getTitle(col: any, tableDefinition: any) {
        var i1 = col.title.indexOf("eval(", 0);
        var i2 = col.title.indexOf(")", i1);
        if (i1 === -1 || i2 === -1) {
            return col.title;
        }
        var expressionToEval = col.title.substring(i1 + 5, i2);
        var colNameWithBrackets = Utils.getStringInside("[", "]", expressionToEval, true);
        if (colNameWithBrackets === null) {
            return col.title;
        }


        var colIndex = null;
        for (var i = 0; i < this.model[0].values.length; i++) {
            if (this.model[0].values[i].refName === colNameWithBrackets) {
                colIndex = i;
                break;
            }
        }
        if (colIndex === null) {
            return col.title;
        }
        var title = col.title;
        title = Utils.replace2(title, colNameWithBrackets, this.model[0].values[colIndex].rawValue);
        i1 = title.indexOf("eval(", 0);
        i2 = title.lastIndexOf(")");
        var v = title.substring(i1 + 5, i2);
        var vEvaluated = title.substring(0, i1) + eval(v) + title.substring(i2 + 1);
        return vEvaluated.trim();
    }

    public RenderAllContent(targetElement: HTMLElement, tableDefinition: any) {
        if (tableDefinition === null) {
            this.RenderNoContentText();
            return;
        }

        // Check that all columns except the first one is numeric
        if (this.model.length > 0 && this.model[0].values.length > 1) {
            var hasNonNumeric = false;
            for (var i = 1; i < this.model[0].values.length; i++) {
                if (!this.model[0].values[i].isNumeric) {
                    hasNonNumeric = true;
                }
            }
        }

        if (hasNonNumeric) {
            this.RenderNonNumericColumns(targetElement);
            return;
        }

        // Border round hwole table 
        var customTableStyle = "";
        if (typeof tableDefinition.masterHeader !== 'undefined') {
            customTableStyle = ";" + tableDefinition.masterHeader.borderStyle + ";";
        }
        var w = Utils.getTableTotalWidth(tableDefinition);
        //var tableHtml = "<div class='tablewrapper'><div class='div-table' style='width:"+w+"px"+customTableStyle+"''>"; // TODO: Det verkar som att bredden inte behövs - det ställer bara till det när det gäller additionalwidth... Nackdelen är att vi inte får en scrollbar om vi förminskar fönstret...
        var tableHtml = "<div class='tablewrapper'><div class='div-table' style='" + customTableStyle + "''>";


        // Table header row
        var rowStyle = FormatUtils.getStyle(tableDefinition.headerRow.rowStyle, tableDefinition);

        // Master header
        if (typeof tableDefinition.masterHeader !== 'undefined') {
            tableHtml += "<div class='div-table-row-masterheader'  style='" + tableDefinition.masterHeader.headerStyle + "'><div>" + tableDefinition.masterHeader.title + "</div></div>";
        }

        tableHtml += "<div class='div-table-row-header' style='" + rowStyle + "'>";
        for (var c = 0; c < tableDefinition.columns.length; c++) {
            var headerStyle = FormatUtils.getStyle(tableDefinition.columns[c].headerStyle, tableDefinition);
            var headerTitle = this.getTitle(tableDefinition.columns[c], tableDefinition);
            tableHtml += "<div class='div-table-col-number' style='width:" + tableDefinition.columns[c].width + "px;min-width:" + tableDefinition.columns[c].width + "px;" + headerStyle + "'><div class='table-cell-content'>" + headerTitle + "</div></div>";
        }
        tableHtml += "</div>";
        var DisplayAllRows = false; // Default value = display all rows
        if (typeof (tableDefinition.displayAllRows) !== "undefined") {
            DisplayAllRows = tableDefinition.displayAllRows;
        }

        // Fix ranges (replace : with multiple +)
        for (var r = 0; r < tableDefinition.rows.length; r++) {
            var row = tableDefinition.rows[r];
            var newFormula = "";
            if (row.formula.indexOf("::") > -1) { // indexOf instead of includes to support older browsers
                var p = row.formula.indexOf("::");
                var startRange = row.formula.substring(0, p).trim();
                var endRange = row.formula.substring(p + 2).trim();
                for (var i = 0; i < this.model.length; i++) {
                    if (this.model[i].name >= startRange && this.model[i].name <= endRange) {
                        newFormula += "+" + this.model[i].name;
                    }
                }
                row.formula = newFormula;
            }
        }

        // Table rows
        for (var r = 0; r < tableDefinition.rows.length; r++) {
            var row = tableDefinition.rows[r];
            var rowHtml = "";
            var rowStyle = FormatUtils.getStyle(row.rowStyle, tableDefinition);
            rowHtml += "<div class='div-table-row' style='" + rowStyle + "'>";
            var allColumnsAreBlank: boolean = true;
            var rowCols = [];
            for (var c = 0; c < tableDefinition.columns.length; c++) {
                var col = tableDefinition.columns[c];
                var colRowStyle = FormatUtils.getStyle(col.rowStyle, tableDefinition);
                var renderValue = "";
                var rowStyle = "width:" + col.width + "px;" + colRowStyle;
                var cellRowDataStyle = FormatUtils.getStyle(row.cellRowDataStyle, tableDefinition);
                if (col.type === "Data") {
                    // Datakolumners innehåll hämtar vi från modellen direkt.
                    var v = this.CalculationEngine.GetValueForColumnRowCalculationByName(row, col);
                    allColumnsAreBlank = v.rawValue !== null ? false : allColumnsAreBlank;
                    //renderValue = v === null ? "" : v.formattedValue;
                    if (isNaN(Number(v.rawValue)) || v.rawValue === null) {
                        renderValue = "&nbsp;";
                        //renderValue = v.rawValue;   
                    } else {
                        renderValue = v.formattedValue;
                    }
                    v.formatString = col.format;
                    rowCols.push(v);
                }
                else if (col.type === "RowHeader") {
                    renderValue = row.title;
                    var cellRowHeaderStyle = FormatUtils.getStyle(row.cellRowHeaderStyle, tableDefinition);
                    // TODO: behövs bredden verkligen här. Just nu tar vi bort den.
                    //cellRowDataStyle = "width:" + col.width + "px;" +  cellRowHeaderStyle;
                    cellRowDataStyle = cellRowHeaderStyle;
                    rowCols.push({ rawValue: null, formatString: null });
                }
                else if (col.type === "Calculation") {
                    // Kolumner som baseras på en formeln räknas ut
                    var calcValue = this.CalculationEngine.GetValueForColumCalculation(row, col);
                    renderValue = calcValue.formattedValue;
                    if (renderValue.toLowerCase() !== "(blank)" && renderValue.toLowerCase() !== "nan") {
                        allColumnsAreBlank = false;
                    } else {
                        renderValue = "&nbsp;";
                    }
                    calcValue.formatString = col.format;
                    rowCols.push(calcValue);
                }
                else {
                    renderValue = "";
                    rowCols.push({ rawValue: null, formatString: null });
                }
                // Check if we should ignore presentation of this field for this column.
                var shouldHideValue = false;
                if (typeof row.hideForColumns !== 'undefined') {
                    for (var i = 0; i < row.hideForColumns.length; i++) {
                        if (row.hideForColumns[i] === col.refName) {
                            shouldHideValue = true;
                            break;
                        }
                    }
                }
                if (shouldHideValue) {
                    renderValue = "&nbsp;";
                }

                if (row.formula.length === 0) {
                    renderValue = "";
                }
                var colHtml = "<div class='div-table-col-number' style='" + rowStyle + "'><div class='table-cell-content' style='" + cellRowDataStyle + "'>" + renderValue + "</div></div>";
                rowHtml += colHtml;
            }
            rowHtml += "</div>";
            if (!allColumnsAreBlank || row.formula.length === 0 || DisplayAllRows) {
                //tableHtml += rowHtml;
            } else {
                rowHtml = "";
            }
            // Add calculated row to model (to be able to reuse it in later calculations)
            var isCalculatedRow = true;
            for (var i = 0; i < this.model.length; i++) {
                if (this.model[i].title === row.title) {
                    isCalculatedRow = false;
                }
            }
            if (isCalculatedRow && row.title.length > 0) {
                // Add new row - it does not exist already
                var newTitle = row.title;
                var newName = "[" + newTitle + "]";
                for (var c = 0; c < rowCols.length; c++) {
                    rowCols[c].displayName = newTitle;
                    rowCols[c].refName = newName;
                }
                var newModelRow = {
                    name: newName,
                    title: newTitle,
                    values: rowCols
                };
                this.model.push(newModelRow);
            }
            if (row.visible) {
                tableHtml += rowHtml;
            }
        }
        tableHtml += "</div></div>";
        targetElement.innerHTML = tableHtml;
    }

    private ClearAllContent() {
        this.target.innerHTML = "";
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }



}

