# Báo cáo tổng hợp dự án Nông sản truy xuất nguồn gốc

## 1. Tóm tắt điều hành

Đây là một dự án demo về **truy xuất nguồn gốc nông sản** kết hợp giữa:

- giao diện web React cho người dùng cuối,
- backend Node.js rất gọn để phục vụ API,
- một blockchain mô phỏng chạy cục bộ bằng JavaScript,
- và một nhánh mở rộng dùng smart contract Solidity + Web3 để kết nối testnet.

Mục tiêu cốt lõi của dự án là chứng minh một quy trình số hóa hồ sơ nông sản, trong đó:

- nông dân hoặc hợp tác xã tạo lô hàng,
- các bước chăm sóc, kiểm định, vận chuyển, bán lẻ được ghi tiếp vào lịch sử,
- người tiêu dùng có thể tra cứu “hộ chiếu sản phẩm số”,
- người kiểm toán có thể kiểm tra tính toàn vẹn dữ liệu theo logic blockchain.

Về thực tế triển khai hiện tại, **nhánh chạy chính của dự án là bản JavaScript local blockchain**. Nhánh Python + smart contract hiện mang tính tham khảo, mở rộng hoặc phục vụ trình bày về Web3 hơn là luồng chính của ứng dụng.

## 2. Bài toán mà dự án giải quyết

Dự án đang cố giải quyết bài toán phổ biến trong nông nghiệp và xuất khẩu:

- hồ sơ canh tác thường bị phân tán ở sổ tay giấy, file Excel hoặc biên bản rời rạc,
- dữ liệu khó kiểm tra chéo, khó audit, khó truy xuất khi có sự cố,
- tiêu chuẩn xuất khẩu như GlobalGAP, EVFTA, CPTPP yêu cầu hồ sơ minh bạch hơn,
- niềm tin của người mua, đơn vị logistics, kiểm định và bán lẻ phụ thuộc vào khả năng chứng minh lịch sử sản phẩm.

Ý tưởng của hệ thống là biến toàn bộ vòng đời một lô nông sản thành một chuỗi cập nhật có dấu thời gian, sau đó trình bày lại dưới dạng:

- nhật ký canh tác số cho nhà sản xuất,
- hộ chiếu sản phẩm số cho người tiêu dùng,
- bảng kiểm toán chuỗi khối cho bên xác minh.

## 3. Phạm vi chức năng hiện tại

Hiện dự án đang bao phủ 3 nhóm vai trò chính trên giao diện:

### 3.1. Người tiêu dùng

- tra cứu lô hàng theo ID,
- quét QR giả lập để mở lô hàng mẫu,
- xem thông tin vùng trồng, chứng nhận, đầu vào, kiểm định, logistics, bán lẻ,
- in báo cáo dưới dạng “Export Report”, thực chất dùng `window.print()`.

### 3.2. Nông dân / hợp tác xã

- tạo lô hàng mới,
- nhập thông tin gieo trồng ban đầu,
- ghi tiếp các bước:
  - bón phân,
  - thuốc bảo vệ thực vật,
  - tưới nước,
  - thu hoạch và kiểm định,
  - logistics,
  - bán lẻ,
- xem danh sách lô hàng đã có trong hệ thống.

### 3.3. Kiểm toán viên / hải quan

- đọc toàn bộ chuỗi block từ backend,
- tự tính lại SHA-256 từng block,
- kiểm tra tính đúng đắn của `hash` và `prevHash`,
- kết luận chuỗi an toàn hay bị sai lệch.

## 4. Kiến trúc tổng thể

## 4.1. Kiến trúc logic

Hệ thống hiện tại có thể hiểu theo sơ đồ:

1. `frontend/src/App.jsx` là ứng dụng React trung tâm.
2. Frontend gọi HTTP API đến `backend/server.js`.
3. `server.js` thao tác với lớp `TraceabilityBlockchain` trong `backend/blockchain.js`.
4. `TraceabilityBlockchain` ghi trạng thái chain và dữ liệu lô hàng xuống file `backend/data/demo-chain.json`.
5. Khi bật chế độ Polygon, frontend có thể đọc/ghi trực tiếp với smart contract thông qua `ethers`.

