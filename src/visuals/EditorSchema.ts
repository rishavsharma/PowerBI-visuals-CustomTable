export class EditorSchema {
  public static schema = {
    "definitions": {
      "CSSStyle": {
        "$id": "#/definitions/CSSStyle",
        "type": "object",
        "format": "grid",
        "required": [
          "background-color",
          "font-size",
          "color",
          "font-weight",
          "text-align",
          "font-family"],
        "options": {
          "disable_collapse": true,
          "disable_edit_json": true
        },
        "properties": {
          "background-color": {
            "$id": "#/definitions/CSSStyle/properties/background-color",
            "type": "string",
            "title": "background-color",
            "default": ""
          },
          "font-size": {
            "$id": "#/definitions/CSSStyle/properties/font-size",
            "type": "string",
            "title": "Font Size",
            "default": "",
            "examples": [
              "12px",
              "inherit",
              "1em"
            ]
          },
          "color": {
            "$id": "#/definitions/CSSStyle/properties/color",
            "type": "string",
            "title": "Font Color",
            "default": ""
          },
          "font-weight": {
            "$id": "#/definitions/CSSStyle/properties/font-weight",
            "type": "string",
            "title": "Font Weight",
            "enum": ["", "normal", "bold"],
            "default": ""
          },
          "text-align": {
            "$id": "#/definitions/CSSStyle/properties/font-align",
            "type": "string",
            "title": "Text Align",
            "enum": ["", "left", "right", "center"],
            "default": ""
          },
          "font-family": {
            "$id": "#/definitions/CSSStyle/properties/font-family",
            "type": "string",
            "title": "Font Family",
            "enum": ["", "Arial",
              "Arial Black",
              "Arial Unicode MS",
              "Calibri",
              "Cambria",
              "Cambria Math",
              "Candara",
              "Comic Sans MS",
              "Consolas",
              "Constantia",
              "Corbel",
              "Courier New",
              "wf_standard-font, helvetica, arial, sans-serif",
              "Georgia",
              "Lucida Sans Unicode",
              "Segoe UI Bold, wf_segoe-ui_bold, helvetica, arial, sans-serif",
              "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif",
              "Segoe UI Light, wf_segoe-ui_light, helvetica, arial, sans-serif",
              "Symbol",
              "Tahoma",
              "Times New Roman",
              "Trebuchet MS",
              "Verdana",
              "Wingdings"],
            "default": ""
          }
        }
      },
      "borderStyle": {
        "$id": "#/definitions/borderStyle",
        "type": "object",
        "format": "grid",
        "required": [
          "border-bottom"],
        "options": {
          "disable_collapse": true,
          "disable_edit_json": true
        },
        "properties": {
          "border-bottom": {
            "$id": "#/definitions/borderStyle/properties/border-bottom",
            "type": "string",
            "title": "Border Bottom",
            "default": ""
          }
        }
      }
    },
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://example.com/root.json",
    "type": "object",
    "title": "Config",
    "format": "categories",
    "basicCategoryTitle": "Main",
    "options": {
      "disable_collapse": true,
      "disable_edit_json": true
    },
    "required": [
      "tableProp",
      "columns",
      "rows"
    ],
    "properties": {
      "columns": {
        "$id": "#/properties/columns",
        "type": "array",
        "title": "Columns",
        "format": "tabs",
        "options": {
          "disable_collapse": true,
          "disable_array_delete_all_rows": true,
          "disable_array_delete_last_row": true
        },
        "items": {
          "$id": "#/properties/columns/items",
          "type": "object",
          "title": "Column",
          "format": "categories",
          "options": {
            "disable_collapse": true,
            "disable_edit_json": true
          },
          "headerTemplate": "{{ i1 }} - {{ self.title }}",
          "required": [
            "headerStyle",
            "colStyle",
            "width",
            "type",
            "refName",
            "title",
            "calculationFormula",
            "format",
            "visible"
          ],
          "properties": {
            "headerStyle": { "$ref": "#/definitions/CSSStyle" },
            "colStyle": { "$ref": "#/definitions/CSSStyle" },
            "width": {
              "$id": "#/properties/columns/items/properties/width",
              "type": "string",
              "title": "Width",
              "default": ""
            },
            "type": {
              "$id": "#/properties/columns/items/properties/type",
              "type": "string",
              "title": "Type",
              "pattern": "^(.*)$",
              "enum": [
                "RowHeader",
                "Calculation",
                "Data"
              ],
              "default": "Calculation"
            },
            "refName": {
              "$id": "#/properties/columns/items/properties/refName",
              "type": "string",
              "title": "Refname",
              "pattern": "^(.*)$",
              "propertyOrder": 2
            },
            "title": {
              "$id": "#/properties/columns/items/properties/title",
              "type": "string",
              "title": "Title",
              "pattern": "^(.*)$",
              "propertyOrder": 1
            },
            "calculationFormula": {
              "$id": "#/properties/columns/items/properties/calculationFormula",
              "type": "string",
              "title": "Calculationformula",
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

            },
            "visible": {
              "$id": "#/properties/columns/items/properties/visible",
              "type": "boolean",
              "title": "Visible",
              "default": true,
              "format": "checkbox",
              "propertyOrder": 0
            }
          }
        }
      },
      "rows": {
        "$id": "#/properties/rows",
        "type": "array",
        "title": "Rows",
        "format": "tabs",
        "options": {
          "disable_collapse": true,
          "disable_array_delete_all_rows": true,
          "disable_array_delete_last_row": true
        },
        "items": {
          "$id": "#/properties/rows/items",
          "type": "object",
          "title": "Row",
          "format": "categories",
          "options": {
            "disable_collapse": true,
            "disable_edit_json": true
          },
          "headerTemplate": "{{ i1 }} - {{ self.title }}",
          "required": [
            "title",
            "formula",
            "indent",
            "rowStyle",
            "visible",
            "type",
            "refName",
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
            "visible": {
              "$id": "#/properties/rows/items/properties/visible",
              "type": "boolean",
              "title": "Visible",
              "default": true,
              "format": "checkbox",
              "propertyOrder": 0,
              "examples": [
                true
              ]
            },
            "indent": {
              "$id": "#/properties/rows/items/properties/indent",
              "type": "integer",
              "title": "Indent",
              "default":0,
              "propertyOrder": 3
            },
            "type": {
              "$id": "#/properties/rows/items/properties/type",
              "type": "string",
              "title": "Type",
              "pattern": "^(.*)$",
              "enum": [
                "Calculation",
                "Data"
              ],
              "default": "Calculation"
            },
            "refName": {
              "$id": "#/properties/rows/items/properties/refName",
              "type": "string",
              "title": "Refname",
              "propertyOrder": 2
            },
            "rowStyle": { "$ref": "#/definitions/CSSStyle" },            
            "cellRowHeaderStyle": { "$ref": "#/definitions/CSSStyle" },
            "cellRowDataStyle": { "$ref": "#/definitions/CSSStyle" }
          }
        }
      },
      "tableProp": {
        "$id": "#/properties/tableProp",
        "type": "object",
        "title": "Table",
        "propertyOrder": 1,
        "format": "categories",
        "required": ["Header", "Table", "Style"],
        "options": {
          "disable_collapse": true,
          "disable_edit_json": true
        },
        "properties": {
          "Table": { "$ref": "#/definitions/CSSStyle" },
          "Header": { "$ref": "#/definitions/CSSStyle" },
          "Style": {
            "$id": "#/properties/tableProp/properties/Style",
            "type": "object",
            "format": "grid",
            "required": ["size", "border", "stripes"],
            "options": {
              "disable_collapse": true,
              "disable_edit_json": true
            },
            "properties": {
              "size": {
                "$id": "#/properties/tableProp/properties/Style/properties/size",
                "type": "string",
                "title": "Size",
                "uniqueItems": true,
                "propertyOrder": 1,
                "enum": ["table-sm", "table-md", "table-condensed"],
                "default": "table-sm"
              },
              "border": {
                "$id": "#/properties/tableProp/properties/Style/properties/border",
                "type": "string",
                "title": "Border",
                "uniqueItems": true,
                "propertyOrder": 1,
                "enum": ["table-bordered", "table-borderless", ""],
                "default": "table-borderless"
              },
              "stripes": {
                "$id": "#/properties/tableProp/properties/Style/properties/stripes",
                "type": "string",
                "title": "Stripes",
                "uniqueItems": true,
                "propertyOrder": 1,
                "enum": ["table-hover", "table-striped", ""],
                "default": ""
              }
            }
          }
        }
      }
    }
  };
}