import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Slider from "react-slick";
import { makeImagePath } from "../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getCertificationsForMovies, Movie } from "../../api";

interface SliderProps {
  movies: Movie[]; // 영화데이터 배열
  title?: string; // 슬라이더 제목
  onClick?: (movieId: number) => void; //클릭핸들러
}

const Container = styled.div`
  position: relative;
  margin-top: 50px;
  margin-bottom: 100px;
  padding: 0 40px;

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    padding: 0;
    margin-bottom: 50px;
  }
  @media (max-width: 400px) {
    padding: 0;
  }
`;

const SliderTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 30px;
  color: ${(props) => props.theme.white.lighter};
  padding-left: 20px;
`;

const StyledSlider = styled(Slider)`
  .slick-slide {
    padding: 0 10px;
  }

  .slick-arrow {
    z-index: 10;
    width: 40px;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;

    &:before {
      display: none;
    }
  }

  .slick-prev {
    left: 0;
  }

  .slick-next {
    right: 0;
  }

  ${Container}:hover & .slick-arrow {
    opacity: 1;
  }
`;

const Box = styled.div<{
  $bgPhoto: string;
  $isFocused: boolean;
  $isUsingRemote: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  border: ${(props) =>
    props.$isFocused && props.$isUsingRemote ? "4px solid #FFD700" : "none"};
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  }

  .box-image {
    width: 100%;
    height: 180px;
    background: url(${(props) => props.$bgPhoto}) center/cover no-repeat;
    border-radius: 8px;
  }
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

const Info = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  background: rgba(0, 0, 0, 0.85);
  color: ${(props) => props.theme.white.lighter};
  border-radius: 0 0 8px 8px;
  text-align: left;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;

  ${Box}:hover & {
    opacity: 1;
    transform: translateY(0);
  }

  .info-buttons {
    margin-top: 5px;
    display: flex;
    gap: 10px;

    svg {
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.3s ease;
      border: 1px solid #fff;
      border-radius: 50%;
      width: 15px;
      height: 15px;
      padding: 10px;
      transition: color 0.3s border 0.3s;
      &:hover {
        color: ${(props) => props.theme.blue.darker};
        border: 1px solid ${(props) => props.theme.blue.darker};
      }
    }
  }

  .info-rating {
    margin-top: 10px;
    font-size: 14px;
    font-weight: 400;
    color: ${(props) => props.theme.white.darker};
  }
`;

const SliderComponent: React.FC<SliderProps> = ({ movies, title }) => {
  const navigate = useNavigate(); //페이지 이동동
  const [favoriteMovies, setFavoriteMovies] = useState<number[]>(() => {
    const savedFavorites = localStorage.getItem("favoriteMovies");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [certifications, setCertifications] = useState<Record<number, string>>(
    {}
  ); // 영화별 등급 상태
  const sliderRef = useRef<Slider | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0); // 포커스된 슬라이드 인덱스
  const [isFavoriteFocused, setIsFavoriteFocused] = useState<boolean>(false); // 좋아요 버튼 포커스 상태
  const [isSliderFocused, setIsSliderFocused] = useState<boolean>(false); //슬라이드 활성화
  const isUsingRemote = useRef(false); // 리모컨 사용 여부 감지
  const [moviesWithCertifications, setMoviesWithCertifications] =
    useState<Movie[]>(movies); //로컬상태

  // 영화 등급 가져오기
  const fetchMoviesWithCertifications = async (
    movies: Movie[]
  ): Promise<Movie[]> => {
    const movieIds = movies.map((movie) => movie.id);
    const certificationsMap = await getCertificationsForMovies(movieIds);

    return movies.map((movie) => ({
      ...movie,
      certification: certificationsMap[movie.id] || "15",
    }));
  };

  useEffect(() => {
    const fetchMovies = async () => {
      const updatedMovies = await fetchMoviesWithCertifications(movies);
      setMoviesWithCertifications(updatedMovies);
    };

    fetchMovies();
  }, [movies]);

  //리모컨 핸들러
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSliderFocused) return;

      switch (event.key) {
        case "ArrowRight":
          setIsFavoriteFocused(false);
          setFocusedIndex((prev) => Math.min(prev + 1, movies.length - 1));
          sliderRef.current?.slickNext();
          break;
        case "ArrowLeft":
          setIsFavoriteFocused(false);
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          sliderRef.current?.slickPrev();
          break;
        case "Enter":
          navigate(`/movies/${movies[focusedIndex].id}`);
          break;
        default:
          break;
      }
    };

    // 포커스 상태에서만 이벤트 추가
    if (isSliderFocused) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedIndex, isFavoriteFocused, isSliderFocused, movies, navigate]);

  //슬라이드 설정
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    centerMode: false,
    slidesToShow: 5,
    slidesToScroll: 1,

    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
    ],
  };

  //상세페이지
  const onDetail = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  // 즐겨찾기 추가/삭제
  const toggleFavorite = (movieId: number) => {
    setFavoriteMovies((prev) => {
      const updatedFavorites = prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId];

      setTimeout(() => {
        localStorage.setItem(
          "favoriteMovies",
          JSON.stringify(updatedFavorites)
        );
      }, 0);

      return updatedFavorites;
    });
  };

  if (!movies || movies.length === 0) {
    return <div>슬라이드에 표시할 영화가 없습니다.</div>;
  }

  return (
    <Container
      tabIndex={0}
      onFocus={() => setIsSliderFocused(true)} // 포커스 받았을 때 활성화
      onBlur={() => setIsSliderFocused(false)} // 포커스 해제 시 비활성화
    >
      {title && <SliderTitle>{title}</SliderTitle>}
      <StyledSlider {...settings}>
        {movies.map((movie, index) => (
          <Box
            key={movie.id}
            $isFocused={index === focusedIndex}
            $isUsingRemote={isUsingRemote.current} // 리모컨 사용 여부 전달
            $bgPhoto={
              movie.backdrop_path
                ? makeImagePath(movie.backdrop_path)
                : "movie.jpg"
            }
          >
            <div className="box-image" />

            <Overlay>
              <div className="title">{movie.title}</div>
              <div className="age-restriction">
                {movie.certification || "15"}
              </div>
            </Overlay>

            <Info>
              <div className="info-buttons">
                <FontAwesomeIcon
                  icon={faPlay}
                  onClick={() => navigate(`/movies/${movie.id}`)}
                />
                <FontAwesomeIcon
                  icon={faHeart}
                  onClick={() => toggleFavorite(movie.id)}
                />
              </div>
              <div className="info-rating">
                ⭐ {movie.vote_average.toFixed(1)} / 10 | 👍
                {movie.vote_count.toLocaleString()} likes
              </div>
            </Info>
          </Box>
        ))}
      </StyledSlider>
    </Container>
  );
};

export default SliderComponent;
