# Toán Vui cùng Pi

Web app học Toán cho học sinh tiểu học, lớp 1 đến lớp 5, sắp xếp theo các mạch kiến thức của **Chương trình môn Toán GDPT 2018**. App cá nhân, độc lập, miễn phí, không quảng cáo, không cần máy chủ.

> **Lưu ý:** toàn bộ nội dung (ghi nhớ, ví dụ, câu hỏi, nhiệm vụ, hình vẽ, nhân vật) do app tự biên soạn và tự sinh, chỉ mang tính tham khảo, ôn luyện thêm. Xem mục **Lưu ý & miễn trừ trách nhiệm** bên dưới.

## Có gì trong app

- **Nhân vật đồng hành:** mèo **Pi** (giảng bài, khen, động viên), cánh cụt **Tròn** (giữ nhiệm vụ thực tế), heo đất **Bi** (giữ hũ sao).
- **Lộ trình tuần tự** cho từng lớp: 5 lớp, 206 bài, chia theo chủ đề. Bài sau mở khi xong bài trước. Cuối mỗi chủ đề có bài ôn tập, có Ôn tập học kì 1 và Ôn tập cuối năm.
- **Mỗi bài 2 bước:** *Bài học* (Pi giảng phần ghi nhớ, làm mẫu 2 ví dụ, con làm thử 4 câu) và *Luyện tập* (10 câu). Câu hỏi được sinh ngẫu nhiên mỗi lần nên làm lại không bị trùng. Có hình minh họa: đồ vật để đếm, tia số, đồng hồ, thước kẻ, nhiệt kế, hình phẳng, hình khối, phân số, biểu đồ cột, biểu đồ tranh, biểu đồ hình quạt, tờ tiền… Trả lời sai thì Pi giải thích, câu đó quay lại ở cuối bài.
- **Nhiệm vụ thực tế:** mỗi chủ đề có một việc làm cùng ba mẹ (đo bàn học, đếm tiền đi chợ…). Con bấm "đã làm xong", ba mẹ xác nhận thì con được **+2 sao**.
- **Sao thưởng:** mỗi bước được 1–3 sao theo tỉ lệ đúng lần đầu. Gợi ý **1 sao = 1.000đ** do ba mẹ tự thưởng cho con (app không giữ hay chuyển tiền), hệ thống **tính tối đa 50 sao/tuần** (ba mẹ có thể hạ mức này). Sao vượt mức được ghi là "sao luyện tập", không tính tiền. Có huy hiệu và chuỗi ngày học 🔥.
- **Con đăng nhập** bằng mã PIN 4 số, chọn lớp muốn học (được ôn lại lớp dưới).
- **Ba mẹ đăng nhập** bằng số điện thoại/email + mật khẩu (hoặc mã PIN ba mẹ):
  - *Tổng quan:* sao tuần này, số phút học 7 ngày, gợi ý bài cần luyện lại.
  - *Duyệt:* xác nhận nhiệm vụ, tặng thêm sao.
  - *Thưởng:* số tiền chưa trao, bảng sao theo tuần, ghi sổ "Đã trao thưởng".
  - *Tài khoản:* thêm/sửa/xóa hồ sơ con, đổi PIN, mật khẩu, mức sao tối đa, mở khóa toàn bộ bài, sao lưu và khôi phục dữ liệu.
  - Khu vực ba mẹ tự khóa sau 10 phút không thao tác. Quên mật khẩu thì đặt lại bằng mã PIN ba mẹ.
- **Donate:** ở màn Ba mẹ đăng nhập và cuối tab Tổng quan có mã QR chuyển khoản "Donate Pi ly cafe cho tỉnh táo nếu ba mẹ thấy ổn nè ☕" (sửa trong `js/donate.js`), kèm ghi chú ủng hộ là tự nguyện, không ràng buộc.
- Lớp 1–2: nếu máy có giọng đọc tiếng Việt, đề bài được đọc to tự động; nút 🔊 để nghe lại.

## Tài khoản mẫu

Bấm **Mở gia đình mẫu** ở màn hình đầu (khung này tự ẩn khi máy đã có tài khoản thật).

- Ba mẹ: `demo` / `123456`, mã PIN ba mẹ `0000`
- Bông (lớp 1): PIN `1111`
- Tí (lớp 3): PIN `2222`

## Cấu trúc

