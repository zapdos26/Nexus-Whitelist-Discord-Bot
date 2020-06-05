import { Client, Presence } from "discord.js";
import axios from "axios";
import { AxiosRequestConfig } from "axios";
require("dotenv").config();

const DISCORD_TOKEN = process.env.DISCORD_BOT_ACCESS_TOKEN;
const NEXUS_TOKEN = process.env.NEXUS_WHITELIST_ACCESS_TOKEN;
const API_DOMAIN = process.env.API_DOMAIN;

const client = new Client();

client.once("ready", () => {
  console.log("Ready!");
});

client.on("presenceUpdate", (oldPresence: Presence, newPresence: Presence) => {
  if (
    oldPresence != null &&
    oldPresence.status == newPresence.status &&
    newPresence.status != "offline"
  ) {
    return;
  }
  const options: AxiosRequestConfig = {
    url:
      API_DOMAIN +
      "/discord/" +
      newPresence.guild.id +
      "/roles/check?id=" +
      newPresence.userID,
    headers: {
      Authorization: "Bearer " + NEXUS_TOKEN,
      "User-Agent":
        "DiscordBot (https://github.com/zapdos26/Nexus-Whitelist-Discord-Bot, 11.3.0) Node.js/v12.16.0",
    },
    method: "get",
  };
  axios(options)
    .then((resp) => {
      const roles = resp.data;
      console.log(roles, "TEST", newPresence.member.id);
      const member = newPresence.member;
      for (const roleId of Object.keys(roles)) {
        try {
          if (member.roles.cache.has(roleId) && !roles[roleId]) {
            member.roles.remove(roleId);
          } else if (!member.roles.cache.has(roleId) && roles[roleId]) {
            member.roles.add(roleId);
          }
        } catch (e) {
          console.log(e);
        }
      }
    })
    .catch((e) => {
      if (e.response.status == 404 || e.response.status == 401) {
        return;
      }
      console.log(e.message);
    });
});

if (DISCORD_TOKEN == "" || NEXUS_TOKEN == "") {
  throw new Error("No Discord Token or Nexus Token provided");
}

client.login(DISCORD_TOKEN);
