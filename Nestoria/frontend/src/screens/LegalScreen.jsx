import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';

const TERMS = [
  {
    h: '1. Chấp nhận',
    p: 'Khi sử dụng Chi Vinh Land, bạn đồng ý với các điều khoản này. Nếu không đồng ý, vui lòng không sử dụng nền tảng. Chúng tôi có thể cập nhật các điều khoản này; ngày ở cuối trang cho biết lần sửa đổi gần nhất.',
  },
  {
    h: '2. Tài khoản',
    p: 'Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu. Bạn phải đủ 18 tuổi trở lên để thuê nhà. Chúng tôi có thể đình chỉ hoặc chấm dứt tài khoản lạm dụng nền tảng hoặc vi phạm các điều khoản này.',
  },
  {
    h: '3. Thuê nhà',
    p: 'Việc thuê nhà là hợp đồng giữa bạn và chủ nhà. Chi Vinh Land hỗ trợ yêu cầu thuê và thanh toán nhưng không phải là bên trong thời gian thuê. Giá hiển thị đã bao gồm thuế; chủ nhà nhận được tổng tiền sau khi trừ phí nền tảng 10% của chúng tôi.',
  },
  {
    h: '4. Hủy và hoàn tiền',
    p: 'Hủy miễn phí trong vòng 48 giờ trước khi nhận nhà. Trong vòng 48 giờ, tháng đầu tiên sẽ bị tính phí. Sau khi nhận nhà, sẽ không hoàn tiền. Chủ nhà có thể cấp tín dụng theo quyết định của họ. Tiền hoàn được xử lý về phương thức thanh toán ban đầu trong vòng 7 ngày làm việc.',
  },
  {
    h: '5. Trách nhiệm của chủ nhà',
    p: 'Chủ nhà cam đoan rằng danh sách của họ là chính xác, họ có thẩm quyền pháp lý để cho thuê nhà và sẽ tôn trọng các yêu cầu thuê đã xác nhận. Việc hủy nhiều lần bởi chủ nhà có thể dẫn đến việc bị gỡ danh sách.',
  },
  {
    h: '6. Hành vi',
    p: 'Người thuê đồng ý đối xử với nhà cho thuê một cách cẩn thận và tôn trọng nội quy. Thiệt hại có thể được tính cho người thuê theo quyết định hợp lý của chủ nhà. Quấy rối chủ nhà hoặc người thuê khác là căn cứ để bị xóa khỏi nền tảng vĩnh viễn.',
  },
  {
    h: '7. Sở hữu trí tuệ',
    p: 'Tất cả nội dung mang thương hiệu Chi Vinh Land — bao gồm ảnh chụp, minh họa và bài biên tập — thuộc sở hữu của Chi Vinh Land hoặc các đối tác nội dung. Bạn có thể chia sẻ liên kết đến danh sách; vui lòng không sao chép nội dung khi chưa được phép.',
  },
  {
    h: '8. Giới hạn trách nhiệm',
    p: 'Chi Vinh Land không chịu trách nhiệm về thiệt hại phát sinh từ hành vi của chủ nhà, người thuê hoặc bên thứ ba. Trách nhiệm tối đa của chúng tôi cho bất kỳ khiếu nại nào được giới hạn trong tổng số tiền bạn đã thanh toán cho hợp đồng thuê phát sinh khiếu nại.',
  },
  {
    h: '9. Luật điều chỉnh',
    p: 'Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp sẽ được giải quyết tại tòa án thành phố Hồ Chí Minh, Việt Nam.',
  },
  {
    h: '10. Liên hệ',
    p: 'Thắc mắc về các điều khoản này? Gửi thư đến phaply@chivinhland.example.',
  },
];

