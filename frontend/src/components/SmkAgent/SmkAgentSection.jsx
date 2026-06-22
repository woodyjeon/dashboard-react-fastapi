import { Bot, ExternalLink, Workflow, Zap, ShieldCheck } from 'lucide-react'
import { siteConfig } from '../../data/siteConfig'
import './SmkAgentSection.css'

const features = [
  { Icon: Workflow, title: '도구 연결', text: '여러 서비스를 연결해 작업 흐름을 자동화합니다.' },
  { Icon: Zap, title: '자동 실행', text: '반복 작업을 대신 수행해 시간을 절약합니다.' },
  { Icon: ShieldCheck, title: '안전한 연동', text: '설정한 범위 안에서만 안전하게 동작합니다.' },
]

export default function SmkAgentSection() {
  const { smkAgent } = siteConfig

  return (
    <section className="section section--light smk" id="smk-agent">
      <div className="container">
        <div className="smk__card">
          <div className="smk__intro">
            <span className="smk__eyebrow">
              <Bot size={16} /> SMK Agent
            </span>
            <h2 className="section__title">{smkAgent.name}</h2>
            <p className="smk__desc">{smkAgent.description}</p>
            <div className="smk__actions">
              <a
                href={smkAgent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                앱 실행하기 <ExternalLink size={16} />
              </a>
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
              <a
                href={smkAgent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="smk__mock"
              >
                <div className="smk__mock-bar">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="smk__mock-body">
                  <Bot size={48} />
                  <p>{smkAgent.name} 실행</p>
                  <span className="smk__mock-link">
                    새 창에서 열기 <ExternalLink size={14} />
                  </span>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
