import * as FormatUtils from "./FormattingUtil";
import * as Utils from "./utils";

export class CalculationEngine {
    private model: any;
    private tableDefinition : any;
    constructor(model:any, tableDefinition:any){
        this.model=model;
        this.tableDefinition=tableDefinition;
    }
public  GetValueForColumnRowCalculationByIndex(row: any, colIndex: number, colDef: any): any {
    // Till denna funktion kommer vi en gång per beräknad rad.
    var fExpression = row.formula;
    for (var i = 0; i < this.model.length; i++) {
        // Gå igenom varje rad i modellen för att hitta referenser
        if (row.formula !== null && this.model[i].name !== null) {
            var iPos = row.formula.toLowerCase().indexOf(this.model[i].name.toLowerCase());
            if (iPos !== -1) {
                var modelRawValue = this.model[i].values[colIndex].rawValue;
                fExpression = Utils.replace2(fExpression, this.model[i].name, modelRawValue);
            }
        }
    }
    var rawValue = Utils.EvalFormula(fExpression);
    var format = this.model[0].values[colIndex].formatString;
    if (Utils.containsValue(colDef.format)) { // Only use column formatting if it is defined
        format = colDef.format;
    }
    if (Utils.containsValue(row.format)) { // Only use row formatting if it is defined
        format = row.format;
    }

    //var formattedValue = this.FormatValue(rawValue, format, valueFormatter);
    var formattedValue = FormatUtils.FormatValue(rawValue,format);
    return { formattedValue: formattedValue, rawValue: rawValue };
}

public GetValueForColumnRowCalculationByName(row: any, colDef: any): any {
    var colNameWithBrackets = colDef.refName;
    var rawValue = 0;
    var colIndex = -1;
    for (var i = 0; i < this.model[0].values.length; i++) {
        if (this.model[0].values[i].refName === colNameWithBrackets) {
            colIndex = i;
            break;
        }
    }
    var retValue = null;
    if (colIndex !== -1) {
        retValue = this.GetValueForColumnRowCalculationByIndex(row, colIndex, colDef);
    } else {
        retValue = {
            formattedValue: "(Unknown column)", rawValue: null
        }
    }
    return retValue;
}

public GetValueForColumCalculation(row: any, col): any {
    var calculationFormula = col.calculationFormula;
    var s = calculationFormula;
    var i = 0;
    var result = 0;
    var resultExpression = calculationFormula;
    while (true) {
        s = s.trim();
        if (s.length === 0 || i > 10) {
            break;
        }
        if (s[0] === "[") {
            s = "+" + s;
        }
        var i1 = s.indexOf("[", 0);
        if (i1 === -1) {
            break;
        }
        var i2 = s.indexOf("]", i1);
        var name = s.substring(i1, i2 + 1);
        var calcColDef = col;

        var orgRefName = calcColDef.refName;
        calcColDef.refName = name;
        var columnValue = this.GetValueForColumnRowCalculationByName(row, calcColDef).rawValue;
        resultExpression = resultExpression.replace(name, columnValue);
        s = s.substr(i2 + 1);
        i++;
        calcColDef.refName = orgRefName;
    }
    var format = col.format;
    if (Utils.containsValue(row.format)) {
        format = row.format;
    }
    var evalValue = Utils.EvalFormula(resultExpression);
    //var resultFormatted = this.FormatValue(evalValue, format, valueFormatter);
    var resultFormatted = FormatUtils.FormatValue(evalValue,format);
    return { formattedValue: resultFormatted, rawValue: evalValue };
}


}