- `index.html`: khung trang.
- `css/app.css`: giao diện (sáng/tối tự động).
- `js/curriculum.js`: **chương trình học** (chủ đề, bài, dạng bài, phần ghi nhớ, nhiệm vụ).
- `js/gen.js`: bộ sinh câu hỏi và chấm đáp án (khoảng 90 dạng bài).
- `js/mascots.js`: hình vẽ các nhân vật.
- `js/app.js`: tài khoản, lộ trình, bài học, sao thưởng, khu vực ba mẹ.
- `js/donate.js`: mã QR ủng hộ.
- `tests/gen.test.js`: sinh thử mọi dạng bài hàng trăm lần để kiểm tra đáp án. Chạy `node tests/gen.test.js`.

### Sửa nội dung bài học

Mỗi dòng trong `js/curriculum.js` là một bài:

```
Tên bài|Biểu tượng|dạng bài:tham số;dạng bài khác|Phần ghi nhớ Pi giảng
```

Dòng `@Tên chủ đề|biểu tượng|nhiệm vụ` mở một chủ đề mới; `@!` là chủ đề ôn tập. Tên dạng bài là tên hàm trong `GEN` ở `js/gen.js` (ví dụ `addx:2,2,1` là cộng số có hai chữ số với số có hai chữ số, có nhớ).

## Đưa lên GitHub Pages

Vào **Settings → Pages**, chọn **Deploy from a branch**, nhánh chứa code, thư mục `/ (root)`, bấm **Save**. Sau khoảng 1 phút app chạy tại `https://<tên-tài-khoản>.github.io/maths-easy/`.

## Dữ liệu được lưu ở đâu

Tài khoản, tiến độ và sao lưu trong **trình duyệt của từng máy** (localStorage), không gửi lên máy chủ nào. Muốn chuyển máy: **Tài khoản → Tải file sao lưu**, rồi trên máy mới bấm **Khôi phục từ file sao lưu**. Mật khẩu được băm SHA-256 trước khi lưu; đây là app dùng trong gia đình, không phải hệ thống bảo mật nhiều người dùng.

## Lưu ý & miễn trừ trách nhiệm

1. **Về ứng dụng.** Đây là ứng dụng cá nhân, độc lập, miễn phí hoàn toàn, không quảng cáo, không bán hàng, không thu phí dưới bất kỳ hình thức nào. Ứng dụng không đại diện, không liên kết và không được bảo trợ bởi bất kỳ tổ chức, cơ quan hay đơn vị nào.
2. **Về nội dung bài học.** Lộ trình được sắp xếp theo các mạch kiến thức của Chương trình môn Toán tiểu học (GDPT 2018) do Nhà nước ban hành công khai. Toàn bộ phần ghi nhớ, ví dụ, câu hỏi, nhiệm vụ, hình vẽ và nhân vật do ứng dụng tự biên soạn và tự sinh, không sao chép từ tài liệu, sách hay sản phẩm nào khác. Nội dung chỉ mang tính tham khảo, ôn luyện thêm, có thể còn sai sót, không thay thế giáo viên, sách giáo khoa và giờ học trên lớp. Ứng dụng được cung cấp "nguyên trạng", không cam kết hay bảo đảm về kết quả học tập.
3. **Về sao thưởng.** "1 sao = 1.000đ" chỉ là gợi ý để ba mẹ tự thỏa thuận và tự thưởng cho con. Ứng dụng không giữ tiền, không chuyển tiền, không phát sinh nghĩa vụ tài chính hay ràng buộc nào giữa ứng dụng với người dùng.
4. **Về ủng hộ (donate).** Việc ủng hộ là hoàn toàn tự nguyện, mang tính cho tặng, không phải tiền mua sản phẩm hay dịch vụ. Ủng hộ hay không đều dùng ứng dụng như nhau; người ủng hộ không nhận thêm quyền lợi, không có hợp đồng, không phát sinh nghĩa vụ hay trách nhiệm pháp lý nào giữa hai bên, và khoản ủng hộ không được hoàn lại.
5. **Về dữ liệu.** Dữ liệu chỉ lưu trong trình duyệt trên máy người dùng. Ứng dụng không thu thập, không gửi đi và không lưu trữ dữ liệu cá nhân trên máy chủ nào. Người dùng tự chịu trách nhiệm sao lưu.
6. **Giới hạn trách nhiệm.** Người phát triển không chịu trách nhiệm đối với bất kỳ thiệt hại trực tiếp hay gián tiếp nào phát sinh từ việc sử dụng ứng dụng. Sử dụng ứng dụng đồng nghĩa với việc đã đọc và đồng ý với các lưu ý trên.
