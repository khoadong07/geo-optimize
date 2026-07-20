export type TrendingPeriod = 'week' | 'month';

// Simulated trending topics — no live data source wired up yet. Banking is
// pre-seeded with realistic content; any other industry falls back to a
// generic templated list so the endpoint always returns something usable.

const BANKING_WEEKLY: string[] = [
  'Lãi suất tiết kiệm ngân hàng nào cao nhất tuần này?',
  'Ngân hàng nào đang miễn phí chuyển tiền liên ngân hàng 24/7?',
  'Cách mở thẻ tín dụng online, duyệt nhanh trong ngày',
  'Ngân hàng nào có ưu đãi hoàn tiền (cashback) thẻ tín dụng tháng này?',
  'Cách xác thực sinh trắc học khi chuyển tiền theo quy định mới nhất',
  'Ứng dụng ngân hàng số nào đang ổn định, ít lỗi nhất hiện nay?',
  'Ngân hàng nào hỗ trợ vay tiêu dùng giải ngân trong ngày?',
  'Phí SMS Banking ngân hàng nào rẻ nhất?',
  'Cách kiểm tra điểm tín dụng CIC miễn phí online',
  'Ngân hàng nào đang có chương trình ưu đãi mở thẻ mới?',
  'So sánh phí rút tiền ATM khác hệ thống giữa các ngân hàng',
  'Ngân hàng số nào cho phép mở tài khoản 100% online, không cần ra chi nhánh?',
  'Cách liên kết ví điện tử với tài khoản ngân hàng an toàn',
  'Ngân hàng nào đang tăng lãi suất huy động tuần này?',
  'Ứng dụng nào hỗ trợ chuyển tiền quốc tế phí thấp nhất?',
  'Cách hủy liên kết ngân hàng khỏi ví điện tử an toàn',
  'Ngân hàng nào bị nhắc đến nhiều nhất về sự cố giao dịch tuần qua?',
];

const BANKING_MONTHLY: string[] = [
  'Ngân hàng số nào tốt nhất cho người mới bắt đầu năm 2026?',
  'So sánh lãi suất gửi tiết kiệm các kỳ hạn giữa những ngân hàng lớn',
  'Xu hướng chuyển đổi số ngành ngân hàng Việt Nam',
  'Quy định mới của Ngân hàng Nhà nước về xác thực sinh trắc học',
  'Ngân hàng nào có chính sách vay mua nhà ưu đãi nhất tháng này?',
  'So sánh biểu phí duy trì tài khoản giữa các ngân hàng số',
  'Ngân hàng nào an toàn nhất để gửi tiết kiệm dài hạn?',
  'Thẻ tín dụng nào phù hợp nhất cho người đi làm mới ra trường?',
  'Xu hướng dùng AI trong dịch vụ chăm sóc khách hàng ngân hàng',
  'Ngân hàng nào có ứng dụng được đánh giá cao nhất trên App Store/Google Play?',
  'So sánh lãi suất vay tiêu dùng tín chấp giữa các ngân hàng',
  'Ngân hàng nào đang mở rộng mạng lưới chi nhánh/ATM nhiều nhất?',
  'Xu hướng thanh toán không tiền mặt tại Việt Nam tháng này',
  'Ngân hàng nào bị người dùng phàn nàn nhiều nhất về dịch vụ CSKH?',
  'So sánh hạn mức chuyển tiền miễn phí hàng tháng giữa các ứng dụng',
  'Ngân hàng nào tiên phong trong tích hợp định danh điện tử VNeID?',
];

function genericWeekly(industry: string): string[] {
  return [
    `Thương hiệu nào trong ngành ${industry} được nhắc đến nhiều nhất tuần này?`,
    `Xu hướng nổi bật của ngành ${industry} tuần qua là gì?`,
    `Sản phẩm/dịch vụ nào trong ngành ${industry} đang được quan tâm nhất hiện tại?`,
    `Có ưu đãi/khuyến mãi nào đáng chú ý trong ngành ${industry} tuần này không?`,
    `Người dùng đang phàn nàn nhiều nhất về điều gì trong ngành ${industry} tuần qua?`,
    `Đối thủ nào trong ngành ${industry} vừa ra mắt tính năng/sản phẩm mới?`,
    `Câu hỏi nào về ngành ${industry} được tìm kiếm nhiều nhất tuần này?`,
    `Có thay đổi quy định/chính sách nào ảnh hưởng tới ngành ${industry} tuần qua?`,
    `Đánh giá nào về ngành ${industry} đang lan truyền trên mạng xã hội?`,
    `Xu hướng giá cả trong ngành ${industry} tuần này thế nào?`,
    `Thương hiệu nào trong ngành ${industry} bị đánh giá thấp nhất tuần qua?`,
    `Có sự kiện/ra mắt nào đáng chú ý trong ngành ${industry} tuần này?`,
  ];
}

function genericMonthly(industry: string): string[] {
  return [
    `Xu hướng lớn nhất của ngành ${industry} trong tháng này là gì?`,
    `Thương hiệu nào dẫn đầu thị phần ngành ${industry} hiện tại?`,
    `So sánh các lựa chọn hàng đầu trong ngành ${industry} tháng này`,
    `Người mới bắt đầu nên chọn gì trong ngành ${industry}?`,
    `Có quy định/chính sách mới nào ảnh hưởng ngành ${industry} tháng này?`,
    `Đánh giá tổng quan chất lượng dịch vụ ngành ${industry} tháng qua`,
    `Xu hướng công nghệ mới nào đang ảnh hưởng ngành ${industry}?`,
    `Thương hiệu nào trong ngành ${industry} tăng trưởng nhanh nhất tháng này?`,
    `So sánh chi phí/giá cả các lựa chọn phổ biến trong ngành ${industry}`,
    `Rủi ro/lưu ý nào người dùng cần biết khi chọn dịch vụ ${industry}?`,
    `Ngành ${industry} đang thay đổi thế nào trong bối cảnh chuyển đổi số?`,
    `Thương hiệu nào trong ngành ${industry} bị nhắc tới tiêu cực nhiều nhất tháng qua?`,
  ];
}

const BANKING_ALIASES = ['ngân hàng', 'banking', 'tài chính', 'fintech', 'ví điện tử', 'e-wallet', 'bank'];

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
