export const APP_CHAIN = {
  name: "Polygon Amoy Testnet",
  chainId: 80002,
  rpcUrl: "https://rpc-amoy.polygon.technology"
};

// Cập nhật địa chỉ hợp đồng sau khi bạn deploy trên Remix
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

export const CONTRACT_READ_METHOD = "danhSachSanPham";

export const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_thongTinMoi",
        "type": "string"
      }
    ],
    "name": "capNhatTrangThai",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "thongTinMoi",
        "type": "string"
      }
    ],
    "name": "CapNhatTrangThaiMoi",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ten",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "nguoiTao",
        "type": "address"
      }
    ],
    "name": "LoHangDuocTao",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_ten",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_thongTinDauTien",
        "type": "string"
      }
    ],
    "name": "taoMoiLoHang",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "danhSachSanPham",
    "outputs": [
      {
        "internalType": "string",
        "name": "ten",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "lichSu",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "nguoiSoHuu",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "tonTai",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const PRODUCT_FIELDS = [
  { key: "ten", label: "Tên lô hàng" },
  { key: "lichSu", label: "Lịch sử truy xuất" },
  { key: "nguoiSoHuu", label: "Người sở hữu (Address)" },
  { key: "tonTai", label: "Trạng thái tồn tại" }
];
