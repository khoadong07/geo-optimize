export type TrendingPeriod = 'week' | 'month';

// Simulated trending topics — no live data source wired up yet. Banking is
// pre-seeded with realistic content; any other industry falls back to a
// generic templated list so the endpoint always returns something usable.
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

const BANKING_ALIASES = ['ngân hàng', 'banking', 'tài chính', 'fintech', 'ví điện tử', 'e-wallet', 'bank', 'financial services'];

function isBankingIndustry(industry: string): boolean {
  const key = industry.trim().toLowerCase();
  return BANKING_ALIASES.some((alias) => key.includes(alias));
}

export function getTrending(industry: string, period: TrendingPeriod): string[] {
  if (isBankingIndustry(industry)) {
    return period === 'week' ? BANKING_WEEKLY : BANKING_MONTHLY;
  }
  return period === 'week' ? genericWeekly(industry) : genericMonthly(industry);
}
