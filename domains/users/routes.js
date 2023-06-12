const express = require("express");

const {
  User,
  UserBio,
  UserGameHistory,
  Game,
} = require("../../database/models");
const { where } = require("sequelize");

const userRouter = express.Router();

//POST: /form/users/login
//endpoint bertugas menerima data login form dari halaman dashboard/login
userRouter.post("/form/users/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.findOne({
    where: {
      username: username,
      password: password,
      role: "ADMIN",
    },
  });

  if (!user) {
    res.redirect("/dashboard/login");

    return;
  }

  res.redirect("/dashboard/home");
});

//POST: /form/users/create
//endpoint bertugas menerima data user baru dari halaman dashboard create user
userRouter.post("/form/users/create", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const hobby = req.body.hobby;

  const created = await User.create({
    username,
    password,
    role: "PLAYER",
  });

  await UserBio.create({
    user_id: created.id,
    first_name: first_name,
    last_name: last_name,
    hobby,
  });

  res.redirect("/dashboard/home");
});

//POST: /form/users/update
//endpoint bertugas menerima update data user dari halaman dashboard update user
userRouter.post("/form/users/update", async function (req, res) {
  const id = req.body.user_id;
  const username = req.body.username;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const hobby = req.body.hobby;

  // await User.update(
  //   {
  //     username,
  //   },
  //   {
  //     where: {
  //       id,
  //     },
  //   }
  // );

  await UserBio.update(
    {
      first_name: first_name,
      last_name: last_name,
      hobby,
    },
    {
      where: {
        user_id: id,
      },
    }
  );

  console.log(req.body);

  res.redirect("/dashboard/home");
});

//POST: /form/users/delete
//endpoint bertugas menghapus data user dari halaman dashboard delete user
userRouter.post("/form/users/delete", async function (req, res) {
  const id = req.body.user_id;

  console.log(req.body);

  await UserBio.destroy({
    where: {
      user_id: id,
    },
  });

  await User.destroy({
    where: {
      id,
    },
  });

  res.redirect("/dashboard/home");
});

//POST: /form/users/new-game
userRouter.post("/form/users/new-game", async function (req, res) {
  const userId = req.body.user_id;
  const gameId = req.body.game_id;
  const score = req.body.score;

  //validate if user with that id exist or not
  const currentUser = await User.findOne({
    where: {
      id: userId,
    },
  });

  if (!currentUser) {
    res.redirect("/dashboard/home?error=userNotFound");
    return;
  }

  //validate if game with that id exist or not
  const currentGame = await Game.findOne({
    where: {
      id: gameId,
    },
  });

  if (!currentGame) {
    res.redirect("/dashboard/home?error=gameNotFound");
    return;
  }

  await UserGameHistory.create({
    user_id: userId,
    game_id: gameId,
    score,
    played_at: new Date(),
  });

  res.redirect("/dashboard/home");
});

//GET: /api/v1/users -> list user
userRouter.get("/api/v1/users", async function (req, res) {
  const users = await User.findAll({
    include: {
      model: UserBio,
      as: "bio",
    },
    order: [["id", "ASC"]],
  });

  res.json({
    message: "success fetching user data",
    result: users.map(function (user) {
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: `${user.bio.first_name} ${user.bio.last_name}`,
        hobby: user.bio.hobby,
      };
    }),
    error: null,
  });
});

//GET: /api/v1/users/:id -> detail user
userRouter.get("/api/v1/users/:id", async function (req, res) {
  const id = req.params.id;

  const currentUser = await User.findOne({
    where: {
      id,
    },
    include: [
      {
        model: UserBio,
        as: "bio",
      },
      {
        model: UserGameHistory,
        as: "game_histories",
        include: [
          {
            model: Game,
            as: "game",
          },
        ],
      },
    ],
  });

  if (!currentUser) {
    res.status(404);
    res.json({
      message: "error when get user detail",
      result: null,
      error: "user id is not found",
    });

    return;
  }

  res.json({
    message: "get user detail succeed",
    result: {
      id: currentUser.id,
      username: currentUser.username,
      role: currentUser.bio.role,
      full_name: `${currentUser.bio.first_name} ${currentUser.bio.last_name}`,
      hobby: currentUser.bio.hobby,
      game_histories: currentUser.game_histories.map((history) => ({
        game_id: history.game_id,
        name: history.game.name,
        score: history.score,
        played_at: history.played_at,
      })),
    },
    error: null,
  });
});

//POST: /api/v1/users -> create user
userRouter.post("/api/v1/users", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const hobby = req.body.hobby;

  const created = await User.create({
    username,
    password,
    role: "PLAYER",
  });

  await UserBio.create({
    user_id: created.id,
    first_name: first_name,
    last_name: last_name,
    hobby,
  });

  res.json({
    message: "create new user succed",
    result: created,
    error: null,
  });
});

//PUT: /api/v1/users/:id -> update user
userRouter.put("/api/v1/users/:id", async function (req, res) {
  const id = req.params.id;
  const username = req.body.username;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const hobby = req.body.hobby;

  const updated = await UserBio.update(
    {
      first_name: first_name,
      last_name: last_name,
      hobby,
    },
    {
      where: {
        user_id: id,
      },
    }
  );

  res.json({
    message: "user data updated",
    result: updated,
    error: null,
  });
});

//DELETE: /api/v1/users/:id -> delete user
userRouter.delete("/api/v1/users/:id", async function (req, res) {
  const id = req.params.id;

  const currentUser = await User.findOne({
    where: {
      id: id,
    },
  });

  if (!currentUser) {
    res.status(404);
    res.json({
      message: "error when delete user with id",
      result: null,
      error: "user id is not found",
    });

    return;
  }

  if (currentUser !== "PLAYER") {
    res.status(400);
    res.json({
      message: "error when get user data",
      result: null,
      error: "only PLAYER role can be deleted",
    });

    return;
  }

  await UserBio.destroy({
    where: {
      user_id: id,
    },
  });

  await User.destroy({
    where: {
      id,
    },
  });

  res.json({
    message: "user data deleted",
    result: 1,
    error: null,
  });
});

//POST: /api/v1/users/:userId/game/:gameId --> body ()
//endpoint untuk merekam id game yang dimainkan oleh id user
userRouter.post(
  "/api/v1/users/:userId/game/:gameId",
  async function (req, res) {
    const userId = req.params.userId;
    const gameId = req.params.gameId;

    //validate if user with that id exist or not
    const currentUser = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!currentUser) {
      res.status(404);
      res.json({
        message: "logging user game history failed",
        result: null,
        error: "user id is not found",
      });
      return;
    }

    //validate if game with that id exist or not
    const currentGame = await Game.findOne({
      where: {
        id: gameId,
      },
    });

    if (!currentGame) {
      res.status(404);
      res.json({
        message: "logging user game history failed",
        result: null,
        error: "game id is not found",
      });
      return;
    }

    const score = req.body.score;

    await UserGameHistory.create({
      user_id: userId,
      game_id: gameId,
      score,
      played_at: new Date(),
    });

    res.json({
      message: "user's game recorded",
      result: 1,
      error: null,
    });
  }
);

module.exports = userRouter;
