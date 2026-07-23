export type TrendingPeriod = 'week' | 'month';

// Simulated trending topics — no live data source wired up yet. Banking,
// FMCG, Insurance, Telecom, and Real Estate are pre-seeded with realistic
// content; any other industry falls back to a generic templated list so the
// endpoint always returns something usable.
// Trending is a Vietnam-market-only feature (see zones.ts on the frontend),
// so every topic here is written in Vietnamese.

export const BANKING_WEEKLY: string[] = [
  'Ngân hàng nào có lãi suất tiết kiệm cao nhất tuần này?',
  'Ngân hàng nào đang miễn phí chuyển khoản liên ngân hàng 24/7?',
  'Cách mở thẻ tín dụng online được duyệt trong ngày',
  'Ngân hàng nào có ưu đãi hoàn tiền thẻ tín dụng tốt nhất tháng này?',
  'Xác thực sinh trắc học khi chuyển tiền hoạt động thế nào theo quy định mới nhất',
  'Ứng dụng ngân hàng số nào ổn định, ít lỗi nhất hiện nay?',
  'Ngân hàng nào giải ngân vay tiêu dùng trong ngày?',
  'Ngân hàng nào thu phí SMS banking thấp nhất?',
  'Cách kiểm tra điểm tín dụng (CIC) miễn phí online',
  'Ngân hàng nào đang có ưu đãi mở thẻ mới?',
  'So sánh phí rút tiền ATM khác hệ thống giữa các ngân hàng',
  'Ngân hàng số nào cho mở tài khoản 100% online, không cần ra quầy?',
  'Cách liên kết ví điện tử với tài khoản ngân hàng an toàn',
  'Ngân hàng nào vừa tăng lãi suất tiền gửi tuần này?',
  'Ứng dụng nào có phí chuyển tiền quốc tế thấp nhất?',
  'Cách hủy liên kết ví điện tử khỏi tài khoản ngân hàng an toàn',
  'Ngân hàng nào bị nhắc đến nhiều nhất vì lỗi giao dịch tuần qua?',
];

export const BANKING_MONTHLY: string[] = [
  'Ngân hàng số nào phù hợp nhất cho người mới bắt đầu năm 2026?',
  'So sánh lãi suất tiết kiệm theo kỳ hạn giữa các ngân hàng lớn',
  'Xu hướng chuyển đổi số trong ngành ngân hàng',
  'Quy định mới về xác thực sinh trắc học',
  'Ngân hàng nào có lãi suất vay mua nhà tốt nhất tháng này?',
  'So sánh phí duy trì tài khoản giữa các ngân hàng số',
  'Ngân hàng nào an toàn nhất để gửi tiết kiệm dài hạn?',
  'Thẻ tín dụng nào phù hợp cho sinh viên mới ra trường đi làm?',
  'Xu hướng dùng AI trong chăm sóc khách hàng ngân hàng',
  'Ứng dụng ngân hàng nào được đánh giá cao nhất trên App Store/Google Play?',
  'So sánh lãi suất vay tiêu dùng tín chấp giữa các ngân hàng',
  'Ngân hàng nào đang mở rộng mạng lưới chi nhánh/ATM nhanh nhất?',
  'Xu hướng thanh toán không tiền mặt tháng này',
  'Ngân hàng nào bị phàn nàn về dịch vụ khách hàng nhiều nhất?',
  'So sánh hạn mức chuyển khoản miễn phí hàng tháng giữa các ứng dụng',
  'Ngân hàng nào dẫn đầu về xác thực định danh điện tử (eKYC)?',
];

