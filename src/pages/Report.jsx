import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../components/OceanBackground'
import './Report.css'

const Report = () => {
  const navigate = useNavigate()
  const [reportType, setReportType] = useState('')
  const [reportContent, setReportContent] = useState('')
  const [reportedName, setReportedName] = useState('')
  const [contact, setContact] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // 法律条文数据库
  const legalArticles = {
    'unscrupulous-merchant': {
      title: '无良商家相关法律条文',
      articles: [
        {
          law: '《消费者权益保护法》',
          article: '第五十五条',
          content: '经营者提供商品或者服务有欺诈行为的，应当按照消费者的要求增加赔偿其受到的损失，增加赔偿的金额为消费者购买商品的价款或者接受服务的费用的三倍；增加赔偿的金额不足五百元的，为五百元。'
        },
        {
          law: '《消费者权益保护法》',
          article: '第五十六条',
          content: '经营者有下列情形之一，除承担相应的民事责任外，其他有关法律、法规对处罚机关和处罚方式有规定的，依照法律、法规的规定执行；法律、法规未作规定的，由工商行政管理部门或者其他有关行政部门责令改正，可以根据情节单处或者并处警告、没收违法所得、处以违法所得一倍以上十倍以下的罚款，没有违法所得的，处以五十万元以下的罚款；情节严重的，责令停业整顿、吊销营业执照。'
        },
        {
          law: '《食品安全法》',
          article: '第一百四十八条',
          content: '消费者因不符合食品安全标准的食品受到损害的，可以向经营者要求赔偿损失，也可以向生产者要求赔偿损失。生产不符合食品安全标准的食品或者经营明知是不符合食品安全标准的食品，消费者除要求赔偿损失外，还可以向生产者或者经营者要求支付价款十倍或者损失三倍的赔偿金。'
        }
      ]
    },
    'criminal-offense': {
      title: '违法犯罪相关法律条文',
      articles: [
        {
          law: '《刑法》',
          article: '第二百六十六条',
          content: '诈骗公私财物，数额较大的，处三年以下有期徒刑、拘役或者管制，并处或者单处罚金；数额巨大或者有其他严重情节的，处三年以上十年以下有期徒刑，并处罚金；数额特别巨大或者有其他特别严重情节的，处十年以上有期徒刑或者无期徒刑，并处罚金或者没收财产。'
        },
        {
          law: '《刑法》',
          article: '第二百二十四条',
          content: '组织、领导以推销商品、提供服务等经营活动为名，要求参加者以缴纳费用或者购买商品、服务等方式获得加入资格，并按照一定顺序组成层级，直接或者间接以发展人员的数量作为计酬或者返利依据，引诱、胁迫参加者继续发展他人参加，骗取财物，扰乱经济社会秩序的传销活动的，处五年以下有期徒刑或者拘役，并处罚金；情节严重的，处五年以上有期徒刑，并处罚金。'
        },
        {
          law: '《治安管理处罚法》',
          article: '第四十九条',
          content: '盗窃、诈骗、哄抢、抢夺、敲诈勒索或者故意损毁公私财物的，处五日以上十日以下拘留，可以并处五百元以下罚款；情节较重的，处十日以上十五日以下拘留，可以并处一千元以下罚款。'
        }
      ]
    },
    'fraud': {
      title: '诈骗相关法律条文',
      articles: [
        {
          law: '《刑法》',
          article: '第二百六十六条',
          content: '诈骗公私财物，数额较大的，处三年以下有期徒刑、拘役或者管制，并处或者单处罚金；数额巨大或者有其他严重情节的，处三年以上十年以下有期徒刑，并处罚金；数额特别巨大或者有其他特别严重情节的，处十年以上有期徒刑或者无期徒刑，并处罚金或者没收财产。'
        },
        {
          law: '《反电信网络诈骗法》',
          article: '第三十八条',
          content: '组织、策划、实施、参与电信网络诈骗活动或者为电信网络诈骗活动提供帮助，构成犯罪的，依法追究刑事责任。'
        }
      ]
    },
    'other': {
      title: '其他违法行为相关法律条文',
      articles: [
        {
          law: '《民法典》',
          article: '第一千一百六十五条',
          content: '行为人因过错侵害他人民事权益造成损害的，应当承担侵权责任。依照法律规定推定行为人有过错，其不能证明自己没有过错的，应当承担侵权责任。'
        },
        {
          law: '《消费者权益保护法》',
          article: '第八条',
          content: '消费者享有知悉其购买、使用的商品或者接受的服务的真实情况的权利。'
        }
      ]
    }
  }

  const reportTypes = [
    { value: 'unscrupulous-merchant', label: '无良商家', icon: '🏪' },
    { value: 'criminal-offense', label: '违法犯罪', icon: '⚖️' },
    { value: 'fraud', label: '诈骗行为', icon: '🚨' },
    { value: 'other', label: '其他', icon: '📋' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!reportType || !reportContent || !reportedName) {
      alert('请填写完整的举报信息')
      return
    }

    // 保存举报记录到本地存储
    const reportData = {
      type: reportType,
      content: reportContent,
      reportedName: reportedName,
      contact: contact,
      timestamp: new Date().toISOString(),
      id: Date.now()
    }

    const existingReports = JSON.parse(localStorage.getItem('reports') || '[]')
    existingReports.push(reportData)
    localStorage.setItem('reports', JSON.stringify(existingReports))

    setSubmitted(true)
    
    // 3秒后返回
    setTimeout(() => {
      navigate('/graduation')
    }, 3000)
  }

  const selectedLegalArticles = reportType ? legalArticles[reportType] : null

  return (
    <div className="report-page">
      <OceanBackground />
      <div className="report-content">
        <div className="report-header">
          <h1 className="report-title">🚨 一键举报 🚨</h1>
          <button 
            className="back-button"
            onClick={() => navigate('/graduation')}
          >
            ← 返回
          </button>
        </div>

        {!submitted ? (
          <form className="report-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2 className="section-title">选择举报类型</h2>
              <div className="report-types-grid">
                {reportTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`report-type-card ${reportType === type.value ? 'selected' : ''}`}
                    onClick={() => setReportType(type.value)}
                  >
                    <div className="type-icon">{type.icon}</div>
                    <div className="type-label">{type.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">举报信息</h2>
              <div className="form-group">
                <label>被举报人/商家名称 *</label>
                <input
                  type="text"
                  value={reportedName}
                  onChange={(e) => setReportedName(e.target.value)}
                  placeholder="请输入被举报人姓名或商家名称"
                  required
                />
              </div>

              <div className="form-group">
                <label>举报内容 *</label>
                <textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="请详细描述举报事由、时间、地点、经过等..."
                  rows="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>联系方式（选填）</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="手机号或邮箱，用于接收处理结果"
                />
              </div>
            </div>

            {selectedLegalArticles && (
              <div className="form-section legal-section">
                <h2 className="section-title">📚 相关法律条文</h2>
                <div className="legal-articles">
                  {selectedLegalArticles.articles.map((article, index) => (
                    <div key={index} className="legal-article">
                      <div className="legal-header">
                        <span className="law-name">{article.law}</span>
                        <span className="article-number">{article.article}</span>
                      </div>
                      <p className="legal-content">{article.content}</p>
                    </div>
                  ))}
                </div>
                <div className="legal-notice">
                  <p>⚠️ 重要提示：</p>
                  <ul>
                    <li>举报信息应当真实、准确，不得捏造、歪曲事实</li>
                    <li>虚假举报可能承担法律责任</li>
                    <li>建议保留相关证据（聊天记录、转账记录、照片等）</li>
                    <li>严重违法行为请及时拨打110报警</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="submit-button">
                🚨 提交举报
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => navigate('/graduation')}
              >
                取消
              </button>
            </div>
          </form>
        ) : (
          <div className="submit-success">
            <div className="success-icon">✅</div>
            <h2>举报提交成功！</h2>
            <p>您的举报信息已记录，我们会认真处理。</p>
            <p className="success-tip">如有紧急情况，请及时拨打110报警。</p>
            <p className="auto-redirect">3秒后自动返回...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Report























