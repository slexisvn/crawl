import { Octokit } from "@octokit/core";
import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const users = await User.find({}).select(
          "login repo name location email profileLink -_id"
        );
        res.status(200).json({ success: true, data: users });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case "POST":
      try {
        const { githubLink } = req.body;

        if (
          !githubLink ||
          !/https:\/\/github\.com\/(\w+)\/(\w+)(\/|)/g.test(githubLink)
        ) {
          return;
        }

        const urls = [];
        const regex = /https:\/\/github\.com\/(\w+)\/(\w+)(\/|)/g;
        const owner = githubLink.replace(regex, "$1");
        const repo = githubLink.replace(regex, "$2");
        const octokit = new Octokit();
        let users = await User.find({ repo: `${owner}/${repo}` })
        const stargazers = await octokit.request(
          "GET /repos/{owner}/{repo}/stargazers",
          {
            owner,
            repo,
          }
        );

        users = users.map(user => user.login)

        stargazers.data.forEach((stargazer) => {
          if (!users.includes(stargazer.login)) {
            urls.push(`GET /users/${stargazer.login}`);
          }
        });

        const newUsers = await Promise.all(
          urls.map((url) =>
            octokit
              .request(url, {
                owner,
                repo,
              })
          )
        ).then((responses) =>
          responses.map((res) => ({
            login: res.data.login,
            repo: `${owner}/${repo}`,
            name: res.data.name,
            location: res.data.location.replace(';', ','),
            email: res.data.email,
            profileLink: res.data.profileLink,
          }))
        );

        const data = await User.create(newUsers);

        res.status(201).json({ success: true, data });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
