const express = require("express");
const router = express.Router();
const PostsController = require("../controllers/posts");
const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

// add a post  multer try to find image in request body
router.post("", checkAuth, extractFile, PostsController.createPost);

// get all posts
router.get("", PostsController.getAllPosts);

// delete a post   @Param()   tweet id
router.delete("/:id", checkAuth, PostsController.deletePost);

// get editing post
router.get("/:id", PostsController.getPostById);

// udpate content  only creator can edit this
router.put("/:id", checkAuth, extractFile, PostsController.updatePost);

module.exports = router;
