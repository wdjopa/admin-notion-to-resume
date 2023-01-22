// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Client } from "@notionhq/client";
import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const notion = new Client({ auth: process.env.NOTION_KEY });
const BACKEND_URL = "https://b413-176-159-0-149.eu.ngrok.io";

export default async function handler(req, res) {
  const { body, query } = req;
  const { code, error, state } = query;
  if (code) {
    const response = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      {
        code,
        grant_type: "authorization_code",
        redirect_uri: `${BACKEND_URL}/api/auth`,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.NOTION_OAUTH_CLIENT_ID}:${process.env.NOTION_OAUTH_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    const {
      access_token,
      bot_id,
      duplicated_template_id,
      owner,
      workspace_icon,
      workspace_id,
      workspace_name,
      error,
    } = response.data;
    console.log({ response: response.data, owner: owner.user });
    const resume_url = "http://localhost:3000";
    if (access_token) {
      const page_added = await notion.pages.create({
        parent: {
          database_id: process.env.NOTION_RESUME_DATABASE || "",
          type: "database_id",
        },
        properties: {
          UUID: {
            title: [
              {
                text: {
                  content: Date.now() + ":" + bot_id,
                },
              },
            ],
          },
          access_token: {
            rich_text: [
              {
                text: {
                  content: access_token,
                },
              },
            ],
          },
          bot_id: {
            rich_text: [
              {
                text: {
                  content: bot_id,
                },
              },
            ],
          },
          duplicated_template_id: {
            rich_text: [
              {
                text: {
                  content: duplicated_template_id,
                },
              },
            ],
          },
          owner: {
            rich_text: [
              {
                text: {
                  content: owner.user.id,
                },
              },
            ],
          },
          workspace_icon: {
            rich_text: [
              {
                text: {
                  content: workspace_icon || "",
                },
              },
            ],
          },
          workspace_id: {
            rich_text: [
              {
                text: {
                  content: workspace_id,
                },
              },
            ],
          },
          workspace_name: {
            rich_text: [
              {
                text: {
                  content: workspace_name,
                },
              },
            ],
          },
          resume_url: {
            rich_text: [
              {
                text: {
                  content: resume_url,
                },
              },
            ],
          },
        },
      });
      console.log(page_added);
      res.status(200).redirect("../?success");
    } else {
      res.status(400).json({ error });
    }
  } else {
    if (error) {
      res.redirect(`../?error=${error}`);
    }
  }
}