## 4.2. Hai nhánh backend đang tồn tại

### Nhánh A: JavaScript local blockchain

Đây là nhánh chính để demo:

- file chính: `backend/server.js`
- engine blockchain: `backend/blockchain.js`
- dữ liệu lưu: `backend/data/demo-chain.json`
- không cần cài thêm package cho backend
- phù hợp nhất cho báo cáo, demo tại chỗ, chấm đồ án

### Nhánh B: Python + Web3 + smart contract

Đây là nhánh mở rộng:

- file chính: `backend/app.py`
- đọc dữ liệu từ contract thông qua Web3 RPC
- có thêm route ghi dữ liệu lên contract
- phụ thuộc ABI, RPC URL, contract address
- phù hợp cho mô hình “blockchain thật” hơn, nhưng chưa phải luồng chính đang dùng

## 5. Cấu trúc thư mục quan trọng

### 5.1. Thư mục frontend

- `frontend/src/App.jsx`: ứng dụng chính, chứa gần như toàn bộ logic UI
- `frontend/src/styles.css`: style tổng cho toàn bộ giao diện
- `frontend/src/config/contract.js`: cấu hình chain, ABI và địa chỉ contract
- `frontend/src/FigmaApp.jsx`: file giao diện thử nghiệm / tham khảo, hiện không phải entry chính
- `frontend/src/FigmaApp.tsx`: file dang dở, không được dùng
- `frontend/src/main.jsx`: entry render `App`

### 5.2. Thư mục backend

- `backend/server.js`: HTTP server của nhánh JavaScript
- `backend/blockchain.js`: mô phỏng blockchain, mining, tạo block, cập nhật block
- `backend/data/demo-chain.json`: dữ liệu chain thực tế đang được ứng dụng đọc
- `backend/app.py`: backend Flask cho nhánh Python/Web3
- `backend/deploy_to_hardhat.py`: script deploy contract lên Hardhat local
- `backend/abi/TruySuatNongSan.json`: ABI để backend Python đọc contract

### 5.3. Thư mục blockchain / contracts

- `blockchain/TruySuatNongSan.sol`: smart contract bản đầu
- `contracts/TruySuatNongSan.sol`: contract dùng cho Hardhat/artifacts
- `blockchain/README.md`: hướng dẫn deploy bằng Remix và cấu hình Amoy

## 6. Phân tích chi tiết từng thành phần

## 6.1. Frontend React

Frontend là phần nhiều chức năng nhất và hiện đang đóng vai trò:

- dashboard cho người dùng,
- bộ form nhập dữ liệu,
- trình hiển thị passport,
- công cụ kiểm toán,
- và bộ chuyển giữa local blockchain với Polygon.

### Các trạng thái chính trong frontend

Trong `App.jsx`, các state lớn bao gồm:

- `currentRole`: đang ở vai trò nào
- `language`: ngôn ngữ
- `activeNetwork`: `local` hoặc `polygon`
- `walletAddress`: ví MetaMask khi dùng Polygon
- `selectedProduct`: sản phẩm đang được xem
- `batches`: danh sách lô hàng
- `batchForm`: dữ liệu form tạo lô
- `activityForm`: dữ liệu form ghi nhật ký
- `verificationLog`: log kiểm toán blockchain

### Các hàm nghiệp vụ quan trọng

- `parseBlockchainProduct(...)`
  - chuyển dữ liệu blockchain thô thành dữ liệu UI dễ đọc
  - phân tách thành `farmer`, `fieldBook`, `inputs`, `qualityTests`, `logistics`, `retail`

- `handleLookupWithId(...)`
  - truy vấn lô hàng
  - nếu ở local thì gọi backend REST
  - nếu ở Polygon thì gọi contract qua `ethers`

- `handleCreateBatchSubmit(...)`
  - tạo lô hàng mới
  - local: POST `/api/products`
  - polygon: gọi `taoMoiLoHang(...)`

- `handleAddActivitySubmit(...)`
  - thêm một bước mới vào lịch sử lô hàng
  - local: POST `/api/products/:id/updates`
  - polygon: gọi `capNhatTrangThai(...)`

