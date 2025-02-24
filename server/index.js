import "dotenv/config";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import connection from "./database.js";
import bcrypt from "bcryptjs";

const app = express();

// See https://stackoverflow.com/questions/78876691/syntaxerror-unexpected-identifier-assert-on-json-import-in-node-v22
const configPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "./simplified_geodata3.json",
);
const geojson = JSON.parse(fs.readFileSync(configPath, "utf8"));

app.set("trust proxy", 1);

// Middleware
app.use(bodyParser.json());
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(process.cwd(), "./client/build"))); // `__dirname` replacement for ESM

// Some dummy storage variables
const refreshTokens = new Set(); // Simulate refresh token storage (if required)

// Access token generation
const jwtSecretKey = process.env.JWT_SECRET || "default-secret-key";
const generateAccessToken = (email) => {
  const payload = { email };
  const options = { expiresIn: "1h" }; // Token expiration time (adjust as needed)

  return jwt.sign(payload, jwtSecretKey, options);
};

// APIs

// Welcome api
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// ZipAreas for map overlay
app.get("/api/geojson", (req, res) => {
  res.json(geojson);
});

// API endpoint to fetch data based on zip code
app.get("/api/details", (req, res) => {
  const { zipcode } = req.query;

  // Query to check get component happiness scores
  const detailsQuery = `
    SELECT 
      totalHappinessScore, 
      economicWellbeingScore, 
      familyAndRelationshipsScore, 
      physicalAndMentalWellbeingScore, 
      environmentalAndSocietalWellnessScore
    FROM ComponentHappinessScores 
    WHERE zipCode = ?; 
  `;

  connection.query(detailsQuery, [zipcode], (err, result) => {
    if (err) {
      console.error("Error fetching detailed happiness scores:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch detailed happiness scores." });
    }

    // Check that scores were found for given zip code
    if (result.length === 0) {
      return res.status(404).json({ error: "Zip code not found." });
    }

    // Return component happiness scores as JSON
    return res.status(200).json(result[0]);
  });
});

// API endpoint to fetch survey comments based on zip code
app.get("/api/comments", (req, res) => {
  const { useremail, zipcode } = req.query;

  // Query to check review_access
  const checkAccessQuery = `
    SELECT review_access 
    FROM Users 
    WHERE email = ?; 
  `;

  // Query to fetch comments
  const fetchCommentsQuery = `
    SELECT userComment, createdAT 
    FROM HappinessSurveys 
    WHERE zipCode = ?;
  `;

  // Step 1: Check if the user has review_access
  connection.query(checkAccessQuery, [useremail], (err, accessResult) => {
    if (err) {
      console.error("Error checking review access:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch comments.", reason: "unknown" });
    }

    if (accessResult[0].review_access === 0) {
      // User does not have access or does not exist
      return res.status(403).json({
        error: "User has no access to see comments from other users",
        reason: "no-access",
      });
    }

    // Step 2: Fetch user comments if access is allowed
    connection.query(fetchCommentsQuery, [zipcode], (err, commentsResult) => {
      if (err) {
        console.error("Error fetching comments:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch comments.", reason: "unknown" });
      }
      const comments = commentsResult.map((row) => row.userComment);

      // Return comments as JSON
      return res.status(200).json(comments);
    });
  });
});

// API endpoint to fetch crime statistics based on zip code
app.get("/api/crime", (req, res) => {
  const { useremail, zipcode } = req.query;

  // Query to check review_access
  const checkAccessQuery = `
    SELECT review_access 
    FROM Users 
    WHERE email = ?; 
  `;

  // Query to fetch crime statistics
  const fetchCrimesQuery = `
    SELECT
      primaryType as eventType,
      COUNT(*) as eventCount
    FROM
      CrimeEvents
    WHERE
      zipCode = ?
      AND date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    GROUP BY eventType
    HAVING eventCount > 10
    ORDER BY eventCount DESC;
  `;

  // Step 1: Check if the user has review_access
  connection.query(checkAccessQuery, [useremail], (err, accessResult) => {
    if (err) {
      console.error("Error checking review access:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch crime data.", reason: "unknown" });
    }

    if (accessResult[0].review_access === 0) {
      // User does not have access or does not exist
      return res.status(403).json({
        error: "User has no access to see crime data",
        reason: "no-access",
      });
    }

    // Step 2: Fetch crime statistics if access is allowed
    connection.query(fetchCrimesQuery, [zipcode], (err, crimesResult) => {
      if (err) {
        console.error("Error fetching crime data:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch crime data.", reason: "unknown" });
      }

      // Return crime statistics as JSON
      return res.status(200).json(crimesResult);
    });
  });
});

