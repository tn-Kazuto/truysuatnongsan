const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const STORE_DIR = path.join(__dirname, "data");
const STORE_PATH = path.join(STORE_DIR, "demo-chain.json");

function hash(message) {
  return crypto.createHash("sha256").update(message).digest("hex");
}

class Block {
  constructor(index, prevHash, data, timestamp = new Date().toISOString(), nonce = 0) {
    this.index = index;
    this.prevHash = prevHash;
    this.data = data;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return hash(
      `${this.index}${this.prevHash}${JSON.stringify(this.data)}${this.timestamp}${this.nonce}`
    );
  }

  mine(difficulty) {
    while (!this.hash.startsWith("0".repeat(difficulty))) {
      this.nonce += 1;
      this.hash = this.calculateHash();
    }
  }
}

class TraceabilityBlockchain {
  constructor(difficulty = 3) {
    this.chainName = "JavaScript Local Blockchain";
    this.mode = "demo-local-js";
    this.difficulty = difficulty;
    this.chain = [];
    this.products = {};

    this.load();

    if (this.chain.length === 0) {
      this.chain.push(new Block(0, "0".repeat(64), { type: "GENESIS_BLOCK" }));
      this.seedDemoData();
      this.persist();
    }
  }

  load() {
    if (!fs.existsSync(STORE_PATH)) {
      return;
    }

    const raw = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
    this.chainName = raw.chainName || this.chainName;
    this.mode = raw.mode || this.mode;
    this.difficulty = raw.difficulty || this.difficulty;
    this.products = raw.products || {};
    this.chain = (raw.chain || []).map((item) => {
      const block = new Block(item.index, item.prevHash, item.data, item.timestamp, item.nonce);
      block.hash = item.hash;
      return block;
    });
  }

