
"use strict";
import powerbi from "powerbi-visuals-api";
import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
  public dataPoint: dataPointSettings = new dataPointSettings();
  public test: TestSettings = new TestSettings();
}

export class dataPointSettings {
  public tableConfiguration: string = "";
}

export class TestSettings {
  public circleColor: string = "white";
}

