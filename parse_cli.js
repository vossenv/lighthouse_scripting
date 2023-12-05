
import { processPages } from './parse.js'

const args = process.argv.slice(2);
const dir = (args.length > 0 ? args : 'pages/2023-12-04');
processPages(dir)
