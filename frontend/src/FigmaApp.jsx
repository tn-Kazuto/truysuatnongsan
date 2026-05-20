import { useState } from 'react';
import { Search, QrCode, MapPin, Calendar, Award, Leaf, CheckCircle2, Package, Truck, Store, User, LogOut, Plus, List, Eye, Sprout, Factory, TruckIcon, ShoppingCart, Users, BookOpen, Globe, FileText, Download, Droplets, Bug, Beaker, Thermometer, Shield, BarChart3, Clock } from 'lucide-react';

const mockProduct = {
  id: "EVFTA-VN-2024-001",
  name: "Xà Lách Hữu Cơ GlobalGAP",
  nameEn: "Organic Lettuce GlobalGAP Certified",
  category: "Rau sạch / Fresh Vegetables",
  status: "ready_export",
  farmer: {
    farmName: "Nông trại Xanh Đà Lạt",
    farmNameEn: "Dalat Green Farm",
    location: "Đà Lạt, Lâm Đồng, Việt Nam",
    locationEn: "Dalat, Lam Dong Province, Vietnam",
    gpsCoordinates: "11.9404° N, 108.4583° E",
    contact: "+84 912 345 678",
    area: "5 hectares",
    certifications: ["GlobalGAP", "EU Organic", "VietGAP", "HACCP"],
    seedType: "Lactuca sativa var. capitata (Butterhead)",
    seedOrigin: "Takii Seeds, Japan - Certified Organic",
    plantingDate: "2024-04-01",
    expectedHarvest: "2024-05-15"
  },
  fieldBook: [
    {
      date: "2024-04-01",
      activity: "Land Preparation / Chuẩn bị đất",
      details: "Soil testing completed. pH: 6.5, Organic matter: 3.2%. Applied compost 2 tons/hectare",
      responsiblePerson: "Nguyễn Văn A",
      timestamp: "2024-04-01 07:00"
    },
    {
      date: "2024-04-01",
      activity: "Sowing / Gieo hạt",
      details: "Sowed organic lettuce seeds. Spacing: 25cm x 25cm. Seeds batch: TK-2024-03-ORG",
      responsiblePerson: "Trần Thị B",
      timestamp: "2024-04-01 14:30"
    },
    {
      date: "2024-04-08",
      activity: "Fertilization / Bón phân",
      details: "Applied organic fertilizer (Microbial compost 500kg/ha). NPK equivalent: 5-3-2",
      responsiblePerson: "Nguyễn Văn A",
      timestamp: "2024-04-08 08:00"
    },
    {
      date: "2024-04-15",
      activity: "Pest Monitoring / Kiểm soát sâu bệnh",
      details: "Visual inspection - No pest detected. Installed yellow sticky traps as preventive measure",
      responsiblePerson: "Phạm Văn C",
      timestamp: "2024-04-15 09:30"
    },
    {
      date: "2024-04-22",
      activity: "Irrigation / Tưới tiêu",
      details: "Drip irrigation system. Water source: Mountain spring (tested safe). Duration: 45 mins/day",
      responsiblePerson: "Lê Thị D",
      timestamp: "2024-04-22 06:00"
    },
    {
      date: "2024-05-01",
      activity: "Quality Inspection / Kiểm tra chất lượng",
      details: "Pre-harvest inspection by GlobalGAP auditor. Status: Compliant. No non-conformities",
      responsiblePerson: "GlobalGAP Inspector #VN-1234",
      timestamp: "2024-05-01 10:00"
    },
    {
      date: "2024-05-15",
      activity: "Harvest / Thu hoạch",
      details: "Morning harvest (5:00-8:00 AM). Temperature: 18°C. Immediately cooled to 4°C within 2 hours",
      responsiblePerson: "Nguyễn Văn A + Team",
      timestamp: "2024-05-15 05:00"
    }
  ],
  inputs: {
    fertilizers: [
      { date: "2024-04-08", name: "Organic Microbial Compost", amount: "500 kg/ha", method: "Broadcasting" },
      { date: "2024-04-20", name: "Liquid Organic NPK (5-3-2)", amount: "10 L/ha", method: "Fertigation" }
    ],
    pesticides: [
      { date: "2024-04-15", name: "Neem Oil (Organic)", activeIngredient: "Azadirachtin 0.15%", amount: "2 L/ha", phi: "3 days (EU compliant)" }
    ],
    irrigation: [
      { date: "2024-04-01 to 2024-05-15", duration: "45 minutes/day", method: "Drip irrigation", waterSource: "Mountain spring water (tested monthly)" }
    ]
  },
  qualityTests: {
    pesticideResidue: "Not Detected (LOD: 0.01 mg/kg) - EU MRL Compliant",
    heavyMetals: "Compliant - Pb: <0.1 mg/kg, Cd: <0.05 mg/kg, As: <0.1 mg/kg",
    microbiological: "E.coli: <10 CFU/g, Salmonella: Not detected",
    testDate: "2024-05-14",
    labName: "SGS Vietnam Testing Laboratory",
    labCertification: "ISO 17025:2017 Accredited"
  }
};