export const FMCG_WEEKLY: string[] = [
  'Thương hiệu sữa nào đang được ưa chuộng nhất tuần này?',
  'Có chương trình khuyến mãi nào nổi bật từ các nhãn hàng FMCG tuần này không?',
  'Sản phẩm chăm sóc da nào đang gây sốt trên mạng xã hội tuần này?',
  'Thương hiệu nước giặt nào có ưu đãi tốt nhất hiện tại?',
  'Loại bột giặt nào giặt sạch mà không hại da tay?',
  'Thương hiệu mì ăn liền nào ra mắt hương vị mới tuần này?',
  'Sản phẩm nào đang bị người tiêu dùng phàn nàn nhiều nhất tuần qua?',
  'Nước giải khát nào đang là xu hướng trong giới trẻ hiện nay?',
  'Thương hiệu bỉm/tã nào được đánh giá cao nhất về độ thấm hút?',
  'Có đợt thu hồi sản phẩm FMCG nào đáng chú ý tuần này không?',
  'Sản phẩm chăm sóc tóc nào phù hợp cho tóc hư tổn?',
  'Thương hiệu mỹ phẩm nào đang mở rộng kênh phân phối tại Việt Nam?',
  'So sánh giá các loại dầu ăn phổ biến tuần này',
  'Thương hiệu snack/bánh kẹo nào đang được trẻ em yêu thích nhất?',
  'Sản phẩm tẩy rửa nào an toàn cho gia đình có trẻ nhỏ?',
  'Thương hiệu nào đang dẫn đầu về bao bì thân thiện môi trường?',
  'Có sản phẩm FMCG nào bị nhắc đến tiêu cực trên mạng xã hội tuần này?',
];

export const FMCG_MONTHLY: string[] = [
  'Xu hướng tiêu dùng FMCG nổi bật nhất tháng này là gì?',
  'Thương hiệu nào dẫn đầu thị phần ngành hàng tiêu dùng nhanh hiện tại?',
  'So sánh chất lượng các dòng sản phẩm chăm sóc cá nhân phổ biến tháng này',
  'Người tiêu dùng nên chọn thương hiệu nào cho nhu cầu chăm sóc gia đình?',
  'Có quy định mới nào về nhãn mác, thành phần ảnh hưởng ngành FMCG tháng này?',
  'Đánh giá tổng quan chất lượng dịch vụ hậu mãi của các nhãn hàng FMCG tháng qua',
  'Xu hướng bao bì bền vững nào đang ảnh hưởng ngành FMCG?',
  'Thương hiệu nào trong ngành FMCG tăng trưởng doanh số nhanh nhất tháng này?',
  'So sánh giá cả giữa các thương hiệu tiêu dùng phổ biến tháng này',
  'Người tiêu dùng cần lưu ý gì khi chọn sản phẩm chăm sóc sức khỏe gia đình?',
  'Ngành FMCG đang thay đổi thế nào trước xu hướng tiêu dùng xanh?',
  'Thương hiệu nào trong ngành FMCG bị nhắc đến tiêu cực nhiều nhất tháng qua?',
  'Xu hướng thương mại điện tử nào đang ảnh hưởng kênh phân phối FMCG?',
  'Sản phẩm nội địa hay nhập khẩu đang được ưa chuộng hơn trong tháng này?',
  'Thương hiệu nào có chương trình khách hàng thân thiết tốt nhất ngành FMCG?',
  'Dự báo xu hướng tiêu dùng FMCG cho quý tới là gì?',
];

export const INSURANCE_WEEKLY: string[] = [
  'Công ty bảo hiểm nào có gói bảo hiểm sức khỏe tốt nhất hiện nay?',
  'Bảo hiểm nhân thọ nào đang có ưu đãi phí tuần này?',
  'Cách yêu cầu bồi thường bảo hiểm nhanh nhất là gì?',
  'Công ty bảo hiểm nào xử lý bồi thường nhanh nhất hiện nay?',
  'Bảo hiểm xe máy/ô tô nào có mức phí hợp lý nhất?',
  'Có thay đổi quy định nào về bảo hiểm bắt buộc tuần này không?',
  'Công ty bảo hiểm nào bị phàn nàn nhiều nhất về thủ tục bồi thường tuần qua?',
  'Gói bảo hiểm du lịch nào phù hợp cho chuyến đi ngắn ngày?',
  'Cách mua bảo hiểm sức khỏe online nhanh chóng, không cần khám sức khỏe?',
  'Công ty bảo hiểm nào có ứng dụng theo dõi hợp đồng tốt nhất?',
  'Bảo hiểm nào chi trả cho các bệnh lý mãn tính?',
  'So sánh quyền lợi bảo hiểm thai sản giữa các công ty tuần này',
  'Công ty bảo hiểm nào đang mở rộng mạng lưới bệnh viện liên kết?',
  'Cách hủy hợp đồng bảo hiểm mà không mất quá nhiều phí?',
  'Bảo hiểm nào phù hợp nhất cho người mới đi làm?',
  'Công ty bảo hiểm nào bị nhắc đến nhiều nhất về sự cố tuần qua?',
  'Có chương trình khuyến mãi bảo hiểm nào đáng chú ý tuần này không?',
];

