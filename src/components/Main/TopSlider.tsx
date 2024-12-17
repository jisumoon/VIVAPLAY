import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { makeImagePath } from "../../utils";
import { useNavigate } from "react-router-dom";
import { getPopularMovies, Movie } from "../../api";

const Container = styled.div`
  width: 100%;
  position: relative;
  margin-top: 50px;
  margin-bottom: 100px;
  padding: 0 40px;
  &:focus {
    outline: none;
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

const Title = styled.h3`
  font-size: 24px;
  margin-bottom: 30px;
  color: ${(props) => props.theme.white.lighter};
  padding-left: 20px;
`;

const SliderWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-wrap: wrap;
  gap: 25px;

  @media (max-width: 1024px) {
    gap: 30px;
  }
`;

const Box = styled.div<{ $bgPhoto: string; $isFocused: boolean }>`
  position: relative;
  width: 200px;
  height: 300px;
  background: url(${(props) => props.$bgPhoto}) center/cover no-repeat;
  border-radius: 8px;
  border: ${(props) => (props.$isFocused ? "4px solid #FFD700" : "none")};
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 1024px) {
    width: 180px;
    height: 270px;
  }
`;

const Rank = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 100px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
  z-index: 0;

  @media (max-width: 1024px) {
    font-size: 80px;
  }
`;

const Overlay = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  text-align: center;
  width: 80%;
  position: absolute;
  bottom: 14px;
  right: 18px;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 12px;
  color: ${(props) => props.theme.white.lighter};
  font-size: 14px;

  @media (max-width: 1024px) {
    font-size: 12px;
  }

  span {
    display: inline-block;
    background-color: ${(props) => props.theme.blue.lighter};
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    margin-top: 8px;

    @media (max-width: 1024px) {
      font-size: 10px;
    }
  }
`;

const TopSlider: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const navigate = useNavigate();

  // TV 리모컨 키 입력 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight": // 오른쪽 키: 다음 사진으로 이동
          setFocusedIndex((prev) => Math.min(prev + 1, movies.length - 1));
          break;

        case "ArrowLeft": // 왼쪽 키: 이전 사진으로 이동
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;

        case "Enter": // 엔터 키: 현재 포커스된 사진의 상세 페이지로 이동
          navigate(`/movies/${movies[focusedIndex].id}`);
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedIndex, movies, navigate]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const results = await getPopularMovies();
        setMovies(results.slice(0, 6));
      } catch (error) {
        console.error("Error fetching popular movies:", error);
      }
    };

    fetchMovies();
  }, []);

  // 상세 페이지 이동
  const onDetail = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  return (
    <Container
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <Title>오늘 대한민국의 TOP 6 영화</Title>
      <SliderWrapper>
        {movies.map((movie, index) => (
          <Box
            onClick={() => onDetail(movie.id)}
            key={movie.id}
            $isFocused={index === focusedIndex}
            $bgPhoto={makeImagePath(movie.backdrop_path || "")}
          >
            <Rank>{index + 1}</Rank>
            <Overlay>
              <div>{movie.title || "제목 없음"}</div>
              <span>{index === 0 ? "최신 등록" : "인기 영화"}</span>
            </Overlay>
          </Box>
        ))}
      </SliderWrapper>
    </Container>
  );
};

export default TopSlider;
