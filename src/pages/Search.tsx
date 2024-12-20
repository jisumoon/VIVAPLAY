import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom"; // useNavigate 추가
import styled from "styled-components";
import {
  searchContents,
  getCertification,
  GetMoviesResult,
  Movie,
} from "../api";
import { makeImagePath } from "../utils";
import Pagination from "react-js-pagination";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${(props) => props.theme.black.lighter};
  padding: 30px;
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const Header = styled.div`
  margin-top: 80px;
  margin-bottom: 60px;
  padding-left: 30px;
  color: ${(props) => props.theme.white.darker};
  letter-spacing: 2px;
  @media (max-width: 768px) {
    margin: 40px;
    padding-left: 0;
    text-align: center;
    letter-spacing: 2px;
  }

  @media (max-width: 400px) {
    margin-bottom: 30px;
    margin-top: 40px;
    text-align: left;
  }
  h1 {
    font-size: 28px;

    @media (max-width: 400px) {
      font-size: 24px;
    }
  }
`;

const MovieGrid = styled.div`
  display: flex;
  padding-left: 30px;
  flex-wrap: wrap;
  gap: 40px;
  @media (max-width: 768px) {
    gap: 20px;
  }

  @media (max-width: 400px) {
    justify-content: space-between;
    padding: 0 20px;
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
  padding-top: 100px;

  @media (max-width: 768px) {
    padding-top: 50px;
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

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const keyword = new URLSearchParams(location.search).get("keyword");
  const [currentPage, setCurrentPage] = useState(1);
  const [certifications, setCertifications] = useState<Record<number, string>>(
    {}
  );
  const moviesPerPage = 20;
  const [focusedIndex, setFocusedIndex] = useState(0); // 리모컨 포커스 인덱스
  const [isFocused, setIsFocused] = useState(false); // 포커스 상태

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
      <Container>
        <Header>
          <h1>"{keyword}"에 대한 결과가 없습니다.</h1>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>"{keyword}"에 대한 결과입니다.</h1>
      </Header>
      <MovieGrid>
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
    </Container>
  );
};

export default Search;