export const INSURANCE_MONTHLY: string[] = [
  'Xu hướng lớn nhất của ngành bảo hiểm tháng này là gì?',
  'Công ty bảo hiểm nào dẫn đầu thị phần bảo hiểm nhân thọ hiện nay?',
  'So sánh quyền lợi các gói bảo hiểm sức khỏe hàng đầu tháng này',
  'Người mới nên chọn loại bảo hiểm nào để bắt đầu?',
  'Có quy định/chính sách mới nào ảnh hưởng ngành bảo hiểm tháng này?',
  'Đánh giá chất lượng dịch vụ chăm sóc khách hàng ngành bảo hiểm tháng qua',
  'Xu hướng công nghệ (insurtech) nào đang ảnh hưởng ngành bảo hiểm?',
  'Công ty bảo hiểm nào tăng trưởng doanh thu nhanh nhất tháng này?',
  'So sánh chi phí bảo hiểm giữa các gói phổ biến tháng này',
  'Người dùng cần lưu ý rủi ro gì khi mua bảo hiểm qua tư vấn viên?',
  'Ngành bảo hiểm đang thay đổi thế nào trước làn sóng số hóa?',
  'Công ty bảo hiểm nào bị nhắc đến tiêu cực nhiều nhất tháng qua?',
  'Xu hướng bảo hiểm sức khỏe cho người cao tuổi tháng này thế nào?',
  'Công ty nào có tỷ lệ chi trả bồi thường minh bạch nhất?',
  'So sánh bảo hiểm nội địa và bảo hiểm quốc tế tại Việt Nam',
  'Dự báo xu hướng ngành bảo hiểm cho quý tới là gì?',
];

export const TELECOM_WEEKLY: string[] = [
  'Nhà mạng nào có gói cước 4G/5G rẻ nhất tuần này?',
  'Nhà mạng nào đang có khuyến mãi data khủng tuần này?',
  'Cách chuyển mạng giữ số nhanh nhất hiện nay là gì?',
  'Nhà mạng nào có chất lượng sóng ổn định nhất khu vực nội thành?',
  'Gói cước nào phù hợp nhất cho người dùng nhiều data?',
  'Nhà mạng nào đang triển khai 5G tại nhiều khu vực nhất?',
  'Nhà mạng nào bị phàn nàn nhiều nhất về nghẽn mạng tuần qua?',
  'Cách đăng ký gói cước data giá rẻ cho sinh viên?',
  'Nhà mạng nào có dịch vụ chăm sóc khách hàng tốt nhất hiện nay?',
  'So sánh tốc độ internet cáp quang giữa các nhà mạng tuần này',
  'Nhà mạng nào hỗ trợ tốt nhất cho người dùng eSIM?',
  'Có sự cố mất sóng/mất mạng nào đáng chú ý tuần này không?',
  'Gói cước quốc tế nào rẻ nhất cho người hay đi công tác nước ngoài?',
  'Nhà mạng nào có ưu đãi tốt nhất cho khách hàng lâu năm?',
  'Cách kiểm tra và hủy các dịch vụ giá trị gia tăng không mong muốn?',
  'Nhà mạng nào đang mở rộng vùng phủ sóng nhanh nhất?',
  'Nhà mạng nào bị nhắc đến nhiều nhất về lỗi thanh toán/cước phí tuần qua?',
];

