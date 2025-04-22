const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

// Middleware
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// MySQL Database Connection
const pool = mysql.createPool({
    host: "localhost",    // MySQL server address (localhost if running locally)
    user: "root",         // MySQL username (change if using a different user)
    password: "anuj3124",         // MySQL password (replace with your password)
    database: "monkeyestates", // Your database name
    port: 3306            // Ensure MySQL is using the correct port (3306 is default)
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'LoginPage.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'RegisterP.html'));
});

// Route to handle form submission
app.post('/add-user', (req, res) => {
    const {
        fullname,
        aadhar,
        username,
        password,
        email,
        phonenumber,
        dob,
        address,
        region,
        postalcode
    } = req.body;
    console.log("Form Data:", req.body);
    
    // Ensure the date is in YYYY-MM-DD format
    const formattedDob = new Date(dob).toISOString().split("T")[0];
    const query = `
        INSERT INTO user
        (fullname, aadhar, username, password, email, phonenumber, dob, address, region, postalcode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    pool.query(
        query,
        [fullname, aadhar, username, password, email, phonenumber, formattedDob, address, region, postalcode],
       
        (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                res.status(500).send('Failed to insert data.');
                return;
            }
            res.send(`
                <html>
                    <body>
                        <h2>User Added Successfully!</h2>
                        <p>You will be redirected to login page shortly...</p>
                        <script>
                            setTimeout(function() {
                                window.location.href = '/LoginPage.html';
                            }, 2000);  // Redirect after 3 seconds
                        </script>
                    </body>
                </html>
            `);
        }
    );
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM user WHERE username = ? AND password = ?';
    pool.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).send('Failed to login.');
            return;
        }

        if (results.length > 0) {
            res.send(`
                <html>
                    <body>
                        <h2>Logged In Successfully!</h2>
                        <p>You will be redirected shortly...</p>
                        <script>
                            setTimeout(function() {
                                window.location.href = '/PropertyPage.html';
                            }, 2000);  // Redirect after 3 seconds
                        </script>
                    </body>
                </html>
            `);
        } else {
            res.status(401).send('<h1>Invalid username or password.</h1><a href="/login">Try Again</a>');
        }
    });
});

// API endpoint to fetch properties
app.get("/api/properties", (req, res) => {
    const query = "SELECT * FROM property WHERE flag_owned=0";
    pool.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching properties:", err);
            return res.status(500).send({ error: "Failed to fetch properties" });
        }
        res.json(results);
    });
});
app.get("/api/owned-properties", (req, res) => {
    console.log("Request received:", req.query); // Debugging
    const { username } = req.query;
    if (!username) {
        console.log("No username provided."); // Debugging
        return res.status(400).send("Username is required.");
    }
    console.log("Fetching properties for username:", username); // Debugging
    const query = "SELECT * FROM property WHERE username = ?";
    pool.query(query, [username], (err, results) => {
        if (err) {
            console.error("Error fetching properties:", err);
            return res.status(500).send({ error: "Failed to fetch properties" });
        }
        console.log("Properties fetched successfully:", results); // Debugging
        res.json(results);
    });
});

app.post("/submit_property", (req, res) => {
    console.log(req.body);  // Log the body to check what is being submitted

    const { pname, description, city, price, ptype, size_sqft, zip_code, username } = req.body;

    if (!pname || !description || !city || !price || !ptype || !size_sqft || !username || !zip_code) {
        return res.status(400).send({ error: "All fields are required" });
    }

    const query = `
        INSERT INTO property (pname, description, city, price, ptype, size_sqft, username, zip_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    pool.query(query, [pname, description, city, price, ptype, size_sqft, username, zip_code], (err, result) => {
        if (err) {
            console.error("Error inserting property:", err);
            return res.status(500).send({ error: "Failed to add property" });
        }

        console.log("Property inserted successfully, generating HTML file...");
        generatePropertyHTML(pname, username);  // Pass username as well

        res.send(`
          <html>
              <body>
                  <h2>Property Added Successfully!</h2>
                  <p>Your property has been added to the system. You will be redirected shortly...</p>
                  <script>
                      setTimeout(function() {
                          window.location.href = '/PropertyPage.html';  // Redirect to a different page (e.g., list of properties)
                      }, 2000);  // Redirect after 3 seconds
                  </script>
              </body>
          </html>
      `);
  });
});

// Function to generate HTML file
function generatePropertyHTML(pname) {
  console.log("Generating HTML for property with pname:", pname);

  const query = "SELECT * FROM property WHERE pname = ?";
  
  pool.query(query, [pname], (err, results) => {
      if (err) {
          console.error("Error fetching property details:", err);
          return;
      }

      if (results.length > 0) {
          const property = results[0];

          // Sanitize the property name to use as a file name
          const sanitizedPname = property.pname.replace(/[\\\/:*?"<>|]/g, '').trim();
          const fileName = `${sanitizedPname}.html`; // Use property name as the filename
          const folderPath = path.join(__dirname, "properties");

          // Create folder if it doesn't exist
          if (!fs.existsSync(folderPath)) {
              fs.mkdirSync(folderPath);
              console.log(`Created folder: ${folderPath}`);
          }

          // Create the HTML content
          const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${sanitizedPname} - Property Details</title>
              <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background-color: #e9ecef; /* Light Gray */
                  margin: 0;
                  padding: 0;
                  color: #1b4332; /* Forest Green */
              }
              header {
                  background-color: #1b4332; /* Forest Green */
                  color: #f8f5e4; /* Cream */
                  text-align: center;
                  padding: 15px;
              }
              header h1 {
                  margin: 0;
                  font-size: 2em;
              }
              .container {
                  width: 90%;
                  max-width: 900px;
                  margin: 30px auto;
                  background-color: #f8f5e4; /* Cream */
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  padding: 20px;
              }
              .property-header h2 {
                  font-size: 2rem;
                  margin-bottom: 20px;
                  color: #1b4332; /* Forest Green */
              }
              .property-info {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
              }
              .info {
                  background-color: #ffffff; /* White */
                  border-radius: 8px;
                  padding: 20px;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              .info h3 {
                  color: #1b4332; /* Forest Green */
                  margin-bottom: 10px;
                  font-size: 1.2em;
              }
              .info p {
                  font-size: 1em;
                  color: #555; /* Subtle text color */
              }
              .button {
                  display: inline-block;
                  background-color: #1b4332; /* Forest Green */
                  color: #f8f5e4; /* Cream */
                  padding: 12px 20px;
                  text-align: center;
                  text-decoration: none;
                  border-radius: 8px;
                  font-size: 1.1em;
                  margin-top: 30px;
                  transition: background-color 0.3s ease, transform 0.3s ease;
              }
              .button:hover {
                  background-color: #d4a373; /* Tan */
                  transform: scale(1.05);
              }
              .button-container {
                  display: flex;
                  justify-content: center;
                  gap: 20px;
              }
              footer {
                  background-color: #1b4332; /* Forest Green */
                  color: #f8f5e4; /* Cream */
                  text-align: center;
                  padding: 10px;
                  font-size: 0.9em;
              }
              @media (max-width: 768px) {
                  .property-info {
                      grid-template-columns: 1fr;
                  }
              }
              </style>
          </head>
          <body>

          <header>
              <h1>Monkey Estates</h1>
          </header>

          <div class="container">
              <div class="property-header">
                  <h2>PROPERTY DETAILS : ${sanitizedPname}</h2>
              </div>

              <div class="property-info">
                  <div class="info">
                      <h3>Property Name</h3>
                      <p>${property.pname}</p>
                  </div>
                  <div class="info">
                      <h3>Description</h3>
                      <p>${property.description}</p>
                  </div>
                  <div class="info">
                      <h3>City</h3>
                      <p>${property.city}</p>
                  </div>
                  <div class="info">
                      <h3>Price</h3>
                      <p>$${property.price}</p>
                  </div>
                  <div class="info">
                      <h3>Type</h3>
                      <p>${property.ptype}</p>
                  </div>
                  <div class="info">
                      <h3>Size (sqft)</h3>
                      <p>${property.size_sqft}</p>
                  </div>
                  <div class="info">
                      <h3>Owner's Username</h3>
                      <p>${property.username}</p>
                  </div>
                  <div class="info">
                      <h3>Zip Code</h3>
                      <p>${property.zip_code}</p>
                  </div>
              </div>

              <div class="button-container">
                  <a href="/PropertyPage.html" class="button">Back to Listings</a>
                  <a href="/BuyPage.html" class="button">Buy Now</a>
              </div>
          </div>

          <footer>
              <p>&copy; 2024 Monkey Estates. All Rights Reserved.</p>
          </footer>

          </body>
          </html>
          `;


          // Write the HTML content to the file
          const filePath = path.join(folderPath, fileName);
          fs.writeFile(filePath, htmlContent, (err) => {
              if (err) {
                  console.error("Error saving HTML file for property:", sanitizedPname, err);
              } else {
                  console.log(`Generated HTML file for property: ${sanitizedPname}`);
              }
          });
      } else {
          console.error("No property found for pname:", pname);
      }
  });
}

app.get('/profile', (req, res) => {
  const { username } = req.query; // Extract username from query parameters
  console.log("Received username in /profile:", username);

  if (!username) {
      res.status(400).send('Username is required.');
      return;
  }

  const query = 'SELECT * FROM user WHERE username = ?';
  pool.query(query, [username], (err, results) => {
      if (err) {
          console.error('Error querying database:', err);
          res.status(500).send('Failed to fetch user details.');
          return;
      }

      if (results.length > 0) {
          const user = results[0]; // Get the first user from the query results
        


            // Format the Date of Birth
            const dob = new Date(user.dob); // Convert to a Date object
            const formattedDob = dob.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
            
          // Dynamically generate HTML with user details
          res.send(`
              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>User Profile</title>
                  <style>
                      body {
                          font-family: 'Arial', sans-serif;
                          margin: 0;
                          padding: 0;
                          background-color: #f5f5dc; /* Cream background */
                          color: #2e4600; /* Forest green for text */
                      }
              
                      header {
                          background-color: #2e4600; /* Forest green */
                          color: #f5f5dc; /* Cream text */
                          padding: 1.5rem;
                          text-align: center;
                          position: relative;
                      }
              
                      header h1 {
                          margin: 0;
                          font-size: 2.2rem;
                          letter-spacing: 1px;
                      }
              
                      .logout-btn {
                          position: absolute;
                          top: 20px;
                          right: 20px;
                          background-color: #f5f5dc; /* Cream background */
                          color: #2e4600; /* Forest green */
                          border: none;
                          padding: 10px 15px;
                          border-radius: 5px;
                          cursor: pointer;
                          font-size: 1rem;
                          font-weight: bold;
                      }
              
                      .logout-btn:hover {
                          background-color: #d4d4b1; /* Slightly darker cream on hover */
                      }
              
                      .user-details {
                          max-width: 800px;
                          margin: 2rem auto;
                          padding: 1.5rem;
                          background-color: #fff; /* White background for contrast */
                          border-radius: 10px;
                          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                          border: 2px solid #2e4600;
                      }
              
                      .user-details p {
                          font-size: 1.2rem;
                          margin-bottom: 10px;
                      }
              
                      .user-details p strong {
                          font-weight: bold;
                      }
              
                      footer {
                          text-align: center;
                          margin-top: 2rem;
                      }
              
                      footer a {
                          background-color: #2e4600; /* Forest green */
                          color: #f5f5dc; /* Cream */
                          padding: 10px 20px;
                          border-radius: 5px;
                          text-decoration: none;
                          font-weight: bold;
                          font-size: 1.1rem;
                      }
              
                      footer a:hover {
                          background-color: #3a5a40; /* Darker green on hover */
                      }
              
                      .action-buttons {
                          display: flex;
                          justify-content: center;
                          gap: 1rem;
                          margin-top: 2rem;
                      }
              
                      .action-buttons button {
                          background-color: #2e4600; /* Forest green */
                          color: #f5f5dc; /* Cream */
                          padding: 10px 20px;
                          border: none;
                          border-radius: 5px;
                          font-size: 1.1rem;
                          cursor: pointer;
                      }
              
                      .action-buttons button:hover {
                          background-color: #3a5a40; /* Darker green on hover */
                      }
                  </style>
              </head>
              <body>
                  <header>
                      <h1>Welcome, ${user.fullname}</h1>
                      <!-- Logout Button -->
                      <button class="logout-btn" onclick="window.location.href='FirstPage.html'">Logout</button>
                  </header>
              
                  <main>
                      <div class="user-details">
                          <p><strong>Email:</strong> ${user.email}</p>
                          <p><strong>Phone:</strong> ${user.phonenumber}</p>
                           <p><strong>Date of Birth:</strong> ${formattedDob}</p>
                          <p><strong>Address:</strong> ${user.address}</p>
                          <p><strong>Region:</strong> ${user.region}</p>
                          <p><strong>Postal Code:</strong> ${user.postalcode}</p>
                      </div>
              
                      <!-- Action Buttons -->
                      <div class="action-buttons">
                          <button onclick="window.location.href='/PropertyPage.html?username=${encodeURIComponent(username)}'">Back to Property Listings</button>
                          <button onclick="window.location.href='/OwnedProperty.html?username=${encodeURIComponent(username)}'">Owned Properties</button>
                          <button onclick="window.location.href='/utilites.html?username=${encodeURIComponent(username)}'">Utilities</button>
                      </div>
                  </main>
              </body>
              </html>
              `);                
      } else {
          res.status(404).send('<h1>User not found.</h1>');
      }
  });
});

app.get("/", (req, res) => {
  res.redirect("/FirstPage.html");
});

const fs = require('fs');
const path = require('path');

app.get('/utilites.html', (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).send("Username is required to access this page.");
    }

    console.log("Received username in /utilites.html:", username); // This should now log

    // Serve the file dynamically
    fs.readFile(path.join(__dirname, 'utilites.html'), 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).send("Error loading the page.");
        }
        res.send(data); // Send the file content
    });
});

// API Endpoint to Get Maintenance Records
app.get("/getMaintenanceRecords", (req, res) => {
    const { username } = req.query;
    console.log("Received username in /getmaint:", username);
    
  if (!username) {
    return res.status(400).json({ message: "Username is required!" });
  }
  const query = "SELECT m.date,m.pid,m.issue,m.cost,m.resolved FROM maintenance m JOIN property p ON m.pid=p.pid WHERE p.username =?";  // You can adjust the query as needed
  
  pool.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error fetching maintenance records:", err);
      return res.status(500).json({ message: "Error fetching records" });
    }
    res.json(results); // Send back the fetched records
  });
});
// API Endpoint to Add Maintenance Record
app.post("/addRecord", (req, res) => {
  const { date, pid, issue, cost, resolved } = req.body; // Corrected field names

  // Validation
  if (!date || !pid || !issue || !cost || resolved === undefined) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Format the date to the desired format (YYYY-MM-DD)
  const formattedDate = new Date(date).toISOString().split('T')[0]; // Using date instead of dob

  // Check if the property ID exists
  const checkQuery = "SELECT pid FROM property WHERE pid = ?";
  pool.query(checkQuery, [pid], (err, results) => {
    if (err) {
      console.error("Error checking property ID:", err);
      return res.status(500).json({ message: "Error checking property ID." });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid property ID!" });
    }

    // Insert the new maintenance record
    const insertQuery =
      "INSERT INTO maintenance (date, pid, issue, cost, resolved) VALUES (?, ?, ?, ?, ?)";
    pool.query(insertQuery, [formattedDate, pid, issue, cost, resolved], (err, result) => {
      if (err) {
        console.error("Error inserting record:", err);
        return res.status(500).json({ message: "Error saving record." });
      }
      
      // Send back success message and inserted maintenance_id
      console.log("Inserted record with maintenance_id:", result.insertId);
      res.status(200).json({
        message: "Record added successfully!",
        maintenance_id: result.insertId, // MySQL automatically generates this ID
      });
    });
  });
});
// API Endpoint to Get Insurance Records
app.get("/getInsuranceRecords", (req, res) => {
    const { username } = req.query;
    console.log("Received username in /getInsuranceRecords:", username);

    if (!username) {
        return res.status(400).json({ message: "Username is required!" });
    }
    const query = "SELECT i.start_date, i.end_date, i.policy_number, i.pid, i.provider, i.active FROM insurance i JOIN property p ON i.pid = p.pid WHERE p.username = ?";
    
    pool.query(query, [username], (err, results) => {
        if (err) {
            console.error("Error fetching insurance records:", err);
            return res.status(500).json({ message: "Error fetching records" });
        }
        res.json(results); // Send back the fetched records
    });
});

// API Endpoint to Add Insurance Record
app.post("/addInsurance", (req, res) => {
    const { start_date, end_date, policy_number, pid, provider, active } = req.body;

    // Validation
    if (!start_date || !end_date || !policy_number || !pid || !provider || active === undefined) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // Format the dates to the desired format (YYYY-MM-DD)
    const formattedStartDate = new Date(start_date).toISOString().split("T")[0];
    const formattedEndDate = new Date(end_date).toISOString().split("T")[0];

    // Check if the property ID exists
    const checkQuery = "SELECT pid FROM property WHERE pid = ?";
    pool.query(checkQuery, [pid], (err, results) => {
        if (err) {
            console.error("Error checking property ID:", err);
            return res.status(500).json({ message: "Error checking property ID." });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: "Invalid property ID!" });
        }

        // Insert the new insurance record
        const insertQuery = "INSERT INTO insurance (start_date, end_date, policy_number, pid, provider, active) VALUES (?, ?, ?, ?, ?, ?)";
        pool.query(insertQuery, [formattedStartDate, formattedEndDate, policy_number, pid, provider, active], (err, result) => {
            if (err) {
                console.error("Error inserting record:", err);
                return res.status(500).json({ message: "Error saving record." });
            }

            // Send back success message and inserted insurance_id
            console.log("Inserted record with insurance_id:", result.insertId);
            res.status(200).json({
                message: "Insurance record added successfully!",
                insurance_id: result.insertId, // MySQL automatically generates this ID
            });
        });
    });
});



// Serve static files (e.g., HTML, CSS, JS) from the same directory
app.use(express.static(__dirname));

// Route for root "/" to serve the index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "FirstPage.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});





