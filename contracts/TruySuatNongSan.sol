// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TruySuatNongSan {
    
    struct SanPham {
        string ten;
        string lichSu;
        address nguoiSoHuu;
        bool tonTai;
    }
    
    mapping(uint256 => SanPham) public danhSachSanPham;
    
    event LoHangDuocTao(uint256 id, string ten, address nguoiTao);
    event CapNhatTrangThaiMoi(uint256 id, string thongTinMoi);
    
    function taoMoiLoHang(uint256 _id, string memory _ten, string memory _thongTinDauTien) public {
        require(!danhSachSanPham[_id].tonTai, "Lo hang voi ID nay da ton tai.");
        
        danhSachSanPham[_id] = SanPham({
            ten: _ten,
            lichSu: _thongTinDauTien,
            nguoiSoHuu: msg.sender,
            tonTai: true
        });
        
        emit LoHangDuocTao(_id, _ten, msg.sender);
    }
    
    function capNhatTrangThai(uint256 _id, string memory _thongTinMoi) public {
        require(danhSachSanPham[_id].tonTai, "Lo hang khong tonTai.");
        
        SanPham storage sp = danhSachSanPham[_id];
        
        // Append lịch sử mới vào sau lịch sử cũ
        sp.lichSu = string(abi.encodePacked(sp.lichSu, " | ", _thongTinMoi));
        sp.nguoiSoHuu = msg.sender;
        
        emit CapNhatTrangThaiMoi(_id, _thongTinMoi);
    }
}
