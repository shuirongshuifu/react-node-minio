import { useRef } from 'react';
import UpContent from './components/UpContent/UpContent'
import DownContent from './components/DownContent/DownContent'

function App() {

  const downContentRef = useRef<any>(null); // 子组件实例ref

  const updateList = () => {
    downContentRef.current.getList(); // 调用子组件实例方法
  }
  return (
    <>
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        padding: '12px',
        boxSizing: 'border-box',
        border: '1px solid #ccc',
      }}>
        <UpContent updateList={updateList} />
        <DownContent ref={downContentRef} />
      </div>
    </>
  )
}

export default App