- `verifyBlockchain(...)`
  - đọc toàn bộ chain
  - tính lại hash từng block
  - kiểm tra tính liên kết cha-con của chain

- `handleExportReport(...)`
  - hiện chỉ gọi `window.print()`

### Nhận xét về frontend

Ưu điểm:

- trình diễn tốt về mặt nghiệp vụ
- có đủ 3 vai trò
- mô tả được vòng đời nông sản khá đầy đủ
- thể hiện rõ “passport số”, “field book số”, “audit blockchain”

Hạn chế:

- `App.jsx` đang quá lớn, gộp UI + state + business logic vào một file
- logic hiển thị và logic gọi API chưa tách component/service
- một số text trong source đang bị lỗi mã hóa ký tự tiếng Việt
- có file giao diện phụ (`FigmaApp.jsx`) nhưng không phải luồng chạy thật

## 6.2. Backend JavaScript

`backend/server.js` dùng module `http` thuần của Node.js, không dùng Express. Đây là lựa chọn rất đơn giản nhưng phù hợp demo.

### Endpoint chính

- `GET /`
- `GET /health`
- `GET /api/config`
- `GET /api/chain`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `POST /api/products/:id/updates`

### Đặc điểm kỹ thuật

- có CORS mở hoàn toàn bằng `Access-Control-Allow-Origin: *`
- body JSON được parse thủ công
- lỗi được trả bằng status `400` hoặc `404`
- dữ liệu sống hoàn toàn trong memory và file JSON

### Nhận xét

Ưu điểm:

- nhẹ, dễ chạy, không phụ thuộc package
- dễ hiểu khi trình bày trong báo cáo
- đủ dùng cho demo luồng nghiệp vụ

Hạn chế:

- chưa có authentication
- chưa có validation sâu
- chưa có logging chuẩn
- chưa có phân lớp controller/service/repository

## 6.3. Engine blockchain mô phỏng

`backend/blockchain.js` là phần mô phỏng blockchain cục bộ.

### Cách hoạt động

- mỗi block có:
  - `index`
  - `prevHash`
  - `data`
  - `timestamp`
  - `nonce`
  - `hash`

- `hash` được tính bằng:
  - `sha256(index + prevHash + JSON.stringify(data) + timestamp + nonce)`

- mining dùng cơ chế đơn giản:
  - tăng `nonce` cho đến khi `hash` bắt đầu bằng số lượng số 0 đúng với `difficulty`

### Nghiệp vụ được lưu trong chain

- `CREATE_PRODUCT`
- `UPDATE_PRODUCT`

### Dữ liệu sản phẩm

`products` là một object map theo `id`, mỗi sản phẩm có:

- `id`
- `ten`
- `nguoiSoHuu`
- `tonTai`
- `lichSu`: danh sách các bước có `step`, `noiDung`, `nguoiCapNhat`, `thoiGian`

### Seed dữ liệu

Ngay khi chain chưa tồn tại, hệ thống:

- tạo genesis block
- seed sẵn lô hàng `ID = 1`
- thêm các bước:
  - gieo trồng
  - bón phân
  - thuốc BVTV
  - thu hoạch và kiểm định
  - vận chuyển
  - bán lẻ

Điều này giúp demo có dữ liệu tức thì.

### Ý nghĩa mô hình

Đây không phải blockchain phân tán thật. Nó là:

- một “append-only ledger” cục bộ,
- có hash chain,
- có proof-of-work đơn giản,
- có thể tự xác minh tính toàn vẹn,
- nhưng không có network node, consensus thật, peer-to-peer hay smart contract execution.

## 6.4. Smart contract Solidity

Contract `TruySuatNongSan.sol` rất nhỏ và có 2 nghiệp vụ chính:

- `taoMoiLoHang(...)`
- `capNhatTrangThai(...)`

### Mô hình dữ liệu trên contract

Mỗi `SanPham` có:

- `ten`
- `lichSu`
- `nguoiSoHuu`
- `tonTai`

### Điểm đáng chú ý

Trường `lichSu` chỉ là **một chuỗi string nối bằng `" | "`**, không phải mảng struct.

Hệ quả:

