import fs from 'fs';
import path from 'path';
import { stringify } from 'csv-stringify';

const getSubKey = (stack, keypath) => {
    const value = stack[keypath[0]];
    if (keypath.length == 1) {
        return value;
    } else if (value === undefined) {
        throw ('Invalid key: ' + keypath[0]);
    }
    return getSubKey(value, keypath.slice(1));
}

const getDeviceType = (data) => {
    const agent = String(getSubKey(data, ['environment', 'networkUserAgent'])).toLowerCase();
    return agent.includes('android') ? 'mobile' : 'desktop';
}

const getScores = (data) => {
    return Object.fromEntries(Object.entries(data.categories).map(([k, v]) => {
        return [k, (100 * Number(v.score)).toFixed(0)]
    }));
}

const getFields = (data) => {
    const fields = [
        'first-contentful-paint',
        'largest-contentful-paint',
        'speed-index',
        'total-blocking-time'
    ];

    return Object.fromEntries(fields.map(field => {
        const v = getSubKey(data, ['audits', field, 'numericValue']);
        return [field, (Number(v) * 0.001).toFixed(3)];
    }));
}

const parsePageJson = (data) => {
    return {
        'url': data.requestedUrl,
        'device-type': getDeviceType(data),
        'scores': getScores(data),
        'fields': getFields(data)
    };
}

const flattenResults = (results) => {
    return results.map(r => {
        let baseInfo = { 'url': r['url'], 'device-type': r['device-type'] };
        return Object.assign(baseInfo, r.scores, r.fields);
    });
}

const toCSV = (pages, folder, fileprefix) => {
    fs.mkdirSync(folder, { recursive: true })
    const filename = path.join(folder, fileprefix + '-' + new Date().toLocaleDateString('en-CA') + '.csv');
    const f = flattenResults(pages);
    const stringifier = stringify({ header: true, columns: Object.keys(f[0]) });
    const writableStream = fs.createWriteStream(filename);
    f.forEach(row => stringifier.write(row));
    stringifier.pipe(writableStream);
    console.log(`Wrote ${filename}`)
}

export const processPages = (dir, folder='results', fileprefix='') => {
    const pages = fs.readdirSync(dir).map(file => {
        const data = fs.readFileSync(path.join(dir, file), 'utf8');
        return parsePageJson(JSON.parse(data));
    });
    toCSV(pages, folder, fileprefix);
}
