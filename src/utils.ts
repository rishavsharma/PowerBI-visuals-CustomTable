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
        if ( dv.columns[i].displayName === columnName ) {
            RetValue = dv.columns[i].format;
        }
    }
    return RetValue;
}


export function getMetadataColumnIndex(dv: DataViewMetadata, measureOrCategoryName: string): number {
    var retValue = -1;
    for (var i = 0, ilen = dv.columns.length; i < ilen; i++) {
        var column = dv.columns[i];
        if(column.roles !== undefined) { // Need to do this check. If SSAS MD model kit will break otherwise...
            if ( column.roles.hasOwnProperty(measureOrCategoryName)) {
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

export function  getStringInside(startChar: string, endChar: string, s: string, includeContaining: boolean) {
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
