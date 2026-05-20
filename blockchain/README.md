# 📦 Blockchain — Smart Contract

## File chính
- `TruySuatNongSan.sol` — Smart contract truy xuất nguồn gốc nông sản

## Deploy bằng Remix IDE

### Bước 1: Mở Remix
Truy cập: https://remix.ethereum.org

### Bước 2: Tạo file mới
- Trong Remix, vào **File Explorer** > tạo file `TruySuatNongSan.sol`
- Paste toàn bộ nội dung từ file `TruySuatNongSan.sol` vào

### Bước 3: Compile
- Chọn tab **Solidity Compiler**
- Compiler version: `0.8.x`
- Bấm **Compile TruySuatNongSan.sol**

### Bước 4: Deploy
- Chọn tab **Deploy & Run Transactions**
- Environment: **Injected Provider - MetaMask**
- Đảm bảo MetaMask đang ở mạng **Polygon Amoy Testnet**
- Bấm **Deploy** → Xác nhận trên MetaMask

### Bước 5: Cập nhật địa chỉ contract
Sau khi deploy, copy địa chỉ contract và cập nhật vào:
- `backend/.env` → `WEB3_CONTRACT_ADDRESS=<địa_chỉ_mới>`
- `frontend/src/config/contract.js` → `CONTRACT_ADDRESS`

## Mạng: Polygon Amoy Testnet
- RPC: `https://rpc-amoy.polygon.technology`
- Chain ID: `80002`
- Symbol: `MATIC`
- Faucet nhận MATIC test: https://faucet.polygon.technology/
