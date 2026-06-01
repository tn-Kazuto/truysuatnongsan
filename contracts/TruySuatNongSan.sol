// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TruySuatNongSan
 * @dev Quản lý chuỗi cung ứng nông sản chống tráo hàng bằng Blockchain.
 *      Hệ thống kiểm soát các trạm vận chuyển (checkpoints) qua đối chiếu mã hash dữ liệu.
 */
contract TruySuatNongSan is Ownable {
    // ---------------------------------------------------------------------
    // Structs & State
    // ---------------------------------------------------------------------
    
    struct TramVanChuyen {
        string tenTram;        // Tên trạm kiểm soát
        bytes32 maHashXacThuc; // Mã băm dữ liệu thực tế tại trạm (khối lượng, chất lượng...)
        uint256 thoiGian;      // Nhãn thời gian Unix
        address diaChiVi;      // Địa chỉ ví của nhân viên kiểm tra tại trạm
    }

    struct LoHang {
        uint256 id;                 // ID lô hàng duy nhất
        string tenSanPham;          // Tên sản phẩm nông sản
        bool biCanThiep;            // Trạng thái cảnh báo bị tráo hàng (Cảnh báo đỏ)
        bool tonTai;                // Quản lý soft-delete
        TramVanChuyen[] hanhTrinh;  // Mảng lịch sử di chuyển qua các trạm
    }

    // Cơ sở dữ liệu lô hàng trên Blockchain
    mapping(uint256 => LoHang) public danhSachLoHang;
    
    // Mảng lưu trữ tất cả ID đang hoạt động để phục vụ việc liệt kê
    uint256[] private _danhSachIdActive;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------
    
    event LoHangDuocKhoiTao(uint256 indexed id, string tenSanPham, bytes32 hashDauTien, address indexed nguoiTao);
    
    event ThongBaoXacThuc(
        uint256 indexed id, 
        uint256 indexed tramIndex, 
        string tenTram, 
        bool hopLe, 
        string thongDiep,
        uint256 thoiGian
    );
    
    event LoHangBiKhoa(uint256 indexed id, string lyDo);

    // ---------------------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------------------
    
    modifier loHangTonTai(uint256 _id) {
        require(danhSachLoHang[_id].tonTai, "Lo hang khong ton tai hoac da bi xoa.");
        _;
    }

    modifier loHangAnToan(uint256 _id) {
        require(!danhSachLoHang[_id].biCanThiep, "Lo hang da bi khoa/dong bang do phat hien trao hang!");
        _;
    }

    // ---------------------------------------------------------------------
    // Functions
    // ---------------------------------------------------------------------

    /**
     * @dev Trạm Gốc (Nông dân / Hợp tác xã) khởi tạo đơn hàng và băm mã hash đầu tiên.
     * @param _id ID duy nhất của lô hàng.
     * @param _tenSanPham Tên sản phẩm.
     * @param _hashDauTien Mã băm dữ liệu gốc ban đầu (vd: băm của Khối lượng 1000kg + Ngày gieo).
     */
    function khoiTaoLoHang(
        uint256 _id, 
        string calldata _tenSanPham, 
        bytes32 _hashDauTien
    ) external onlyOwner {
        require(!danhSachLoHang[_id].tonTai, "ID lo hang da ton tai.");
        
        LoHang storage newLo = danhSachLoHang[_id];
        newLo.id = _id;
        newLo.tenSanPham = _tenSanPham;
        newLo.biCanThiep = false;
        newLo.tonTai = true;
        
        newLo.hanhTrinh.push(TramVanChuyen({
            tenTram: "Tram Goc (Farm)",
            maHashXacThuc: _hashDauTien,
            thoiGian: block.timestamp,
            diaChiVi: msg.sender
        }));

        _danhSachIdActive.push(_id);

        emit LoHangDuocKhoiTao(_id, _tenSanPham, _hashDauTien, msg.sender);
        emit ThongBaoXacThuc(_id, 0, "Tram Goc (Farm)", true, "Khoi tao lo hang thanh cong.", block.timestamp);
    }

    /**
     * @dev Hàm dành cho nhân viên các trạm tiếp theo quét nhận hàng và đối chiếu dữ liệu.
     *      Tự động đối chiếu mã hash dữ liệu gửi lên với mã hash của trạm liền trước trong mảng.
     *      Nếu sai sẽ kích hoạt cảnh báo, khóa lô hàng và revert(). Nếu khớp, lưu trạm mới vào lịch trình.
     * @param _id ID của lô hàng.
     * @param _tenTram Tên trạm tiếp theo (vd: Trạm 2 Tiền Giang).
     * @param _maHashMoi Mã băm dữ liệu thực tế đo đạc được tại trạm hiện tại.
     */
    function quaTramTiepTheo(
        uint256 _id, 
        string calldata _tenTram, 
        bytes32 _maHashMoi
    ) external loHangTonTai(_id) loHangAnToan(_id) {
        LoHang storage lo = danhSachLoHang[_id];
        
        // Lấy thông tin trạm liền trước
        uint256 previousTramIndex = lo.hanhTrinh.length - 1;
        bytes32 previousHash = lo.hanhTrinh[previousTramIndex].maHashXacThuc;

        // 1. Kiểm tra đối chiếu mã băm chống tráo hàng
        if (previousHash != _maHashMoi) {
            // Đánh dấu lô hàng bị can thiệp
            lo.biCanThiep = true;
            
            // Phát tín hiệu cảnh báo đỏ lên mạng lưới
            emit ThongBaoXacThuc(
                _id, 
                previousTramIndex + 1, 
                _tenTram, 
                false, 
                "Canh bao: Du lieu khong khop! Phat hien dau hieu trao hang.",
                block.timestamp
            );
            emit LoHangBiKhoa(_id, "Khoa do ma hash kiem tra tr\u1ea1m bi lech.");
            
            revert("Canh bao: Phat hien trao hang! Giao dich bi chan va lo hang da bi dong bang.");
        }

        // 2. Nếu khớp, lưu trạm mới vào lịch trình di chuyển
        lo.hanhTrinh.push(TramVanChuyen({
            tenTram: _tenTram,
            maHashXacThuc: _maHashMoi,
            thoiGian: block.timestamp,
            diaChiVi: msg.sender
        }));

        emit ThongBaoXacThuc(
            _id, 
            previousTramIndex + 1, 
            _tenTram, 
            true, 
            "Xac thuc thanh cong. Hang qua tram an toan.",
            block.timestamp
        );
    }

    /**
     * @dev Đóng băng hoặc mở khóa thủ công lô hàng bởi Owner (nếu cần xử lý tranh chấp).
     */
    function setCanThiepStatus(uint256 _id, bool _status) external onlyOwner loHangTonTai(_id) {
        danhSachLoHang[_id].biCanThiep = _status;
        if (_status) {
            emit LoHangBiKhoa(_id, "Admin dong bang thu cong.");
        } else {
            emit ThongBaoXacThuc(_id, 99, "Admin Office", true, "Admin go bo dong bang.", block.timestamp);
        }
    }

    /**
     * @dev Lấy thông tin chi tiết một lô hàng.
     */
    function getLoHang(uint256 _id) external view loHangTonTai(_id) returns (
        uint256 id,
        string memory tenSanPham,
        bool biCanThiep,
        TramVanChuyen[] memory hanhTrinh
    ) {
        LoHang storage lo = danhSachLoHang[_id];
        return (lo.id, lo.tenSanPham, lo.biCanThiep, lo.hanhTrinh);
    }

    /**
     * @dev Trả về danh sách ID tất cả các lô hàng hoạt động.
     */
    function getActiveIds() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _danhSachIdActive.length; i++) {
            if (danhSachLoHang[_danhSachIdActive[i]].tonTai) {
                count++;
            }
        }
        uint256[] memory ids = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < _danhSachIdActive.length; i++) {
            uint256 id = _danhSachIdActive[i];
            if (danhSachLoHang[id].tonTai) {
                ids[idx++] = id;
            }
        }
        return ids;
    }

    /**
     * @dev Soft-delete một lô hàng.
     */
    function xoaLoHang(uint256 _id) external onlyOwner loHangTonTai(_id) {
        danhSachLoHang[_id].tonTai = false;
    }
}
