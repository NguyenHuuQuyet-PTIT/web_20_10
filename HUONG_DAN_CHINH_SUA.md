# Hướng dẫn sửa nội dung, ảnh, nhạc và deploy thiệp 20/10

Tài liệu này ghi lại toàn bộ quy trình từ lúc chuẩn bị nội dung đến lúc đưa bản cuối lên Vercel và gửi link/QR cho mọi người.

## 1. Hiểu cách dự án lưu nội dung

- Trang chính là `index.html`; nội dung trang được lấy từ `js/data.js` và giao diện từ thư mục `partials/`.
- Đây là website tĩnh, không có backend và không có chức năng để khách xem sửa lời chúc/ảnh/nhạc.
- Công cụ chuẩn bị riêng là `editor.html`. Nội dung bạn đang sửa trong đó chưa được lưu lâu dài cho đến khi tải `data.js` và chép vào dự án.
- Khi khách tải lại trang, nội dung trở về đúng những gì bạn đã deploy trong `js/data.js`.
- Phải mở bằng Live Server hoặc một máy chủ web tĩnh. Nhấp đúp HTML để mở dạng `file://` sẽ làm trang chính không tải được các phần trong `partials/`.

## 2. Mở công cụ chỉnh sửa

1. Mở thư mục dự án bằng VS Code.
2. Cài tiện ích **Live Server** nếu máy chưa có.
3. Trong VS Code, nhấp phải `editor.html` → **Open with Live Server**.
4. Trình duyệt sẽ mở trang editor. Nếu đang xem `index.html`, đổi địa chỉ cuối thành `/editor.html`.

Không đưa ảnh riêng tư vào GitHub công khai. Editor chạy tại máy bạn và không gửi file lên dịch vụ lưu trữ; khi chép ảnh/nhạc vào bản cuối, các file đó sẽ được đóng gói trong `js/data.js` và đưa lên cùng trang.

## 3. Sửa lời chúc, tên và nội dung

Trên editor, các ô **Sửa nhanh nội dung** dùng để sửa những phần thường thay đổi:

- **Tiêu đề trang, dòng người nhận:** tên và dòng giới thiệu trên đầu thiệp.
- **Lời chúc đầu trang:** mỗi hồ sơ có tiêu đề, lời chúc và lời chào linh vật. Hồ sơ `Cả 3...` là lời chúc chung; các hồ sơ tiếp theo lần lượt là Anh Thư, Bảo Linh, Lương.
- **Trạm 1–5:** tên trạm, tiêu đề thư, câu trích dẫn, nội dung thư và chữ ký.
- **Ảnh 1–4:** tiêu đề, nhãn và mô tả của các ảnh trong gallery.
- **Lời nhắn 1–3:** người gửi, người nhận và nội dung trên bảng lời chúc.
- **Tên giai điệu:** tên hiển thị ở thanh nhạc, không làm thay đổi file nhạc.

Sau khi sửa, bấm **Cập nhật xem trước**. Editor sẽ đưa nội dung hiện tại vào trang thiệp thật ở khung xem trước.

Muốn sửa các mục khác như `miniCompliments`, `mascotQuotes`, số hộp quà hoặc thứ tự danh sách, mở phần **Mở dữ liệu nâng cao (JSON)**. Các mục chính nằm trong `data`; tên/lời chúc hồ sơ nằm trong `profiles`. JSON sai dấu phẩy/ngoặc sẽ được báo khi cập nhật xem trước hoặc tải file.

## 4. Thay ảnh: ảnh nào của ai, nhập đường dẫn nào

Trong phần thêm ảnh/nhạc của editor:

1. Chọn ảnh trên máy.
2. Nhập đường dẫn ở ô vị trí nội dung.
3. Bấm **Đưa file vào nội dung**.
4. Bấm **Cập nhật xem trước** để kiểm tra.

### Thay ảnh dùng chung bằng tên asset

| Đường dẫn nhập | Dùng cho ảnh nào |
| --- | --- |
| `assets.BOUQUET` | Ảnh riêng của Nguyễn Anh Thư: trạm thư Anh Thư và ảnh gallery đầu tiên. Cũng dùng ở trạm kết thúc chung. |
| `assets.MUSIC_BOX` | Ảnh riêng của Trần Thị Bảo Linh: trạm thư Bảo Linh và ảnh gallery thứ hai. |
| `assets.LANTERNS` | Ảnh riêng của Trần Thị Lương: trạm thư Lương và ảnh gallery thứ ba. |
| `assets.TRAIN` | Ảnh chung tập thể lớp: trạm mở đầu và ảnh gallery thứ tư. |
| `assets.MASCOT_BUNNY` | Ảnh thỏ 2D dự phòng trong khu linh vật; không phải ảnh chân dung một bạn. |

