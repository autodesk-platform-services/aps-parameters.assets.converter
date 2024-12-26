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

function guid(format = 'xxxxxxxxxx') {
    let d = new Date().getTime();

    let id = format.replace(
        /[xy]/g,
        (c) => {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });

    return id;
}

async function sleep(millisecond) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), millisecond);
    });
}

async function delayPromise(taskPromise, delay) {
    return new Promise((resolve) => {
        setTimeout(() => {
            return resolve(taskPromise);
        }, delay);
    });
}

/**
 * @callback mapAsyncCallback
 * @param {object} input - function arguments to the mapper function
 * @returns {Promise}
 */

/**
 * 
 * @param {Object[]} arr - Data that will be passed to  mapper 
 * @param {mapAsyncCallback} mapper - Mapper function callback
 * @returns {Object[]}
 */
const mapAsync = (arr, mapper) => {
    let index = 0;
    const reducer = async (promise, nextInput) => {
        const resultSoFar = await promise;
        const nextResult = await mapper(nextInput, index);
        // Use a push to avoid expensive behavior of creating a new array each iteration of the loop
        resultSoFar.push(nextResult);
        index += 1;
        return resultSoFar;
    };
    return arr.reduce(reducer, Promise.resolve([]));
};

module.exports = {
    guid,
    sleep,
    delayPromise,
    mapAsync
};