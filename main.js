import fs from 'fs';
import lighthouse from 'lighthouse';
import path from 'path';
import * as chromeLauncher from 'chrome-launcher';
import * as c from 'lighthouse/core/config/constants.js';
import { processPages } from './parse.js'

const pages = {
    'm4c': [
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
    ],
    'igc': [
        "https://creators.instagram.com/",
        "https://creators.instagram.com/create",
        "https://creators.instagram.com/reels",
        "https://creators.instagram.com/instagram-video",
        "https://creators.instagram.com/live",
        "https://creators.instagram.com/stories",
        "https://creators.instagram.com/profile",
        "https://creators.instagram.com/create/broadcast-channels",
        "https://creators.instagram.com/grow",
        "https://creators.instagram.com/grow/algorithms-and-ranking",
        "https://creators.instagram.com/grow/insights",
        "https://creators.instagram.com/earn-money/",
        "https://creators.instagram.com/earn-money/branded-content",
        "https://creators.instagram.com/earn-money/badges",
        "https://creators.instagram.com/earn-money/shopping",
        "https://creators.instagram.com/earn-money/subscriptions",
        "https://creators.instagram.com/stay-safe",
        "https://creators.instagram.com/blog",
        "https://creators.instagram.com/blog/warren-abercrombie-instagram-reels-growth",
        "https://creators.instagram.com/faq",
        "https://creators.instagram.com/lab",
        "https://creators.instagram.com/lab/set-content-goals",
        "https://creators.instagram.com/lab/define-content-niche",
        "https://creators.instagram.com/lab/build-content-strategy",
        "https://creators.instagram.com/lab/production-techniques-processes-essentials",
        "https://creators.instagram.com/lab/experiment-creative-tools",
        "https://creators.instagram.com/lab/how-to-optimize-content",
        "https://creators.instagram.com/lab/build-community",
        "https://creators.instagram.com/lab/content-collaboration-partnership",
        "https://creators.instagram.com/lab/manage-social-pressure",
        "https://creators.instagram.com/lab/set-boundaries",
        "https://creators.instagram.com/lab/create-safe-space-environment",
        "https://creators.instagram.com/lab/how-to-full-time-content-creator",
        "https://creators.instagram.com/lab/bust-algorithm-myths",
        "https://creators.instagram.com/lab/content-monetization",
        "https://creators.instagram.com/lab/brand-partnership-tips",
        "https://creators.instagram.com/lab/sell-promote-products",
        "https://creators.instagram.com/lab/instagram-go-live",
        "https://creators.instagram.com/lab/how-to-avoid-burnout",
    ]
}


const site = 'm4c'
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
