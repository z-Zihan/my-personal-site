import { useRef, useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import '@wangeditor/editor/dist/css/style.css'

// WangEditor 默认就是中文，不需要额外的 i18n 配置

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
}

interface EditorInstance {
  getHtml: () => string
  setHtml: (html: string) => void
  [key: string]: unknown
}

// WangEditor 的 IDomEditor 类型
interface WangEditorInstance {
  getHtml: () => string
  setHtml: (html: string) => void
  [key: string]: unknown
}

export default function RichEditor({ value, onChange, height = 400 }: RichEditorProps) {
  const editorRef = useRef<EditorInstance | null>(null)
  const [editorInstance, setEditorInstance] = useState<EditorInstance | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  // 监听 value 变化，支持外部回填（编辑时回填正文）
  useEffect(() => {
    if (!editorInstance || value === undefined) return

    // 只有当 value 真正变化时才调用 setHtml
    const currentHtml = editorInstance.getHtml()
    if (currentHtml !== value) {
      editorInstance.setHtml(value)
    }
  }, [value, editorInstance])

  // 监听编辑器内容变化
  const handleChange = (editor: EditorInstance) => {
    if (editor) {
      const html = editor.getHtml()
      onChange(html)
    }
  }

  const editorConfig = {
    placeholder: '请输入内容...',
    onChange: handleChange,
    MENU_CONF: {
      // 正确的图片上传配置 - 直接在 MENU_CONF 下配置 uploadImage
      uploadImage: {
        server: 'https://zzihanaini.vercel.app/api/upload-image',
        fieldName: 'image',
        customInsert(res: { success: boolean; url: string; fileName?: string }, insertFn: (url: string, name: string, href: string) => void) {
          if (res.success && res.url) {
            insertFn(res.url, res.fileName || 'image', res.url)
          }
        },
      },
    },
  }

  const toolbarConfig = {
    excludeKeys: [],
  }

  return (
    <div
      className="rich-editor-container"
      style={{
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        position: fullscreen ? 'fixed' : 'relative',
        top: fullscreen ? 0 : 'auto',
        left: fullscreen ? 0 : 'auto',
        right: fullscreen ? 0 : 'auto',
        bottom: fullscreen ? 0 : 'auto',
        width: fullscreen ? '100vw' : 'auto',
        height: fullscreen ? '100vh' : 'auto',
        zIndex: fullscreen ? 9999 : 1,
        backgroundColor: fullscreen ? '#fff' : 'transparent',
      }}
    >
      <Toolbar editor={editorInstance as unknown as typeof Editor.prototype} defaultConfig={toolbarConfig} mode="default" style={{ borderBottom: '1px solid #d9d9d9' }} />
      <Editor
        defaultConfig={editorConfig as unknown as Record<string, unknown>}
        onCreated={(editor: unknown) => {
          editorRef.current = editor as EditorInstance
          setEditorInstance(editor as EditorInstance)
          // 编辑器创建后，如果有 value 则立即设置
          if (value) {
            (editor as EditorInstance).setHtml(value)
          }
        }}
        mode="default"
        style={{ height: fullscreen ? 'calc(100vh - 47px)' : height - 47 }}
      />
    </div>
  )
}
