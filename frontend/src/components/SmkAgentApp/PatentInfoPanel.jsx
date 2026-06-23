import { forwardRef } from 'react'

const PatentInfoPanel = forwardRef(function PatentInfoPanel({ patent }, ref) {
  return (
    <section ref={ref} className="smkapp__panel smkapp__panel--left" id="smkapp-patent-panel">
      <div className="smkapp__panel-head smkapp__panel-head--stacked">
        <div className="smkapp__panel-head-text">
          <h2 className="smkapp__panel-title">특허 출원서 정보</h2>
        </div>
      </div>

      <div className="smkapp__panel-scroll">
        {!patent ? (
          <p className="smkapp__hint">PDF를 업로드하면 특허 정보가 표시됩니다</p>
        ) : null}

        <div className="smkapp__field">
          <span className="smkapp__field-label">출원번호</span>
          <span className="smkapp__field-value">{patent?.app_no || '—'}</span>
        </div>
        <div className="smkapp__field">
          <span className="smkapp__field-label">발명의 명칭</span>
          <span className="smkapp__field-value">{patent?.title || '—'}</span>
        </div>
        <div className="smkapp__field">
          <span className="smkapp__field-label">출원인 / 출원일</span>
          <span className="smkapp__field-value">
            {patent?.applicant || patent?.apply_date
              ? `${patent?.applicant || '—'} / ${patent?.apply_date || '—'}`
              : '—'}
          </span>
        </div>

        <div className="smkapp__summary">
          <span className="smkapp__field-label">기술요약 (300자 내외)</span>
          <p className="smkapp__summary-text">{patent?.tech_summary || '—'}</p>
        </div>

        <div className="smkapp__figure">
          <span className="smkapp__field-label">대표도면</span>
          {patent?.drawing_base64 ? (
            <img
              className="smkapp__figure-img"
              src={patent.drawing_base64}
              alt="대표도면"
            />
          ) : (
            <div className="smkapp__figure-box">도면 없음</div>
          )}
        </div>
      </div>
    </section>
  )
})

export default PatentInfoPanel
