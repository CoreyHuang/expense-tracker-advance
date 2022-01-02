# Expense Tracker
### 一個統計與分析金錢花費的網站，可以快速進行金額輸入、一般只要手動輸入金額，其他的皆可使用選取的方式輸入，當想分析或計算所花費的金額時，可依據週/月或自訂範圍來顯示目前的金額花費比例等等資訊。
### 除了單人編輯外，也可以與人共同編輯花費，而且每筆金額都需要雙方同意後才可以進行金額的登入，如輸入金額錯誤可以退回並告知對方進行修改，最終仍可進行不同日期花費的分析。

### 使用者介面([image](https://github.com/CoreyHuang/twitter-fullstack/blob/f/addReadme/twitter-wireframe.png))

---

### installation and execution(安裝與執行步驟):
#### `<安裝步驟>`
#### 1. 安裝git
#### 2. 安裝nvm (node管控工具)
#### 3. 安裝node.js與設定版本
```
nvm install 10.15.0
nvm use 10.15.0
```
#### 4. 安裝npm nodemon
```
npm install -g nodemon
```

#### `<執行步驟>`
#### 1. 使用terminal下載專案
```
git clone https://github.com/CoreyHuang/expense-tracker-advance.git
```
#### 2. 安裝npm套件(package.json)
```
npm install
```
#### 3. 環境變數設定
```
cp .env.example .env
```
#### 4. 載入種子資料(MySQL)
```
npx sequelize db:migrate
npx sequelize db:seed:all
```
#### 5. 開啟本地伺服(專案資料夾中)
```
nodemon app.js or npm run dev
```
#### 6. 執行
```
URL: http://localhost:3000/
```

### Test Account
|Account|Password|
|:-----:|:------:|
|user1|123|
|user2|1234|


### Prerequisites(環境建置與需求):
#### `<安裝需求>`
 1. git : v2.27.0.windows.1
 2. nvm : v1.1.7
 3. node : v10.15.0
 4. npm : v6.4.1
 5. nodemon : v2.0.4
#### `<npm套件>`
 1. express : v4.17.1
 2. express-handlebars : v6.0.2
 3. bcrypt : v5.0.1
 4. connect-flash : v0.1.1
 5. dotenv : v10.0.0
 6. express-session : v1.17.2
 7. passport : v0.5.2
 8. passport-local : v1.0.0
 9. mysql2 : v2.3.3
 10. sequelize : v6.12.0-beta.3
 11. sequelize-cli : v6.3.0
 12. moment : v2.29.1

