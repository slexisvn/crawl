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
        console.log(users);
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
        const newUsers = [];
        const regex = /https:\/\/github\.com\/(\w+)\/(\w+)(\/|)/g;
        const owner = githubLink.replace(regex, "$1");
        const repo = githubLink.replace(regex, "$2");
        const octokit = new Octokit({
          auth: "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",
        });
        const stargazers = await octokit.request(
          "GET /repos/{owner}/{repo}/stargazers",
          {
            owner,
            repo,
          }
        );

        stargazers.data.forEach((stargazer) => {
          urls.push(`GET /users/${stargazer.login}`);
        });

        Promise.all(
          urls.map((url) =>
            octokit
              .request(url, {
                owner,
                repo,
              })
              .then(res => res)
              .catch((err) => console.error(err))
          )
        ).then((responses) =>
          responses.forEach((res) => {
            newUsers.push({
              login: res.login,
              repo,
              name: res.name,
              location: res.location,
              email: res.email,
              profileLink: res.profileLink,
            });
          })
        );
console.log(newUsers)
        // const users = await User.create(newUsers);

        // res.status(201).json({ success: true, data: users });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
