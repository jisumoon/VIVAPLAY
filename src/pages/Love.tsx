import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Movie, getMovies, getCertificationsForMovies } from "../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { makeImagePath } from "../utils";
import Pagination from "react-js-pagination";
import { Helmet } from "react-helmet";
import RandomMovieSlide from "../components/Main/RandomMovieSlide";

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: ${(props) => props.theme.black.veryDark};
  min-height: 100vh;
  margin-top: 60px;
  padding: 0 60px;
  @media (max-width: 768px) {
    margin-top: 10px;
    padding: 30px 10px;
  }
`;

const Title = styled.h2`
  background-color: ${(props) => props.theme.black.lighter};
  border-radius: 14px;
  margin-top: 80px;
  margin-bottom: 30px;
  color: ${(props) => props.theme.white.darker};
  letter-spacing: 2px;
  height: 140px;
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: 768px) {
    text-align: center;
    letter-spacing: 2px;
    height: 80px;
    font-size: 18px;
    margin-top: 0;
  }
`;

const ImgWrap = styled.div`
  width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 0 auto;
  padding: 100px 0;
  @media (max-width: 768px) {
    width: 300px;
    height: auto;
  }
`;

const ContentsWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  gap: 20px;
`;

const SubTitle = styled.h4`
  text-align: center;
  color: ${(props) => props.theme.white.darker};
  font-size: 1.4rem;
  margin-top: 20px;
  font-weight: lighter;
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const Img = styled.img`
  width: 80%;
  height: auto;
`;

const Contents = styled.div`
  width: 100%;
`;

const MessegeGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 40px;
  background-color: ${(props) => props.theme.black.lighter};
  border-radius: 14px;
  overflow: hidden;

  @media (max-width: 768px) {
    gap: 20px;
    justify-content: center;

    @media (max-width: 400px) {
      justify-content: center;
    }
  }
`;

const MovieGrid = styled.div`
  height: auto;
  padding: 40px 20px;
  background: ${(props) => props.theme.black.lighter};
  border-radius: 14px;
  display: flex;

  @media (max-width: 768px) {
    padding: 20px 10px;
  }
  @media (max-width: 400px) {
    padding: 20px 5px;
  }
`;

const GridWrap = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 40px;
  @media (max-width: 768px) {
    justify-content: center;
    gap: 20px;
  }
`;

const MovieCard = styled.div`
  width: 250px;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
  /* margin-bottom: 20px; */
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
  @media (max-width: 768px) {
    width: 200px;
  }

  @media (max-width: 400px) {
    width: 160px;
  }
`;

const MoviePoster = styled.div<{ $bgPhoto: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${(props) => props.$bgPhoto});
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  color: ${(props) => props.theme.white.lighter};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  backdrop-filter: blur(2px);

  div {
    display: flex;
    gap: 10px;
  }

  .title {
    font-size: 16px;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .age-restriction {
    font-size: 14px;
    padding: 2px 5px;
    color: #fff;
    border-radius: 4px;
    font-weight: bold;
    background: ${(props) => props.theme.blue.lighter};
  }
`;

const RandomMoviewrap = styled.div`
  width: 480px;
  height: inherit;
  min-height: 1400px;
  padding-bottom: 120px;
  @media (max-width: 970px) {
    display: none;
  }
`;

const RandomWrap = styled.div`
  position: sticky;
  top: 100px;
  width: 100%;
  height: 1100px;
  background-color: ${({ theme }) => theme.black.lighter};
  border-radius: 16px;
  padding: 30px 40px 30px;
`;

const FavoriteIcon = styled(FontAwesomeIcon)<{ $isFavorite: boolean }>`
  color: ${(props) => (props.$isFavorite ? "#067FDA" : "#fff")};
  font-size: 20px;

  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const StyledPagination = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 0;
  @media (max-width: 768px) {
    padding-bottom: 80px;
  }
  ul {
    display: flex;
    list-style: none;
    padding: 0;
    li {
      margin: 0 5px;
      a {
        color: ${(props) => props.theme.white.darker};
        padding: 5px 10px;
        border-radius: 5px;
        text-decoration: none;
        transition: background 0.3s;
        &:hover {
          background: ${(props) => props.theme.blue.darker};
        }
      }
      &.active a {
        background: ${(props) => props.theme.blue.darker};
        color: white;
      }
    }
  }
`;

