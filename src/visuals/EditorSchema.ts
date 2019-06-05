export class EditorSchema {
    public static schema = {
        "definitions": {},
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "http://example.com/root.json",
        "type": "object",
        "title": "Config",
        "format": "categories",
        "basicCategoryTitle": "Main",
        "options": {
          "disable_collapse": true
        },
        "required": [
          "columns",
          "rows",
          "headerRow",
          "displayAllRows"
        ],
        "properties": {
          "columns": {
            "$id": "#/properties/columns",
            "type": "array",
            "title": "Columns",
            "format" : "tabs",
            "options": {
                "disable_collapse": true,
                "disable_array_delete_all_rows":true,
                "disable_array_delete_last_row" : true
              },
            "items": {
              "$id": "#/properties/columns/items",
              "type": "object",
              "title": "Column",
              "format":"grid",
              "options": {
                "disable_collapse": true
              },
              "headerTemplate": "{{ i1 }} - {{ self.title }}",
              "required": [
                "headerStyle",
                "rowStyle",
                "width",
                "type",
                "refName",
                "title",
                "calculationFormula",
                "format"
              ],
              "properties": {
                "headerStyle": {
                  "$id": "#/properties/columns/items/properties/headerStyle",
                  "type": "string",
                  "title": "Headerstyle",
                  "default": "",
                  "examples": [
                    "border-top:1px;border-top-color:#aaa;border-top-style:solid;border-bottom:1px;border-bottom-color:#aaa;border-bottom-style:solid;text-align:left"
                  ],
                  "pattern": "^(.*)$",
                },
                "rowStyle": {
                  "$id": "#/properties/columns/items/properties/rowStyle",
                  "type": "string",
                  "title": "Rowstyle",
                  "default": "",
                  "examples": [
                    "text-align:left"
                  ],
                  "pattern": "^(.*)$"
                },
                "width": {
                  "$id": "#/properties/columns/items/properties/width",
                  "type": "integer",
                  "title": "Width",
                  "default": 0,
                  "examples": [
     
                  ]
                },
                "type": {
                  "$id": "#/properties/columns/items/properties/type",
                  "type": "string",
                  "title": "Type",
                  "default": "",
                  "examples": [
                    "RowHeader"
                  ],
                  "pattern": "^(.*)$",
                  "enum": [
                    "RowHeader",
                    "Calculation",
                    "Data"
                  ]
                },
                "refName": {
                  "$id": "#/properties/columns/items/properties/refName",
                  "type": "string",
                  "title": "Refname",
                  "default": "",
                  "examples": [
                    "[Product]"
                  ],
                  "pattern": "^(.*)$",
                  "propertyOrder": 2
                },
                "title": {
                  "$id": "#/properties/columns/items/properties/title",
                  "type": "string",
                  "title": "Title",
                  "default": "",
                  "examples": [
                    ""
                  ],
                  "pattern": "^(.*)$",
                  "propertyOrder": 1
                },
                "calculationFormula": {
                  "$id": "#/properties/columns/items/properties/calculationFormula",
                  "type": "string",
                  "title": "Calculationformula",
                  "default": "",
                  "examples": [
                    ""
                  ],
                  "pattern": "^(.*)$",
                  "propertyOrder": 3
                },
                "format": {
                  "$id": "#/properties/columns/items/properties/format",
                  "type": "string",
                  "title": "Format",
                  "default": "",
                  "examples": [
                    ""
                  ],
                  "pattern": "^(.*)$",
                  "propertyOrder": 4
                  
                }
              }
            }
          },
          "rows": {
            "$id": "#/properties/rows",
            "type": "array",
            "title": "Rows",
            "format" : "tabs",
            "options": {
                "disable_collapse": true,
                "disable_array_delete_all_rows":true,
                "disable_array_delete_last_row" : true
              },
            "items": {
              "$id": "#/properties/rows/items",
              "type": "object",
              "title": "Row",
              "format" : "grid",
              "options": {
                "disable_collapse": true
              },
              "headerTemplate": "{{ i1 }} - {{ self.title }}",
              "required": [
                "title",
                "formula",
                "rowStyle",
                "visible",
                "cellRowHeaderStyle",
                "cellRowDataStyle"
              ],
              "properties": {
                "title": {
                  "$id": "#/properties/rows/items/properties/title",
                  "type": "string",
                  "title": "Title",
                  "default": "",
                  "examples": [
                    "null"
                  ],
                  "pattern": "^(.*)$",
                  "propertyOrder": 1
                },
                "formula": {
                  "$id": "#/properties/rows/items/properties/formula",
                  "type": "string",
                  "title": "Formula",
                  "default": "",
                  "examples": [
                    "[null]"
                  ],
                  "pattern": "^(.*)$",
                  "propertyOrder": 2
                },
                "rowStyle": {
                  "$id": "#/properties/rows/items/properties/rowStyle",
                  "type": "string",
                  "title": "Rowstyle",
                  "default": "",
                  "examples": [
                    ""
                  ],
                  "pattern": "^(.*)$"
                },
                "visible": {
                  "$id": "#/properties/rows/items/properties/visible",
                  "type": "boolean",
                  "title": "Visible",
                  "default": true,
                  "format" : "checkbox",
                  "propertyOrder": 0,
                  "examples": [
                    true
                  ]
                },
                "cellRowHeaderStyle": {
                  "$id": "#/properties/rows/items/properties/cellRowHeaderStyle",
                  "type": "string",
                  "title": "Cellrowheaderstyle",
                  "default": "",
                  "examples": [
                    "border-top:1px;border-top-color:#aaa;border-top-style:solid;"
                  ],
                  "pattern": "^(.*)$"
                },
                "cellRowDataStyle": {
                  "$id": "#/properties/rows/items/properties/cellRowDataStyle",
                  "type": "string",
                  "title": "Cellrowdatastyle",
                  "default": "",
                  "examples": [
                    "border-top:1px;border-top-color:#aaa;border-top-style:solid;"
                  ],
                  "pattern": "^(.*)$"
                }
              }
            }
          },
          "headerRow": {
            "$id": "#/properties/headerRow",
            "type": "object",
            "title": "Headerrow",
            "required": [
              "rowStyle"
            ],
            "properties": {
              "rowStyle": {
                "$id": "#/properties/headerRow/properties/rowStyle",
                "type": "string",
                "title": "Rowstyle",
                "default": "",
                "examples": [
                  "font-weight:bold;font-size:small"
                ],
                "pattern": "^(.*)$"
              }
            }
          },
          "displayAllRows": {
            "$id": "#/properties/displayAllRows",
            "type": "boolean",
            "title": "Displayallrows",
            "default": false,
            "examples": [
              true
            ]
          }
        }
      };
  }