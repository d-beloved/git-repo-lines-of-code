import * as fs from "fs";
import * as path from "path";

/**
 * Reads the content of the given relative file paths and returns the total number of lines of code.
 *
 * @param filePaths The file paths to read.
 * @returns The total number of lines of code.
 */
const getLinesOfCodeToExclude = async (filePaths: string[]): Promise<number> => {
  let locToExclude = 0;
  
  for (const filePath of filePaths) {
    try {
      const absolutePath = path.resolve(filePath);
      const fileContent = await fs.promises.readFile(absolutePath, "utf-8");
      const lines = fileContent.split(/\r?\n/);
      locToExclude += lines[lines.length - 1] === "" ? lines.length - 1 : lines.length;
    } catch (error) {
      console.error(`Error reading file ${filePath}: `, error);
    }
  }

  return locToExclude;
}


/**
 * Gets the total number of lines of code in a given Github repository.
 *
 * The result is the total number of lines of code in the repository, minus any lines of code in the given paths to exclude.
 *
 * @param owner The owner of the Github repository.
 * @param repo The name of the Github repository.
 * @param excludeFilePaths An optional array of file paths to exclude, relative to the root of the repository.
 * @returns The total number of lines of code in the repository, minus any lines of code in the given paths to exclude,
 *   or a string describing an error if the data could not be fetched.
 */
const getRepoLinesOfCode = async (owner: string, repo: string, excludeFilePaths: string[] = []): Promise<number|string> => {
	const url = `https://api.github.com/repos/${owner}/${repo}/stats/code_frequency`;

	try {
		const response = await fetch(url);
		const data = await response?.json();

		const linesOfCode = Array.isArray(data) ? data.reduce((acc: number, curr: number[]) => acc + (curr[1] - Math.abs(curr[2])), 0) : null;

		if (!linesOfCode) {
			return "Github - No data found for the given repository";
		}

		if (excludeFilePaths.length > 0) {
			const locToExclude = await getLinesOfCodeToExclude(excludeFilePaths);
			return linesOfCode - locToExclude;
		}

		return linesOfCode;
	} catch (error) {
		return "Error fetching data from Github: " + error;
	}
}

export default getRepoLinesOfCode;
