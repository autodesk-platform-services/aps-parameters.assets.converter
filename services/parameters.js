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
const { mapAsync } = require('./utils.js');

// Labels
async function getRawLabelsByPage(accountId, credentials, limit, offset) {
    const apiClient = ApiClient.instance;

    offset = offset || 0;
    limit = limit || 50;

    let pathParams = {
        accountId
    };
    let queryParams = {
        offset: Number.parseInt(offset),
        limit: Number.parseInt(limit)
    };
    let headerParams = {};
    let formParams = {};
    let postBody = null;

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/parameters/v1/accounts/{accountId}/labels', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function getRawLabels(accountId, credentials) {
    let labels = [];

    let resp = await getRawLabelsByPage(accountId, credentials, 50, null);
    labels = labels.concat(resp.body.results);

    let data = [];
    let count = Math.ceil(resp.body.pagination.totalResults / resp.body.pagination.limit);
    for (let i = 0, offset = resp.body.pagination.limit; i < count; i++, offset += resp.body.pagination.limit) {
        data.push({
            limit: resp.body.pagination.limit,
            offset
        });
    }

    if (data.length > 0) {
        let results = await mapAsync(data, (input) => getRawLabelsByPage(accountId, credentials, input.limit, input.offset));
        labels = labels.concat(results.map(resp => resp.body.results).flat());
    }

    return labels;
}

async function getLabels(accountId, credentials) {
    const rawLabels = await getRawLabels(accountId, credentials);
    const labels = [];

    for (let i = 0; i < rawLabels.length; i++) {
        const rawLabel = rawLabels[i];

        labels.push({
            id: rawLabel.id,
            name: rawLabel.name
        })
    }

    return labels.sort((a, b) => a.name.localeCompare(b.name));
}

// Groups
async function getRawGroupsByPage(accountId, credentials, limit, offset) {
    const apiClient = ApiClient.instance;

    offset = offset || 0;
    limit = limit || 50;

    let pathParams = {
        accountId
    };
    let queryParams = {
        offset: Number.parseInt(offset),
        limit: Number.parseInt(limit)
    };
    let headerParams = {};
    let formParams = {};
    let postBody = null;

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/parameters/v1/accounts/{accountId}/groups', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function getRawGroups(accountId, credentials) {
    let groups = [];

    let resp = await getRawGroupsByPage(accountId, credentials, 50, null);
    groups = groups.concat(resp.body.results);

    let data = [];
    let count = Math.ceil(resp.body.pagination.totalResults / resp.body.pagination.limit);
    for (let i = 0, offset = resp.body.pagination.limit; i < count; i++, offset += resp.body.pagination.limit) {
        data.push({
            limit: resp.body.pagination.limit,
            offset
        });
    }

    if (data.length > 0) {
        let results = await mapAsync(data, (input) => getRawGroupsByPage(accountId, credentials, input.limit, input.offset));
        groups = groups.concat(results.map(resp => resp.body.results).flat());
    }

    return groups;
}

async function getGroups(accountId, credentials) {
    const rawGroups = await getRawGroups(accountId, credentials);
    const groups = [];

    for (let i = 0; i < rawGroups.length; i++) {
        const rawGroup = rawGroups[i];

        groups.push({
            id: rawGroup.id,
            name: rawGroup.title
        })
    }

    return groups.sort((a, b) => a.name.localeCompare(b.name));
}

// Collections
async function getRawCollectionsByPage(accountId, groupId, credentials, limit, offset) {
    const apiClient = ApiClient.instance;

    offset = offset || 0;
    limit = limit || 50;

    let pathParams = {
        accountId,
        groupId
    };
    let queryParams = {
        offset: Number.parseInt(offset),
        limit: Number.parseInt(limit)
    };
    let headerParams = {};
    let formParams = {};
    let postBody = null;

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/parameters/v1/accounts/{accountId}/groups/{groupId}/collections', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function getRawCollections(accountId, groupId, credentials) {
    let collections = [];

    let resp = await getRawCollectionsByPage(accountId, groupId, credentials, 50, null);
    collections = collections.concat(resp.body.results);

    let data = [];
    let count = Math.ceil(resp.body.pagination.totalResults / resp.body.pagination.limit);
    for (let i = 0, offset = resp.body.pagination.limit; i < count; i++, offset += resp.body.pagination.limit) {
        data.push({
            limit: resp.body.pagination.limit,
            offset
        });
    }

    if (data.length > 0) {
        let results = await mapAsync(data, (input) => getRawCollectionsByPage(accountId, groupId, credentials, input.limit, input.offset));
        collections = collections.concat(results.map(resp => resp.body.results).flat());
    }

    return collections;
}

