import * as fs from "fs";
import * as path from "path";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_RETRIES = 3;

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
 * Fetches data from a given GitHub API URL with retry logic for rate limiting.
 *
 * This function attempts to fetch data from the specified GitHub API URL. In case of a 403 response due to rate limiting,
 * it will wait until the rate limit resets and retry the request up to a maximum number of retries.
 *
 * @param retryCount The current retry attempt count. Automatically managed by the function.
 * @param url The GitHub API URL to fetch data from.
 * @returns A promise that resolves to an object containing the HTTP response, calculated lines of code, and raw data.
 * @throws Any error encountered during the fetch process after exhausting retry attempts.
 */
async function fetchGithubData(retryCount = 0, url: string): Promise<any> {
    try {
        const response = await fetch(url);
        
        // Check if rate limited
        if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
            if (retryCount < MAX_RETRIES) {
                // Get reset time from headers
                const resetTime = parseInt(response.headers.get('x-ratelimit-reset') || '0') * 1000;
                const waitTime = Math.max(resetTime - Date.now(), 0);
                
                // Wait for rate limit to reset (with some buffer)
                await wait(waitTime + 1000);
                
                // Retry the request
                return fetchGithubData(retryCount + 1, url);
            }
        }

			const data = await response?.json();
			let linesOfCode = Array.isArray(data) ? data.reduce((acc: number, curr: number[]) => acc + (curr[1] - Math.abs(curr[2])), 0) : null;
      
			return { response, linesOfCode, data };
    } catch (error) {
        if (retryCount < MAX_RETRIES) {
            // Exponential backoff: 2^retryCount seconds
            await wait(Math.pow(2, retryCount) * 1000);
            return fetchGithubData(retryCount + 1, url);
        }
        throw error;
    }
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
		const { response, linesOfCode, data } = await fetchGithubData(0, url);

		if (!response.ok) {
			return `Github API error: ${response.status} ${response.statusText}`;
		}
		
		if (!data) {
			return "Github API error: Received empty response";
		}
		
		if (!Array.isArray(data)) {
			return `Github API error - Invalid data format received: ${JSON.stringify(data)}`;
		}
		
		if (!linesOfCode) {
			return "Github - Rate limit exceeded. Please try again later.";
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
