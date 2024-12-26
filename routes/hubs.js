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
const { getHubs, getProjects, getProjectContents, getItemVersions } = require('../services/hubs.js');

let router = express.Router();

router.use(authRefreshMiddleware);

router.get('/', async function (req, res, next) {
    try {
        let options = null;
        if (req.query.extensionType) {
            options = {
                filterExtensionType: [req.query.extensionType]
            };
        }

        const hubsResp = await getHubs(req.internalOAuthToken, options);
        const hubs = hubsResp.map(hub => {
            return {
                id: hub.id,
                name: hub.attributes.name,
                region: hub.attributes.region
            };
        });

        res.json(hubs.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
        next(err);
    }
});

router.get('/:hubId/projects', async function (req, res, next) {
    try {
        const projectsResp = await getProjects(req.params.hubId, req.internalOAuthToken);

        let projects = null;
        if (req.query.projectType) {
            projects = projectsResp
                .filter(proj => proj.attributes.extension.data.projectType == req.query.projectType)
        } else {
            projects = projectsResp;
        }

        projects = projects.map(proj => {
            return {
                id: proj.id,
                name: proj.attributes.name,
                region: proj.attributes.region,
                type: proj.attributes.extension.data.projectType
            };
        });

        res.json(projects.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
        next(err);
    }
});

router.get('/:hub_id/projects/:project_id/contents', async function (req, res, next) {
    try {
        const contents = await getProjectContents(req.params.hub_id, req.params.project_id, req.query.folder_id, req.internalOAuthToken);
        res.json(contents);
    } catch (err) {
        next(err);
    }
});

router.get('/:hub_id/projects/:project_id/contents/:item_id/versions', async function (req, res, next) {
    try {
        const versions = await getItemVersions(req.params.project_id, req.params.item_id, req.internalOAuthToken);
        res.json(versions);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
