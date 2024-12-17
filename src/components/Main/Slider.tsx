import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Slider from "react-slick";
import { makeImagePath } from "../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getCertification, Movie } from "../../api";

interface SliderProps {
  movies: Movie[];
  title?: string;
  onClick?: (movieId: number) => void;
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

const Box = styled.div<{ $bgPhoto: string; $isFocused: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  border: ${(props) => (props.$isFocused ? "4px solid #FFD700" : "none")};

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
  const navigate = useNavigate();
  const [favoriteMovies, setFavoriteMovies] = useState<number[]>(() => {
    const savedFavorites = localStorage.getItem("favoriteMovies");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [certifications, setCertifications] = useState<Record<number, string>>(
    {}
  );
  const sliderRef = useRef<Slider | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0); // 포커스된 슬라이드 인덱스
  const [isFavoriteFocused, setIsFavoriteFocused] = useState<boolean>(false); // 좋아요 버튼 포커스 상태
  const [isSliderFocused, setIsSliderFocused] = useState<boolean>(false);

  useEffect(() => {
    const fetchCertifications = async () => {
      const results: Record<number, string> = {};
      for (const movie of movies) {
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

    fetchCertifications();
  }, [movies]);

  // TV 리모컨 키 입력 처리
  // 키 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSliderFocused) return; // 해당 슬라이더에만 키 이벤트 활성화

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
          if (isFavoriteFocused) {
            console.log("좋아요 클릭");
          } else {
            navigate(`/movies/${movies[focusedIndex].id}`);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, isFavoriteFocused, isSliderFocused, movies, navigate]);

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

  const onDetail = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  const toggleFavorite = (movieId: number) => {
    // 로컬스토리지에서 현재 즐겨찾기 데이터 가져오기
    const savedFavorites = localStorage.getItem("favoriteMovies");
    const movieIds = savedFavorites ? JSON.parse(savedFavorites) : [];

    // 상태와 로컬스토리지 업데이트
    const updatedFavorites = movieIds.includes(movieId)
      ? movieIds.filter((id: number) => id !== movieId) // 이미 있으면 삭제
      : [...movieIds, movieId]; // 없으면 추가

    // 로컬스토리지에 새 값 저장
    localStorage.setItem("favoriteMovies", JSON.stringify(updatedFavorites));

    // 상태 업데이트
    setFavoriteMovies(updatedFavorites);
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
                {certifications[movie.id] || "15"}
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
                  style={{
                    color: favoriteMovies.includes(movie.id)
                      ? "#067FDA"
                      : "white",
                    outline:
                      focusedIndex === index && isFavoriteFocused
                        ? "2px solid #FFD700"
                        : "none", // 좋아요 버튼 포커스 강조
                  }}
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
