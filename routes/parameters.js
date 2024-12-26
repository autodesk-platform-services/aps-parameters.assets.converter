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

const express = require('express');
const { authRefreshMiddleware } = require('../services/auth.js');
const {
    getLabels,
    getGroups,
    getCollections,
    getParameters,
    getParametersByLabels,
    getCategories,
    getSpecs
} = require('../services/parameters.js');

let router = express.Router();

router.use(authRefreshMiddleware);

router.get('/:accountId/labels', async function (req, res, next) {
    try {
        const groups = await getLabels(req.params.accountId, req.internalOAuthToken);
        res.json(groups);
    } catch (err) {
        next(err);
    }
});

router.get('/:accountId/groups', async function (req, res, next) {
    try {
        const groups = await getGroups(req.params.accountId, req.internalOAuthToken);
        res.json(groups);
    } catch (err) {
        next(err);
    }
});

router.get('/:accountId/groups/:groupId/collections', async function (req, res, next) {
    try {
        const collections = await getCollections(req.params.accountId, req.params.groupId, req.internalOAuthToken);
        res.json(collections);
    } catch (err) {
        next(err);
    }
});

router.get('/:accountId/groups/:groupId/collections/:collectionId/parameters', async function (req, res, next) {
    try {
        let parameters = null;

        if (req.query.labelIds) {
            let labelIds = req.query.labelIds.split(',');
            parameters = await getParametersByLabels(req.params.accountId, req.params.groupId, req.params.collectionId, labelIds, req.internalOAuthToken);
        } else {
            parameters = await getParameters(req.params.accountId, req.params.groupId, req.params.collectionId, req.internalOAuthToken);
        }
        res.json(parameters);
    } catch (err) {
        next(err);
    }
});

router.get('/classifications/categories', async function (req, res, next) {
    try {
        const categories = await getCategories(req.internalOAuthToken, true);
        res.json(categories);
    } catch (err) {
        next(err);
    }
});

router.get('/specs', async function (req, res, next) {
    try {
        const specs = await getSpecs(req.internalOAuthToken);
        res.json(specs);
    } catch (err) {
        next(err);
    }
});

module.exports = router;