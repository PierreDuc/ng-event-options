import child_process from 'child_process';

const skipNext = [];
const useNext = ['ng-packagr'];

const checkPackages = () => {
  const thread = child_process.exec('npm outdated --json');
  thread.stdout.on('data', parseResult);
};

const parseResult = (data) => {
  const outdated = Object.keys(JSON.parse(data)).filter(packageName => packageName && !skipNext.includes(packageName));
  if (outdated.length) {
    updatePackage(outdated);
  }
};

const updatePackage = (outdated) => {
  if (outdated.length) {
    const packageName = outdated.shift();
    const isNext = useNext.includes(packageName);
    const version = isNext ? 'next' : 'latest';
    const thread = child_process.exec(`npm install ${packageName}@${version} -E`);

    thread.stdout.on('data', console.log);
    thread.on('exit', () => updatePackage(outdated));

    if (isNext) {
      skipNext.push(packageName);
    }
    console.log(`Updating ${packageName}`);
  } else {
    checkPackages();
  }
};

checkPackages();
