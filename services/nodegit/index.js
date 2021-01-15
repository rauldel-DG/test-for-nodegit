const fs = require('fs');
const NodeGit = require('nodegit');

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

const upsertFileAndCommit = async (repository, filePath, fileName, fileContent) => {

};

module.exports = {
  deleteFolderRecursive,
  cloneRepo,
  fetchRepo,
  createBranchFromMaster,
  upsertFileAndCommit,
};