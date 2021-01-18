const NodeGit = require('nodegit');
const { 
  deleteFolderRecursive,
  cloneRepo,
  fetchRepo,
  createBranchFromMaster,
  upsertFileAndCommit,
  pushBranchToRemote,
  createPullRequest,
  listPullRequest,
} = require('./services/nodegit');

const GITHUB_TOKEN = '5577caf3ed77a06a4be9ec15fb93ea249c622db4';

const testinggitoperations = async () => {
  const cloneURL = 'https://github.com/rauldel-DG/test-for-nodegit.git';
  // const CTcloneURL = 'https://github.com/commercetools/mc-extension-operations.git';
  const localPath = require('path').join(__dirname, 'tmp_repo');
  
  // Cloning Repo
  let repository = await cloneRepo(cloneURL, localPath);
  listPullRequest();

  // Check current branch (should be master)
  const head = await repository.getCurrentBranch();
  console.log(JSON.stringify(head.name()));

  // Create new branch
  const newBranch = await createBranchFromMaster(repository, 'project-config/testarinoRun');
  console.log('BRANCH CREATED -> ', newBranch.name());

  // Move to new branch
  await repository.checkoutBranch(newBranch, {});

  const cId = await upsertFileAndCommit(
    repository,
    'data',
    'demo.txt',
    'Is this the real life? Is this just fantasy?');

  console.log('COMMIT ID -> ', cId);

  await pushBranchToRemote(repository, newBranch, GITHUB_TOKEN);

  // Check current branch (should be new one)
  const head2 = await repository.getCurrentBranch();
  console.log(JSON.stringify(head2.name()));

  await createPullRequest();

  // Remove temporary cloned repo
  deleteFolderRecursive(localPath);
};


testinggitoperations();