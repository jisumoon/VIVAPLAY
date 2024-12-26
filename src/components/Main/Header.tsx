import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { motion, useAnimation, useScroll } from "framer-motion";
import { Link, useMatch, useNavigate } from "react-router-dom";
import { ReactComponent as VivaPlayLogo } from "../../vivaplay.svg";
import { getAutocompleteResults } from "../../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { islogin } from "../../recoil/atom";

const Nav = styled(motion.nav)<{ $isScrolled: boolean }>`
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${(props) => (props.$isScrolled ? "20px 40px" : "30px 60px")};
  background-color: ${(props) => (props.$isScrolled ? "black" : "transparent")};
  color: ${(props) =>
    props.$isScrolled ? props.theme.blue.lighter : props.theme.blue.darker};
  z-index: 10;
  font-size: 18px;
  position: fixed;
  top: 0;
  transition: background-color 0.3s, padding 0.3s;

  @media (max-width: 768px) {
    padding: ${(props) => (props.$isScrolled ? "5px 20px" : "10px 20px")};
  }
`;

const Col = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const LogoContainer = styled(motion.div)`
  cursor: pointer;

  svg {
    width: 80px;
    height: 40px;

    @media (max-width: 768px) {
      width: 60px;
      height: 30px;
    }
  }
`;

const Items = styled.ul`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const Item = styled.li`
  position: relative;
  cursor: pointer;
  transition: opacity 0.3s;
  &:hover {
    opacity: 0.7;
  }
`;

const Circle = styled(motion.span)`
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${(props) => props.theme.blue.darker};
`;

const Search = styled.form`
  color: ${(props) => props.theme.blue.darker};
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  cursor: pointer;

  svg {
    width: 18px;
    height: 18px;
    fill: ${(props) => props.theme.blue.darker};
  }
`;

const SearchBar = styled(motion.input)`
  width: 200px;
  position: absolute;
  left: -170px;
  transform-origin: right center;
  background: transparent;
  color: #fff;
  font-size: 14px;
  border: none;
  border-bottom: 1px solid ${(props) => props.theme.blue.darker};
  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    width: 150px;
    left: -130px;
  }
`;

const ProfileMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const SuggestionsList = styled.ul`
  display: flex;
  flex-direction: column;
  border: 1px solid ${(props) => props.theme.blue.darker};
  position: absolute;
  top: 140%;
  right: -200%;
  width: 240px;
  background: ${(props) => props.theme.black.lighter};
  border-radius: 4px;
  margin: 0;
  padding: 0;
  z-index: 100;

  li {
    font-size: 14px;
    padding: 8px;
    cursor: pointer;
    color: ${(props) => props.theme.white.lighter};
    &:hover {
      background: ${(props) => props.theme.blue.darker};
    }
  }
`;

const ProfileName = styled.span`
  font-size: 16px;
  color: ${(props) => props.theme.blue.darker};
  transition: color 0.3s;

  &:hover {
    color: ${(props) => props.theme.blue.lighter};
  }
`;

const AuthLinks = styled.div`
  display: flex;
  gap: 10px;
