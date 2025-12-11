import React, { useContext, useRef, useImperativeHandle, forwardRef } from 'react';
import Editor from '@monaco-editor/react';
import { ProjectContext } from '../../context/ProjectContext';

const CodeEditor = forwardRef((props, ref) => {
    const { currentProject, currentCardIndex, updateCard } = useContext(ProjectContext);
    const editorRef = useRef(null);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    useImperativeHandle(ref, () => ({
        insertText: (text) => {
            if (editorRef.current) {
                const editor = editorRef.current;
                let selection = editor.getSelection();

                // Fallback if no selection: Insert at end or beginning? 
                // Let's insert at current cursor pos (if exists) or beginning.
                if (!selection) {
                    selection = {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 1,
                        endColumn: 1
                    };
                }

                const id = { major: 1, minor: 1 };
                const op = {
                    identifier: id,
                    range: selection,
                    text: text,
                    forceMoveMarkers: true
                };

                editor.focus(); // Focus first
                editor.executeEdits("my-source", [op]);
                editor.pushUndoStop(); // Ensure it's undoable separate step
            }
        }
    }));

    if (!currentProject || currentCardIndex === -1) {
        return <div className="editor-container center-message">Select a card to edit code</div>;
    }

    const card = currentProject.data.cards[currentCardIndex];
    if (!card) return null;

    const handleEditorChange = (value, event) => {
        updateCard(currentCardIndex, 'code', value);
    };

    return (
        <div className="editor-container">
            <Editor
                height="100%"
                defaultLanguage="csharp"
                theme="vs-dark"
                value={card.code || ''}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4
                }}
            />
        </div>
    );
});

export default CodeEditor;
