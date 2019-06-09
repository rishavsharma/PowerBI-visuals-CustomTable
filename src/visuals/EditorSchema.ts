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
          "font-weight"],
        "options": {
          "disable_collapse": true,
          "disable_edit_json":true
        },
        "properties": {
          "background-color": {
            "$id": "#/definitions/CSSStyle/properties/background-color",
            "type": "string",
            "title": "background-color",
            //"format": "color",
            "default": ""
          },
          "font-size": {
            "$id": "#/definitions/CSSStyle/properties/font-size",
            "type": "string",
            "title": "Font Size",
            "default": "",
            "pattern": "^([0-9]{1,2}px)?$"
          },
          "color": {
            "$id": "#/definitions/CSSStyle/properties/color",
            "type": "string",
            "title": "Font Color",
            //"format": "color",
            "default": ""
          },
          "font-weight": {
            "$id": "#/definitions/CSSStyle/properties/font-weight",
            "type": "string",
            "title": "Font Weight",
            "enum": ["normal", "bold"],
            "default": "normal"
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
          "disable_edit_json":true
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
      "disable_edit_json":true
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
            "disable_edit_json":true
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
            "format"
          ],
          "properties": {
            "headerStyle": { "$ref": "#/definitions/CSSStyle" },
            "colStyle": { "$ref": "#/definitions/CSSStyle" },
            "width": {
              "$id": "#/properties/columns/items/properties/width",
              "type": "integer",
              "title": "Width",
              "default": 0
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
              ]
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
            "disable_edit_json":true
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
            "rowStyle": { "$ref": "#/definitions/CSSStyle" },
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
            "cellRowHeaderStyle": { "$ref": "#/definitions/CSSStyle" },
            "cellRowDataStyle": { "$ref": "#/definitions/CSSStyle" }
          }
        }
      },
      "tableProp": {
        "$id": "#/properties/headerRow",
        "type": "object",
        "title": "Table",
        "propertyOrder": 1,
        "format": "categories",
        "required": ["Header", "Table", "Borders"],
        "options": {
          "disable_collapse": true,
          "disable_edit_json":true
        },
        "properties": {
          "Table": { "$ref": "#/definitions/CSSStyle" },
          "Header": { "$ref": "#/definitions/CSSStyle" },
          "Borders": { "$ref": "#/definitions/borderStyle" }

        }
      }
    }
  };
}