export interface TableConfig {
    columns:   Column[];
    rows:      Row[];
    tableProp: TableProp;
}

export interface Column {
    headerStyle:        CSSStyle;
    colStyle:           CSSStyle;
    width:              string;
    type:               ColumnType;
    refName:            string;
    title:              string;
    calculationFormula: string;
    format:             string;
}

export enum ColumnType{
    RowHeader = "RowHeader",
    Data = "Data",
    Calculation = "Calculation",
}

export enum RowType{
    Data = "Data",
    Calculation = "Calculation",
}

export interface Row {
    title:              string;
    formula:            string;
    visible:            boolean;
    indent:             number;
    type:               RowType;
    rowStyle:           CSSStyle;
    cellRowHeaderStyle: CSSStyle;
    cellRowDataStyle:   CSSStyle;
}

export interface TableProp {
    Table:  CSSStyle;
    Header: CSSStyle;
    Style:  Style;
}


export interface CSSStyle {
    "background-color": string;
    "font-size":        string;
    "color":            string;
    "font-weight":      string;
    "text-align":       string;
    "font-family":      string;
}


export interface Style {
    size:    string;
    border:  string;
    stripes: string;
}