async function getOneCollection(accountId, groupId, collectionId, credentials) {
    const apiClient = ApiClient.instance;

    let pathParams = {
        accountId,
        groupId,
        collectionId
    };
    let queryParams = {};
    let headerParams = {};
    let formParams = {};
    let postBody = null;

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/parameters/v1/accounts/{accountId}/groups/{groupId}/collections/{collectionId}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function hasReadAccessToCollection(accountId, groupId, collectionId, credentials) {
    let rawCollection = await getOneCollection(accountId, groupId, collectionId, credentials);

    return rawCollection?.permissions.read;
}

async function getCollections(accountId, groupId, credentials) {
    const rawCollections = await getRawCollections(accountId, groupId, credentials);
    const collections = [];

    for (let i = 0; i < rawCollections.length; i++) {
        const rawCollection = rawCollections[i]
        collections.push({
            id: rawCollection.id,
            name: rawCollection.title
        })
    }

    //Workaround for the empty collections issue for account admin
    if (collections.length <= 0) {
        const hasReadAccess = await hasReadAccessToCollection(accountId, groupId, groupId, credentials);
        if (hasReadAccess) {
            collections.push({
                id: groupId,
                name: 'Default'
            });
        }
    }

    return collections.sort((a, b) => a.name.localeCompare(b.name));
}

// Parameters
async function getRawParametersByPage(accountId, groupId, collectionId, credentials, limit, offset) {
    const apiClient = ApiClient.instance;

    offset = offset || 0;
    limit = limit || 50;

    let pathParams = {
        accountId,
        groupId,
        collectionId
    };
    let queryParams = {
        offset: Number.parseInt(offset),
        limit: Number.parseInt(limit)
    };
    let headerParams = {};
    let formParams = {};
    let postBody = null;

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/parameters/v1/accounts/{accountId}/groups/{groupId}/collections/{collectionId}/parameters', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function getRawParameters(accountId, groupId, collectionId, credentials) {
    let parameters = [];

    let resp = await getRawParametersByPage(accountId, groupId, collectionId, credentials);
    parameters = parameters.concat(resp.body.results);

    let data = [];
    let count = Math.ceil(resp.body.pagination.totalResults / resp.body.pagination.limit);
    for (let i = 0, offset = resp.body.pagination.limit; i < count; i++, offset += resp.body.pagination.limit) {
        data.push({
            limit: resp.body.pagination.limit,
            offset
        });
    }

    if (data.length > 0) {
        let results = await mapAsync(data, (input) => getRawParametersByPage(accountId, groupId, collectionId, credentials, input.limit, input.offset));
        parameters = parameters.concat(results.map(resp => resp.body.results).flat());
    }

    return parameters;
}

//todo: searchRawParametersByPage
async function searchRawParameters(accountId, groupId, collectionId, data, credentials) {
    const apiClient = ApiClient.instance;

    let pathParams = {
        accountId,
        groupId,
        collectionId
    };
    let queryParams = {};
    let headerParams = {};
    let formParams = {};
    let postBody = data;

    if (data == undefined || data == null) {
        return Promise.reject('Missing the required parameter `data` when calling searchRawParameters');
    }

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/parameters/v1/accounts/{accountId}/groups/{groupId}/collections/{collectionId}/parameters:search', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function getParameters(accountId, groupId, collectionId, credentials) {
    // const rawParams = await getRawParameters(accountId, groupId, collectionId, credentials);
    const resp = await searchRawParameters(accountId, groupId, collectionId, { isArchived: false }, credentials);
    let rawParams = resp.body.results;
    let parameters = [];

    for (let i = 0; i < rawParams.length; i++) {
        const rawParam = rawParams[i];
        // const isArchivedFlag = rawParam.metadata.find(m => m.id == 'isArchived');
        const categories = rawParam.metadata.find(m => m.id == 'categories');
        const paramLabelIds = rawParam.metadata.find(m => m.id == 'labelIds');

        // if (!isArchivedFlag || isArchivedFlag.value == true) continue;
        if (!categories || categories.value.length <= 0) continue;

        parameters.push({
            id: rawParam.id,
            name: rawParam.name,
            categoryIds: categories.value.map(cate => cate.bindingId),
            labelIds: paramLabelIds.value.concat(),
            dataTypeId: rawParam.specId,
            created: rawParam.createdAt
        });
    }

    return parameters;
}

async function getParametersByLabels(accountId, groupId, collectionId, labelIds, credentials) {
    const resp = await searchRawParameters(accountId, groupId, collectionId, { labelIds, isArchived: false }, credentials);
    //const rawParams = await getRawParameters(accountId, groupId, collectionId, credentials);
    let rawParams = resp.body.results;
    let parameters = [];

    for (let i = 0; i < rawParams.length; i++) {
        const rawParam = rawParams[i];
        //const isArchivedFlag = rawParam.metadata.find(m => m.id == 'isArchived');
        const categories = rawParam.metadata.find(m => m.id == 'categories');
        const paramLabelIds = rawParam.metadata.find(m => m.id == 'labelIds');

        //if (!isArchivedFlag || isArchivedFlag.value == true) continue;
        if (!categories || categories.value.length <= 0) continue;
        // if (!paramLabelIds.value.some(labelId => labelIds.includes(labelId))) continue;

        parameters.push({
            id: rawParam.id,
            name: rawParam.name,
            categoryIds: categories.value.map(cate => cate.bindingId),
            labelIds: paramLabelIds.value.concat(),
            dataTypeId: rawParam.specId,
            created: rawParam.createdAt
        });
    }

    return parameters;
}

// Categories
async function getRawCategoriesByPage(limit, offset, credentials, filterOutBindable = false) {
    const apiClient = ApiClient.instance;

    offset = offset || 0;
    limit = limit || 50;

    let pathParams = {};
    let queryParams = {
        offset: Number.parseInt(offset),
        limit: Number.parseInt(limit),
        'filter[bindable]': Boolean(filterOutBindable)
    };
    let headerParams = {};
    let formParams = {};
    let postBody = null;

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/parameters/v1/classifications/categories', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function getRawCategories(credentials, filterOutBindable = false) {
    let categories = [];

    let resp = await getRawCategoriesByPage(50, null, credentials, filterOutBindable);
    categories = categories.concat(resp.body.results);

    let data = [];
    let count = Math.ceil(resp.body.pagination.totalResults / resp.body.pagination.limit);
    for (let i = 0, offset = resp.body.pagination.limit; i < count; i++, offset += resp.body.pagination.limit) {
        data.push({
            limit: resp.body.pagination.limit,
            offset
        });
    }

    if (data.length > 0) {
        let results = await mapAsync(data, (input) => getRawCategoriesByPage(input.limit, input.offset, credentials, filterOutBindable));
        categories = categories.concat(results.map(resp => resp.body.results).flat());
    }

    return categories;
}

async function getCategories(credentials, filterOutBindable = false) {
    const rawCates = await getRawCategories(credentials, filterOutBindable);
    const categories = [];

    for (let i = 0; i < rawCates.length; i++) {
        const rawCate = rawCates[i];

        if (rawCate.bindingId == null) continue;

        categories.push({
            name: rawCate.name,
            bindingId: rawCate.bindingId
        });
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name));;
}