const translations = {
  vi: {
    systemTitle: "Hệ Thống Truy Xuất Nguồn Gốc",
    subtitle: "Chuẩn GlobalGAP - EVFTA - CPTPP",
    consumerRole: "Người tiêu dùng",
    farmerRole: "Nông dân / HTX",
    consumerDesc: "Tra cứu hộ chiếu sản phẩm số",
    farmerDesc: "Nhật ký canh tác số",
    digitalPassport: "Hộ chiếu Sản phẩm Số",
    digitalPassportSub: "Digital Product Passport (DPP)",
    searchPlaceholder: "Nhập mã sản phẩm hoặc quét mã QR...",
    search: "Tra cứu",
    scanQR: "Quét QR",
    productInfo: "Thông tin sản phẩm",
    farmInfo: "Thông tin trang trại",
    certifications: "Chứng nhận quốc tế",
    fieldBook: "Nhật ký Canh tác",
    inputRecords: "Hồ sơ Đầu vào",
    qualityTest: "Kiểm định Chất lượng",
    exportReport: "Xuất báo cáo EVFTA",
    logout: "Đăng xuất",
    verified: "Đã xác thực trên Blockchain",
    compliant: "Đạt chuẩn xuất khẩu EU"
  },
  en: {
    systemTitle: "Agricultural Traceability System",
    subtitle: "GlobalGAP Compliant - EVFTA - CPTPP Ready",
    consumerRole: "Consumer",
    farmerRole: "Farmer / Cooperative",
    consumerDesc: "View Digital Product Passport",
    farmerDesc: "Digital Field Book",
    digitalPassport: "Digital Product Passport",
    digitalPassportSub: "EU Regulation 2019/2020 Compliant",
    searchPlaceholder: "Enter product code or scan QR...",
    search: "Search",
    scanQR: "Scan QR",
    productInfo: "Product Information",
    farmInfo: "Farm Information",
    certifications: "International Certifications",
    fieldBook: "Digital Field Book",
    inputRecords: "Input Records",
    qualityTest: "Quality Testing",
    exportReport: "Export EVFTA Report",
    logout: "Logout",
    verified: "Verified on Blockchain",
    compliant: "EU Export Compliant"
  }
};

