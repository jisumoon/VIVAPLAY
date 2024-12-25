import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ReactComponent as VivaPlayLogo } from "../vivaplay.svg";
import { useRecoilState } from "recoil";
import { islogin } from "../atom";
import { Helmet } from "react-helmet";

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: url("/cupang.jpg") center/cover no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1;
  }
`;

const Containe = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(7px);
  padding: 30px 100px;
  border-radius: 8px;

  @media (max-width: 768px) {
    padding: 40px;
  }
`;

const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const Logo = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 100px;
    height: 100px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  color: ${(props) => props.theme.white.lighter};
  letter-spacing: 3px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.white.darker};
  text-align: center;
  line-height: 1.7;
  margin-bottom: 10px;
  letter-spacing: 1px;
`;

const StyledInput = styled.input`
  width: 350px;
  padding: 20px;
  padding-left: 10px;
  background: #181a21;
  border: none;
  border-radius: 8px;
  color: ${(props) => props.theme.white.lighter};
  font-size: 14px;

  &::placeholder {
    color: ${(props) => props.theme.white.darker};
  }
`;

const Button = styled.button`
  width: 350px;
  padding: 14px;
  font-size: 16px;
  color: #fff;
  background-color: ${(props) => (props.disabled ? "gray" : "#007bff")};
  border: none;
  border-radius: 8px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.3s;
`;

const Join = styled.div`
  margin-top: 20px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Login: React.FC = () => {
  const [id, setId] = useState<string>("");
  const [pw, setPw] = useState<string>("");
  const navigate = useNavigate();
  const [, setIslogin] = useRecoilState(islogin);

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id || !pw) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const hashedPassword = await hashPassword(pw);

    // 사용자 데이터와 비교
    const matchedUser = users.find(
      (user: any) => user.id === id && user.password === hashedPassword
    );

    if (matchedUser) {
      alert("비바플레이에 오신 것을 환영합니다.");
      setIslogin(true);
      navigate("/"); // 메인 페이지로 이동
    } else {
      alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  const handleLogo = () => {
    navigate("/");
  };

  const handleJoin = () => {
    navigate("/join");
  };

  return (
    <>
      <Helmet>
        <title>VIVAPLAY</title>
        <meta property="og:title" content="영화의 즐거움을 담아, VIVA Play" />
        <meta
          property="og:description"
          content="즐거움이 가득한 VIVA Play에 로그인하여여 다양한 영화를 만나보세요"
        />
        <meta
          property="og:image"
          content={`${process.env.PUBLIC_URL}/vivamain.png`}
        />
      </Helmet>
      <Wrapper>
        <Containe>
          <Logo onClick={handleLogo}>
            <VivaPlayLogo />
          </Logo>
          <Form onSubmit={handleLogin}>
            <Title>로그인</Title>
            <Subtitle>
              로그인하고 당신의 세상을 열어보세요.
              <br />
              당신의 즐거운 순간을 더욱 빛나게 만들어 드립니다.
            </Subtitle>
            <StyledInput
              type="text"
              placeholder="아이디"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
            <StyledInput
              type="password"
              placeholder="비밀번호"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />

            <Button type="submit">로그인</Button>
            <Join onClick={handleJoin}>
              VIVA 회원이 아니신가요? <b>지금 가입하세요.</b>
            </Join>
          </Form>
        </Containe>
      </Wrapper>
    </>
  );
};

export default Login;
