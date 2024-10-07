import "./App.css";

import {useEffect, useRef, useState} from "react";

import styled from 'styled-components';
import {EditorRef, EmailEditor} from "react-email-editor";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
`;

const Bar = styled.div`
    flex: 1;
    background-color: #61dafb;
    color: #000;
    padding: 10px;
    display: flex;
    max-height: 40px;

    h1 {
        flex: 1;
        font-size: 16px;
        text-align: left;
    }

    button {
        flex: 1;
        padding: 10px;
        margin-left: 10px;
        font-size: 14px;
        font-weight: bold;
        background-color: #000;
        color: #fff;
        border: 0px;
        max-width: 150px;
        cursor: pointer;
    }
`;

type EmailTemplate = {
    name: string;
    design: any;
    html: string;
    _id: string;
}

function App() {
    const emailEditorRef = useRef<EditorRef | null>(null);
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [to, setTo] = useState('');

    const saveDesign = () => {
        const unlayer = emailEditorRef.current?.editor;

        unlayer?.exportHtml((data) => {
            const {design, html} = data;
            if (!!selectedTemplate) {
                const template = allTemplates.find((t) => t.design === selectedTemplate);
                fetch(`/email-template/${template?._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        design,
                        html
                    })
                }).then(() => {
                    setAllTemplates(allTemplates.map((t) => {
                        if (t._id === template?._id) {
                            return {
                                ...t,
                                design,
                                html
                            }
                        }
                        return t;
                    }));
                });
            } else {
                fetch('/email-template', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'New Template',
                        design,
                        html
                    })
                }).then(resp => resp.json()).then((resp) => {
                    setAllTemplates([...allTemplates, {
                        name: 'New Template',
                        design,
                        html,
                        _id: resp.id
                    }]);
                });
            }
        });
    };

    const newTemplate = () => {
        const unlayer = emailEditorRef.current?.editor;
        unlayer?.loadBlank();
        setSelectedTemplate(null);
        unlayer?.hidePreview();
    }

    const chooseTemplate = (design: any, preview: boolean) => {
        const unlayer = emailEditorRef.current?.editor;
        unlayer?.loadDesign(design);
        setSelectedTemplate(design);
        if (preview) {
            unlayer?.showPreview({device: 'desktop'});
        } else {
            unlayer?.hidePreview();
        }
    }

    const sendEmail = (templateId: string) => {
        const unlayer = emailEditorRef.current?.editor;
        fetch('/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                templateId,
                to,
                firstName,
                lastName
            })
        }).then(() => {
            alert('Email sent successfully');
        });
    }

    useEffect(() => {
        fetch('/email-template')
            .then(response => response.json())
            .then(data => setAllTemplates(data));
    }, []);

    return (
        <Container>
            <div>
                first name:
                <input onChange={(e) => setFirstName(e.target.value)}/>
                <br />
                last name:
                <input onChange={(e) => setLastName(e.target.value)}/>
                <br />
                to:
                <input onChange={(e) => setTo(e.target.value)}/>
            </div>

            <table>
                <thead>
                <tr>
                    <th>Template Name</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {
                    allTemplates.map((template) => (
                        <tr key={template._id}>
                            <td>{template.name}</td>
                            <td>
                                <button onClick={() => chooseTemplate(template.design, true)}>Preview</button>
                                <button onClick={() => chooseTemplate(template.design, false)}>Edit</button>
                                <button onClick={() => sendEmail(template._id)}>Send This Template</button>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
            <br/>
            <button onClick={newTemplate}>New Template</button>
            <br/>
            <>
                <Bar>
                    <button onClick={saveDesign}>{
                        !!selectedTemplate ?
                            'Update Design' : 'Save Design'
                    }
                    </button>
                </Bar>
                <EmailEditor
                    ref={emailEditorRef}
                    options={{
                        version: "latest",
                        appearance: {
                            theme: "modern_light"
                        },
                        mergeTags: {
                            first_name: {
                                name: "First Name",
                                value: "{{first_name}}",
                                sample: "John"
                            },
                            last_name: {
                                name: "Last Name",
                                value: "{{last_name}}",
                                sample: "Doe"
                            }
                        }
                    }}
                />
            </>

        </Container>
    );
}

export default App;
