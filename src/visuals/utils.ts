import powerbi from "powerbi-visuals-api";
import DataViewCategorical = powerbi.DataViewCategorical
import DataViewTable = powerbi.DataViewTable
import DataViewMetadata = powerbi.DataViewMetadata


export function getMeasureIndex(dv: DataViewCategorical, measureName: string): number {
    let RetValue: number = -1;
    for (let i = 0; i < dv.values.length; i++) {
        if (dv.values[i].source.roles[measureName] === true) {
            RetValue = i;
            break;
        }
    }
    return RetValue;
}

export function getFormat(dv: DataViewTable, columnName: string): string {
    let RetValue: string = "";
    for (let i = 0; i < dv.columns.length; i++) {
        if (dv.columns[i].displayName === columnName) {
            RetValue = dv.columns[i].format;
        }
    }
    return RetValue;
}

export function indentSpace(str) {
    if(str == null) return str;
    return str.replace(/^\s+/g, '&nbsp;');
  }
export function getMetadataColumnIndex(dv: DataViewMetadata, measureOrCategoryName: string): number {
    var retValue = -1;
    for (var i = 0, ilen = dv.columns.length; i < ilen; i++) {
        var column = dv.columns[i];
        if (column.roles !== undefined) { // Need to do this check. If SSAS MD model kit will break otherwise...
            if (column.roles.hasOwnProperty(measureOrCategoryName)) {
                retValue = i;
                break;
            }
        }
    }
    return retValue;
}

export function containsValue(v) {
    if (typeof v === 'undefined') {
        return false;
    }
    if (v === "") {
        return false;
    }
    if (v.trim().length === 0) {
        return false;
    }
    return true;
}

export function EvalFormula(expr) {
    var e = null;
    try {
        e = eval(expr);
    } catch (exc) {
        e = null;
        console.log(expr);
        console.log(exc);
    }
    return e;
}

export function replace2(str, strToFind, strToReplace) {
    var strR = strToReplace;
    var strF = strToFind.replace("[", "\\[", "g").replace("]", "\\]", "g").replace(")", "\\)", "g").replace("(", "\\(", "g");
    var regEx = new RegExp(strF, "ig");
    var result = str.replace(regEx, strR);
    return result;
}

export function getStringInside(startChar: string, endChar: string, s: string, includeContaining: boolean) {
    var i1 = s.indexOf(startChar, 0);
    var i2 = s.indexOf(endChar, i1);
    if (i1 === -1 || i2 === -1) {
        return null;
    }
    var s2 = s.substring(i1 + startChar.length, i2);
    if (includeContaining) {
        return s.substring(i1, i2 + endChar.length);
    }
    else {
        return s.substring(i1 + startChar.length, i2);
    }
}

export function getTableTotalWidth(tableDefinition: any): number {
    var w = 0;
    var additionalWidth = tableDefinition.additionalWidth;
    for (var c = 0; c < tableDefinition.columns.length; c++) {
        w += tableDefinition.columns[c].width;
    }
    if (!isNaN(additionalWidth)) {
        w += additionalWidth;
    }
    return w;
}

export function getTitle(col: any, tableDefinition: any, model: any) {

    var i1 = col.title.indexOf("eval(", 0);
    var i2 = col.title.indexOf(")", i1);
    if (i1 === -1 || i2 === -1) {
        return col.title;
    }
    var expressionToEval = col.title.substring(i1 + 5, i2);
    var colNameWithBrackets = getStringInside("[", "]", expressionToEval, true);
    if (colNameWithBrackets === null) {
        return col.title;
    }


    var colIndex = null;
    for (var i = 0; i < model[0].values.length; i++) {
        if (model[0].values[i].refName === colNameWithBrackets) {
            colIndex = i;
            break;
        }
    }
    if (colIndex === null) {
        return col.title;
    }
    var title = col.title;
    title = replace2(title, colNameWithBrackets, model[0].values[colIndex].rawValue);
    i1 = title.indexOf("eval(", 0);
    i2 = title.lastIndexOf(")");
    var v = title.substring(i1 + 5, i2);
    var vEvaluated = title.substring(0, i1) + eval(v) + title.substring(i2 + 1);
    return vEvaluated.trim();
}

export function templateFromFields(model: any): string {
    // Columns
    var colJson = "";
    for (var c = 0; c < model[0].values.length; c++) {
        var col = model[0].values[c];
        var j1 = `
{
    "width": "",
    "type": "%COLTYPE%",
    "refName": "%REFNAME%", 
    "title": "%TITLECOLNAME%",
    "calculationFormula": "", 
    "format": "",
    "visible": true
},`;
        if (c === 0) {
            j1 = j1.replace(/%TITLECOLNAME%/g, col.displayName);
            j1 = j1.replace(/%COLTYPE%/g, 'RowHeader');
            //j1 = j1.replace(/%ROWSTYLE%/g, 'text-align:left');
        } else {
            j1 = j1.replace(/%TITLECOLNAME%/g, col.displayName);
            j1 = j1.replace(/%COLTYPE%/g, 'Data');
            //j1 = j1.replace(/%ROWSTYLE%/g, '');
        }
        j1 = j1.replace(/%REFNAME%/g, col.refName);
        colJson += j1;
    }
    colJson = colJson.substr(0, colJson.length - 1);
    // Rows (de tre första)
    var rowJson = "";
    for (var r = 0; r < model.length && r < 100; r++) {
        var row = model[r];
        var j1 = `
{
    "title": "%ROWTITLE%",
    "formula": "%FORMULA%",
    "refName": "[%ROWTITLE%]", 
    "visible": true,
    "type": "Data"
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
"tableProp": {
},
"displayAllRows": true
}
    `;
    fullJson = fullJson.replace(/%COLS%/g, colJson);
    fullJson = fullJson.replace(/%ROWS%/g, rowJson);
    return fullJson;
}



