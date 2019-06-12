
import { valueFormatter } from "powerbi-visuals-utils-formattingutils/lib/src/valueFormatter";
import * as Utils from "./utils"
export function FormatValue(rawValue, format): any {
    var formattedValue = valueFormatter.format(rawValue, format);
    return formattedValue;
}

export function getStyle(styleObj: any, tableDefinition: any) {
    var style = parseStyle(styleObj);
    if (typeof (tableDefinition.reusableCSS) === "undefined") {
        return style;
    }
    if (tableDefinition.reusableCSS.length === 0) {
        return style;
    }
    var style2 = style;
    for (var i = 0; i < tableDefinition.reusableCSS.length; i++) {
        style2 = Utils.replace2(style2, tableDefinition.reusableCSS[i].key, tableDefinition.reusableCSS[i].value);
    }
    return style2;
}

export function parseStyle(styleObject: any): string {
    var returnCSS = "";
    for (var key in styleObject) {
        if (styleObject.hasOwnProperty(key)) {
            var styleVal = "inherit"
            if (Utils.containsValue(styleObject[key])) {
                styleVal = styleObject[key];
                returnCSS = returnCSS + ";" + key + ":" + styleVal + ";"
            }
            //returnCSS = returnCSS + ";" + key + ":" + styleVal
        }
    }

    return returnCSS;
}

export function parseClasses(styleObject: any): string {
    var classzz = "";
    for (var key in styleObject) {
        if (styleObject.hasOwnProperty(key)) {
            if (Utils.containsValue(styleObject[key])) {
                classzz += " " + styleObject[key];
            }
            //returnCSS = returnCSS + ";" + key + ":" + styleVal
        }
    }

    return classzz;
}