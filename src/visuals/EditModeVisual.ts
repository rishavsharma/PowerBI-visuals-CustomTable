import { Visual } from '../visual';
import { VisualSettings } from "../settings";
import * as Utils from "./utils"
import * as FormatUtils from "./FormattingUtil"
import { CalculationEngine } from "./CalculationEngine";
import * as JSONEditor from "@json-editor/json-editor"
import { EditorSchema } from "./EditorSchema"
import ExcellentExport from 'excellentexport';
import * as $ from 'jquery'
//import * as _ from 'lodash'
import { indentSpace } from './utils';
import { TableConfig, ColumnType } from './TableConfig';
import { valueFormatter } from 'powerbi-visuals-utils-formattingutils/lib/src/valueFormatter';
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

    public RenderAllContent(targetElement: HTMLElement, tableDefinition: TableConfig) {
        var t0 = performance.now();
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
        //var w = Utils.getTableTotalWidth(tableDefinition);
        //var tableHtml = "<div class='tablewrapper'><div class='div-table' style='width:"+w+"px"+customTableStyle+"''>"; // TODO: Det verkar som att bredden inte behövs - det ställer bara till det när det gäller additionalwidth... Nackdelen är att vi inte får en scrollbar om vi förminskar fönstret...

        var customClasses = ""
        if (tableDefinition.tableProp.Style) {
            customClasses = FormatUtils.parseClasses(tableDefinition.tableProp.Style);
        }
        if (this.visual.getSettings().config.exportExcel) {

            var a = document.getElementById("anchorDataElement");
            if (!a) {
                a = document.createElement("a");
                a.setAttribute("id", "anchorDataElement");
                a.setAttribute("href", "#");
                a.setAttribute("download", "somedata.xls");
                //a.setAttribute("style", "width: 100%;text-align: right;display: inline-block;");
                a.innerText = "Export";
                a.onclick = function (e) {
                    return ExcellentExport.excel(this, "dataTable", "Data");
                }
                targetElement.insertAdjacentElement('beforebegin', a);
            }

        } else {
            var a = document.getElementById("anchorDataElement");
            if (a) {
                a.remove();
            }
        }
        var tableHtml = "<div class='tablewrapper'><table id='dataTable' class='table " + customClasses + "' style='" + customTableStyle + "''>";


        // Table header row
        var rowStyle = FormatUtils.getStyle(tableDefinition.tableProp.Header, tableDefinition);

        tableHtml += "<tr class='div-table-row-header' style='" + rowStyle + "'>";
        for (var c = 0; c < tableDefinition.columns.length; c++) {
            var headerStyle = FormatUtils.getStyle(tableDefinition.columns[c].headerStyle, tableDefinition);
            var headerTitle = Utils.getTitle(tableDefinition.columns[c], tableDefinition, model);
            if (tableDefinition.columns[c].width !== "") {
                headerStyle += "width:" + tableDefinition.columns[c].width + "px;min-width:" + tableDefinition.columns[c].width + "px;"
            }
            tableHtml += "<th class='div-table-col-number' style='" + rowStyle + ";" + headerStyle + "'>" + headerTitle + "</th>";
        }
        tableHtml += "</tr>";
        var DisplayAllRows = false; // Default value = display all rows

        var tableData = this.visual.getTableData();

        //var calEngine = new CalculationEngine(model, tableDefinition);
        // Table rows
        for (var r = 0; r < tableDefinition.rows.length; r++) {
            var row = tableDefinition.rows[r];
            var rowIndent = '&nbsp;'.repeat(row.indent)
            var rowHtml = "";
            var rowStyle = FormatUtils.getStyle(row.rowStyle, tableDefinition);
            rowHtml += "<tr class='div-table-row' style='" + rowStyle + "'>";
            var allColumnsAreBlank: boolean = true;
            var rowCols = [];
            for (var c = 0; c < tableDefinition.columns.length; c++) {
                var col = tableDefinition.columns[c];
                var rowStyle = FormatUtils.getStyle(col.colStyle, tableDefinition);
                var renderValue = "";
                if (col.width !== "") {
                    rowStyle += "width:" + col.width + "px;";
                }
                renderValue = tableData[row.title].values[col.title].formattedValue;
                var cellRowDataStyle = FormatUtils.getStyle(row.cellRowDataStyle, tableDefinition);
                if (col.type === ColumnType.Data) {

                }
                else if (col.type === ColumnType.RowHeader) {
                    renderValue = rowIndent + row.title;
                    cellRowDataStyle = FormatUtils.getStyle(row.cellRowHeaderStyle, tableDefinition);
                }
                else if (col.type === ColumnType.Calculation) {

                }
                else {
                    renderValue = "";
                    rowCols.push({ rawValue: null, formatString: null });
                }

                if (row.formula.length === 0) {
                    renderValue = "";
                }
                var colHtml = "<td class='div-table-col-number' style='" + rowStyle + ";" + cellRowDataStyle + "'>" + renderValue + "</td>";
                rowHtml += colHtml;
            }
            rowHtml += "</tr>";

            if (row.visible) {
                tableHtml += rowHtml;
            }
        }
        tableHtml += "</table></div>";

        targetElement.innerHTML = tableHtml;

        var t1 = performance.now();
        console.log("Call to RENDER took " + (t1 - t0) + " milliseconds.")
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