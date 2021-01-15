const { 
  deleteFolderRecursive,
  cloneRepo,
  fetchRepo,
  createBranchFromMaster,
  upsertFileAndCommit,
} = require('./services/nodegit');

const testinggitoperations = async () => {
  const cloneURL = 'https://github.com/rauldel-DG/test-for-nodegit.git';
  // const CTcloneURL = 'https://github.com/commercetools/mc-extension-operations.git';
  const localPath = require('path').join(__dirname, 'tmp_repo');
  
  // Cloning Repo
  let repository = await cloneRepo(cloneURL, localPath);

  // Check current branch (should be master)
  const head = await repository.getCurrentBranch();
  console.log(JSON.stringify(head.name()));

  // Create new branch
  const newBranch = await createBranchFromMaster(repository, 'testarino');
  console.log('BRANCH CREATED -> ', newBranch.name());

  // Move to new branch
  await repository.checkoutBranch(newBranch, {});

  // Check current branch (should be new one)
  const head2 = await repository.getCurrentBranch();
  console.log(JSON.stringify(head2.name()));

  // Remove temporary cloned repo
  deleteFolderRecursive(localPath);
};


testinggitoperations();