  persist() {
    fs.mkdirSync(STORE_DIR, { recursive: true });
    fs.writeFileSync(
      STORE_PATH,
      JSON.stringify(
        {
          chainName: this.chainName,
          mode: this.mode,
          difficulty: this.difficulty,
          chain: this.chain,
          products: this.products
        },
        null,
        2
      ),
      "utf-8"
    );
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(type, payload) {
    const previousBlock = this.getLastBlock();
    const block = new Block(previousBlock.index + 1, previousBlock.hash, {
      type,
      payload
    });

    block.mine(this.difficulty);
    this.chain.push(block);
    this.persist();

    return block;
  }

  assertValidProductId(id) {
    if (!Number.isInteger(id) || id < 0) {
      throw new Error("ID lo hang phai la so nguyen khong am.");
    }
  }

  getProductRecord(id) {
    return this.products[String(id)] || null;
  }

  formatHistory(history) {
    return history
      .map(
        (item) => {
          let contentStr = "";
          if (typeof item.noiDung === "object" && item.noiDung !== null) {
            contentStr = Object.entries(item.noiDung)
              .map(([key, val]) => `${key}: ${val}`)
              .join(", ");
          } else {
            contentStr = String(item.noiDung);
          }
          return `B${item.step}: ${contentStr} (${item.nguoiCapNhat}, ${new Date(item.thoiGian).toLocaleString("vi-VN")})`;
        }
      )
      .join(" | ");
  }

  formatProduct(product) {
    return {
      id: product.id,
      ten: product.ten,
      tenSanPham: product.ten,
      biCanThiep: product.biCanThiep || false,
      tonTai: product.tonTai,
      hanhTrinh: product.hanhTrinh || [],
      lichSu: this.formatHistory(product.lichSu),
      lichSuChiTiet: product.lichSu,
      nguoiSoHuu: product.nguoiSoHuu,
      tongCapNhat: product.lichSu.length,
      blockHeight: this.chain.length - 1
    };
  }

  listProducts() {
    return Object.values(this.products).map((product) => this.formatProduct(product));
  }

  createProduct({ id, ten, thongTinDauTien, nguoiTao = "Nong ho demo" }) {
    this.assertValidProductId(id);

    if (!ten) {
      throw new Error("Can nhap ten lo hang.");
    }

    if (this.getProductRecord(id)) {
      throw new Error(`Lo hang ID ${id} da ton tai.`);
    }

    let hashDauTien = "";
    if (typeof thongTinDauTien === "string" && (thongTinDauTien.startsWith("0x") || thongTinDauTien.length === 64 || thongTinDauTien.length === 66)) {
      hashDauTien = thongTinDauTien;
    } else {
      hashDauTien = "0x" + hash(JSON.stringify(thongTinDauTien || {}));
    }

    const now = new Date().toISOString();
    const product = {
      id,
      ten,
      nguoiSoHuu: nguoiTao,
      biCanThiep: false,
      tonTai: true,
      hanhTrinh: [
        {
          tenTram: "Tram Goc (Farm)",
          maHashXacThuc: hashDauTien,
          thoiGian: now,
          diaChiVi: "0x1234567890123456789012345678901234567890"
        }
      ],
      lichSu: [
        {
          step: 1,
          noiDung: `Khoi tao lo hang voi ma hash goc: ${hashDauTien}`,
          nguoiCapNhat: nguoiTao,
          thoiGian: now
        }
      ]
    };

    this.products[String(id)] = product;
    const block = this.addBlock("CREATE_PRODUCT", {
      id,
      ten,
      hashDauTien,
      nguoiTao
    });

    return {
      product: this.formatProduct(product),
      block
    };
  }

  updateProduct({ id, thongTinMoi, nguoiCapNhat = "Don vi van chuyen demo" }) {
    this.assertValidProductId(id);

    const product = this.getProductRecord(id);

    if (!product) {
      throw new Error(`Khong tim thay lo hang ID ${id}.`);
    }

    if (!thongTinMoi) {
      throw new Error("Can nhap thong tin cap nhat moi.");
    }

    product.lichSu.push({
      step: product.lichSu.length + 1,
      noiDung: thongTinMoi,
      nguoiCapNhat,
      thoiGian: new Date().toISOString()
    });
    product.nguoiSoHuu = nguoiCapNhat;

    const block = this.addBlock("UPDATE_PRODUCT", {
      id,
      thongTinMoi,
      nguoiCapNhat
    });

    return {
      product: this.formatProduct(product),
      block
    };
  }

  quaTramTiepTheo({ id, tenTram = "Tram Tiep Theo", maHashMoi, nguoiCapNhat = "Staff Demo", diaChiVi = "0x1111111111111111111111111111111111111111" }) {
    this.assertValidProductId(id);
    const product = this.getProductRecord(id);
    if (!product) {
      throw new Error(`Khong tim thay lo hang ID ${id}.`);
    }

    if (product.biCanThiep) {
      throw new Error("Lo hang da bi khoa/dong bang do phat hien trao hang!");
    }

    if (!product.hanhTrinh) {
      product.hanhTrinh = [];
    }

    // 1. Kiểm tra đối chiếu mã băm chống tráo hàng
    const previousTramIndex = product.hanhTrinh.length - 1;
    const previousHash = product.hanhTrinh[previousTramIndex].maHashXacThuc;

    if (previousHash !== maHashMoi) {
      product.biCanThiep = true;
      
      product.lichSu.push({
        step: product.lichSu.length + 1,
        noiDung: `CANH BAO: Phat hien sai lech du lieu tai [${tenTram}]. Truoc: ${previousHash} vs Sau: ${maHashMoi}`,
        nguoiCapNhat,
        thoiGian: new Date().toISOString()
      });

      this.addBlock("CHECKPOINT_FAILED_TAMPERED", {
        id,
        tenTram,
        previousHash,
        maHashMoi,
        nguoiCapNhat
      });

      this.persist();

      throw new Error("Canh bao: Phat hien trao hang! Du lieu ma hash khong trung khop.");
    }

    // 2. Nếu khớp, ghi nhận trạm an toàn
    const checkpoint = {
      tenTram,
      maHashXacThuc: maHashMoi,
      thoiGian: new Date().toISOString(),
      diaChiVi
    };

    product.hanhTrinh.push(checkpoint);

    product.lichSu.push({
      step: product.lichSu.length + 1,
      noiDung: `Qua tram: ${tenTram} (Xac thuc trung khop)`,
      nguoiCapNhat,
      thoiGian: new Date().toISOString()
    });
    product.nguoiSoHuu = nguoiCapNhat;

    const block = this.addBlock("PASS_CHECKPOINT", {
      id,
      tenTram,
      maHashMoi,
      nguoiCapNhat
    });

    this.persist();

    return {
      product: this.formatProduct(product),
      block
    };
  }

  getHanhTrinh(id) {
    this.assertValidProductId(id);
    const product = this.getProductRecord(id);
    if (!product) {
      throw new Error(`Khong tim thay lo hang ID ${id}.`);
    }
    return product.hanhTrinh || [];
  }

  getProduct(id) {
    this.assertValidProductId(id);
    const product = this.getProductRecord(id);

    if (!product) {
      throw new Error(`Khong tim thay lo hang ID ${id}.`);
    }

    return this.formatProduct(product);
  }

  getSummary() {
    return {
      chain: this.chainName,
      mode: this.mode,
      difficulty: this.difficulty,
      blockCount: this.chain.length,
      productCount: Object.keys(this.products).length,
      latestHash: this.getLastBlock().hash,
      storage: STORE_PATH
    };
  }

  seedDemoData() {
    this.createProduct({
      id: 1,
      ten: "Xoài Cát Chu Cao Lãnh (Tiêu chuẩn EVFTA)",
      thongTinDauTien: {
        giaiDoan: "Gieo Trồng",
        giong: "Xoài Cát Chu Đồng Tháp",
        nguonGoc: "Trung tâm Giống Cây Trồng Miền Nam",
        nhaCungCap: "HTX Xoài Mỹ Xương",
        ngayGieo: "2025-10-15",
        dienTich: "3.5 ha",
        chungNhan: "GlobalGAP #GG-4056231-VN"
      },
      nguoiTao: "Nông hộ Trần Văn Cường"
    });

    this.updateProduct({
      id: 1,
      thongTinMoi: {
        giaiDoan: "Bón Phân",
        tenPhanBon: "Phân hữu cơ vi sinh Komix",
        loaiPhanBon: "Hữu cơ vi sinh",
        lieuLuong: "600 kg/ha",
        ngayBon: "2025-11-20",
        nguoiThucHien: "Trần Văn Cường"
      },
      nguoiCapNhat: "Nông hộ Trần Văn Cường"
    });

    this.updateProduct({
      id: 1,
      thongTinMoi: {
        giaiDoan: "Phun Thuốc BVTV",
        tenThuoc: "Thuốc trừ sâu sinh học Bt (Bacillus Thuringiensis)",
        hoatChat: "Bacillus thuringiensis spore",
        sauBenhHai: "Sâu đục quả quả xoài",
        lieuLuong: "1.5 lít/ha",
        ngayPhun: "2025-12-10",
        thoiGianCachLy: 7,
        ngayThuHoachAnToan: "2025-12-17",
        nguoiThucHien: "Lê Văn Bình"
      },
      nguoiCapNhat: "HTX Xoài Mỹ Xương"
    });

    this.updateProduct({
      id: 1,
      thongTinMoi: {
        giaiDoan: "Thu Hoạch & Kiểm Định",
        ngayThuHoach: "2026-04-20",
        sanLuong: "12.5 tấn",
        nhaDongGoi: "Nhà đóng gói HTX Mỹ Xương",
        maKiemDinh: "MRL-2026-XC01",
        kiemDinhMRL: "Đạt chuẩn xuất khẩu EU (Dư lượng hoạt chất hóa học < 0.01 ppm)",
        chungNhanLab: "Trung tâm Kiểm nghiệm Eurofins Sắc Ký Hải Đăng"
      },
      nguoiCapNhat: "Đại diện kiểm định GlobalGAP"
    });

    this.updateProduct({
      id: 1,
      thongTinMoi: {
        giaiDoan: "Vận Chuyển",
        donViLogistics: "Mekong Logistics Cold-Chain",
        phuongTien: "Container lạnh 64C-999.88",
        nhietDo: "7.8 °C",
        doAm: "82%",
        thoiGianKhoiHanh: "2026-04-22T09:00:00",
        thoiGianGiaoHang: "2026-05-15T14:30:00"
      },
      nguoiCapNhat: "Mekong Logistics Co."
    });

    this.updateProduct({
      id: 1,
      thongTinMoi: {
        giaiDoan: "Bán Lẻ",
        sieuThi: "Lidl Supermarket - Berlin",
        diaChi: "Karl-Liebknecht-Str. 13, 10178 Berlin, Germany",
        nhietDoKe: "11.5 °C",
        ngayTiepNhan: "2026-05-18",
        trangThai: "Đang bày bán trên kệ hàng (EVFTA Approved)"
      },
      nguoiCapNhat: "Lidl Berlin Store Manager"
    });
  }
}

module.exports = {
  TraceabilityBlockchain,
  STORE_PATH
};
