import { exec, execFile } from 'child_process'
import * as iconv from 'iconv-lite'
import {promisify} from 'util';
const execSync = promisify(exec);

function expandEnv(path: string) {
	var envRE = /(^|[^^])%((?:\^.|[^^%])*)%/g; // Matches env vars, accounting for escaped chars. I feel dirty.
	return path.replace(envRE, function(_, g1, g2) {
		return g1 + process.env[g2];
	}).replace(/\^(.)/g,"$1");
}

function parseQuery(stdout: string) {
	// Parses the stdout of a shortcut.exe query into a JS object
	var result: any = {};
	result.expanded = {};
	stdout.split(/[\r\n]+/)
		.filter(function(line) { return line.indexOf('=') !== -1; })
		.forEach(function(line) {
				var pair = line.split('=', 2),
				key = pair[0],
				value = pair[1];
				if (key === "TargetPath")
					result.target = value;
				else if (key === "TargetPathExpanded")
					result.expanded.target = value;
				else if (key === "Arguments")
					result.args = value;
				else if (key === "ArgumentsExpanded")
					result.expanded.args = value;
				else if (key === "WorkingDirectory")
					result.workingDir = value;
				else if (key === "WorkingDirectoryExpanded")
					result.expanded.workingDir = value;
				else if (key === "RunStyle")
					result.runStyle = +value;
				else if (key === "IconLocation") {
					result.icon = value.split(',')[0];
					result.iconIndex = value.split(',')[1];
				} else if (key === "IconLocationExpanded") {
					result.expanded.icon = value.split(',')[0];
				} else if (key === "HotKey")
					result.hotkey = + (value.match(/\d+/) as any)[0];
				else if (key === "Description")
					result.desc = value;
			});
	Object.keys(result.expanded).forEach(function(key) {
		result.expanded[key] = result.expanded[key] || result[key];
	});
	return result;
}

const query = async function (path: string) {
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    execFile(
      __dirname + '/../node_modules/windows-shortcuts/lib/shortcut/Shortcut.exe',
      ['/A:Q', '/F:' + expandEnv(path)],
      {encoding: 'buffer'},
      (err, stdout, stderr) => err ? reject(stderr) : resolve(stdout),
    );
	});
	const encoding = 'cp' + (await execSync('chcp')).stdout.toString().trim().split(' ').pop();
	
  return parseQuery(iconv.decode(buffer, encoding));
};

const ws = {query};

export default ws;

