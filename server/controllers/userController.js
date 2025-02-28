const User = require("../models/User");

const userController = {
  async getUsers(req, res) {
    try {
      const usersData = await User.getAllUsers(req.query);
      res.json(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  async createUser(req, res) {
    const { name, email, location, joined, permissions } = req.body;
    if (!name || !email || !location || !joined || !permissions) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const newUser = await User.createUser(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      console.error("Error adding user:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  async updateUser(req, res) {
    const { id } = req.params;
    try {
      const updatedUser = await User.updateUser(id, req.body);
      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });
      res.json(updatedUser);
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  async deleteUser(req, res) {
    const { id } = req.params;
    try {
      const deletedUser = await User.deleteUser(id);
      if (!deletedUser)
        return res.status(404).json({ error: "User not found" });
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
};

module.exports = userController;
