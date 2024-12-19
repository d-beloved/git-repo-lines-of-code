# GitHub Repository Lines of Code

This project provides a function to calculate the total number of lines of code in a GitHub repository, with the option to exclude specific file paths (The files bloating the number of lines of code and need to be part of the repo, e.g `package-lock.json`, `data.json` etc.).

## Features

- Fetches the total number of lines of code in a given GitHub repository.
- Allows excluding specific files from the line count.

## Installation

1. Install the package via npm:
    ```sh
    npm install git-repo-lines-of-code
    ```

## Usage

### Function: `getRepoLinesOfCode`

Fetches the total number of lines of code in a given repository.

#### Parameters

- `owner` (string): The owner of the GitHub repository.
- `repo` (string): The name of the GitHub repository.
- `excludeFilePaths` (string[]): An optional array of file paths to exclude from the line count.

#### Returns

- `Promise<number|string>`: The total number of lines of code, minus any lines of code in the given file paths to exclude, or a string describing an error if the data could not be fetched.

#### Example

```typescript
import getRepoLinesOfCode from 'git-repo-lines-of-code';

const owner = 'octocat';
const repo = 'Hello-World';
const excludeFilePaths = ['path-to-file.ts', 'path-to-auto-generated-code.json'];

getRepoLinesOfCode(owner, repo, excludeFilePaths)
    .then((linesOfCode) => {
        console.log(`Total lines of code: ${linesOfCode}`);
    })
    .catch((error) => {
        console.error(`Error: ${error}`);
    });
```

## Development

### Prerequisites

- Node.js
- npm

### Running Locally

1. Clone the repository and install dependencies:
    ```sh
    git clone https://github.com/d-beloved/git-repo-lines-of-code.git
    cd git-repo-lines-of-code
    npm install
    ```

2. Run the project:
    ```sh
    npm start
    ```

### Running Tests

To run the tests, use the following command:
```sh
npm test
```

## Contributing

Contributions are welcome! Please see the CONTRIBUTING file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- [GitHub API](https://docs.github.com/en/rest/metrics/statistics?apiVersion=2022-11-28#get-the-weekly-commit-activity)