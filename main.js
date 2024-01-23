import fs from 'fs';
import lighthouse from 'lighthouse';
import path from 'path';
import * as chromeLauncher from 'chrome-launcher';
import * as c from 'lighthouse/core/config/constants.js';
import { processPages } from './parse.js'

const pages = {
    'example1': [
        "https://google.com",
    ],
    'example2': [    
        "https://example.com/",
    ]
}


const site = 'example1'
const d = new Date().toLocaleDateString('en-CA');
const dir = path.join('pages', site, d);

fs.mkdirSync(dir, { recursive: true })

const chrome = await chromeLauncher.launch({ chromeFlags: [] });

const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'seo', 'accessibility'],
    port: chrome.port,
    throttlingMethod: 'provided',
    emulatedFormFactor: 'mobile',
    disableDeviceEmulation: false,
    maxWaitForFcp: 15 * 1000,
    maxWaitForLoad: 35 * 1000,
    formFactor: 'desktop',
    throttling: c.throttling.desktopDense4G,
    screenEmulation: c.screenEmulationMetrics.desktop,
    emulatedUserAgent: c.userAgents.desktop,
    onlyAudits: [
        'first-contentful-paint',
        'largest-contentful-paint',
        'speed-index',
        'total-blocking-time',
    ],
};

for (const url of pages[site]) {
    console.log('Start run for', url);
    const runnerResult = await lighthouse(url, options);
    const filename = encodeURIComponent(url) + ".json";
    fs.writeFileSync(dir + "/" + filename, runnerResult.report);
    console.log('Report is done for', runnerResult.lhr.finalDisplayedUrl);
    console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
}

await chrome.kill();

processPages(dir, path.join('results', site), site);
