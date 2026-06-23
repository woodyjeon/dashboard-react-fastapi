import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileDown,
  FileText,
} from 'lucide-react'
import { siteConfig } from '../../data/siteConfig'
import './SmkAgentSection.css'

const features = [
  {
    Icon: ClipboardList,
    title: 'SMK 자동 작성',
    text: '기술개요·차별성·TRL·활용분야·시장규모·지식재산권 현황 등 기술홍보자료 항목을 AI가 개조식으로 생성합니다.',
  },
  {
    Icon: BarChart3,
    title: '시장규모·특허 추출',
    text: '특허 PDF에서 출원 정보와 대표도면을 추출하고, 웹 검색 기반 시장규모 데이터를 함께 수집합니다.',
  },
  {
    Icon: FileDown,
    title: 'Word·PDF 출력',
    text: '작성된 SMK를 Word·PDF 문서로 내려받아 기술이전·사업화 자료로 바로 활용할 수 있습니다.',
  },
]

export default function SmkAgentSection() {
  const { smkAgent } = siteConfig

  return (
    <section className="section section--light smk" id="smk-agent">
      <div className="container">
        <div className="smk__card">
          <div className="smk__intro">
            <span className="smk__eyebrow">
              <FileText size={16} /> 기술홍보자료 (SMK)
            </span>
            <h2 className="section__title">{smkAgent.name}</h2>
            <p className="smk__desc">{smkAgent.description}</p>
            <div className="smk__actions">
              <Link to="/smk" className="btn btn--primary">
                SMK 작성 시작 <ArrowRight size={16} />
              </Link>
            </div>
            <ul className="smk__features">
              {features.map(({ Icon, title, text }) => (
                <li key={title} className="smk__feature">
                  <span className="smk__feature-icon">
                    <Icon size={18} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="smk__preview">
            {smkAgent.embed ? (
              <iframe
                className="smk__iframe"
                src={smkAgent.url}
                title={smkAgent.name}
                loading="lazy"
              />
            ) : (
              <Link to="/smk" className="smk__mock">
                <div className="smk__mock-bar">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="smk__mock-body">
                  <FileText size={48} />
                  <p>기술홍보자료 작성 워크스페이스</p>
                  <span className="smk__mock-link">
                    워크스페이스 열기 <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
