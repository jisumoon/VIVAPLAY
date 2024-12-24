import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom"; // useNavigate 추가
import styled from "styled-components";
import { searchContents, getCertification, GetMoviesResult } from "../api";
import { makeImagePath } from "../utils";
import Pagination from "react-js-pagination";
import RandomMovieSlide from "../components/Main/RandomMovieSlide";
import { Helmet } from "react-helmet";

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

const Header = styled.h2`
  background-color: ${(props) => props.theme.black.lighter};
  border-radius: 14px;
  margin-top: 80px;
  margin-bottom: 30px;
  color: ${(props) => props.theme.white.darker};
  letter-spacing: 2px;
  min-height: 140px;
  display: flex;
  justify-content: center;
  align-items: center;
  word-break: break-all;
  @media (max-width: 768px) {
    margin-top: 10px;
    padding: 0px 30px;
    text-align: center;
    letter-spacing: 2px;
    height: 80px;
    font-size: 18px;
  }

  @media (max-width: 400px) {
    margin-bottom: 30px;
    margin-top: 10px;
    text-align: left;
  }
  h1 {
    font-size: 28px;
    word-break: break-all;
    @media (max-width: 400px) {
      font-size: 18px;
    }
  }
`;

const ContentsWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  gap: 20px;
`;

const Contents = styled.div`
  width: 100%;
  height: 100%;
`;

const MovieGrid = styled.div`
  height: 100%;
  min-height: 1280px;
  padding: 80px 20px;
  background-color: ${(props) => props.theme.black.lighter};
  border-radius: 14px;

  @media (max-width: 768px) {
    padding: 40px 20px;
    gap: 20px;
    min-height: 100%;
  }
  @media (max-width: 400px) {
    padding: 40px 20px;
    justify-content: space-between;
    min-height: 100%;
    /* padding: 0 20px; */
  }
`;

const GridWrap = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  gap: 40px;
  @media (max-width: 768px) {
    gap: 10px;
    padding: 20px 0px;
    justify-content: center;
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

const SubTitle = styled.h4`
  text-align: center;
  color: ${(props) => props.theme.white.darker};
  font-size: 1.4rem;
  margin-top: 200px;
  margin-bottom: 40px;
  @media (max-width: 768px) {
    font-size: 18px;
    margin-top: 80px;
  }
