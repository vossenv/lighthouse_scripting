import fs from 'fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as c from 'lighthouse/core/config/constants.js';
import { processPages } from './parse.js'

const d = new Date().toLocaleDateString('en-CA');
const dir = './pages/' + d;

fs.mkdirSync(dir, { recursive: true })

const url_list = [
    "https://www.facebook.com/creators",
    "https://www.facebook.com/creators/blog",
    "https://www.facebook.com/creators/programs/bonuses",
    "https://www.facebook.com/creators/programs/dale-tu",
    "https://www.facebook.com/creators/programs/we-the-culture",
    "https://www.facebook.com/creators/tools/ads-on-facebook-reels",
    "https://www.facebook.com/creators/tools/branded-content",
    "https://www.facebook.com/creators/tools/creator-studio",
    "https://www.facebook.com/creators/tools/crossposting",
    "https://www.facebook.com/creators/tools/facebook-pages-and-profiles",
    "https://www.facebook.com/creators/tools/groups",
    "https://www.facebook.com/creators/tools/in-stream-ads",
    "https://www.facebook.com/creators/tools/live",
    "https://www.facebook.com/creators/tools/meta-business-suite",
    "https://www.facebook.com/creators/tools/mta",
    "https://www.facebook.com/creators/tools/reels",
    "https://www.facebook.com/creators/tools/safety-and-well-being",
    "https://www.facebook.com/creators/tools/sound-collection",
    "https://www.facebook.com/creators/tools/stars",
    "https://www.facebook.com/creators/tools/subscriptions",
    "https://www.facebook.com/creators/up-level-your-videos",
]

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


for (const url of url_list) {
    console.log('Start run for', url);
    const runnerResult = await lighthouse(url, options);
    const filename = encodeURIComponent(url) + ".json";
    fs.writeFileSync(dir + "/" + filename, runnerResult.report);
    console.log('Report is done for', runnerResult.lhr.finalDisplayedUrl);
    console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
}

await chrome.kill();

processPages(dir);