- dễ deploy và demo
- nhưng dữ liệu không có cấu trúc giàu như local JS blockchain
- frontend phải cố parse lại chuỗi này
- khó mở rộng cho báo cáo, lọc, thống kê, audit sâu

Vì vậy nhánh Polygon hiện mang tính minh họa “có kết nối blockchain thật”, nhưng về chất lượng dữ liệu thì **thua nhánh local JS**.

## 6.5. Backend Python + Web3

`backend/app.py` là nhánh backend cũ hơn hoặc song song.

### Nó làm gì

- đọc cấu hình từ `.env`
- load ABI từ `backend/abi/TruySuatNongSan.json`
- kết nối RPC tới Polygon Amoy hoặc Hardhat
- gọi hàm đọc `danhSachSanPham(uint256)`
- có thêm route `POST /api/add-product` để ghi lên contract

### Vai trò hiện tại

Nhánh này phù hợp khi bạn cần trình bày:

- “dự án có thể đọc dữ liệu từ smart contract qua backend”
- “backend không chỉ làm local JSON mà còn có thể chạm tới testnet”

Nhưng so với nhánh Node.js:

- nó không phải luồng chính frontend đang ưu tiên dùng,
- API cũng không đồng nhất hoàn toàn với `server.js`,
- việc ghi dữ liệu phụ thuộc vào khóa riêng, ABI, RPC, chainId.

## 7. Luồng dữ liệu nghiệp vụ

## 7.1. Tạo lô hàng

1. Người dùng vào tab nông dân.
2. Nhập dữ liệu vùng trồng.
3. Frontend tạo object `thongTinDauTien`.
4. Nếu `local`:
   - gửi `POST /api/products`
   - backend thêm sản phẩm vào `products`
   - backend tạo block `CREATE_PRODUCT`
   - chain được persist vào `demo-chain.json`
5. Nếu `polygon`:
   - frontend gọi contract `taoMoiLoHang`
   - thông tin ban đầu bị nén thành string ngắn gọn

## 7.2. Ghi nhật ký

1. Người dùng chọn loại hoạt động.
2. Frontend map form sang `thongTinMoi`.
3. Nếu `local`:
   - gửi `POST /api/products/:id/updates`
   - backend append vào `lichSu`
   - backend tạo block `UPDATE_PRODUCT`
4. Nếu `polygon`:
   - frontend stringify object sang text
   - gọi `capNhatTrangThai`

## 7.3. Tra cứu hộ chiếu số

1. Người dùng nhập ID hoặc quét QR giả lập.
2. Frontend gọi local API hoặc contract trực tiếp.
3. `parseBlockchainProduct(...)` dựng lại dữ liệu phục vụ UI.
4. UI hiển thị:
   - thông tin sản phẩm
   - hợp tác xã / vùng trồng
   - đầu vào
   - nhật ký
   - kiểm định
   - logistics
   - bán lẻ

## 7.4. Kiểm toán blockchain

1. Frontend gọi `GET /api/chain`
2. Lấy tất cả blocks
3. Tính lại hash bằng cùng công thức backend
4. So sánh:
   - `computedHash === storedHash`
   - `block.prevHash === previousBlock.hash`
5. Hiển thị kết quả từng block

## 8. Mô hình dữ liệu sản phẩm

Về mặt giao diện, dự án đang mô hình hóa một lô hàng nông sản khá chi tiết:

- thông tin giống
- nguồn gốc giống
- vùng trồng
- diện tích
- chứng nhận
- phân bón
- thuốc BVTV
- thời gian cách ly
- nguồn nước
- kiểm định MRL
- đơn vị logistics
- nhiệt độ và độ ẩm
- siêu thị nhận hàng

Điểm mạnh là mô hình này đủ giàu để kể được câu chuyện “từ nông trại đến kệ hàng”.

Điểm yếu là:

- dữ liệu đang linh hoạt quá mức ở local chain vì `noiDung` là object tự do,
- còn trên smart contract thì lại quá phẳng vì bị dồn thành string,
- hai nhánh chưa dùng chung một schema chuẩn.

## 9. Cách chạy và môi trường

## 9.1. Cách chạy khuyến nghị

Theo `README.md`, cách chạy phù hợp nhất hiện nay là:

