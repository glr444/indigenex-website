export default function OrderList() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '60px 40px',
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 40,
        }}>
          🚀
        </div>
        <h1 style={{
          fontSize: 24,
          fontWeight: 600,
          color: '#1D1D1F',
          margin: '0 0 12px',
          letterSpacing: '-0.5px',
        }}>
          期待一下，新的M4系统哦
        </h1>
        <p style={{
          fontSize: 14,
          color: '#86868B',
          margin: 0,
        }}>
          订单管理功能正在开发中，敬请期待...
        </p>
      </div>
    </div>
  )
}
