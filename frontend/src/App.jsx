import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { APP_CHAIN, CONTRACT_ADDRESS, CONTRACT_ABI } from "./config/contract";
import { 
  Search, QrCode, MapPin, Calendar, Award, Leaf, CheckCircle2, Package, Truck, 
  Store, User, LogOut, Plus, List, Eye, Sprout, BookOpen, Globe, FileText, 
  Download, Droplets, Bug, Beaker, Shield, BarChart3, Clock, AlertTriangle, Cpu 
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:5000";

// Helper to compute SHA-256 hash using native Web Crypto API
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const translations = {
  vi: {
    systemTitle: "Hệ Thống Truy Xuất Nguồn Gốc & Nhật Ký Số GlobalGAP",
    subtitle: "Giải pháp xuất khẩu nông sản đáp ứng tiêu chuẩn EVFTA & CPTPP",
    consumerRole: "Người tiêu dùng",
    farmerRole: "Nông dân / HTX",
    auditorRole: "Kiểm toán viên / Hải quan",
    consumerDesc: "Tra cứu hộ chiếu sản phẩm số (Digital Product Passport)",
    farmerDesc: "Ghi nhật ký canh tác số & chuẩn bị hồ sơ GlobalGAP",
    auditorDesc: "Kiểm tra tính toàn vẹn dữ liệu chuỗi khối, chống gian lận",
    digitalPassport: "Hộ Chiếu Sản Phẩm Số",
    digitalPassportSub: "Đáp ứng quy định xuất khẩu của Liên minh Châu Âu (EU DPP)",
    searchPlaceholder: "Nhập mã lô hàng (VD: 1)...",
    search: "Tra cứu",
    scanQR: "Quét QR",
    productInfo: "Thông tin nông sản",
    farmInfo: "Thông tin nông hộ & vùng trồng",
    certifications: "Chứng nhận quốc tế",
    fieldBook: "Nhật ký canh tác số",
    inputRecords: "Hồ sơ phân bón & bảo vệ thực vật",
    qualityTest: "Báo cáo kiểm định chất lượng",
    exportReport: "Xuất hồ sơ EVFTA (PDF)",
    logout: "Đăng xuất",
    verified: "Đã ký số mật mã trên Blockchain",
    compliant: "Đạt chuẩn xuất khẩu Châu Âu",
    networkSelector: "Mạng kết nối",
    walletConnect: "Kết nối ví MetaMask",
    walletConnected: "Đã kết nối ví",
    errorNoProduct: "Không tìm thấy lô hàng này trên hệ thống.",
    loadingData: "Đang tải dữ liệu từ blockchain..."
  },
  en: {
    systemTitle: "Agricultural Traceability & Digital Field Book",
    subtitle: "Traceability solutions for EU EVFTA & CPTPP export compliance",
    consumerRole: "Consumer",
    farmerRole: "Farmer / Cooperative",
    auditorRole: "Auditor / Customs Officer",
    consumerDesc: "Search & view Digital Product Passport (DPP)",
    farmerDesc: "Log field activities & prepare GlobalGAP documents",
    auditorDesc: "Audit blockchain data integrity and prevent fraud",
    digitalPassport: "Digital Product Passport",
    digitalPassportSub: "Compliant with EU Digital Product Passport requirements",
    searchPlaceholder: "Enter batch ID (e.g. 1)...",
    search: "Search",
    scanQR: "Scan QR",
    productInfo: "Product Details",
    farmInfo: "Cooperative & Farm Details",
    certifications: "International Certifications",
    fieldBook: "Digital Field Book",
    inputRecords: "Fertilizer & Plant Protection Log",
    qualityTest: "Quality Inspection Reports",
    exportReport: "Export EVFTA Report (PDF)",
    logout: "Logout",
    verified: "Cryptographically Signed on Blockchain",
    compliant: "EU Market Ready",
    networkSelector: "Blockchain Network",
    walletConnect: "Connect MetaMask Wallet",
    walletConnected: "Wallet Connected",
    errorNoProduct: "Batch ID not found in the ledger.",
    loadingData: "Fetching ledger records..."
  }
};

function parseBlockchainProduct(blockchainProduct) {
  if (!blockchainProduct) return null;

  // Step 1: Genesis / Gieo Trồng
  const stepPlanting = blockchainProduct.lichSuChiTiet?.find(
    (s) => s.noiDung?.giaiDoan === "Gieo Trồng"
  );
  const planting = stepPlanting ? stepPlanting.noiDung : {};

  // Step 2: Quality Inspection / Thu Hoạch & Kiểm Định
  const stepQuality = blockchainProduct.lichSuChiTiet?.find(
    (s) => s.noiDung?.giaiDoan === "Thu Hoạch & Kiểm Định"
  );
  const quality = stepQuality ? stepQuality.noiDung : null;

  // Step 3: Logistics / Vận Chuyển
  const stepLogistics = blockchainProduct.lichSuChiTiet?.find(
    (s) => s.noiDung?.giaiDoan === "Vận Chuyển"
  );
  const logistics = stepLogistics ? stepLogistics.noiDung : null;

  // Step 4: Retail / Bán Lẻ
  const stepRetail = blockchainProduct.lichSuChiTiet?.find(
    (s) => s.noiDung?.giaiDoan === "Bán Lẻ"
  );
  const retail = stepRetail ? stepRetail.noiDung : null;

  // Compile inputs lists
  const fertilizers = [];
  const pesticides = [];
  const irrigation = [];

  blockchainProduct.lichSuChiTiet?.forEach((s) => {
    const content = s.noiDung;
    if (!content) return;
    if (content.giaiDoan === "Bón Phân") {
      fertilizers.push({
        date: content.ngayBon || s.thoiGian.split("T")[0],
        name: content.tenPhanBon || "N/A",
        amount: content.lieuLuong || "N/A",
        method: content.loaiPhanBon || "N/A",
        responsible: content.nguoiThucHien || s.nguoiCapNhat
      });
    } else if (content.giaiDoan === "Phun Thuốc BVTV") {
      pesticides.push({
        date: content.ngayPhun || s.thoiGian.split("T")[0],
        name: content.tenThuoc || "N/A",
        activeIngredient: content.hoatChat || "N/A",
        amount: content.lieuLuong || "N/A",
        phi: `${content.thoiGianCachLy || 0} ngày (EU Compliant)`,
        responsible: content.nguoiThucHien || s.nguoiCapNhat
      });
    } else if (content.giaiDoan === "Tưới Nước") {
      irrigation.push({
        date: content.ngayTuoi || s.thoiGian.split("T")[0],
        duration: "N/A",
        method: content.phuongPhap || "N/A",
        waterSource: content.nguonNuoc || "N/A",
        responsible: content.nguoiThucHien || s.nguoiCapNhat
      });
    }
  });

  return {
    id: String(blockchainProduct.id),
    name: blockchainProduct.ten || "Xoài Cát Chu Xuất Khẩu",
    nameEn: planting.giong || blockchainProduct.ten || "Export Agricultural Batch",
    category: planting.giong ? `Trái cây xuất khẩu / Export Fruits` : `Nông sản tươi / Fresh Produce`,
    status: retail ? "retail" : logistics ? "shipping" : quality ? "ready_export" : "farming",
    farmer: {
      farmName: planting.nhaCungCap || "Hợp tác xã Nông nghiệp Mỹ Xương",
      farmNameEn: planting.nhaCungCap || "My Xuong Agricultural Cooperative",
      location: planting.nguonGoc || "Cao Lãnh, Đồng Tháp, Việt Nam",
      locationEn: planting.nguonGoc || "Cao Lanh District, Dong Thap Province, Vietnam",
      gpsCoordinates: planting.gps || "10.4632° N, 105.6397° E",
      contact: "+84 277 3851 234",
      area: planting.dienTich || "3.5 ha",
      certifications: planting.maChungNhan ? [planting.maChungNhan.replace("GlobalGAP #", "")] : ["GlobalGAP"],
      seedType: planting.giong || "Xoài Cát Chu Đồng Tháp",
      seedOrigin: planting.nguonGoc || "Trung tâm Giống Cây Trồng",
      plantingDate: planting.ngayGieo || "N/A",
      expectedHarvest: quality ? quality.ngayThuHoach : "Đang chăm sóc"
    },
    fieldBook: blockchainProduct.lichSuChiTiet?.map((s) => {
      let activityName = s.noiDung?.giaiDoan || "Cập nhật";
      let activityDetails = "";
      if (s.noiDung && typeof s.noiDung === "object") {
        activityDetails = Object.entries(s.noiDung)
          .filter(([key]) => key !== "giaiDoan")
          .map(([key, val]) => `${key}: ${val}`)
          .join(", ");
      } else {
        activityDetails = String(s.noiDung);
      }
      return {
        date: s.thoiGian.split("T")[0],
        activity: activityName,
        details: activityDetails,
        responsiblePerson: s.nguoiCapNhat || "Nông hộ",
        timestamp: new Date(s.thoiGian).toLocaleString("vi-VN")
      };
    }) || [],
    inputs: {
      fertilizers,
      pesticides,
      irrigation
    },
    qualityTests: quality ? {
      pesticideResidue: quality.kiemDinhMRL || "Không phát hiện (Dưới mức giới hạn < 0.01 ppm)",
      heavyMetals: "Đạt chuẩn an toàn (Pb < 0.1 mg/kg, Cd < 0.05 mg/kg)",
      microbiological: "Đạt tiêu chuẩn vi sinh (Salmonella: Không phát hiện, E.coli < 10 CFU/g)",
      testDate: quality.ngayThuHoach || "N/A",
      labName: quality.chungNhanLab || "Eurofins Sắc Ký Hải Đăng",
      labCertification: quality.maKiemDinh || "Standard ISO 17025"
    } : null,
    logistics: logistics ? {
      donVi: logistics.donViLogistics,
      phuongTien: logistics.phuongTien,
      // Data may already contain unit string (e.g. "7.8 °C") - display as-is
      nhietDo: String(logistics.nhietDo || "N/A"),
      doAm: String(logistics.doAm || "N/A"),
      xuatPhat: logistics.thoiGianKhoiHanh ? new Date(logistics.thoiGianKhoiHanh).toLocaleString("vi-VN") : "N/A",
      denNoi: logistics.thoiGianGiaoHang ? new Date(logistics.thoiGianGiaoHang).toLocaleString("vi-VN") : "N/A"
    } : null,
    retail: retail ? {
      supermarket: retail.sieuThi,
      address: retail.diaChi,
      // Data may already contain unit string (e.g. "11.5 °C")
      temp: String(retail.nhietDoKe || "N/A"),
      date: retail.ngayTiepNhan,
      status: retail.trangThai
    } : null
  };
}

export default function App() {
  const [currentRole, setCurrentRole] = useState(null);
  const [language, setLanguage] = useState("vi");
  const [activeNetwork, setActiveNetwork] = useState("local"); // local vs polygon
  const [walletAddress, setWalletAddress] = useState("");
  const [productId, setProductId] = useState("1");
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("Sẵn sàng hoạt động với Blockchain nội bộ.");
  
  // Product detailed parsed schema
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFieldBook, setShowFieldBook] = useState(false);
  
  // Raw API / Chain Data
  const [backendData, setBackendData] = useState(null);
  const [chainConfig, setChainConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Farmer state & forms
  const [farmerActiveTab, setFarmerActiveTab] = useState("overview");
  const [batches, setBatches] = useState([]);
  
  // Blockchain auditor state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationLog, setVerificationLog] = useState([]);
  const [chainVerificationStatus, setChainVerificationStatus] = useState(null); // secure, tampered, error

  // Simulated scan QR overlay
  const [isScanningQR, setIsScanningQR] = useState(false);

  // New Batch Registration form (Genesis Block)
  const [batchForm, setBatchForm] = useState({
    id: "2",
    productName: "Xoài Cát Chu Đồng Tháp",
    productNameEn: "Organic Cao Lanh Mango",
    category: "Trái cây xuất khẩu",
    farmName: "Hợp tác xã Xoài Mỹ Xương",
    farmNameEn: "My Xuong Mango Cooperative",
    location: "Mỹ Xương, Cao Lãnh, Đồng Tháp",
    locationEn: "My Xuong, Cao Lanh District, Dong Thap",
    gpsCoordinates: "10.4632° N, 105.6397° E",
    area: "3.5 ha",
    seedType: "Xoài Cát Chu",
    seedOrigin: "Trung tâm Giống Cây Trồng Miền Nam",
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvest: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    responsiblePerson: "Nông hộ Trần Văn Cường"
  });

  // Activity Append forms
  const [activityForm, setActivityForm] = useState({
    batchId: "1",
    date: new Date().toISOString().split('T')[0],
    activityType: "fertilizer",
    details: "Bón phân hữu cơ vi sinh định kỳ đợt 2 kích rễ",
    responsiblePerson: "Trần Văn Cường",
    // fertilizer
    fertilizerName: "Phân hữu cơ sinh học Komix",
    fertilizerAmount: "600 kg/ha",
    fertilizerMethod: "Broadcasting",
    // pesticide
    pesticideName: "Chế phẩm Bt trừ sâu",
    activeIngredient: "Bacillus thuringiensis spore",
    pesticideAmount: "1.5 lít/ha",
    phi: "7",
    // irrigation
    irrigationDuration: "45 phút",
    irrigationMethod: "Drip irrigation",
    waterSource: "Nguồn nước giếng khoan kiểm nghiệm an toàn sinh học",
    // harvest
    harvestQuantity: "12.5 tấn",
    harvestPacker: "Nhà đóng gói HTX Xoài Mỹ Xương",
    harvestLabCode: "MRL-2026-XC01",
    harvestResidue: "Đạt chuẩn xuất khẩu EU (Dư lượng hoạt chất bảo vệ thực vật hóa học < 0.01 ppm)",
    harvestLabName: "Trung tâm Kiểm nghiệm Eurofins Sắc Ký Hải Đăng",
    // logistics
    logisticsUnit: "Mekong Logistics Cold-Chain",
    logisticsVehicle: "Container lạnh 64C-999.88",
    logisticsTemp: "7.8",
    logisticsHumidity: "82",
    logisticsDeparture: new Date().toISOString().slice(0, 16),
    logisticsArrival: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    // retail
    retailMarket: "Lidl Supermarket - Berlin",
    retailAddress: "Karl-Liebknecht-Str. 13, 10178 Berlin, Germany",
    retailTemp: "11.5",
    retailStatus: "Đang bày bán trên kệ hàng (EVFTA Approved)"
  });

  const t = translations[language];

  useEffect(() => {
    loadConfig();
    checkIfWalletIsConnected();
    refreshBatches();
    // Auto lookup batch 1
    handleLookupWithId("1");
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/config`);
      const payload = await response.json();
      setChainConfig(payload);
    } catch (error) {
      console.warn("Chưa thể kết nối tới Backend server local:", error.message);
    }
  };

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Lỗi ví MetaMask:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert(language === "vi" ? "Vui lòng cài đặt ví MetaMask trên trình duyệt!" : "Please install MetaMask extension!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      setStatus(`Metamask wallet connected: ${accounts[0]}`);
    } catch (error) {
      setStatus("Lỗi kết nối ví: " + error.message);
    }
  };

  const refreshBatches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const payload = await response.json();
      if (payload.status === "success" && payload.products) {
        setBatches(payload.products.map(p => parseBlockchainProduct(p)));
      }
    } catch (error) {
      console.warn("Không thể tải danh sách lô hàng:", error.message);
    }
  };

  const handleLookup = async () => {
    await handleLookupWithId(productId);
  };

  const handleLookupWithId = async (targetIdStr) => {
    const targetId = Number(targetIdStr);
    if (!Number.isInteger(targetId) || targetId < 0) {
      alert(language === "vi" ? "Vui lòng nhập ID lô hàng hợp lệ." : "Please enter a valid Batch ID.");
      return;
    }

    setIsLoading(true);
    setStatus("Đang truy xuất dữ liệu từ blockchain...");
    setVerificationLog([]);
    setChainVerificationStatus(null);

    try {
      if (activeNetwork === "polygon" && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        // Read directly from Polygon Smart Contract
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const result = await contract.danhSachSanPham(targetId);
        
        if (!result || !result.tonTai) {
          throw new Error("Không tìm thấy lô hàng này trên Polygon contract.");
        }
        
        // Parse step history format
        let parsedSteps = [];
        try {
          parsedSteps = JSON.parse(result.lichSu);
        } catch (e) {
          parsedSteps = result.lichSu.split(" | ").map((text, idx) => ({
            step: idx + 1,
            noiDung: text,
            nguoiCapNhat: result.nguoiSoHuu,
            thoiGian: new Date().toISOString()
          }));
        }

        const rawProduct = {
          id: targetId,
          ten: result.ten,
          lichSuChiTiet: parsedSteps,
          nguoiSoHuu: result.nguoiSoHuu,
          tonTai: result.tonTai
        };

        const parsed = parseBlockchainProduct(rawProduct);
        setSelectedProduct(parsed);
        setBackendData(rawProduct);
        setStatus("Truy xuất dữ liệu từ Polygon Smart Contract thành công.");
      } else {
        // Fetch from Local Node.js Blockchain
        const response = await fetch(`${API_BASE_URL}/api/products/${targetId}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Không tìm thấy dữ liệu.");
        }

        const parsed = parseBlockchainProduct(payload.data);
        setSelectedProduct(parsed);
        setBackendData(payload);
        setStatus(`Truy xuất lô hàng #${targetId} thành công.`);

        // Auto populate form IDs
        setActivityForm(curr => ({ ...curr, batchId: String(targetId) }));
      }
    } catch (error) {
      setSelectedProduct(null);
      setBackendData({ status: "error", error: error.message });
      setStatus(error.message || "Lỗi truy xuất dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBatchSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("Khởi tạo lô hàng GlobalGAP mới lên blockchain...");

    try {
      const thongTinDauTien = {
        giaiDoan: "Gieo Trồng",
        giong: batchForm.seedType,
        nguonGoc: batchForm.seedOrigin,
        nhaCungCap: batchForm.farmName,
        ngayGieo: batchForm.plantingDate,
        dienTich: batchForm.area,
        maChungNhan: "GlobalGAP #GG-" + Math.floor(1000000 + Math.random() * 9000000) + "-VN"
      };

      if (activeNetwork === "polygon" && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        // Write to Polygon
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Save initial details in contract
        const initialDetailsStr = `Gieo Trồng: Giống ${batchForm.seedType}, Nguồn gốc: ${batchForm.seedOrigin}, Diện tích: ${batchForm.area}`;
        const tx = await contract.taoMoiLoHang(Number(batchForm.id), batchForm.productName, initialDetailsStr);
        setStatus(`Giao dịch đã được gửi lên Polygon. Hash: ${tx.hash}. Chờ xác nhận...`);
        await tx.wait();
        alert(`Tạo lô hàng #${batchForm.id} trên Polygon thành công!`);
      } else {
        // Write to local JS blockchain
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: batchForm.id,
            ten: batchForm.productName,
            thongTinDauTien,
            nguoiTao: batchForm.responsiblePerson
          })
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Lỗi tạo lô hàng mới.");
        }

        alert(`Tạo lô hàng thành công! Mã băm Block #${payload.minedBlock.index} đã được ghi nhận.`);
      }

      await refreshBatches();
      setFarmerActiveTab("batches");
      handleLookupWithId(batchForm.id);
    } catch (error) {
      alert("Lỗi tạo lô hàng: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActivitySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("Đang ký số và đóng gói nhật ký canh tác vào khối mới...");

    try {
      let stageType = "";
      let thongTinMoi = {};

      switch (activityForm.activityType) {
        case "fertilizer":
          stageType = "Bón Phân";
          thongTinMoi = {
            tenPhanBon: activityForm.fertilizerName,
            loaiPhanBon: activityForm.fertilizerMethod,
            lieuLuong: activityForm.fertilizerAmount,
            ngayBon: activityForm.date,
            nguoiThucHien: activityForm.responsiblePerson
          };
          break;
        case "pesticide":
          stageType = "Phun Thuốc BVTV";
          thongTinMoi = {
            tenThuoc: activityForm.pesticideName,
            hoatChat: activityForm.activeIngredient,
            lieuLuong: activityForm.pesticideAmount,
            ngayPhun: activityForm.date,
            thoiGianCachLy: Number(activityForm.phi),
            nguoiThucHien: activityForm.responsiblePerson
          };
          break;
        case "irrigation":
          stageType = "Tưới Nước";
          thongTinMoi = {
            nguonNuoc: activityForm.waterSource,
            phuongPhap: activityForm.irrigationMethod,
            ngayTuoi: activityForm.date,
            nguoiThucHien: activityForm.responsiblePerson
          };
          break;
        case "harvest":
          stageType = "Thu Hoạch & Kiểm Định";
          thongTinMoi = {
            ngayThuHoach: activityForm.date,
            sanLuong: activityForm.harvestQuantity,
            nhaDongGoi: activityForm.harvestPacker,
            maKiemDinh: activityForm.harvestLabCode,
            kiemDinhMRL: activityForm.harvestResidue,
            chungNhanLab: activityForm.harvestLabName
          };
          break;
        case "logistics":
          stageType = "Vận Chuyển";
          thongTinMoi = {
            donViLogistics: activityForm.logisticsUnit,
            phuongTien: activityForm.logisticsVehicle,
            nhietDo: activityForm.logisticsTemp,
            doAm: activityForm.logisticsHumidity,
            thoiGianKhoiHanh: activityForm.logisticsDeparture,
            thoiGianGiaoHang: activityForm.logisticsArrival
          };
          break;
        case "retail":
          stageType = "Bán Lẻ";
          thongTinMoi = {
            sieuThi: activityForm.retailMarket,
            diaChi: activityForm.retailAddress,
            nhietDoKe: activityForm.retailTemp,
            ngayTiepNhan: activityForm.date,
            trangThai: activityForm.retailStatus
          };
          break;
        default:
          stageType = "Giám sát / Kiểm tra";
          thongTinMoi = {
            ghiChu: activityForm.details,
            nguoiThucHien: activityForm.responsiblePerson
          };
      }

      thongTinMoi.giaiDoan = stageType;

      if (activeNetwork === "polygon" && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        // Write to Polygon
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        const detailsStr = `${stageType}: ${Object.entries(thongTinMoi).filter(([k]) => k !== 'giaiDoan').map(([k, v]) => `${k}=${v}`).join(", ")}`;
        const tx = await contract.capNhatTrangThai(Number(activityForm.batchId), detailsStr);
        setStatus(`Đang cập nhật lên Polygon... Hash: ${tx.hash}`);
        await tx.wait();
        alert(`Ghi nhận nhật ký [${stageType}] lên Polygon thành công!`);
      } else {
        // Write to Local JS
        const response = await fetch(`${API_BASE_URL}/api/products/${activityForm.batchId}/updates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            thongTinMoi,
            nguoiCapNhat: activityForm.responsiblePerson
          })
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Lỗi cập nhật nhật ký.");
        }

        alert(`✓ Nhật ký [${stageType}] được đóng gói và ký mã hóa thành công!`);
      }

      await refreshBatches();
      setFarmerActiveTab("batches");
      handleLookupWithId(activityForm.batchId);
    } catch (error) {
      alert("Lỗi ghi nhật ký: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyBlockchain = async () => {
    try {
      setIsVerifying(true);
      setVerificationLog([]);
      setChainVerificationStatus(null);
      setStatus("Đang kết nối để kiểm toán toàn bộ sổ cái chuỗi khối...");

      const response = await fetch(`${API_BASE_URL}/api/chain`);
      const payload = await response.json();
      const blocks = payload.chain;

      let logs = [];
      let isChainSecure = true;

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        
        // Reconstruct string to hash: index + prevHash + stringify(data) + timestamp + nonce
        const blockString = `${block.index}${block.prevHash}${JSON.stringify(block.data)}${block.timestamp}${block.nonce}`;
        const computedHash = await sha256(blockString);

        // Verification checks
        const isHashValid = computedHash === block.hash;
        let isPrevHashMatch = true;

        if (i > 0) {
          isPrevHashMatch = block.prevHash === blocks[i - 1].hash;
        }

        const isBlockSecure = isHashValid && isPrevHashMatch;
        if (!isBlockSecure) {
          isChainSecure = false;
        }

        logs.push({
          index: block.index,
          type: block.data.type || "Genesis (Khởi tạo chuỗi)",
          data: block.data.payload || block.data,
          timestamp: block.timestamp,
          storedHash: block.hash,
          computedHash: computedHash,
          prevHash: block.prevHash,
          nonce: block.nonce,
          isHashValid,
          isPrevHashMatch,
          status: isBlockSecure
        });
      }

      setVerificationLog(logs);
      setChainVerificationStatus(isChainSecure ? "secure" : "tampered");
      setStatus(isChainSecure ? "Xác minh hoàn tất: Chuỗi khối an toàn 100%!" : "Cảnh báo: Phát hiện sai lệch mã băm!");
    } catch (error) {
      setChainVerificationStatus("error");
      setStatus("Lỗi kiểm toán: " + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleScanQR = () => {
    setIsScanningQR(true);
    setTimeout(() => {
      setIsScanningQR(false);
      setSearchValue("1");
      setProductId("1");
      handleLookupWithId("1");
    }, 1500);
  };

  const handleExportReport = () => {
    window.print();
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setSelectedProduct(null);
    setShowFieldBook(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* simulated QR scanner overlay */}
      {isScanningQR && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-sm w-full border-2 border-emerald-500 shadow-2xl relative text-center">
            <div className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer font-bold text-xl" onClick={() => setIsScanningQR(false)}>✕</div>
            <h3 className="text-white text-xl font-bold mb-2">Quét Mã QR Động</h3>
            <p className="text-gray-400 text-sm mb-6">Camera đang tìm kiếm mã QR Hộ chiếu sản phẩm số...</p>
            
            {/* Viewfinder animation */}
            <div className="relative w-64 h-64 mx-auto bg-black border-2 border-gray-700 rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-4 border border-dashed border-emerald-400/40 rounded-lg"></div>
              {/* Scan Laser */}
              <div className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_10px_#10b981] animate-[bounce_1.5s_infinite]"></div>
              <QrCode className="w-32 h-32 text-gray-800" />
            </div>
            
            <p className="text-emerald-400 font-mono text-xs mt-6 animate-pulse">CONNECTING TO LEDGER PROTOCOL...</p>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Branding */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentRole(null)}>
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-2.5 rounded-xl text-white shadow-md">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 leading-tight">AgriTrace Global</h1>
                <p className="text-xs text-gray-500 font-semibold">{t.subtitle}</p>
              </div>
            </div>

            {/* Network & Wallet Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Network Selector */}
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border">
                <Cpu className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-700 font-semibold">{t.networkSelector}:</span>
                <select
                  value={activeNetwork}
                  onChange={(e) => {
                    setActiveNetwork(e.target.value);
                    if (e.target.value === "polygon") connectWallet();
                  }}
                  className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                >
                  <option value="local">🟢 Local Blockchain</option>
                  <option value="polygon">🟣 Polygon Amoy</option>
                </select>
              </div>

              {/* Wallet Button */}
              {activeNetwork === "polygon" && (
                <button
                  onClick={connectWallet}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                    walletAddress 
                      ? "bg-purple-50 text-purple-700 border border-purple-200" 
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  {walletAddress 
                    ? `${t.walletConnected}: ${walletAddress.substring(0,6)}...${walletAddress.substring(38)}` 
                    : t.walletConnect}
                </button>
              )}

              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-colors border"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === "vi" ? "ENGLISH" : "TIẾNG VIỆT"}</span>
              </button>

              {/* Logout */}
              {currentRole && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors border border-red-100"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t.logout}
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* State / Connection Banner */}
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl mb-8 flex items-center justify-between shadow-sm no-print">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">{status}</p>
          </div>
          {chainConfig && (
            <span className="text-xs font-mono text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-full">
              Blocks: {chainConfig.blockCount} | Products: {chainConfig.productCount}
            </span>
          )}
        </div>

        {/* ROLE SELECTION LANDING PAGE */}
        {!currentRole && (
          <div className="max-w-5xl mx-auto py-8">
            <div className="text-center mb-12">
              <div className="flex justify-center gap-3 mb-6">
                <Leaf className="w-16 h-16 text-emerald-600 animate-pulse" />
                <Shield className="w-16 h-16 text-blue-600" />
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                {language === "vi" ? "Hộ Chiếu Sản Phẩm Số Nông Sản" : "Digital Product Passport Portal"}
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                {t.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Consumer card */}
              <button
                onClick={() => setCurrentRole("consumer")}
                className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1.5 border-2 border-transparent hover:border-blue-500 text-center flex flex-col items-center justify-between"
              >
                <div className="bg-blue-50 p-6 rounded-2xl mb-6">
                  <Globe className="w-14 h-14 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.consumerRole}</h3>
                <p className="text-sm text-gray-600 mb-6 flex-grow">{t.consumerDesc}</p>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                  EVFTA / CPTPP TRACE
                </span>
              </button>

              {/* Farmer card */}
              <button
                onClick={() => {
                  setCurrentRole("farmer");
                  refreshBatches();
                }}
                className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1.5 border-2 border-transparent hover:border-emerald-500 text-center flex flex-col items-center justify-between"
              >
                <div className="bg-emerald-50 p-6 rounded-2xl mb-6">
                  <BookOpen className="w-14 h-14 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.farmerRole}</h3>
                <p className="text-sm text-gray-600 mb-6 flex-grow">{t.farmerDesc}</p>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                  GLOBALGAP BOOK
                </span>
              </button>

              {/* Auditor card */}
              <button
                onClick={() => {
                  setCurrentRole("auditor");
                  verifyBlockchain();
                }}
                className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1.5 border-2 border-transparent hover:border-purple-500 text-center flex flex-col items-center justify-between"
              >
                <div className="bg-purple-50 p-6 rounded-2xl mb-6">
                  <Shield className="w-14 h-14 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.auditorRole}</h3>
                <p className="text-sm text-gray-600 mb-6 flex-grow">{t.auditorDesc}</p>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full">
                  ANTI-FRAUD AUDIT
                </span>
              </button>

            </div>
          </div>
        )}

        {/* ROLE 1: CONSUMER (DIGITAL PRODUCT PASSPORT) */}
        {currentRole === "consumer" && (
          <div className="space-y-8 role-enter">
            
            {/* Search Card */}
            <div className="bg-white rounded-3xl p-8 shadow-md border no-print">
              <div className="flex items-center gap-3 mb-6">
                <QrCode className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">{t.digitalPassport}</h2>
                  <p className="text-xs text-gray-500">{t.digitalPassportSub}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all shadow-sm text-lg"
                  />
                </div>
                <button
                  onClick={handleLookup}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors font-bold shadow-md"
                >
                  {t.search}
                </button>
                <button
                  onClick={handleScanQR}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-bold shadow-md"
                >
                  <QrCode className="w-5 h-5" />
                  {t.scanQR}
                </button>
              </div>
            </div>

            {/* Passport presentation */}
            {isLoading && (
              <div className="text-center py-16 bg-white rounded-3xl shadow border">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 font-semibold">{t.loadingData}</p>
              </div>
            )}

            {!isLoading && selectedProduct && (
              <div className="space-y-8">
                
                {/* 1. Header Banner Card */}
                <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-blue-600 rounded-3xl shadow-lg p-8 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10">
                    <Leaf className="w-80 h-80" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 relative z-10">
                    <div>
                      <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                        {selectedProduct.category}
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 leading-tight">
                        {language === "vi" ? selectedProduct.name : selectedProduct.nameEn}
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-6">
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>{t.verified}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-semibold">
                          <Shield className="w-4 h-4 text-blue-300" />
                          <span>{t.compliant}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/25 max-w-xs self-start">
                      <p className="text-xs text-white/80 uppercase font-bold tracking-widest mb-1">PRODUCT PASSPORT ID</p>
                      <p className="text-2xl font-extrabold mb-3">#{selectedProduct.id}</p>
                      {/* Real QR code pointing to this product's passport URL */}
                      <div className="bg-white rounded-xl p-2 inline-block">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/?id=${selectedProduct.id}`)}&bgcolor=ffffff&color=15803d&format=png`}
                          alt={`QR Code lô hàng #${selectedProduct.id}`}
                          width={120}
                          height={120}
                          className="rounded-lg block"
                          onError={(e) => { e.target.style.display='none'; }}
                        />
                      </div>
                      <p className="text-xs text-white/60 mt-2">Quét để xem hộ chiếu số</p>
                    </div>
                  </div>
                </div>

                {/* 2. Cooperative & Farm Info */}
                <div className="bg-white rounded-3xl shadow-md border p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{t.farmInfo}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Tên hợp tác xã / Nông hộ</p>
                        <p className="text-lg font-bold text-gray-800">
                          {language === "vi" ? selectedProduct.farmer.farmName : selectedProduct.farmer.farmNameEn}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Vị trí địa lý / Địa chỉ</p>
                        <p className="text-gray-700">
                          {language === "vi" ? selectedProduct.farmer.location : selectedProduct.farmer.locationEn}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Liên hệ hỗ trợ</p>
                        <p className="text-gray-700 font-semibold">{selectedProduct.farmer.contact}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs uppercase font-extrabold text-gray-400">Tọa độ GPS</p>
                          <p className="text-gray-800 font-mono font-bold">{selectedProduct.farmer.gpsCoordinates}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase font-extrabold text-gray-400">Diện tích vùng trồng</p>
                          <p className="text-gray-800 font-bold">{selectedProduct.farmer.area}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs uppercase font-extrabold text-gray-400">Giống cây trồng</p>
                          <p className="text-gray-800 font-bold">{selectedProduct.farmer.seedType}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase font-extrabold text-gray-400">Hạt giống xuất xứ</p>
                          <p className="text-gray-700">{selectedProduct.farmer.seedOrigin}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs uppercase font-extrabold text-gray-400">Ngày gieo hạt</p>
                          <p className="text-gray-800 font-bold">{selectedProduct.farmer.plantingDate}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase font-extrabold text-gray-400">Chứng nhận quốc tế</p>
                          <div className="flex gap-1.5 mt-1">
                            {selectedProduct.farmer.certifications.map(c => (
                              <span key={c} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold border border-emerald-100">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Fertilizers & Pesticides Log (EU Compliance) */}
                <div className="bg-white rounded-3xl shadow-md border p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{t.inputRecords}</h3>
                  </div>

                  <div className="space-y-6">
                    
                    {/* Fertilizers */}
                    <div>
                      <h4 className="font-extrabold text-gray-800 flex items-center gap-2 mb-3">
                        <Beaker className="w-5 h-5 text-emerald-600" />
                        <span>Nhật ký sử dụng phân bón (Fertilizers)</span>
                      </h4>
                      {selectedProduct.inputs.fertilizers.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Chưa ghi nhận dữ liệu bón phân.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedProduct.inputs.fertilizers.map((item, i) => (
                            <div key={i} className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-emerald-800">{item.name}</span>
                                <span className="text-xs text-gray-500 font-bold">{item.date}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>Liều lượng: <strong className="text-gray-800">{item.amount}</strong></div>
                                <div>Phương pháp: <strong className="text-gray-800">{item.method}</strong></div>
                                <div className="col-span-2">Kỹ thuật viên: <strong className="text-gray-800">{item.responsible}</strong></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pesticides */}
                    <div>
                      <h4 className="font-extrabold text-gray-800 flex items-center gap-2 mb-3">
                        <Bug className="w-5 h-5 text-orange-600" />
                        <span>Nhật ký bảo vệ thực vật & hoạt chất trừ bệnh (Pesticides)</span>
                      </h4>
                      {selectedProduct.inputs.pesticides.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Chưa phun thuốc bảo vệ thực vật sinh học.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedProduct.inputs.pesticides.map((item, i) => (
                            <div key={i} className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-orange-800">{item.name}</span>
                                <span className="text-xs text-gray-500 font-bold">{item.date}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>Hoạt chất: <strong className="text-gray-800">{item.activeIngredient}</strong></div>
                                <div>Liều lượng: <strong className="text-gray-800">{item.amount}</strong></div>
                                <div className="col-span-2 bg-white px-2 py-1 rounded border border-orange-150 text-orange-700 font-semibold mt-1">
                                  Thời gian cách ly an toàn (PHI): {item.phi}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Irrigation */}
                    <div>
                      <h4 className="font-extrabold text-gray-800 flex items-center gap-2 mb-3">
                        <Droplets className="w-5 h-5 text-blue-600" />
                        <span>Nhật ký tưới nước & kiểm định nguồn nước (Irrigation)</span>
                      </h4>
                      {selectedProduct.inputs.irrigation.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Chưa ghi nhận hoạt động tưới tiêu.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedProduct.inputs.irrigation.map((item, i) => (
                            <div key={i} className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-blue-800">{item.method}</span>
                                <span className="text-xs text-gray-500 font-bold">{item.date}</span>
                              </div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <div>Nguồn nước tưới: <strong className="text-gray-800">{item.waterSource}</strong></div>
                                <div>Kỹ thuật viên: <strong className="text-gray-800">{item.responsible}</strong></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* 4. Dynamic digital field book timeline */}
                <div className="bg-white rounded-3xl shadow-md border p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-2xl font-extrabold text-gray-900">{t.fieldBook}</h3>
                    </div>
                    <button
                      onClick={() => setShowFieldBook(!showFieldBook)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-bold text-sm border border-emerald-100"
                    >
                      <Eye className="w-4 h-4" />
                      {showFieldBook ? "Ẩn chi tiết" : "Xem chi tiết nhật ký"}
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mb-6">
                    Mọi tác vụ chăm bón được ghi sổ cái blockchain tức thì, gắn nhãn thời gian và không thể chỉnh sửa tẩy xóa.
                  </p>

                  {showFieldBook && (
                    <div className="relative border-l-2 border-emerald-200 ml-4 pl-6 space-y-6">
                      {selectedProduct.fieldBook.map((activity, index) => (
                        <div key={index} className="relative">
                          {/* dot indicator */}
                          <div className="absolute -left-9 top-1.5 bg-emerald-600 rounded-full w-5 h-5 border-4 border-white shadow-sm flex items-center justify-center"></div>
                          
                          <div className="bg-gray-50 hover:bg-gray-100/80 transition-colors p-5 rounded-2xl border border-gray-150">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                              <span className="font-extrabold text-lg text-emerald-800">{activity.activity}</span>
                              <span className="text-xs text-gray-400 font-bold bg-white px-2.5 py-1 rounded-md border shadow-sm">
                                {activity.timestamp}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{activity.details}</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3 font-semibold">
                              <User className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Báo cáo bởi: {activity.responsiblePerson}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Quality test reports */}
                {selectedProduct.qualityTests && (
                  <div className="bg-white rounded-3xl shadow-md border p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600">
                        <Award className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-gray-900">{t.qualityTest}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100">
                        <p className="text-xs uppercase font-extrabold text-purple-600 mb-1">Kiểm định dư lượng thuốc BVTV (MRL)</p>
                        <p className="text-lg font-bold text-gray-800">{selectedProduct.qualityTests.pesticideResidue}</p>
                      </div>
                      <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100">
                        <p className="text-xs uppercase font-extrabold text-purple-600 mb-1">Kiểm nghiệm kim loại nặng</p>
                        <p className="text-lg font-bold text-gray-800">{selectedProduct.qualityTests.heavyMetals}</p>
                      </div>
                      <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100">
                        <p className="text-xs uppercase font-extrabold text-purple-600 mb-1">Xét nghiệm vi sinh hại khuẩn (E.coli, Salmonella)</p>
                        <p className="text-lg font-bold text-gray-800">{selectedProduct.qualityTests.microbiological}</p>
                      </div>
                      <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100">
                        <p className="text-xs uppercase font-extrabold text-purple-600 mb-1">Ngày phân tích phòng Lab</p>
                        <p className="text-lg font-bold text-gray-800">{selectedProduct.qualityTests.testDate}</p>
                      </div>

                      <div className="md:col-span-2 border-t pt-5 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase font-extrabold text-gray-400">Phòng kiểm nghiệm chứng nhận ISO 17025</p>
                          <p className="font-bold text-gray-800">{selectedProduct.qualityTests.labName}</p>
                          <p className="text-xs text-gray-500">{selectedProduct.qualityTests.labCertification}</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-sm px-4 py-2 rounded-xl border border-emerald-200 self-start sm:self-center">
                          PASS - ĐẠT CHUẨN XUẤT KHẨU EU MRL
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Cold-chain Logistics */}
                {selectedProduct.logistics && (
                  <div className="bg-white rounded-3xl shadow-md border p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                        <Truck className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-gray-900">Chuỗi Cung Ứng & Vận Chuyển Lạnh (Cold-Chain)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Đơn vị Logistics</p>
                        <p className="text-lg font-bold text-gray-800">{selectedProduct.logistics.donVi}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Phương tiện container</p>
                        <p className="text-lg font-bold text-gray-800">{selectedProduct.logistics.phuongTien}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Nhiệt độ giám sát liên tục</p>
                        <p className="text-lg font-bold text-blue-600">{selectedProduct.logistics.nhietDo}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Độ ẩm tối ưu</p>
                        <p className="text-lg font-bold text-blue-600">{selectedProduct.logistics.doAm}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Ngày xuất phát tại cảng</p>
                        <p className="text-gray-800 font-semibold">{selectedProduct.logistics.xuatPhat}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Ngày cập cảng EU dự kiến</p>
                        <p className="text-gray-800 font-semibold">{selectedProduct.logistics.denNoi}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Retail Supermarket */}
                {selectedProduct.retail && (
                  <div className="bg-white rounded-3xl shadow-md border p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600">
                        <Store className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-gray-900">Điểm Bán Lẻ Siêu Thị (EU Retailer Shelf)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Siêu thị kệ hàng</p>
                        <p className="text-lg font-bold text-gray-800">{selectedProduct.retail.supermarket}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Địa chỉ phân phối</p>
                        <p className="text-gray-700">{selectedProduct.retail.address}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Nhiệt độ kệ trưng bày</p>
                        <p className="text-lg font-bold text-purple-600">{selectedProduct.retail.temp}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-extrabold text-gray-400">Ngày tiếp nhận siêu thị</p>
                        <p className="text-gray-800 font-semibold">{selectedProduct.retail.date}</p>
                      </div>
                      <div className="md:col-span-2 bg-emerald-50 border border-emerald-100 rounded-xl p-4 mt-2">
                        <p className="text-xs uppercase font-extrabold text-emerald-800 mb-1">Trạng thái tại điểm bán</p>
                        <p className="text-lg font-bold text-emerald-700">{selectedProduct.retail.status}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. Export Report Button */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-3xl shadow-md p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 no-print">
                  <div>
                    <h3 className="text-2xl font-extrabold mb-1">Hồ Sơ Nông Sản Số EVFTA</h3>
                    <p className="text-sm text-emerald-100">Báo cáo chứng nhận đầy đủ nguồn gốc phục vụ thông hải quan Châu Âu.</p>
                  </div>
                  <button
                    onClick={handleExportReport}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-2xl hover:bg-emerald-50 font-bold transition-all shadow-md text-lg"
                  >
                    <Download className="w-5 h-5" />
                    {t.exportReport}
                  </button>
                </div>

              </div>
            )}

            {!isLoading && !selectedProduct && (
              <div className="bg-white rounded-3xl border p-16 text-center shadow-sm">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">{t.errorNoProduct}</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">Vui lòng kiểm tra lại mã lô hàng hoặc sử dụng tính năng Quét QR để xem mẫu demo.</p>
              </div>
            )}

          </div>
        )}

        {/* ROLE 2: FARMER (DIGITAL FIELD BOOK DASHBOARD) */}
        {currentRole === "farmer" && (
          <div className="space-y-8 role-enter farmer-workspace">
            
            {/* Dashboard Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-3xl shadow-lg p-8 text-white relative farmer-hero">
              <div className="flex items-center gap-4 mb-4">
                <BookOpen className="w-10 h-10" />
                <div>
                  <h2 className="text-3xl font-extrabold">Nhật Ký Canh Tác GlobalGAP Số</h2>
                  <p className="text-emerald-100 text-sm">Cơ sở dữ liệu an toàn sinh học vùng trồng xuất khẩu</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 farmer-hero-stat">
                  <div className="text-3xl font-extrabold">{batches.length}</div>
                  <div className="text-xs text-emerald-150 uppercase tracking-widest font-semibold mt-1">Lô hàng đang gieo</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 farmer-hero-stat">
                  <div className="text-3xl font-extrabold">100%</div>
                  <div className="text-xs text-emerald-150 uppercase tracking-widest font-semibold mt-1">Mã hóa Blockchain</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 farmer-hero-stat">
                  <div className="text-3xl font-extrabold">GlobalGAP</div>
                  <div className="text-xs text-emerald-150 uppercase tracking-widest font-semibold mt-1">Tiêu chuẩn canh tác</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 farmer-hero-stat">
                  <div className="text-3xl font-extrabold">EVFTA</div>
                  <div className="text-xs text-emerald-150 uppercase tracking-widest font-semibold mt-1">Sẵn sàng xuất khẩu</div>
                </div>
              </div>
            </div>

            {/* Dashboard navigation tabs */}
            <div className="bg-white rounded-2xl shadow-sm p-2 border flex flex-wrap gap-2 workspace-tabs">
              <button
                onClick={() => setFarmerActiveTab("overview")}
                className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 workspace-tab ${
                  farmerActiveTab === "overview" ? "is-active" : ""
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Tổng quan
              </button>
              <button
                onClick={() => setFarmerActiveTab("new-batch")}
                className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 workspace-tab ${
                  farmerActiveTab === "new-batch" ? "is-active" : ""
                }`}
              >
                <Plus className="w-4 h-4" />
                Tạo lô hàng mới
              </button>
              <button
                onClick={() => setFarmerActiveTab("activity")}
                className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 workspace-tab ${
                  farmerActiveTab === "activity" ? "is-active" : ""
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Ghi nhật ký canh tác
              </button>
              <button
                onClick={() => {
                  setFarmerActiveTab("batches");
                  refreshBatches();
                }}
                className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 workspace-tab ${
                  farmerActiveTab === "batches" ? "is-active" : ""
                }`}
              >
                <List className="w-4 h-4" />
                Danh sách vùng trồng
              </button>
            </div>

            {/* FARMER TAB 1: OVERVIEW */}
            {farmerActiveTab === "overview" && (
              <div className="bg-white rounded-3xl shadow-md border p-8">
                <div className="text-center py-8">
                  <Sprout className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-extrabold text-gray-800 mb-3">Ứng dụng Nhật ký canh tác số AgriTrace</h3>
                  <p className="text-gray-500 max-w-2xl mx-auto text-base">
                    Giải pháp số hóa thay thế hoàn toàn sổ tay canh tác truyền thống và file Excel rời rạc. Tự động kiểm tra chéo tính hợp lệ và cấu trúc hồ sơ vùng trồng GlobalGAP để đẩy nhanh quy trình xuất khẩu sang Châu Âu.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                  
                  {/* GlobalGAP Box */}
                  <div className="border border-emerald-100 rounded-3xl p-6 bg-emerald-50/30">
                    <h4 className="font-extrabold text-lg text-emerald-800 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Quy chuẩn GlobalGAP & EVFTA yêu cầu gì?
                    </h4>
                    <ul className="space-y-2.5 text-sm text-gray-700 font-medium">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>Nhật ký gieo cấy rõ nguồn gốc giống, chứng nhận an toàn sinh học của hạt.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>Hồ sơ bón phân ghi nhận rõ liều lượng, chủng loại, người bón.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>Hoạt chất thuốc BVTV phải tuân thủ nghiêm ngặt thời gian cách ly (PHI) trước thu hoạch.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>Toàn bộ dữ liệu phải được lưu giữ bất biến để kiểm toán bất cứ lúc nào.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Blockchain Feature Box */}
                  <div className="border border-blue-100 rounded-3xl p-6 bg-blue-50/30">
                    <h4 className="font-extrabold text-lg text-blue-800 mb-3 flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      Tại sao cần ứng dụng Blockchain?
                    </h4>
                    <ul className="space-y-2.5 text-sm text-gray-700 font-medium">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span><strong>Chống gian lận thời gian:</strong> Mốc thời gian (timestamp) được đóng dấu mật mã bất biến.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span><strong>Không thể sửa đổi tẩy xóa:</strong> Dữ liệu đã ghi không thể sửa xóa hay thay đổi sau khi đóng block.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span><strong>Tự động ký số:</strong> Khóa mật mã ký trực tiếp từ ví Web3 làm bằng chứng xác thực pháp lý.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span><strong>Minh bạch tối đa:</strong> Khách hàng tại EU có thể tự tay chạy thuật toán xác minh chuỗi dữ liệu.</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>
            )}

            {/* FARMER TAB 2: CREATE BATCH (GENESIS BLOCK) */}
            {farmerActiveTab === "new-batch" && (
              <div className="bg-white rounded-3xl shadow-md border p-8 workspace-panel">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b workspace-panel-heading">
                  <Plus className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-2xl font-extrabold text-gray-800">Đăng Ký & Khởi Tạo Vùng Trồng Mới</h3>
                </div>

                <div className="workspace-intro">
                  Điền hồ sơ vùng trồng theo cấu trúc chuẩn để blockchain tạo genesis block rõ ràng, dễ kiểm tra và đủ dữ liệu cho bước ghi nhật ký tiếp theo.
                </div>

                <form onSubmit={handleCreateBatchSubmit} className="space-y-6 workspace-form">
                  
                  {/* Block ID */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mã số lô hàng (ID số nguyên) *</label>
                      <input
                        type="number"
                        required
                        value={batchForm.id}
                        onChange={(e) => setBatchForm({ ...batchForm, id: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tên loại nông sản (VD: Xoài Cát Chu) *</label>
                      <input
                        type="text"
                        required
                        value={batchForm.productName}
                        onChange={(e) => setBatchForm({ ...batchForm, productName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tên Tiếng Anh xuất khẩu *</label>
                      <input
                        type="text"
                        required
                        value={batchForm.productNameEn}
                        onChange={(e) => setBatchForm({ ...batchForm, productNameEn: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục xuất khẩu</label>
                      <input
                        type="text"
                        value={batchForm.category}
                        onChange={(e) => setBatchForm({ ...batchForm, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Hợp tác xã / Tên vùng trồng *</label>
                      <input
                        type="text"
                        required
                        value={batchForm.farmName}
                        onChange={(e) => setBatchForm({ ...batchForm, farmName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ trang trại / Vùng trồng *</label>
                      <input
                        type="text"
                        required
                        value={batchForm.location}
                        onChange={(e) => setBatchForm({ ...batchForm, location: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tọa độ GPS *</label>
                      <input
                        type="text"
                        required
                        value={batchForm.gpsCoordinates}
                        onChange={(e) => setBatchForm({ ...batchForm, gpsCoordinates: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Diện tích vùng trồng (ha) *</label>
                      <input
                        type="text"
                        required
                        value={batchForm.area}
                        onChange={(e) => setBatchForm({ ...batchForm, area: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Giống cây trồng sử dụng *</label>
                      <input
                        type="text"
                        required
                        value={batchForm.seedType}
                        onChange={(e) => setBatchForm({ ...batchForm, seedType: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nguồn gốc giống cây trồng *</label>
                      <input
                        type="text"
                        required
                        value={batchForm.seedOrigin}
                        onChange={(e) => setBatchForm({ ...batchForm, seedOrigin: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Ngày gieo cấy *</label>
                      <input
                        type="date"
                        required
                        value={batchForm.plantingDate}
                        onChange={(e) => setBatchForm({ ...batchForm, plantingDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Ngày thu hoạch dự kiến *</label>
                      <input
                        type="date"
                        required
                        value={batchForm.expectedHarvest}
                        onChange={(e) => setBatchForm({ ...batchForm, expectedHarvest: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Người đại diện kỹ thuật vùng trồng *</label>
                    <input
                      type="text"
                      required
                      value={batchForm.responsiblePerson}
                      onChange={(e) => setBatchForm({ ...batchForm, responsiblePerson: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 form-submit">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-md transition-all text-lg"
                    >
                      {isLoading ? "Đang xác thực & đăng ký khối..." : "Khởi Tạo Lô Hàng Lên Sổ Cái"}
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* FARMER TAB 3: LOG FIELD ACTIVITY (APPEND BLOCK) */}
            {farmerActiveTab === "activity" && (
              <div className="bg-white rounded-3xl shadow-md border p-8 workspace-panel">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b workspace-panel-heading">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-2xl font-extrabold text-gray-800">Ghi Nhật Ký Canh Tác / Nhật Ký Hành Trình</h3>
                </div>

                <div className="workspace-intro workspace-intro-accent">
                  Chọn đúng giai đoạn, rồi nhập các trường theo ngữ cảnh để nhật ký vận hành nhìn gọn, dễ đối chiếu và sát quy trình thật ngoài hiện trường.
                </div>

                <form onSubmit={handleAddActivitySubmit} className="space-y-6 workspace-form">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Chọn lô hàng cần ghi nhật ký *</label>
                      <select
                        value={activityForm.batchId}
                        onChange={(e) => setActivityForm({ ...activityForm, batchId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-gray-700"
                      >
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>#{b.id} - {b.name}</option>
                        ))}
                        {batches.length === 0 && (
                          <>
                            <option value="1">#1 - Xoài Cát Chu Cao Lãnh</option>
                            <option value="2">#2 - Mẫu nông sản xuất khẩu</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Ngày thực hiện hoạt động *</label>
                      <input
                        type="date"
                        required
                        value={activityForm.date}
                        onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Giai đoạn hoạt động *</label>
                      <select
                        value={activityForm.activityType}
                        onChange={(e) => setActivityForm({ ...activityForm, activityType: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-800"
                      >
                        <option value="fertilizer">🧪 Bón Phân (Fertilizer)</option>
                        <option value="pesticide">🐛 Phun Thuốc BVTV (Pesticides)</option>
                        <option value="irrigation">💧 Tưới Nước (Irrigation)</option>
                        <option value="harvest">📦 Thu Hoạch & Kiểm Định</option>
                        <option value="logistics">🚚 Vận Chuyển Lạnh (Logistics)</option>
                        <option value="retail">🏪 Điểm Bán Lẻ & Siêu Thị</option>
                      </select>
                    </div>
                  </div>

                  {/* CONDITIONAL SUBFORMS */}
                  
                  {/* Fertilizer */}
                  {activityForm.activityType === "fertilizer" && (
                    <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 grid grid-cols-1 md:grid-cols-3 gap-6 form-accent-section accent-emerald">
                      <div>
                        <label className="block text-sm font-bold text-emerald-800 mb-2">Tên phân bón *</label>
                        <input
                          type="text"
                          required
                          value={activityForm.fertilizerName}
                          onChange={(e) => setActivityForm({ ...activityForm, fertilizerName: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="VD: Komix hữu cơ sinh học"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-emerald-800 mb-2">Liều lượng sử dụng *</label>
                        <input
                          type="text"
                          required
                          value={activityForm.fertilizerAmount}
                          onChange={(e) => setActivityForm({ ...activityForm, fertilizerAmount: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="VD: 600 kg/ha"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-emerald-800 mb-2">Phương pháp bón *</label>
                        <select
                          value={activityForm.fertilizerMethod}
                          onChange={(e) => setActivityForm({ ...activityForm, fertilizerMethod: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="Broadcasting">Rải đều (Broadcasting)</option>
                          <option value="Fertigation">Tưới qua ống (Fertigation)</option>
                          <option value="Foliar spray">Phun qua lá (Foliar spray)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Pesticide */}
                  {activityForm.activityType === "pesticide" && (
                    <div className="bg-orange-50/40 p-6 rounded-3xl border border-orange-100 space-y-6 form-accent-section accent-orange">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-orange-850 mb-2">Tên chế phẩm bảo vệ thực vật *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.pesticideName}
                            onChange={(e) => setActivityForm({ ...activityForm, pesticideName: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
                            placeholder="VD: Chế phẩm Bt sinh học"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-orange-850 mb-2">Hoạt chất bảo vệ thực vật *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.activeIngredient}
                            onChange={(e) => setActivityForm({ ...activityForm, activeIngredient: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
                            placeholder="VD: Bacillus thuringiensis spore"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-orange-850 mb-2">Liều lượng pha chế *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.pesticideAmount}
                            onChange={(e) => setActivityForm({ ...activityForm, pesticideAmount: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
                            placeholder="VD: 1.5 lít/ha"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-orange-850 mb-2">Thời gian cách ly an toàn PHI (Ngày) *</label>
                          <input
                            type="number"
                            required
                            value={activityForm.phi}
                            onChange={(e) => setActivityForm({ ...activityForm, phi: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
                            placeholder="VD: 7"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Irrigation */}
                  {activityForm.activityType === "irrigation" && (
                    <div className="bg-blue-50/40 p-6 rounded-3xl border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-6 form-accent-section accent-blue">
                      <div>
                        <label className="block text-sm font-bold text-blue-800 mb-2">Thời lượng tưới nước *</label>
                        <input
                          type="text"
                          required
                          value={activityForm.irrigationDuration}
                          onChange={(e) => setActivityForm({ ...activityForm, irrigationDuration: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                          placeholder="VD: 45 phút"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-blue-800 mb-2">Phương pháp tưới *</label>
                        <input
                          type="text"
                          required
                          value={activityForm.irrigationMethod}
                          onChange={(e) => setActivityForm({ ...activityForm, irrigationMethod: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                          placeholder="VD: Hệ thống nhỏ giọt Israel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-blue-800 mb-2">Kiểm định nguồn nước tưới *</label>
                        <input
                          type="text"
                          required
                          value={activityForm.waterSource}
                          onChange={(e) => setActivityForm({ ...activityForm, waterSource: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                          placeholder="VD: Nước giếng khoan kiểm nghiệm định kỳ"
                        />
                      </div>
                    </div>
                  )}

                  {/* Harvest & Quality */}
                  {activityForm.activityType === "harvest" && (
                    <div className="bg-purple-50/40 p-6 rounded-3xl border border-purple-100 space-y-6 form-accent-section accent-purple">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-purple-800 mb-2">Sản lượng thu hoạch (Tấn) *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.harvestQuantity}
                            onChange={(e) => setActivityForm({ ...activityForm, harvestQuantity: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                            placeholder="VD: 12.5 tấn"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-purple-800 mb-2">Nhà đóng gói nông sản *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.harvestPacker}
                            onChange={(e) => setActivityForm({ ...activityForm, harvestPacker: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                            placeholder="VD: Nhà sơ chế HTX Mỹ Xương"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-purple-800 mb-2">Mã kiểm định chất lượng (MRL) *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.harvestLabCode}
                            onChange={(e) => setActivityForm({ ...activityForm, harvestLabCode: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                            placeholder="VD: QC-MRL-2026-XC01"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-purple-800 mb-2">Kết quả dư lượng bảo vệ thực vật *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.harvestResidue}
                            onChange={(e) => setActivityForm({ ...activityForm, harvestResidue: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                            placeholder="VD: Đạt chuẩn xuất khẩu EU (MRL < 0.01 ppm)"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-purple-800 mb-2">Chứng nhận bởi phòng thí nghiệm *</label>
                        <input
                          type="text"
                          required
                          value={activityForm.harvestLabName}
                          onChange={(e) => setActivityForm({ ...activityForm, harvestLabName: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                          placeholder="VD: Eurofins Hải Đăng"
                        />
                      </div>
                    </div>
                  )}

                  {/* Logistics */}
                  {activityForm.activityType === "logistics" && (
                    <div className="bg-blue-50/40 p-6 rounded-3xl border border-blue-100 space-y-6 form-accent-section accent-blue">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-blue-800 mb-2">Đơn vị Logistics phụ trách *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.logisticsUnit}
                            onChange={(e) => setActivityForm({ ...activityForm, logisticsUnit: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            placeholder="VD: Mekong Logistics Cold-Chain"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-blue-800 mb-2">Phương tiện & Biển số xe lạnh *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.logisticsVehicle}
                            onChange={(e) => setActivityForm({ ...activityForm, logisticsVehicle: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            placeholder="VD: Container lạnh 64C-999.88"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-blue-800 mb-2">Nhiệt độ cài đặt (°C) *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.logisticsTemp}
                            onChange={(e) => setActivityForm({ ...activityForm, logisticsTemp: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            placeholder="VD: 7.8"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-blue-800 mb-2">Độ ẩm tối ưu (%) *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.logisticsHumidity}
                            onChange={(e) => setActivityForm({ ...activityForm, logisticsHumidity: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            placeholder="VD: 82"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-blue-800 mb-2">Thời gian xuất cảng *</label>
                          <input
                            type="datetime-local"
                            required
                            value={activityForm.logisticsDeparture}
                            onChange={(e) => setActivityForm({ ...activityForm, logisticsDeparture: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-blue-800 mb-2">Thời gian giao hàng dự kiến *</label>
                          <input
                            type="datetime-local"
                            required
                            value={activityForm.logisticsArrival}
                            onChange={(e) => setActivityForm({ ...activityForm, logisticsArrival: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Retail */}
                  {activityForm.activityType === "retail" && (
                    <div className="bg-purple-50/40 p-6 rounded-3xl border border-purple-100 space-y-6 form-accent-section accent-purple">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-purple-800 mb-2">Siêu thị phân phối nhập kệ *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.retailMarket}
                            onChange={(e) => setActivityForm({ ...activityForm, retailMarket: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                            placeholder="VD: Lidl Supermarket - Berlin"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-purple-800 mb-2">Địa chỉ siêu thị bán hàng *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.retailAddress}
                            onChange={(e) => setActivityForm({ ...activityForm, retailAddress: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                            placeholder="VD: Karl-Liebknecht-Str. 13, Berlin"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-purple-800 mb-2">Nhiệt độ bảo quản tại quầy kệ *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.retailTemp}
                            onChange={(e) => setActivityForm({ ...activityForm, retailTemp: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                            placeholder="VD: 11.5"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-purple-800 mb-2">Tuyên bố phê duyệt bán lẻ *</label>
                          <input
                            type="text"
                            required
                            value={activityForm.retailStatus}
                            onChange={(e) => setActivityForm({ ...activityForm, retailStatus: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                            placeholder="VD: Đang bày bán trên kệ hàng (EVFTA Approved)"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General details and operator */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả tác vụ thực hiện *</label>
                      <textarea
                        required
                        rows={3}
                        value={activityForm.details}
                        onChange={(e) => setActivityForm({ ...activityForm, details: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="Mô tả cụ thể tác vụ, tình hình thời tiết, tình trạng sinh trưởng..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Họ tên người thực hiện (Kỹ thuật viên) *</label>
                      <input
                        type="text"
                        required
                        value={activityForm.responsiblePerson}
                        onChange={(e) => setActivityForm({ ...activityForm, responsiblePerson: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="VD: Trần Văn Cường"
                      />
                    </div>
                  </div>

                  <div className="pt-4 form-submit">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-md transition-all text-lg"
                    >
                      {isLoading ? "Đang khai thác khối nhật ký..." : "Ký Số & Ghi Nhật Ký Vào Blockchain"}
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* FARMER TAB 4: BATCHES LIST */}
            {farmerActiveTab === "batches" && (
              <div className="bg-white rounded-3xl shadow-md border p-8 workspace-panel">
                <div className="flex items-center justify-between mb-6 pb-4 border-b workspace-panel-heading">
                  <div className="flex items-center gap-2">
                    <List className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-2xl font-extrabold text-gray-800">Danh Sách Lô Hàng Canh Tác Số</h3>
                  </div>
                  <button
                    onClick={refreshBatches}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition-colors"
                  >
                    Tải lại danh sách
                  </button>
                </div>

                <div className="overflow-x-auto workspace-table-shell">
                  <table className="w-full text-left text-sm text-gray-600 border-collapse workspace-table">
                    <thead>
                      <tr className="bg-gray-50 text-gray-800 font-extrabold border-b text-xs uppercase tracking-wider">
                        <th className="p-4">Mã số ID</th>
                        <th className="p-4">Tên sản phẩm (Vi/En)</th>
                        <th className="p-4">Vùng trồng HTX</th>
                        <th className="p-4">Ngày gieo cấy</th>
                        <th className="p-4">Trạng thái chuỗi cung ứng</th>
                        <th className="p-4 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map(b => (
                        <tr key={b.id} className="border-b hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-gray-900">#{b.id}</td>
                          <td className="p-4">
                            <div className="font-bold text-gray-800">{b.name}</div>
                            <div className="text-xs text-gray-400 italic">{b.nameEn}</div>
                          </td>
                          <td className="p-4 font-semibold text-gray-700">{b.farmer.farmName}</td>
                          <td className="p-4 font-semibold text-gray-700">{b.farmer.plantingDate}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              b.status === "retail" ? "bg-purple-100 text-purple-800" :
                              b.status === "shipping" ? "bg-blue-100 text-blue-800" :
                              b.status === "ready_export" ? "bg-emerald-100 text-emerald-800" :
                              "bg-orange-100 text-orange-850"
                            }`}>
                              {b.status === "retail" ? "🏪 Đang bán lẻ ở EU" :
                               b.status === "shipping" ? "🚚 Đang vận chuyển lạnh" :
                               b.status === "ready_export" ? "📦 Đã thu hoạch & kiểm định" :
                               "🌱 Đang chăm bón"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                setProductId(b.id);
                                handleLookupWithId(b.id);
                                setCurrentRole("consumer");
                              }}
                              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors border border-emerald-100"
                            >
                              Xem hộ chiếu (DPP)
                            </button>
                          </td>
                        </tr>
                      ))}
                      {batches.length === 0 && (
                        <tr>
                          <td colSpan="6" className="p-12 text-center text-gray-500 italic">
                            Chưa có dữ liệu vùng trồng. Vui lòng chọn "Tạo lô hàng mới".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ROLE 3: BLOCKCHAIN CRYPTOGRAPHIC AUDITOR */}
        {currentRole === "auditor" && (
          <div className="space-y-8 role-enter">
            
            {/* Auditor Dashboard Stats */}
            <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-indigo-900 rounded-3xl shadow-lg p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="w-10 h-10" />
                <div>
                  <h2 className="text-3xl font-extrabold">Kiểm Toán & Xác Minh Tính Toàn Vẹn Blockchain</h2>
                  <p className="text-purple-200 text-sm">Công cụ kiểm định cấu trúc chuỗi khối chống gian lận dữ liệu nông sản xuất khẩu</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold font-mono">{chainConfig ? chainConfig.chain : "Local Blockchain"}</div>
                  <div className="text-xs text-purple-200 uppercase font-semibold mt-1">Nền tảng sổ cái</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold font-mono">{chainConfig ? chainConfig.blockCount : 0} Blocks</div>
                  <div className="text-xs text-purple-200 uppercase font-semibold mt-1">Chiều cao khối</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold font-mono">SHA-256 (3 Zeros)</div>
                  <div className="text-xs text-purple-200 uppercase font-semibold mt-1">Độ khó đào Proof-of-Work</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold font-mono">100% Immutable</div>
                  <div className="text-xs text-purple-200 uppercase font-semibold mt-1">Trạng thái bảo mật</div>
                </div>
              </div>
            </div>

            {/* Run Audit Controls */}
            <div className="bg-white rounded-3xl shadow-md border p-8 text-center">
              <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Khởi Chạy Thuật Toán Kiểm Toán Khối</h3>
              <p className="text-gray-500 max-w-xl mx-auto text-sm mb-6">
                Hệ thống sẽ tải toàn bộ chuỗi khối (Ledger Blocks) từ máy chủ, sau đó tính toán lại hàm băm SHA-256 của từng khối theo nguyên tắc: H = sha256(index + prevHash + data + timestamp + nonce) để đối chiếu trực tiếp với mã băm đã lưu trữ.
              </p>
              
              <button
                onClick={verifyBlockchain}
                disabled={isVerifying}
                className="px-8 py-4 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl font-bold transition-all shadow-md text-lg inline-flex items-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Đang kiểm toán mật mã...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Bắt Đầu Kiểm Toán Chuỗi Khối</span>
                  </>
                )}
              </button>
            </div>

            {/* Verification Status Banner */}
            {chainVerificationStatus && (
              <div className={`p-6 rounded-3xl shadow-sm border flex items-center gap-4 ${
                chainVerificationStatus === "secure" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                {chainVerificationStatus === "secure" ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <h4 className="text-xl font-extrabold">
                    {chainVerificationStatus === "secure" 
                      ? "KẾT QUẢ: KHÔNG PHÁT HIỆN SỬA ĐỔI GIAN LẬN!" 
                      : "CẢNH BÁO: CHUỖI KHỐI ĐÃ BỊ SỬA ĐỔI / GIẢ MẠO!"}
                  </h4>
                  <p className="text-sm mt-1">
                    {chainVerificationStatus === "secure" 
                      ? "100% các khối dữ liệu từ gieo trồng, bón phân đến bán lẻ đều khớp chính xác mã băm cha con (Linked Chain List). Hồ sơ nông sản số hoàn toàn tin cậy và minh bạch." 
                      : "Phát hiện sự sai lệch hàm băm lưu trữ và hàm băm tính toán tại một hoặc nhiều khối. Dữ liệu đã bị tẩy xóa hoặc thay đổi ngoài luồng trái phép!"}
                  </p>
                </div>
              </div>
            )}

            {/* Verification detailed log table */}
            {verificationLog.length > 0 && (
              <div className="bg-white rounded-3xl shadow-md border p-8">
                <h3 className="text-xl font-extrabold text-gray-800 mb-6">Nhật Ký Tính Toán Mã Băm Khối Chi Tiết</h3>
                <div className="overflow-x-auto">
                  <table className="ledger-table w-full text-left text-xs text-gray-600">
                    <thead>
                      <tr className="text-gray-700 font-extrabold text-xs uppercase tracking-wider">
                        <th className="p-4">Khối thứ</th>
                        <th className="p-4">Nhãn thời gian</th>
                        <th className="p-4">Loại sự kiện</th>
                        <th className="p-4">Mã băm lưu trữ (Sổ cái)</th>
                        <th className="p-4">Mã băm tính toán (Độc lập)</th>
                        <th className="p-4">Nonce (PoW)</th>
                        <th className="p-4 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verificationLog.map((log) => (
                        <tr
                          key={log.index}
                          className={`border-b transition-colors ${
                            log.status ? "ledger-row-secure" : "ledger-row-tampered"
                          }`}
                        >
                          <td className="p-4 font-mono font-bold text-sm text-gray-900">#Block {log.index}</td>
                          <td className="p-4 font-semibold text-gray-500">{new Date(log.timestamp).toLocaleString("vi-VN")}</td>
                          <td className="p-4 font-bold text-gray-800">{log.type}</td>
                          <td className="p-4">
                            <span className="font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded text-xs border">
                              {log.storedHash.substring(0, 14)}...
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`font-mono px-2 py-0.5 rounded text-xs border ${
                              log.isHashValid ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-red-700 bg-red-50 border-red-100"
                            }`}>
                              {log.computedHash.substring(0, 14)}...
                            </span>
                          </td>
                          <td className="p-4 font-mono text-purple-700 font-bold">{log.nonce.toLocaleString()}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                              log.status
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}>
                              {log.status ? "✓ Khớp mã băm" : "⚠️ Giả mạo!"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 px-4 border-t border-gray-850 mt-16 no-print">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-emerald-500" />
              <span className="text-white font-extrabold text-lg">AgriTrace Platform</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Hệ thống hộ chiếu sản phẩm số (DPP) & nhật ký canh tác số GlobalGAP ứng dụng công nghệ chuỗi khối chống gian lận thương mại xuất khẩu nông sản Việt Nam.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Tiêu Chuẩn Tuân Thủ</h4>
            <ul className="space-y-2 text-sm text-gray-500 font-semibold">
              <li>✓ Chuẩn canh tác GlobalGAP quốc tế</li>
              <li>✓ Hiệp định tự do thương mại EVFTA (EU)</li>
              <li>✓ Tiêu chuẩn hộ chiếu số Digital Product Passport (DPP)</li>
              <li>✓ ISO 17025 về kiểm nghiệm chất lượng phòng thí nghiệm</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Liên Hệ HTX & Kỹ Thuật</h4>
            <p className="text-sm text-gray-500">Hợp tác xã Nông nghiệp Mỹ Xương, Cao Lãnh, Đồng Tháp</p>
            <p className="text-sm text-gray-500 mt-1">Hỗ trợ kỹ thuật: support@agritrace.global</p>
            <p className="text-xs text-gray-600 mt-6 font-mono">BUILD VERSION 2.1.0 - SECURED BY BLOCkCHAIN PROTOCOL</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-900 mt-8 pt-6 text-center text-xs text-gray-600 font-semibold">
          <p>© 2026 AgriTrace Platform Việt Nam. Phát triển phục vụ nâng tầm Nông sản Việt vươn tầm Thế giới.</p>
        </div>
      </footer>
    </div>
  );
}
