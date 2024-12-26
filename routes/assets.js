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
    getCategories, getCategoriesRoot, getCustomAttributes,
    createCategories, createCustomAttributes, createCategoryCustomAttributeBindings
} = require('../services/assets.js');

let router = express.Router();

router.use(authRefreshMiddleware);

router.get('/projects/:projectId/categories:root', async function (req, res, next) {
    try {
        const rootCategory = await getCategoriesRoot(req.params.projectId, req.internalOAuthToken);
        res.json(rootCategory);
    } catch (err) {
        next(err);
    }
});

router.get('/projects/:projectId/categories', async function (req, res, next) {
    try {
        const categories = await getCategories(req.params.projectId, req.internalOAuthToken, true);
        res.json(categories);
    } catch (err) {
        next(err);
    }
});

router.get('/projects/:projectId/custom-attributes', async function (req, res, next) {
    try {
        const customAttributes = await getCustomAttributes(req.params.projectId, req.internalOAuthToken);
        res.json(customAttributes);
    } catch (err) {
        next(err);
    }
});

router.post('/projects/:projectId/categories:import', async function (req, res, next) {
    try {
        const categories = await createCategories(req.params.projectId, req.body, req.internalOAuthToken);
        res.json(categories);
    } catch (err) {
        next(err);
    }
});

router.post('/projects/:projectId/custom-attributes:import', async function (req, res, next) {
    try {
        const customAttributes = await createCustomAttributes(req.params.projectId, req.body, req.internalOAuthToken);
        res.json(customAttributes);
    } catch (err) {
        next(err);
    }
});

router.post('/projects/:projectId/category-attribute-binding:import', async function (req, res, next) {
    try {
        const customAttributes = await createCategoryCustomAttributeBindings(req.params.projectId, req.body, req.internalOAuthToken);
        res.json(customAttributes);
    } catch (err) {
        next(err);
    }
});

module.exports = router;