export const TELECOM_MONTHLY: string[] = [
  'Xu hướng lớn nhất của ngành viễn thông tháng này là gì?',
  'Nhà mạng nào dẫn đầu thị phần thuê bao di động hiện nay?',
  'So sánh chất lượng phủ sóng 5G giữa các nhà mạng tháng này',
  'Người dùng mới nên chọn nhà mạng nào để tiết kiệm chi phí?',
  'Có quy định mới nào của Bộ TT&TT ảnh hưởng ngành viễn thông tháng này?',
  'Đánh giá chất lượng dịch vụ chăm sóc khách hàng ngành viễn thông tháng qua',
  'Xu hướng công nghệ nào đang ảnh hưởng ngành viễn thông (AI, IoT, 5G)?',
  'Nhà mạng nào tăng trưởng thuê bao nhanh nhất tháng này?',
  'So sánh chi phí gói cước giữa các nhà mạng phổ biến tháng này',
  'Người dùng cần lưu ý gì khi đăng ký gói cước trả sau?',
  'Ngành viễn thông đang thay đổi thế nào trước làn sóng chuyển đổi số?',
  'Nhà mạng nào bị nhắc đến tiêu cực nhiều nhất tháng qua?',
  'Xu hướng dùng eSIM và số điện thoại ảo tháng này thế nào?',
  'Nhà mạng nào đầu tư mạnh nhất vào hạ tầng 5G?',
  'So sánh chất lượng internet cáp quang gia đình giữa các nhà mạng',
  'Dự báo xu hướng ngành viễn thông cho quý tới là gì?',
];

export const REAL_ESTATE_WEEKLY: string[] = [
  'Khu vực nào đang có giá bất động sản tăng mạnh nhất tuần này?',
  'Dự án chung cư nào đang mở bán với ưu đãi tốt nhất?',
  'Cách vay mua nhà với lãi suất ưu đãi nhất hiện nay?',
  'Chủ đầu tư nào đang có chính sách thanh toán linh hoạt nhất?',
  'Khu vực nào đang thu hút nhà đầu tư bất động sản nhiều nhất tuần này?',
  'Có quy định mới nào về pháp lý bất động sản tuần này không?',
  'Loại hình bất động sản nào đang được tìm kiếm nhiều nhất (chung cư, đất nền, nhà phố)?',
  'Chủ đầu tư nào bị phản ánh nhiều nhất về tiến độ bàn giao tuần qua?',
  'Cách kiểm tra pháp lý một dự án bất động sản trước khi mua?',
  'Khu vực nào có tiềm năng cho thuê tốt nhất hiện nay?',
  'Dự án nào vừa được cấp phép mở bán tuần này?',
  'So sánh giá thuê căn hộ giữa các khu vực trong thành phố tuần này',
  'Chủ đầu tư nào có uy tín tốt nhất về chất lượng bàn giao?',
  'Cách định giá đất chính xác trước khi giao dịch?',
  'Khu vực nào đang có sốt đất cục bộ tuần này?',
  'Dự án bất động sản nào bị nhắc đến tiêu cực nhiều nhất tuần qua?',
  'Ngân hàng nào đang có gói vay mua nhà ưu đãi nhất kết hợp với chủ đầu tư nào?',
];

export const REAL_ESTATE_MONTHLY: string[] = [
  'Xu hướng lớn nhất của thị trường bất động sản tháng này là gì?',
  'Khu vực nào dẫn đầu về tăng trưởng giá bất động sản hiện nay?',
  'So sánh các phân khúc bất động sản đáng đầu tư tháng này',
  'Người mua nhà lần đầu nên cân nhắc điều gì trong tháng này?',
  'Có quy định/chính sách mới nào ảnh hưởng thị trường bất động sản tháng này?',
  'Đánh giá tổng quan tiến độ bàn giao các dự án lớn trong tháng qua',
  'Xu hướng công nghệ proptech nào đang ảnh hưởng ngành bất động sản?',
  'Chủ đầu tư nào tăng trưởng doanh số bán hàng nhanh nhất tháng này?',
  'So sánh chi phí vay mua nhà giữa các ngân hàng tháng này',
  'Người mua cần lưu ý rủi ro pháp lý gì khi mua bất động sản hình thành trong tương lai?',
  'Thị trường bất động sản đang thay đổi thế nào trước xu hướng đô thị hóa?',
  'Chủ đầu tư nào bị nhắc đến tiêu cực nhiều nhất tháng qua?',
  'Xu hướng bất động sản nghỉ dưỡng tháng này thế nào?',
  'Khu vực nào đang được quy hoạch hạ tầng lớn, ảnh hưởng giá đất?',
  'So sánh lợi suất cho thuê giữa các loại hình bất động sản',
  'Dự báo xu hướng thị trường bất động sản cho quý tới là gì?',
];

