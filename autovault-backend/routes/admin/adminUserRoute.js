const express = require("express")
const router = express.Router()
const { createUser, getUsers, updateOneUser, deleteOneUser, getOneUser, getUserCount, resetPassword, sendResetLink} = require("../../controllers/admin/userManagementController")
const { isAdmin, isUser, authenticateUser } = require("../../middlewares/authenticateUser")


// --- Public Password Reset Routes ---
router.post("/request-reset", sendResetLink);
router.post("/reset-password/:token", resetPassword);


router.post(
    '/create',
    createUser
)
router.get(
    "/",
    authenticateUser,
    isAdmin,
    getUsers
)
router.put(
    "/:id",
    authenticateUser,
    isAdmin,
    updateOneUser
)
router.get(
    "/:id",
    authenticateUser,
    isAdmin,
    getOneUser
)
router.get('/count', getUserCount);

router.delete(
    "/:id",
    authenticateUser,
    isAdmin,
    deleteOneUser
)

module.exports = router