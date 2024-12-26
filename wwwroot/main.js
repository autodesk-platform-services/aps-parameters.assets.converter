import { initTree, setupParameterTableView } from './parameter.view.js';
import { initAssetCategoriesTableView, initAssetCustomFieldsTableView } from './assets.view.js';

async function setupHubsSelection(selectedHubId) {
    const dropdown = document.getElementById('hubs');
    dropdown.innerHTML = '';
    try {
        const resp = await fetch('/api/hubs?extensionType=hubs:autodesk.bim360:Account');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const hubs = await resp.json();

        const options = [
            '<option value="-1">Choose One</option>',
            ...hubs.map(hub => `<option value=${hub.id} ${hub.id === selectedHubId ? 'selected' : ''}>${hub.name}</option>`)
        ];
        dropdown.innerHTML = options.join('\n');

        // Events
        dropdown.onchange = () => {
            if (dropdown.value == -1) return;

            setupProjectsSelection(dropdown.value);
            initTree('#parameters-tree', dropdown.value.replace('b.',''), (accountId, groupId, collectionId, categories, specs) => setupParameterTableView(document.getElementById('parameters-table'), accountId, groupId, collectionId, categories, specs));
        };

        if (dropdown.value) {
            if (dropdown.value == -1) return;

            setupProjectsSelection(dropdown.value);
            initTree('#parameters-tree', dropdown.value.replace('b.',''), (accountId, groupId, collectionId, categories, specs) => setupParameterTableView(document.getElementById('parameters-table'), accountId, groupId, collectionId, categories, specs));
        }
    } catch (err) {
        alert('Could not list hubs. See the console for more details.');
        console.error(err);
    }
}

async function setupProjectsSelection(hubId, selectedProjectId) {
    const dropdown = document.getElementById('projects');
    dropdown.innerHTML = '';
    try {
        const resp = await fetch(`/api/hubs/${hubId}/projects?projectType=ACC`);
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const projects = await resp.json();

        const options = [
            '<option value="-1">Choose One</option>',
            ...projects.map(project => `<option value=${project.id} ${project.id === selectedProjectId ? 'selected' : ''}>${project.name}</option>`)
        ];
        dropdown.innerHTML = options.join('\n');

        // Events
        dropdown.onchange = () => {
            if (dropdown.value == -1) return;

            initAssetCategoriesTableView(document.getElementById('assets-categories-table'), dropdown.value);
            initAssetCustomFieldsTableView(document.getElementById('assets-custom-fields-table'), dropdown.value);
        };

        if (dropdown.value) {
            if (dropdown.value == -1) return;

            initAssetCategoriesTableView(document.getElementById('assets-categories-table'), dropdown.value);
            initAssetCustomFieldsTableView(document.getElementById('assets-custom-fields-table'), dropdown.value);
        }
    } catch (err) {
        alert('Could not list projects. See the console for more details.');
        console.error(err);
    }
}

$(document).ready(async function () {
    const login = document.getElementById('login');
    try {
        const resp = await fetch('/api/auth/profile');
        if (resp.ok) {
            const user = await resp.json();
            login.innerText = `Logout (${user.name})`;
            login.onclick = () => {
                // Log the user out (see https://forge.autodesk.com/blog/log-out-forge)
                const iframe = document.createElement('iframe');
                iframe.style.visibility = 'hidden';
                iframe.src = 'https://accounts.autodesk.com/Authentication/LogOut';
                document.body.appendChild(iframe);
                iframe.onload = () => {
                    window.location.replace('/api/auth/logout');
                    document.body.removeChild(iframe);
                };
            }

            setupHubsSelection();
        } else {
            login.innerText = 'Login';
            login.onclick = () => window.location.replace('/api/auth/login');
        }
        login.style.visibility = 'visible';
    } catch (err) {
        alert('Could not initialize the application. See console for more details.');
        console.error(err);
    }
});