`;

const Img = styled.img`
  width: 80%;
  height: auto;
  @media (max-width: 768px) {
    margin-bottom: 80px;
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
  cursor: pointer;
  margin-bottom: 20px;
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

const MoviePoster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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
    color: white;
    border-radius: 4px;
    font-weight: bold;
    background: ${(props) => props.theme.blue.lighter};
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

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const keyword = new URLSearchParams(location.search).get("keyword");
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage, setMoviesPerPage] = useState(12);
  const [certifications, setCertifications] = useState<Record<number, string>>(
    {}
  );
  const [reSize, setReSize] = useState(window.innerWidth < 1200);
  const [middleSize, setMiddleSize] = useState(
    window.innerWidth < 1500 && window.innerWidth >= 1200
  );
  const [focusedIndex, setFocusedIndex] = useState(0); // 리모컨 포커스 인덱스
  const [isFocused, setIsFocused] = useState(false); // 포커스 상태

  //반응형
  useEffect(() => {
    const handleResize = () => {
      setReSize(window.innerWidth < 1080);
      setMiddleSize(window.innerWidth < 1500 && window.innerWidth >= 1080);
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

  const { data: movieData, isLoading: movieLoading } =
    useQuery<GetMoviesResult>({
      queryKey: ["searchContents", keyword],
      queryFn: () => searchContents(keyword),
    });

  //현재 보여줄 페이지 제한
  const currentMovies = (movieData?.results || [])
    .filter((movie) => movie?.id) // id가 있는 영화만 포함
    .slice((currentPage - 1) * moviesPerPage, currentPage * moviesPerPage);

  //등급
  useEffect(() => {
    const fetchCertifications = async () => {
      const results: Record<number, string> = {};
      for (const movie of currentMovies) {
        const data = await getCertification(movie.id);
        const krRelease = data.results.find(
          (release: any) => release.iso_3166_1 === "KR"
        );
        results[movie.id] =
          krRelease && krRelease.release_dates.length > 0
            ? krRelease.release_dates[0].certification || "15"
            : "15";
      }
      setCertifications(results);
    };

    if (currentMovies.length > 0) {
      fetchCertifications();
    }
  }, [currentMovies]);

  //리모컨컨
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused) return; // 포커스가 없으면 리모컨 동작 무시

      switch (event.key) {
        case "ArrowRight":
          setFocusedIndex((prev) =>
            Math.min(prev + 1, currentMovies.length - 1)
          );
          break;
        case "ArrowLeft":
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          navigate(`/movies/${currentMovies[focusedIndex].id}`);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, focusedIndex, currentMovies, navigate]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const onDetail = async (movieId: number | undefined) => {
    // 데이터가 없는 경우
    if (!movieData || Object.keys(movieData).length === 0) {
      alert("해당 영화 정보를 찾을 수 없습니다.");
      return;
    }

    // 데이터가 유효한 경우 상세 페이지로 이동
    navigate(`/movies/${movieId}`);
    console.log(navigate);
  };

  if (!movieData?.results || movieData.results.length === 0) {
    return (
      <>
        <Helmet>
          <title>ViVaPlay</title>
          <meta property="og:title" content="영화의 즐거움을 담아, VIVA Play" />
          <meta
            property="og:description"
            content="즐거움이 가득한 VIVA Play에서 다양한 영화를 만나보세요"
          />
          <meta
            property="og:image"
            content={`${process.env.PUBLIC_URL}/vivamain.png`}
          />
        </Helmet>
        <Container>
          <Header>
            <h1>"{keyword}"에 대한 결과입니다.</h1>
          </Header>
          <ContentsWrap>
            <Contents>
              <MovieGrid>
                <ImgWrap>
                  <Img
                    alt="NotFind"
                    src={`${process.env.PUBLIC_URL}/img/NotFindRain.svg`}
                  />
                  <SubTitle>검색 결과가 없습니다.</SubTitle>
                </ImgWrap>
              </MovieGrid>
            </Contents>
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
  }
  return (
    <>
      <Helmet>
        <title>{`${keyword}_ViVaPlay`}</title>
        <meta property="og:title" content={`${keyword} 검색 결과입니다.`} />
        <meta
          property="og:description"
          content={`${keyword} 검색 결과입니다.즐거움이 가득한 VIVA Play에서 ${keyword}에 대한 영화를 확인하세요.`}
        />
        <meta
          property="og:image"
          content={`${process.env.PUBLIC_URL}/vivamain.png`}
        />
      </Helmet>
      <Container>
        <Header>
          <h1>"{keyword}"에 대한 결과입니다.</h1>
        </Header>
        <ContentsWrap>
          <Contents>
            <MovieGrid>
              <GridWrap>
                {currentMovies.map((movie) => (
                  <MovieCard key={movie.id} onClick={() => onDetail(movie.id)}>
                    <MoviePoster
                      src={
                        movie.backdrop_path
                          ? makeImagePath(movie.backdrop_path)
                          : "movie.jpg"
                      }
                      alt={movie.title}
                    />
                    <Overlay>
                      <div className="title">{movie.title}</div>
                      <div className="age-restriction">
                        {certifications[movie.id] || "15"}
                      </div>
                    </Overlay>
                  </MovieCard>
                ))}
              </GridWrap>
            </MovieGrid>
            <StyledPagination>
              <Pagination
                activePage={currentPage}
                itemsCountPerPage={moviesPerPage}
                totalItemsCount={movieData?.results.length || 0}
                pageRangeDisplayed={5}
                onChange={handlePageChange}
              />
            </StyledPagination>
          </Contents>
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

export default Search;