Thay một asset sẽ thay tất cả vị trí đang dùng asset đó. Ví dụ thay `assets.BOUQUET` sẽ đổi cả ảnh Anh Thư ở trạm, gallery và ảnh ở trạm cuối.

### Chỉ thay một vị trí, không thay ảnh dùng chung

Các danh sách đếm từ `0`:

| Vị trí | Đường dẫn nhập | Ảnh đang hiển thị |
| --- | --- | --- |
| Gallery ảnh 1 | `data.gallery.0.image` | Nguyễn Anh Thư |
| Gallery ảnh 2 | `data.gallery.1.image` | Trần Thị Bảo Linh |
| Gallery ảnh 3 | `data.gallery.2.image` | Trần Thị Lương |
| Gallery ảnh 4 | `data.gallery.3.image` | Ảnh chung lớp |
| Trạm mở đầu | `data.stories.0.image` | Ảnh chung lớp |
| Trạm thư Anh Thư | `data.stories.1.image` | Nguyễn Anh Thư |
| Trạm thư Bảo Linh | `data.stories.2.image` | Trần Thị Bảo Linh |
| Trạm thư Lương | `data.stories.3.image` | Trần Thị Lương |
| Trạm kết thúc | `data.stories.4.image` | Ảnh chung lớp |

**Lưu ý về thư mục `assets/images/`:** dự án có sẵn `bouquet-roses.jpg`, `lantern-garden.jpg`, `mascot-bunny.jpg`, `memory-train.jpg`, nhưng trang hiện tại lấy ảnh từ các giá trị nhúng trong `js/data.js`, chứ không tự đọc các file này. Chép đè file trong `assets/images/` sẽ không làm ảnh trên trang đổi. Hãy dùng editor với các đường dẫn ở bảng trên rồi xuất `data.js`. Asset `MUSIC_BOX` hiện cũng chưa có file rời tương ứng trong thư mục đó.

Ảnh tải lên được đóng gói vào `data.js`. Nên dùng JPG/WebP đã thu nhỏ vừa với khung thiệp, tránh ảnh gốc nhiều chục MB làm trang nặng. Nếu ảnh bị xoay sai trên điện thoại, hãy xoay/lưu ảnh đúng chiều trước khi tải lên.

## 5. Thay nhạc

Editor hiện có hai cách:

- **Dùng giai điệu tạo sẵn:** `data.selectedMelodyIndex` trong JSON nâng cao. Chọn `0` là giai điệu hộp nhạc nhẹ, `1` là giai điệu acoustic, `2` là giai điệu sôi động.
- **Dùng bài nhạc của bạn:** chọn file âm thanh và nhập đường dẫn `data.customAudioDataUrl`, rồi bấm **Đưa file vào nội dung**. Đặt `data.customAudioName` thành tên muốn hiện trên thanh nhạc. Khi `customAudioDataUrl` có file, bài này được dùng thay cho giai điệu tạo sẵn.

Nên dùng MP3 đã nén hợp lý. Trình duyệt thường chặn tự phát nhạc, nên người xem cần bấm nút đĩa nhạc để bắt đầu. Nút loa nhỏ bên cạnh là bật/tắt **hiệu ứng âm thanh**, không phải nút phát nhạc.

## 6. Lưu bản đã chỉnh vào dự án

1. Bấm **Tải data.js bản cuối** trên editor.
2. Trình duyệt tải file tên `data.js` về máy (thường nằm trong thư mục Downloads).
3. Chép file đó vào thư mục `js/` của dự án và chọn ghi đè file cũ `js/data.js`.
4. Mở lại `index.html` bằng Live Server, không mở `editor.html`, để thử đúng bản khách sẽ xem.
5. Kiểm tra tất cả ảnh, nhạc, lời chúc và tương tác trước khi deploy.

Nếu tải nhiều lần, chỉ dùng file `data.js` mới nhất. Nội dung ở editor không tự lưu vào dự án khi bạn đóng tab hoặc tải lại trang.

## 7. Danh sách kiểm tra trước khi deploy

- Trang chính mở được qua Live Server và không báo lỗi tải giao diện.
- Tên, lời chúc chung và lời chúc của từng bạn đúng chính tả.
- Gallery có đúng ảnh, đúng người, đúng tiêu đề/mô tả.
- Từng trạm hiển thị đúng thư và ảnh.
- Mở thư rồi lật lại mặt trước thì trạm kế tiếp mới mở; tải lại trang thì trở về trạng thái ban đầu.
- Nút đĩa nhạc phát/tạm dừng nhạc; nút loa nhỏ chỉ bật/tắt hiệu ứng.
- Thử cả màn hình điện thoại và máy tính.
- File `js/data.js` đã thay đúng file trong dự án.