`;

const AuthLink = styled.span`
  font-size: 16px;
  color: ${(props) => props.theme.blue.darker};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const Header = () => {
  const [, setIslogin] = useRecoilState(islogin);
  const [searchOpen, setSearchOpen] = useState(false);
  const homeMatch = useMatch("/");
  const LoveMatch = useMatch("/love");
  const inputAnimation = useAnimation();
  const { scrollY } = useScroll(); //스크롤 위치
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false); // 사용자 스크롤 여부
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [suggestions, setSuggestions] = useState<any[]>([]); // 자동 완성 결과
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 디바운싱 타이머
  const clearSuggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 10초 타이머
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); //로그인 여부
  const [username, setUsername] = useState(""); // 로그인 사용자
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1); // 추천 항목 포커스

  // 메인 이동
  const goToMain = () => {
    navigate("/");
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchOpen && e.key === "Enter") {
      // 검색창이 닫혀 있을 때 Enter 키로 검색창 열기
      openSearch();
      return;
    }

    // 검색창이 열려 있을 때 키보드 이벤트 처리
    switch (e.key) {
      case "ArrowDown":
        // 아래 화살표로 추천 항목 순환
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        // 위 화살표로 추천 항목 순환
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        // Enter 키로 선택된 추천 항목 이동
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          navigate(`/movies/${suggestions[highlightedIndex].id}`);
          setSearchTerm("");
          setSuggestions([]);
          setSearchOpen(false);
        }
        break;
      case "Escape":
        // Esc 키로 검색창 닫기
        setSearchOpen(false);
        setSuggestions([]);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUsers = localStorage.getItem("users");
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setIsLoggedIn(true);
          setIslogin(true);
          setUsername(parsedUsers[0].id);
        }
      } else {
        setIsLoggedIn(false);
        setIslogin(false);
        setUsername("");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [setIsLoggedIn, setIslogin, setUsername]);

  //로그아웃
  const handleLogout = () => {
    localStorage.removeItem("users");

    setIsLoggedIn(false);
    setIslogin(false);
    setUsername("");

    window.dispatchEvent(new Event("user-logout"));

    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUsers = localStorage.getItem("users");
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setIsLoggedIn(true);
          setIslogin(true);
          setUsername(parsedUsers[0].id);
        }
      } else {
        setIsLoggedIn(false);
        setIslogin(false);
        setUsername("");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    window.addEventListener("user-logout", handleStorageChange);

    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-logout", handleStorageChange);
    };
  }, [setIsLoggedIn, setIslogin, setUsername]);

  //스크롤 위치에 따라 헤더 변경
  useEffect(() => {
    scrollY.on("change", () => {
      setIsScrolled(scrollY.get() > 60);
    });
  }, [scrollY]);

  // 검색창 열기/ 닫기
  const openSearch = () => {
    if (searchOpen) {
      inputAnimation.start({ scaleX: 0 });
    } else {
      inputAnimation.start({ scaleX: 1 });
    }
    setSearchOpen((prev) => !prev);

    if (!searchOpen) {
      setSuggestions([]); // 서치바를 닫을 때 추천 목록 초기화
      setSearchTerm(""); // 검색어 초기화
    }
  };

  // 검색어가 변경될 때 자동 완성 데이터
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const results = await getAutocompleteResults(searchTerm);
        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching autocomplete results:", error);
      }
    };

    // 사용자가 입력을 멈춘 후 API 호출
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(fetchSuggestions, 300);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // 검색 입력값 변경경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // 10초 타이머 초기화
    if (clearSuggestionsTimeoutRef.current) {
      clearTimeout(clearSuggestionsTimeoutRef.current);
    }
    if (value.trim()) {
      clearSuggestionsTimeoutRef.current = setTimeout(() => {
        setSuggestions([]);
      }, 10000);
    } else {
      setSuggestions([]);
    }
  };

  // 추천 항목 클릭 처리
  const handleSuggestionClick = (suggestion: any) => {
    navigate(`/movies/${suggestion.id}`);
    setSearchTerm("");
    setSuggestions([]);
    if (clearSuggestionsTimeoutRef.current) {
      clearTimeout(clearSuggestionsTimeoutRef.current);
    }
  };

  //검색창 제출
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?keyword=${searchTerm.trim()}`);
      setSearchTerm("");
      setSuggestions([]);
      if (clearSuggestionsTimeoutRef.current) {
        clearTimeout(clearSuggestionsTimeoutRef.current);
      }
    }
  };

  return (
    <Nav $isScrolled={isScrolled}>
      <Col>
        <LogoContainer
          onClick={goToMain}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <VivaPlayLogo />
        </LogoContainer>
        <Items>
          <Item>
            <Link to="/">홈{homeMatch && <Circle layoutId="circle" />}</Link>
          </Item>

          <Item>
            <Link to="/love">
              즐겨찾기
              {LoveMatch && <Circle layoutId="circle" />}
            </Link>
          </Item>
        </Items>
      </Col>

      <Col>
        <Search onSubmit={handleSearchSubmit}>
          <motion.svg
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                openSearch();
              }
            }}
            onClick={openSearch}
            animate={{ x: searchOpen ? -194 : 0 }}
            transition={{ type: "linear" }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
          </motion.svg>
          <SearchBar
            type="text"
            placeholder="제목, 사람, 장르"
            animate={inputAnimation}
            initial={{ scaleX: 0 }}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />

          {searchTerm && suggestions.length > 0 && (
            <SuggestionsList>
              {suggestions.map((item, index) => (
                <li
                  key={item.id}
                  onClick={() => handleSuggestionClick(item)} // 마우스 클릭 이벤트
                  onMouseEnter={() => setHighlightedIndex(index)} // 마우스 호버 시 포커스
                  style={{
                    backgroundColor:
                      highlightedIndex === index ? "#067FDA" : "transparent", // 선택된 항목의 배경색
                    color: highlightedIndex === index ? "#fff" : "#ccc", // 선택된 항목의 글자색
                  }}
                >
                  {item.title || item.name || "Unknown"}
                </li>
              ))}
            </SuggestionsList>
          )}
        </Search>
        <ProfileMenu>
          {isLoggedIn ? (
            <>
              <FontAwesomeIcon icon={faUser} />
              <ProfileName onClick={handleLogout}>{username}님</ProfileName>
            </>
          ) : (
            <AuthLinks>
              <AuthLink onClick={() => navigate("/login")}>
                로그인/회원가입
              </AuthLink>
            </AuthLinks>
          )}
        </ProfileMenu>
      </Col>
    </Nav>
  );
};

export default Header;
