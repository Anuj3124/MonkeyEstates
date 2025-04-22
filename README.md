# 🐒 Monkey Estates: Real Estate Management System

Monkey Estates is a full-stack web application built using **Node.js**, **Express**, and **MySQL**. It offers a platform for managing properties, insurance, and maintenance records — ideal for real estate managers or as an academic project demonstrating backend integration with a relational database.

---

## 🧰 Features

- 🔐 User Registration & Login (with validation)
- 🏠 Add, View, and Manage Properties
- 📄 Insurance Tracking for Properties
- 🔧 Log & Track Maintenance Issues
- 📋 Unique validation on Aadhar, Email, and Phone
- 📁 Modular Project Structure

---

## 🛠️ Tech Stack

- **Node.js** – Backend runtime
- **Express.js** – Server framework
- **MySQL** – Relational database
- **MySQL2** – Node.js MySQL driver
- **HTML/CSS** – Basic frontend layout

---

## 🚀 How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/monkey-estates.git
cd monkey-estates
```

### 2. Configure Database Credentials

Open `app.js` and update the following MySQL connection:

```js
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'your_mysql_username',
  password: 'your_mysql_password',
  port: 3306,
  database: 'monkeyestates'
});
```

---

### 3. Create the Database & Tables

Run the following SQL in your MySQL server:

```sql
CREATE DATABASE monkeyestates;
USE monkeyestates;

CREATE TABLE user (
  userID INT NOT NULL AUTO_INCREMENT,
  fullname VARCHAR(200) NOT NULL,
  aadhar VARCHAR(12) NOT NULL,
  username VARCHAR(45) NOT NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phonenumber VARCHAR(15) NOT NULL,
  dob DATE NOT NULL,
  address VARCHAR(300) NOT NULL,
  region VARCHAR(45) NOT NULL,
  postalcode INT NOT NULL,
  PRIMARY KEY (username),
  UNIQUE KEY aadhar (aadhar),
  UNIQUE KEY username (username),
  UNIQUE KEY email (email),
  UNIQUE KEY phonenumber (phonenumber),
  UNIQUE KEY userID (userID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE property (
  pid INT NOT NULL AUTO_INCREMENT,
  pname VARCHAR(50) NOT NULL,
  ptype VARCHAR(20) NOT NULL,
  size_sqft DECIMAL(10,2) DEFAULT NULL,
  city VARCHAR(40) NOT NULL,
  zip_code INT DEFAULT NULL,
  price DECIMAL(15,2) DEFAULT NULL,
  description VARCHAR(150) DEFAULT NULL,
  flag_owned TINYINT(1) DEFAULT '0',
  username VARCHAR(20) DEFAULT NULL,
  PRIMARY KEY (pid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE insurance (
  insurance_id INT NOT NULL AUTO_INCREMENT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  policy_number VARCHAR(50) NOT NULL,
  pid INT NOT NULL,
  provider VARCHAR(100) DEFAULT NULL,
  active ENUM('Yes','No') DEFAULT 'Yes',
  PRIMARY KEY (insurance_id),
  UNIQUE KEY policy_number (policy_number),
  KEY insurance_ibfk_1 (pid),
  CONSTRAINT insurance_ibfk_1 FOREIGN KEY (pid) REFERENCES property (pid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE maintenance (
  maintenance_id INT NOT NULL AUTO_INCREMENT,
  date DATE NOT NULL,
  pid INT NOT NULL,
  issue TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  resolved ENUM('Yes','No') DEFAULT 'No',
  PRIMARY KEY (maintenance_id),
  KEY maintenance_ibfk_1 (pid),
  CONSTRAINT maintenance_ibfk_1 FOREIGN KEY (pid) REFERENCES property (pid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 4. Setup Project Files

- Create a folder named `properties/` in the root directory (this will store property pages).
- Install required packages:

```bash
npm install
```

### 5. Start the Server

```bash
node app.js
```

The project should now be running locally!

---

## 🙌 Credits

Developed by myself and my group as part of a database management system project. Contributions and forks are welcome!

---
