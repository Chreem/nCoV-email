import React, {useCallback, FormEvent, useState, useEffect, useMemo} from 'react'
import $ from 'jquery'
import Form, {FormComponentProps} from 'antd/es/form'
import Alert from 'antd/es/alert'
import Button from 'antd/es/button'
import message from 'antd/es/message'
import Input from 'antd/es/input'
import 'antd/es/form/style'
import 'antd/es/alert/style'
import 'antd/es/button/style'
import 'antd/es/message/style'
import 'antd/es/input/style'
import './style.less'

const {authUrl} = require('../../const/server.json');
const {Item: FormItem} = Form;


const EmailAuth = ({form}: FormComponentProps) => {
    const {getFieldDecorator} = form;
    const [sendingAuth, setSending] = useState(false);
    const [counterDown, setCountDown] = useState(null);
    const [alertInfo, setAlertInfo] = useState({error: 0, message: ''});

    const handleFormSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        form.validateFields(async (err, values) => {
            if (err) return;
            setSending(true);
            const email = values['email'];
            const result = await $.post(authUrl, {email});
            setSending(false);
            setCountDown(60);
            setAlertInfo(result);
            if (result.error === 0) message.success('验证邮件已发送，请检查你的邮箱');
        });
    }, [form]);

    useEffect(() => {
        if (counterDown <= 0) return;
        const timeout = setTimeout(() => {
            setCountDown(counterDown - 1);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [counterDown]);

    const buttonText = useMemo(() => {
        if (counterDown === null) return '验证';
        if (counterDown > 0) return `重新发送(${counterDown})`;
        if (counterDown <= 0) return '重新发送';
        return ''
    }, [counterDown]);

    return <div id="email_page">
        <Form id="email_auth" onSubmit={handleFormSubmit}>
            <h2>疫情推送</h2>
            {alertInfo.error !== 0 && (
                <Alert type="error"
                       showIcon
                       message={alertInfo.message}/>
            )}
            <FormItem>{getFieldDecorator('email', {
                rules: [{required: true}]
            })(<Input type="email"
                      placeholder="你的邮箱"
                      onChange={() => setAlertInfo({error: 0, message: ''})}/>)}</FormItem>
            <Button loading={sendingAuth}
                    disabled={(counterDown !== null) && (counterDown > 0)}
                    type="primary"
                    htmlType="submit">{buttonText}</Button>
        </Form>
    </div>
};
export default Form.create()(EmailAuth);
