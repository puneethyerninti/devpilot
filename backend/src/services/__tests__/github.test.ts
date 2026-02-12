import { postReviewCommentsWithOctokit } from "../github";

describe("services/github", () => {
  it("posts review comments using the PR head sha", async () => {
    const pulls = {
      get: jest.fn(async () => ({ data: { head: { sha: "deadbeef" } } })),
      createReviewComment: jest.fn(async () => ({}))
    };

    const octokit = {
      pulls
    } as any;

    await postReviewCommentsWithOctokit(octokit, {
      owner: "org",
      repo: "repo",
      prNumber: 7,
      comments: [
        { file: "src/a.ts", startLine: 10, endLine: 10, body: "A" },
        { file: "src/b.ts", startLine: 20, endLine: 21, body: "B" }
      ]
    });

    expect(pulls.get).toHaveBeenCalledWith({ owner: "org", repo: "repo", pull_number: 7 });
    expect(pulls.createReviewComment).toHaveBeenCalledTimes(2);
    expect(pulls.createReviewComment).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: "org",
        repo: "repo",
        pull_number: 7,
        commit_id: "deadbeef",
        path: "src/a.ts",
        line: 10,
        body: "A"
      })
    );
  });
});
