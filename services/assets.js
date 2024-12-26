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

const { ApiClient } = require('forge-apis');
const { internalAuthClient } = require('./auth.js');
const {
    guid,
    sleep,
    mapAsync
} = require('./utils.js');

const requestIdPrefix = 'aps-parameters-assets-sync';

// Categories
async function getCategoriesRoot(projectId, credentials) {
    const apiClient = ApiClient.instance;

    let pathParams = {
        projectId
    };
    let queryParams = {
        'filter[maxDepth]': 0,
        includeUid: true
    };
    let headerParams = {
        'x-request-id': `${requestIdPrefix}-${guid()}`
    };
    let formParams = {};
    let postBody = null;

    console.log(`Making request for getCategoriesRoot (${headerParams['x-request-id']})`);

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    const resp = await apiClient.callApi(
        '/construction/assets/v1/projects/{projectId}/categories', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );

    return resp.body.results[0];
}

async function getRawCategoriesByPage(projectId, limit, offset, credentials) {
    const apiClient = ApiClient.instance;

    offset = offset || 0;
    limit = limit || 50;

    let pathParams = {
        projectId
    };
    let queryParams = {
        offset: Number.parseInt(offset),
        limit: Number.parseInt(limit),
        'filter[isActive]': true,
        includeUid: true
    };
    let headerParams = {
        'x-request-id': `${requestIdPrefix}-${guid()}`
    };
    let formParams = {};
    let postBody = null;

    console.log(`Making request for getRawCategoriesByPage (${headerParams['x-request-id']})`);

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/construction/assets/v1/projects/{projectId}/categories', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

const buildTreeView = (items, id = null, link = 'parentId') =>
    items
        .filter(item => item[link] === id)
        .map(item => ({ ...item, children: buildTreeView(items, item.id) }));

async function getCategories(projectId, credentials, buildTree = false) {
    let categories = [];

    let resp = await getRawCategoriesByPage(projectId, null, null, credentials);
    categories = categories.concat(resp.body.results);

    // let count = Math.ceil(resp.body.pagination.totalResults / resp.body.pagination.limit);
    // for (let i = 0, offset = resp.body.pagination.limit; i < count; i++, offset += resp.body.pagination.limit) {
    //     resp = await getRawCategoriesByPage(projectId, resp.body.pagination.limit, offset, credentials);
    //     categories = categories.concat(resp.body.results);
    // }

    if (buildTree) {
        const tree = buildTreeView(categories, categories[0].id);

        return tree.map(node => {
            node.parentId = null
            return node;
        })
    }

    return categories;
}

async function createCategory(projectId, categoryData, credentials) {
    const apiClient = ApiClient.instance;

    let pathParams = {
        projectId
    };
    let queryParams = {
        includeUid: true
    };
    let headerParams = {
        'x-request-id': `${requestIdPrefix}-${guid()}`
    };
    let formParams = {};
    let postBody = categoryData;

    if (categoryData == undefined || categoryData == null) {
        return Promise.reject('Missing the required parameter `categoryData` when calling createCategory');
    }

    console.log(`Making request for createCategory (${headerParams['x-request-id']})`);

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/construction/assets/v1/projects/{projectId}/categories', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function createCategoryWithDelay(projectId, categoryData, credentials, delay = 200) {
    console.log(`running createCategoryWithDelay for ${projectId}, ${JSON.stringify(categoryData)}`);
    const resp = await createCategory(projectId, categoryData, credentials);

    let startDate = new Date().getTime();
    await sleep(delay);

    let endDate = new Date().getTime();
    console.log(`run createCategoryWithDelay and slept for ${endDate - startDate} ms`);
    return resp;
}

async function createCategories(projectId, categoriesData, credentials) {
    if (categoriesData == undefined || categoriesData == null) {
        return Promise.reject('Missing the required parameter `categoriesData` when calling createCategories');
    }

    // const tasks = categoriesData.map(data => delayPromise(createCategory(projectId, data, credentials), 200));
    // let results = await Promise.all(tasks);
    let results = await mapAsync(categoriesData, (input) => createCategoryWithDelay(projectId, input, credentials));
    let categories = results.map(resp => resp.body);

    return categories;
}

// Custom Attributes
async function getRawCustomAttributesByPage(projectId, cursorState, limit, credentials) {
    const apiClient = ApiClient.instance;

    limit = limit || 50;

    let pathParams = {
        projectId
    };
    let queryParams = {
        limit: Number.parseInt(limit)
    };
    let headerParams = {
        'x-request-id': `${requestIdPrefix}-${guid()}`
    };
    let formParams = {};
    let postBody = null;

    console.log(`Making request for getRawCustomAttributesByPage (${headerParams['x-request-id']})`);

    if (cursorState && (typeof cursorState === 'string'))
        queryParams.cursorState = cursorState;

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/construction/assets/v1/projects/{projectId}/custom-attributes', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function getCustomAttributes(projectId, credentials) {
    let customAttributes = [];
    let data = null;
    let limit = null;
    let cursorState = null;

    do {
        let resp = await getRawCustomAttributesByPage(projectId, cursorState, limit, credentials);
        data = resp.body;

        if (data.results && data.results.length > 0) {
            customAttributes = customAttributes.concat(data.results);

            let nextCursorState = {
                offset: data.pagination.offset + data.pagination.limit,
                limit: data.pagination.limit
            };

            cursorStateStr = JSON.stringify(nextCursorState);
            cursorState = Buffer.from(cursorStateStr).toString();
            limit = data.pagination.limit;
        }

    } while (data && data.pagination.cursorState != null);

    return customAttributes;
}

async function createCustomAttribute(projectId, customAttributeData, credentials) {
    const apiClient = ApiClient.instance;

    let pathParams = {
        projectId
    };
    let queryParams = {
        renameConflicting: true
    };
    let headerParams = {
        'x-request-id': `${requestIdPrefix}-${guid()}`
    };
    let formParams = {};
    let postBody = customAttributeData;

    if (customAttributeData == undefined || customAttributeData == null) {
        return Promise.reject('Missing the required parameter `customAttributeData` when calling createCustomAttribute');
    }

    console.log(`Making request for createCustomAttribute (${headerParams['x-request-id']})`);

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/construction/assets/v1/projects/{projectId}/custom-attributes', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function createCustomAttributeWithDelay(projectId, customAttributeData, credentials, delay = 200) {
    console.log(`running createCustomAttributeWithDelay for ${projectId}, ${JSON.stringify(customAttributeData)}`);
    const resp = await createCustomAttribute(projectId, customAttributeData, credentials);

    let startDate = new Date().getTime();
    await sleep(delay);

    let endDate = new Date().getTime();
    console.log(`run createCustomAttributeWithDelay for ${projectId}, ${JSON.stringify(customAttributeData)} and slept for ${endDate - startDate} ms`);
    return resp;
}

async function createCustomAttributes(projectId, customAttributesData, credentials) {
    if (customAttributesData == undefined || customAttributesData == null) {
        return Promise.reject('Missing the required parameter `customAttributesData` when calling createCustomAttributes');
    }

    //const tasks = customAttributesData.map(data => delayPromise(createCustomAttribute(projectId, data, credentials), 200));
    //let results = await Promise.all(tasks);
    let results = await mapAsync(customAttributesData, (input) => createCustomAttributeWithDelay(projectId, input, credentials));
    let attributes = results.map(resp => resp.body);

    return attributes;
}

async function createCategoryCustomAttributeBinding(projectId, categoryId, customAttributeId, credentials) {
    const apiClient = ApiClient.instance;

    let pathParams = {
        projectId,
        categoryId,
        customAttributeId
    };
    let queryParams = {};
    let headerParams = {
        'x-request-id': `${requestIdPrefix}-${guid()}`
    };
    let formParams = {};
    let postBody = null;

    console.log(`Making request for createBulkCategoryCustomAttributeBinding (${headerParams['x-request-id']})`);

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/construction/assets/v1/projects/{projectId}/categories/{categoryId}/custom-attributes/{customAttributeId}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function createCategoryCustomAttributeBindingWithDelay(projectId, categoryId, customAttributeId, credentials, delay = 200) {
    console.log(`running createCategoryCustomAttributeBindingWithDelay for ${projectId}, ${JSON.stringify({ categoryId, customAttributeId })}`);
    const resp = await createCategoryCustomAttributeBinding(projectId, categoryId, customAttributeId, credentials);

    let startDate = new Date().getTime();
    await sleep(delay);

    let endDate = new Date().getTime();
    console.log(`run createCategoryCustomAttributeBindingWithDelay and slept for ${endDate - startDate} ms`);
    return resp;
}

async function createCategoryCustomAttributeBindings(projectId, data, credentials) {
    if (data == undefined || data == null) {
        return Promise.reject('Missing the required parameter `data` when calling createCategoryCustomAttributeBindings');
    }

    // const tasks = data.map(data => delayPromise(createCategoryCustomAttributeBinding(projectId, data.categoryId, data.customAttributeId, credentials), 200));
    // let results = await Promise.all(tasks);
    let results = await mapAsync(data, (input) => createCategoryCustomAttributeBindingWithDelay(projectId, input.categoryId, input.customAttributeId, credentials));
    let attributes = results.map(resp => resp.body.results).flat();

    return attributes;
}

module.exports = {
    getCategoriesRoot,
    getCategories,
    getCustomAttributes,
    createCategories,
    createCustomAttributes,
    createCategoryCustomAttributeBindings
};