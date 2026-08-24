import process from 'node:process';
import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);
const repositoryUrl = packageJson.repository?.url;
const releaseTag = process.env.GITHUB_REF_NAME;
const failures = [];

if (
  typeof repositoryUrl !== 'string' ||
  !/^git\+https:\/\/github\.com\/[^/]+\/[^/]+\.git$/.test(repositoryUrl)
) {
  failures.push(
    'package.json repository.url must be the real GitHub repository in git+https form',
  );
}
if (typeof packageJson.homepage !== 'string') {
  failures.push('package.json homepage is required');
}
if (typeof packageJson.bugs?.url !== 'string') {
  failures.push('package.json bugs.url is required');
}
if (releaseTag != null && releaseTag !== `v${packageJson.version}`) {
  failures.push(
    `release tag ${releaseTag} must match package version v${packageJson.version}`,
  );
}

if (failures.length > 0) {
  console.error(`Publishing is blocked:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Publish metadata verified.');
