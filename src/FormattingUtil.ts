
import { valueFormatter } from "powerbi-visuals-utils-formattingutils/lib/src/valueFormatter";
import * as Utils from "./utils"
    export function FormatValue(rawValue, format) : any{
        var formattedValue = valueFormatter.format(rawValue, format);
        return formattedValue;
    }

    export function getStyle(style: string, tableDefinition: any) {
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