const Love = () => {
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState<Record<number, string>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  // const moviesPerPage = 6;
  const [moviesPerPage, setMoviesPerPage] = useState(12);
  const [focusedIndex, setFocusedIndex] = useState<number>(0); // 현재 포커스 영화화
  const [isFocused, setIsFocused] = useState<boolean>(false); // 리모컨 사용
  const [UserName, setUserName] = useState<String>();
  const [reSize, setReSize] = useState(window.innerWidth < 1200);
  const [middleSize, setMiddleSize] = useState(
    window.innerWidth < 1500 && window.innerWidth >= 1200
  );

  const indexOfLastMovie = currentPage * moviesPerPage; // 현재 페이지에서 마지막 영화 인덱스
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage; // 현재 페이지에서 첫 번째 영화 인덱스

  // 페이지네이션을 위한 현재 페이지에 맞는 영화 리스트 필터링
  const currentMovies = favoriteMovies.slice(
    indexOfFirstMovie,
    indexOfLastMovie
  );

  useEffect(() => {
    const handleResize = () => {
      setReSize(window.innerWidth < 1080);
      setMiddleSize(window.innerWidth < 1900 && window.innerWidth >= 1080);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!middleSize && !reSize) {
      setMoviesPerPage(21);
    } else if (middleSize) {
      setMoviesPerPage(6);
    } else if (reSize) {
      setMoviesPerPage(6);
    }
  }, [reSize, middleSize]);

  //리모컨
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused) return;

      switch (event.key) {
        case "ArrowRight": // 오른쪽 키
          setFocusedIndex((prev) =>
            Math.min(prev + 1, favoriteMovies.length - 1)
          );
          break;
        case "ArrowLeft": // 왼쪽 키
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter": // 엔터 키
          if (favoriteMovies[focusedIndex]) {
            navigate(`/movies/${favoriteMovies[focusedIndex].id}`);
          }
          break;
        case "Backspace":
          navigate(-1); // 이전 페이지로 이동
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused, focusedIndex, favoriteMovies, navigate]);

  //즐겨찾기 데이터
  useEffect(() => {
    const fetchFavoriteMovies = async () => {
      const savedFavorites = localStorage.getItem("favoriteMovies");
      if (savedFavorites) {
        const movieIds = JSON.parse(savedFavorites) as number[];
        const allMovies = await getMovies();
        const favorites = allMovies.results.filter((movie) =>
          movieIds.includes(movie.id)
        );
        setFavoriteMovies(favorites);
      }
    };
    const UserData = async () => {
      const user = localStorage.getItem("users");
      if (user) {
        const userData = JSON.parse(user);
        const userId = await userData[0]?.id;
        setUserName(userId);
      }
    };
    fetchFavoriteMovies();
    UserData();
  }, []);

  useEffect(() => {
    const fetchCertifications = async () => {
      if (favoriteMovies.length > 0) {
        const movieIds = favoriteMovies.map((movie) => movie.id);

        // 여러 영화 등급 데이터를 한 번에 가져오기
        const certificationsArray = await getCertificationsForMovies(movieIds);

        const certificationsMap = certificationsArray.reduce(
          (acc, { id, certification }) => {
            acc[id] = certification;
            return acc;
          },
          {} as Record<number, string>
        );

        // 상태 업데이트
        setCertifications(certificationsMap);
      }
    };

    fetchCertifications();
  }, [favoriteMovies]);

  //상세페이지지
  const handleMovieClick = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  //토글
  const toggleFavorite = (movieId: number) => {
    setFavoriteMovies((prevFavorites) => {
      const updatedFavorites = prevFavorites.filter(
        (movie) => movie.id !== movieId
      );
      localStorage.setItem(
        "favoriteMovies",
        JSON.stringify(updatedFavorites.map((movie) => movie.id))
      );
      return updatedFavorites;
    });
  };

  //페이지네이션
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Helmet>
        <title>{`ViVaPlay_즐겨찾기`}</title>
        <meta property="og:title" content={`ViVaPlay 즐겨찾기`} />
        <meta
          property="og:description"
          content={`ViVaPlay에서 즐겨찾기한 리스트 입니다.`}
        />
        <meta
          property="og:image"
          content={`${process.env.PUBLIC_URL}/vivamain.png`}
        />
      </Helmet>
      <Container
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <Title>{UserName}님의 즐겨찾는 영화</Title>
        <ContentsWrap>
          {favoriteMovies.length > 0 ? (
            <Contents>
              <MovieGrid>
                <GridWrap>
                  {currentMovies.map((movie) => (
                    <MovieCard key={movie.id}>
                      <MoviePoster
                        $bgPhoto={
                          movie.backdrop_path
                            ? makeImagePath(movie.backdrop_path)
                            : "movie.jpg"
                        }
                        onClick={() => handleMovieClick(movie.id)}
                      />
                      <Overlay>
                        <div className="title">{movie.title}</div>
                        <div>
                          <div className="age-restriction">
                            {certifications[movie.id] || "15"}
                          </div>
                          <FavoriteIcon
                            icon={faHeart}
                            $isFavorite={true}
                            onClick={() => toggleFavorite(movie.id)}
                          />
                        </div>
                      </Overlay>
                    </MovieCard>
                  ))}
                </GridWrap>
              </MovieGrid>
              <StyledPagination>
                <Pagination
                  onChange={handlePageChange}
                  activePage={currentPage}
                  itemsCountPerPage={moviesPerPage}
                  totalItemsCount={favoriteMovies.length || 0}
                  pageRangeDisplayed={5}
                />
              </StyledPagination>
            </Contents>
          ) : (
            <Contents>
              <MessegeGrid>
                <ImgWrap>
                  <Img
                    alt="NotFind"
                    src={`${process.env.PUBLIC_URL}/img/NotFindRain.svg`}
                  />
                  <SubTitle>즐겨찾기 영화가 없습니다.</SubTitle>
                </ImgWrap>
              </MessegeGrid>
              <StyledPagination>
                <Pagination
                  onChange={handlePageChange}
                  activePage={currentPage}
                  itemsCountPerPage={moviesPerPage}
                  totalItemsCount={favoriteMovies.length || 0}
                  pageRangeDisplayed={3}
                />
              </StyledPagination>
            </Contents>
          )}

          <RandomMoviewrap>
            <RandomWrap>
              <RandomMovieSlide
                reSize={reSize}
                middleSize={middleSize}
                type={"Search"}
              />
            </RandomWrap>
          </RandomMoviewrap>
        </ContentsWrap>
      </Container>
    </>
  );
};

export default Love;
