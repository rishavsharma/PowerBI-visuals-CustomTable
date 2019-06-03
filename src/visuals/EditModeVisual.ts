import { Visual } from "../visual";
import { VisualSettings } from "../settings";

export class EditModeVisual {
    private visual: Visual;
    private editModeJsonEditor: HTMLTextAreaElement = null;
    constructor(visual: Visual) {
        this.visual = visual;
        this.editModeJsonEditor = document.createElement("textarea");
    }

    public render(target: HTMLElement, settings: VisualSettings) {
        var btnSave: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
        var btnLoadFromFieldList: HTMLButtonElement = <HTMLButtonElement>document.createElement("BUTTON");
        btnSave.type = "button";
        btnSave.value = "Save";
        btnSave.innerText = "Save";
        btnSave.className = "inputButton";
        btnLoadFromFieldList.type = "button";
        btnLoadFromFieldList.value = "Generate template from field list";
        btnLoadFromFieldList.title = "Note! visual will replace the current configuration.";
        btnLoadFromFieldList.className = "inputButton";
        btnLoadFromFieldList.innerText = "Generate";
        target.appendChild(btnSave);
        target.appendChild(btnLoadFromFieldList);
        var divContainer: HTMLDivElement = document.createElement("div");
        divContainer.style.height = "94%"; // With 100% we get scrollbars in edit mode.
        target.appendChild(divContainer);
        var txtJson: HTMLTextAreaElement = this.editModeJsonEditor;
        var txtSampleJson: HTMLTextAreaElement = document.createElement("textarea");
        var divRenderInEditMode = document.createElement("div");
        txtSampleJson.readOnly = true;
        divContainer.appendChild(txtJson);
        //divContainer.appendChild(txtSampleJson);
        divContainer.appendChild(divRenderInEditMode);
        txtJson.className = "TextCodeBox";
        txtJson.value = settings.dataPoint.tableConfiguration;
        txtSampleJson.className = "TextCodeBox TextCodeBoxSample";

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
        var that = this.visual;
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
}