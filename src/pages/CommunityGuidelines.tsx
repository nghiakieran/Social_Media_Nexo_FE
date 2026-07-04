import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  AlertTriangle,
  Heart,
  UserCheck,
  Lock,
  MessageSquare,
  Flag,
  Scale,
  Users,
  Sparkles,
  ChevronRight,
  ExternalLink,
  X,
  CheckCircle2,
  Info,
  Zap,
  Globe,
  FileText,
  BadgeCheck,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Section {
  id: string
  icon: React.ReactNode
  label: string
  title: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const sections: Section[] = [
  { id: 'intro',       icon: <Sparkles className="w-5 h-5" />,      label: 'Giới thiệu',     title: 'Giới thiệu' },
  { id: 'safety',      icon: <ShieldCheck className="w-5 h-5" />,   label: 'An toàn',        title: 'An toàn cộng đồng' },
  { id: 'respect',     icon: <Heart className="w-5 h-5" />,         label: 'Tôn trọng',      title: 'Tôn trọng & Văn minh' },
  { id: 'content',     icon: <FileText className="w-5 h-5" />,      label: 'Nội dung',       title: 'Tiêu chuẩn nội dung' },
  { id: 'prohibited',  icon: <AlertTriangle className="w-5 h-5" />, label: 'Cấm',            title: 'Hành vi bị cấm' },
  { id: 'privacy',     icon: <Lock className="w-5 h-5" />,          label: 'Quyền riêng tư', title: 'Quyền riêng tư & Dữ liệu' },
  { id: 'reporting',   icon: <Flag className="w-5 h-5" />,          label: 'Báo cáo',        title: 'Báo cáo vi phạm' },
  { id: 'enforcement', icon: <Scale className="w-5 h-5" />,         label: 'Xử lý',          title: 'Xử lý & Biện pháp' },
  { id: 'community',   icon: <Globe className="w-5 h-5" />,         label: 'Cộng đồng',      title: 'Cùng xây dựng' },
]

// ─── Side Navigation ──────────────────────────────────────────────────────────
const SideNav = ({
  active,
  setActive,
}: {
  active: string
  setActive: (id: string) => void
}) => {
  const handleClick = useCallback(
    (id: string) => {
      setActive(id)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [setActive],
  )

  return (
    <div className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 z-30">
      <div className="bg-background/90 backdrop-blur-sm rounded-2xl py-4 px-2 shadow-md border border-border">
        <nav className="flex flex-col items-center gap-1" aria-label="Điều hướng tiêu chuẩn cộng đồng">
          {sections.map((s) => (
            <Button
              key={s.id}
              variant="ghost"
              size="icon"
              onClick={() => handleClick(s.id)}
              aria-label={s.label}
              className={`group relative !rounded-xl transition-colors duration-150 ${
                active === s.id
                  ? 'bg-primary/15 text-primary'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.icon}
              <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow">
                {s.label}
              </span>
              <span
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-1 h-4 bg-primary rounded-l-full transition-opacity duration-150 ${
                  active === s.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </Button>
          ))}
        </nav>
      </div>
    </div>
  )
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
const PolicySection = ({
  section,
  children,
}: {
  section: Section
  children: React.ReactNode
}) => (
  <section
    id={section.id}
    className="scroll-mt-6 py-20"
    data-section-id={section.id}
  >
    <div className="max-w-4xl mx-auto px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-primary flex-shrink-0">
          {section.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
          <div className="h-0.5 w-10 mt-1.5 rounded-full bg-primary" />
        </div>
      </div>
      {children}
    </div>
  </section>
)

// ─── Policy Card ──────────────────────────────────────────────────────────────
const PolicyCard = ({
  title,
  items,
  allowed = false,
}: {
  title: string
  items: string[]
  allowed?: boolean
}) => (
  <div
    className={`rounded-xl border p-6 mb-4 transition-all hover:shadow-sm ${
      allowed
        ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20'
        : 'border-border bg-card'
    }`}
  >
    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
      {allowed ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      ) : (
        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
      )}
      {title}
    </h3>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
          <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-border" />
          {item}
        </li>
      ))}
    </ul>
  </div>
)

// ─── Prohibited Card ──────────────────────────────────────────────────────────
const ProhibitedCard = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-start gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 mb-3 hover:shadow-sm transition-all">
    <div className="w-7 h-7 rounded-md bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
      <X className="w-3.5 h-3.5 text-destructive" />
    </div>
    <div>
      <p className="font-semibold text-foreground text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
    </div>
  </div>
)

// ─── Step Card ────────────────────────────────────────────────────────────────
const StepCard = ({
  step,
  title,
  description,
}: {
  step: number
  title: string
  description: string
}) => (
  <div className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:shadow-sm transition-all mb-3">
    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
      {step}
    </div>
    <div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
    </div>
  </div>
)

// ─── Divider ─────────────────────────────────────────────────────────────────
const Divider = () => (
  <div className="h-px bg-border mx-8" />
)

// ─── Main Page ────────────────────────────────────────────────────────────────
const CommunityGuidelinesPage = () => {
  const [activeSection, setActiveSection] = useState('intro')

  const rafRef = useRef<number | null>(null)

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const ids = sections.map((s) => s.id)
      const current = ids.find((id) => {
        const el = document.getElementById(id)
        if (!el) return false
        const rect = el.getBoundingClientRect()
        return rect.top <= 160 && rect.bottom >= 160
      })
      if (current) setActiveSection((prev) => (prev === current ? prev : current))
    })
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [handleScroll])

  return (
    <div className="relative min-h-screen bg-background">
      <SideNav active={activeSection} setActive={setActiveSection} />

      <main className="lg:pl-20">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="py-20 px-6 text-center border-b border-border bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cập nhật: Tháng 7, 2026
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
              Tiêu chuẩn cộng đồng
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Tại <strong className="text-foreground">Nexo</strong>, chúng tôi tin rằng mọi người đều xứng đáng được
              trải nghiệm một môi trường mạng xã hội an toàn, tích cực và đầy cảm hứng.
              Hướng dẫn này là nền tảng để xây dựng cộng đồng đó cùng nhau.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {sections.slice(1, 5).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSection(s.id)
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors"
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 1. Giới thiệu ────────────────────────────────────────────────── */}
        <PolicySection section={sections[0]}>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Tiêu chuẩn cộng đồng của <strong>Nexo</strong> áp dụng cho tất cả người dùng,
            nội dung và hoạt động diễn ra trên nền tảng — bao gồm bài viết, bình luận, tin nhắn,
            story, reels và mọi hình thức tương tác khác.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Chúng tôi xây dựng những tiêu chuẩn này dựa trên ba trụ cột:
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: <ShieldCheck className="w-5 h-5 text-primary" />, title: 'An toàn',    desc: 'Bảo vệ người dùng khỏi nguy hại, quấy rối và nội dung độc hại.' },
              { icon: <Heart className="w-5 h-5 text-primary" />,       title: 'Tôn trọng',  desc: 'Đối xử với mọi người bằng sự tôn trọng và phẩm giá.' },
              { icon: <BadgeCheck className="w-5 h-5 text-primary" />,  title: 'Chính trực', desc: 'Khuyến khích sự trung thực, minh bạch và trách nhiệm.' },
            ].map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-5 text-center hover:shadow-sm transition-all">
                <div className="flex justify-center mb-3">{v.icon}</div>
                <p className="font-semibold text-foreground mb-1 text-sm">{v.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Bằng cách sử dụng Nexo, bạn đồng ý tuân thủ các tiêu chuẩn này.
            Khi hệ thống hoặc Admin phát hiện nội dung (bài viết, bình luận...) vi phạm, nội dung đó sẽ bị ẩn đi ngay lập tức và người dùng sẽ nhận được thông báo giải thích lý do cụ thể.
          </p>
        </PolicySection>

        <Divider />

        {/* ── 2. An toàn cộng đồng ─────────────────────────────────────────── */}
        <PolicySection section={sections[1]}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            An toàn là ưu tiên hàng đầu. Chúng tôi không khoan nhượng với bất kỳ hành vi nào gây hại
            cho người dùng — dù đó là lời nói hay hành động thực tế.
          </p>
          <PolicyCard
            title="Nội dung bạo lực & nguy hiểm"
            items={[
              'Không đăng tải nội dung mô tả, cổ vũ hoặc hướng dẫn các hành vi bạo lực nhắm vào cá nhân hay tập thể.',
              'Nghiêm cấm mọi nội dung khuyến khích hoặc tôn vinh tự làm hại bản thân, tự tử.',
              'Không chia sẻ thông tin hướng dẫn chế tạo vũ khí, chất nổ hoặc các chất nguy hiểm.',
              'Nội dung đe dọa, hù dọa hoặc kêu gọi bạo lực nhắm vào cá nhân hay nhóm người sẽ bị gỡ ngay.',
            ]}
          />
          <PolicyCard
            title="Bảo vệ trẻ em"
            items={[
              'Nghiêm cấm tuyệt đối mọi nội dung xâm phạm, lạm dụng hoặc khai thác tình dục trẻ em (CSAM).',
              'Không thực hiện hoặc cho phép hành vi "grooming" (tiếp cận trẻ em với mục đích lạm dụng).',
              'Không đăng ảnh/video của trẻ em mà không có sự đồng ý của phụ huynh/người giám hộ.',
              'Vi phạm liên quan đến trẻ em sẽ bị báo cáo và gỡ lập tức.',
            ]}
          />
          <PolicyCard
            title="Ngôn ngữ thù địch"
            items={[
              'Không sử dụng ngôn ngữ hoặc hình ảnh phân biệt đối xử dựa trên chủng tộc, sắc tộc, tôn giáo, giới tính, khuynh hướng tình dục, khuyết tật hoặc quốc tịch.',
              'Không kêu gọi hành động bạo lực hay phân biệt đối xử đối với bất kỳ nhóm người nào.',
              'Nghiêm cấm các ký hiệu hoặc biểu tượng thù địch.',
            ]}
          />
        </PolicySection>

        <Divider />

        {/* ── 3. Tôn trọng & Văn minh ──────────────────────────────────────── */}
        <PolicySection section={sections[2]}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Nexo là không gian để kết nối và sáng tạo. Chúng tôi kỳ vọng mọi người
            đối xử với nhau bằng sự tôn trọng và lịch sự.
          </p>
          <PolicyCard
            allowed
            title="Hành vi được khuyến khích"
            items={[
              'Giao tiếp văn minh, xây dựng và tôn trọng quan điểm khác nhau.',
              'Cung cấp phản hồi mang tính xây dựng khi bình luận về nội dung hoặc ý tưởng.',
              'Thể hiện sự đồng cảm và hỗ trợ lẫn nhau trong cộng đồng.',
              'Sử dụng ngôn ngữ phù hợp, tránh thô tục khi không cần thiết.',
            ]}
          />
          <PolicyCard
            title="Quấy rối & Bắt nạt"
            items={[
              'Nghiêm cấm quấy rối, đe dọa hoặc bắt nạt bất kỳ người dùng nào — kể cả người nổi tiếng.',
              'Không gửi tin nhắn, bình luận hoặc đề cập mang tính xúc phạm, hạ thấp nhân phẩm người khác.',
              'Tổ chức chiến dịch tấn công hàng loạt ("brigading") nhắm vào cá nhân là vi phạm nghiêm trọng.',
              'Tiết lộ thông tin cá nhân của người khác ("doxxing") không có sự đồng ý là hoàn toàn bị cấm.',
            ]}
          />
        </PolicySection>

        <Divider />

        {/* ── 4. Tiêu chuẩn nội dung ───────────────────────────────────────── */}
        <PolicySection section={sections[3]}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Chúng tôi muốn Nexo là nơi chứa đựng những nội dung phong phú, sáng tạo và có giá trị.
            Dưới đây là các tiêu chuẩn định hướng nội dung trên nền tảng.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <PolicyCard
              title="Nội dung gợi cảm & 18+"
              items={[
                'Nội dung khỏa thân hoàn toàn hoặc hành vi tình dục công khai bị cấm.',
                'Nội dung gợi cảm ở mức độ vừa phải phải được gắn nhãn hoặc sẽ bị hệ thống gỡ đi.',
                'Nghiêm cấm mọi nội dung tình dục liên quan đến người chưa thành niên.',
              ]}
            />
            <PolicyCard
              title="Thông tin sai lệch"
              items={[
                'Không đăng tin tức giả, thông tin y tế sai lệch hoặc thuyết âm mưu nguy hiểm.',
                'Không tạo hoặc chia sẻ nội dung deepfake với mục đích lừa đảo.',
                'Nội dung cố tình gây hoang mang trong mùa dịch bệnh, thiên tai sẽ bị gỡ ngay.',
              ]}
            />
            <PolicyCard
              title="Sở hữu trí tuệ"
              items={[
                'Chỉ đăng nội dung bạn có quyền chia sẻ hoặc đã được cấp phép hợp lệ.',
                'Không sao chép, tái sử dụng tác phẩm của người khác mà không có ghi nguồn.',
                'Vi phạm bản quyền nhạc, hình ảnh, video sẽ bị xử lý theo quy định DMCA.',
              ]}
            />
            <PolicyCard
              title="Spam & Quảng cáo"
              items={[
                'Không đăng tải nội dung spam, lặp đi lặp lại hoặc vô nghĩa.',
                'Không dùng bot hay tài khoản ảo để tăng tương tác giả mạo.',
                'Quảng cáo thương mại phải được gắn nhãn "#quảng_cáo" hoặc "#tài_trợ" rõ ràng.',
              ]}
            />
          </div>
        </PolicySection>

        <Divider />

        {/* ── 5. Hành vi bị cấm ────────────────────────────────────────────── */}
        <PolicySection section={sections[4]}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Một số hành vi bị nghiêm cấm tuyệt đối và dẫn đến xóa tài khoản ngay lập tức:
          </p>
          <ProhibitedCard
            title="Khủng bố & Chủ nghĩa cực đoan"
            description="Tuyên truyền, tài trợ hoặc khuyến khích các tổ chức khủng bố, bạo lực cực đoan. Bao gồm cả việc chia sẻ tuyên ngôn, tài liệu tuyển mộ của các tổ chức bị cấm."
          />
          <ProhibitedCard
            title="Buôn bán trái phép"
            description="Rao bán hoặc trao đổi vũ khí, chất cấm, hàng giả, tài liệu giả mạo, dữ liệu cá nhân bị đánh cắp, hoặc bất kỳ hàng hóa bất hợp pháp nào."
          />
          <ProhibitedCard
            title="Tấn công mạng & Hack"
            description="Chia sẻ mã độc, công cụ tấn công, hướng dẫn xâm nhập hệ thống trái phép hoặc lừa đảo thu thập thông tin đăng nhập của người dùng."
          />
          <ProhibitedCard
            title="Thao túng & Gian lận"
            description="Sử dụng dịch vụ mua lượt theo dõi/thích giả, điều phối hành vi nhóm để thao túng thuật toán, hoặc tạo tài khoản ảo phục vụ mục đích gian lận."
          />
          <ProhibitedCard
            title="Giả mạo danh tính"
            description="Giả mạo là người khác — dù là cá nhân thông thường, người nổi tiếng hay thương hiệu — với mục đích đánh lừa hoặc gây hại."
          />
          <ProhibitedCard
            title="Nội dung vi phạm pháp luật Việt Nam"
            description="Bất kỳ nội dung nào vi phạm pháp luật hiện hành của Cộng hòa Xã hội Chủ nghĩa Việt Nam, bao gồm chống phá Nhà nước, kích động bạo loạn."
          />
        </PolicySection>

        <Divider />

        {/* ── 6. Quyền riêng tư & Dữ liệu ─────────────────────────────────── */}
        <PolicySection section={sections[5]}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Chúng tôi tôn trọng quyền riêng tư của người dùng và cam kết bảo vệ dữ liệu cá nhân
            theo đúng quy định của pháp luật.
          </p>
          <PolicyCard
            allowed
            title="Những gì chúng tôi bảo vệ"
            items={[
              'Quyền kiểm soát thông tin cá nhân của bạn — bao gồm họ tên, số điện thoại, địa chỉ.',
              'Quyền không bị theo dõi, chụp màn hình bí mật trong các cuộc trò chuyện riêng tư.',
              'Quyền xóa tài khoản và toàn bộ dữ liệu liên quan bất kỳ lúc nào.',
              'Thông tin nhạy cảm như tình trạng sức khỏe, tín ngưỡng, xu hướng tình dục.',
            ]}
          />
          <PolicyCard
            title="Nghĩa vụ của người dùng"
            items={[
              'Không chia sẻ thông tin cá nhân của người khác mà chưa có sự đồng ý.',
              'Không chụp và đăng ảnh người khác ở không gian riêng tư.',
              'Không sử dụng thông tin liên lạc của người dùng khác cho mục đích spam hoặc thương mại.',
              'Không cố gắng thu thập thông tin cá nhân của người dùng khác ngoài những gì họ công khai.',
            ]}
          />
        </PolicySection>

        <Divider />

        {/* ── 7. Báo cáo vi phạm ───────────────────────────────────────────── */}
        <PolicySection section={sections[6]}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Bạn đóng vai trò quan trọng trong việc duy trì sự an toàn của cộng đồng.
            Hãy báo cáo cho chúng tôi khi phát hiện bất kỳ hành vi hoặc nội dung nghi ngờ vi phạm.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: <MessageSquare className="w-5 h-5 text-primary" />, title: 'Báo cáo bài viết',  desc: 'Nhấn vào biểu tượng "..." trên bài viết và chọn "Báo cáo" để gửi lên ban quản trị.' },
              { icon: <UserCheck className="w-5 h-5 text-primary" />,     title: 'Báo cáo tài khoản', desc: 'Vào trang cá nhân của tài khoản nghi ngờ, chọn "..." và nhấn "Báo cáo người dùng này".' },
              { icon: <Flag className="w-5 h-5 text-primary" />,          title: 'Báo cáo bình luận', desc: 'Nhấn giữ hoặc nhấp vào tùy chọn bình luận và chọn "Báo cáo bình luận".' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-all">
                <div className="mb-3">{item.icon}</div>
                <p className="font-semibold text-foreground text-sm mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <p className="text-sm text-foreground font-semibold flex items-center gap-2 mb-1.5">
              <Zap className="w-4 h-4 text-primary" />
              Quy trình xem xét thủ công
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Các báo cáo từ phía người dùng sẽ được gửi trực tiếp đến hệ thống quản trị. Đội ngũ <strong>Admin sẽ duyệt và xử lý thủ công</strong> từng báo cáo để đảm bảo tính khách quan và chính xác nhất.
            </p>
          </div>
        </PolicySection>

        <Divider />

        {/* ── 8. Xử lý & Biện pháp ─────────────────────────────────────────── */}
        <PolicySection section={sections[7]}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Admin áp dụng các biện pháp xử lý tương ứng tùy thuộc vào mức độ vi phạm thực tế của nội dung hoặc tài khoản.
          </p>
          <StepCard step={1} title="Cảnh báo" description="Gửi thông báo nhắc nhở hệ thống cho người dùng biết về hành vi vi phạm." />
          <StepCard step={2} title="Gỡ nội dung vi phạm" description="Bài viết, bình luận chứa nội dung vi phạm sẽ bị gỡ khỏi bảng tin và các trang công khai. Người dùng sẽ nhận được thông báo giải thích lý do cụ thể." />
          <StepCard step={3} title="Khóa tài khoản tạm thời" description="Tài khoản bị đình chỉ hoạt động trong thời gian xem xét vi phạm có hệ thống. Người dùng có quyền gửi kháng cáo giải trình." />
          <StepCard step={4} title="Khóa tài khoản vĩnh viễn" description="Áp dụng đối với các vi phạm đặc biệt nghiêm trọng hoặc tái phạm nhiều lần. Tài khoản sẽ bị xóa hoàn toàn khỏi nền tảng." />
          <div className="mt-4 p-4 rounded-xl border border-border bg-muted/30">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>
                Người dùng có quyền <strong>kháng cáo</strong> mọi quyết định xử lý trong vòng 30 ngày.
                Liên hệ{' '}
                <a href="mailto:lechinghia202@gmail.com" className="text-primary underline underline-offset-2">
                  lechinghia202@gmail.com
                </a>{' '}
                để được hỗ trợ.
              </span>
            </p>
          </div>
        </PolicySection>

        <Divider />

        {/* ── 9. Cùng xây dựng ────────────────────────────────────────────── */}
        <PolicySection section={sections[8]}>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Tiêu chuẩn cộng đồng không chỉ là bộ quy tắc — đó là cam kết chung giữa Nexo
            và toàn bộ cộng đồng người dùng. Chúng tôi tin rằng một mạng xã hội tốt đẹp được xây dựng
            bởi những con người tốt đẹp.
          </p>
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Bạn là một phần của Nexo</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mb-6">
              Mỗi bài đăng, mỗi bình luận, mỗi tương tác của bạn đều định hình văn hóa cộng đồng.
              Hãy là người truyền cảm hứng, lan tỏa những điều tốt đẹp.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/">
                <Button size="default" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Khám phá Nexo
                </Button>
              </Link>
              <a href="mailto:lechinghia202@gmail.com">
                <Button size="default" variant="outline" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Liên hệ hỗ trợ
                </Button>
              </a>
            </div>
          </div>
        </PolicySection>

        {/* ── Footer note ──────────────────────────────────────────────────── */}
        <div className="py-10 text-center border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2026 Nexo. Tiêu chuẩn cộng đồng có thể được cập nhật định kỳ.
          </p>
        </div>
      </main>
    </div>
  )
}

export default CommunityGuidelinesPage
