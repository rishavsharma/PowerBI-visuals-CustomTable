
"use strict";
import powerbi from "powerbi-visuals-api";
import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
  public dataPoint: dataPointSettings = new dataPointSettings();
  public config: configSettings = new configSettings();
}

export class dataPointSettings {
  public tableConfiguration: string = "";
}

export class configSettings {
  public exportExcel: boolean = false;
}

