import React, { useEffect, useRef, useState } from 'react';
import {
  countWords,
  stripHtmlToText
} from '../utils/answerContent';
import styles from './RichTextAnswerEditor.module.css';

const FORMAT_COMMANDS = [
  { key: 'bold', label: 'B', command: 'bold' },
  { key: 'italic', label: 'I', command: 'italic' },
  { key: 'underline', label: 'U', command: 'underline' },
  { key: 'strikeThrough', label: 'S', command: 'strikeThrough' }
];

function getActiveFormats() {
  return FORMAT_COMMANDS.reduce((state, item) => {
    state[item.key] = document.queryCommandState(item.command);
    return state;
  }, {});
}

export default function RichTextAnswerEditor({
  value,
  onChange,
  maxWords,
  minHeight = 100,
  placeholder = 'Type your answer here…',
  showBookmark = false
}) {
  const editorRef = useRef(null);
  const [wordCount, setWordCount] = useState(() =>
    countWords(stripHtmlToText(value || ''))
  );
  const [bookmarked, setBookmarked] = useState(false);
  const [activeFormats, setActiveFormats] = useState(() => ({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false
  }));

  useEffect(() => {
    const node = editorRef.current;
    if (!node) {
      return;
    }

    const nextValue = value || '';
    if (node.innerHTML !== nextValue) {
      node.innerHTML = nextValue;
    }

    setWordCount(countWords(stripHtmlToText(nextValue)));
  }, [value]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = document.getSelection();
      if (!selection?.anchorNode || !editorRef.current?.contains(selection.anchorNode)) {
        return;
      }

      setActiveFormats(getActiveFormats());
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleInput = () => {
    const node = editorRef.current;
    if (!node) {
      return;
    }

    const html = node.innerHTML;
    setWordCount(countWords(stripHtmlToText(html)));
    onChange(html);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Tab') {
      return;
    }

    event.preventDefault();
    document.execCommand('insertText', false, '\t');
    handleInput();
  };

  const applyFormat = (command) => {
    const node = editorRef.current;
    if (!node) {
      return;
    }

    node.focus();
    document.execCommand(command, false, null);
    handleInput();
    setActiveFormats(getActiveFormats());
  };

  const limitReached = wordCount >= maxWords;

  return (
    <div className={styles.editorShell}>
      {showBookmark && (
        <button
          type="button"
          className={`${styles.bookmarkButton} ${bookmarked ? styles.bookmarked : ''}`}
          onClick={() => setBookmarked((current) => !current)}
        >
          🔖
        </button>
      )}

      <div className={styles.toolbar}>
        {FORMAT_COMMANDS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={activeFormats[item.key] ? styles.active : ''}
            onMouseDown={(event) => {
              event.preventDefault();
              applyFormat(item.command);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        ref={editorRef}
        className={styles.editable}
        contentEditable
        suppressContentEditableWarning
        dir="ltr"
        data-placeholder={placeholder}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={{ minHeight }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />

      <div
        className={`${styles.wordCount} ${limitReached ? styles.wordCountWarning : ''}`}
      >
        {limitReached
          ? `Word limit reached ${wordCount}/${maxWords}`
          : `Words ${wordCount} / ${maxWords}`}
      </div>
    </div>
  );
}
