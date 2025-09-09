const darkThemeStyles = {
  pageContainer: {
    background: 'linear-gradient(135deg, #0a1929 0%, #1a237e 50%, #000051 100%)',
    minHeight: '100vh',
    color: '#fff',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  card: {
    background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7))',
    border: '2px solid #00d4ff',
    borderRadius: 12,
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), inset 0 0 40px rgba(0, 212, 255, 0.12)',
    position: 'relative' as const,
  },
  title: {
    color: '#00d4ff',
    fontWeight: 700,
    textShadow: '0 0 15px rgba(0, 212, 255, 0.8), 0 0 30px rgba(0, 212, 255, 0.4)',
    fontSize: '18px',
  },
  statisticPrimary: {
    color: '#00d4ff',
    textShadow: '0 0 10px rgba(0, 212, 255, 0.6)'
  },
  statisticSuccess: {
    color: '#00ff88',
    textShadow: '0 0 10px rgba(0, 255, 136, 0.6)'
  },
  statisticWarning: {
    color: '#ff6b35',
    textShadow: '0 0 10px rgba(255, 107, 53, 0.6)'
  },
  statisticPurple: {
    color: '#a855f7',
    textShadow: '0 0 10px rgba(168, 85, 247, 0.6)'
  },
  chartBackground: {
    background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.95), rgba(26, 35, 126, 0.85))',
    border: '2px solid #00d4ff',
    borderRadius: 12,
    padding: 8,
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), inset 0 0 30px rgba(0, 212, 255, 0.08)',
  },
  button: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
    border: '2px solid #00d4ff',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 'bold',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 15px rgba(0, 212, 255, 0.1)',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
  },
  resetButton: {
    background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6))',
    border: '2px solid #00d4ff',
    borderRadius: 8,
    color: '#00d4ff',
    fontWeight: 'bold',
    boxShadow: '0 0 15px rgba(0, 212, 255, 0.3), inset 0 0 15px rgba(0, 212, 255, 0.08)',
    textShadow: '0 0 6px rgba(0, 212, 255, 0.6)',
  },
  input: {
    background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6))',
    border: '2px solid rgba(0, 212, 255, 0.4)',
    borderRadius: 8,
    color: '#fff',
    boxShadow: 'inset 0 0 15px rgba(0, 212, 255, 0.1)',
  },
  table: {
    backgroundColor: 'transparent',
    color: '#fff',
  },
  statisticCard: {
    background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7))',
    border: '2px solid #00d4ff',
    borderRadius: 12,
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 25px rgba(0, 212, 255, 0.3), inset 0 0 25px rgba(0, 212, 255, 0.1)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  }
};

export default darkThemeStyles;



