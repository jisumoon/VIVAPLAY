import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faHome,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";

const HeaderContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const NavItem = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #555;
  cursor: pointer;
  color: ${(props) => (props.isActive ? props.theme.blue.darker : "#555")};

  svg {
    font-size: 20px;
    margin-bottom: 4px;
  }

  &:hover {
    color: ${(props) => props.theme.blue.darker};
  }
`;

const MobileHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // 로컬스토리지 확인
  useEffect(() => {
    const user = localStorage.getItem("users");
    setIsLoggedIn(!!user);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("users");
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <HeaderContainer>
      <NavItem
        isActive={location.pathname === "/"}
        onClick={() => navigate("/")}
      >
        <FontAwesomeIcon icon={faHome} />
        <span>홈</span>
      </NavItem>
      <NavItem
        isActive={location.pathname === "/msearch"}
        onClick={() => navigate("/msearch")}
      >
        <FontAwesomeIcon icon={faSearch} />
        <span>검색</span>
      </NavItem>
      <NavItem
        isActive={location.pathname === "/love"}
        onClick={() => navigate("/love")}
      >
        <FontAwesomeIcon icon={faHeart} />
        <span>즐겨찾기</span>
      </NavItem>
      {isLoggedIn ? (
        <NavItem isActive={false} onClick={handleLogout}>
          <FontAwesomeIcon icon={faUser} />
          <span>로그아웃</span>
        </NavItem>
      ) : (
        <NavItem
          isActive={location.pathname === "/login"}
          onClick={() => navigate("/login")}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>로그인</span>
        </NavItem>
      )}
    </HeaderContainer>
  );
};

export default MobileHeader;
