import React, {useCallback, FormEvent, useState, useEffect, useMemo, Fragment} from 'react'
import $ from 'jquery'
import Form, {FormComponentProps} from 'antd/es/form'
import Alert from 'antd/es/alert'
import Button from 'antd/es/button'
import message from 'antd/es/message'
import Input from 'antd/es/input'
import Row from "antd/es/grid/row";
import Col from "antd/es/grid/col";
import Select from 'antd/es/select';
import Spin from 'antd/es/spin';
import 'antd/es/form/style'
import 'antd/es/alert/style'
import 'antd/es/button/style'
import 'antd/es/message/style'
import 'antd/es/input/style'
import 'antd/es/row/style'
import 'antd/es/col/style'
import 'antd/es/select/style'
import 'antd/es/spin/style'
import './style.less'
import config from '../../const'
import {ProvinceType} from '../../type'


const {Item: FormItem} = Form;
const {Option, OptGroup} = Select;


const EmailAuth = ({form}: FormComponentProps) => {
    /**
     * 邮箱验证
     */
    const {getFieldDecorator} = form;
    const [sendingAuth, setSending] = useState(false);
    const [counterDown, setCountDown] = useState(null);
    const [alertInfo, setAlertInfo] = useState({error: 0, message: ''});

    const handleFormSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        form.validateFields(async (err, values) => {
            if (err) return;
            setAlertInfo({error: 0, message: ''});
            setSending(true);
            const email = values['email'];
            const provinceId = values['provinceId'] || '0';
            const result = await $.post(config.authUrl, {email, provinceId: provinceId.toString()});
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


    /**
     * 省份
     */
    const [loadProvince, setLoadProvince] = useState(true);
    const [province, setProvince] = useState<ProvinceType[]>([]);
    useEffect(() => {
        (async () => {
            const result = await $.get(config.provinceUrl);
            setProvince(result.message);
            setLoadProvince(false);
        })();
    }, []);
    const provinceView = useMemo(() => {
        const result = province.filter(i => i.provinceId !== '1').map(item => {
            return <Option key={item.provinceId}>{item.provinceName}</Option>;
        });
        result.push(<Option key="1">国外</Option>);
        return result;
    }, [province]);

    // 修改省份
    const handleChangeProvince = useCallback(() => {
        form.validateFields(async (err, values) => {
            if (err) return;
            setAlertInfo({error: 0, message: ''});
            setSending(true);
            const email = values['email'];
            const provinceId = values['provinceId'] || '0';
            const result = await $.post(config.changeUrl, {email, provinceId: provinceId.toString()});
            setSending(false);
            setCountDown(10);
            setAlertInfo(result);
            if (result.error === 0) message.success('地区偏好已修改');
        });
    }, [form]);


    /**
     * 视图
     */
    return <div id="email_page">
        <Form id="email_auth" onSubmit={handleFormSubmit}>
            <h2>疫情推送</h2>
            <Row>
                {alertInfo.error !== 0 && (
                    <Alert type="error"
                           showIcon
                           message={alertInfo.message}/>
                )}
            </Row>
            <Row>
                <FormItem>
                    <Col span={16}>
                        {getFieldDecorator('email', {
                            rules: [{required: true}]
                        })(<Input type="email"
                                  placeholder="你的邮箱"
                                  onChange={() => setAlertInfo({error: 0, message: ''})}/>)}
                    </Col>
                    <Col span={8}>
                        <Button loading={sendingAuth}
                                disabled={(counterDown !== null) && (counterDown > 0)}
                                type="primary"
                                htmlType="submit">{buttonText}</Button>
                    </Col>
                </FormItem>
            </Row>

            <Alert type="warning"
                   banner
                   message={<Fragment>
                       <div>地区偏好将在验证同时一同发送，不需再按"修改偏好"按钮</div>
                   </Fragment>}/>
            <h4>地区偏好</h4>
            <Row>
                <Spin spinning={loadProvince}>
                    <FormItem>
                        <Col span={16}>
                            {getFieldDecorator('provinceId', {})(
                                <Select mode="multiple"
                                        placeholder="关注的省份，不选即关注所有">{provinceView}</Select>
                            )}
                        </Col>
                        <Col span={8}>
                            <Button loading={sendingAuth}
                                    disabled={(counterDown !== null) && (counterDown > 0)}
                                    type="primary"
                                    onClick={handleChangeProvince}>修改偏好</Button>
                        </Col>
                    </FormItem>
                </Spin>
            </Row>
        </Form>
    </div>
};
export default Form.create()(EmailAuth);
