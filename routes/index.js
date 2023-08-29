import express from "express";
import debug from "../modules/debug.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("../views/home.handlebars", {});
});

router.get("/how-to-export", (req, res) => {
  res.render("../views/how-to-export.handlebars", {});
});

router.get("/privacy-policy", (req, res) => {
  res.render("../views/privacy-policy.handlebars", {});
});

export default router;
