import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

// TinyMCE API Key - 请替换为你自己的 API Key
// 获取方式：https://www.tiny.cloud/my-account/
const TINY_MCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key';

export default function RichEditor({ value, onChange, height = 400 }) {
  const editorRef = useRef(null);

  const handleEditorChange = (content) => {
    onChange(content);
  };

  return (
    <Editor
      onInit={(evt, editor) => (editorRef.current = editor)}
      value={value}
      apiKey={TINY_MCE_API_KEY}
      init={{
        height,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar:
          'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | image media table | code | help',
        content_style: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 16px;
            background: #ffffff;
            color: #333333;
          }
          body.dark {
            background: #1a1a2e;
            color: #ffffff;
          }
        `,
        skin: 'oxide',
        content_css: 'default',
        language: 'zh_CN',
        image_title: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        image_caption: true,
        image_advtab: true,
      }}
      onEditorChange={handleEditorChange}
    />
  );
}
