import { Visual } from '../visual';
import { VisualSettings } from "../settings";
import * as Utils from "./utils"
import * as FormatUtils from "./FormattingUtil"
import { CalculationEngine } from "./CalculationEngine";
import * as JSONEditor from "@json-editor/json-editor"
import { EditorSchema } from "./EditorSchema"
//import * as $ from 'jquery'
import * as _ from 'lodash'
export class EditModeVisual {
    private internalVersionNo: string = "2.0.0";
    private visual: Visual;
    private editModeJsonEditor: HTMLTextAreaElement = null;
    private jsoneditor: JSONEditor = null;
    constructor(visual: Visual) {
        this.visual = visual;
        this.editModeJsonEditor = document.createElement("textarea");
    }

    public RenderEditMode(target: HTMLElement, settings: VisualSettings) {
        var btnLoadFromFieldList: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
        var btnSave: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
        btnLoadFromFieldList.type = "button";
        btnLoadFromFieldList.value = "Generate template from field list";
        btnLoadFromFieldList.title = "Note! visual will replace the current configuration.";
        btnLoadFromFieldList.className = "btn btn-secondary json-editor-btn-edit json-editor-btntype-editjson";
        btnLoadFromFieldList.innerText = "Generate";
        btnSave.type = "button";
        btnSave.value = "Save Config";
        btnSave.title = "Save Config";
        btnSave.className = "btn btn-secondary json-editor-btn-edit json-editor-btntype-editjson";
        btnSave.innerText = "Save";

        //target.appendChild(btnLoadFromFieldList);
        var divContainer: HTMLDivElement = document.createElement("div");
        divContainer.style.height = "94%"; // With 100% we get scrollbars in edit mode.
        target.appendChild(divContainer);
        var divRenderInEditMode = document.createElement("div");

        var newEditor: HTMLDivElement = document.createElement("div");
        newEditor.className = "newEditor"
        //target.appendChild(newEditor);     
        var that = this.visual;
        var thisRef = this;
        newEditor.appendChild(btnSave);
        newEditor.appendChild(btnLoadFromFieldList);

        divContainer.appendChild(newEditor);

        var model = this.visual.getViewModel();
        if (settings.dataPoint.tableConfiguration == "") {
            settings.dataPoint.tableConfiguration = Utils.templateFromFields(model);
        }
        var tableConfig = JSON.parse(settings.dataPoint.tableConfiguration);
        if (true) {

            try {
                this.jsoneditor = new JSONEditor(newEditor, {
                    theme: 'bootstrap4',
                    disable_properties: true,
                    no_additional_properties: true,
                    schema: EditorSchema.schema,
                    prompt_before_delete: false,
                    startval: tableConfig
                });

                this.jsoneditor.on('change', function () {
                    var tableConfig = thisRef.jsoneditor.getValue();
                    settings.dataPoint.tableConfiguration = JSON.stringify(tableConfig)
                    thisRef.RenderAllContent(divRenderInEditMode, tableConfig);
                    //var validation_errors = jsoneditor.validate();
                    // Show validation errors if there are any           
                });

                btnLoadFromFieldList.onclick = function (e) {
                    thisRef.EditModeCreateTemplateFromFieldList();
                    var config = JSON.parse(Utils.templateFromFields(model));
                    thisRef.jsoneditor.setValue(config);

                }

            } catch (e) {
                console.log(e);
            }
            btnSave.onclick = function (e) {
                that.saveConfig();
            }

            divContainer.appendChild(divRenderInEditMode);

        }
        thisRef.RenderAllContent(divRenderInEditMode, tableConfig);
    }