// Farmer Dashboard Component
function FarmerDashboard({ language }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [batches, setBatches] = useState([mockProduct]);
  const [selectedBatch, setSelectedBatch] = useState('');

  // New Batch Form
  const [batchForm, setBatchForm] = useState({
    productName: '',
    productNameEn: '',
    category: '',
    farmName: '',
    farmNameEn: '',
    location: '',
    locationEn: '',
    gpsCoordinates: '',
    area: '',
    seedType: '',
    seedOrigin: '',
    plantingDate: '',
    expectedHarvest: ''
  });

  // Activity Form
  const [activityForm, setActivityForm] = useState({
    batchId: '',
    date: new Date().toISOString().split('T')[0],
    activityType: '',
    details: '',
    detailsEn: '',
    responsiblePerson: '',
    // For fertilizers
    fertilizerName: '',
    fertilizerAmount: '',
    fertilizerMethod: '',
    // For pesticides
    pesticideName: '',
    activeIngredient: '',
    pesticideAmount: '',
    phi: '',
    // For irrigation
    irrigationDuration: '',
    irrigationMethod: '',
    waterSource: ''
  });

  const handleCreateBatch = (e) => {
    e.preventDefault();
    const newBatch = {
      id: `EVFTA-VN-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      name: batchForm.productName,
      nameEn: batchForm.productNameEn,
      category: batchForm.category,
      status: 'farming',
      farmer: {
        farmName: batchForm.farmName,
        farmNameEn: batchForm.farmNameEn,
        location: batchForm.location,
        locationEn: batchForm.locationEn,
        gpsCoordinates: batchForm.gpsCoordinates,
        area: batchForm.area,
        certifications: ['GlobalGAP', 'VietGAP'],
        seedType: batchForm.seedType,
        seedOrigin: batchForm.seedOrigin,
        plantingDate: batchForm.plantingDate,
        expectedHarvest: batchForm.expectedHarvest
      },
      fieldBook: [],
      inputs: {
        fertilizers: [],
        pesticides: [],
        irrigation: []
      }
    };
    setBatches([...batches, newBatch]);
    alert(`Tạo lô hàng thành công! Mã: ${newBatch.id}\n\nHệ thống đã lưu vào blockchain. Bắt đầu ghi nhật ký canh tác ngay.`);
    setBatchForm({
      productName: '', productNameEn: '', category: '', farmName: '', farmNameEn: '',
      location: '', locationEn: '', gpsCoordinates: '', area: '', seedType: '',
      seedOrigin: '', plantingDate: '', expectedHarvest: ''
    });
    setActiveTab('activity');
  };

  const handleAddActivity = (e) => {
    e.preventDefault();

    const batch = batches.find(b => b.id === activityForm.batchId);
    if (!batch) return;

    let activityText = '';
    let activityTextEn = '';

    switch(activityForm.activityType) {
      case 'planting':
        activityText = 'Gieo trồng / Land Preparation';
        activityTextEn = 'Sowing / Land Preparation';
        break;
      case 'fertilizer':
        activityText = 'Bón phân / Fertilization';
        activityTextEn = 'Fertilization';
        break;
      case 'pesticide':
        activityText = 'Bảo vệ thực vật / Pest Control';
        activityTextEn = 'Plant Protection / Pest Control';
        break;
      case 'irrigation':
        activityText = 'Tưới tiêu / Irrigation';
        activityTextEn = 'Irrigation';
        break;
      case 'monitoring':
        activityText = 'Giám sát / Monitoring';
        activityTextEn = 'Field Monitoring';
        break;
      case 'harvest':
        activityText = 'Thu hoạch / Harvest';
        activityTextEn = 'Harvest';
        break;
    }

    const newActivity = {
      date: activityForm.date,
      activity: activityText,
      details: activityForm.details || activityForm.detailsEn,
      responsiblePerson: activityForm.responsiblePerson,
      timestamp: new Date().toISOString()
    };

    // Update batch with new activity
    const updatedBatches = batches.map(b => {
      if (b.id === activityForm.batchId) {
        const updatedFieldBook = [...(b.fieldBook || []), newActivity];

        // Also update inputs based on activity type
        if (activityForm.activityType === 'fertilizer' && activityForm.fertilizerName) {
          b.inputs.fertilizers.push({
            date: activityForm.date,
            name: activityForm.fertilizerName,
            amount: activityForm.fertilizerAmount,
            method: activityForm.fertilizerMethod
          });
        }

        if (activityForm.activityType === 'pesticide' && activityForm.pesticideName) {
          b.inputs.pesticides.push({
            date: activityForm.date,
            name: activityForm.pesticideName,
            activeIngredient: activityForm.activeIngredient,
            amount: activityForm.pesticideAmount,
            phi: activityForm.phi
          });
        }

        if (activityForm.activityType === 'irrigation' && activityForm.irrigationDuration) {
          b.inputs.irrigation.push({
            date: activityForm.date,
            duration: activityForm.irrigationDuration,
            method: activityForm.irrigationMethod,
            waterSource: activityForm.waterSource
          });
        }

        return { ...b, fieldBook: updatedFieldBook };
      }
      return b;
    });

    setBatches(updatedBatches);
    alert('✓ Đã ghi nhật ký thành công!\n\nDữ liệu được lưu trên blockchain, tuân thủ chuẩn GlobalGAP.');

    // Reset form
    setActivityForm({
      ...activityForm,
      activityType: '',
      details: '',
      detailsEn: '',
      fertilizerName: '',
      fertilizerAmount: '',
      fertilizerMethod: '',
      pesticideName: '',
      activeIngredient: '',
      pesticideAmount: '',
      phi: '',
      irrigationDuration: '',
      irrigationMethod: '',
      waterSource: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-10 h-10" />
          <div>
            <h2 className="text-3xl font-bold">Nhật ký Canh tác Số</h2>
            <p className="text-emerald-100">Digital Field Book - GlobalGAP Compliant</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">{batches.reduce((acc, b) => acc + (b.fieldBook?.length || 0), 0)}</div>
            <div className="text-sm">Hoạt động đã ghi</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">{batches.length}</div>
            <div className="text-sm">Lô hàng đang canh tác</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">100%</div>
            <div className="text-sm">Tuân thủ GlobalGAP</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">EVFTA</div>
            <div className="text-sm">Sẵn sàng xuất khẩu</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('new-batch')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'new-batch'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Tạo lô hàng mới
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'activity'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Ghi nhật ký
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'batches'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <List className="w-5 h-5 inline mr-2" />
            Danh sách lô hàng
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-12">
            <BookOpen className="w-24 h-24 text-emerald-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Hệ thống Nhật ký Canh tác Số</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Ghi chép mọi hoạt động canh tác theo chuẩn GlobalGAP. Hệ thống tự động tạo báo cáo xuất khẩu cho EVFTA, CPTPP.
              <br />
              <strong className="text-emerald-600">Thay thế hoàn toàn sổ tay giấy và Excel rời rạc.</strong>
            </p>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8 max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h4 className="font-bold text-gray-800 mb-2">Tại sao cần Nhật ký Canh tác Số?</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>✓ <strong>EVFTA & CPTPP</strong> yêu cầu hồ sơ nông sản theo chuẩn GlobalGAP</li>
                    <li>✓ Sổ tay giấy dễ <strong>thất lạc, rách, mất dữ liệu</strong></li>
                    <li>✓ Excel rời rạc khó <strong>kiểm định quốc tế</strong></li>
                    <li>✓ Hệ thống số giúp <strong>tự động xuất báo cáo</strong> cho hải quan EU</li>
                    <li>✓ Blockchain đảm bảo <strong>không thể chỉnh sửa</strong> sau khi ghi</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-emerald-50 rounded-lg p-4">
                <Sprout className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-semibold text-sm">Gieo trồng</div>
                <div className="text-xs text-gray-600 mt-1">Land prep, sowing</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <Beaker className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-sm">Bón phân</div>
                <div className="text-xs text-gray-600 mt-1">Fertilization</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <Bug className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="font-semibold text-sm">BVTV</div>
                <div className="text-xs text-gray-600 mt-1">Pest control</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-sm">Tưới tiêu</div>
                <div className="text-xs text-gray-600 mt-1">Irrigation</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setActiveTab('new-batch')}
                className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-lg"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Tạo lô hàng mới
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                <BookOpen className="w-5 h-5 inline mr-2" />
                Ghi nhật ký ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Batch Tab */}
      {activeTab === 'new-batch' && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="w-6 h-6 text-emerald-600" />
            <h3 className="text-2xl font-bold text-gray-800">Tạo Lô Hàng Mới</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Nhập thông tin cơ bản về lô hàng. Hệ thống sẽ tự động tạo mã theo chuẩn EVFTA.
          </p>

          <form onSubmit={handleCreateBatch} className="space-y-6">
            <div className="border-b pb-6">
              <h4 className="font-bold text-gray-800 mb-4">Thông tin sản phẩm</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên sản phẩm (Tiếng Việt) *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.productName}
                    onChange={(e) => setBatchForm({...batchForm, productName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="VD: Xà lách hữu cơ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.productNameEn}
                    onChange={(e) => setBatchForm({...batchForm, productNameEn: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Organic Lettuce"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phân loại / Category *
                  </label>
                  <select
                    required
                    value={batchForm.category}
                    onChange={(e) => setBatchForm({...batchForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Chọn phân loại</option>
                    <option value="Rau sạch / Fresh Vegetables">Rau sạch / Fresh Vegetables</option>
                    <option value="Trái cây / Fruits">Trái cây / Fruits</option>
                    <option value="Củ quả / Root Vegetables">Củ quả / Root Vegetables</option>
                    <option value="Ngũ cốc / Grains">Ngũ cốc / Grains</option>
                    <option value="Gia vị / Herbs & Spices">Gia vị / Herbs & Spices</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-b pb-6">
              <h4 className="font-bold text-gray-800 mb-4">Thông tin nông trại</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên nông trại (Tiếng Việt) *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.farmName}
                    onChange={(e) => setBatchForm({...batchForm, farmName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="VD: Nông trại Xanh Đà Lạt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.farmNameEn}
                    onChange={(e) => setBatchForm({...batchForm, farmNameEn: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Dalat Green Farm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm (Tiếng Việt) *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.location}
                    onChange={(e) => setBatchForm({...batchForm, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="VD: Đà Lạt, Lâm Đồng, Việt Nam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.locationEn}
                    onChange={(e) => setBatchForm({...batchForm, locationEn: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Dalat, Lam Dong, Vietnam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tọa độ GPS *
                    <span className="text-xs text-gray-500 ml-2">(Yêu cầu GlobalGAP)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.gpsCoordinates}
                    onChange={(e) => setBatchForm({...batchForm, gpsCoordinates: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="VD: 11.9404° N, 108.4583° E"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diện tích canh tác *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.area}
                    onChange={(e) => setBatchForm({...batchForm, area: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="VD: 5 hectares"
                  />
                </div>
              </div>
            </div>

            <div className="border-b pb-6">
              <h4 className="font-bold text-gray-800 mb-4">Thông tin giống & lịch trình</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại giống *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.seedType}
                    onChange={(e) => setBatchForm({...batchForm, seedType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="VD: Lactuca sativa var. capitata (Butterhead)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nguồn gốc giống *
                    <span className="text-xs text-gray-500 ml-2">(Yêu cầu EVFTA)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.seedOrigin}
                    onChange={(e) => setBatchForm({...batchForm, seedOrigin: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="VD: Takii Seeds, Japan - Certified Organic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày gieo trồng *
                  </label>
                  <input
                    type="date"
                    required
                    value={batchForm.plantingDate}
                    onChange={(e) => setBatchForm({...batchForm, plantingDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày thu hoạch dự kiến *
                  </label>
                  <input
                    type="date"
                    required
                    value={batchForm.expectedHarvest}
                    onChange={(e) => setBatchForm({...batchForm, expectedHarvest: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 text-white py-4 rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Tạo lô hàng & Nhận mã EVFTA
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activity Log Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <h3 className="text-2xl font-bold text-gray-800">Ghi Nhật Ký Canh Tác</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Ghi chép hoạt động hàng ngày theo chuẩn GlobalGAP. Mọi dữ liệu sẽ được lưu trên blockchain.
          </p>

          <form onSubmit={handleAddActivity} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn lô hàng *
                </label>
                <select
                  required
                  value={activityForm.batchId}
                  onChange={(e) => setActivityForm({...activityForm, batchId: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Chọn lô hàng</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.id} - {batch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày thực hiện *
                </label>
                <input
                  type="date"
                  required
                  value={activityForm.date}
                  onChange={(e) => setActivityForm({...activityForm, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại hoạt động *
                </label>
                <select
                  required
                  value={activityForm.activityType}
                  onChange={(e) => setActivityForm({...activityForm, activityType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Chọn loại hoạt động</option>
                  <option value="planting">🌱 Gieo trồng / Chuẩn bị đất</option>
                  <option value="fertilizer">🧪 Bón phân</option>
                  <option value="pesticide">🐛 Bảo vệ thực vật (BVTV)</option>
                  <option value="irrigation">💧 Tưới tiêu</option>
                  <option value="monitoring">👁️ Giám sát / Kiểm tra</option>
                  <option value="harvest">📦 Thu hoạch</option>
                </select>
              </div>

              {/* Conditional fields based on activity type */}
              {activityForm.activityType === 'fertilizer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên phân bón *
                    </label>
                    <input
                      type="text"
                      required
                      value={activityForm.fertilizerName}
                      onChange={(e) => setActivityForm({...activityForm, fertilizerName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="VD: Phân hữu cơ vi sinh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Liều lượng *
                    </label>
                    <input
                      type="text"
                      required
                      value={activityForm.fertilizerAmount}
                      onChange={(e) => setActivityForm({...activityForm, fertilizerAmount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="VD: 500 kg/ha"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phương pháp bón
                    </label>
                    <select
                      value={activityForm.fertilizerMethod}
                      onChange={(e) => setActivityForm({...activityForm, fertilizerMethod: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Chọn phương pháp</option>
                      <option value="Broadcasting">Rải đều (Broadcasting)</option>
                      <option value="Fertigation">Tưới phân (Fertigation)</option>
                      <option value="Side dressing">Bón lót (Side dressing)</option>
                      <option value="Foliar spray">Phun lá (Foliar spray)</option>
                    </select>
                  </div>
                </>
              )}

              {activityForm.activityType === 'pesticide' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên thuốc BVTV *
                    </label>
                    <input
                      type="text"
                      required
                      value={activityForm.pesticideName}
                      onChange={(e) => setActivityForm({...activityForm, pesticideName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="VD: Neem Oil (Organic)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hoạt chất *
                    </label>
                    <input
                      type="text"
                      required
                      value={activityForm.activeIngredient}
                      onChange={(e) => setActivityForm({...activityForm, activeIngredient: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="VD: Azadirachtin 0.15%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Liều lượng *
                    </label>
                    <input
                      type="text"
                      required
                      value={activityForm.pesticideAmount}
                      onChange={(e) => setActivityForm({...activityForm, pesticideAmount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="VD: 2 L/ha"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PHI (Thời gian cách ly) *
                      <span className="text-xs text-red-600 ml-2">(Quan trọng cho xuất khẩu)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={activityForm.phi}
                      onChange={(e) => setActivityForm({...activityForm, phi: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="VD: 3 days (EU compliant)"
                    />
                  </div>
                </>
              )}

              {activityForm.activityType === 'irrigation' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian tưới *
                    </label>
                    <input
                      type="text"
                      required
                      value={activityForm.irrigationDuration}
                      onChange={(e) => setActivityForm({...activityForm, irrigationDuration: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="VD: 45 minutes/day"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phương pháp tưới
                    </label>
                    <select
                      value={activityForm.irrigationMethod}
                      onChange={(e) => setActivityForm({...activityForm, irrigationMethod: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Chọn phương pháp</option>
                      <option value="Drip irrigation">Tưới nhỏ giọt (Drip)</option>
                      <option value="Sprinkler">Tưới phun (Sprinkler)</option>
                      <option value="Surface irrigation">Tưới tràn (Surface)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nguồn nước *
                    </label>
                    <input
                      type="text"
                      required
                      value={activityForm.waterSource}
                      onChange={(e) => setActivityForm({...activityForm, waterSource: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="VD: Mountain spring water (tested monthly)"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết *
                </label>
                <textarea
                  required
                  rows={4}
                  value={activityForm.details}
                  onChange={(e) => setActivityForm({...activityForm, details: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết hoạt động, điều kiện thời tiết, kết quả quan sát..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Người thực hiện *
                </label>
                <input
                  type="text"
                  required
                  value={activityForm.responsiblePerson}
                  onChange={(e) => setActivityForm({...activityForm, responsiblePerson: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-emerald-800">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">
                  Dữ liệu sẽ được lưu trên blockchain và tuân thủ chuẩn GlobalGAP. Không thể chỉnh sửa sau khi ghi.
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Ghi nhật ký & Lưu vào Blockchain
            </button>
          </form>
        </div>
      )}

      {/* Batches List Tab */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          {batches.map(batch => (
            <div key={batch.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{batch.name}</h3>
                  <p className="text-sm text-gray-600">Mã: {batch.id}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Gieo trồng: {batch.farmer?.plantingDate} | Thu hoạch dự kiến: {batch.farmer?.expectedHarvest}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {batch.status === 'farming' && 'Đang canh tác'}
                    {batch.status === 'ready_export' && 'Sẵn sàng xuất khẩu'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">Nhật ký canh tác</h4>
                  <span className="text-sm text-gray-600">{batch.fieldBook?.length || 0} hoạt động</span>
                </div>

                {batch.fieldBook && batch.fieldBook.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {batch.fieldBook.map((activity, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-800">{activity.activity}</span>
                          <span className="text-gray-600">{activity.date}</span>
                        </div>
                        <p className="text-gray-600 text-xs">{activity.details}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Chưa có hoạt động nào được ghi</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedBatch(batch.id);
                    setActivityForm({...activityForm, batchId: batch.id});
                    setActiveTab('activity');
                  }}
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Thêm hoạt động
                </button>
              </div>
            </div>
          ))}

          {batches.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có lô hàng nào</h3>
              <p className="text-gray-500 mb-6">Tạo lô hàng mới để bắt đầu ghi nhật ký canh tác</p>
              <button
                onClick={() => setActiveTab('new-batch')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Tạo lô hàng đầu tiên
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentRole, setCurrentRole] = useState(null);
  const [language, setLanguage] = useState('vi');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [showFieldBook, setShowFieldBook] = useState(false);

  const t = translations[language];

  const handleLogout = () => {
    setCurrentRole(null);
    setSelectedProduct(null);
    setShowFieldBook(false);
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      setSelectedProduct(mockProduct);
    }
  };

  const handleScanQR = () => {
    setSearchValue("EVFTA-VN-2024-001");
    setSelectedProduct(mockProduct);
  };

  const handleExportReport = () => {
    alert('Đang xuất báo cáo theo format EVFTA/CPTPP... (PDF/Excel)');
  };

  // Login Screen
  if (!currentRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="w-16 h-16 text-emerald-600" />
              <Shield className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{t.systemTitle}</h1>
            <p className="text-gray-600 text-lg">{t.subtitle}</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-semibold">GlobalGAP Certified</span>
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold">EVFTA Ready</span>
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold">CPTPP Compliant</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setCurrentRole('consumer')}
              className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-center justify-center mb-4">
                <Globe className="w-14 h-14 text-blue-600" />
                <QrCode className="w-10 h-10 text-blue-400 -ml-3" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.consumerRole}</h3>
              <p className="text-gray-600">{t.consumerDesc}</p>
              <p className="text-sm text-blue-600 mt-2">International Customers Welcome</p>
            </button>

            <button
              onClick={() => setCurrentRole('farmer')}
              className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-emerald-500"
            >
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="w-14 h-14 text-emerald-600" />
                <Sprout className="w-10 h-10 text-emerald-400 -ml-3" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.farmerRole}</h3>
              <p className="text-gray-600">{t.farmerDesc}</p>
              <p className="text-sm text-emerald-600 mt-2">Export Documentation Made Easy</p>
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">{language === 'vi' ? 'English' : 'Tiếng Việt'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{t.systemTitle}</h1>
                <p className="text-sm text-gray-600">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span>{language === 'vi' ? 'EN' : 'VI'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Consumer View */}
        {currentRole === 'consumer' && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <QrCode className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{t.digitalPassport}</h2>
                  <p className="text-sm text-gray-600">{t.digitalPassportSub}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                >
                  {t.search}
                </button>
                <button
                  onClick={handleScanQR}
                  className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  <QrCode className="w-5 h-5" />
                  {t.scanQR}
                </button>
              </div>

              <p className="text-sm text-gray-600">
                Example: EVFTA-VN-2024-001
              </p>
            </div>

            {selectedProduct && (
              <div className="space-y-6">
                {/* Product Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">
                        {language === 'vi' ? selectedProduct.name : selectedProduct.nameEn}
                      </h3>
                      <p className="text-emerald-100 mb-3">{selectedProduct.category}</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">{t.verified}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">{t.compliant}</span>
                      </div>
                    </div>
                    <div className="text-right bg-white/20 backdrop-blur rounded-xl p-4">
                      <div className="text-sm opacity-90">Product ID</div>
                      <div className="text-xl font-bold">{selectedProduct.id}</div>
                      <QrCode className="w-16 h-16 mt-3 mx-auto" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedProduct.farmer?.certifications.map((cert) => (
                      <div key={cert} className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                        <Award className="w-6 h-6 mx-auto mb-1" />
                        <div className="font-semibold text-sm">{cert}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Farm Information */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-2xl font-bold text-gray-800">{t.farmInfo}</h3>
                  </div>

                  {selectedProduct.farmer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Farm Name</div>
                        <div className="font-semibold text-gray-800 text-lg">
                          {language === 'vi' ? selectedProduct.farmer.farmName : selectedProduct.farmer.farmNameEn}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Location</div>
                        <div className="font-semibold text-gray-800">
                          {language === 'vi' ? selectedProduct.farmer.location : selectedProduct.farmer.locationEn}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">GPS Coordinates</div>
                        <div className="font-semibold text-gray-800">{selectedProduct.farmer.gpsCoordinates}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Farm Area</div>
                        <div className="font-semibold text-gray-800">{selectedProduct.farmer.area}</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Seed Information</div>
                        <div className="font-semibold text-gray-800">{selectedProduct.farmer.seedType}</div>
                        <div className="text-sm text-gray-600 mt-1">{selectedProduct.farmer.seedOrigin}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Field Book */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-2xl font-bold text-gray-800">{t.fieldBook}</h3>
                    </div>
                    <button
                      onClick={() => setShowFieldBook(!showFieldBook)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                      {showFieldBook ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    GlobalGAP Compliant Digital Field Book - All activities recorded and timestamped
                  </div>

                  {showFieldBook && selectedProduct.fieldBook && (
                    <div className="space-y-4">
                      {selectedProduct.fieldBook.map((activity, index) => (
                        <div key={index} className="border-l-4 border-emerald-500 pl-6 py-4 bg-emerald-50 rounded-r-xl">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-bold text-gray-800 text-lg">{activity.activity}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4" />
                                {activity.date}
                                <Clock className="w-4 h-4 ml-3" />
                                {activity.timestamp}
                              </div>
                            </div>
                          </div>
                          <div className="text-gray-700 mb-2">{activity.details}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            Responsible: {activity.responsiblePerson}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input Records */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-800">{t.inputRecords}</h3>
                  </div>

                  {selectedProduct.inputs && (
                    <div className="space-y-6">
                      {/* Fertilizers */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Beaker className="w-5 h-5 text-green-600" />
                          <h4 className="font-bold text-gray-800">Fertilizers / Phân bón</h4>
                        </div>
                        <div className="space-y-2">
                          {selectedProduct.inputs.fertilizers.map((item, i) => (
                            <div key={i} className="bg-green-50 rounded-lg p-4">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div><span className="text-gray-600">Date:</span> <span className="font-semibold">{item.date}</span></div>
                                <div><span className="text-gray-600">Product:</span> <span className="font-semibold">{item.name}</span></div>
                                <div><span className="text-gray-600">Amount:</span> <span className="font-semibold">{item.amount}</span></div>
                                <div className="col-span-3"><span className="text-gray-600">Method:</span> <span className="font-semibold">{item.method}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pesticides */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Bug className="w-5 h-5 text-orange-600" />
                          <h4 className="font-bold text-gray-800">Plant Protection / Bảo vệ thực vật</h4>
                        </div>
                        <div className="space-y-2">
                          {selectedProduct.inputs.pesticides.map((item, i) => (
                            <div key={i} className="bg-orange-50 rounded-lg p-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-600">Date:</span> <span className="font-semibold">{item.date}</span></div>
                                <div><span className="text-gray-600">Product:</span> <span className="font-semibold">{item.name}</span></div>
                                <div><span className="text-gray-600">Active Ingredient:</span> <span className="font-semibold">{item.activeIngredient}</span></div>
                                <div><span className="text-gray-600">Amount:</span> <span className="font-semibold">{item.amount}</span></div>
                                <div className="col-span-2"><span className="text-gray-600">PHI (Pre-Harvest Interval):</span> <span className="font-semibold text-orange-700">{item.phi}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Irrigation */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Droplets className="w-5 h-5 text-blue-600" />
                          <h4 className="font-bold text-gray-800">Irrigation / Tưới tiêu</h4>
                        </div>
                        <div className="space-y-2">
                          {selectedProduct.inputs.irrigation.map((item, i) => (
                            <div key={i} className="bg-blue-50 rounded-lg p-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-600">Period:</span> <span className="font-semibold">{item.date}</span></div>
                                <div><span className="text-gray-600">Duration:</span> <span className="font-semibold">{item.duration}</span></div>
                                <div><span className="text-gray-600">Method:</span> <span className="font-semibold">{item.method}</span></div>
                                <div><span className="text-gray-600">Water Source:</span> <span className="font-semibold">{item.waterSource}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quality Testing */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-purple-600" />
                    <h3 className="text-2xl font-bold text-gray-800">{t.qualityTest}</h3>
                  </div>

                  {selectedProduct.qualityTests && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-purple-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Pesticide Residue Analysis</div>
                          <div className="font-bold text-green-700">{selectedProduct.qualityTests.pesticideResidue}</div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Heavy Metals</div>
                          <div className="font-bold text-green-700">{selectedProduct.qualityTests.heavyMetals}</div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Microbiological Testing</div>
                          <div className="font-bold text-green-700">{selectedProduct.qualityTests.microbiological}</div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Test Date</div>
                          <div className="font-bold text-gray-800">{selectedProduct.qualityTests.testDate}</div>
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-gray-800">Laboratory Certification</span>
                        </div>
                        <div className="text-gray-700">{selectedProduct.qualityTests.labName}</div>
                        <div className="text-sm text-gray-600">{selectedProduct.qualityTests.labCertification}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Export Report Button */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Export Documentation</h3>
                      <p className="text-blue-100">Generate EVFTA/CPTPP compliant export report</p>
                      <p className="text-sm text-blue-100 mt-1">Available formats: PDF, Excel, XML (EU DPP Standard)</p>
                    </div>
                    <button
                      onClick={handleExportReport}
                      className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-lg"
                    >
                      <Download className="w-6 h-6" />
                      {t.exportReport}
                    </button>
                  </div>
                </div>

                {/* Blockchain Verification */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold">All data verified on blockchain - Immutable and tamper-proof</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 font-mono">
                    Block Hash: 0x7f8a9b2c4d3e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a
                  </div>
                </div>
              </div>
            )}

            {!selectedProduct && (
              <div className="text-center py-16">
                <div className="flex justify-center gap-4 mb-6">
                  <QrCode className="w-20 h-20 text-gray-300" />
                  <Globe className="w-20 h-20 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Scan QR Code or Enter Product ID
                </h3>
                <p className="text-gray-500 mb-4">
                  View complete Digital Product Passport
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">GlobalGAP</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">EVFTA</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">EU DPP Ready</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Farmer View - Digital Field Book */}
        {currentRole === 'farmer' && (
          <FarmerDashboard language={language} />
        )}
      </main>
    </div>
  );
}