# Tempo Testnet DEX Demo (Uniswap V2 Fork)

这是一个基于 Uniswap V2 修改的去中心化交易所 (DEX) 示例项目，专为 **Tempo Testnet** 构建。包含完整的智能合约部署脚本和基于 React + Wagmi 的前端界面。

## 🌟 功能总览（前端标签）
- **Swap**：代币兑换（默认 LIB ↔ libUSD，可在代码中配置其他代币）。
- **Liquidity**：添加/移除流动性。
- **Faucet**：一键领取 LIB / libUSD，附官方 Gas 水龙头入口（Tempo 需要 USD 作 Gas）。
- **Create**：一键发行自定义 ERC20（基于 TokenCreator）。
- **NFT**：铸造自定义 tokenURI 的 NFT（基于 MyNFT）。
- **Batch**：稳定币一对多转账，支持批量地址、批量金额（先 Approve 再 Send）。

## 📌 已部署合约（Tempo Testnet）
如需替换，请更新 `frontend/src/config.ts`：
- Router：`0xBB8B71E95396C01EB1cA9425624552F5134B830d`
- LIB Token：`0x0F9c2A163cD81c96f5bf4cCba2Eb0C437251e478`
- libUSD：`0x9d5bd1F10b6410a23EB90F0F8782bdDaE7ff9cac`
- Faucet：`0x8ea2dDD9DD550d500B4cef4C560fE27cde37508D`
- TokenCreator：`0x8C6e78007cB0F5859cb2A5ef48e81594094b6A33`
- MyNFT：`0xD19EC609aC14757EF7DAE80f8697ab5876cb2Ae2`
- BatchTransfer：`0xb44FC4e996447F9202adB76CfBA2953F417Cc1F5`

## 📋 准备工作

在开始之前，请确保你的电脑上安装了以下软件：

1.  **Node.js** (推荐 v18 或更高版本)
2.  **Git**
3.  **MetaMask 钱包插件** (Chrome/Edge 浏览器)

---

## 🛠️ 第一步：环境配置

### 1. 克隆代码
如果你还没克隆代码，请执行：
```bash
git clone https://github.com/thursdaycapital/Tempov2-core.git
cd Tempov2-core
```

### 2. 配置 Tempo Testnet 网络
打开 MetaMask，手动添加网络：
- **Network Name**: Tempo Testnet
- **RPC URL**: `https://rpc.testnet.tempo.xyz`
- **Chain ID**: `42429`
- **Currency Symbol**: `USD`
- **Block Explorer**: `https://explore.tempo.xyz`

### 3. 安装依赖
```bash
# 安装合约依赖
npm install

# 安装前端依赖
cd frontend
npm install
cd ..
```

---

## 🚀 第二步：部署智能合约

### 1. 设置私钥
在项目根目录创建一个名为 `.env` 的文件，填入你的钱包私钥（不要带 0x 前缀）：

```properties
PRIVATE_KEY=你的私钥粘贴在这里
```

> ⚠️ **安全提示**：永远不要将包含私钥的 `.env` 文件上传到 GitHub！本项目已配置 `.gitignore` 自动忽略该文件。

### 2. 领取测试币 (Faucet)
确保你的钱包里有 Tempo USD 作为 Gas 费。
你可以通过项目自带的命令领取，或者在前端页面连接钱包后领取。

### 3. 执行部署
运行以下命令将合约部署到 Tempo 测试网：

```bash
npx hardhat run scripts/deploy.js --network tempo_testnet
```

### 4. 保存合约地址
部署成功后，终端会输出类似以下信息，**请务必复制保存**：

```text
Copy these addresses to your frontend config!
{
  factory: '0x...',
  router: '0x...',
  wusd: '0x...',
  lib: '0x...',
  libUSD: '0x...'
}
```

---

## 💻 第三步：启动前端界面

### 1. 配置前端地址
打开文件 `frontend/src/config.ts`，将上一步得到的地址填入对应位置：

```typescript
export const DEPLOYED_ADDRESSES = {
  ROUTER: "0x...",   // 填入 router 地址
  LIB_TOKEN: "0x...", // 填入 lib 地址
  LIB_USD: "0x..."    // 填入 libUSD 地址
};
```

### 2. 启动网页
```bash
cd frontend
npm run dev
```

终端会显示一个链接（通常是 `http://127.0.0.1:3000` 或其他端口），在浏览器中打开它。

---

## 📱 使用指南

1.  **连接钱包**：点击右上角 "Connect Wallet"。
2.  **领取测试代币**：
    - 点击 "Faucet" 标签页。
    - 点击 "Mint 1000 LIB" 和 "Mint 1000 libUSD"。
    - 如果 Gas 不足，点击同页的官方水龙头链接领取 Tempo USD。
3.  **添加流动性**：
    - 点击 "Liquidity" 标签页。
    - 输入 LIB 和 libUSD 的数量（例如各 100）。
    - 依次点击 "Approve LIB" -> "Approve libUSD" -> "Add Liquidity"。
4.  **交易 (Swap)**：
    - 点击 "Swap" 标签页。
    - 输入想卖出的 LIB 数量。
    - 点击 "Swap" 完成交易。
5.  **创建代币 (Create)**：
    - 填写 Name / Symbol / 初始供应，点击 Create Token。
    - 新代币地址会在终端/Explorer 中可查，前端如需使用可写入 `config.ts` 或在代码中自定义。
6.  **铸造 NFT (NFT)**：
    - 粘贴 tokenURI（如 https://.../metadata.json），点击 Mint NFT。
7.  **批量转账 (Batch)**：
    - Token 填要转的 ERC20 地址（默认 libUSD）。
    - Recipients 可多行/逗号/分号分隔地址。
    - Amount per recipient 填单个收款人金额。
    - 先 **Approve**（授权总额=金额×人数），再 **Send Batch**。

---

## ❓ 常见问题

- **报错 "Insufficient funds"**：你的钱包没有足够的 Gas 费。请确保你已经领了水（Tempo Testnet 使用 USD 作为 Gas）。
- **页面显示空白或报错**：请检查控制台 (F12) 是否有错误信息，通常是合约地址配置错误。
- **Nonce too low**：重置 MetaMask 账户交易历史（设置 -> 高级 -> 重置账户）。
- **Batch 回滚**：确认钱包中余额足够且已正确执行 Approve；收款人地址长度一致、格式正确（0x 开头 40 hex）。

---

Happy Coding! 🚀
