
"use strict";
import powerbi from "powerbi-visuals-api";
import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
  public dataPoint: dataPointSettings = new dataPointSettings();
  public customObject: customObjectSettings = new customObjectSettings();
}

export class dataPointSettings {
  public tableConfiguration: string = "";
}

export class customObjectSettings {
  public firstPropertyName: boolean = false;
}

