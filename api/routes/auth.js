import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabaseClient";

const router = Router();

// Register route
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const allowedRoles = ["admin", "manager", "commentator"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert(
        { email, password_hash: hash, role },
        { returning: "representation" }
      );

    if (error || !data || data.length === 0) {
      return res
        .status(400)
        .json({ error: error?.message ?? "Failed to create user" });
    }

    res.json({ message: "User created", user: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, data.password_hash);
    if (!isValid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: data.id, role: data.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: data.id, email: data.email, role: data.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create default admin
router.post("/create-default-admin", async (req, res) => {
  try {
    const email = "nardos.endashaw@example.com";
    const password = "Admin123!";
    const role = "admin";

    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      return res.status(500).json({ error: existingError.message });
    }

    if (existingUser) {
      return res.json({ message: "Admin already exists", user: existingUser });
    }

    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert(
        { email, password_hash: hash, role },
        { returning: "representation" }
      );

    if (error || !data || data.length === 0) {
      return res
        .status(400)
        .json({ error: error?.message ?? "Failed to create admin" });
    }

    res.json({ message: "Default admin created", user: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
