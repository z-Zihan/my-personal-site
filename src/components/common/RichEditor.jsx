import { useRef, useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import '@wangeditor/editor/dist/css/style.css'

// WangEditor 默认就是中文，不需要额外的 i18n 配置

export default function RichEditor({ value, onChange, height = 400 }) {
  const editorRef = useRef(null)
  const [editorInstance, setEditorInstance] = useState(null)

  // 监听编辑器内容变化
  const handleChange = (editor) => {
    if (editor) {
      const html = editor.getHtml()
      onChange(html)
    }
  }

  const editorConfig = {
    placeholder: '请输入内容...',
    onChange: handleChange,
    MENU_CONF: {
      image: {
        // 自定义图片上传配置
        uploadImage: {
          server: 'https://zzihanaini.vercel.app/api/upload-image',
          fieldName: 'image',
          customInsert(res, insertFn) {
            if (res.success && res.url) {
              insertFn(res.url, res.fileName || 'image', res.url)
            }
          },
        },
      },
    },
  }

  const toolbarConfig = {
    excludeKeys: [],
  }

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden' }}>
      <Toolbar
        editor={editorInstance}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #d9d9d9' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={value}
        onCreated={(editor) => {
          editorRef.current = editor
          setEditorInstance(editor)
        }}
        mode="default"
        style={{ height: height - 47 }}
      />
    </div>
  )
}