## 8. Đưa dự án lên Vercel bằng GitHub

### Nếu chưa deploy lần nào

1. Đưa toàn bộ dự án lên một repository GitHub, gồm `index.html`, `css/`, `js/`, `partials/`, `assets/` và `.vercelignore`.
2. Trên Vercel, chọn **Add New → Project**, kết nối GitHub và import repository này.
3. Chọn thư mục gốc dự án làm Root Directory.
4. Đây là trang tĩnh không cần build: chọn Framework Preset **Other**, để Build Command trống và Output Directory là `.` (thư mục gốc).
5. Bấm **Deploy**. Khi deploy hoàn tất, mở URL do Vercel cấp và thử lại trang.

### Nếu đã nối GitHub với Vercel

Sau khi thay `js/data.js`, commit thay đổi rồi push lên nhánh Production (thường là `main`). Vercel tự tạo deployment mới; đợi trạng thái deployment báo thành công rồi mở URL Production. Push lên nhánh khác thường tạo bản Preview riêng, chưa thay trang Production.

Vercel hỗ trợ tự deploy khi có push vào repository đã kết nối. Xem [hướng dẫn deploy Git của Vercel](https://vercel.com/docs/git) và [cấu hình build cho dự án không cần build](https://vercel.com/docs/builds/configure-a-build).

## 9. Editor có bị đưa lên trang công khai không? Gỡ thế nào?

`.vercelignore` ở thư mục gốc đang loại `editor.html` và `js/editor.js` khỏi deployment. Khách chỉ vào trang chính; đường dẫn editor không được phục vụ trên deployment Vercel. Xem [tài liệu `.vercelignore`](https://vercel.com/docs/deployments/vercel-ignore).

Bạn có thể giữ editor trong máy để lần sau chỉnh tiếp. Nếu muốn xóa hẳn sau khi đã chốt:

1. Giữ lại `js/data.js` đã xuất — đây là nội dung cuối trang đang dùng.
2. Xóa `editor.html` và `js/editor.js` khỏi dự án.
3. Xóa hai dòng `editor.html` và `js/editor.js` trong `.vercelignore` (hoặc xóa file `.vercelignore` nếu không còn quy tắc nào khác).
4. Commit/push thay đổi nếu muốn đồng bộ GitHub. Trang công khai vẫn lấy nội dung từ `js/data.js`.

## 10. Tạo QR để gửi cho các bạn

Chỉ tạo QR sau khi URL Production trên Vercel mở đúng phiên bản cuối:

1. Sao chép URL Production, dạng `https://ten-du-an.vercel.app` hoặc domain riêng.
2. Dán URL đó vào công cụ tạo mã QR bạn tin dùng và tải ảnh QR xuống PNG.
3. Dùng camera điện thoại quét thử QR; xác nhận nó mở đúng URL Production, không phải URL Preview.
4. Gửi ảnh QR hoặc in ra. Khi bạn deploy bản mới vào cùng URL Production, QR cũ vẫn dẫn tới bản mới.

## 11. Cấu trúc nội dung nếu cần sửa trực tiếp bằng code

- `window.ASSETS_20_10`: các ảnh dùng chung như `BOUQUET`, `MUSIC_BOX`, `LANTERNS`, `TRAIN`, `MASCOT_BUNNY`.
- `window.CLASSMATES_PROFILES`: tên từng bạn và lời chúc phần đầu trang.
- `window.DEFAULT_DATA_20_10.stories`: các trạm thư.
- `window.DEFAULT_DATA_20_10.gallery`: ảnh, tiêu đề, nhãn và mô tả gallery.
- `window.DEFAULT_DATA_20_10.wishesWall`: các lời nhắn.
- `window.DEFAULT_DATA_20_10.customAudioDataUrl`: bài nhạc tải lên; `selectedMelodyIndex`: giai điệu tạo sẵn.
- `window.DEFAULT_DATA_20_10.miniCompliments` và `mascotQuotes`: các câu ngắn trong game/linh vật.

Ưu tiên chỉnh qua editor, tải `data.js`, rồi thay file trong `js/`. Tránh sửa các chuỗi Base64 ảnh trực tiếp bằng tay vì rất dài và dễ làm hỏng cú pháp JavaScript.