// Sign-In API Endpoint
app.post("/api/auth/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const query =
      "SELECT firstName, lastName, passwordHash FROM Users WHERE email = ?";
    const [results] = await connection.promise().query(query, [email]);

    if (results.length === 0) {
      console.log("No user found for email:", email);
      return res.status(401).json({ error: "User doesn't exist." });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (isMatch) {
      console.log("User authenticated:", user.firstName);
      const accessToken = generateAccessToken(email);
      refreshTokens.add(accessToken);
      res.json({
        accessToken,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } else {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ error: "Invalid email or password." });
    }
  } catch (err) {
    console.error("Error during sign-in:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Sign-Up API Endpoint
app.post("/api/auth/signup", async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({
      error: "All fields (email, firstName, lastName, password) are required.",
    });
  }

  try {
    // Check if the email already exists
    const checkQuery = "SELECT email FROM Users WHERE email = ?";
    const [existingUser] = await connection
      .promise()
      .query(checkQuery, [email]);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    // Hash the password
    const saltRounds = 10; // Number of salt rounds
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const insertQuery = `
      INSERT INTO Users (email, firstName, lastName, passwordHash, homeZipCode, createdAt)
      VALUES (?, ?, ?, ?, NULL, NOW())
    `;
    await connection
      .promise()
      .query(insertQuery, [email, firstName, lastName, hashedPassword]);
    const accessToken = generateAccessToken(email);
    refreshTokens.add(accessToken);

    console.log("User registered:", { email, firstName, lastName });
    res.json({
      message: "User registered successfully.",
      accessToken,
      firstName,
      lastName,
    });
  } catch (err) {
    console.error("Error during sign-up:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecretKey); // Replace with your secret key
    req.useremail = decoded.email; // Attach user data to the request
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

// Sign Out API
app.post("/api/auth/signout", authenticateUser, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!refreshTokens.has(token)) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  refreshTokens.delete(token); // Invalidate token
  res.json({ message: "User logged out successfully." });
});

// Survey submission API endpoint
app.post("/api/submitSurvey", authenticateUser, (req, res) => {
  const { useremail, zipCode } = req.body;
  const { zipcode, rating, comments } = zipCode; // Extract the nested fields
  console.log(useremail, zipcode, rating, comments);

  if (req.useremail !== useremail) {
    return res.status(403).json({ error: "Unauthorized access." });
  }

  // Input validation
  if (!useremail || !zipCode || !rating) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Insert survey data
  const insertSurveyQuery = `
    INSERT INTO HappinessSurveys (userEmail, zipCode, userReportedHappinessScore, userComment, createdAT)
    VALUES (?, ?, ?, ?, NOW());
  `;

  connection.query(
    insertSurveyQuery,
    [useremail, zipcode, rating, comments],
    (err, result) => {
      if (err) {
        // console.error('Error inserting survey data:', err);
        return res.status(500).json({ error: "Failed to submit survey" });
      }

      // Success response
      console.log("Survey submitted successfully");
      return res.status(200).json({ message: "Survey submitted successfully" });
    },
  );
});

app.delete("/api/auth/deleteUser", authenticateUser, (req, res) => {
  const useremail = req.useremail; // Get user email from decoded token

  console.log(useremail);

  const deleteUserQuery = "DELETE FROM Users WHERE email = ?";
  connection.query(deleteUserQuery, [useremail], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err.message);
      return res.status(500).json({ error: "Failed to delete user." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  });
});

// For admin

const ADMIN_PASSWORD = "securepassword123";
const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

const generateAdminToken = () => {
  const payload = { role: "admin" };
  const options = { expiresIn: "1h" };

  return jwt.sign(payload, jwtSecretKey, options);
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts. Please try again later.",
});

app.use("/api/adminlogin", loginLimiter);

app.post("/api/adminlogin", async (req, res) => {
  const { password } = req.body;
  if (await bcrypt.compare(password, hashedPassword)) {
    const token = generateAdminToken();
    return res.json({ success: true, token });
  }
  res.status(401).json({ success: false, message: "Unauthorized" });
});

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    if (decoded.role === "admin") {
      next();
    } else {
      return res.status(403).json({ error: "Forbidden: Admin access only." });
    }
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

app.post("/api/updatefield", authenticateAdmin, async (req, res) => {
  const { zipcode, attribute, value } = req.body;

  const allowedAttributes = [
    "population",
    "populationDensity",
    "medianAge",
    "shareOfMarried",
    "avgFamilySize",
    "unemploymentRate",
    "householdMedianIncome",
    "homeOwnershipRate",
    "medianHomeValue",
    "medianRent",
    "shareOfCollegeEducation",
    "avgCommuteTime",
  ];

  if (!zipcode || !attribute || value === undefined) {
    return res
      .status(400)
      .json({ error: "zipcode, attribute, and value are required." });
  }

  if (!allowedAttributes.includes(attribute)) {
    return res.status(400).json({ error: `Invalid attribute: ${attribute}.` });
  }

  try {
    const query = `UPDATE ZipAreas SET ${attribute} = ? WHERE zipcode = ?`;
    const [result] = await connection.promise().query(query, [value, zipcode]);

    if (result.affectedRows > 0) {
      res.json({ message: "Field updated successfully." });
    } else {
      res.status(404).json({ error: "Zipcode not found." });
    }
  } catch (err) {
    console.error("Error updating field:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/updateParameters", authenticateAdmin, async (req, res) => {
  const { targetComponentName, parameter, value } = req.body;

  const validTargetComponents = [
    "economicWellbeingScore",
    "environmentalAndSocietalWellnessScore",
    "physicalAndMentalWellbeingScore",
    "familyAndRelationshipsScore",
    "totalHappinessScore",
  ];

  const validParameters = [
    "populationParam",
    "populationDensityParam",
    "medianAgeParam",
    "shareOfMarriedParam",
    "avgFamilySizeParam",
    "unemploymentRateParam",
    "householdMedianIncomeParam",
    "homeOwnershipRateParam",
    "medianHomeValueParam",
    "medianRentParam",
    "shareOfCollegeEducationParam",
    "avgCommuteTimeParam",
    "intercept",
  ];

  if (!validTargetComponents.includes(targetComponentName)) {
    return res
      .status(400)
      .json({ error: `Invalid targetComponentName: ${targetComponentName}` });
  }

  if (!validParameters.includes(parameter)) {
    return res.status(400).json({ error: `Invalid parameter: ${parameter}` });
  }

  if (value === undefined || value === null || isNaN(value)) {
    return res.status(400).json({
      error: "Invalid value. A numeric value is required.",
    });
  }

  try {
    const query = `UPDATE RegressionParameters SET ${parameter} = ? WHERE targetComponentName = ?`;
    const [result] = await connection
      .promise()
      .query(query, [value, targetComponentName]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "No rows updated. Ensure the targetComponentName exists.",
      });
    }

    res.json({ message: `Parameter '${parameter}' updated successfully.` });
  } catch (err) {
    console.error("Error updating parameter:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post(
  "/api/recalculateHappinessIndex",
  authenticateAdmin,
  async (req, res) => {
    try {
      const [rows] = await connection
        .promise()
        .query("CALL RecalculateHappinessIndex()");

      res.json(rows[0]); // Assuming results are in the first index
    } catch (err) {
      console.error("Error executing stored procedure:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

app.post("/api/filterOutliers", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await connection.promise().query("CALL FilterOutliers()");
    res.json(rows[0]);
  } catch (err) {
    console.error("Error executing stored procedure:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/news/:zipCode", async (req, res) => {
  const { zipCode } = req.params;

  if (!zipCode || zipCode.length !== 5 || isNaN(zipCode)) {
    return res.status(400).json({ error: "Invalid ZIP Code format." });
  }

  try {
    const query = `
      SELECT title, description, url
      FROM ScrapedNews
      WHERE zipCode = ?
    `;
    const [results] = await connection.promise().query(query, [zipCode]);

    if (results.length === 0) {
      console.log("No data found for ZIP Code:", zipCode);
      return res
        .status(404)
        .json({ error: "No data available for this ZIP Code." });
    }

    console.log("Data fetched successfully for ZIP Code:", zipCode);
    res.json(results);
  } catch (err) {
    console.error("Error fetching data for ZIP Code:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/news/city/:city", async (req, res) => {
  const { city } = req.params;

  if (!city) {
    return res.status(400).json({ error: "City parameter is required." });
  }

  try {
    // Fetch ZIP codes for the city
    const zipQuery = `SELECT zipCode FROM ZipAreas WHERE city = ?`;
    const [zipResults] = await connection.promise().query(zipQuery, [city]);

    if (zipResults.length === 0) {
      console.log("No ZIP Codes found for city:", city);
      return res
        .status(404)
        .json({ error: "No ZIP Codes found for this city." });
    }

    const zipCodes = zipResults.map((row) => row.zipCode);

    // Fetch news for all ZIP codes
    const newsQuery = `
      SELECT title, description, url, zipCode
      FROM ScrapedNews
      WHERE zipCode IN (?)
    `;
    const [newsResults] = await connection
      .promise()
      .query(newsQuery, [zipCodes]);

    if (newsResults.length === 0) {
      console.log("No news found for city:", city);
      return res
        .status(404)
        .json({ error: "No news available for this city." });
    }

    console.log(`News fetched successfully for city: ${city}`);
    res.json(newsResults); // Return all news articles for the city
  } catch (err) {
    console.error("Error fetching news for city:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Routing
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "./client/build/index.html"));
});

// Use port 8080 by default, unless configured differently in Google Cloud
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App is running at: http://localhost:${port}`);
});

export default app;
