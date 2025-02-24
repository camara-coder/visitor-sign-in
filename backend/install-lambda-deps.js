const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Lambda function directories
const lambdaFunctions = [
  'enableEvent',
  'disableEvent',
  'getEvent',
  'registerVisitor'
];

console.log('Installing dependencies for Lambda functions...');

// Install dependencies for each Lambda function
lambdaFunctions.forEach(functionName => {
  const functionPath = path.join(__dirname, 'src', functionName);
  
  // Check if the directory exists
  if (fs.existsSync(functionPath)) {
    console.log(`\nProcessing ${functionName}...`);
    
    // Check if package.json exists
    if (fs.existsSync(path.join(functionPath, 'package.json'))) {
      try {
        // Navigate to function directory and install dependencies
        process.chdir(functionPath);
        console.log(`Installing dependencies for ${functionName}...`);
        execSync('npm install', { stdio: 'inherit' });
        console.log(`Successfully installed dependencies for ${functionName}`);
      } catch (error) {
        console.error(`Error installing dependencies for ${functionName}:`, error.message);
      }
    } else {
      console.log(`No package.json found for ${functionName}, skipping...`);
    }
  } else {
    console.log(`Directory for ${functionName} not found, skipping...`);
  }
});

console.log('\nAll Lambda function dependencies installed!');