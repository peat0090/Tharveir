const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'peat0090',
  database: 'product'
});

db.connect(err => {
  if (err) console.log('❌ เชื่อมต่อไม่สำเร็จ:', err);
  else console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('🔐 Login Attempt:', username, password); // Debug

  const query = 'SELECT * FROM admin WHERE BINARY username = ? AND BINARY password = ?';
  db.query(query, [username, password], (err, result) => {
    if (err) {
      console.error('❌ Query Error:', err);
      res.status(500).send(err);
    } else if (result.length > 0) {
      console.log('✅ Login Success:', result[0]);
      res.send({ user: result[0] });
    } else {
      console.log('❌ Login Failed');
      res.status(401).send('Login ล้มเหลว');
    }
  });
});

app.post('/api/record', (req, res) => {
  const { employee_code, product_code, product_name, quantity, action } = req.body;

  db.query(
    'INSERT INTO history (employee_code, product_code, product_name, quantity, action) VALUES (?, ?, ?, ?, ?)',
    [employee_code, product_code, product_name, quantity, action],
    (err) => {
      if (err) return res.status(500).send(err);

      db.query(
        'INSERT INTO inventory (product_code, product_name, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
        [product_code, product_name, quantity, quantity],
        (err) => {
          if (err) res.status(500).send(err);
          else res.send('✅ บันทึกสำเร็จ');
        }
      );
    }
  );
});

// 🟢 เปิด API บนทุก IP ของเครื่อง (มือถือจะเรียกผ่านได้)
app.listen(3001, '0.0.0.0', () => {
  console.log('🚀 API พร้อมใช้งานที่ http://192.168.1.105:3001');
});


// node server.js for start backend 