1. Chạy backend local JS:
   - `cd backend`
   - `node server.js`
2. Chạy frontend:
   - `cd frontend`
   - `npm.cmd install`
   - `npm.cmd run dev`

## 9.2. Địa chỉ chính

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:5000`
- Health: `http://127.0.0.1:5000/health`
- Product mẫu: `http://127.0.0.1:5000/api/products/1`

## 9.3. Kết nối blockchain thật

Muốn dùng smart contract:

- deploy contract lên Polygon Amoy hoặc Hardhat
- cập nhật contract address
- cập nhật ABI
- kết nối MetaMask nếu frontend ghi/đọc trực tiếp

## 10. Điểm mạnh của dự án

### 10.1. Tính trình diễn tốt

Dự án rất phù hợp cho:

- demo đồ án
- thuyết trình hội đồng
- giải thích khái niệm truy xuất nguồn gốc
- minh họa blockchain trong chuỗi cung ứng

### 10.2. Luồng nghiệp vụ rõ ràng

Từ góc nhìn nghiệp vụ, hệ thống nói được câu chuyện khá đầy đủ:

- tạo lô,
- chăm sóc,
- kiểm định,
- vận chuyển,
- bán lẻ,
- truy vấn,
- kiểm toán.

### 10.3. Không phụ thuộc nặng

Nhánh local JS gần như chạy độc lập:

- backend không cần package ngoài
- frontend dùng stack phổ biến
- dữ liệu persist bằng JSON dễ mang đi demo

### 10.4. Có chiều sâu học thuật

Dự án không chỉ là CRUD thông thường mà có thêm:

- proof-of-work mô phỏng
- hash chain
- verify integrity
- blockchain contract integration

Điều này giúp phần báo cáo có chiều sâu kỹ thuật hơn nhiều so với demo web thuần.

## 11. Hạn chế và rủi ro hiện tại

## 11.1. Mã nguồn frontend đang quá lớn

`frontend/src/App.jsx` chứa gần như toàn bộ:

- state
- event handlers
- form logic
- rendering cho cả 3 role
- logic audit

Điều này làm:

- khó bảo trì,
- khó test,
- khó mở rộng,
- dễ phát sinh bug dây chuyền.

## 11.2. Dự án có hai nhánh dữ liệu chưa thống nhất hoàn toàn

Local JS blockchain:

- lưu lịch sử dạng object có cấu trúc

Smart contract:

- lưu lịch sử dạng string nối

Hậu quả:

- frontend phải xử lý 2 kiểu dữ liệu khác nhau
- chất lượng truy xuất dữ liệu trên Polygon yếu hơn local demo
- báo cáo nghiệp vụ có thể đẹp ở local nhưng nghèo ở testnet

## 11.3. Có dấu hiệu lỗi mã hóa ký tự tiếng Việt

Trong nhiều file đang xuất hiện chuỗi kiểu:

- `XoÃ i`
- `Truy xuáº¥t`
- `Nháº­t kÃ½`

Đây là dấu hiệu dữ liệu hoặc source đã đi qua sai encoding. Nó không làm chết logic chính nhưng:

- làm giảm chất lượng sản phẩm,
- ảnh hưởng trình bày báo cáo,
- gây khó đọc source và dữ liệu seed.

## 11.4. Tính bảo mật chưa phù hợp sản phẩm thật

Nhánh Python hiện có một route dùng sẵn:

- địa chỉ ví sender hardcoded,
- private key hardcoded,
- chainId cố định.

Đây là điều chấp nhận được trong demo cục bộ Hardhat, nhưng tuyệt đối không phù hợp nếu xem là sản phẩm thật.

## 11.5. Chưa có phân quyền thật

Hiện người dùng chỉ chuyển vai trò ở frontend. Hệ thống chưa có:

- đăng nhập,
- phân quyền theo tài khoản,
- quản lý ai được tạo lô, ai được cập nhật,
- xác thực người kiểm định hay đơn vị logistics.

## 11.6. Chức năng “QR scan” và “Export report” mới ở mức demo

- QR scan đang giả lập bằng timeout, không đọc camera thật
- Export report hiện chỉ in trang bằng CSS print, chưa xuất PDF có template chuẩn