// Specs
async function getRawSpecsByPage(credentials, limit, offset) {
    const apiClient = ApiClient.instance;

    offset = offset || 0;
    limit = limit || 50;

    let pathParams = {};
    let queryParams = {
        offset: Number.parseInt(offset),
        limit: Number.parseInt(limit)
    };
    let headerParams = {};
    let formParams = {};
    let postBody = null;

    let contentTypes = ['application/json'];
    let accepts = ['application/json'];
    let returnType = null;

    return apiClient.callApi(
        '/parameters/v1/specs', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        contentTypes, accepts, returnType, internalAuthClient, credentials
    );
}

async function getRawSpecs(credentials) {
    let specs = [];

    let resp = await getRawSpecsByPage(credentials, 50, null);
    specs = specs.concat(resp.body.results);

    let data = [];
    let count = Math.ceil(resp.body.pagination.totalResults / resp.body.pagination.limit);
    for (let i = 0, offset = resp.body.pagination.limit; i < count; i++, offset += resp.body.pagination.limit) {
        data.push({
            limit: resp.body.pagination.limit,
            offset
        });
    }

    if (data.length > 0) {
        let results = await mapAsync(data, (input) => getRawSpecsByPage(credentials, input.limit, input.offset));
        specs = specs.concat(results.map(resp => resp.body.results).flat());
    }

    return specs;
}

async function getSpecs(credentials) {
    const rawSpecs = await getRawSpecs(credentials);
    const specs = [];

    for (let i = 0; i < rawSpecs.length; i++) {
        const rawSpec = rawSpecs[i];

        specs.push({
            id: rawSpec.id,
            name: rawSpec.name
        })
    }

    return specs.sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = {
    getLabels,
    getGroups,
    getCollections,
    getParameters,
    getParametersByLabels,
    getCategories,
    getSpecs
};