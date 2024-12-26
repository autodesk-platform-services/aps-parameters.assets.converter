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

async function getJSON(url) {
    const resp = await fetch(url);
    if (!resp.ok) {
        alert('Could not load tree data. See console for more details.');
        console.error(await resp.text());
        return [];
    }
    return resp.json();
}

function createTreeNode(id, text, icon, children = false) {
    return { id, text, children, itree: { icon } };
}

async function getGroups(accountId) {
    const groups = await getJSON(`api/accounts/${accountId}/groups`);
    return groups.map(group => createTreeNode(`group|${accountId}|${group.id}`, group.name, 'icon-hub', true));
}

async function getCollections(accountId, groupId) {
    const collections = await getJSON(`api/accounts/${accountId}/groups/${groupId}/collections`);
    return collections.map(collection => createTreeNode(`collection|${accountId}|${groupId}|${collection.id}`, collection.name, 'icon-project', false));
}

export async function initTree(selector, accountId, onSelectionChanged) {
    MicroModal.show('modal-loading-state');

    // See http://inspire-tree.com
    const tree = new InspireTree({
        selection: {
            disableDirectDeselection: true
        },
        data: function (node) {
            if (!node || !node.id) {
                return getGroups(accountId);
            } else {
                const tokens = node.id.split('|');
                switch (tokens[0]) {
                    case 'group': return getCollections(tokens[1], tokens[2]);
                    default: return [];
                }
            }
        }
    });

    let categories = null;
    let specs = null;

    // Pre-load parameter data
    try {
        const categoryResp = await fetch('api/accounts/classifications/categories');
        if (!categoryResp.ok) {
            throw new Error(await categoryResp.text());
        }
        categories = await categoryResp.json();

        const specResp = await fetch('api/accounts/specs');
        if (!specResp.ok) {
            throw new Error(await specResp.text());
        }
        specs = await specResp.json();
    } catch (err) {
        alert('Could not get parameter categories or sepcs. See the console for more details.');
        console.error(err);
    }

    tree.on('node.click', function (event, node) {
        // event.preventTreeDefault();
        const tokens = node.id.split('|');
        if (tokens[0] === 'collection') {
            onSelectionChanged(tokens[1], tokens[2], tokens[3], categories, specs);
        }
    });

    let treeDom = new InspireTreeDOM(tree, { target: selector });
    MicroModal.close('modal-loading-state');

    return treeDom;
}

