const fs = require('fs');
const path = require('path');
const NodeGit = require('nodegit');
const { Octokit } = require("@octokit/rest");

const deleteFolderRecursive = (path) => {
  if(fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

/**
 * Clones a repo.
 * @param {string} cloneURL URL of the repo you want to clone
 * @param {string} localPath Local path where you want to write the repo.
 * @return Repository reference.
 */
const cloneRepo = async (cloneURL, localPath) => {
  const cloneOptions = {};

  const res = await NodeGit.Clone(cloneURL, localPath, cloneOptions);

  return res;
};

const fetchRepo = async (repository, remote) => {
  const res = await repository.fetch(remote, {});

  return res;
};

/**
 * Creates a new local branch from master branch and returns its reference.
 * @param {Repository} repository 
 * @param {String} newBranchName 
 * @return Reference for the branch.
 */
const createBranchFromMaster = async (repository, newBranchName) => {
  const headCommit = await repository.getHeadCommit();

  const res = await repository.createBranch(newBranchName, headCommit, 0);

  return res;
};

/**
 * Upserts a file, adds it to current branch and commits it.
 * @param {Repository} repository Repository instance
 * @param {string} filePath File path that locates desired file
 * @param {string} fileName Name of the file to write
 * @param {Object} fileContent Content of the file
 * 
 * @return The Commit Id we just created
 */
const upsertFileAndCommit = async (repository, filePath, fileName, fileContent) => {
  let index;
  let oid;
  const pathos = path.join(repository.workdir(), filePath, fileName);

  fs.writeFileSync(pathos, fileContent);

  index = await repository.refreshIndex();
  index.addByPath(path.posix.join(filePath, fileName));
  index.write();
  oid = await index.writeTree();

  const head = await NodeGit.Reference.nameToId(repository, "HEAD");
  const parentCommit = await repository.getCommit(head);
  const author = NodeGit.Signature.now("R del Rio", "raul@devgurus.io");
  const committer = NodeGit.Signature.now("R del Rio's Code", "raul@devgurus.io");
  const commitMessage = "This is a test message, please take care.";

  const commitId = await repository.createCommit("HEAD", author, committer, commitMessage, oid, [parentCommit]);

  return commitId;
};

const pushBranchToRemote = async (repository, branch, GITHUB_TOKEN) => {
  const remote = await repository.getRemote('origin');

  try {
    await remote.push(
      [`${branch.name()}:${branch.name()}`],
      {
        callbacks: {
          credentials: function() {
            return NodeGit.Cred.userpassPlaintextNew(GITHUB_TOKEN, "x-oauth-basic");
          }
      }
      });
  } catch (err) {
    console.log('error -> ', err);
  }
};

const createPullRequest = async () => {
  const GITHUB_TOKEN = '5577caf3ed77a06a4be9ec15fb93ea249c622db4';
  const octokit = new Octokit({
      auth: GITHUB_TOKEN,
  });

  const res = await octokit.pulls.create({
    owner: 'rauldel-DG',
    repo: 'test-for-nodegit',
    title: 'Demo PR. All time all around',
    head: 'testarino',
    base: 'master',
  });

  console.log('This is a PR -> ', res);
}

const listPullRequest = async () => {
  const GITHUB_TOKEN = '5577caf3ed77a06a4be9ec15fb93ea249c622db4';
  const octokit = new Octokit({
      auth: GITHUB_TOKEN,
  });

  const res = await octokit.pulls.list({
    owner: 'rauldel-DG',
    repo: 'test-for-nodegit',
    state: 'open',
    /* head: 'testarino',
    base: 'master', */
  });

  console.log('RES -> ', res.data);
}

module.exports = {
  deleteFolderRecursive,
  cloneRepo,
  fetchRepo,
  createBranchFromMaster,
  upsertFileAndCommit,
  pushBranchToRemote,
  createPullRequest,
  listPullRequest,
};