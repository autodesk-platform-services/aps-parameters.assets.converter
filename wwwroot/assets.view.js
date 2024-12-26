/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Developer Advocacy and Support
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

export async function initAssetCategoriesTableView(container, projectId) {
    let table = $(container).DataTable({
        dom: 'tr',
        ordering: false,
        // processing: true,
        // serverSide: true,
        ajax: {
            url: `api/assets/projects/${projectId}/categories`,
            dataSrc: ''
        },
        columns: [
            {
                className: 'treegrid-control',
                data: function (item) {
                    if (item.children != null && item.children.length > 0) {
                        return '<span> ᐳ </span>';
                    }
                    return '';
                }
            },
            { data: 'name', title: 'Name' },
            { data: 'updatedAt', title: 'Modified Date' }
        ],
        columnDefs: [{
            defaultContent: '',
            targets: '_all'
        }]
    });

    let tree = new $.fn.dataTable.TreeGrid(table, {
        left: 15,
        expandAll: true,
        expandIcon: '<span>ᐳ</span>',
        collapseIcon: '<span>ᐯ</span>'
    });
}

export async function initAssetCustomFieldsTableView(container, projectId) {
    let table = $(container).DataTable({
        dom: 'tr',
        ajax: {
            url: `api/assets/projects/${projectId}/custom-attributes`,
            dataSrc: ''
        },
        columns: [
            { data: 'displayName', title: 'Name' },
            { data: 'dataType', title: 'Data Type' },
            {
                data: 'values',
                title: 'Values',
                render: function (data, type) {
                    if (!data || !data.values) return '';

                    let names = data.values.map(d => d.name).join(',');
                    return `<div style="overflow-x: auto;">${names}</div>`;
                }
            },
            { data: 'updatedAt', title: 'Modified Date' }
        ],
        order: [[1, 'asc']]
    });
}