export async function setupParameterTableView(container, accountId, groupId, collectionId, categories, specs) {
    // const categoryResp = await fetch('api/accounts/classifications/categories');
    // if (!categoryResp.ok) {
    //     throw new Error(await categoryResp.text());
    // }
    // const categories = await categoryResp.json();

    // const specResp = await fetch('api/accounts/specs');
    // if (!specResp.ok) {
    //     throw new Error(await specResp.text());
    // }
    // const specs = await specResp.json();

    if (!$.fn.DataTable.isDataTable(container)) {
        let table = $(container).DataTable({
            dom: 'tr',
            paging: false,
            scrollCollapse: true,
            scrollY: '290px',
            ajax: {
                url: `api/accounts/${accountId}/groups/${groupId}/collections/${collectionId}/parameters`,
                deferRender: true,
                dataSrc: ''
            },
            columns: [
                { data: null },
                {
                    data: 'name',
                    title: 'Name',
                    render: function (data, type) {
                        return `<div style="overflow-x: auto;" title="${data}">${data}</div>`;
                    }
                },
                {
                    data: 'categoryIds',
                    title: 'Categories',
                    render: function (data, type) {
                        let cates = categories.filter(cate => data.includes(cate.bindingId));
                        if (!cates || cates.length <= 0)
                            return '';

                        let names = cates.map(cate => cate.name).join(',');
                        return `<div style="overflow-x: auto;" title="${names}">${names}</div>`;
                    }
                },
                {
                    data: 'dataTypeId',
                    title: 'Data Type',
                    render: function (data, type) {
                        let spec = specs.find(spec => spec.id == data);
                        if (spec)
                            return `<div style="overflow-x: auto;" title="${spec.name}">${spec.name}</div>`;

                        return '';
                    }
                },
                { data: 'created', title: 'Created Date' }
            ],
            columnDefs: [{
                searchable: false,
                orderable: false,
                className: 'select-checkbox dt-body-center',
                targets: 0,
                data: null,
                defaultContent: '',
            }],
            select: {
                style: 'multi',
                selector: 'td:first-child'
            },
            order: [[1, 'asc']]
        });

        async function _post(url, data) {
            const resp = await fetch(url, {
                method: 'post',
                body: JSON.stringify(data),
                headers: new Headers({ 'Content-Type': 'application/json' })
            });
            if (!resp.ok)
                throw new Error(await resp.text());

            const json = await resp.json();
            return json;
        }

        function getDataType(dataTypeId) {
            let dataType = specs.find(spec => spec.id == dataTypeId);
            let type = '';

            switch (dataType?.name) {
                case 'Area': case 'Length':
                    type = 'numeric';
                    break;
                case 'Yes/No':
                    type = 'boolean';
                    break;
                default:
                    type = 'text';
                    break;
            }

            return type;
        }

        //ref: https://www.gyrocode.com/articles/jquery-datatables-how-to-add-a-checkbox-column/
        //ref: https://jsfiddle.net/snqw56dw/3182/

        $('#convert-button').on('click', async function (event) {
            event.stopPropagation();
            event.preventDefault();

            MicroModal.show('modal-loading-state');

            const dropdown = document.getElementById('projects');
            let projectId = dropdown.value;

            try {
                //let tableData = table.data().toArray();
                let tableData = table.rows({ selected: true }).data().toArray();

                if (!tableData || tableData.length <= 0)
                    return alert('No selected parameter, please select one at least!');

                let assetCateRootResp = await fetch(`api/assets/projects/${projectId}/categories:root`);
                let assetCateRoot = await assetCateRootResp.json();

                let categoryIds = new Set(tableData.map(d => d.categoryIds).flat().sort());
                let cates = categories.filter(cate => categoryIds.has(cate.bindingId))
                    .map(cate => {
                        return {
                            name: cate.name.replaceAll('>', '').replaceAll('<', ''),
                            description: cate.bindingId,
                            //parentId: assetCateRoot.uid
                            parentId: assetCateRoot.id
                        };
                    });

                console.log(cates);

                if (!cates || cates.length <= 0) {
                    MicroModal.close('modal-loading-state');
                    return alert('Invalid category data from selected parameters');
                }

                const cateResults = await _post(`api/assets/projects/${projectId}/categories:import`, cates);

                console.log(cateResults);

                $('#assets-categories-table').DataTable().ajax.reload();

                let paramCateBindingMap = {};
                cateResults.forEach(cate => paramCateBindingMap[cate.description] = cate.id);

                console.log(paramCateBindingMap);

                let paramData = tableData.map(d => {
                    return {
                        displayName: d.name,
                        dataType: getDataType(d.dataTypeId),
                        requiredOnIngress: false,
                        description: d.id
                    }
                });

                console.log(paramData);

                const attrResults = await _post(`api/assets/projects/${projectId}/custom-attributes:import`, paramData);

                console.log(attrResults);

                $('#assets-custom-fields-table').DataTable().ajax.reload();

                let assetCateAttrBindings = [];
                for (let i = 0; i < attrResults.length; i++) {
                    let assetAttr = attrResults[i];
                    let attrId = assetAttr.id;

                    let param = tableData[i];
                    param.categoryIds.forEach(cateBindId => {
                        assetCateAttrBindings.push({
                            categoryId: paramCateBindingMap[cateBindId],
                            customAttributeId: attrId
                        });
                    });
                }

                console.log(assetCateAttrBindings);

                const bingingResults = await _post(`api/assets/projects/${projectId}/category-attribute-binding:import`, assetCateAttrBindings);

                console.log(bingingResults);

                MicroModal.close('modal-loading-state');
                alert('Custom attributes are binded to Asset Categories');

            } catch (ex) {
                MicroModal.close('modal-loading-state');
                console.error(ex);
            }
        });
    } else {
        $(container).DataTable().clear().draw();
        $(container).DataTable().ajax.url(`api/accounts/${accountId}/groups/${groupId}/collections/${collectionId}/parameters`).load();
    }
}