## 11.7. Chưa có test tự động rõ ràng cho nhánh chính

Có `backend/test_api.py`, nhưng:

- chỉ test một route của nhánh Python,
- chưa có test frontend,
- chưa có test cho nhánh local JS blockchain,
- chưa có test regression.

## 12. Đánh giá mức độ hoàn thiện

Nếu đánh giá theo hướng đồ án/demo:

- **mức hoàn thiện khá tốt**
- đủ để trình bày ý tưởng, kiến trúc và demo live

Nếu đánh giá theo hướng sản phẩm triển khai thực tế:

- **chưa đủ**

Lý do:

- chưa có user management
- chưa có schema dữ liệu chuẩn dùng chung
- chưa có database thật
- chưa có bảo mật vận hành
- smart contract còn quá đơn giản
- chưa có quy trình release/test/deploy rõ ràng

## 13. Hướng phát triển tiếp theo

## 13.1. Tách frontend thành module

Nên chia `App.jsx` thành:

- `pages/ConsumerPassport`
- `pages/FarmerDashboard`
- `pages/AuditorDashboard`
- `components/forms/*`
- `services/api.js`
- `services/blockchain.js`

## 13.2. Chuẩn hóa schema dữ liệu

Nên định nghĩa một schema thống nhất cho:

- creation payload,
- update payload,
- product aggregate,
- export report payload.

Nếu có thể, dùng:

- JSON schema
- Zod
- hoặc TypeScript type dùng chung

## 13.3. Chọn một chiến lược blockchain rõ ràng

Hiện có hai hướng:

- hướng demo local blockchain giàu dữ liệu
- hướng smart contract thật nhưng dữ liệu đơn giản

Nên quyết định:

1. hoặc giữ local blockchain làm demo học thuật chính,
2. hoặc thiết kế lại contract để lưu lịch sử có cấu trúc hơn.

## 13.4. Thay route Python cũ hoặc bỏ nếu không còn dùng

Nếu nhánh Python không còn là trọng tâm, nên:

- đánh dấu là legacy,
- hoặc đưa vào thư mục `legacy/`,
- hoặc ghi rõ trong tài liệu là “tham khảo”.

## 13.5. Nâng cấp báo cáo xuất khẩu

Có thể phát triển:

- template PDF riêng,
- mã QR thật dẫn đến passport URL,
- chữ ký số / dấu xác minh,
- bộ tiêu chí GlobalGAP checklist,
- báo cáo song ngữ Việt - Anh.

## 13.6. Bổ sung xác thực người dùng

Tối thiểu nên có:

- tài khoản nông dân,
- tài khoản hợp tác xã,
- tài khoản kiểm định,
- tài khoản admin.

## 14. Kết luận

Đây là một dự án có ý tưởng rõ ràng, dễ trình bày và có giá trị tốt cho mục tiêu học tập, demo hoặc báo cáo đề tài. Điểm mạnh nhất của dự án là nó không chỉ làm giao diện truy xuất nguồn gốc, mà còn mô phỏng được logic blockchain, kiểm toán chuỗi và các vai trò trong chuỗi cung ứng nông sản.

Tuy nhiên, dự án hiện vẫn là một **prototype thiên về demo kỹ thuật** hơn là một nền tảng sẵn sàng đưa vào vận hành. Để đi tiếp, nhóm phát triển cần thống nhất một kiến trúc dữ liệu rõ ràng, giảm độ phình của frontend, quyết định chiến lược blockchain chính và xử lý các vấn đề như encoding, bảo mật, phân quyền và khả năng kiểm thử.

Nếu mục tiêu của bạn là **hiểu hết dự án để thuyết trình hoặc bảo vệ**, thì điểm quan trọng nhất cần nhớ là:

- dự án đang mô phỏng một chuỗi truy xuất nguồn gốc nông sản,
- nhánh JavaScript local blockchain là bản chạy chính,
- frontend là trung tâm nghiệp vụ,
- smart contract hiện là lớp minh họa blockchain thật,
- và giá trị nổi bật của dự án nằm ở khả năng kể trọn hành trình của một lô hàng từ gieo trồng đến bán lẻ.
