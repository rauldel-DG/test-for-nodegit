const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const { Octokit } = require("@octokit/rest");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const cloneRepoCMD = async (cloneURL, localPath) => {
  let returnFlag = false;
  let contador = 1;
  const command = `git clone ${cloneURL}`;
  console.log('Starting clone...');
  shell.mkdir('-p', localPath);
  shell.cd(localPath);

  var childProcess = shell.exec(command, { async: true });
  childProcess.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      returnFlag = true;
    }
  });

  while(!returnFlag) {
    console.log('Sleeping times: ', contador);
    contador++;
    await sleep(100);
  }
};

const createBranchCMD = (newBranchName) => {
  const command = `git checkout -b ${newBranchName}`;
  shell.exec(command);
};

const checkoutRemoteBranchCMD = (remoteName, branchName) => {
  const command = `git checkout --track ${remoteName}/${branchName}`;
  shell.exec(command);
};

const readFileCMD = (basePath, filePath) => {
  try {
    const pathos = path.join(basePath, filePath);

    return fs.readFileSync(pathos);
  } catch (err) {
    console.error(`Error reading file: ${basePath}/${filePath} ->`, err);
    throw err;
  }
};

const upsertFileCMD = (basePath, filePath, fileContent) => {
  try {
    const pathos = path.join(basePath, filePath);

    fs.writeFileSync(pathos, fileContent);
  } catch (err) {
    console.log(`Error upserting file: ${filePath}/${fileName} ->`, err);
    throw err;
  }
};

const addAndCommitFileCMD = (localPath, filePath, fileName, commitMsg) => {
  shell.exec('git add .');

  shell.exec(`git commit -m "${commitMsg}"`);
};

const pushBranchToRemoteCMD = async (remoteName, newBranchName) => {
  let returnFlag = false;
  let contador = 1;
  const command = `git push ${remoteName} --set-upstream ${newBranchName}`;

  var childProcess = await shell.exec(command, { async: true });
  childProcess.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      returnFlag = true;
    }
  });

  while(!returnFlag) {
    console.log('Sleeping times: ', contador);
    contador++;
    await sleep(100);
  }
};

const createPullRequestCMD = async (branchName, baseName) => {
  try {
    const octokit = new Octokit({
      auth: `token ${process.env.GITHUB_TOKEN}`,
    });

    const res = await octokit.pulls.create({
      owner: process.env.GITHUB_USER,
      repo: 'test-for-nodegit',
      title: `Update projects tier ${branchName}`,
      head: branchName,
      base: baseName,
    });

    console.log('This is a PR -> ', res);
  } catch(err) {
    console.log('Error Creating PR ---> ', err);
    throw err;
  }
}

const deleteFolderRecursiveCMD = (path) => {
  if(fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursiveCMD(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports = {
  cloneRepoCMD,
  createBranchCMD,
  checkoutRemoteBranchCMD,
  readFileCMD,
  upsertFileCMD,
  addAndCommitFileCMD,
  pushBranchToRemoteCMD,
  createPullRequestCMD,
  deleteFolderRecursiveCMD,
};