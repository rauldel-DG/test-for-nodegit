const express = require('express');
const shell = require('shelljs');
const path = require('path');
const app = express();
require('dotenv').config();

const {
  cloneRepoCMD,
  createBranchCMD,
  readFileCMD,
  upsertFileCMD,
  addAndCommitFileCMD,
  pushBranchToRemoteCMD,
  createPullRequestCMD,
  deleteFolderRecursiveCMD,
  checkoutRemoteBranchCMD,
} = require('./services/shelljs');

const testingShellJS = async (req, res) => {
  try {
    const cloneURL = 'https://github.com/rauldel-DG/test-for-nodegit.git';
    const cloneCredentialsURL = `https://${process.env.GITHUB_USER}:${process.env.GITHUB_TOKEN}@github.com/rauldel-DG/test-for-nodegit.git`;
    const localPath = path.join(__dirname, 'tmp_repo');
    const newBranchName = `project-config/update`;

    shell.exec('git config --global user.email "raul@devgurus.io"');
    shell.exec('git config --global user.name "Raulbot del Río"');

    await cloneRepoCMD(cloneCredentialsURL, localPath);
    shell.exec('pwd');
    shell.cd('./test-for-nodegit');
    shell.exec('git status');
    shell.exec('pwd');
    createBranchCMD(newBranchName);
    shell.exec('git status');
    shell.exec('pwd');
    upsertFileCMD(
      path.join(localPath, 'test-for-nodegit'),
      'data/demo.txt',
      'Is this the real life? Is this just fantasy?'
    );
    shell.exec('git status');

    addAndCommitFileCMD('', '', '', 'Testing commit messages');

    await pushBranchToRemoteCMD('origin', newBranchName);

    await createPullRequestCMD(newBranchName, 'master');

    deleteFolderRecursiveCMD(localPath);
  } catch (err) {
    console.log('ShellJS Error: ', err);
    deleteFolderRecursiveCMD(path.join(__dirname, 'tmp_repo'));
    throw err;
  }
}

const setOperation = async (req, res) => {
  try {
    // HARDCODED PARAMS
    const projectKey = 'eu-production';
    const tier = 'BASIC';

    const cloneURL = `https://${process.env.GITHUB_USER}:${process.env.GITHUB_TOKEN}@github.com/rauldel-DG/${process.env.REPOSITORY_NAME}.git`;
    const localPath = path.join(__dirname, 'tmp_repo');
    const branchName = `project-config/update`;
    const remoteName = 'origin';
    const clonedRepoBasePath = path.join(localPath, process.env.REPOSITORY_NAME);

    // TODO: Look for a bot account to work with CT repo
    shell.exec('git config --global user.email "raul@devgurus.io"');
    shell.exec('git config --global user.name "Raulbot del Río"');

    await cloneRepoCMD(cloneURL, localPath);
    shell.cd(`./${process.env.REPOSITORY_NAME}`);

    const remoteBranches = shell.exec('git branch -r').toString();
    const isBranchAlreadyOpened = remoteBranches.includes(branchName);
    console.log('isBranchOpen: ', isBranchAlreadyOpened);

    // Checking out proper branch for checking if there's any change to apply 
    // with the most recent version of the file
    if(isBranchAlreadyOpened) {
      // If this, we track from remote branch to update it
      checkoutRemoteBranchCMD(remoteName, branchName);
    } else {
      // If this, we create a new branch locally
      createBranchCMD(branchName);
    }
    console.log('Brancho relaxo');

    const projectConfigFile = JSON.parse(readFileCMD(clonedRepoBasePath, 'data/project-config.json'));
    const project = projectConfigFile[process.env.CLOUD_IDENTIFIER].find((p) => p.projectId === projectKey);

    const isProjectAlreadyInBasic = (tier === 'BASIC' && project === undefined);
    const isProjectAlreadyInPremium = (tier === 'PREMIUM' && project !== undefined);

    if (isProjectAlreadyInBasic || isProjectAlreadyInPremium) {
      // TODO: We should return a proper HTTP response code
      console.log('CIAO COUSIN');
      return;
    }
    console.log('Seguimos...');

    let projectConfigFileUpdated = { ...projectConfigFile };
    if (tier === 'BASIC') {
      projectConfigFileUpdated = {
        ...projectConfigFile,
        [process.env.CLOUD_IDENTIFIER]: projectConfigFile[process.env.CLOUD_IDENTIFIER].filter((p) => p.projectId !== projectKey)
      };
    } else if (tier === 'PREMIUM'){
      projectConfigFileUpdated = {
        ...projectConfigFile,
        [process.env.CLOUD_IDENTIFIER]: [
          ...projectConfigFile[process.env.CLOUD_IDENTIFIER],
          {
            "projectId": projectKey,
            "expirationDays": 730,
            "tier": "PREMIUM"
          }],
      };
    }

    console.log('PCF: ', projectConfigFileUpdated);
    upsertFileCMD(clonedRepoBasePath, 'data/project-config.json', JSON.stringify(projectConfigFileUpdated, null, 2));

    addAndCommitFileCMD('', '', '', `feat(projects): update tier of ${projectKey}`);
    
    await pushBranchToRemoteCMD(remoteName, branchName);

    if (!isBranchAlreadyOpened) {
      await createPullRequestCMD(branchName, 'master');
    }
    
    deleteFolderRecursiveCMD(localPath);
  } catch(err) {
    console.log('PETALOS -> ', err);
    deleteFolderRecursiveCMD(path.join(__dirname, 'tmp_repo'));
    throw err;
  }
}

app.get('/', async (req, res) => {
  const name = process.env.NAME || 'World';
  try {
    // await testingShellJS(req, res);
    await setOperation(req, res);
  } catch (err) {
    res.status(500).send(err);
  }
  res.send(`Hello ${name}!`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});