    public RenderAllContent(targetElement: HTMLElement, tableDefinition: any) {

        if (tableDefinition === null) {
            this.RenderNoContentText(targetElement);
            return;
        }
        var model = this.visual.getViewModel();

        // Check that all columns except the first one is numeric
        if (model.length > 0 && model[0].values.length > 1) {
            var hasNonNumeric = false;
            for (var i = 1; i < model[0].values.length; i++) {
                if (!model[0].values[i].isNumeric) {
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
        if (typeof tableDefinition.tableProp.Table !== 'undefined') {
            var tableStyle = FormatUtils.getStyle(tableDefinition.tableProp.Table, tableDefinition);
            customTableStyle = ";" + tableStyle + ";";
        }
        var w = Utils.getTableTotalWidth(tableDefinition);
        //var tableHtml = "<div class='tablewrapper'><div class='div-table' style='width:"+w+"px"+customTableStyle+"''>"; // TODO: Det verkar som att bredden inte behövs - det ställer bara till det när det gäller additionalwidth... Nackdelen är att vi inte får en scrollbar om vi förminskar fönstret...
        var tableHtml = "<div class='tablewrapper'><table class='table table-condensed table-borderless' style='" + customTableStyle + "''>";


        // Table header row
        var rowStyle = FormatUtils.getStyle(tableDefinition.tableProp.Header, tableDefinition);

        // Master header
        if (typeof tableDefinition.masterHeader !== 'undefined') {
            tableHtml += "<div class='div-table-row-masterheader'  style='" + tableDefinition.masterHeader.headerStyle + "'><div>" + tableDefinition.masterHeader.title + "</div></div>";
        }

        tableHtml += "<tr class='div-table-row-header' style='" + rowStyle + "'>";
        for (var c = 0; c < tableDefinition.columns.length; c++) {
            var headerStyle = FormatUtils.getStyle(tableDefinition.columns[c].headerStyle, tableDefinition);
            var headerTitle = Utils.getTitle(tableDefinition.columns[c], tableDefinition, model);
            tableHtml += "<th class='div-table-col-number' style='width:" + tableDefinition.columns[c].width + "px;min-width:" + tableDefinition.columns[c].width + "px;" + headerStyle + "'><div class='table-cell-content'>" + headerTitle + "</div></th>";
        }
        tableHtml += "</tr>";
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
                for (var i = 0; i < model.length; i++) {
                    if (model[i].name >= startRange && model[i].name <= endRange) {
                        newFormula += "+" + model[i].name;
                    }
                }
                row.formula = newFormula;
            }
        }

        var calEngine = new CalculationEngine(model, tableDefinition);
        // Table rows
        for (var r = 0; r < tableDefinition.rows.length; r++) {
            var row = tableDefinition.rows[r];
            var rowHtml = "";
            var rowStyle = FormatUtils.getStyle(row.rowStyle, tableDefinition);
            rowHtml += "<tr class='div-table-row' style='" + rowStyle + "'>";
            var allColumnsAreBlank: boolean = true;
            var rowCols = [];
            for (var c = 0; c < tableDefinition.columns.length; c++) {
                var col = tableDefinition.columns[c];
                var colRowStyle = FormatUtils.getStyle(col.colStyle, tableDefinition);
                var renderValue = "";
                var rowStyle = "width:" + col.width + "px;" + colRowStyle;
                var cellRowDataStyle = FormatUtils.getStyle(row.cellRowDataStyle, tableDefinition);
                if (col.type === "Data") {
                    // Datakolumners innehåll hämtar vi från modellen direkt.
                    var v = calEngine.GetValueForColumnRowCalculationByName(row, col);
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
                    var calcValue = calEngine.GetValueForColumCalculation(row, col);
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
                var colHtml = "<td class='div-table-col-number' style='" + rowStyle + "'><div class='table-cell-content' style='" + cellRowDataStyle + "'><pre>" + renderValue + "</pre></div></td>";
                rowHtml += colHtml;
            }
            rowHtml += "</tr>";
            if (!allColumnsAreBlank || row.formula.length === 0 || DisplayAllRows) {
                //tableHtml += rowHtml;
            } else {
                rowHtml = "";
            }
            // Add calculated row to model (to be able to reuse it in later calculations)
            var isCalculatedRow = true;
            for (var i = 0; i < model.length; i++) {
                if (model[i].title === row.title) {
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
                model.push(newModelRow);
            }
            if (row.visible) {
                tableHtml += rowHtml;
            }
        }
        tableHtml += "</table></div>";

        targetElement.innerHTML = tableHtml;
    }

    public ClearAllContent(targetElement: HTMLElement) {
        targetElement.innerHTML = "";
    }

    public RenderVersionNo(targetElement: HTMLElement) {
        var a = document.createElement("div");
        a.style.display = "none";
        a.innerHTML = "Version: " + this.internalVersionNo;
        targetElement.appendChild(a);
    }

    public RenderNoContentText(targetElement: HTMLElement) {
        var a = document.createElement("div");
        a.innerHTML = "No table definition defined. Edit the table definition by pressing the edit link in the upper right menu.";
        targetElement.appendChild(a);
    }

    public RenderNonNumericColumns(target) {
        target.innerHTML = "Columns other than the first one contains non-numeric fields. This is not allowed.";
    }

    public EditModeCreateTemplateFromFieldList() {
        this.editModeJsonEditor.value = Utils.templateFromFields(this.visual.getViewModel());
    }
}