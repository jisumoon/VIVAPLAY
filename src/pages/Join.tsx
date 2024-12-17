import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ReactComponent as VivaPlayLogo } from "../vivaplay.svg";

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

const ErrorMessage = styled.span`
  width: 100%;
  padding-left: 10px;
  color: crimson;
  font-size: 14px;
  letter-spacing: 2px;
  font-weight: bold;
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

const Join: React.FC = () => {
  const [id, setId] = useState(""); // 변수명 변경
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idError, setIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const validateId = (value: string) => {
    const isValid = /^[a-zA-Z0-9]+$/.test(value);
    if (!value) {
      setIdError("아이디를 입력해주세요.");
    } else if (!isValid) {
      setIdError("아이디는 영어와 숫자만 입력할 수 있습니다.");
    } else if (value.length < 6) {
      setIdError("아이디는 6자리 이상이어야 합니다.");
    } else {
      setIdError("");
    }
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError("비밀번호는 8자리 이상이어야 합니다.");
    } else if (confirmPassword && value !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!idError && !passwordError) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const isDuplicate = users.some((user: any) => user.id === id);
      if (isDuplicate) {
        alert("이미 존재하는 아이디입니다.");
        return;
      }

      const hashedPassword = await hashPassword(password);
      users.push({ id, password: hashedPassword });
      localStorage.setItem("users", JSON.stringify(users));
      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    }
  };

  const isFormValid =
    /^[a-zA-Z0-9]+$/.test(id) &&
    id.length >= 6 &&
    password.length >= 8 &&
    confirmPassword === password &&
    !idError &&
    !passwordError;

  return (
    <Wrapper>
      <Containe>
        <Logo onClick={() => navigate("/")}>
          <VivaPlayLogo />
        </Logo>
        <Form onSubmit={handleSubmit}>
          <Title>회원가입</Title>
          <Subtitle>
            비바플레이와 함께 새로운 경험을 시작하세요.
            <br />
            당신의 즐거운 순간을 더욱 빛나게 만들어 드립니다.
          </Subtitle>
          <StyledInput
            type="text"
            placeholder="아이디 (영어 6자리 이상)"
            value={id}
            onChange={(e) => {
              setId(e.target.value.trim());
              validateId(e.target.value.trim());
            }}
          />
          {idError && <ErrorMessage>{idError}</ErrorMessage>}
          <StyledInput
            type="password"
            placeholder="비밀번호 (8자리 이상)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value.trim());
              validatePassword(e.target.value.trim());
            }}
          />
          <StyledInput
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value.trim())}
          />
          {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
          <Button type="submit" disabled={!isFormValid}>
            가입하기
          </Button>
        </Form>
      </Containe>
    </Wrapper>
  );
};

export default Join;
