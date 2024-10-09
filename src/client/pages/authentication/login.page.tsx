import React, {useEffect, useState} from 'react';

import {Button, Form, Input, Typography} from 'antd';

import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import httpClient from '../../utils/http-client.util';
import {Endpoint} from '../../constants/endpoints.enum';
import {AxiosError} from 'axios';
import {LoginCredential, Authentication} from '../../../interfaces/authentication';
import {popMessage} from '../../components/pop-message.component';
import {useBoundStore} from '../../states/bound.store';

const {Title} = Typography;

const Login = () => {
  const [submitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(false);

  const userLogin = useBoundStore((state) => state.userLogin);
  const user = useBoundStore((state) => state.user);
  const navigate = useNavigate();
  const [loginForm] = Form.useForm<LoginCredential>();

  const onFieldsChange = async () => {
    const hasErrors = loginForm.getFieldsError().some(({errors}) => errors.length);
    setFormError(hasErrors);
  };

  const handleSubmit = async (loginCredential: LoginCredential) => {
    setIsSubmitting(true);
    try {
      const loginAttempt = await httpClient.post<Authentication>(Endpoint.LOGIN, loginCredential);
      if (loginAttempt.status === 200) {
        userLogin(loginAttempt.data);
        navigate('/');
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response) {
          const {message} = err.response.data;
          popMessage.error({content: message, duration: 0});
        }
      } else {
        console.log(err);
        popMessage.error('Unknown Error During Login!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, []);

  return (
    <section className={'h-lvh flex items-center justify-center'}>
      <div className={'rounded-xl overflow-hidden shadow-xl px-10 py-5 text-center backdrop-blur-sm'}>
        <div className={'mb-4'}>
          <Title level={2}>Sign in</Title>
        </div>
        <Form
          form={loginForm}
          initialValues={{
            remember: true,
          }}
          onFinish={handleSubmit}
          className={'w-[400px]'}
          layout="vertical"
          requiredMark="optional"
          onFieldsChange={onFieldsChange}
          autoComplete={'off'}
        >
          <Form.Item
            name="login"
            rules={[
              {
                required: true,
                message: 'Email or Staff ID is required',
              },
            ]}
          >
            <Input className={'bg-white'} prefix={<UserOutlined/>} placeholder="Email or Staff ID"/>
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Password is required',
              },
            ]}
          >
            <Input.Password className={'bg-white'} prefix={<LockOutlined/>} type="password" placeholder="Password"/>
          </Form.Item>
          {/*<Form.Item className={'text-right m-1'}>*/}
          {/*  <Typography.Link href={'/password-change'}>Need to reset password?</Typography.Link>*/}
          {/*</Form.Item>*/}
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={submitting} disabled={formError}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}

export default Login;