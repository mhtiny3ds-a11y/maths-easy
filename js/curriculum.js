/* =========================================================
   Chương trình Toán tiểu học lớp 1–5 (Chương trình GDPT 2018).
   Lộ trình sắp xếp theo các mạch kiến thức của chương trình; nội dung do ứng dụng tự biên soạn.
   Định dạng:
     #<lớp>
     @<Tên chủ đề>|<biểu tượng>|<nhiệm vụ thực tế làm cùng ba mẹ>
     @!<Tên>|<biểu tượng>|<nhiệm vụ>        ← chủ đề ôn tập (trộn các bài trước)
     <Tên bài>|<biểu tượng>|<dạng bài; dạng bài>|<Ghi nhớ của bài học>
   Dạng bài là tên hàm trong js/gen.js kèm tham số, ví dụ add:10 hay addx:2,2,1.
   ========================================================= */
const CURRICULUM_TEXT = `
#1
@Các số từ 0 đến 10|🔢|Đếm số đồ chơi của con, xếp thành từng nhóm rồi nói cho ba mẹ nghe mỗi nhóm có mấy cái.
Các số 0, 1, 2, 3, 4, 5|🖐️|count:0,5;seq:5,1|Đếm từng đồ vật, mỗi đồ vật chỉ đếm một lần. Số cuối cùng con đếm được chính là số lượng. Không có đồ vật nào thì viết số 0.
Các số 6, 7, 8, 9, 10|🔟|count:6,10;seq:10,1|Đếm tiếp sau 5 là 6, 7, 8, 9, 10. Số 10 có hai chữ số: chữ số 1 và chữ số 0.
Nhiều hơn, ít hơn, bằng nhau|⚖️|morefewer:8|Nối từng cái ở hàng trên với từng cái ở hàng dưới. Hàng nào còn thừa ra thì hàng đó nhiều hơn. Nối vừa hết thì hai hàng bằng nhau.
So sánh số|🐊|cmp:10;order:10|Dấu > đọc là "lớn hơn", dấu < đọc là "bé hơn", dấu = đọc là "bằng". Đầu nhọn của dấu luôn chỉ vào số bé hơn.
Mấy và mấy|🧩|split:10|Tách một nhóm thành hai phần: 5 gồm 2 và 3, 5 cũng gồm 1 và 4. Gộp hai phần lại được số ban đầu.
@Làm quen với một số hình phẳng|🔺|Tìm trong nhà 3 đồ vật có dạng hình tròn và 3 đồ vật có dạng hình vuông hoặc hình chữ nhật, chỉ cho ba mẹ xem.
Hình vuông, hình tròn, hình tam giác, hình chữ nhật|🟦|shape2:1|Hình vuông có 4 cạnh bằng nhau. Hình chữ nhật có 2 cạnh dài, 2 cạnh ngắn. Hình tam giác có 3 cạnh. Hình tròn không có cạnh.
Thực hành lắp ghép, xếp hình|🧱|shapecount:1;shape2:1|Nhìn kỹ từng hình, đếm lần lượt từ trái sang phải để không bỏ sót hình nào.
@Phép cộng, phép trừ trong phạm vi 10|➕|Dùng 10 hạt đậu hoặc 10 viên kẹo, cùng ba mẹ đố nhau 5 phép cộng và 5 phép trừ trong phạm vi 10.
Phép cộng trong phạm vi 10|➕|addpic:10;add:10|Gộp hai nhóm lại thì làm phép cộng, dấu "+". Ví dụ: 3 quả táo thêm 2 quả táo là 5 quả: 3 + 2 = 5.
Phép trừ trong phạm vi 10|➖|subpic:10;sub:10|Bớt đi, lấy đi thì làm phép trừ, dấu "−". Ví dụ: có 6 con chim, bay đi 2 con, còn 4 con: 6 − 2 = 4.
Bảng cộng, bảng trừ trong phạm vi 10|📋|add:10;sub:10;missing:10|Học thuộc bảng cộng giúp con trừ nhanh hơn: vì 4 + 3 = 7 nên 7 − 3 = 4 và 7 − 4 = 3.
@Làm quen với một số hình khối|🧊|Tìm trong nhà một đồ vật dạng khối lập phương (như xúc xắc) và một đồ vật dạng khối hộp chữ nhật (như hộp sữa), xếp thành một tòa tháp.
Khối lập phương, khối hộp chữ nhật|🧊|shape3:1|Khối lập phương có các mặt đều là hình vuông, giống con xúc xắc. Khối hộp chữ nhật giống hộp sữa, hộp bánh.
Vị trí, định hướng trong không gian|🧭|position|Tay con cầm thìa ăn cơm thường là tay phải, tay còn lại là tay trái. Trên là phía đầu, dưới là phía chân.
@!Ôn tập học kì 1|🏆|Kể cho ba mẹ nghe 3 điều con đã học ở học kì 1, rồi làm đúng 5 phép tính ba mẹ đố.
@Các số đến 100|💯|Đếm 100 hạt đậu bằng cách xếp thành 10 nhóm, mỗi nhóm 10 hạt.
Số có hai chữ số|🔟|tensones:99;numword:10,99|Số có hai chữ số gồm hàng chục và hàng đơn vị. Ví dụ 35 gồm 3 chục và 5 đơn vị, đọc là "ba mươi lăm".
So sánh số có hai chữ số|🐊|cmp:99;order:99|So sánh chữ số hàng chục trước: số nào có hàng chục lớn hơn thì lớn hơn. Hàng chục bằng nhau thì so sánh hàng đơn vị.
Bảng các số từ 1 đến 100|🔢|seq:100,1;nextprev:100|Số liền sau hơn số đã cho 1 đơn vị, số liền trước kém số đã cho 1 đơn vị. Các số trên một hàng ngang của bảng hơn nhau 1, trên một cột dọc hơn nhau 10.
@Độ dài và đo độ dài|📏|Dùng thước kẻ đo chiều dài quyển vở, bút chì và hộp bút của con, đọc kết quả cho ba mẹ nghe.
Dài hơn, ngắn hơn|📐|longer|Muốn so sánh độ dài hai vật, đặt chúng thẳng hàng ở một đầu. Vật nào thò ra xa hơn ở đầu kia thì dài hơn.
Đơn vị đo độ dài: xăng-ti-mét|📏|ruler:15;uarith:cm,50,1|Xăng-ti-mét viết tắt là cm. Khi đo, đặt một đầu vật trùng với vạch 0 của thước, đầu kia chỉ vạch nào thì vật dài bấy nhiêu xăng-ti-mét.
Thực hành ước lượng và đo độ dài|✋|estimate;ruler:15|Gang tay của con dài khoảng 12–15 cm. Ước lượng trước rồi dùng thước đo lại để kiểm tra.
@Phép cộng, phép trừ (không nhớ) trong phạm vi 100|🧮|Đi chợ cùng ba mẹ, tính tổng số quả mua được (ví dụ 12 quả cam và 5 quả quýt).
Phép cộng số có hai chữ số với số có một chữ số|➕|addx:2,1,0|Đặt tính thẳng cột: đơn vị thẳng đơn vị. Cộng hàng đơn vị trước, rồi viết hàng chục xuống.
Phép cộng số có hai chữ số với số có hai chữ số|➕|addx:2,2,0|Đặt tính thẳng cột, cộng từ phải sang trái: đơn vị cộng đơn vị, chục cộng chục.
Phép trừ số có hai chữ số cho số có một chữ số|➖|subx:2,1,0|Đặt tính thẳng cột. Trừ hàng đơn vị trước, rồi viết hàng chục xuống.
Phép trừ số có hai chữ số cho số có hai chữ số|➖|subx:2,2,0;wp:addsub,99|Trừ từ phải sang trái: đơn vị trừ đơn vị, chục trừ chục. Thử lại bằng phép cộng.
@Thời gian. Giờ và lịch|⏰|Mỗi sáng nhìn đồng hồ và nói cho ba mẹ biết con thức dậy lúc mấy giờ, hôm nay là thứ mấy.
Xem giờ đúng trên đồng hồ|🕗|clock:1|Kim ngắn chỉ giờ, kim dài chỉ phút. Khi kim dài chỉ số 12, kim ngắn chỉ số nào thì đó là đúng bấy nhiêu giờ.
Các ngày trong tuần|📅|weekday|Một tuần có 7 ngày: Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ nhật.
Thực hành xem lịch và giờ|🗓️|clock:1;weekday;calendar:1|Tờ lịch cho biết thứ, ngày và tháng. Ngày mai thì cộng thêm 1 ngày.
@!Ôn tập cuối năm|🎓|Cùng ba mẹ làm một "bài kiểm tra vui" 10 câu do ba mẹ đố, có thưởng một cái ôm thật chặt.
#2
@Ôn tập và bổ sung|📘|Đếm số bậc cầu thang nhà con (hoặc số cây trên đường đi học), ghi lại và đọc số cho ba mẹ nghe.
Ôn tập các số đến 100|🔢|tensones:99;cmp:99;place:2|Số có hai chữ số: chữ số bên trái là hàng chục, bên phải là hàng đơn vị. Ví dụ 47 = 40 + 7.
Tia số. Số liền trước, số liền sau|➡️|numline:100;nextprev:100|Trên tia số, số bên phải lớn hơn số bên trái. Số liền sau = số đó + 1, số liền trước = số đó − 1.
Các thành phần của phép cộng, phép trừ|🏷️|parts:1;missing:100|Số hạng + Số hạng = Tổng. Số bị trừ − Số trừ = Hiệu.
Hơn, kém nhau bao nhiêu|↔️|diff:100|Muốn biết số lớn hơn số bé bao nhiêu, lấy số lớn trừ đi số bé.
Ôn tập phép cộng, phép trừ (không nhớ) trong phạm vi 100|🧮|addx:2,2,0;subx:2,2,0|Đặt tính thẳng cột rồi tính từ phải sang trái.
@Phép cộng, phép trừ trong phạm vi 20|➕|Chơi "đố nhanh" với ba mẹ: mỗi người đố 5 phép cộng qua 10 (ví dụ 8 + 5), ai trả lời đúng và nhanh được 1 điểm.
Phép cộng (qua 10) trong phạm vi 20|🔟|add:20,1|Tách số để làm tròn 10: 8 + 5 = 8 + 2 + 3 = 10 + 3 = 13.
Bảng cộng (qua 10)|📋|add:20,1;missing:20|Học thuộc bảng cộng qua 10: 9 + 2 = 11, 8 + 3 = 11, 7 + 4 = 11… Đổi chỗ hai số hạng thì tổng không đổi.
Bài toán về thêm, bớt một số đơn vị|📖|wp:add,20;wp:sub,20|Đọc kỹ đề: "thêm, được cho thêm, tất cả" thường làm phép cộng; "bớt, cho đi, còn lại" thường làm phép trừ.
Phép trừ (qua 10) trong phạm vi 20|➖|sub:20,1|Trừ để về 10 trước: 13 − 5 = 13 − 3 − 2 = 10 − 2 = 8.
Bảng trừ (qua 10)|📋|sub:20,1;missing:20|Dựa vào bảng cộng để trừ: vì 7 + 6 = 13 nên 13 − 6 = 7.
Bài toán về nhiều hơn, ít hơn một số đơn vị|📖|wp:more,20;wp:less,20|"Nhiều hơn" một số đơn vị thì làm phép cộng; "ít hơn" một số đơn vị thì làm phép trừ.
@Làm quen với khối lượng, dung tích|⚖️|Cùng ba mẹ đọc trên bao gạo, hộp sữa, chai nước ghi bao nhiêu ki-lô-gam hoặc bao nhiêu lít.
Nặng hơn, nhẹ hơn. Ki-lô-gam|⚖️|heavier;uarith:kg,50|Ki-lô-gam (kg) là đơn vị đo khối lượng. Dùng cân để biết vật nặng bao nhiêu ki-lô-gam.
Lít|🥛|uarith:l,50|Lít (l) là đơn vị đo dung tích, dùng để đo lượng nước, sữa, dầu…
@Phép cộng, phép trừ (có nhớ) trong phạm vi 100|🧮|Tính tổng giá tiền 2 món đồ khi đi chợ cùng ba mẹ (ví dụ 35 nghìn đồng và 27 nghìn đồng).
Phép cộng (có nhớ) số có hai chữ số với số có một chữ số|➕|addx:2,1,1|Cộng hàng đơn vị, nếu được 10 trở lên thì viết chữ số đơn vị và nhớ 1 sang hàng chục.
Phép cộng (có nhớ) số có hai chữ số với số có hai chữ số|➕|addx:2,2,1|Cộng đơn vị trước, nhớ 1 sang hàng chục nếu cần, rồi cộng chục với chục và thêm 1 đã nhớ.
Phép trừ (có nhớ) số có hai chữ số cho số có một chữ số|➖|subx:2,1,1|Chữ số hàng đơn vị ở trên bé hơn thì lấy thêm 1 chục (thành số có hai chữ số) để trừ, rồi bớt 1 ở hàng chục.
Phép trừ (có nhớ) số có hai chữ số cho số có hai chữ số|➖|subx:2,2,1;wp:addsub,99|Trừ đơn vị trước (mượn 1 chục nếu cần), sau đó trừ chục, nhớ trả lại 1 chục đã mượn.
@Làm quen với hình phẳng|📐|Dùng que tính hoặc ống hút xếp một đường gấp khúc và một hình tứ giác, chụp ảnh gửi ba mẹ.
Điểm, đoạn thẳng, đường thẳng, đường cong, ba điểm thẳng hàng|📍|lines|Đoạn thẳng có hai đầu mút. Đường thẳng kéo dài mãi về hai phía. Ba điểm cùng nằm trên một đường thẳng là ba điểm thẳng hàng.
Đường gấp khúc. Hình tứ giác|〰️|polyline:2;shape2:2|Độ dài đường gấp khúc bằng tổng độ dài các đoạn thẳng của nó. Hình tứ giác có 4 cạnh.
Thực hành gấp, cắt, ghép, xếp hình. Vẽ đoạn thẳng|✂️|shapecount:2;ruler:15|Hình vuông và hình chữ nhật cũng là hình tứ giác. Vẽ đoạn thẳng: chấm hai điểm rồi dùng thước nối lại.
@Ngày – giờ, giờ – phút, ngày – tháng|⏰|Ghi lại giờ con đi ngủ và giờ thức dậy trong 3 ngày liền.
Ngày – giờ, giờ – phút|🕒|clock:2;timeconv:1|Một ngày có 24 giờ. Một giờ có 60 phút. 15 giờ còn gọi là 3 giờ chiều.
Ngày – tháng|📅|calendar:1;weekday|Xem tờ lịch tháng để biết một ngày là thứ mấy và tháng đó có bao nhiêu ngày.
@!Ôn tập học kì 1|🏆|Cùng ba mẹ ôn lại bảng cộng, bảng trừ qua 10 bằng trò chơi lật thẻ.
@Phép nhân, phép chia|✖️|Xếp đồ chơi thành các hàng đều nhau (ví dụ 3 hàng, mỗi hàng 5 cái) rồi nói phép nhân tương ứng cho ba mẹ nghe.
Phép nhân|✖️|repadd:5|Các số hạng bằng nhau thì viết thành phép nhân: 2 + 2 + 2 = 2 × 3 (2 được lấy 3 lần).
Thừa số, tích|🏷️|parts:2;repadd:5|Trong phép nhân 2 × 3 = 6: 2 và 3 là thừa số, 6 là tích.
Bảng nhân 2|2️⃣|mul:2|Mỗi lần thêm 2: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20.
Bảng nhân 5|5️⃣|mul:5;wp:mul,5|Đếm thêm 5: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50. Tích của bảng nhân 5 luôn tận cùng là 0 hoặc 5.
Phép chia|➗|divshare:5|Chia đều thành các phần bằng nhau thì làm phép chia, dấu ":". Từ 2 × 3 = 6 ta có 6 : 2 = 3 và 6 : 3 = 2.
Số bị chia, số chia, thương|🏷️|parts:3;div:2,5|Trong phép chia 6 : 2 = 3: 6 là số bị chia, 2 là số chia, 3 là thương.
Bảng chia 2|2️⃣|div:2|Dựa vào bảng nhân 2 để chia: vì 2 × 7 = 14 nên 14 : 2 = 7.
Bảng chia 5|5️⃣|div:5;wp:div,5|Dựa vào bảng nhân 5 để chia: vì 5 × 6 = 30 nên 30 : 5 = 6.
@Làm quen với hình khối|🥫|Tìm trong nhà một đồ vật dạng khối trụ (như lon nước) và một đồ vật dạng khối cầu (như quả bóng).
Khối trụ, khối cầu|🥫|shape3:2|Khối trụ có hai mặt đáy là hình tròn, lăn được. Khối cầu tròn đều mọi phía như quả bóng.
@Các số trong phạm vi 1000|💯|Đọc cho ba mẹ nghe số trang của 5 cuốn sách trong nhà, rồi tìm cuốn dày nhất.
Các số tròn trăm, tròn chục|💯|seq:1000,100;seq:1000,10|Số tròn chục có chữ số hàng đơn vị là 0 (như 30, 250). Số tròn trăm có hai chữ số tận cùng là 00 (như 300, 700).
So sánh các số tròn trăm, tròn chục|🐊|cmp:1000;order:1000|Số nào có chữ số hàng trăm lớn hơn thì lớn hơn. Hàng trăm bằng nhau thì so sánh hàng chục.
Các số có ba chữ số|3️⃣|place:3;numword:100,999|Số có ba chữ số gồm hàng trăm, hàng chục, hàng đơn vị. Ví dụ 254 đọc là "hai trăm năm mươi tư".
Viết số thành tổng các trăm, chục, đơn vị|🧱|expand:3|Ví dụ 254 = 200 + 50 + 4.
So sánh các số có ba chữ số|🐊|cmp:999;order:999|So sánh lần lượt từ hàng trăm, đến hàng chục, rồi hàng đơn vị.
@Độ dài và đơn vị đo độ dài. Tiền Việt Nam|💵|Cùng ba mẹ "chơi bán hàng": con chọn các tờ tiền để trả đúng số tiền của món hàng.
Đề-xi-mét. Mét. Ki-lô-mét|📏|unit:len2;uarith:m,100|1 dm = 10 cm; 1 m = 10 dm = 100 cm; 1 km = 1000 m.
Giới thiệu tiền Việt Nam|💵|money:1|Đơn vị tiền Việt Nam là đồng. Có các tờ tiền 1 nghìn, 2 nghìn, 5 nghìn, 10 nghìn đồng…
@Phép cộng, phép trừ trong phạm vi 1000|🧮|Cùng ba mẹ tính số cây số (km) của một chuyến đi xa, hoặc số tiền điện, nước trong tháng.
Phép cộng, phép trừ (không nhớ) trong phạm vi 1000|➕|addx:3,3,0;subx:3,3,0|Đặt tính thẳng cột: trăm thẳng trăm, chục thẳng chục, đơn vị thẳng đơn vị. Tính từ phải sang trái.
Phép cộng (có nhớ) trong phạm vi 1000|➕|addx:3,2,1;addx:3,3,1|Hàng nào cộng được 10 trở lên thì nhớ 1 sang hàng bên trái.
Phép trừ (có nhớ) trong phạm vi 1000|➖|subx:3,2,1;subx:3,3,1|Hàng nào chữ số trên bé hơn chữ số dưới thì mượn 1 từ hàng bên trái, rồi trả lại khi trừ hàng đó.
@Làm quen với yếu tố thống kê, xác suất|📊|Hỏi mọi người trong nhà thích ăn quả gì, đếm và vẽ biểu đồ tranh trên giấy.
Thu thập, phân loại, kiểm đếm số liệu|🧺|tally|Phân loại đồ vật theo từng nhóm rồi đếm. Gạch từng cái đã đếm để không bị đếm trùng.
Biểu đồ tranh|📊|picchart|Trong biểu đồ tranh, mỗi hình biểu thị một số lượng. Đếm số hình ở mỗi hàng để biết số lượng.
Chắc chắn, có thể, không thể|🎲|chance:1|Sự việc luôn xảy ra là "chắc chắn"; có lúc xảy ra là "có thể"; không bao giờ xảy ra là "không thể".
@!Ôn tập cuối năm|🎓|Cùng ba mẹ làm một "bài kiểm tra vui" 10 câu, sau đó con đố lại ba mẹ 3 câu.
#3
@Ôn tập và bổ sung|📘|Đọc cho ba mẹ nghe giá tiền của 5 món đồ trong siêu thị hoặc trên tờ rơi quảng cáo.
Ôn tập các số đến 1000|🔢|place:3;cmp:999;numword:100,999|Số có ba chữ số gồm trăm, chục, đơn vị. So sánh lần lượt từ hàng trăm.
Ôn tập phép cộng, phép trừ trong phạm vi 1000|🧮|addx:3,3,2;subx:3,3,2|Đặt tính thẳng cột, nhớ hoặc mượn sang hàng bên trái khi cần.
Tìm thành phần trong phép cộng, phép trừ|🔍|missing:1000|Số hạng = Tổng − Số hạng kia. Số bị trừ = Hiệu + Số trừ. Số trừ = Số bị trừ − Hiệu.
Ôn tập bảng nhân 2, 5; bảng chia 2, 5|📋|mul:2,5;div:2,5|Nhớ lại bảng nhân 2 và bảng nhân 5, dùng bảng nhân để suy ra bảng chia.
Bảng nhân 3, bảng chia 3|3️⃣|mul:3;div:3|Đếm thêm 3: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30.
Bảng nhân 4, bảng chia 4|4️⃣|mul:4;div:4|Đếm thêm 4: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40.
Tìm thành phần trong phép nhân, phép chia|🔍|missmul:5|Thừa số = Tích : Thừa số kia. Số bị chia = Thương × Số chia. Số chia = Số bị chia : Thương.
@Bảng nhân, bảng chia|✖️|Đọc thuộc lòng một bảng nhân cho ba mẹ nghe mỗi tối, ba mẹ hỏi xen kẽ 5 phép tính bất kì.
Bảng nhân 6, bảng chia 6|6️⃣|mul:6;div:6|Đếm thêm 6: 6, 12, 18, 24, 30, 36, 42, 48, 54, 60.
Bảng nhân 7, bảng chia 7|7️⃣|mul:7;div:7|Đếm thêm 7: 7, 14, 21, 28, 35, 42, 49, 56, 63, 70.
Bảng nhân 8, bảng chia 8|8️⃣|mul:8;div:8|Đếm thêm 8: 8, 16, 24, 32, 40, 48, 56, 64, 72, 80.
Bảng nhân 9, bảng chia 9|9️⃣|mul:9;div:9|Đếm thêm 9: 9, 18, 27, 36, 45, 54, 63, 72, 81, 90.
Một phần mấy|🍕|fracpart:1|Chia một hình thành các phần bằng nhau, lấy một phần thì được "một phần mấy". Ví dụ chia 4 phần, lấy 1 phần: 1/4.
@Làm quen với hình phẳng, hình khối|📐|Dùng com-pa (hoặc một sợi dây và cây bút) vẽ một hình tròn, đo bán kính và đường kính cho ba mẹ xem.
Điểm ở giữa. Trung điểm của đoạn thẳng|📍|midpoint|Trung điểm là điểm ở giữa và chia đoạn thẳng thành hai đoạn dài bằng nhau.
Hình tròn. Tâm, bán kính, đường kính|⭕|circle|Đường kính đi qua tâm và dài gấp 2 lần bán kính. Mọi bán kính của một hình tròn đều bằng nhau.
Góc, góc vuông, góc không vuông|📐|angle:1|Dùng ê-ke để kiểm tra góc vuông. Góc nào trùng với góc vuông của ê-ke là góc vuông.
Hình tam giác, hình tứ giác. Hình chữ nhật, hình vuông|🟥|shape2:3;shapecount:2|Hình chữ nhật có 4 góc vuông, 2 cạnh dài bằng nhau và 2 cạnh ngắn bằng nhau. Hình vuông có 4 góc vuông và 4 cạnh bằng nhau.
Khối lập phương, khối hộp chữ nhật|🧊|shape3:3|Khối lập phương và khối hộp chữ nhật đều có 6 mặt, 8 đỉnh và 12 cạnh.
@Phép nhân, phép chia trong phạm vi 100|✖️|Chia đều một gói kẹo cho mọi người trong nhà, xem mỗi người được mấy cái và còn dư mấy cái.
Nhân số có hai chữ số với số có một chữ số|✖️|mulx:2,1|Đặt tính, nhân từ phải sang trái: lấy thừa số thứ hai nhân lần lượt với hàng đơn vị, rồi hàng chục, nhớ sang hàng bên trái.
Gấp một số lên một số lần|⬆️|times:up|Muốn gấp một số lên nhiều lần, ta lấy số đó nhân với số lần.
Phép chia hết và phép chia có dư|🍬|divrem:50|Trong phép chia có dư, số dư luôn bé hơn số chia. Ví dụ 17 : 5 = 3 (dư 2).
Chia số có hai chữ số cho số có một chữ số|➗|divx:2,1|Chia từ trái sang phải: chia hàng chục trước, rồi hạ hàng đơn vị xuống để chia tiếp.
Giảm một số đi một số lần|⬇️|times:down|Muốn giảm một số đi nhiều lần, ta lấy số đó chia cho số lần.
Bài toán giải bằng hai bước tính|📖|wp:two,60|Đọc kỹ đề, tìm cái chưa biết ở bước 1 trước, rồi dùng kết quả đó để tính bước 2.
@Một số đơn vị đo độ dài, khối lượng, dung tích, nhiệt độ|🌡️|Dùng nhiệt kế (hoặc xem dự báo thời tiết) ghi lại nhiệt độ trong 3 ngày, so sánh ngày nào nóng nhất.
Mi-li-mét|📏|unit:mm|1 cm = 10 mm; 1 m = 1000 mm. Mi-li-mét dùng để đo những vật rất nhỏ.
Gam|⚖️|unit:mass;uarith:g,1000|1 kg = 1000 g. Gam dùng để cân những vật nhẹ.
Mi-li-lít|🥛|unit:cap;uarith:ml,1000|1 l = 1000 ml. Mi-li-lít dùng để đo lượng chất lỏng ít.
Nhiệt độ. Đơn vị đo nhiệt độ|🌡️|thermo|Độ C (°C) là đơn vị đo nhiệt độ. Nhiệt độ cơ thể người khỏe mạnh khoảng 37 °C.
@Phép nhân, phép chia trong phạm vi 1000|🧮|Tính số tiền mua 3 món đồ giống nhau cùng ba mẹ, rồi tính số tiền nếu chia đều cho 2 người.
Nhân số có ba chữ số với số có một chữ số|✖️|mulx:3,1|Nhân lần lượt từ hàng đơn vị, hàng chục đến hàng trăm, nhớ sang hàng bên trái.
Chia số có ba chữ số cho số có một chữ số|➗|divx:3,1|Chia lần lượt từ hàng trăm. Nếu chữ số hàng trăm bé hơn số chia thì lấy hai chữ số đầu để chia.
Biểu thức số. Tính giá trị của biểu thức số|🧾|expr:1|Biểu thức có ngoặc thì tính trong ngoặc trước. Có cả cộng, trừ, nhân, chia thì nhân, chia trước; cộng, trừ sau.
So sánh số lớn gấp mấy lần số bé|🔍|times:ratio|Muốn biết số lớn gấp mấy lần số bé, ta lấy số lớn chia cho số bé.
@!Ôn tập học kì 1|🏆|Cùng ba mẹ chơi "đố bảng nhân" bằng xúc xắc: tung hai lần và nhân hai số với nhau.
@Các số đến 10 000|🔢|Tìm 3 con số có bốn chữ số quanh con (biển số xe, năm sinh, giá tiền) và đọc cho ba mẹ nghe.
Các số có bốn chữ số. Số 10 000|4️⃣|place:4;numword:1000,9999|Số có bốn chữ số gồm hàng nghìn, trăm, chục, đơn vị. Ví dụ 3452 đọc là "ba nghìn bốn trăm năm mươi hai".
So sánh các số trong phạm vi 10 000|🐊|cmp:9999;order:9999|Số nào có nhiều chữ số hơn thì lớn hơn. Cùng số chữ số thì so sánh lần lượt từ hàng cao nhất.
Làm tròn số đến hàng chục, hàng trăm|🎯|round:9999,10;round:9999,100|Chữ số bên phải hàng cần làm tròn bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.
Làm quen với chữ số La Mã|🏛️|roman:20|I = 1, V = 5, X = 10. Chữ số nhỏ đứng trước chữ số lớn thì trừ (IV = 4), đứng sau thì cộng (VI = 6).
@Chu vi, diện tích một số hình phẳng|🟩|Đo chiều dài, chiều rộng mặt bàn học của con rồi tính chu vi mặt bàn.
Chu vi hình tam giác, hình tứ giác, hình chữ nhật, hình vuông|🔲|perim|Chu vi là tổng độ dài các cạnh. Chu vi hình chữ nhật = (dài + rộng) × 2. Chu vi hình vuông = cạnh × 4.
Diện tích của một hình. Xăng-ti-mét vuông|▦|areagrid|Xăng-ti-mét vuông (cm²) là diện tích hình vuông có cạnh 1 cm. Đếm số ô vuông 1 cm² để biết diện tích.
Diện tích hình chữ nhật, diện tích hình vuông|🟩|area:rect|Diện tích hình chữ nhật = dài × rộng (cùng đơn vị đo). Diện tích hình vuông = cạnh × cạnh.
@Cộng, trừ, nhân, chia trong phạm vi 10 000|🧮|Cùng ba mẹ tính tổng số tiền của hóa đơn đi chợ (làm tròn đến nghìn đồng).
Phép cộng, phép trừ trong phạm vi 10 000|➕|addx:4,3,2;subx:4,4,2|Đặt tính thẳng cột theo từng hàng, tính từ phải sang trái.
Phép nhân, phép chia trong phạm vi 10 000|✖️|mulx:4,1;divx:4,1|Nhân từ phải sang trái; chia từ trái sang phải. Thử lại phép chia bằng phép nhân.
@Các số đến 100 000|🔢|Tìm trên báo hoặc ti vi một số có năm chữ số và đọc cho ba mẹ nghe.
Các số trong phạm vi 100 000|5️⃣|place:5;numword:10000,99999|Số có năm chữ số gồm hàng chục nghìn, nghìn, trăm, chục, đơn vị. Ví dụ 45 213 đọc là "bốn mươi lăm nghìn hai trăm mười ba".
So sánh các số trong phạm vi 100 000|🐊|cmp:99999;order:99999|So sánh lần lượt từ hàng chục nghìn sang phải.
Làm tròn số đến hàng nghìn, hàng chục nghìn|🎯|round:99999,1000;round:99999,10000|Xét chữ số ngay bên phải hàng cần làm tròn: bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.
@Cộng, trừ trong phạm vi 100 000|➕|Cùng ba mẹ cộng số tiền của 2 món đồ lớn (ví dụ 35 000 đồng và 48 500 đồng).
Phép cộng trong phạm vi 100 000|➕|addx:5,4,2;addx:4,4,2|Đặt tính thẳng cột theo từng hàng, cộng từ phải sang trái, nhớ sang hàng bên trái.
Phép trừ trong phạm vi 100 000|➖|subx:5,4,2;subx:5,5,2|Đặt tính thẳng cột, trừ từ phải sang trái, mượn ở hàng bên trái khi cần.
@Xem đồng hồ. Tháng – năm. Tiền Việt Nam|⏰|Xem lịch treo tường, đếm xem tháng này có bao nhiêu ngày và còn mấy ngày nữa đến sinh nhật con.
Xem đồng hồ|🕒|clock:3;clock:4|Kim dài chỉ phút: mỗi số trên mặt đồng hồ cách nhau 5 phút. Mỗi vạch nhỏ là 1 phút.
Tháng – năm|📅|calendar:2|Một năm có 12 tháng. Tháng 4, 6, 9, 11 có 30 ngày; tháng 2 có 28 hoặc 29 ngày; các tháng khác có 31 ngày.
Tiền Việt Nam|💵|money:2|Có các tờ tiền 1 000, 2 000, 5 000, 10 000, 20 000, 50 000, 100 000 đồng… Cộng các tờ tiền để biết tổng số tiền.
@Nhân, chia trong phạm vi 100 000|✖️|Tính số tiền để mua 4 cuốn truyện giống nhau mà con thích.
Nhân số có năm chữ số với số có một chữ số|✖️|mulx:5,1;mulx:4,1|Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái.
Chia số có năm chữ số cho số có một chữ số|➗|divx:5,1;divx:4,1|Chia lần lượt từ trái sang phải; mỗi lần chia: chia, nhân, trừ, hạ.
@Làm quen với yếu tố thống kê, xác suất|📊|Ghi lại thời tiết (nắng, mưa, nhiều mây) trong 7 ngày, lập bảng số liệu và cho ba mẹ xem.
Thu thập, phân loại, ghi chép số liệu. Bảng số liệu|📋|datatable|Bảng số liệu giúp ghi chép gọn gàng. Đọc tên hàng và cột để tìm đúng số liệu cần dùng.
Khả năng xảy ra của một sự kiện|🎲|chance:2|Một sự kiện có thể "chắc chắn", "có thể" hoặc "không thể" xảy ra.
@!Ôn tập cuối năm|🎓|Con làm "thầy cô giáo": giảng lại cho ba mẹ cách tính chu vi và diện tích hình chữ nhật.
#4
@Ôn tập và bổ sung|📘|Cùng ba mẹ tìm các số chẵn trên biển số nhà khi đi dạo.
Ôn tập các số đến 100 000|🔢|place:5;cmp:99999|Số có năm chữ số: đọc và viết theo từng hàng từ trái sang phải.
Ôn tập các phép tính trong phạm vi 100 000|🧮|addx:5,4,2;subx:5,4,2;mulx:4,1;divx:5,1|Đặt tính thẳng cột. Thử lại phép trừ bằng phép cộng, phép chia bằng phép nhân.
Số chẵn, số lẻ|🔢|evenodd:9999|Số có chữ số tận cùng 0, 2, 4, 6, 8 là số chẵn. Số có chữ số tận cùng 1, 3, 5, 7, 9 là số lẻ.
Biểu thức chứa chữ|🔤|exprvar|Thay chữ bằng số đã cho, rồi tính giá trị của biểu thức.
Giải bài toán có ba bước tính|📖|wp:three|Tóm tắt đề, tính lần lượt từng bước. Kiểm tra lại đơn vị trong câu trả lời.
@Góc và đơn vị đo góc|📐|Tìm trong nhà 3 góc vuông, 1 góc nhọn và 1 góc tù (mở cánh cửa, kéo, compa…).
Đo góc, đơn vị đo góc|📐|angledeg|Độ (°) là đơn vị đo góc. Dùng thước đo góc: tâm thước trùng đỉnh góc, một cạnh trùng vạch 0°. Góc vuông bằng 90°.
Góc nhọn, góc tù, góc bẹt|📐|angle:2|Góc nhọn bé hơn góc vuông. Góc tù lớn hơn góc vuông nhưng bé hơn góc bẹt. Góc bẹt bằng 180°.
@Số có nhiều chữ số|🔢|Tìm trên mạng hoặc sách số dân của Việt Nam và tỉnh/thành phố con đang sống, đọc cho ba mẹ nghe.
Số có sáu chữ số. Số 1 000 000|6️⃣|place:6;numword:100000,999999|Số có sáu chữ số có thêm hàng trăm nghìn. Mười trăm nghìn là một triệu: 1 000 000.
Hàng và lớp|🏢|placeclass|Lớp đơn vị gồm hàng đơn vị, chục, trăm. Lớp nghìn gồm hàng nghìn, chục nghìn, trăm nghìn. Lớp triệu gồm hàng triệu, chục triệu, trăm triệu.
Các số trong phạm vi lớp triệu|💰|numword:1000000,999999999;place:9|Đọc số theo từng lớp từ trái sang phải: lớp triệu, lớp nghìn, lớp đơn vị.
Làm tròn số đến hàng trăm nghìn|🎯|round:9999999,100000|Xét chữ số hàng chục nghìn: bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.
So sánh các số có nhiều chữ số|🐊|cmp:999999999;order:999999999|Số nào có nhiều chữ số hơn thì lớn hơn. Cùng số chữ số thì so sánh từng cặp chữ số từ trái sang phải.
Làm quen với dãy số tự nhiên|♾️|seq:1000,1;nextprev:999999|Các số 0, 1, 2, 3, … là dãy số tự nhiên. Hai số tự nhiên liên tiếp hơn kém nhau 1 đơn vị.
@Một số đơn vị đo đại lượng|⚖️|Cùng ba mẹ cân một túi gạo hoặc trái cây, đổi kết quả ra gam và yến.
Yến, tạ, tấn|🚚|unit:mass2|1 yến = 10 kg; 1 tạ = 100 kg; 1 tấn = 1000 kg.
Đề-xi-mét vuông, mét vuông, mi-li-mét vuông|▦|unit:area|1 dm² = 100 cm²; 1 m² = 100 dm²; 1 cm² = 100 mm².
Giây, thế kỉ|⏱️|unit:time;century|1 phút = 60 giây. 1 thế kỉ = 100 năm. Từ năm 2001 đến năm 2100 là thế kỉ XXI.
@Phép cộng và phép trừ|➕|Cùng ba mẹ tính tổng chi tiêu của gia đình trong một tuần (số tròn nghìn).
Phép cộng các số có nhiều chữ số|➕|addx:6,6,2;addx:6,5,2|Đặt tính thẳng cột theo từng hàng, cộng từ phải sang trái.
Phép trừ các số có nhiều chữ số|➖|subx:6,6,2;subx:6,5,2|Đặt tính thẳng cột theo từng hàng, trừ từ phải sang trái.
Tính chất giao hoán và kết hợp của phép cộng|🔄|props:add|a + b = b + a. (a + b) + c = a + (b + c). Nhóm các số tròn chục, tròn trăm để tính nhanh.
Tìm hai số biết tổng và hiệu của hai số đó|⚖️|wp:sumdiff|Số lớn = (Tổng + Hiệu) : 2. Số bé = (Tổng − Hiệu) : 2.
@Đường thẳng vuông góc, đường thẳng song song|📏|Tìm trong nhà 3 cặp cạnh vuông góc và 3 cặp cạnh song song (mép bàn, khung cửa…).
Hai đường thẳng vuông góc|➕|perpar:1|Hai đường thẳng vuông góc cắt nhau tạo thành 4 góc vuông. Dùng ê-ke để kiểm tra.
Hai đường thẳng song song|🟰|perpar:2|Hai đường thẳng song song không bao giờ cắt nhau, dù kéo dài mãi.
Hình bình hành, hình thoi|🔷|shape2:4|Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau. Hình thoi có hai cặp cạnh đối diện song song và 4 cạnh bằng nhau.
@!Ôn tập học kì 1|🏆|Con tự soạn 5 câu đố về số có nhiều chữ số để đố ba mẹ.
@Phép nhân và phép chia|✖️|Cùng ba mẹ tính tiền điện: số điện (kWh) nhân với giá tiền mỗi số (làm tròn).
Nhân với số có một chữ số|✖️|mulx:6,1|Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái.
Chia cho số có một chữ số|➗|divx:6,1|Chia lần lượt từ trái sang phải: chia, nhân, trừ, hạ.
Tính chất giao hoán và kết hợp của phép nhân|🔄|props:mul|a × b = b × a. (a × b) × c = a × (b × c). Nhóm 2 × 5, 4 × 25, 8 × 125 để tính nhanh.
Nhân, chia với 10, 100, 1 000, …|🔟|mul10|Nhân với 10, 100, 1000 thì viết thêm 1, 2, 3 chữ số 0 vào bên phải. Chia thì bỏ bớt chữ số 0 ở bên phải.
Tính chất phân phối của phép nhân đối với phép cộng|🧩|props:dist|a × (b + c) = a × b + a × c.
Nhân với số có hai chữ số|✖️|mulx:3,2;mulx:2,2|Nhân lần lượt với chữ số hàng đơn vị và hàng chục, viết tích riêng thứ hai lùi sang trái một cột, rồi cộng hai tích riêng.
Chia cho số có hai chữ số|➗|divx:4,2;divx:3,2|Ước lượng thương bằng cách làm tròn số chia, thử lại bằng phép nhân, điều chỉnh nếu cần.
Thực hành và trải nghiệm ước lượng trong tính toán|🎯|estround|Làm tròn các số rồi tính nhẩm để ước lượng kết quả, giúp kiểm tra kết quả có hợp lý không.
@Làm quen với yếu tố thống kê, xác suất|📊|Đo chiều cao của mọi người trong nhà, ghi thành dãy số liệu và vẽ biểu đồ cột.
Dãy số liệu thống kê|📋|dataseq:1|Dãy số liệu là các số được ghi lại theo thứ tự. Đọc, đếm, so sánh các số liệu để rút ra nhận xét.
Biểu đồ cột|📊|barchart|Cột càng cao thì số liệu càng lớn. Đọc giá trị của cột ở vạch ngang với đỉnh cột.
Số lần xuất hiện của một sự kiện|🪙|events:1|Thực hiện nhiều lần (tung đồng xu, xúc xắc) và kiểm đếm số lần mỗi sự kiện xảy ra.
@Phân số|🍕|Cắt một cái bánh (hoặc tờ giấy) thành các phần bằng nhau, mỗi người trong nhà nhận một phần và nói phân số tương ứng.
Khái niệm phân số|🍕|fracpart:2|Phân số gồm tử số (ở trên) và mẫu số (ở dưới). Mẫu số là số phần bằng nhau, tử số là số phần được lấy.
Phân số và phép chia số tự nhiên|➗|fracdiv|Thương của phép chia số tự nhiên cho số tự nhiên khác 0 có thể viết thành phân số: 3 : 4 = 3/4.
Tính chất cơ bản của phân số|🟰|fraceq|Nhân (hoặc chia) cả tử số và mẫu số với cùng một số khác 0 thì được phân số bằng phân số đã cho.
Rút gọn phân số|✂️|fracsimp|Chia cả tử số và mẫu số cho cùng một số lớn hơn 1, đến khi không chia được nữa thì được phân số tối giản. Nhập phân số dạng a/b.
Quy đồng mẫu số các phân số|🤝|fraccommon|Tìm mẫu số chung chia hết cho các mẫu số, rồi nhân cả tử và mẫu của từng phân số với số thích hợp.
So sánh phân số|🐊|fraccmp|Cùng mẫu số: tử số lớn hơn thì phân số lớn hơn. Khác mẫu số: quy đồng mẫu số rồi so sánh.
@Phép cộng, phép trừ phân số|➕|Cùng ba mẹ làm bánh: đong 1/2 cốc đường và 1/4 cốc sữa, tính xem tổng cộng được bao nhiêu cốc.
Phép cộng phân số|➕|fracop:add|Cùng mẫu số: cộng tử số, giữ nguyên mẫu số. Khác mẫu số: quy đồng mẫu số rồi cộng.
Phép trừ phân số|➖|fracop:sub|Cùng mẫu số: trừ tử số, giữ nguyên mẫu số. Khác mẫu số: quy đồng mẫu số rồi trừ.
@Phép nhân, phép chia phân số|✖️|Một chai nước 1 lít, mỗi người uống 1/4 chai. Cùng ba mẹ tính xem chai nước đủ cho mấy người.
Phép nhân phân số|✖️|fracop:mul|Muốn nhân hai phân số, lấy tử số nhân tử số, mẫu số nhân mẫu số.
Tìm phân số của một số|🔍|fracof|Muốn tìm a/b của một số, ta lấy số đó nhân với a/b (chia cho b rồi nhân với a).
Phép chia phân số|➗|fracop:div|Muốn chia hai phân số, lấy phân số thứ nhất nhân với phân số thứ hai đảo ngược.
@!Ôn tập cuối năm|🎓|Con làm "thầy cô giáo", giảng lại cho ba mẹ cách cộng hai phân số khác mẫu số.
#5
@Ôn tập và bổ sung|📘|Cùng ba mẹ đọc các con số trên hóa đơn điện, nước và làm tròn chúng.
Ôn tập số tự nhiên|🔢|place:9;cmp:999999999|Đọc, viết số theo từng lớp; so sánh từ hàng cao nhất.
Ôn tập các phép tính với số tự nhiên|🧮|mulx:3,2;divx:5,2;addx:6,6,2|Thực hiện đúng thứ tự: trong ngoặc trước; nhân, chia trước; cộng, trừ sau.
Ôn tập phân số|🍕|fracsimp;fraccmp|Rút gọn phân số về tối giản; quy đồng mẫu số để so sánh.
Phân số thập phân|🔟|fracdec10|Phân số có mẫu số là 10, 100, 1000… gọi là phân số thập phân.
Ôn tập các phép tính với phân số|🧮|fracop:add;fracop:sub;fracop:mul;fracop:div|Cộng, trừ: quy đồng mẫu số. Nhân: tử nhân tử, mẫu nhân mẫu. Chia: nhân với phân số đảo ngược.
Hỗn số|🥧|mixed|Hỗn số gồm phần nguyên và phần phân số (bé hơn 1). 2 3/4 = (2 × 4 + 3)/4 = 11/4.
Ôn tập hình học và đo lường|📐|perim;area:rect;unit:area|Chu vi hình chữ nhật = (dài + rộng) × 2; diện tích = dài × rộng.
@Số thập phân|0️⃣|Đọc giá xăng, giá điện hoặc cân nặng có dấu phẩy (ví dụ 23,5 kg) cho ba mẹ nghe.
Khái niệm số thập phân|0️⃣|decread;fracdec10|Số thập phân gồm phần nguyên và phần thập phân, ngăn cách bởi dấu phẩy. Sau dấu phẩy: hàng phần mười, phần trăm, phần nghìn.
So sánh các số thập phân|🐊|deccmp|So sánh phần nguyên trước; phần nguyên bằng nhau thì so sánh lần lượt hàng phần mười, phần trăm…
Viết các số đo đại lượng dưới dạng số thập phân|📏|decunit|Ví dụ: 3 m 25 cm = 3,25 m vì 25 cm = 25/100 m = 0,25 m.
Làm tròn số thập phân|🎯|decround|Xét chữ số ngay bên phải hàng cần làm tròn: từ 5 trở lên thì làm tròn lên, bé hơn 5 thì làm tròn xuống.
@Làm quen với đơn vị đo diện tích|🗺️|Tìm trên bản đồ diện tích tỉnh/thành phố của con (km²) và đổi ra héc-ta.
Ki-lô-mét vuông. Héc-ta|🗺️|unit:area2|1 km² = 100 ha; 1 ha = 10 000 m².
@Các phép tính với số thập phân|🧮|Cùng ba mẹ tính tiền khi mua 2,5 kg trái cây với giá cho trước.
Phép cộng số thập phân|➕|decop:add|Đặt các chữ số cùng hàng thẳng cột, dấu phẩy thẳng dấu phẩy, rồi cộng như số tự nhiên.
Phép trừ số thập phân|➖|decop:sub|Đặt tính dấu phẩy thẳng cột, thêm chữ số 0 ở cuối phần thập phân cho đủ số chữ số rồi trừ.
Phép nhân số thập phân|✖️|decop:mul|Nhân như số tự nhiên, rồi đếm tổng số chữ số ở phần thập phân của các thừa số để đặt dấu phẩy ở tích.
Phép chia số thập phân|➗|decop:div|Số chia là số thập phân: dời dấu phẩy ở cả số chia và số bị chia sang phải cùng số chữ số, rồi chia như số chia tự nhiên.
Nhân, chia số thập phân với 10; 100; 1 000;... hoặc với 0,1; 0,01; 0,001;...|🔟|dec10|Nhân với 10, 100, 1000 (hoặc chia cho 0,1; 0,01…): dời dấu phẩy sang phải 1, 2, 3 chữ số. Chia cho 10, 100, 1000 (hoặc nhân với 0,1; 0,01…): dời sang trái.
@Một số hình phẳng|🔺|Đo đường kính một cái đĩa hoặc nắp nồi, tính chu vi của nó và kiểm tra bằng sợi dây.
Hình tam giác. Diện tích hình tam giác|🔺|area:tri|Diện tích hình tam giác = độ dài đáy × chiều cao : 2 (cùng đơn vị đo).
Hình thang. Diện tích hình thang|⏢|area:trap|Diện tích hình thang = (đáy lớn + đáy bé) × chiều cao : 2.
Đường tròn. Chu vi và diện tích hình tròn|⭕|circlecs|Chu vi hình tròn C = r × 2 × 3,14 (hoặc d × 3,14). Diện tích hình tròn S = r × r × 3,14.
@!Ôn tập học kì 1|🏆|Cùng ba mẹ đi siêu thị, cộng nhẩm giá các món hàng có số thập phân (đơn vị nghìn đồng).
@Tỉ số và các bài toán liên quan|➗|Xem nhãn giảm giá (ví dụ giảm 20%) khi đi mua sắm, cùng ba mẹ tính số tiền được giảm.
Tỉ số. Tỉ số phần trăm|％|ratio;percent:1|Tỉ số của a và b là a : b (hay a/b). Tỉ số phần trăm: 25% nghĩa là 25/100.
Tỉ lệ bản đồ và ứng dụng|🗺️|scale|Tỉ lệ 1 : 1000 nghĩa là 1 cm trên bản đồ ứng với 1000 cm ngoài thực tế.
Tìm hai số khi biết tổng và tỉ số của hai số đó|⚖️|wp:sumratio|Vẽ sơ đồ, tìm tổng số phần bằng nhau, tìm giá trị một phần, rồi tìm mỗi số.
Tìm hai số khi biết hiệu và tỉ số của hai số đó|⚖️|wp:diffratio|Vẽ sơ đồ, tìm hiệu số phần bằng nhau, tìm giá trị một phần, rồi tìm mỗi số.
Tìm giá trị phần trăm của một số|🏷️|percent:2|Muốn tìm a% của một số, lấy số đó nhân với a rồi chia cho 100.
@Thể tích. Đơn vị đo thể tích|🧊|Đổ đầy nước một chai 1,5 lít, đong sang các cốc để xem được bao nhiêu cốc.
Thể tích của một hình|🧊|volcount|Thể tích cho biết một hình chiếm bao nhiêu chỗ trong không gian. Đếm số hình lập phương 1 cm³ để biết thể tích.
Xăng-ti-mét khối. Đề-xi-mét khối. Mét khối|📦|unit:vol|1 dm³ = 1000 cm³; 1 m³ = 1000 dm³. 1 dm³ = 1 lít.
@Diện tích và thể tích của một số hình khối|📦|Đo một hộp giấy (dài, rộng, cao) rồi tính thể tích của hộp cùng ba mẹ.
Hình khai triển của hình lập phương, hình hộp chữ nhật và hình trụ|📐|net|Cắt và trải phẳng các mặt của hình khối ta được hình khai triển của nó.
Diện tích xung quanh và diện tích toàn phần của hình hộp chữ nhật|📦|surf:box|Sxq = (dài + rộng) × 2 × cao. Stp = Sxq + 2 × dài × rộng.
Diện tích xung quanh và diện tích toàn phần của hình lập phương|🧊|surf:cube|Sxq = cạnh × cạnh × 4. Stp = cạnh × cạnh × 6.
Thể tích của hình hộp chữ nhật|📦|volume:box|V = dài × rộng × cao (cùng đơn vị đo).
Thể tích của hình lập phương|🧊|volume:cube|V = cạnh × cạnh × cạnh.
@Số đo thời gian. Vận tốc. Các bài toán liên quan đến chuyển động đều|🚲|Ghi lại thời gian và quãng đường từ nhà đến trường, cùng ba mẹ tính vận tốc trung bình.
Các đơn vị đo thời gian|⏳|unit:time2|1 giờ = 60 phút; 1 phút = 60 giây; 1 ngày = 24 giờ; 1 năm = 12 tháng; 1 thế kỉ = 100 năm.
Cộng, trừ số đo thời gian|➕|tadd|Đặt tính thẳng cột theo từng đơn vị. Số phút từ 60 trở lên thì đổi sang giờ; không đủ để trừ thì mượn 1 giờ = 60 phút.
Nhân, chia số đo thời gian|✖️|tmul|Nhân (chia) từng đơn vị rồi đổi cho gọn, hoặc đổi tất cả ra phút trước khi tính.
Vận tốc của một chuyển động đều|🏃|motion:v|Vận tốc = Quãng đường : Thời gian (v = s : t).
Quãng đường, thời gian của một chuyển động đều|🛣️|motion:s;motion:t|Quãng đường = Vận tốc × Thời gian. Thời gian = Quãng đường : Vận tốc.
@Một số yếu tố thống kê và xác suất|📊|Hỏi bạn bè hoặc người thân về môn thể thao yêu thích, tính tỉ số phần trăm mỗi môn.
Thu thập, phân loại, sắp xếp các số liệu|📋|dataseq:2;datatable|Sắp xếp số liệu theo thứ tự giúp dễ tìm số lớn nhất, bé nhất và so sánh.
Biểu đồ hình quạt tròn|🥧|pie|Cả hình tròn là 100%. Mỗi hình quạt cho biết phần đó chiếm bao nhiêu phần trăm của tổng.
Tỉ số mô tả số lần lặp lại của một khả năng|🎲|events:2|Tỉ số của số lần một sự kiện xảy ra và tổng số lần thực hiện, viết dạng phân số.
@!Ôn tập cuối năm|🎓|Viết một lá thư ngắn cảm ơn thầy cô, trong đó có 3 điều con thích nhất khi học Toán năm nay.
`;