const PRIVACY = [
  {
    h: 'Chúng tôi thu thập gì',
    p: 'Thông tin tài khoản (tên, email, điện thoại, mật khẩu đã mã hóa), lịch sử thuê nhà, chi tiết hồ sơ bạn chọn thêm và dữ liệu sử dụng cơ bản — trang đã truy cập, truy vấn tìm kiếm, địa chỉ IP, trình duyệt. Chúng tôi không chạy phân tích của bên thứ ba hoặc tập lệnh quảng cáo.',
  },
  {
    h: 'Cách chúng tôi sử dụng',
    p: 'Để xử lý yêu cầu thuê, gửi xác nhận, hỗ trợ bạn khi liên hệ, ngăn gian lận và cải thiện nền tảng. Chúng tôi không bao giờ bán dữ liệu của bạn. Chúng tôi không bao giờ dùng dữ liệu của bạn để huấn luyện AI. Chúng tôi không bao giờ chia sẻ dữ liệu nhận dạng của bạn với chủ nhà ngoài những gì họ cần để phục vụ bạn.',
  },
  {
    h: 'Cookie',
    p: 'Chúng tôi sử dụng một cookie: cookie phiên để giữ bạn đăng nhập. Chúng tôi không sử dụng cookie theo dõi, cookie quảng cáo hoặc cookie bên thứ ba. Xóa cookie trình duyệt sẽ đăng xuất bạn — đó là tác dụng duy nhất.',
  },
  {
    h: 'Bên thứ ba',
    p: 'Chúng tôi sử dụng Supabase để lưu trữ hình ảnh, Google Identity Services nếu bạn chọn đăng nhập bằng Google và nhà cung cấp thanh toán cho các giao dịch. Mỗi bên chỉ xử lý dữ liệu tối thiểu cần thiết cho chức năng của họ. Chúng tôi không chia sẻ dữ liệu với bất kỳ ai khác.',
  },
  {
    h: 'Thời gian lưu trữ',
    p: 'Dữ liệu tài khoản được lưu trong suốt thời gian tài khoản hoạt động. Hồ sơ thuê nhà trong 7 năm (theo yêu cầu thuế). Tin nhắn biểu mẫu liên hệ trong 1 năm. Bạn có thể yêu cầu xóa sớm hơn bằng cách viết thư cho chúng tôi.',
  },
  {
    h: 'Quyền của bạn',
    p: 'Bạn có thể truy cập, chỉnh sửa hoặc xóa dữ liệu của mình bất kỳ lúc nào. Gửi email đến baomat@chivinhland.example và chúng tôi sẽ trả lời trong vòng 7 ngày. Chúng tôi sẽ không tính phí khi bạn thực hiện các quyền này.',
  },
  {
    h: 'Bảo mật',
    p: 'Mật khẩu được mã hóa bằng bcrypt. Kết nối được mã hóa TLS. Cơ sở dữ liệu được kiểm soát truy cập và ghi nhật ký kiểm toán. Nếu xảy ra vi phạm ảnh hưởng đến dữ liệu của bạn, chúng tôi sẽ thông báo trong vòng 72 giờ.',
  },
  {
    h: 'Trẻ em',
    p: 'Chi Vinh Land không hướng đến trẻ em dưới 18 tuổi. Chúng tôi không cố ý thu thập dữ liệu từ trẻ vị thành niên.',
  },
  {
    h: 'Cập nhật',
    p: 'Nếu chúng tôi thay đổi đáng kể chính sách này, chúng tôi sẽ gửi email cho người dùng đã đăng ký ít nhất 30 ngày trước khi thay đổi có hiệu lực.',
  },
  {
    h: 'Liên hệ',
    p: 'Thắc mắc về quyền riêng tư gửi đến baomat@chivinhland.example.',
  },
];

export default function LegalScreen() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'privacy' ? 'privacy' : 'terms';
  usePageTitle('Điều khoản');
  const items = tab === 'terms' ? TERMS : PRIVACY;

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 900 }}>
      <div className="mb-8">
        <div className="eyebrow mb-3">— Pháp lý</div>
        <h1 className="h-1">{tab === 'terms' ? 'Điều khoản dịch vụ' : 'Chính sách bảo mật'}</h1>
        <p className="text-muted mt-3" style={{ fontSize: 14 }}>Cập nhật lần cuối 24 Tháng Năm 2026.</p>
      </div>

      <div className="tabs-bar">
        <button className={tab === 'terms' ? 'is-active' : ''} onClick={() => setParams({})}>Điều khoản</button>
        <button className={tab === 'privacy' ? 'is-active' : ''} onClick={() => setParams({ tab: 'privacy' })}>Bảo mật</button>
      </div>

      <div className="stack" style={{ '--gap': '32px', marginTop: 16 }}>
        {items.map((s) => (
          <section key={s.h}>
            <h2 className="h-3 mb-3">{s.h}</h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)', maxWidth: 720 }}>{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