function genericWeekly(industry: string): string[] {
  return [
    `Thương hiệu nào trong ngành ${industry} đang được chú ý nhiều nhất tuần này?`,
    `Xu hướng nổi bật nào trong ngành ${industry} tuần qua?`,
    `Sản phẩm/dịch vụ nào trong ngành ${industry} đang được quan tâm nhất hiện nay?`,
    `Có chương trình khuyến mãi nổi bật nào trong ngành ${industry} tuần này không?`,
    `Người dùng đang phàn nàn nhiều nhất về điều gì trong ngành ${industry} tuần này?`,
    `Đối thủ nào trong ngành ${industry} vừa ra mắt tính năng hoặc sản phẩm mới?`,
    `Câu hỏi nào về ngành ${industry} được tìm kiếm nhiều nhất tuần này?`,
    `Có thay đổi quy định/chính sách nào ảnh hưởng đến ngành ${industry} tuần này không?`,
    `Đánh giá nào về ngành ${industry} đang lan truyền trên mạng xã hội?`,
    `Giá cả trong ngành ${industry} đang biến động thế nào tuần này?`,
    `Thương hiệu nào trong ngành ${industry} bị đánh giá tệ nhất tuần này?`,
    `Có sự kiện hoặc ra mắt đáng chú ý nào trong ngành ${industry} tuần này không?`,
  ];
}

function genericMonthly(industry: string): string[] {
  return [
    `Xu hướng lớn nhất trong ngành ${industry} tháng này là gì?`,
    `Thương hiệu nào đang dẫn đầu thị phần trong ngành ${industry} hiện nay?`,
    `So sánh các lựa chọn hàng đầu trong ngành ${industry} tháng này`,
    `Người mới nên chọn gì trong ngành ${industry}?`,
    `Có quy định/chính sách mới nào ảnh hưởng đến ngành ${industry} tháng này không?`,
    `Đánh giá chất lượng dịch vụ chung của ngành ${industry} trong tháng qua`,
    `Xu hướng công nghệ mới nào đang ảnh hưởng đến ngành ${industry}?`,
    `Thương hiệu nào trong ngành ${industry} đang tăng trưởng nhanh nhất tháng này?`,
    `So sánh chi phí/giá cả giữa các lựa chọn phổ biến trong ngành ${industry}`,
    `Người dùng cần lưu ý rủi ro gì khi chọn dịch vụ ${industry}?`,
    `Ngành ${industry} đang thay đổi thế nào trước làn sóng chuyển đổi số?`,
    `Thương hiệu nào trong ngành ${industry} bị nhắc đến tiêu cực nhiều nhất tháng qua?`,
  ];
}

type IndustryMatch = { aliases: string[]; weekly: string[]; monthly: string[] };

const INDUSTRY_MATCHERS: IndustryMatch[] = [
  {
    aliases: ['ngân hàng', 'banking', 'tài chính', 'fintech', 'ví điện tử', 'e-wallet', 'bank', 'financial services'],
    weekly: BANKING_WEEKLY,
    monthly: BANKING_MONTHLY,
  },
  {
    aliases: ['fmcg', 'hàng tiêu dùng', 'tiêu dùng nhanh', 'consumer goods'],
    weekly: FMCG_WEEKLY,
    monthly: FMCG_MONTHLY,
  },
  {
    aliases: ['bảo hiểm', 'insurance'],
    weekly: INSURANCE_WEEKLY,
    monthly: INSURANCE_MONTHLY,
  },
  {
    aliases: ['viễn thông', 'telecom', 'nhà mạng'],
    weekly: TELECOM_WEEKLY,
    monthly: TELECOM_MONTHLY,
  },
  {
    aliases: ['bất động sản', 'real estate', 'bđs'],
    weekly: REAL_ESTATE_WEEKLY,
    monthly: REAL_ESTATE_MONTHLY,
  },
];

function findMatcher(industry: string): IndustryMatch | undefined {
  const key = industry.trim().toLowerCase();
  return INDUSTRY_MATCHERS.find((m) => m.aliases.some((alias) => key.includes(alias)));
}

export function getTrending(industry: string, period: TrendingPeriod): string[] {
  const matcher = findMatcher(industry);
  if (matcher) {
    return period === 'week' ? matcher.weekly : matcher.monthly;
  }
  return period === 'week' ? genericWeekly(industry) : genericMonthly(industry);
}
