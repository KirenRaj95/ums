const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const User = {
  async getAllUsers({ page, limit, search, permission, joined }) {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM users WHERE 1=1";
    let queryParams = [];
    let countQuery = "SELECT COUNT(*) FROM users WHERE 1=1";

    if (search) {
      queryParams.push(`%${search}%`, `%${search}%`);
      query += ` AND (name ILIKE $${queryParams.length - 1} OR email ILIKE $${
        queryParams.length
      })`;
      countQuery += ` AND (name ILIKE $${
        queryParams.length - 1
      } OR email ILIKE $${queryParams.length})`;
    }

    if (permission && permission !== "All") {
      queryParams.push(permission);
      query += ` AND permissions = $${queryParams.length}`;
      countQuery += ` AND permissions = $${queryParams.length}`;
    }

    if (joined && joined !== "Anytime") {
      let dateCondition;
      if (joined === "Last 7 days") {
        dateCondition = new Date();
        dateCondition.setDate(dateCondition.getDate() - 7);
      } else if (joined === "Last 30 days") {
        dateCondition = new Date();
        dateCondition.setDate(dateCondition.getDate() - 30);
      }

      if (dateCondition) {
        queryParams.push(dateCondition.toISOString().split("T")[0]); // Format: YYYY-MM-DD
        query += ` AND joined >= $${queryParams.length}`;
        countQuery += ` AND joined >= $${queryParams.length}`;
      }
    }

    // Add pagination
    queryParams.push(limit, offset);
    query += ` ORDER BY id ASC LIMIT $${queryParams.length - 1} OFFSET $${
      queryParams.length
    }`;

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const totalUsers = parseInt(countResult.rows[0].count);

    const result = await pool.query(query, queryParams);

    return {
      users: result.rows,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    };
  },

  async createUser({ name, email, location, joined, permissions }) {
    const result = await pool.query(
      "INSERT INTO users (name, email, location, joined, permissions) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, location, joined, permissions]
    );
    return result.rows[0];
  },

  async updateUser(id, { name, email, location, joined, permissions }) {
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2, location = $3, joined = $4, permissions = $5 WHERE id = $6 RETURNING *",
      [name, email, location, joined, permissions, id]
    );
    return result.rows.length ? result.rows[0] : null;
  },

  async deleteUser(id) {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows.length ? result.rows[0] : null;
  },
};

module.exports = User;
